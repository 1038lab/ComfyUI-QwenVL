import json
import re
from pathlib import Path
import folder_paths
from huggingface_hub import HfApi, hf_hub_download, snapshot_download

from AILab_Utils import (
    PLUGIN_DIR,
    CUSTOM_MODELS_PATH,
    estimate_vram_requirement,
)


def _update_custom_models_json(
    repo_id: str,
    local_path: str,
    save_folder: str,
    filename: str,
    model_type: str,
    mmproj_filename: str | None = None,
) -> dict:
    """Create or append the downloaded model into custom_models.json."""
    data = {
        "hf_models": {},
        "gguf_models": {},
    }
    if CUSTOM_MODELS_PATH.exists():
        try:
            with open(CUSTOM_MODELS_PATH, "r", encoding="utf-8") as f:
                loaded = json.load(f) or {}
                if isinstance(loaded, dict):
                    data = loaded
                if "hf_models" not in data or not isinstance(data["hf_models"], dict):
                    data["hf_models"] = {}
                if "gguf_models" not in data or not isinstance(data["gguf_models"], dict):
                    data["gguf_models"] = {}
        except Exception as exc:
            print(f"[AILab Downloader] Warning: Failed to read custom_models.json: {exc}")

    repo_parts = repo_id.split("/")
    author = repo_parts[0] if len(repo_parts) > 1 else "custom"
    repo_name = repo_parts[-1]

    is_gguf = save_folder == "LLM/GGUF" or (filename and filename.lower().endswith(".gguf")) or ("gguf" in repo_name.lower())

    if is_gguf:
        downloaded_file = Path(local_path).name if Path(local_path).is_file() else (filename if filename else f"{repo_name}.gguf")

        # Clean any legacy split keys for this model to keep json clean
        for k in ["gguf_vl_models", "gguf_text_models", "qwenVL_model", "Qwen_model"]:
            if k in data and isinstance(data[k], dict) and repo_name in data[k]:
                data[k].pop(repo_name, None)

        if repo_name in data["gguf_models"]:
            entry = data["gguf_models"][repo_name]
            files = entry.get("model_files") or []
            if downloaded_file and downloaded_file not in files:
                files.append(downloaded_file)
            entry["model_files"] = files
            if mmproj_filename:
                entry["mmproj_file"] = mmproj_filename
        else:
            entry = {
                "author": author,
                "repo_name": repo_name,
                "repo_id": repo_id,
                "model_files": [downloaded_file] if downloaded_file else [],
                "defaults": {
                    "context_length": 8192
                }
            }
            if mmproj_filename:
                entry["mmproj_file"] = mmproj_filename
            data["gguf_models"][repo_name] = entry

        registered_entry = data["gguf_models"][repo_name]
        target_section = "gguf_models"
    else:
        # Clean any legacy split keys for this model
        for k in ["hf_vl_models", "hf_text_models"]:
            if k in data and isinstance(data[k], dict) and repo_name in data[k]:
                data[k].pop(repo_name, None)

        is_quantized = any(q in repo_name.upper() for q in ["FP8", "INT4", "INT8", "AWQ", "GPTQ"])
        model_entry = {
            "repo_id": repo_id,
            "default": False,
            "quantized": is_quantized,
            "vram_requirement": estimate_vram_requirement(repo_name),
        }
        data["hf_models"][repo_name] = model_entry
        registered_entry = data["hf_models"][repo_name]
        target_section = "hf_models"

    with open(CUSTOM_MODELS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[AILab Downloader] Successfully registered '{repo_name}' into custom_models.json under '{target_section}'")

    # Live-reload in memory
    try:
        from AILab_QwenVL import load_model_configs
        load_model_configs()
    except Exception:
        pass
    try:
        from AILab_QwenVL_GGUF import reload_gguf_vl_catalog
        reload_gguf_vl_catalog()
    except Exception:
        pass

    return {
        "section": target_section,
        "key": repo_name,
        "entry": registered_entry,
    }


class AILab_HuggingFaceDownloader:
    OUTPUT_NODE = True

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "repo_id": ("STRING", {"default": "", "tooltip": "HuggingFace Repo ID (e.g., Qwen/Qwen2.5-VL-3B-Instruct or unsloth/Qwen3.8-27B-GGUF)"}),
                "filename": ("STRING", {"default": "", "tooltip": "Specific filename to download (e.g., Qwen3.8-27B-UD-Q3_K_XL.gguf). Leave empty to download the entire repository."}),
                "save_folder": (["auto", "LLM/GGUF", "LLM", "checkpoints", "loras"], {"default": "auto", "tooltip": "Destination folder. 'auto' automatically saves GGUF to models/LLM/GGUF and Transformers to models/LLM."}),
                "auto_add_to_custom_models": ("BOOLEAN", {"default": True, "tooltip": "Automatically add this model to custom_models.json upon download completion"}),
                "model_category": (["auto", "vision_language", "text_only"], {"default": "auto", "tooltip": "Category to place in custom_models.json"}),
            },
            "optional": {
                "mmproj_filename": ("STRING", {"default": "", "tooltip": "Optional: Specific mmproj file to download (leave empty to auto-detect mmproj from repo)"}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("MODEL_INFO",)
    FUNCTION = "download_model"
    CATEGORY = "🧪AILab/QwenVL"

    def download_model(
        self,
        repo_id,
        filename,
        save_folder="auto",
        auto_add_to_custom_models=True,
        model_category="auto",
        mmproj_filename="",
        **kwargs,
    ):
        base_models_dir = Path(folder_paths.models_dir)
        fname_clean = filename.strip() if filename else ""
        repo_clean = repo_id.strip() if repo_id else ""
        is_gguf = (bool(fname_clean) and fname_clean.lower().endswith(".gguf")) or ("gguf" in repo_clean.lower())

        if save_folder == "auto" or not save_folder:
            if is_gguf:
                save_parts = ["LLM", "GGUF"]
                resolved_folder = "LLM/GGUF"
            else:
                save_parts = ["LLM"]
                resolved_folder = "LLM"
        else:
            save_parts = list(Path(save_folder).parts)
            if save_parts and save_parts[0].lower() == "llm":
                save_parts[0] = "LLM"
            if is_gguf and (save_parts == ["LLM", "hf"] or save_parts == ["LLM"]):
                save_parts = ["LLM", "GGUF"]
            resolved_folder = "/".join(save_parts)

        target_dir = base_models_dir.joinpath(*save_parts)

        # We put the downloaded model in a subfolder named after the repo to avoid clutter
        repo_parts = repo_clean.split("/")
        author = repo_parts[0] if len(repo_parts) > 1 else "custom"
        repo_name = repo_parts[-1]

        final_dir = target_dir / author / repo_name
        final_dir.mkdir(parents=True, exist_ok=True)

        print(f"[AILab Downloader] Target directory: {final_dir} (type: {'GGUF' if is_gguf else 'Transformers'})")

        detected_mmproj = None
        downloaded_files_list = []

        # Check HuggingFace for mmproj projector files
        try:
            api = HfApi()
            repo_files = api.list_repo_files(repo_id=repo_id.strip())
            mmproj_files = [f for f in repo_files if "mmproj" in f.lower() and f.endswith(".gguf")]
        except Exception:
            mmproj_files = []

        is_vl = model_category == "vision_language" or (
            model_category == "auto" and (bool(mmproj_files) or "vl" in repo_id.lower() or "vision" in repo_id.lower())
        )

        try:
            if filename.strip():
                # Download main model file
                downloaded_path = hf_hub_download(
                    repo_id=repo_id.strip(),
                    filename=filename.strip(),
                    repo_type="model",
                    local_dir=str(final_dir),
                    local_dir_use_symlinks=False,
                )
                downloaded_files_list.append(Path(downloaded_path).name)
                print(f"[AILab Downloader] Successfully downloaded file to: {downloaded_path}")

                # If GGUF Vision-Language, check/download mmproj
                if is_gguf and is_vl:
                    if mmproj_filename and mmproj_filename.strip():
                        chosen_mmproj = mmproj_filename.strip()
                        print(f"[AILab Downloader] Downloading user-specified visual projector: {chosen_mmproj}...")
                        mmproj_path = hf_hub_download(
                            repo_id=repo_id.strip(),
                            filename=chosen_mmproj,
                            repo_type="model",
                            local_dir=str(final_dir),
                            local_dir_use_symlinks=False,
                        )
                        detected_mmproj = Path(mmproj_path).name
                        downloaded_files_list.append(detected_mmproj)
                        print(f"[AILab Downloader] Successfully downloaded mmproj to: {mmproj_path}")
                    else:
                        local_mmprojs = list(final_dir.glob("*mmproj*.gguf"))
                        if local_mmprojs:
                            # Match quant if possible
                            model_stem = Path(filename).stem.lower()
                            matched = None
                            for lm in local_mmprojs:
                                if "q8" in model_stem and "q8" in lm.name.lower():
                                    matched = lm
                                    break
                                elif "f16" in lm.name.lower() or "bf16" in lm.name.lower():
                                    if matched is None:
                                        matched = lm
                            detected_mmproj = (matched or local_mmprojs[0]).name
                            downloaded_files_list.append(f"{detected_mmproj} (local cache)")
                        elif mmproj_files:
                            # Find best remote mmproj
                            model_stem = Path(filename).stem.lower()
                            chosen_mmproj = mmproj_files[0]
                            for mf in mmproj_files:
                                if "q8" in model_stem and "q8" in mf.lower():
                                    chosen_mmproj = mf
                                    break
                                elif "f16" in mf.lower() or "bf16" in mf.lower():
                                    chosen_mmproj = mf

                            print(f"[AILab Downloader] Auto-downloading visual projector (mmproj): {chosen_mmproj}...")
                            mmproj_path = hf_hub_download(
                                repo_id=repo_id.strip(),
                                filename=chosen_mmproj,
                                repo_type="model",
                                local_dir=str(final_dir),
                                local_dir_use_symlinks=False,
                            )
                            detected_mmproj = Path(mmproj_path).name
                            downloaded_files_list.append(detected_mmproj)
                            print(f"[AILab Downloader] Successfully downloaded mmproj to: {mmproj_path}")
            else:
                # Download the entire repo
                downloaded_path = snapshot_download(
                    repo_id=repo_id.strip(),
                    repo_type="model",
                    local_dir=str(final_dir),
                    local_dir_use_symlinks=False,
                    ignore_patterns=["*.msgpack", "*.h5", "coreml/*"],
                )
                downloaded_files_list.append("Entire repository snapshot")
                print(f"[AILab Downloader] Successfully downloaded repo to: {downloaded_path}")

                local_mmprojs = list(final_dir.glob("*mmproj*.gguf"))
                if local_mmprojs:
                    detected_mmproj = local_mmprojs[0].name

            registration_info = None
            if auto_add_to_custom_models:
                registration_info = _update_custom_models_json(
                    repo_id=repo_id.strip(),
                    local_path=str(downloaded_path),
                    save_folder=resolved_folder,
                    filename=filename.strip(),
                    model_type="vision_language" if is_vl else model_category,
                    mmproj_filename=detected_mmproj,
                )

            # Build comprehensive model_info summary
            files_str = "\n  - ".join(downloaded_files_list) if downloaded_files_list else str(downloaded_path)
            json_snippet = ""
            if registration_info:
                entry_formatted = json.dumps({registration_info["key"]: registration_info["entry"]}, indent=2, ensure_ascii=False)
                json_snippet = f"\n• Registered to custom_models.json [{registration_info['section']}]:\n{entry_formatted}"

            model_info = (
                f"==================================================\n"
                f"📥 [QwenVL Downloader] Download Summary\n"
                f"==================================================\n"
                f"• Status: ✅ Completed Successfully\n"
                f"• Repository: {repo_id}\n"
                f"• Save Location: {final_dir}\n"
                f"• Downloaded Files:\n  - {files_str}"
                f"{json_snippet}\n"
                f"=================================================="
            )

            summary_data = {
                "status": "success",
                "repo_id": repo_id.strip(),
                "save_folder": str(final_dir),
                "files": downloaded_files_list,
                "registration": registration_info,
            }

            return {
                "ui": {
                    "text": [model_info],
                    "summary": [summary_data],
                },
                "result": (model_info,),
            }

        except Exception as e:
            error_msg = (
                f"==================================================\n"
                f"❌ [QwenVL Downloader] Download Failed\n"
                f"==================================================\n"
                f"• Repository: {repo_id}\n"
                f"• Error: {str(e)}\n"
                f"=================================================="
            )
            print(f"[AILab Downloader] {error_msg}")
            summary_data = {
                "status": "error",
                "repo_id": repo_id.strip(),
                "error": str(e),
            }
            return {
                "ui": {
                    "text": [error_msg],
                    "summary": [summary_data],
                },
                "result": (error_msg,),
            }


NODE_CLASS_MAPPINGS = {
    "AILab_HuggingFaceDownloader": AILab_HuggingFaceDownloader
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "AILab_HuggingFaceDownloader": "QwenVL HuggingFace Downloader 📥"
}

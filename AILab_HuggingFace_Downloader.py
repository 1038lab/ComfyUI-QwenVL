import os
import folder_paths
from pathlib import Path
from huggingface_hub import hf_hub_download, snapshot_download

class AILab_HuggingFaceDownloader:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "repo_id": ("STRING", {"default": "Qwen/Qwen1.5-0.5B-Chat-GGUF", "tooltip": "HuggingFace Repo ID (e.g., Qwen/Qwen1.5-0.5B-Chat-GGUF)"}),
                "filename": ("STRING", {"default": "qwen1_5-0_5b-chat-q4_k_m.gguf", "tooltip": "Specific filename to download. Leave empty to download the entire repository."}),
                "save_folder": (["LLM/GGUF", "LLM/hf", "checkpoints", "loras"], {"default": "LLM/GGUF", "tooltip": "Which ComfyUI models folder to save to."}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("downloaded_path",)
    FUNCTION = "download_model"
    CATEGORY = "🧪AILab/QwenVL"

    def download_model(self, repo_id, filename, save_folder):
        base_models_dir = Path(folder_paths.models_dir)
        target_dir = base_models_dir / save_folder
        
        # We put the downloaded model in a subfolder named after the repo to avoid clutter
        repo_parts = repo_id.split("/")
        author = repo_parts[0] if len(repo_parts) > 1 else "custom"
        repo_name = repo_parts[-1]
        
        final_dir = target_dir / author / repo_name
        final_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"[AILab Downloader] Starting download from {repo_id} to {final_dir}")
        
        try:
            if filename.strip():
                # Download a single file
                downloaded_path = hf_hub_download(
                    repo_id=repo_id,
                    filename=filename.strip(),
                    repo_type="model",
                    local_dir=str(final_dir),
                    local_dir_use_symlinks=False,
                )
                print(f"[AILab Downloader] Successfully downloaded file to: {downloaded_path}")
                return (str(downloaded_path),)
            else:
                # Download the entire repo (Warning: can be very large)
                downloaded_path = snapshot_download(
                    repo_id=repo_id,
                    repo_type="model",
                    local_dir=str(final_dir),
                    local_dir_use_symlinks=False,
                    ignore_patterns=["*.msgpack", "*.h5", "coreml/*"],
                )
                print(f"[AILab Downloader] Successfully downloaded repo to: {downloaded_path}")
                return (str(downloaded_path),)
                
        except Exception as e:
            error_msg = f"Download failed: {str(e)}"
            print(f"[AILab Downloader] {error_msg}")
            return (error_msg,)


NODE_CLASS_MAPPINGS = {
    "AILab_HuggingFaceDownloader": AILab_HuggingFaceDownloader
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "AILab_HuggingFaceDownloader": "QwenVL HuggingFace Downloader 📥"
}

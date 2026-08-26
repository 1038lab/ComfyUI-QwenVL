import base64
import inspect
import io
import json
import math
import re
from pathlib import Path

import numpy as np
import torch
from PIL import Image

try:
    import folder_paths
except ImportError:
    class _MockFolderPaths:
        models_dir = Path("models")
        folder_names_and_paths = {}
        @staticmethod
        def get_folder_paths(name):
            return [str(Path("models") / name)]
    folder_paths = _MockFolderPaths()

PLUGIN_DIR = Path(__file__).resolve().parent.parent
SYSTEM_PROMPTS_PATH = PLUGIN_DIR / "system_prompts.json"
MINIMAX_H3_PROMPTS_PATH = PLUGIN_DIR / "AILab_MiniMax_H3_Prompts.json"
LTX_PROMPTS_PATH = PLUGIN_DIR / "AILab_LTX_Prompts.json"
CUSTOM_MODELS_PATH = PLUGIN_DIR / "custom_models.json"
GGUF_CONFIG_PATH = PLUGIN_DIR / "gguf_models.json"
HF_CONFIG_PATH = PLUGIN_DIR / "hf_models.json"

OUTPUT_LANGUAGES = ["English", "Chinese (中文)"]


def safe_dirname(value: str) -> str:
    """Sanitize string for directory naming."""
    value = (value or "").strip()
    if not value:
        return "unknown"
    return "".join(ch for ch in value if ch.isalnum() or ch in "._- ").strip() or "unknown"


def resolve_base_dir(base_dir_value: str = "LLM/GGUF") -> Path:
    """Resolve models directory path with uppercase LLM normalization and Linux case-insensitivity fallback."""
    base_dir = Path(base_dir_value or "LLM/GGUF")
    if base_dir.is_absolute():
        return base_dir
    models_dir = Path(folder_paths.models_dir)
    parts = list(base_dir.parts)
    if parts and parts[0].lower() == "llm":
        parts[0] = "LLM"
    target = models_dir.joinpath(*parts)
    # Case-insensitive fallback on Linux
    if not target.exists():
        lower_parts = [p.lower() for p in parts]
        lower_target = models_dir.joinpath(*lower_parts)
        if lower_target.exists():
            return lower_target
    return target


def find_local_gguf_file(filename: str | None, preferred_dir: Path, allow_recursive: bool = True) -> Path | None:
    """Check for existing local file across candidate directories to avoid re-downloading."""
    if not filename:
        return None
    fname = Path(filename).name
    if not fname:
        return None

    # 1. Preferred target dir
    p = preferred_dir / fname
    if p.exists() and p.is_file():
        return p

    if not allow_recursive:
        return None

    # 2. Check candidate standard directories (both uppercase LLM and lowercase llm)
    models_dir = Path(folder_paths.models_dir)
    candidates = [
        preferred_dir,
        preferred_dir.parent if preferred_dir != models_dir else None,
        models_dir / "LLM" / "GGUF",
        models_dir / "llm" / "GGUF",
        models_dir / "LLM",
        models_dir / "llm",
    ]
    for c in candidates:
        if c is None or not c.exists():
            continue
        c_path = c / fname
        if c_path.exists() and c_path.is_file():
            return c_path
        try:
            matches = list(c.glob(f"**/{fname}"))
            if matches:
                return matches[0]
        except Exception:
            pass
    return None


def model_name_to_filename_candidates(model_name: str) -> set[str]:
    """Generate potential filename candidates from a model display name."""
    raw = (model_name or "").strip()
    if not raw:
        return set()
    candidates = {raw, f"{raw}.gguf"}
    if " / " in raw:
        tail = raw.split(" / ", 1)[1].strip()
        candidates.update({tail, f"{tail}.gguf"})
    if "/" in raw:
        tail = raw.rsplit("/", 1)[-1].strip()
        candidates.update({tail, f"{tail}.gguf"})
    return candidates


def filter_kwargs_for_callable(fn, kwargs: dict) -> dict:
    """Filter kwargs to match the accepted parameters of a callable."""
    try:
        sig = inspect.signature(fn)
    except Exception:
        return dict(kwargs)

    params = list(sig.parameters.values())
    if any(p.kind == inspect.Parameter.VAR_KEYWORD for p in params):
        return dict(kwargs)

    allowed: set[str] = set()
    for p in params:
        if p.kind in (inspect.Parameter.POSITIONAL_OR_KEYWORD, inspect.Parameter.KEYWORD_ONLY):
            allowed.add(p.name)
    return {k: v for k, v in kwargs.items() if k in allowed}


def estimate_vram_requirement(repo_name: str) -> dict:
    """Estimate VRAM usage based on parameter count in model name."""
    repo_lower = repo_name.lower()
    if "72b" in repo_lower:
        return {"full": 144.0, "8bit": 72.0, "4bit": 40.0}
    if "32b" in repo_lower:
        return {"full": 64.0, "8bit": 32.0, "4bit": 18.0}
    if "14b" in repo_lower or "13b" in repo_lower:
        return {"full": 28.0, "8bit": 14.0, "4bit": 8.0}
    if "7b" in repo_lower or "8b" in repo_lower:
        return {"full": 15.0, "8bit": 8.5, "4bit": 5.0}
    if "4b" in repo_lower or "3b" in repo_lower:
        return {"full": 6.0, "8bit": 3.5, "4bit": 2.0}
    if "2b" in repo_lower or "1.5b" in repo_lower:
        return {"full": 4.0, "8bit": 2.5, "4bit": 1.5}
    if "0.5b" in repo_lower or "0.6b" in repo_lower:
        return {"full": 2.0, "8bit": 1.5, "4bit": 1.0}
    return {"full": 8.0, "8bit": 4.5, "4bit": 3.0}


def load_system_prompts():
    """Load system prompts and presets from system_prompts.json."""
    preset_prompts = ["🖼️ Detailed Description"]
    qwenvl_prompts = {}
    qwen_text_styles = {}
    translation_prompt = ""

    if SYSTEM_PROMPTS_PATH.exists():
        try:
            with open(SYSTEM_PROMPTS_PATH, "r", encoding="utf-8") as fh:
                data = json.load(fh) or {}
            qwenvl_prompts = data.get("qwenvl") or {}
            preset_prompts = data.get("_preset_prompts") or preset_prompts
            qwen_text = data.get("qwen_text") or {}
            qwen_text_styles = qwen_text.get("styles") or {}
            translation_prompt = qwen_text.get("translation_prompt") or ""
        except Exception as exc:
            print(f"[QwenVL] System prompts load failed: {exc}")

    return {
        "preset_prompts": preset_prompts,
        "qwenvl_prompts": qwenvl_prompts,
        "qwen_text_styles": qwen_text_styles,
        "translation_prompt": translation_prompt,
    }


def load_h3_prompts() -> dict:
    """Load complete MiniMax-H3 prompt system, rules, and few-shots from AILab_MiniMax_H3_Prompts.json."""
    if MINIMAX_H3_PROMPTS_PATH.exists():
        try:
            with open(MINIMAX_H3_PROMPTS_PATH, "r", encoding="utf-8") as fh:
                return json.load(fh) or {}
        except Exception as exc:
            print(f"[QwenVL] MiniMax H3 prompts load failed: {exc}")
    return {}


load_minimax_h3_prompts = load_h3_prompts


def load_ltx_prompts() -> dict:
    """Load complete Lightricks LTX-Video 2.5 prompts specification from AILab_LTX_Prompts.json."""
    if LTX_PROMPTS_PATH.exists():
        try:
            with open(LTX_PROMPTS_PATH, "r", encoding="utf-8") as fh:
                return json.load(fh) or {}
        except Exception as exc:
            print(f"[QwenVL] LTX-Video prompts load failed: {exc}")
    return {}


def parse_gguf_repos(repos: dict, flattened: dict, seen_display_names: set, overwrite_existing: bool = False):
    """Parse dictionary of GGUF repos into flattened display dictionary."""
    if not isinstance(repos, dict):
        return
    for repo_key, repo in repos.items():
        if not isinstance(repo, dict):
            continue
        author = repo.get("author") or repo.get("publisher")
        repo_name = repo.get("repo_name") or repo_key
        repo_id = repo.get("repo_id") or (f"{author}/{repo_name}" if author and repo_name else None)
        alt_repo_ids = repo.get("alt_repo_ids") or []

        defaults = repo.get("defaults") or {}
        mmproj_file = repo.get("mmproj_file")
        model_files = repo.get("model_files") or []

        for model_file in model_files:
            display = Path(model_file).name
            if display in seen_display_names and not overwrite_existing:
                display = f"{display} ({repo_key})"
            seen_display_names.add(display)
            flattened[display] = {
                **defaults,
                "author": author,
                "repo_dirname": repo_name,
                "repo_id": repo_id,
                "alt_repo_ids": alt_repo_ids,
                "filename": model_file,
                "mmproj_filename": mmproj_file,
            }


def clean_video_director_output(text: str) -> str:
    """Dedicated output cleaner for video director prompts that guarantees narrative text is never destroyed."""
    if not text:
        return ""
    cleaned = (text or "").strip()

    # 1. Strip think blocks
    cleaned = re.sub(r"<think[^>]*>.*?</think>", "", cleaned, flags=re.IGNORECASE | re.DOTALL).strip()
    cleaned = re.sub(r"<think[^>]*>", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"</think\s*>", "", cleaned, flags=re.IGNORECASE).strip()

    # 2. Strip chat template tokens
    cleaned = re.sub(r"(?i)<\|?im_(start|end)\|?>|<im_(start|end)>|<\|endoftext\|>", "", cleaned).strip()

    # 3. Strip code fences
    cleaned = re.sub(r"^\s*```[\w-]*\s*$", "", cleaned, flags=re.MULTILINE).strip()
    if cleaned.startswith("```") and cleaned.endswith("```"):
        cleaned = cleaned[3:-3].strip()

    # 4. Strip role prefix on first line if present
    cleaned = re.sub(r"^\s*(assistant|final|output|response|result|prompt)\s*:\s*\n?", "", cleaned, flags=re.IGNORECASE).strip()

    # 5. Strip outer enclosing parentheses or quotes if the model wrapped the entire output
    if cleaned.startswith("(") and cleaned.endswith(")"):
        cleaned = cleaned[1:-1].strip()

    # 6. Strip stray meta instructions or alignment placeholder lines if model accidentally outputted them
    cleaned = re.sub(r"^\s*\(?\s*Alignment declaration[^\n\)]*\)?\s*\n?", "", cleaned, flags=re.IGNORECASE).strip()

    return cleaned.strip()


def extract_h3_prompt_fields(text: str) -> dict:
    """Robustly extract structured fields from MiniMax-H3 prompt text, tolerating markdown asterisks, hashes, and whitespace variations."""
    result = {
        "integrated_description": text or "",
        "soundscape": "",
        "music": "",
        "subject_definitions": "",
    }
    if not text:
        return result

    # Extract subject_definitions
    subj_match = re.search(
        r"(?:^|\n)\s*(?:[#*\-_\s]*)subject_definitions(?:[#*\-_\s]*):\s*(.*?)(?=\n\s*(?:[#*\-_\s]*)(?:summary|retention_analysis|integrated_multimodal_description)|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if subj_match:
        result["subject_definitions"] = subj_match.group(1).strip()

    # Extract integrated_multimodal_description
    desc_match = re.search(
        r"(?:^|\n)\s*(?:[#*\-_\s]*)integrated_multimodal_description(?:[#*\-_\s]*):\s*(.*?)(?=\n\s*(?:[#*\-_\s]*)overall_soundscape|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if desc_match:
        result["integrated_description"] = desc_match.group(1).strip()

    # Extract overall_soundscape
    sound_match = re.search(
        r"(?:^|\n)\s*(?:[#*\-_\s]*)overall_soundscape(?:[#*\-_\s]*):\s*(.*?)(?=\n\s*(?:[#*\-_\s]*)non_diegetic_music|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if sound_match:
        result["soundscape"] = sound_match.group(1).strip()

    # Extract non_diegetic_music
    music_match = re.search(
        r"(?:^|\n)\s*(?:[#*\-_\s]*)non_diegetic_music(?:[#*\-_\s]*):\s*(.*?)$",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if music_match:
        result["music"] = music_match.group(1).strip()

    return result


def tensor_to_pil(tensor, max_side: int | None = None) -> Image.Image | None:
    """Convert a PyTorch tensor [C, H, W] or [1, H, W, C] to a PIL Image, with optional aspect-ratio downscaling."""
    if tensor is None:
        return None
    if torch.is_tensor(tensor):
        if tensor.ndim == 4:
            tensor = tensor[0]
        array = (tensor * 255).clamp(0, 255).to(torch.uint8).cpu().numpy()
    elif isinstance(tensor, np.ndarray):
        if tensor.ndim == 4:
            tensor = tensor[0]
        array = np.clip(tensor * 255, 0, 255).astype(np.uint8)
    else:
        return None

    pil_img = Image.fromarray(array, mode="RGB")

    if max_side is not None and max_side > 0:
        w, h = pil_img.size
        cur_max = max(w, h)
        if cur_max > max_side:
            scale = max_side / float(cur_max)
            new_w = max(int(round(w * scale)), 16)
            new_h = max(int(round(h * scale)), 16)
            pil_img = pil_img.resize((new_w, new_h), Image.Resampling.BICUBIC)

    return pil_img


def tensor_to_base64_png(tensor, max_side: int | None = None) -> str | None:
    """Convert tensor to base64-encoded PNG string with optional aspect-ratio downscaling."""
    pil_img = tensor_to_pil(tensor, max_side=max_side)
    if pil_img is None:
        return None
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def sample_video_frames(video, frame_count: int) -> list:
    """Uniformly sample frame_count frames from a video tensor [B, H, W, C]."""
    if video is None:
        return []
    if not hasattr(video, "shape") or video.ndim != 4:
        return [video]
    total = int(video.shape[0])
    frame_count = max(int(frame_count), 1)
    if total <= frame_count:
        return [video[i] for i in range(total)]
    idx = np.linspace(0, total - 1, frame_count, dtype=int)
    return [video[i] for i in idx]


def resolve_safe_video_max_side(
    video_tensor,
    frame_count: int,
    ctx: int = 8192,
    video_frame_size: str = "auto",
) -> int | None:
    """
    Intelligently determine the safe maximum side dimension for video frames
    to prevent context overflow and CUDA OOM while preserving native resolution when within budget.
    """
    if video_tensor is None:
        return None
    mode = str(video_frame_size or "auto").strip().lower()
    if mode == "original":
        print("[QwenVL] Video scaling disabled (mode=original); keeping original resolution.")
        return None
    if mode.isdigit():
        target = int(mode)
        print(f"[QwenVL] Video manual scale target: {target}px max side.")
        return target

    # Auto mode: calculate safe token budget based on context length and frame count
    ctx_val = max(int(ctx or 8192), 1024)
    f_count = max(int(frame_count or 1), 1)

    # Reserve 1024 tokens for system prompt, user prompt, and generation
    text_reserve = 1024
    avail_tokens = max(ctx_val - text_reserve, 1024)
    budget_per_frame = avail_tokens / f_count

    # Qwen-VL: patch size 14x14 with 2x2 merge -> 28x28 = 784 pixels / token
    # Apply safety factor of 0.8 -> ~627 pixels / token
    safe_pixels = budget_per_frame * 627
    safe_side = int(math.sqrt(safe_pixels))
    # Clamp to reasonable bounds: minimum 336px, maximum 1024px
    safe_side = max(min(safe_side, 1024), 336)

    # Check original video dimensions
    orig_h, orig_w = None, None
    if hasattr(video_tensor, "shape") and len(video_tensor.shape) >= 3:
        if len(video_tensor.shape) == 4:
            orig_h, orig_w = int(video_tensor.shape[1]), int(video_tensor.shape[2])
        else:
            orig_h, orig_w = int(video_tensor.shape[0]), int(video_tensor.shape[1])

    if orig_h is not None and orig_w is not None:
        cur_max = max(orig_h, orig_w)
        if cur_max <= safe_side:
            print(
                f"[QwenVL] Video resolution ({orig_w}x{orig_h}) fits within safe token budget "
                f"({budget_per_frame:.0f} tokens/frame for {f_count} frames, budget max={safe_side}px); "
                f"keeping original resolution."
            )
            return None
        else:
            print(
                f"[QwenVL] Video resolution ({orig_w}x{orig_h}) exceeds safe context budget "
                f"({budget_per_frame:.0f} tokens/frame for {f_count} frames, ctx={ctx_val}); "
                f"auto-downscaling max side to {safe_side}px."
            )
            return safe_side

    return safe_side



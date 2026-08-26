"""
qwenvl_engine.py - High-Performance Shared QwenVL Inference Engine for ComfyUI

Provides a clean, modular Python API for local vision analysis and prompt generation.
Allows cross-custom-node integration (e.g. Comfyui-Minimax-H3-Promptor) to call
QwenVL GGUF / Transformers models with zero duplicate code.
"""

from __future__ import annotations

import base64
import gc
import io
import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np
from PIL import Image

try:
    import torch
except ImportError:
    torch = None

try:
    import folder_paths
except ImportError:
    folder_paths = None

from AILab_Utils import (
    CUSTOM_MODELS_PATH,
    GGUF_CONFIG_PATH,
    SYSTEM_PROMPTS_PATH,
    filter_kwargs_for_callable,
    find_local_gguf_file,
    load_system_prompts,
    model_name_to_filename_candidates,
    parse_gguf_repos,
    resolve_base_dir,
    safe_dirname,
)


class QwenVLEngine:
    """Singleton engine managing GGUF and Transformers model lifecycle and inference."""

    _instance: Optional["QwenVLEngine"] = None

    def __new__(cls) -> "QwenVLEngine":
        if cls._instance is None:
            cls._instance = super(QwenVLEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if getattr(self, "_initialized", False):
            return
        self._initialized = True
        self.llm = None
        self.chat_handler = None
        self.current_signature = None
        self.catalog = {}
        self.reload_catalog()

    def reload_catalog(self) -> None:
        """Scan catalog from gguf_models.json and custom_models.json."""
        flattened: Dict[str, Any] = {}
        seen_display_names: set = set()
        base_dir = "LLM/GGUF"

        if GGUF_CONFIG_PATH.exists():
            try:
                with open(GGUF_CONFIG_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f) or {}
                base_dir = data.get("base_dir") or base_dir
                parse_gguf_repos(data.get("models") or {}, flattened, seen_display_names)
            except Exception as e:
                print(f"[QwenVLEngine] Warning: Failed to load gguf_models.json: {e}")

        if CUSTOM_MODELS_PATH.exists():
            try:
                with open(CUSTOM_MODELS_PATH, "r", encoding="utf-8") as f:
                    cdata = json.load(f) or {}
                parse_gguf_repos(cdata.get("gguf_models") or {}, flattened, seen_display_names, overwrite_existing=True)
            except Exception as e:
                print(f"[QwenVLEngine] Warning: Failed to load custom_models.json: {e}")

        self.catalog = {"base_dir": base_dir, "models": flattened}

    def get_available_models(self) -> List[str]:
        """List all available GGUF model keys in the catalog."""
        self.reload_catalog()
        return sorted(list((self.catalog.get("models") or {}).keys()))

    def get_first_available_model(self) -> Optional[str]:
        """Find the first downloaded local model on disk."""
        self.reload_catalog()
        models = self.catalog.get("models") or {}
        base_dir = resolve_base_dir(self.catalog.get("base_dir") or "LLM/GGUF")

        # 1. Prefer models that actually exist on disk
        for name, entry in models.items():
            author_dir = safe_dirname(entry.get("author") or "")
            repo_dir = safe_dirname(entry.get("repo_dirname") or "")
            target_dir = base_dir / author_dir / repo_dir
            if find_local_gguf_file(entry.get("filename"), target_dir):
                return name

        # 2. Fallback to first configured model
        if models:
            return next(iter(models.keys()))
        return None

    def clear(self) -> None:
        """Free VRAM and clear resident model."""
        self.llm = None
        self.chat_handler = None
        self.current_signature = None
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    @staticmethod
    def _convert_image_to_base64(image_input: Union[str, Path, Image.Image, np.ndarray, torch.Tensor]) -> Optional[str]:
        """Normalize various image formats to PNG base64 string."""
        if image_input is None:
            return None

        pil_img = None
        if isinstance(image_input, (str, Path)):
            p = Path(image_input)
            if p.exists() and p.is_file():
                pil_img = Image.open(p).convert("RGB")
        elif isinstance(image_input, Image.Image):
            pil_img = image_input.convert("RGB")
        elif isinstance(image_input, np.ndarray):
            arr = image_input
            if arr.dtype != np.uint8:
                arr = (arr * 255).clip(0, 255).astype(np.uint8)
            if arr.ndim == 4:
                arr = arr[0]
            pil_img = Image.fromarray(arr)
        elif isinstance(image_input, torch.Tensor):
            t = image_input
            if t.ndim == 4:
                t = t[0]
            arr = (t * 255).clamp(0, 255).to(torch.uint8).cpu().numpy()
            if arr.ndim == 2:
                pil_img = Image.fromarray(arr, mode="L")
            elif arr.shape[-1] == 4:
                pil_img = Image.fromarray(arr, mode="RGBA")
            else:
                pil_img = Image.fromarray(arr[..., :3], mode="RGB")

        if pil_img is None:
            return None

        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    def _load_gguf_model(self, model_name: str, device: str = "auto") -> Any:
        """Load or retrieve resident GGUF llama instance."""
        from llama_cpp import Llama

        self.reload_catalog()
        models = self.catalog.get("models") or {}
        entry = models.get(model_name)
        if not entry:
            raise ValueError(f"[QwenVLEngine] Model '{model_name}' not found in catalog.")

        base_dir = resolve_base_dir(self.catalog.get("base_dir") or "LLM/GGUF")
        author_dir = safe_dirname(entry.get("author") or "")
        repo_dir = safe_dirname(entry.get("repo_dirname") or "")
        target_dir = base_dir / author_dir / repo_dir

        model_path = find_local_gguf_file(entry.get("filename"), target_dir)
        if not model_path or not model_path.exists():
            model_path = target_dir / Path(entry.get("filename", "")).name
            if not model_path.exists():
                raise FileNotFoundError(f"[QwenVLEngine] Model file not found: {model_path}")

        mmproj_filename = entry.get("mmproj_filename")
        mmproj_path = find_local_gguf_file(mmproj_filename, target_dir, allow_recursive=False)
        if not mmproj_path and target_dir.exists():
            local_mmprojs = list(target_dir.glob("*mmproj*.gguf"))
            if local_mmprojs:
                mmproj_path = local_mmprojs[0]

        has_mmproj = mmproj_path is not None and mmproj_path.exists()
        n_ctx = int(entry.get("context_length", 8192))
        n_gpu_layers = int(entry.get("gpu_layers", -1))
        n_batch = int(entry.get("n_batch", 512))

        dev_choice = "cuda" if (device in ("auto", "cuda") and torch.cuda.is_available()) else "cpu"
        signature = (str(model_path), str(mmproj_path) if has_mmproj else "", n_ctx, n_gpu_layers, dev_choice)

        if self.llm is not None and self.current_signature == signature:
            return self.llm

        self.clear()

        self.chat_handler = None
        if has_mmproj:
            try:
                from llama_cpp.llama_chat_format import Qwen3VLChatHandler
                self.chat_handler = Qwen3VLChatHandler(
                    clip_model_path=str(mmproj_path),
                    image_max_tokens=int(entry.get("image_max_tokens", 4096)),
                    verbose=False,
                )
            except Exception as e:
                print(f"[QwenVLEngine] Warning: Vision chat handler initialization failed: {e}")

        llm_kwargs = {
            "model_path": str(model_path),
            "n_ctx": n_ctx,
            "n_batch": n_batch,
            "n_gpu_layers": n_gpu_layers if dev_choice == "cuda" else 0,
            "verbose": False,
        }
        if has_mmproj and self.chat_handler is not None:
            llm_kwargs["chat_handler"] = self.chat_handler
            llm_kwargs["image_min_tokens"] = 1024

        filtered_kwargs = filter_kwargs_for_callable(Llama.__init__, llm_kwargs)
        self.llm = Llama(**filtered_kwargs)
        self.current_signature = signature
        return self.llm

    def run_vision_analysis(
        self,
        image_input: Union[str, Path, Image.Image, np.ndarray, torch.Tensor],
        prompt: str = "Describe this image in detail.",
        model_name: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.6,
        top_p: float = 0.9,
        repetition_penalty: float = 1.1,
        seed: int = 1,
        system_prompt: str = "You are a professional vision-language assistant. Output only direct, accurate descriptions.",
    ) -> str:
        """Run multimodal vision inference on an input image."""
        chosen_model = model_name or self.get_first_available_model()
        if not chosen_model:
            raise RuntimeError("[QwenVLEngine] No GGUF models configured or found on disk.")

        llm = self._load_gguf_model(chosen_model)
        img_b64 = self._convert_image_to_base64(image_input)

        if img_b64 and self.chat_handler is not None:
            user_content = [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": f"data:image/png;base64,{img_b64}"},
            ]
        else:
            user_content = prompt

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        result = llm.create_chat_completion(
            messages=messages,
            max_tokens=int(max_tokens),
            temperature=float(temperature),
            top_p=float(top_p),
            repeat_penalty=float(repetition_penalty),
            seed=int(seed),
            stop=["<|im_end|>", "<|im_start|>"],
        )

        choices = result.get("choices") or []
        if not choices:
            return ""
        return (choices[0].get("message", {}).get("content") or "").strip()

    def run_prompt_enhancement(
        self,
        prompt_text: str,
        system_prompt: Optional[str] = None,
        model_name: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        top_p: float = 0.9,
        repetition_penalty: float = 1.1,
        seed: int = 1,
    ) -> str:
        """Run text-only prompt expansion or enhancement."""
        chosen_model = model_name or self.get_first_available_model()
        if not chosen_model:
            raise RuntimeError("[QwenVLEngine] No GGUF models configured or found on disk.")

        llm = self._load_gguf_model(chosen_model)
        sys_prompt = system_prompt or "You are an expert creative prompt engineer. Output only the enhanced prompt."

        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": prompt_text},
        ]

        result = llm.create_chat_completion(
            messages=messages,
            max_tokens=int(max_tokens),
            temperature=float(temperature),
            top_p=float(top_p),
            repeat_penalty=float(repetition_penalty),
            seed=int(seed),
            stop=["<|im_end|>", "<|im_start|>"],
        )

        choices = result.get("choices") or []
        if not choices:
            return ""
        return (choices[0].get("message", {}).get("content") or "").strip()


# Public convenience functions for external modules (e.g. Comfyui-Minimax-H3-Promptor)
def is_qwenvl_available() -> bool:
    """Check if QwenVL engine and llama-cpp-python are ready for execution."""
    try:
        from llama_cpp import Llama  # noqa: F401
        return True
    except Exception:
        return False


def run_qwenvl_vision(
    image: Union[str, Path, Image.Image, np.ndarray, torch.Tensor],
    prompt: str = "Analyze this image for video generation.",
    model_name: Optional[str] = None,
    max_tokens: int = 1024,
    system_prompt: Optional[str] = None,
) -> str:
    """Convenience helper to run vision analysis via singleton engine."""
    engine = QwenVLEngine()
    sys_p = system_prompt or "You are an expert Hollywood cinematographer and Director of Photography. Describe subject, lighting, composition, and atmosphere."
    return engine.run_vision_analysis(
        image_input=image,
        prompt=prompt,
        model_name=model_name,
        max_tokens=max_tokens,
        system_prompt=sys_p,
    )


def run_qwenvl_text(
    prompt: str,
    system_prompt: Optional[str] = None,
    model_name: Optional[str] = None,
    max_tokens: int = 1024,
) -> str:
    """Convenience helper to run text prompt enhancement via singleton engine."""
    engine = QwenVLEngine()
    return engine.run_prompt_enhancement(
        prompt_text=prompt,
        system_prompt=system_prompt,
        model_name=model_name,
        max_tokens=max_tokens,
    )

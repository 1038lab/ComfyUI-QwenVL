import torch

from AILab_QwenVL_GGUF import (
    GGUF_VL_CATALOG,
    PRESET_PROMPTS,
    SYSTEM_PROMPTS,
    QwenVLGGUFBase,
    _tensor_to_base64_png,
)

MULTI_IMAGE_TOOLTIP = "Connect one or more IMAGE inputs. Batches are expanded so each frame becomes a separate image in order."


class AILab_QwenVL_GGUF_Multi(QwenVLGGUFBase):
    @classmethod
    def INPUT_TYPES(cls):
        all_models = GGUF_VL_CATALOG.get("models") or {}
        model_keys = sorted([key for key, entry in all_models.items() if (entry or {}).get("mmproj_filename")]) or ["(edit gguf_models.json)"]
        default_model = model_keys[0]

        prompts = PRESET_PROMPTS or ["🖼️ Detailed Description"]
        preferred_prompt = "🖼️ Detailed Description"
        default_prompt = preferred_prompt if preferred_prompt in prompts else prompts[0]

        return {
            "required": {
                "model_name": (model_keys, {"default": default_model}),
                "preset_prompt": (prompts, {"default": default_prompt}),
                "custom_prompt": ("STRING", {"default": "", "multiline": True}),
                "max_tokens": ("INT", {"default": 512, "min": 64, "max": 2048}),
                "keep_model_loaded": ("BOOLEAN", {"default": True}),
                "seed": ("INT", {"default": 1, "min": 1, "max": 2**32 - 1}),
            },
            "optional": {
                "image_1": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
                "image_2": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
                "image_3": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
                "image_4": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
                "image_5": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
                "image_6": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
                "image_7": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
                "image_8": ("IMAGE", {"tooltip": MULTI_IMAGE_TOOLTIP}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("RESPONSE",)
    FUNCTION = "process"
    CATEGORY = "🧪AILab/QwenVL"

    @staticmethod
    def _collect_images_b64(image_tensors):
        images_b64: list[str] = []
        for tensor in image_tensors:
            if tensor is None:
                continue
            if getattr(tensor, "ndim", None) == 4:
                total = int(tensor.shape[0])
                for i in range(total):
                    img = _tensor_to_base64_png(tensor[i])
                    if img:
                        images_b64.append(img)
            else:
                img = _tensor_to_base64_png(tensor)
                if img:
                    images_b64.append(img)
        return images_b64

    def process(
        self,
        model_name,
        preset_prompt,
        custom_prompt,
        max_tokens,
        keep_model_loaded,
        seed,
        image_1=None,
        image_2=None,
        image_3=None,
        image_4=None,
        image_5=None,
        image_6=None,
        image_7=None,
        image_8=None,
    ):
        torch.manual_seed(int(seed))

        prompt = SYSTEM_PROMPTS.get(preset_prompt, preset_prompt)
        if custom_prompt and custom_prompt.strip():
            prompt = custom_prompt.strip()

        image_tensors = [image_1, image_2, image_3, image_4, image_5, image_6, image_7, image_8]
        images_b64 = self._collect_images_b64(image_tensors)

        if not images_b64:
            raise ValueError("Please connect at least one IMAGE input.")

        try:
            self._load_model(
                model_name=model_name,
                device="auto",
                ctx=None,
                n_batch=None,
                gpu_layers=None,
                image_max_tokens=None,
                top_k=None,
                pool_size=None,
            )
            if self.chat_handler is None:
                print("[QwenVL] Warning: images provided but this model entry has no mmproj_file; images will be ignored")
            text = self._invoke(
                system_prompt=(
                    "You are a helpful vision-language assistant. "
                    "Answer directly with the final answer only. No <think> and no reasoning."
                ),
                user_prompt=prompt,
                images_b64=images_b64 if self.chat_handler is not None else [],
                max_tokens=max_tokens,
                temperature=0.6,
                top_p=0.9,
                repetition_penalty=1.2,
                seed=seed,
            )
            return (text,)
        finally:
            if not keep_model_loaded:
                self.clear()


NODE_CLASS_MAPPINGS = {
    "AILab_QwenVL_GGUF_Multi": AILab_QwenVL_GGUF_Multi,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "AILab_QwenVL_GGUF_Multi": "QwenVL-Multi (GGUF)",
}

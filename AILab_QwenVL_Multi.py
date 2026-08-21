import torch
from comfy.utils import ProgressBar

from AILab_QwenVL import (
    ATTENTION_MODES,
    HF_VL_MODELS,
    PRESET_PROMPTS,
    QwenVLBase,
    Quantization,
    SYSTEM_PROMPTS,
    TOOLTIPS,
)

MULTI_IMAGE_TOOLTIP = "Connect one or more IMAGE inputs. Batches are expanded so each frame becomes a separate image in order."


class AILab_QwenVL_Multi(QwenVLBase):
    @classmethod
    def INPUT_TYPES(cls):
        models = list(HF_VL_MODELS.keys())
        default_model = models[0] if models else "Qwen3-VL-4B-Instruct"
        prompts = PRESET_PROMPTS or ["Describe this image in detail."]
        preferred_prompt = "🖼️ Detailed Description"
        default_prompt = preferred_prompt if preferred_prompt in prompts else prompts[0]
        return {
            "required": {
                "model_name": (models, {"default": default_model, "tooltip": TOOLTIPS["model_name"]}),
                "quantization": (Quantization.get_values(), {"default": Quantization.FP16.value, "tooltip": TOOLTIPS["quantization"]}),
                "attention_mode": (ATTENTION_MODES, {"default": "auto", "tooltip": TOOLTIPS["attention_mode"]}),
                "preset_prompt": (prompts, {"default": default_prompt, "tooltip": TOOLTIPS["preset_prompt"]}),
                "custom_prompt": ("STRING", {"default": "", "multiline": True, "tooltip": TOOLTIPS["custom_prompt"]}),
                "max_tokens": ("INT", {"default": 512, "min": 64, "max": 2048, "tooltip": TOOLTIPS["max_tokens"]}),
                "keep_model_loaded": ("BOOLEAN", {"default": True, "tooltip": TOOLTIPS["keep_model_loaded"]}),
                "seed": ("INT", {"default": 1, "min": 1, "max": 2**32 - 1, "tooltip": TOOLTIPS["seed"]}),
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
    def tensor_to_pil_list(tensor):
        if tensor is None:
            return []
        if tensor.dim() == 4:
            return [QwenVLBase.tensor_to_pil(frame) for frame in tensor]
        return [QwenVLBase.tensor_to_pil(tensor)]

    @torch.no_grad()
    def generate_multi(
        self,
        prompt_text,
        images,
        max_tokens,
        temperature,
        top_p,
        num_beams,
        repetition_penalty,
    ):
        conversation = [{"role": "user", "content": []}]
        for idx, image in enumerate(images, start=1):
            conversation[0]["content"].append({"type": "text", "text": f"Image {idx}:"})
            conversation[0]["content"].append({"type": "image", "image": image})
        conversation[0]["content"].append({"type": "text", "text": prompt_text})

        chat = self.processor.apply_chat_template(conversation, tokenize=False, add_generation_prompt=True)
        processed = self.processor(text=chat, images=images, videos=None, return_tensors="pt")
        model_device = next(self.model.parameters()).device
        model_inputs = {
            key: value.to(model_device) if torch.is_tensor(value) else value
            for key, value in processed.items()
        }

        stop_tokens = [self.tokenizer.eos_token_id]
        if hasattr(self.tokenizer, "eot_id") and self.tokenizer.eot_id is not None:
            stop_tokens.append(self.tokenizer.eot_id)

        kwargs = {
            "max_new_tokens": max_tokens,
            "repetition_penalty": repetition_penalty,
            "num_beams": num_beams,
            "eos_token_id": stop_tokens,
            "pad_token_id": self.tokenizer.pad_token_id,
        }
        if num_beams == 1:
            kwargs.update({"do_sample": True, "temperature": temperature, "top_p": top_p})
        else:
            kwargs["do_sample"] = False

        outputs = self.model.generate(**model_inputs, **kwargs)
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        input_len = model_inputs["input_ids"].shape[-1]
        text = self.tokenizer.decode(outputs[0, input_len:], skip_special_tokens=True)
        return text.strip()

    def process(
        self,
        model_name,
        quantization,
        attention_mode,
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
        pbar = ProgressBar(3)

        torch.manual_seed(seed)
        prompt = SYSTEM_PROMPTS.get(preset_prompt, preset_prompt)
        if custom_prompt and custom_prompt.strip():
            prompt = custom_prompt.strip()

        image_tensors = [image_1, image_2, image_3, image_4, image_5, image_6, image_7, image_8]
        images = []
        for tensor in image_tensors:
            images.extend(self.tensor_to_pil_list(tensor))

        if not images:
            raise ValueError("Please connect at least one IMAGE input.")

        pbar.update_absolute(1, 3, None)

        self.load_model(
            model_name,
            quantization,
            attention_mode,
            False,
            "auto",
            keep_model_loaded,
        )

        pbar.update_absolute(2, 3, None)

        try:
            text = self.generate_multi(
                prompt,
                images,
                max_tokens,
                0.6,
                0.9,
                1,
                1.2,
            )

            pbar.update_absolute(3, 3, None)
            return (text,)
        finally:
            if not keep_model_loaded:
                self.clear()


NODE_CLASS_MAPPINGS = {
    "AILab_QwenVL_Multi": AILab_QwenVL_Multi,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "AILab_QwenVL_Multi": "QwenVL-Multi",
}

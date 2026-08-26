# 🧩 ComfyUI-QwenVL — Custom Models Guide

You can add your own custom HuggingFace or GGUF fine-tuned models without modifying the built-in configuration files.

---

## 📁 File Location
Place a file named `custom_models.json` in the plugin root folder:

```
ComfyUI/custom_nodes/ComfyUI-QwenVL/custom_models.json
```

When ComfyUI starts (or when the Downloader runs), it automatically detects and merges this file with the default model catalogs (`hf_models.json` and `gguf_models.json`).

---

## ⚙️ Simplified File Format
All custom models are organized into just two clear sections:

```json
{
  "hf_models": {
    "My-Custom-Qwen2.5-VL-7B": {
      "repo_id": "myusername/Qwen2.5-VL-7B-Finetune",
      "default": false,
      "quantized": false,
      "vram_requirement": {
        "full": 15.0,
        "8bit": 8.5,
        "4bit": 5.0
      }
    }
  },
  "gguf_models": {
    "Huihui-Qwen3.5-4B-abliterated-GGUF": {
      "author": "mradermacher",
      "repo_name": "Huihui-Qwen3.5-4B-abliterated-GGUF",
      "repo_id": "mradermacher/Huihui-Qwen3.5-4B-abliterated-GGUF",
      "mmproj_file": "Huihui-Qwen3.5-4B-abliterated.mmproj-f16.gguf",
      "model_files": [
        "Huihui-Qwen3.5-4B-abliterated.Q4_K_M.gguf",
        "Huihui-Qwen3.5-4B-abliterated.Q8_0.gguf"
      ],
      "defaults": {
        "context_length": 8192
      }
    }
  }
}
```

### Sections:
- **`hf_models`**: Transformers / PyTorch models (for `AILab_QwenVL`, `AILab_QwenVL_Advanced`, and `AILab_QwenVL_PromptEnhancer`).
- **`gguf_models`**: GGUF format models (for `AILab_QwenVL_GGUF`, `AILab_QwenVL_GGUF_Advanced`, and `AILab_QwenVL_GGUF_PromptEnhancer`).
  - `mmproj_file`: (Optional) The vision projector file. If provided, vision nodes use it for visual understanding. Text-only nodes (like Prompt Enhancer) simply ignore it.

---

## 📥 Automatic Registration via Downloader
Using the **QwenVL HuggingFace Downloader 📥** node (`AILab_HuggingFaceDownloader`), any downloaded model will be automatically created and registered into `custom_models.json` with all correct settings and matching `mmproj` files!

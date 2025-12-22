# ComfyUI-QwenVL Update Log
# Release Notes: v2.0.0 (2025-12-22)

### New GGUF Nodes
We've expanded our GGUF model support with three powerful new nodes:

- **QwenVL (GGUF)** — Lightweight GGUF-based vision node for image/video understanding and text generation. Offers significantly faster inference speed compared to Transformers models, making it ideal for real-time workflows and resource-constrained environments.
- **QwenVL (GGUF) Advanced** — Enhanced GGUF vision node with additional controls for advanced users. Maintains the ultra-fast inference speed of GGUF while providing fine-tuned control over generation parameters.
- **Qwen Prompt Enhancer (GGUF)** — GGUF text-only node for intelligent prompt rewriting and enhancement (not a vision model). Delivers rapid prompt enhancement with minimal resource usage, perfect for iterative prompt refinement workflows.
- **Qwen Prompt Enhancer (Transformers)** — Uses Qwen3 transformer model to enhance and rewrite prompts. Analyzes your input prompt and intelligently expands it with better detail, structure, and clarity for improved generation quality. Offers full model capabilities with precise control over the enhancement process.

![Qwen V2.0.0](https://github.com/user-attachments/assets/5187b98c-ccb5-4b57-858d-e43fbfb04a98)

### Enhanced GPU Device Selection (Advanced Node)
The **QwenVL (Advanced)** node now offers flexible GPU device management:

- **Manual GPU selection** — Choose specific CUDA devices (e.g., `cuda:1`, `cuda:2`) instead of defaulting to `cuda:0`
- **Automatic device detection** — Dynamically discovers all available CUDA devices on your system
- **Improved device mapping** — More consistent behavior and better resource allocation
- **OOM prevention** — Route models to underutilized GPUs when your primary GPU is handling diffusion workloads

*Note: The basic QwenVL node continues to use automatic device selection for simplicity*

---

## ✨ Improvements

### GGUF: Quality and Usability

**Cleaner Outputs by Default:**
- Automatically removes common "thinking/planning" content and leaked tokens (`<think>`, `<im_start>`, `<im_end>`)
- Users now receive clean, usable prompt-only or answer-only text without manual filtering

**QwenVL (GGUF) Vision Node:**
- Model dropdown now displays actual `.gguf` filenames with automatic deduplication for easier model identification
- Enhanced download progress logging with clear status messages during model download and cache reuse
- Token generation speed reporting (`tok/s`) when available — helps compare different models and quantization levels

![QwenVL (GGUF) Vision Node](https://github.com/user-attachments/assets/bc9450d9-1695-452d-9e46-f05a4bf315de)

**Qwen Prompt Enhancer (GGUF):**
- Updated built-in presets to reduce "junk talk" and return clean enhanced prompts more consistently
- Refined system prompts that minimize verbose output
- More reliable prompt-only text generation

![Qwen Prompt Enhancer (GGUF)](https://github.com/user-attachments/assets/d809f6fa-b43f-40c3-89e1-d03dc5fa7dee)

### Transformers Nodes: GPU and Attention Stability


**Advanced GPU Routing:**
- `QwenVL (Advanced)` supports selecting specific GPUs (e.g., `cuda:1`, `cuda:2`) to avoid OOM when GPU0 is busy
- Improved device-mapping logic for more consistent behavior across different hardware configurations

**Attention Backend Stability:**
- Flash-Attention auto mode now behaves safely across all platforms
- Gracefully falls back to SDPA when Flash-Attention dependencies are unavailable
- Prevents runtime errors from missing or incompatible Flash-Attention installations

---

## 🐛 Bug Fixes

### QwenVL (Transformers) Stability
- **Fixed:** Invalid CUDA device handling that caused crashes with incorrect device specifications (e.g., device `"0"` or malformed `device_map`)  
  Related issue: https://github.com/1038lab/ComfyUI-QwenVL/issues/21
- **Fixed:** Flash-Attention detection now restricted to Linux systems only, preventing Windows metadata errors
- **Fixed:** Flash-Attention auto mode fallback mechanism to eliminate runtime errors when dependencies are unavailable

---

## 📚 Documentation & Dependencies

### New Documentation
- **Added:** Comprehensive installation guide for vision-capable `llama-cpp-python`  
  See `docs/LLAMA_CPP_PYTHON_VISION_INSTALL.md` for:
  - JamePeng fork wheel installation instructions (wheel source: https://github.com/JamePeng/llama-cpp-python/releases/)
  - Handler verification steps
  - Common numpy/OpenCV conflict resolution 

### Dependencies
- **Added:** `hf_xet` to `requirements.txt` for improved Hugging Face download performance and to eliminate Xet fallback warnings
## Version 1.1.0 (2025/11/11)

⚡ Major Performance Optimization Update

This release introduces a full rework of the QwenVL runtime to significantly improve speed, stability, and GPU utilization.

![QwenVL_V1.1.0](https://github.com/user-attachments/assets/13e89746-a04e-41a3-9026-7079b29e149c)

### 🚀 Core Improvements
- **Flash Attention Integration (Auto Detection)**  
  Automatically leverages next-generation attention optimization for faster inference on supported GPUs, while falling back to SDPA when needed.
- **Attention Mode Selector**  
  Both QwenVL nodes expose the attention backend (auto / flash_attention_2 / sdpa) so users can quickly validate which mode performs best on their hardware without leaving the basic workflow view.
- **Precision Optimization**  
  Smarter internal precision handling improves throughput and keeps performance consistent across high-end and low-VRAM cards.
- **Runtime Acceleration**  
  The execution pipeline now keeps KV cache/device alignment always-on, cutting per-run overhead and reducing latency.
- **Caching System**  
  Models remain cached in memory between runs, drastically lowering reload times when prompts change.
- **Video Frame Optimization**  
  Streamlined frame sampling and preprocessing accelerate video-focused workflows.
- **Hardware Adaptation**  
  Smarter device detection ensures the best configuration across NVIDIA GPUs, Apple Silicon, and CPU fallback scenarios.

### 🧠 Developer Enhancements
- Unified model and processor loading with cleaner logging and fewer bottlenecks.  
- Refined quantization and memory handling for better stability across quant modes.  
- Improved fallback behavior when advanced GPU optimizations are unavailable.

### 💡 Compatibility
- Fully backward compatible with existing ComfyUI workflows.  
- Retains both **QwenVL** and **QwenVL (Advanced)** nodes: the basic node now bundles the most useful speed controls, while the advanced node exposes every knob (quantization, attention, device, torch.compile) for deep tuning.

### 🔧 Recommended
- PyTorch ≥ 2.8.0  
- CUDA 12.4 or later  
- Flash Attention 2.x (optional, for maximum performance)

> Switching quantization or attention modes forces a one-time model reload and is expected behavior when comparing runtime profiles.
### Version 1.0.4 (2025/10/31)

🆕 **Custom Model Support Added**
- Users can now add their own **custom Qwen-VL or Hugging Face models**  
  by creating a `custom_models.json` file in the plugin directory.  
  These models will automatically appear in the model selection list.

- Added automatic merging of user-defined models from `custom_models.json`,  
  following the same flexible mechanism as in *ComfyUI-JoyCaption*.

- Added detailed documentation  
  👉 [`docs/custom_models.md`](./docs/custom_models.md)  
  and an editable example file [`custom_models_example.json`](./custom_models_example.json).

⚙️ **Dependency Update**

- Updated **Transformers** version requirement:  
  `transformers>=4.57.0` (was `>=4.40.0`)  
  to ensure full compatibility with **Qwen3-VL** models.  
  [Reference: Qwen3-VL](https://github.com/QwenLM/Qwen3-VL?tab=readme-ov-file#quickstart)

---
## Version 1.0.3 (2025/10/22)
- Added 8 more Qwen3-VL models 2B and 32B (FB16 and FP8 variants) have been integrated into our support list, catering to diverse requirements.

## Version 1.0.2 (2025/10/21)
- Integrated additional Qwen3-VL models
- Added Chinese language README (README_zh.md)
- Refined fine-tuning preset system prompt

## Version 1.0.1 (2025/10/17)
- Resolved various bugs
- Optimized video input logic

## v1.0.0 Initial Release (2025/10/17)
- Support for Qwen3-VL and Qwen2.5-VL series models.
- Automatic model downloading from Hugging Face.
- On-the-fly quantization (4-bit, 8-bit, FP16).
- Preset and Custom Prompt system for flexible and easy use.
- Includes both a standard and an advanced node for users of all levels.
- Hardware-aware safeguards for FP8 model compatibility.
- Image and Video (frame sequence) input support.
- "Keep Model Loaded" option for improved performance on sequential runs.
- Seed parameter for reproducible generation.

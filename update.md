# ComfyUI-QwenVL Update Log

---
# Release Notes: v2.3.0 (2026-08-26)

### 🎬 Intelligent Adaptive Video Scaling & Safe Token Budget
<img width="614" alt="image" src="https://github.com/user-attachments/assets/df99ea79-89dc-4bd9-a971-f7df33c9fa50" />

- **Dynamic Context Budget Estimation**:
  - Automatically calculates safe per-frame token budget based on the model's active context window (`ctx`) and sampled frame count (`frame_count`).
  - Completely resolves `decode: failed to find a memory slot for batch` errors in GGUF/llama.cpp and CUDA OOM (Out Of Memory) in Transformers backends.
- **Smart Resolution Decision**:
  - **Low/Medium Resolution Videos**: If the native dimensions fit within the token budget, the original resolution is preserved without unnecessary downscaling or quality loss.
  - **High Resolution Videos (1080p / 4K)**: Automatically downscales video frames using high-quality bicubic interpolation to fit safely within the token allocation, printing informative status logs.
- **New `video_frame_size` Parameter**:
  - Added `video_frame_size` option to all Advanced nodes (`AILab_QwenVL_GGUF_Advanced` and `AILab_QwenVL_Advanced`) supporting `"auto"`, `"384"`, `"448"`, `"512"`, `"768"`, and `"original"`.
  - Standard/Basic nodes automatically apply intelligent auto-scaling for a seamless out-of-the-box experience.

### 📦 Unified & Simplified Custom Models Architecture (`custom_models.json`)
- **Streamlined 2-Section Design**: Consolidated model configuration into two clean sections:
  - `hf_models`: All HuggingFace / Transformers models (used by both VL and text nodes).
  - `gguf_models`: All GGUF models (used by vision nodes with `mmproj_file`, and text nodes like Prompt Enhancer which safely ignores `mmproj_file`).
- **Full GGUF Custom Catalog Support**:
  - `AILab_QwenVL_GGUF` and `AILab_QwenVL_GGUF_Advanced` dynamically load custom vision GGUF models (`gguf_models`).
  - `AILab_QwenVL_GGUF_PromptEnhancer` dynamically loads custom text GGUF models (`gguf_models`).
- **Backward Compatibility**: Fully preserves backward compatibility for legacy split sections (`hf_vl_models`, `hf_text_models`, `gguf_vl_models`, `gguf_text_models`, `qwenVL_model`, `Qwen_model`).
- **Updated Documentation**: Added detailed guides in [`docs/custom_models.md`](./docs/custom_models.md) and [`custom_models_example.json`](./custom_models_example.json).

### 📥 Enhanced HuggingFace Downloader (`AILab_HuggingFaceDownloader`)
<img width="614" alt="image" src="https://github.com/user-attachments/assets/7857b525-9dd9-4b7e-9425-f9c1aa7bccf2" />

- **Fixed Standalone Execution**: Added `OUTPUT_NODE = True` so the downloader runs independently in workflows without triggering `[WARNING] invalid prompt: {'type': 'prompt_no_outputs'}`.
- **Smart `mmproj` Auto-Discovery & Download**:
  - Automatically queries the HuggingFace repository to identify and download matching `mmproj*.gguf` visual projector files (prioritizing `F16`/`BF16`).
  - Added optional `mmproj_filename` input for users who want to specify a custom/specific projector file.
- **Smart Auto-Routing (`save_folder: "auto"`)**:
  - `save_folder` now defaults to `"auto"`. The downloader automatically inspects the model type and routes GGUF models directly to `models/LLM/GGUF/{author}/{repo_name}/` and Transformers models to `models/LLM/hf/{author}/{repo_name}/`, preventing manual folder misconfiguration.
- **Clean UI with `model_info` Output**:
  - Exposes `model_info` output pin (`RETURN_TYPES = ("STRING",)`) allowing downstream workflows to capture the summary text if desired.
  - Automatically renders a rich, color-coded HTML status card directly inside the node's UI (`web/js/downloader.js`) featuring bold titles, colored labels, status badges, syntax-highlighted registration JSON, dynamic auto-expansion on execution, and responsive flexbox resizing.

### 🔌 Modular Inference Engine & CLI (`qwenvl_engine.py` & `qwenvl_cli.py`)
- **Cross-Plugin Ecosystem Support**: Exposes `is_qwenvl_available()`, `run_qwenvl_vision()`, and `run_qwenvl_text()` for seamless zero-friction integration with external scripts and custom node packages.
- **Standalone CLI**: Added `qwenvl_cli.py` for direct command-line inference and status inspection.

### 🛠️ Codebase Optimization & Centralized Media Utilities (`AILab_Utils.py`)
- **Shared Vision & Video Utilities**: Consolidated tensor-to-PIL conversion, Base64 encoding, uniform video frame sampling, and dynamic budget estimation into a unified [`AILab_Utils.py`](./py/AILab_Utils.py) module.
- **Dynamic Input Validation**: Added dynamic `VALIDATE_INPUTS` across all nodes so newly added/downloaded models pass ComfyUI prompt validation without restart.
- **Cleaned Deprecations**: Removed deprecated fallback chains and legacy references to `custom_gguf_models.json`.

> **💡 Note for ComfyUI Users**: After downloading a new model, simply **refresh your browser (F5 / Ctrl+R)** to update the model dropdown lists in the UI!

---
# Release Notes: v2.2.0 (2026-08-20)

### 🌟 Qwen3.5, Qwen3.6 (MoE) & Qwen3.8 Native GGUF Support
- **Expanded Model Catalog**: Added direct support for Qwen3.5-VL-7B, Qwen3.6-VL-MoE, and Qwen3.8-VL-14B within the GGUF nodes.
- **Native Memory Management**: Implemented `comfy.model_management` to gracefully handle cache clearing (`soft_empty_cache` and `unload_all_models`) directly within the ComfyUI ecosystem, eliminating VRAM leaks when models are unloaded.
- **Simplified Installation Guide**: Updated `llama-cpp-python` dependency to `>=0.3.40` which natively supports all new vision chat handlers and MoE offloading without complex version matrices. Added clear console warnings pointing users to `docs/LLAMA_CPP_PYTHON_VISION_INSTALL.md` if the vision bindings are missing.
<img alt="image" src="https://github.com/user-attachments/assets/b257ad2e-b639-4b55-ac00-07a11955c187" />

### 🛠️ Feature Additions & Bug Fixes
- **VRAM Leak Fix (Issue #182)**: Fixed a critical issue where VRAM was not released after inference when `keep_model_loaded=False`. The GGUF nodes now explicitly call `self.llm.close()` to free the GGML C++ backend memory, and the Transformer nodes now properly clear `torch._dynamo` cache and force PyTorch garbage collection.
- **New HuggingFace Downloader Node**: Added `AILab_HuggingFaceDownloader` to allow users to directly download GGUF/HF models or entire repositories from HuggingFace directly into ComfyUI's model directories.
- **Prompt Enhancer Fix (PR #179)**: Fixed a critical bug in `AILab_QwenVL_PromptEnhancer` (Transformers) where instruct models (like Qwen3-4B) would ignore system instructions and act as text-continuations. The node now correctly applies the tokenizer's chat template (`apply_chat_template`).
- **GGUF Prompt Enhancer Optimization**: Removed hardcoded `"chat_format": "qwen"` in `AILab_QwenVL_GGUF_PromptEnhancer.py`. The node now dynamically reads the native chat template embedded directly within the GGUF file (e.g., ChatML for Qwen3), ensuring perfect special-token formatting for newer architectures.

---
# Release Notes: v2.1.1 (2026-02-08)
- Fixed Transformers compatibility: works on both **Transformers 4.x** and **5.x** (thanks to **Sepolian** for identifying the issue and sharing the fix in [PR #130](https://github.com/1038lab/ComfyUI-QwenVL/pull/130); we adjusted the implementation to keep it compatible across both versions).

# Release Notes: v2.1.0 (2026-02-05)

### 🚀 SageAttention Support

Introducing **SageAttention** - A high-performance attention mechanism with GPU-optimized kernels for maximum inference speed.

- **Per-GPU Architecture Optimization**: Automatically selects the best kernel for your GPU:
  - **SM120 (Blackwell)**: FP8 kernels for RTX 50-series
  - **SM90 (Hopper)**: Optimized FP8 kernels for H100
  - **SM89 (Ada)**: FP8 kernels for RTX 40-series
  - **SM80+ (Ampere)**: FP16 kernels for RTX 30-series and A100

- **Smart Attention Selection**: The new "auto" mode now tries Sage → Flash → SDPA in order of performance
- **Easy Installation**: Simply `pip install sageattention` to enable

### 🎯 Improved FP8 Model Handling

- **Automatic SDPA Fallback**: FP8 models now automatically use SDPA regardless of attention mode selection
- **Better Memory Management**: Improved cache clearing when switching between FP8 and regular models
- **Meta Tensor Fix**: Resolved "Cannot copy out of meta tensor" errors when loading FP8 models

### 📊 Progress Bar

Added ComfyUI-native progress bar for better visibility during:
- Model loading stages
- Generation progress
- Clear visual feedback on current operation

### 🧠 Intelligent Cache Management

- **Automatic VRAM Clearing**: When changing attention modes, quantization, or model configurations
- **Signature-Based Reloading**: Smart detection of configuration changes ensures proper model reloading
- **Memory Optimization**: Better handling of model unloading to prevent VRAM leaks

### ⚙️ Attention Mode Updates

| Mode | Behavior |
|------|----------|
| **auto** | Tries Sage → Flash → SDPA (best performance) |
| **sage** | Forces SageAttention (requires `pip install sageattention`) |
| **flash_attention_2** | Forces Flash Attention 2 |
| **sdpa** | PyTorch SDPA (default, always works) |

**Note**: FP8 models and BitsAndBytes quantization automatically use SDPA.

### 🔧 Technical Improvements

- **Qwen3-VL Support**: SageAttention now properly patches Qwen3VLTextAttention layers
- **Better Error Handling**: Clearer messages when attention modes fail to load
- **Device Support**: Improved handling for CUDA, MPS, and CPU devices with FP8 models

---

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

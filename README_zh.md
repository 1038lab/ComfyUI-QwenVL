# **QwenVL for ComfyUI**

ComfyUI-QwenVL 是一款自定义节点，它集成了来自阿里云的强大 Qwen-VL 系列视觉语言模型（LVLMs），包括最新的 Qwen3-VL 和 Qwen2.5-VL。这款高级节点能够在您的 ComfyUI 工作流中实现无缝的多模态 AI 功能，支持高效的文本生成、图像理解和视频分析。

![QwenVL_V1.1.0](https://github.com/user-attachments/assets/13e89746-a04e-41a3-9026-7079b29e149c)

## **📰 新闻与更新**

* **2025/10/17**: **v1.0.0** 初始版本发布
[![QwenVL_V1.0.0r](https://github.com/1038lab/ComfyUI-QwenVL/blob/main/example_workflows/QWenVL.jpg)](https://github.com/1038lab/ComfyUI-QwenVL/blob/main/example_workflows/QWenVL.json)
  * 支持 Qwen3-VL 和 Qwen2.5-VL 系列模型。  
  * 自动从 Hugging Face 下载模型。  
  * 支持即时量化（4-bit、8-bit、FP16）。  
  * 提供预设和自定义提示词系统，使用灵活方便。  
  * **包含**一个标准节点和一个高级**节点**，满足不同层次用户的需求。  
  * 具备硬件感知保护机制，以兼容 FP8 模型。  
  * 支持图像和视频（帧序列）输入。  
  * 提供“保持模型加载”选项，以提高连续运行的性能。  
  * **包含种子（Seed）参数**，用于生成可复现的结果。

## **✨ 功能特性**

* **标准与高级节点**：包含一个用于快速上手的简单 QwenVL 节点，以及一个提供精细生成控制的 QwenVL (Advanced) 节点。  
* **预设与自定义提示词**：可从一系列便捷的预设提示词中选择，或自行编写以实现完全控制。  
* **多模型支持**：轻松在各种官方 Qwen-VL 模型之间切换。  
* **自动模型下载**：首次使用时会自动下载所需模型。  
* **智能量化**：通过 4-bit、8-bit 和 FP16 选项，平衡显存占用与性能。  
* **硬件感知**：自动检测 GPU 能力，并防止因模型不兼容（例如 FP8）而导致的错误。  
* **可复现生成**：使用 seed 参数可获得一致的输出结果。  
* **内存管理**：“保持模型加载”选项可将模型保留在显存中，以加快处理速度。  
* **图像与视频支持**：接受单个图像和视频帧序列作为输入。  
* **强大的错误处理**：为硬件或内存问题提供清晰的错误信息。  
* **简洁的控制台输出**：在操作过程中提供最少且信息丰富的控制台日志。
* **新增 attention_mode 参数，支持自动启用 Flash-Attention v2 加速。
* **新增 use_torch_compile 参数，在 Torch 2.1+ 上可启用 JIT 优化，提高推理吞吐。
* **新增 device 参数，支持在 CUDA、CPU 与 Apple MPS 之间手动切换。
* **改进显存检测逻辑，可在内存不足时自动降低量化等级。

## **🚀 安装**

1. 将此仓库克隆到您的 ComfyUI/custom\_nodes 目录：  
```
   cd ComfyUI/custom\_nodes  
   git clone https://github.com/1038lab/ComfyUI-QwenVL.git\
```
2. 安装所需的依赖项：  
```
   cd ComfyUI/custom\_nodes/ComfyUI-QwenVL  
   pip install \-r requirements.txt
```
3. 重启 ComfyUI。

## **📥 下载模型**

模型将在首次使用时自动下载。如果您希望手动下载，请将它们放置在 ComfyUI/models/LLM/Qwen-VL/ 目录下。

| 模型 | 链接 |
| :---- | :---- |
| Qwen3-VL-2B-Instruct | [下载](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct) |
| Qwen3-VL-2B-Thinking | [下载](https://huggingface.co/Qwen/Qwen3-VL-2B-Thinking) |
| Qwen3-VL-2B-Instruct-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct-FP8) |
| Qwen3-VL-2B-Thinking-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-2B-Thinking-FP8) |
| Qwen3-VL-4B-Instruct | [下载](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct) |
| Qwen3-VL-4B-Thinking | [下载](https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking) |
| Qwen3-VL-4B-Instruct-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-FP8) |
| Qwen3-VL-4B-Thinking-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking-FP8) |
| Qwen3-VL-8B-Instruct | [下载](https://huggingface.co/Qwen/Qwen3-VL-8B-
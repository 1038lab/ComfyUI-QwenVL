# **QwenVL for ComfyUI**

ComfyUI-QwenVL 是一款自定义节点，它集成了来自阿里云的强大 Qwen-VL 系列视觉语言模型（LVLMs），包括最新的 Qwen3-VL 和 Qwen2.5-VL。这款高级节点能够在您的 ComfyUI 工作流中实现无缝的多模态 AI 功能，支持高效的文本生成、图像理解和视频分析。

![QwenVL_V1.1.0](https://github.com/user-attachments/assets/13e89746-a04e-41a3-9026-7079b29e149c)

## **📰 新闻与更新**

* **2025/02/05**: **v2.1.0** 新增 SageAttention 支持，优化 FP8 模型处理，改进注意力模式选择 [[更新](https://github.com/1038lab/ComfyUI-QwenVL/blob/main/update.md#version-210-20250205)]
  * **SageAttention 支持**: 新增 GPU 架构优化内核（SM80、SM89、SM90、SM120）
  * **改进 FP8 处理**: 更好的预量化 FP8 模型支持，自动回退到 SDPA
  * **智能注意力选择**: 自动模式现在尝试 Sage → Flash → SDPA 以获得最佳性能
  * **进度条**: 新增 ComfyUI 进度条显示模型加载和生成阶段
  * **更好的内存管理**: 改进切换注意力模式或量化设置时的缓存清理
* **2025/12/22**: **v2.0.0** 新增 GGUF 支持节点和提示词增强器节点 [[更新](https://github.com/1038lab/ComfyUI-QwenVL/blob/main/update.md#version-200-20251222)]
  * **GGUF 节点**: 支持 llama.cpp 后端的 GGUF 格式模型
  * **提示词增强器**: 专用的文本提示词优化节点
* **2025/11/10**: **v1.1.0** 运行时重构，新增注意力模式选择器、Flash-Attention 自动检测、更智能的缓存机制 [[更新](https://github.com/1038lab/ComfyUI-QwenVL/blob/main/update.md#version-110-20251110)]
* **2025/10/31**: **v1.0.4** 支持自定义模型 [[更新](https://github.com/1038lab/ComfyUI-QwenVL/blob/main/update.md#version-104-20251031)]
* **2025/10/22**: **v1.0.3** 更新模型列表 [[更新](https://github.com/1038lab/ComfyUI-QwenVL/blob/main/update.md#version-103-20251022)]
* **2025/10/17**: **v1.0.0** 初始版本发布
  * 支持 Qwen3-VL 和 Qwen2.5-VL 系列模型。
  * 自动从 Hugging Face 下载模型。
  * 支持即时量化（4-bit、8-bit、FP16）。
  * 提供预设和自定义提示词系统，使用灵活方便。
  * **包含**一个标准节点和一个高级**节点**，满足不同层次用户的需求。
  * 具备硬件感知保护机制，以兼容 FP8 模型。
  * 支持图像和视频（帧序列）输入。
  * 提供"保持模型加载"选项，以提高连续运行的性能。
  * **包含种子（Seed）参数**，用于生成可复现的结果。

## **✨ 功能特性**

* **标准与高级节点**：包含一个用于快速上手的简单 QwenVL 节点，以及一个提供精细生成控制的 QwenVL (Advanced) 节点。
* **提示词增强器**：专用的文本提示词优化节点，支持 HF 和 GGUF 后端。
* **预设与自定义提示词**：可从一系列便捷的预设提示词中选择，或自行编写以实现完全控制。
* **多模型支持**：轻松在各种官方 Qwen-VL 模型之间切换。
* **自动模型下载**：首次使用时会自动下载所需模型。
* **智能量化**：通过 4-bit、8-bit 和 FP16 选项，平衡显存占用与性能。
* **硬件感知**：自动检测 GPU 能力，并防止因模型不兼容（例如 FP8）而导致的错误。
* **可复现生成**：使用 seed 参数可获得一致的输出结果。
* **内存管理**："保持模型加载"选项可将模型保留在显存中，以加快处理速度。
* **图像与视频支持**：接受单个图像和视频帧序列作为输入。
* **强大的错误处理**：为硬件或内存问题提供清晰的错误信息。
* **简洁的控制台输出**：在操作过程中提供最少且信息丰富的控制台日志。
* **SageAttention 支持**：GPU 优化的注意力机制，支持多种 GPU 架构（Ampere、Ada、Hopper、Blackwell）。
* **进度条**：模型加载和生成阶段提供可视化反馈。
* **智能缓存管理**：切换注意力模式或量化设置时自动清理显存。

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

### **可选：SageAttention 支持**
为在支持的 GPU 上获得最佳性能，请安装 SageAttention：
```
pip install sageattention
```

## **🧭 节点概览**

### **Transformers (HF) 节点**
- **QwenVL**: 快速视觉语言推理（图像/视频 + 预设/自定义提示词）。
- **QwenVL (Advanced)**: 完全控制采样、设备和性能设置。
- **QwenVL Prompt Enhancer**: 纯文本提示词增强（支持 Qwen3 文本模型和文本模式下的 QwenVL 模型）。

### **GGUF (llama.cpp) 节点**
- **QwenVL (GGUF)**: GGUF 视觉语言推理。
- **QwenVL (GGUF Advanced)**: 扩展 GGUF 控制（上下文、GPU 层等）。
- **QwenVL Prompt Enhancer (GGUF)**: GGUF 纯文本提示词增强。

## **🧩 GGUF 节点（llama.cpp 后端）**

本仓库包含由 `llama-cpp-python` 驱动的 **GGUF** 节点（与基于 Transformers 的节点分开）。

- **节点**: `QwenVL (GGUF)`、`QwenVL (GGUF Advanced)`、`QwenVL Prompt Enhancer (GGUF)`
- **模型文件夹**（默认）: `ComfyUI/models/llm/GGUF/`（可通过 `gguf_models.json` 配置）
- **视觉要求**: 安装支持视觉的 `llama-cpp-python` wheel，提供 `Qwen3VLChatHandler` / `Qwen25VLChatHandler`
  参见 [docs/LLAMA_CPP_PYTHON_VISION_INSTALL.md](docs/LLAMA_CPP_PYTHON_VISION_INSTALL.md)

## **🗂️ 配置文件**

- **HF 模型**: `hf_models.json`
  - `hf_vl_models`: 视觉语言模型（由 QwenVL 节点使用）。
  - `hf_text_models`: 纯文本模型（由提示词增强器使用）。
- **GGUF 模型**: `gguf_models.json`
- **系统提示词**: `AILab_System_Prompts.json`（包含 VL 提示词和提示词增强器样式）。

## **📥 下载模型**

模型将在首次使用时自动下载。如果您希望手动下载，请将它们放置在 ComfyUI/models/LLM/Qwen-VL/ 目录下。

### **HF 视觉模型（Qwen-VL）**
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
| Qwen3-VL-8B-Instruct | [下载](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct) |
| Qwen3-VL-8B-Thinking | [下载](https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking) |
| Qwen3-VL-8B-Instruct-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-FP8) |
| Qwen3-VL-8B-Thinking-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking-FP8) |
| Qwen3-VL-32B-Instruct | [下载](https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct) |
| Qwen3-VL-32B-Thinking | [下载](https://huggingface.co/Qwen/Qwen3-VL-32B-Thinking) |
| Qwen3-VL-32B-Instruct-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct-FP8) |
| Qwen3-VL-32B-Thinking-FP8 | [下载](https://huggingface.co/Qwen/Qwen3-VL-32B-Thinking-FP8) |
| Qwen2.5-VL-3B-Instruct | [下载](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct) |
| Qwen2.5-VL-7B-Instruct | [下载](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct) |

### **HF 文本模型（Qwen3）**
| 模型 | 链接 |
| :---- | :---- |
| Qwen3-0.6B | [下载](https://huggingface.co/Qwen/Qwen3-0.6B) |
| Qwen3-4B-Instruct-2507 | [下载](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507) |
| qwen3-4b-Z-Image-Engineer | [下载](https://huggingface.co/BennyDaBall/qwen3-4b-Z-Image-Engineer) |

### **GGUF 模型（手动下载）**
| 分组 | 模型 | 仓库 | 备用仓库 | 模型文件 | MMProj |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Qwen 文本 (GGUF) | Qwen3-4B-GGUF | [Qwen/Qwen3-4B-GGUF](https://huggingface.co/Qwen/Qwen3-4B-GGUF) |  | Qwen3-4B-Q4_K_M.gguf, Qwen3-4B-Q5_0.gguf, Qwen3-4B-Q5_K_M.gguf, Qwen3-4B-Q6_K.gguf, Qwen3-4B-Q8_0.gguf |  |
| Qwen-VL (GGUF) | Qwen3-VL-4B-Instruct-GGUF | [Qwen/Qwen3-VL-4B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF) |  | Qwen3VL-4B-Instruct-F16.gguf, Qwen3VL-4B-Instruct-Q4_K_M.gguf, Qwen3VL-4B-Instruct-Q8_0.gguf | mmproj-Qwen3VL-4B-Instruct-F16.gguf |
| Qwen-VL (GGUF) | Qwen3-VL-8B-Instruct-GGUF | [Qwen/Qwen3-VL-8B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-GGUF) |  | Qwen3VL-8B-Instruct-F16.gguf, Qwen3VL-8B-Instruct-Q4_K_M.gguf, Qwen3VL-8B-Instruct-Q8_0.gguf | mmproj-Qwen3VL-8B-Instruct-F16.gguf |
| Qwen-VL (GGUF) | Qwen3-VL-4B-Thinking-GGUF | [Qwen/Qwen3-VL-4B-Thinking-GGUF](https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking-GGUF) |  | Qwen3VL-4B-Thinking-F16.gguf, Qwen3VL-4B-Thinking-Q4_K_M.gguf, Qwen3VL-4B-Thinking-Q8_0.gguf | mmproj-Qwen3VL-4B-Thinking-F16.gguf |
| Qwen-VL (GGUF) | Qwen3-VL-8B-Thinking-GGUF | [Qwen/Qwen3-VL-8B-Thinking-GGUF](https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking-GGUF) |  | Qwen3VL-8B-Thinking-F16.gguf, Qwen3VL-8B-Thinking-Q4_K_M.gguf, Qwen3VL-8B-Thinking-Q8_0.gguf | mmproj-Qwen3VL-8B-Thinking-F16.gguf |

## **📖 使用方法**

### **基本用法**

1. 从 🧪AILab/QwenVL 类别中添加 **"QwenVL"** 节点。
2. 选择您希望使用的 **model\_name**（模型名称）。
3. 连接一个图像或视频（图像序列）源到该节点。
4. 使用预设或自定义字段编写您的提示词。
5. 运行工作流。

### **高级用法**

如需更多控制，请使用 **"QwenVL (Advanced)"** 节点。这使您可以访问详细的生成参数，如温度、top\_p、束搜索和设备选择。

## **⚙️ 参数详解**

| 参数 | 描述 | 默认值 | 范围 | 适用节点 |
| :---- | :---- | :---- | :---- | :---- |
| **model\_name** | 要使用的 Qwen-VL 模型。 | Qwen3-VL-4B-Instruct | - | 标准 & 高级 |
| **quantization** | 即时量化级别。对于预量化模型（如 FP8）将被忽略。 | 8-bit (Balanced) | 4-bit、8-bit、None | 标准 & 高级 |
| **attention\_mode** | 注意力机制：auto（Sage→Flash→SDPA）、sage、flash\_attention\_2、sdpa | auto | auto、sage、flash\_attention\_2、sdpa | 标准 & 高级 |
| **preset\_prompt** | 为常见任务预定义的一系列提示词。 | "Describe this..." | 任意文本 | 标准 & 高级 |
| **custom\_prompt** | 自定义文本提示词。如果提供，将覆盖预设提示词。 |  | 任意文本 | 标准 & 高级 |
| **max\_tokens** | 要生成的最大新词元（token）数量。 | 1024 | 64-2048 | 标准 & 高级 |
| **keep\_model\_loaded** | 将模型保留在显存中，以便后续运行更快。 | True | True/False | 标准 & 高级 |
| **seed** | 随机种子，用于确保生成结果的可复现性。 | 1 | 1 - 2^64-1 | 标准 & 高级 |
| **temperature** | 控制随机性。值越高 = 更具创造性。（当 num\_beams 为 1 时使用）。 | 0.6 | 0.1-1.0 | 仅高级 |
| **top\_p** | 核心采样阈值。（当 num\_beams 为 1 时使用）。 | 0.9 | 0.0-1.0 | 仅高级 |
| **num\_beams** | 用于束搜索（beam search）的光束数量。> 1 时将禁用 temperature/top\_p 采样。 | 1 | 1-10 | 仅高级 |
| **repetition\_penalty** | 抑制重复词元的惩罚系数。1.0 表示中性。 | 1.2 | 0.0-2.0 | 仅高级 |
| **frame\_count** | 从视频输入中采样的帧数。 | 16 | 1-64 | 仅高级 |
| **device** | 覆盖自动设备选择。 | auto | auto、cuda、cpu | 仅高级 |
| **use\_torch\_compile** | 启用 torch.compile 优化以加快推理速度。 | False | True/False | 仅高级 |

### **💡 量化选项**

| 模式 | 精度 | 显存占用 | 速度 | 质量 | 推荐适用场景 |
| :---- | :---- | :---- | :---- | :---- | :---- |
| None (FP16) | 16位浮点 | 高 | 最快 | 最佳 | 高显存 GPU (16GB+) |
| 8-bit (Balanced) | 8位整数 | 中 | 较快 | 很好 | 追求均衡性能 (8GB+) |
| 4-bit (VRAM-friendly) | 4位整数 | 低 | 较慢* | 好 | 低显存 GPU (<8GB) |

**\*关于 4-bit 速度的说明**：4-bit 量化能显著减少显存使用，但由于实时反量化的计算开销，在某些系统上可能会导致性能下降。

### **🎯 注意力模式指南**

| 模式 | 描述 | 适用场景 |
| :---- | :---- | :---- |
| **auto** | 自动选择最佳可用：Sage → Flash → SDPA | 大多数用户（推荐） |
| **sage** | SageAttention，GPU 优化内核 | 现代 GPU 上的速度（RTX 40 系列、Hopper、Blackwell） |
| **flash\_attention\_2** | Flash Attention 2 | Sage 不可用时使用 |
| **sdpa** | PyTorch SDPA（默认） | 兼容性，FP8/BitsAndBytes 模型 |

**注意**：FP8 模型和 BitsAndBytes 量化无论选择什么都会自动使用 SDPA。

### **🤔 设置技巧**

| 设置 | 建议 |
| :---- | :---- |
| **模型选择** | 对于大多数用户，Qwen3-VL-4B-Instruct 是一个很好的起点。如果您有 40 系 GPU，可以尝试 -FP8 版本以获得更好的性能。 |
| **内存模式** | 如果您计划多次运行该节点，请保持 keep\_model\_loaded 启用（True）以获得最佳性能。仅在其他节点需要更多显存时才禁用它。 |
| **量化** | 从默认的 8-bit 开始。如果您的显存充裕（>16GB），切换到 None (FP16) 以获得最佳速度和质量。如果显存不足，请使用 4-bit。 |
| **注意力模式** | 使用 "auto" 获得最佳性能。SageAttention 在支持的 GPU 上提供最快的推理。 |
| **性能** | 首次加载具有特定量化设置的模型时可能会较慢。后续的运行（在启用 keep\_model\_loaded 的情况下）会快得多。 |

## **🧠 关于模型**

此节点利用了由阿里云 Qwen 团队开发的 Qwen-VL 系列模型。这些是功能强大的开源大型视觉语言模型（LVLMs），旨在理解和处理视觉及文本信息，非常适合用于详细的图像和视频描述等任务。

## **🗺️ 路线图**

### **✅ 已完成 (v2.1.0)**

* ✅ SageAttention 支持，GPU 架构优化
* ✅ 改进 FP8 模型处理，自动 SDPA 回退
* ✅ 智能注意力选择（auto: Sage → Flash → SDPA）
* ✅ 模型加载和生成的进度条
* ✅ 更好的内存管理和缓存清理

### **✅ 已完成 (v2.0.0)**

* ✅ 通过 llama.cpp 后端支持 GGUF 模型
* ✅ 用于纯文本优化的提示词增强器节点

### **✅ 已完成 (v1.0.0)**

* ✅ 支持 Qwen3-VL 和 Qwen2.5-VL 模型。
* ✅ 自动模型下载和管理。
* ✅ 即时 4-bit、8-bit 和 FP16 量化。
* ✅ 针对 FP8 模型的硬件兼容性检查。
* ✅ 支持图像和视频（帧序列）输入。

## **🙏 致谢**

* **Qwen 团队**：[阿里云](https://github.com/QwenLM) - 感谢其开发并开源了强大的 Qwen-VL 模型。
* **ComfyUI**：[comfyanonymous](https://github.com/comfyanonymous/ComfyUI) - 感谢其创造了如此出色且可扩展的 ComfyUI 平台。
* **llama-cpp-python**：[JamePeng/llama-cpp-python](https://github.com/JamePeng/llama-cpp-python) - GGUF 后端视觉支持。
* **SageAttention**：[SageAttention](https://github.com/thu-ml/SageAttention) - 高效的注意力实现，GPU 优化内核。
* **ComfyUI 集成**：[1038lab](https://github.com/1038lab) - 本自定义节点的开发者。

## **📜 许可证**

此仓库的代码根据 [GPL-3.0 许可证](LICENSE) 发布。

# Install `llama-cpp-python` (Vision / Qwen-VL GGUF)

This plugin’s **QwenVL (GGUF)** vision nodes require a `llama-cpp-python` build that includes multimodal chat handlers such as:

- `Qwen3VLChatHandler`
- `Qwen25VLChatHandler`

The upstream `llama-cpp-python` from PyPI often does **not** include these vision handlers. Use a fork/build that provides them (e.g. JamePeng’s fork) and install a **Release wheel**.

Release wheels (download `.whl` here):

- [https://github.com/JamePeng/llama-cpp-python/releases](https://github.com/JamePeng/llama-cpp-python/releases/)

## 0) The Qwen 3 Update Challenge

**CRITICAL:** Standard versions of `llama-cpp-python` often fail to load newer Qwen3 variants properly because they lack the latest C++ vision handlers. 

**The Golden Rule:**
To support ALL Qwen3 versions without crashing, you need a version with Qwen3 handlers. The official `llama-cpp-python` (0.3.35) does NOT have these handlers yet. You MUST install **JamePeng's fork** (or wait for the official repo to merge these features in a future release).

> [!WARNING]
> **Important Note:** You **MUST** install it via a pre-release wheel from JamePeng's repository (Step 6) or compile it directly from JamePeng's GitHub source (Step 8). Standard `pip install llama-cpp-python` will fail to provide vision support!

If you see this error:
`[QwenVL ERROR] Missing Qwen3VLChatHandler!`
It means your installed library does not have the vision bindings compiled in, or your version is too old.

> [!IMPORTANT]
> **Path Variables:** Throughout this guide, you will see `path\to\ComfyUI`. You MUST replace this with the actual folder path where your ComfyUI is installed (for example, `O:\ComfyUI` or `C:\Users\Name\Desktop\ComfyUI`).

## 1) How to Check Your Current Version

Before upgrading, check what version you currently have installed. Open your command prompt and run this in your ComfyUI python environment (e.g., Windows Portable):

```bat
path\to\ComfyUI\python_embeded\python.exe -m pip show llama-cpp-python
```

Look for the `Version: ...` line in the output. If it does not have vision support (e.g. standard `0.3.35` from PyPI), you need to upgrade to JamePeng's fork.

## 2) How to Safely Upgrade / Uninstall (Crucial Step)

Do **NOT** just run pip install over an existing broken installation. It often leaves conflicting `.pyd` or `.dll` files behind. You must safely uninstall it and clear your pip cache first:

```bat
:: 1. Uninstall the old version
path\to\ComfyUI\python_embeded\python.exe -m pip uninstall llama-cpp-python -y

:: 2. Clear the pip cache to prevent it from re-using the old broken version
path\to\ComfyUI\python_embeded\python.exe -m pip cache purge
```

## 3) Close ComfyUI first

Stop ComfyUI before installing/replacing packages, especially on Windows portable.

## 4) Identify the exact Python ComfyUI uses

### Windows portable (common)

Your Python is usually:

`ComfyUI\\python_embeded\\python.exe`

Check:

```bat
path\to\ComfyUI\python_embeded\python.exe -V
path\to\ComfyUI\python_embeded\python.exe -c "import sys; print(sys.executable)"
```

### venv / conda

Activate your env, then:

```bash
python -V
python -c "import sys; print(sys.executable)"
```

## 5) Backup your environment (recommended)

```bat
path\to\ComfyUI\python_embeded\python.exe -m pip freeze > path\to\ComfyUI\requirements-backup.txt
```

## 6) Install the Release wheel (recommended)

Download a **Release `.whl`** from:
[https://github.com/JamePeng/llama-cpp-python/releases/](https://github.com/JamePeng/llama-cpp-python/releases/)

The wheel **must match ALL of the following**:

* **Python version** used by ComfyUI
  (`cp310` / `cp311` / `cp312` / `cp313`)
* **Platform**
  `win_amd64` (Windows 64-bit)
* **Build type**

  * **CPU wheel** → safest option (no CUDA toolkit required)
  * **CUDA wheel (`cuXXX`)** → requires a compatible CUDA runtime / toolkit

> [!WARNING]
> **Windows note (important)**
> If you install a CUDA wheel, the CUDA build tag (e.g. `cu121`, `cu122`) must be compatible with your installed CUDA runtime/toolkit.

A mismatch can cause errors like **“cannot load ggml.dll” even though the file exists**.

If you are unsure, **use a CPU wheel**.

Install with force-reinstall (safer than manual uninstall):

```
path\to\ComfyUI\python_embeded\python.exe -m pip install --upgrade --force-reinstall C:\path\to\llama_cpp_python-*.whl
```

Notes:

* Warnings about leftover folders like `~umpy` are usually safe to ignore while ComfyUI is closed.
* Make sure ComfyUI is **fully stopped** before installing.

## 4) Verify vision handlers exist

```bat
path\to\ComfyUI\python_embeded\python.exe -c "from llama_cpp.llama_chat_format import Qwen3VLChatHandler, Qwen25VLChatHandler; print('handlers OK')"
```

If this fails, you installed a wheel that does not include vision support (or installed into the wrong Python environment).

## 7) Fix common dependency conflicts (Windows)

Some wheels may upgrade dependencies (notably `numpy` / `pillow`) and cause conflicts with other packages (like OpenCV).

### OpenCV conflict (recommended fix)

If you see errors like:

- `opencv-python ... requires numpy<2.3.0,>=2; ... but you have numpy 2.3.x`

Pin numpy back:

```bat
path\to\ComfyUI\python_embeded\python.exe -m pip install --upgrade "numpy<2.3"
```

### Pillow conflicts (optional)

If you don’t use packages that depend on an older Pillow, you can ignore Pillow warnings. Otherwise:

```bat
path\to\ComfyUI\python_embeded\python.exe -m pip install --upgrade "pillow<12"
```

## 8) Compiling from Source (If Wheels Fail)

If you cannot find a compatible wheel (e.g., you are on Linux, Mac, or a specific CUDA version), you must compile from source. This is where most users fail.

**Prerequisites:**
- Windows: Visual Studio C++ Build Tools installed.
- Linux: `gcc`, `g++`, `make`.
- CUDA Toolkit installed and matching your PyTorch version.

**The Compilation Command:**
You MUST include the `LLAMA_CPP_PYTHON_VISION=on` flag. Since the official repo lacks vision handlers, compile directly from JamePeng's GitHub source:

```bash
# Windows portable (PowerShell) - Make sure to use YOUR ComfyUI python path!
$env:CMAKE_ARGS="-DGGML_CUDA=on -DLLAMA_CPP_PYTHON_VISION=on"
path\to\ComfyUI\python_embeded\python.exe -m pip install git+https://github.com/JamePeng/llama-cpp-python.git --upgrade --force-reinstall --no-cache-dir

# venv / conda / Linux / Mac (after activating environment)
CMAKE_ARGS="-DGGML_CUDA=on -DLLAMA_CPP_PYTHON_VISION=on" python -m pip install git+https://github.com/JamePeng/llama-cpp-python.git --upgrade --force-reinstall --no-cache-dir
```

If compilation fails, verify that your `nvcc --version` matches the CUDA version expected by your compiler.

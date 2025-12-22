# Install `llama-cpp-python` (Vision / Qwen-VL GGUF)

This plugin’s **QwenVL (GGUF)** vision nodes require a `llama-cpp-python` build that includes multimodal chat handlers such as:

- `Qwen3VLChatHandler`
- `Qwen25VLChatHandler`

The upstream `llama-cpp-python` from PyPI often does **not** include these vision handlers. Use a fork/build that provides them (e.g. JamePeng’s fork) and install a **Release wheel**.

Release wheels (download `.whl` here):

- `https://github.com/JamePeng/llama-cpp-python/releases/`

## 0) Close ComfyUI first

Stop ComfyUI before installing/replacing packages, especially on Windows portable.

## 1) Identify the exact Python ComfyUI uses

### Windows portable (common)

Your Python is usually:

`ComfyUI\\python_embeded\\python.exe`

Check:

```bat
C:\AI\ComfyUI\python_embeded\python.exe -V
C:\AI\ComfyUI\python_embeded\python.exe -c "import sys; print(sys.executable)"
```

### venv / conda

Activate your env, then:

```bash
python -V
python -c "import sys; print(sys.executable)"
```

## 2) Backup your environment (recommended)

```bat
C:\AI\ComfyUI\python_embeded\python.exe -m pip freeze > C:\AI\ComfyUI\requirements-backup.txt
```

## 3) Install the Release wheel (recommended)

Pick a `.whl` that matches:

- Python version: `cp310` / `cp311` / `cp312` / `cp313` (must match ComfyUI Python)
- Platform: Windows `win_amd64`, etc.

Install with force reinstall (safer than manual uninstall):

```bat
C:\AI\ComfyUI\python_embeded\python.exe -m pip install --upgrade --force-reinstall C:\path\to\llama_cpp_python-*.whl
```

Notes:

- `pip` may print warnings about leftover temp folders like `~umpy` or `~-l` under `site-packages`. These are usually safe to ignore; you can delete them later when ComfyUI is closed.

## 4) Verify vision handlers exist

```bat
C:\AI\ComfyUI\python_embeded\python.exe -c "from llama_cpp.llama_chat_format import Qwen3VLChatHandler, Qwen25VLChatHandler; print('handlers OK')"
```

If this fails, you installed a wheel that does not include vision support (or installed into the wrong Python environment).

## 5) Fix common dependency conflicts (Windows)

Some wheels may upgrade dependencies (notably `numpy` / `pillow`) and cause conflicts with other packages (like OpenCV).

### OpenCV conflict (recommended fix)

If you see errors like:

- `opencv-python ... requires numpy<2.3.0,>=2; ... but you have numpy 2.3.x`

Pin numpy back:

```bat
C:\AI\ComfyUI\python_embeded\python.exe -m pip install --upgrade "numpy<2.3"
```

### Pillow conflicts (optional)

If you don’t use packages that depend on an older Pillow, you can ignore Pillow warnings. Otherwise:

```bat
C:\AI\ComfyUI\python_embeded\python.exe -m pip install --upgrade "pillow<12"
```


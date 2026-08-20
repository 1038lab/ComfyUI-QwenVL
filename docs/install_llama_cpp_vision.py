import sys
import os
import platform
import subprocess
import urllib.request
import json
import re

print("===================================================")
print("1-Click Llama-CPP-Python (Vision) Wheel Installer")
print("===================================================")

# 1. Detect Python Version
py_version = sys.version_info
py_tag = f"cp{py_version.major}{py_version.minor}"
print(f"[*] Detected Python: {py_tag}")

# 2. Detect OS
system = platform.system()
is_64bits = sys.maxsize > 2**32
if system == "Windows" and is_64bits:
    os_tag = "win_amd64"
elif system == "Linux" and is_64bits:
    os_tag = "linux_x86_64"
elif system == "Darwin" and platform.machine() == "arm64":
    os_tag = "macosx_11_0_arm64"
else:
    print(f"[ERROR] Unsupported OS/Arch: {system} {platform.machine()}")
    sys.exit(1)
print(f"[*] Detected OS: {os_tag}")

# 3. Detect CUDA (Optional, fallback to a sensible default or CPU)
cuda_tag = ""
try:
    import torch
    if torch.cuda.is_available():
        cuda_version = torch.version.cuda
        if cuda_version:
            cuda_tag = "cu" + cuda_version.replace(".", "")
            print(f"[*] Detected CUDA (from PyTorch): {cuda_version} -> {cuda_tag}")
except ImportError:
    pass

if not cuda_tag:
    print("[WARNING] Could not detect PyTorch CUDA version. Using CPU/Basic wheel by default.")
    print("If you want CUDA, please install the wheel manually from JamePeng's releases.")
    # For now, let's try to match a cu121 or cu124 if it's Windows, else we might just search for any matching wheel.
    cuda_tag = "cu121" # common comfyui default
    print(f"[*] Assuming CUDA {cuda_tag} for now.")

# 4. Fetch Releases from JamePeng
print("[*] Fetching latest releases from JamePeng/llama-cpp-python...")
url = "https://api.github.com/repos/JamePeng/llama-cpp-python/releases"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        releases = json.loads(response.read().decode())
except Exception as e:
    print(f"[ERROR] Failed to fetch releases: {e}")
    sys.exit(1)

# Find the latest release with wheels
target_url = None
for release in releases:
    for asset in release.get("assets", []):
        name = asset["name"]
        # Match python version and OS
        if py_tag in name and os_tag in name:
            if cuda_tag in name:
                target_url = asset["browser_download_url"]
                print(f"[*] Found perfect match: {name}")
                break
            elif not target_url:
                # Store a fallback in case we don't find the exact CUDA version
                target_url = asset["browser_download_url"]
    if target_url:
        break

if not target_url:
    print(f"[ERROR] Could not find a compatible wheel for {py_tag} {os_tag} {cuda_tag}.")
    print("Please check https://github.com/JamePeng/llama-cpp-python/releases")
    sys.exit(1)

print(f"\n[*] Selected Wheel URL:\n{target_url}\n")
print("[*] Installing via pip...")

print("\n[*] Installing required dependencies (safely)...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "diskcache>=5.6.2", "jinja2>=3.1.0"])

cmd = [sys.executable, "-m", "pip", "install", "--upgrade", "--force-reinstall", "--no-deps", "--no-cache-dir", target_url]
print(f"Running: {' '.join(cmd)}")
try:
    subprocess.check_call(cmd)
    print("\n[SUCCESS] Llama-CPP-Python Vision successfully installed!")
    
    # Verify
    print("[*] Verifying vision handlers...")
    subprocess.check_call([sys.executable, "-c", "from llama_cpp.llama_chat_format import Qwen3VLChatHandler; print('Success: Vision Handlers are OK!')"])
except subprocess.CalledProcessError as e:
    print(f"\n[ERROR] Installation or verification failed with error code: {e.returncode}")
    sys.exit(1)

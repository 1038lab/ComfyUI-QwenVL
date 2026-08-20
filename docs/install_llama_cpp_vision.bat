@echo off
setlocal
echo ===================================================
echo 1-Click Llama-CPP-Python (Vision) Installer/Updater
echo ===================================================

:: Try to find ComfyUI portable python (assuming script is in custom_nodes\ComfyUI-QwenVL\docs)
set "PYTHON_EXE=..\..\..\python_embeded\python.exe"
if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=..\..\..\..\python_embeded\python.exe"
)
if not exist "%PYTHON_EXE%" (
    echo [WARNING] Could not find ComfyUI python_embeded.
    echo Make sure you are running this from custom_nodes\ComfyUI-QwenVL.
    echo Falling back to system python...
    set "PYTHON_EXE=python"
)

echo Using Python: %PYTHON_EXE%
echo.

echo 1. Uninstalling any existing llama-cpp-python...
"%PYTHON_EXE%" -m pip uninstall llama-cpp-python -y

echo.
echo 2. Purging pip cache to prevent conflicts...
"%PYTHON_EXE%" -m pip cache purge

echo.
echo 3. Automatically downloading and installing the pre-built Wheel...
"%PYTHON_EXE%" "%~dp0install_llama_cpp_vision.py"

pause

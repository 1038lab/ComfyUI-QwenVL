#!/bin/bash
echo "==================================================="
echo "1-Click Llama-CPP-Python (Vision) Installer/Updater"
echo "==================================================="

# Try to find ComfyUI python env if it exists (assuming script is in custom_nodes/ComfyUI-QwenVL/docs)
PYTHON_CMD="python"
if [ -f "../../../python_embeded/bin/python" ]; then
    PYTHON_CMD="../../../python_embeded/bin/python"
elif [ -f "../../../../python_embeded/bin/python" ]; then
    PYTHON_CMD="../../../../python_embeded/bin/python"
fi

echo "Using Python: $PYTHON_CMD"
echo ""

echo "1. Uninstalling any existing llama-cpp-python..."
$PYTHON_CMD -m pip uninstall llama-cpp-python -y

echo ""
echo "2. Purging pip cache to prevent conflicts..."
$PYTHON_CMD -m pip cache purge

echo ""
echo "3. Automatically downloading and installing the pre-built Wheel..."
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
$PYTHON_CMD "$DIR/install_llama_cpp_vision.py"

import importlib
import pkgutil
import sys
from pathlib import Path

__repo_name__ = "ComfyUI-QwenVL"
__version__ = "2.3.0"

# Locate current and node directories
current_dir = Path(__file__).parent
nodes_dir = current_dir / "py"

# Ensure py/ directory has the highest import priority
if str(nodes_dir) not in sys.path:
    sys.path.insert(0, str(nodes_dir))
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))

# Legacy root files migrated into py/ in v2.3.0
LEGACY_ROOT_FILES = [
    "AILab_OutputCleaner.py",
    "AILab_QwenVL.py",
    "AILab_QwenVL_GGUF.py",
    "AILab_QwenVL_GGUF_PromptEnhancer.py",
    "AILab_QwenVL_PromptEnhancer.py",
    "AILab_System_Prompts.json",
]


def cleanup_legacy_files():
    """Automatically clean up obsolete root files left over by ComfyUI Manager / git updates."""
    old_prompts = current_dir / "AILab_System_Prompts.json"
    new_prompts = current_dir / "system_prompts.json"
    if old_prompts.exists() and not new_prompts.exists():
        try:
            old_prompts.rename(new_prompts)
        except Exception:
            pass

    for filename in LEGACY_ROOT_FILES:
        target = current_dir / filename
        if target.exists() and target.is_file():
            try:
                target.unlink()
            except Exception:
                pass


# Auto-cleanup legacy root files on initialization
cleanup_legacy_files()

# Initialize node mappings
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web"


def load_nodes():
    """Automatically discover and load node definitions from the py directory."""
    if not nodes_dir.exists():
        return

    for (_, module_name, _) in pkgutil.iter_modules([str(nodes_dir)]):
        if module_name.startswith("__"):
            continue
        try:
            rel_import = f".py.{module_name}" if __package__ else f"py.{module_name}"
            module = importlib.import_module(rel_import, package=__package__)
            if hasattr(module, "NODE_CLASS_MAPPINGS"):
                NODE_CLASS_MAPPINGS.update(module.NODE_CLASS_MAPPINGS)
            if hasattr(module, "NODE_DISPLAY_NAME_MAPPINGS"):
                NODE_DISPLAY_NAME_MAPPINGS.update(module.NODE_DISPLAY_NAME_MAPPINGS)
        except Exception as e:
            print(f"[{__repo_name__}] Error loading {module_name}: {e}")


# Load all nodes
load_nodes()

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

print(f'\033[36m[{__repo_name__}]\033[0m v'
      f'\033[93m{__version__}\033[0m | '
      f'\033[37m{len(NODE_CLASS_MAPPINGS)} nodes\033[0m '
      f'\033[92mLoaded\033[0m')

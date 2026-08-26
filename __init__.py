import importlib
import pkgutil
import sys
from pathlib import Path

__repo_name__ = "ComfyUI-QwenVL"
__version__ = "2.3.0"

# Locate current and node directories
current_dir = Path(__file__).parent
nodes_dir = current_dir / "py"

# Ensure directories are in sys.path
for path in [current_dir, nodes_dir]:
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

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

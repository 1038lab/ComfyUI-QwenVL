import importlib.util
import os
import sys

# Get the directory of the current script
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

def load_modules_from_directory(directory):
    for file in os.listdir(directory):
        if file.endswith(".py"):
            file_path = os.path.join(directory, file)
            module_name = os.path.basename(file)[:-3]
            if module_name == os.path.basename(__file__)[:-3]:
                continue

            try:
                spec = importlib.util.spec_from_file_location(module_name, file_path)
                module = importlib.util.module_from_spec(spec)
                sys.modules[module_name] = module
                spec.loader.exec_module(module)

                if hasattr(module, "NODE_CLASS_MAPPINGS"):
                    NODE_CLASS_MAPPINGS.update(module.NODE_CLASS_MAPPINGS)
                if hasattr(module, "NODE_DISPLAY_NAME_MAPPINGS"):
                    NODE_DISPLAY_NAME_MAPPINGS.update(module.NODE_DISPLAY_NAME_MAPPINGS)
            except Exception as e:
                print(f"Error loading module {module_name}: {e}")

load_modules_from_directory(current_dir)
NODE_CLASS_MAPPINGS = dict(sorted(NODE_CLASS_MAPPINGS.items(), key=lambda x: NODE_DISPLAY_NAME_MAPPINGS.get(x[0], x[0])))
NODE_DISPLAY_NAME_MAPPINGS = dict(sorted(NODE_DISPLAY_NAME_MAPPINGS.items(), key=lambda x: x[1]))

WEB_DIRECTORY = "./web"

def load_javascript(web_directory):
    return [
        {"path": "refreshNode.js"}
    ]

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY", "load_javascript"]
#!/usr/bin/env python3
"""
qwenvl_cli.py - Standalone Command-Line Interface for QwenVL Inference

Usage:
    python qwenvl_cli.py --list-models
    python qwenvl_cli.py --image "frame.png" --prompt "Describe the lighting and subject"
    python qwenvl_cli.py --text "a cyberpunk warrior" --system "Expand into cinematic video prompt"
"""

import argparse
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add py/ and project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from qwenvl_engine import QwenVLEngine, is_qwenvl_available


def main() -> None:
    parser = argparse.ArgumentParser(description="QwenVL GGUF Local CLI Inference Tool")
    parser.add_argument("--list-models", action="store_true", help="List all available models in the catalog")
    parser.add_argument("--status", action="store_true", help="Check engine readiness and environment")
    parser.add_argument("--image", type=str, default="", help="Path to input image file for multimodal vision analysis")
    parser.add_argument("--prompt", type=str, default="", help="Prompt / instruction text")
    parser.add_argument("--text", type=str, default="", help="Input text for text-only prompt expansion")
    parser.add_argument("--system", type=str, default="", help="Optional system prompt")
    parser.add_argument("--model", type=str, default="", help="Specific model name from the catalog")
    parser.add_argument("--max-tokens", type=int, default=1024, help="Max tokens to generate (default: 1024)")
    parser.add_argument("--temperature", type=float, default=0.6, help="Sampling temperature (default: 0.6)")
    parser.add_argument("--json", action="store_true", help="Output results in structured JSON format")

    args = parser.parse_args()

    if args.status:
        available = is_qwenvl_available()
        engine = QwenVLEngine()
        models = engine.get_available_models()
        status_info = {
            "engine_available": available,
            "models_count": len(models),
            "available_models": models,
        }
        if args.json:
            print(json.dumps(status_info, indent=2))
        else:
            print(f"✅ QwenVL Engine Ready: {available}")
            print(f"📦 Total Models in Catalog: {len(models)}")
            for m in models:
                print(f"   • {m}")
        return

    if args.list_models:
        engine = QwenVLEngine()
        models = engine.get_available_models()
        if args.json:
            print(json.dumps({"models": models}, indent=2))
        else:
            print("📋 Available QwenVL Models:")
            for m in models:
                print(f"  - {m}")
        return

    engine = QwenVLEngine()

    if args.image:
        img_path = Path(args.image)
        if not img_path.exists():
            print(f"❌ Error: Image file not found at {args.image}", file=sys.stderr)
            sys.exit(1)

        prompt_str = args.prompt or "Describe this image in detail for a video generation prompt."
        sys_prompt = args.system or "You are a professional cinematographer. Output only direct, accurate descriptions."

        output = engine.run_vision_analysis(
            image_input=img_path,
            prompt=prompt_str,
            model_name=args.model if args.model else None,
            max_tokens=args.max_tokens,
            temperature=args.temperature,
            system_prompt=sys_prompt,
        )

        if args.json:
            print(json.dumps({"status": "success", "image": str(img_path), "result": output}, indent=2))
        else:
            print(output)
        return

    if args.text or args.prompt:
        input_text = args.text or args.prompt
        sys_prompt = args.system or "You are a Hollywood prompt engineer. Expand the input into a high-density cinematic video prompt."

        output = engine.run_prompt_enhancement(
            prompt_text=input_text,
            system_prompt=sys_prompt,
            model_name=args.model if args.model else None,
            max_tokens=args.max_tokens,
            temperature=args.temperature,
        )

        if args.json:
            print(json.dumps({"status": "success", "input": input_text, "result": output}, indent=2))
        else:
            print(output)
        return

    parser.print_help()


if __name__ == "__main__":
    main()

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .mutator import MutationConfig, mutate_file
from .server import serve_ui
from .vital import (
    VitalMutationConfig,
    load_vital_preset,
    mutate_vital_preset,
    roundtrip_vital_preset,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="preset_mutator",
        description="Experimental preset mutation CLI.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    mutate_parser = subparsers.add_parser(
        "mutate",
        help="Create a mutated copy of a preset file.",
    )
    mutate_parser.add_argument("--input", required=True, type=Path, help="Source preset file")
    mutate_parser.add_argument("--output", required=True, type=Path, help="Output file path")
    mutate_parser.add_argument(
        "--rate",
        type=float,
        default=0.01,
        help="Fraction of bytes to mutate, from 0.0 to 1.0",
    )
    mutate_parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for reproducible mutation",
    )
    mutate_parser.add_argument(
        "--min-offset",
        type=int,
        default=0,
        help="Do not mutate bytes before this offset",
    )

    inspect_vital_parser = subparsers.add_parser(
        "inspect-vital",
        help="Inspect a Vital preset and print a compact summary.",
    )
    inspect_vital_parser.add_argument("--input", required=True, type=Path, help="Source .vital preset")

    roundtrip_vital_parser = subparsers.add_parser(
        "roundtrip-vital",
        help="Load and re-save a Vital preset, verifying the JSON structure is preserved.",
    )
    roundtrip_vital_parser.add_argument("--input", required=True, type=Path, help="Source .vital preset")
    roundtrip_vital_parser.add_argument("--output", required=True, type=Path, help="Output .vital preset")

    mutate_vital_parser = subparsers.add_parser(
        "mutate-vital",
        help="Generate a safely mutated Vital preset using semantic scalar parameter rules.",
    )
    mutate_vital_parser.add_argument("--input", required=True, type=Path, help="Source .vital preset")
    mutate_vital_parser.add_argument("--output", required=True, type=Path, help="Output .vital preset")
    mutate_vital_parser.add_argument(
        "--amount",
        type=float,
        default=0.18,
        help="Mutation intensity from 0.0 to 1.0",
    )
    mutate_vital_parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for reproducible mutation",
    )
    mutate_vital_parser.add_argument(
        "--max-parameters",
        type=int,
        default=18,
        help="Maximum number of safe scalar parameters to mutate",
    )

    serve_ui_parser = subparsers.add_parser(
        "serve-ui",
        help="Run the local web UI for browsing Vital seeds and generating variants.",
    )
    serve_ui_parser.add_argument("--host", default="127.0.0.1", help="Host to bind")
    serve_ui_parser.add_argument("--port", type=int, default=4173, help="Port to bind")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "mutate":
        config = MutationConfig(
            rate=args.rate,
            seed=args.seed,
            min_offset=args.min_offset,
        )
        summary = mutate_file(args.input, args.output, config)
        print(summary)
        return 0
    if args.command == "inspect-vital":
        preset = load_vital_preset(args.input)
        print(json.dumps(preset.summary().__dict__, indent=2))
        return 0
    if args.command == "roundtrip-vital":
        print(roundtrip_vital_preset(args.input, args.output))
        return 0
    if args.command == "mutate-vital":
        result = mutate_vital_preset(
            args.input,
            args.output,
            VitalMutationConfig(
                amount=args.amount,
                seed=args.seed,
                max_parameters=args.max_parameters,
            ),
        )
        print(
            json.dumps(
                {
                    "output": str(result.output_path),
                    "changed_parameters": result.changed_parameters,
                    "changed_count": len(result.changed_parameters),
                },
                indent=2,
            )
        )
        return 0
    if args.command == "serve-ui":
        serve_ui(host=args.host, port=args.port)
        return 0

    parser.error(f"Unknown command: {args.command}")
    return 2

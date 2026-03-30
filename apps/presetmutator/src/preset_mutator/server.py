from __future__ import annotations

from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from .vital import VitalMutationConfig, load_vital_preset, mutate_vital_preset


ROOT = Path(__file__).resolve().parents[2]
UI_DIR = ROOT / "ui"
VITAL_RAW_DIR = ROOT / "assets" / "seeds" / "vital" / "raw"
VITAL_OUTPUT_DIR = ROOT / "output" / "generated" / "vital"


def _json_response(handler: SimpleHTTPRequestHandler, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload, indent=2).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _vital_seed_payload(path: Path) -> dict[str, Any]:
    preset = load_vital_preset(path)
    data = preset.data
    summary = preset.summary(path.name)
    return {
        "file": path.name,
        "path": str(path.relative_to(ROOT)),
        "author": data.get("author"),
        "comments": data.get("comments"),
        "preset_style": data.get("preset_style"),
        "macros": [data.get("macro1"), data.get("macro2"), data.get("macro3"), data.get("macro4")],
        "summary": summary.__dict__,
    }


def list_vital_seeds() -> list[dict[str, Any]]:
    return [_vital_seed_payload(path) for path in sorted(VITAL_RAW_DIR.glob("*.vital"))]


def list_generated_vital() -> list[dict[str, Any]]:
    if not VITAL_OUTPUT_DIR.exists():
        return []

    items: list[dict[str, Any]] = []
    for path in sorted(VITAL_OUTPUT_DIR.glob("*.vital")):
        preset = load_vital_preset(path)
        items.append(
            {
                "file": path.name,
                "path": str(path.relative_to(ROOT)),
                "summary": preset.summary(path.name).__dict__,
            }
        )
    return items


def generate_vital_variant(seed_file: str, amount: float, max_parameters: int, seed: int | None) -> dict[str, Any]:
    input_path = VITAL_RAW_DIR / seed_file
    if not input_path.exists():
        raise FileNotFoundError(f"Vital seed not found: {seed_file}")

    preset_stub = input_path.stem.replace(" ", "-").lower()
    suffix = f"seed-{seed}" if seed is not None else "random"
    output_name = f"{preset_stub}-a{int(amount * 100):02d}-m{max_parameters}-{suffix}.vital"
    output_path = VITAL_OUTPUT_DIR / output_name

    if output_path.exists():
        output_path.unlink()

    result = mutate_vital_preset(
        input_path,
        output_path,
        VitalMutationConfig(amount=amount, max_parameters=max_parameters, seed=seed),
    )
    mutated = load_vital_preset(output_path)
    return {
        "file": output_path.name,
        "path": str(output_path.relative_to(ROOT)),
        "changed_parameters": result.changed_parameters,
        "summary": mutated.summary(output_path.name).__dict__,
    }


class PresetMutatorHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(UI_DIR), **kwargs)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/vital/seeds":
            _json_response(self, HTTPStatus.OK, {"items": list_vital_seeds()})
            return
        if parsed.path == "/api/vital/generated":
            _json_response(self, HTTPStatus.OK, {"items": list_generated_vital()})
            return
        if parsed.path == "/api/health":
            _json_response(self, HTTPStatus.OK, {"ok": True})
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/vital/mutate":
            _json_response(self, HTTPStatus.NOT_FOUND, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            result = generate_vital_variant(
                seed_file=str(payload["seed_file"]),
                amount=float(payload.get("amount", 0.18)),
                max_parameters=int(payload.get("max_parameters", 18)),
                seed=int(payload["seed"]) if payload.get("seed") not in (None, "") else None,
            )
        except Exception as exc:  # pragma: no cover - UI-facing error path
            _json_response(self, HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return

        _json_response(self, HTTPStatus.OK, result)

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return


def serve_ui(host: str = "127.0.0.1", port: int = 4173) -> None:
    VITAL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    httpd = ThreadingHTTPServer((host, port), PresetMutatorHandler)
    print(f"PresetMutator UI running at http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

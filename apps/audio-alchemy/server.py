from __future__ import annotations

from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
UI_DIR = ROOT / "ui"
OUTPUT_DIR = ROOT / "output" / "generated" / "vital"
PRESETMUTATOR_DIR = ROOT.parent / "presetmutator"
VITAL_SEED_DIR = PRESETMUTATOR_DIR / "assets" / "seeds" / "vital" / "raw"

SEED_BY_FAMILY = {
    "pad": "KS Frozen Hollow.vital",
    "pluck": "KS Dread Lantern.vital",
    "bass": "KS Iron Wake.vital",
    "texture": "KS Shadow Archive.vital",
}


def _json_response(handler: SimpleHTTPRequestHandler, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload, indent=2).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _sanitize_stub(value: str) -> str:
    stub = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return stub or "audio-alchemy-vital"


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _load_seed(family: str) -> dict[str, Any]:
    seed_name = SEED_BY_FAMILY.get(family, SEED_BY_FAMILY["texture"])
    seed_path = VITAL_SEED_DIR / seed_name
    return json.loads(seed_path.read_text())


def _apply_parameter_map(data: dict[str, Any], preset_name: str, summary: str, family: str, parameter_map: dict[str, Any]) -> dict[str, Any]:
    settings = data["settings"]

    for key, value in parameter_map.items():
        if key.startswith("_"):
            continue
        if isinstance(value, bool):
            settings[key] = 1.0 if value else 0.0
        elif isinstance(value, (int, float)):
            settings[key] = float(value)

    settings["osc_1_on"] = 1.0
    settings["osc_2_on"] = 1.0
    settings["filter_1_on"] = 1.0
    settings["chorus_on"] = 1.0 if settings.get("chorus_dry_wet", 0.0) > 0.01 else 0.0
    settings["reverb_on"] = 1.0 if settings.get("reverb_dry_wet", 0.0) > 0.01 else 0.0
    settings["distortion_on"] = 1.0 if settings.get("distortion_mix", 0.0) > 0.01 else 0.0
    settings["osc_1_unison_voices"] = float(round(_clamp(settings.get("osc_1_unison_voices", 3.0), 1.0, 8.0)))
    settings["osc_2_unison_voices"] = float(round(_clamp(settings.get("osc_2_unison_voices", 3.0), 1.0, 8.0)))

    data["author"] = "AudioMutator"
    data["comments"] = summary
    data["preset_style"] = family.title()
    data["macro1"] = "Tone"
    data["macro2"] = "Motion"
    data["macro3"] = "Space"
    data["macro4"] = "Drive"

    settings["preset_name"] = preset_name
    return data


def render_vital_preset(payload: dict[str, Any]) -> tuple[str, bytes]:
    preset_name = str(payload.get("name", "AudioMutator Vital"))
    summary = str(payload.get("summary", "Generated from uploaded audio."))
    family = str(payload.get("family_key", "texture"))
    parameter_map = payload.get("parameter_map")
    if not isinstance(parameter_map, dict):
        raise ValueError("parameter_map must be an object")

    data = _load_seed(family)
    rendered = _apply_parameter_map(data, preset_name=preset_name, summary=summary, family=family, parameter_map=parameter_map)
    body = json.dumps(rendered, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    file_name = f"{_sanitize_stub(preset_name)}.vital"
    (OUTPUT_DIR / file_name).write_bytes(body)
    return file_name, body


class AudioMutatorHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(UI_DIR), **kwargs)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            _json_response(self, HTTPStatus.OK, {"ok": True})
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/vital/export":
            _json_response(self, HTTPStatus.NOT_FOUND, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            file_name, body = render_vital_preset(payload)
        except Exception as exc:  # pragma: no cover - UI-facing error path
            _json_response(self, HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Disposition", f'attachment; filename="{file_name}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return


def serve(host: str = "127.0.0.1", port: int = 4174) -> None:
    httpd = ThreadingHTTPServer((host, port), AudioMutatorHandler)
    print(f"AudioMutator running at http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    serve()

"""Report WAV counts and formats from delivery ZIPs without extracting audio."""

import json
import struct
import sys
import zipfile
from collections import Counter
from pathlib import Path


def wav_format(stream):
    header = stream.read(12)
    if len(header) != 12 or header[:4] != b"RIFF" or header[8:] != b"WAVE":
        raise ValueError("Not a RIFF WAV file")
    while True:
        chunk = stream.read(8)
        if len(chunk) != 8:
            raise ValueError("Missing fmt chunk")
        name, size = struct.unpack("<4sI", chunk)
        if name == b"fmt ":
            if size < 16 or size > 4096:
                raise ValueError("Invalid fmt chunk length")
            payload = stream.read(size)
            encoding, channels, rate, _, _, bits = struct.unpack("<HHIIHH", payload[:16])
            if encoding == 0xFFFE and len(payload) >= 40:
                encoding = struct.unpack("<H", payload[24:26])[0]
            return {"sample_rate": rate, "bits": bits, "channels": channels, "encoding": encoding}
        stream.seek(size + size % 2, 1)


def inspect(path):
    with zipfile.ZipFile(path) as archive:
        files = [item for item in archive.infolist()
                 if item.filename.lower().endswith(".wav")
                 and "__MACOSX/" not in item.filename
                 and not Path(item.filename).name.startswith("._")]
        formats = Counter()
        for item in files:
            with archive.open(item) as stream:
                formats[tuple(wav_format(stream).items())] += 1
        return {
            "archive": Path(path).name,
            "archive_bytes": Path(path).stat().st_size,
            "wav_count": len(files),
            "formats": [{**dict(format_items), "file_count": count}
                        for format_items, count in sorted(formats.items())],
        }


if __name__ == "__main__":
    print(json.dumps([inspect(path) for path in sys.argv[1:]], indent=2))

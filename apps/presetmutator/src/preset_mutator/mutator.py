from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import random


@dataclass(frozen=True)
class MutationConfig:
    rate: float = 0.01
    seed: int | None = None
    min_offset: int = 0


def mutate_bytes(data: bytes, config: MutationConfig) -> tuple[bytes, int]:
    if not 0.0 <= config.rate <= 1.0:
        raise ValueError("rate must be between 0.0 and 1.0")
    if config.min_offset < 0:
        raise ValueError("min_offset must be >= 0")
    if config.min_offset >= len(data):
        raise ValueError("min_offset must be smaller than the input size")

    rng = random.Random(config.seed)
    mutable = bytearray(data)
    candidate_positions = list(range(config.min_offset, len(mutable)))
    mutation_count = max(1, int(len(candidate_positions) * config.rate))
    mutation_count = min(mutation_count, len(candidate_positions))

    for index in rng.sample(candidate_positions, mutation_count):
        original = mutable[index]
        replacement = rng.randrange(256)

        while replacement == original:
            replacement = rng.randrange(256)

        mutable[index] = replacement

    return bytes(mutable), mutation_count


def mutate_file(input_path: Path, output_path: Path, config: MutationConfig) -> str:
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")
    if not input_path.is_file():
        raise ValueError(f"Input path is not a file: {input_path}")

    data = input_path.read_bytes()
    mutated, count = mutate_bytes(data, config)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(mutated)

    return (
        f"Wrote {output_path} from {input_path} "
        f"with {count} byte mutations (rate={config.rate}, seed={config.seed})"
    )

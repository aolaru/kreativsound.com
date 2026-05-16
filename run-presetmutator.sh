#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/public/apps/preset-mutator/ui"
HOST="${PRESETMUTATOR_HOST:-127.0.0.1}"
PORT="${PRESETMUTATOR_PORT:-4185}"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "PresetMutator app not found at ${APP_DIR}" >&2
  exit 1
fi

echo "PresetMutator UI running at http://${HOST}:${PORT}"
exec python3 -m http.server "${PORT}" --bind "${HOST}" --directory "${APP_DIR}"

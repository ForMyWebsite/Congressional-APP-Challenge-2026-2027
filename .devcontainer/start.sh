#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../v1"
if curl --fail --silent http://localhost:5173/ >/dev/null 2>&1; then
  exit 0
fi
if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  export APP_ORIGIN="https://${CODESPACE_NAME}-5173.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
fi
nohup npm run dev >/tmp/acadia-dev.log 2>&1 </dev/null &
for attempt in {1..60}; do
  if curl --fail --silent http://localhost:5173/ >/dev/null && curl --fail --silent http://localhost:3001/api/health >/dev/null; then
    echo 'Acadia is running. Open port 5173 from the Ports tab.'
    exit 0
  fi
  sleep 1
done
echo 'Acadia did not start. Check /tmp/acadia-dev.log.' >&2
exit 1

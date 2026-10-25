#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../v1"
healthy() {
  curl --fail --silent --max-time 5 http://127.0.0.1:5173/api/health |
    node -e 'let body="";process.stdin.on("data", chunk=>body+=chunk);process.stdin.on("end",()=>{try{const value=JSON.parse(body);process.exit(value.status==="ok" && value.appVersion===2?0:1);}catch{process.exit(1);}});'
}
if healthy 2>/dev/null; then
  echo 'Acadia v2 is already running. Open port 5173.'
  exit 0
fi
if curl --silent --max-time 3 -o /dev/null http://127.0.0.1:5173/; then
  echo 'Port 5173 is occupied by another app or an older Acadia version. Stop its terminal with Ctrl+C, or stop and restart this Codespace, then rerun this script.' >&2
  exit 1
fi
# Keep the SIGHUP fix: lifecycle-shell shutdown must not terminate the app.
nohup setsid npm run dev >/tmp/acadia-dev.log 2>&1 </dev/null &
for attempt in {1..60}; do
  if healthy 2>/dev/null; then
    echo 'Acadia is running. Open port 5173 from the Ports tab.'
    exit 0
  fi
  sleep 1
done
echo 'Acadia did not become ready. Run: tail -n 60 /tmp/acadia-dev.log' >&2
exit 1

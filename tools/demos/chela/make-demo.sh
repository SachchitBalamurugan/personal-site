#!/usr/bin/env bash
# Webcam take -> public/demos/chela.mp4 + chela.jpg, decoded by Chela's real detector and decoder.
# Usage: tools/demos/chela/make-demo.sh <take.webm|mp4> <path to hacknations-project checkout>
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
take="$(realpath "$1")"
chela="$(realpath "$2")"
work="$here/../out/chela"
public="$here/../../../public/demos"
mkdir -p "$work" "$public"
cd "$here/.."

node chela/extract-blinks.mjs "$take" "$work"
npx tsx chela/decode-blinks.ts "$work/blendshapes.json" "$chela/src" "$work/timeline.json"
node chela/render-chela-video.mjs "$take" "$work/timeline.json" "$public/chela.mp4"

# Poster: the frame where the transcript is longest, just before SEND (or the last frame).
poster_t=$(node -e '
  const { timeline, log } = require(process.argv[1]);
  const send = log.find((l) => l.kind === "send");
  const t = send ? Math.max(0, send.t - 300) : timeline[timeline.length - 1].t;
  console.log((t / 1000).toFixed(2));
' "$work/timeline.json")
ffmpeg -v error -y -ss "$poster_t" -i "$public/chela.mp4" -frames:v 1 -q:v 3 "$public/chela.jpg"
ls -la "$public/chela.mp4" "$public/chela.jpg"

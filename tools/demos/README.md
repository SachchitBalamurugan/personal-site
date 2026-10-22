# Project demo videos

Scripts that build the videos in `public/demos/`. They are not part of the site build.

```bash
cd tools/demos
npm install   # Playwright (uses the system Chromium via $CHROMIUM or /opt/pw-browsers/chromium), MediaPipe, tsx
```

## mcp-ugc

A real run of the private `mcp-ugc` server over stdio, making a TikTok about this site, rendered as a terminal video.

```bash
# 1. Footage of this site for the TikTok (serve the built site first: npm run build && npx vite preview)
node site-footage.mjs http://localhost:4173 out/footage
# 2. The run (mcp-ugc checkout with `npm install && npm run build`; project dir = a scratch clone of this repo)
git clone . /tmp/ugc-project
node mcp-ugc-run.mjs ../mcp-ugc /tmp/ugc-project out/footage out/ugc
# 3. The video
node render-ugc-video.mjs out/ugc/transcript.json ../../public/demos/mcp-ugc.mp4
```

## Chela

A webcam take of someone blinking a word in Morse, run through Chela's own `BlinkDetector` and `MorseDecoder`
(imported from a checkout of the private `hacknations-project` repo), with what they decoded drawn over the clip.

1. Record a take: serve this folder (`python3 -m http.server -d chela 8000`), open
   http://localhost:8000/recorder.html in Chrome, and follow the tones. Download `take.webm`.
2. Build the video:

```bash
chela/make-demo.sh take.webm ../hacknations-project
```

Steps inside: `extract-blinks.mjs` (MediaPipe FaceLandmarker blendshapes per frame, VIDEO mode, like Chela's
`BlinkTracker`), `decode-blinks.ts` (the real detector and decoder with Chela's default settings), and
`render-chela-video.mjs` (overlay drawn per frame, composited with ffmpeg).

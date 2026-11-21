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

## Orbit and CLARA

Both apps put their real product behind a sign-in, so these demos run each app locally from its private repo
instead of recording the live site. `walkthrough.mjs` is the shared recorder: Playwright records the page in
real time (headless Chromium, `/opt/pw-browsers/chromium`), and ffmpeg cuts each beat, time-scales it to the
beat's length, overlays its caption (drawn in Chromium), and joins the beats into H.264 with `+faststart`.

**Orbit**: a simulated sales call on the real teleprompter page. `orbit/simulate_call.py` runs a scripted buyer
transcript and scripted coach lines (standing in for live audio and Gemini Live) through Orbit's own
`TeleprompterSession`, `CallAnalytics` and `StageTracker` on a simulated clock, and saves every frame the backend
sends. The recorder serves Orbit's `static/` folder unchanged, stubs sign-in and the REST calls, and replays
those frames over the call WebSocket.

```bash
python3 -m venv ../orbit-venv && ../orbit-venv/bin/pip install -r ../orbit.ai/requirements.txt
../orbit-venv/bin/python orbit/simulate_call.py ../orbit.ai out/orbit-call.json
node orbit/orbit-call-demo.mjs ../orbit.ai out/orbit-call.json   # -> ../../public/demos/orbit.{mp4,jpg}
```

**CLARA**: a filer uploads the synthetic documents from `samples/`, the I-130 check runs, and a clerk reviews
the case. `clara/demo_server.py` runs CLARA's real FastAPI app with Supabase replaced by in-memory dicts, a demo
sign-in (a JWT that CLARA's own auth verifies), and a scripted vision backend that returns what
`scripts/make_samples.py` printed on each sample, with bounding boxes measured from the photo. Everything else
(normalization, encryption, tokenization, the checklist, the clerk screen) is CLARA's own code.

```bash
python3 -m venv ../clara-venv && ../clara-venv/bin/pip install -r ../clara.ai/requirements-dev.txt
node clara/clara-demo.mjs ../clara.ai ../clara-venv/bin/python   # -> ../../public/demos/clara.{mp4,jpg}
```

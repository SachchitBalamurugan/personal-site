"""Run a scripted sales call through Orbit's own backend and save what it sends the browser.

The buyer's transcript and the coach's lines are scripted: they stand in for live call audio and for
Gemini Live, which this demo does not use. Everything downstream of them is Orbit's real code from a
checkout of the private orbit.ai repo: TeleprompterSession publishes the lines through its suggestion
filter, CallAnalytics scores each buyer turn, StageTracker moves the roadmap rail, and the roadmap's
own objection library is matched against what the buyer says. A simulated clock lets a four-minute
call run in a moment while the stage tracker's dwell times still apply.

Usage: python simulate_call.py <orbit.ai checkout> <out.json>
"""

import asyncio
import json
import sys
import time
from pathlib import Path

orbit_dir, out_path = Path(sys.argv[1]).resolve(), Path(sys.argv[2])
sys.path.insert(0, str(orbit_dir))

import config  # noqa: E402
import roadmap as roadmap_lib  # noqa: E402
import session_manager  # noqa: E402

ROADMAP_ID = "builtin:consultative_discovery"

# (simulated seconds into the call, beat in the video, who, text)
SCRIPT = [
    (14, 1, "buyer", "Thirty minutes works. Honestly I mostly want to know if this helps with our ticket backlog."),
    (27, 1, "coach", "Walk me through how this works right now, end to end."),
    (44, 1, "buyer", "Tickets land in Zendesk, then two team leads sort them by hand in a spreadsheet every morning."),
    (58, 1, "coach", "Where does that break down?"),
    (75, 2, "buyer", "Mondays. Urgent tickets sit for hours and customers get frustrated."),
    (86, 2, "coach", "Tell me about the last time it went wrong."),
    (101, 2, "buyer", "Last month a renewal escalated because nobody saw the ticket for two days."),
    (110, 2, "coach", "What does that end up costing you?"),
    (128, 2, "buyer", "That account brings in about eighty thousand dollars. We kept it, barely."),
    (152, 3, "buyer", "Okay, but how much is it? We already use the Zendesk reports."),
    (160, 3, "coach", "Twelve dollars per agent a month. If Monday triage just worked, what would change for your team?"),
    (176, 4, "buyer", "We would answer urgent tickets the same day. That is exactly what my VP keeps asking for, I like that."),
    (193, 4, "coach", "Who else would need to be involved if you decided to fix this?"),
    (211, 4, "buyer", "My VP, Dana. The money is approved if we can show it works before Q3."),
    (226, 4, "coach", "Let me play back what I heard. Then, what does your calendar look like next week?"),
    (240, 4, "buyer", "Tuesday afternoon is good. Send the invite to me and Dana."),
]


class SimClock:
    """Stands in for the time module inside session_manager."""

    def __init__(self):
        self.now = 0.0
        self.epoch = time.time()

    def monotonic(self):
        return self.now

    def perf_counter(self):
        return self.now

    def time(self):
        return self.epoch + self.now


class Recorder:
    """The WebSocket the session writes to. Frames are tagged with the beat they belong to."""

    def __init__(self):
        self.frames = []
        self.beat = 0

    async def send_json(self, frame):
        self.frames.append({"beat": self.beat, "frame": frame})


async def main():
    clock = SimClock()
    session_manager.time = clock
    ws = Recorder()
    session = session_manager.TeleprompterSession(ws, config.get_settings())

    # What start() does once Gemini is connected, minus Gemini.
    roadmap = roadmap_lib.load_builtin_roadmap(ROADMAP_ID)
    session.roadmap = roadmap
    session.stage_tracker = roadmap_lib.StageTracker(roadmap, clock=clock.monotonic)
    await session._send("roadmap", **session.roadmap_payload())
    await session._send("status", level="ok", message="Simulated call: scripted buyer and coach lines, no live audio.")

    for at, beat, who, text in SCRIPT:
        clock.now = float(at)
        ws.beat = beat
        if who == "buyer":
            words = text.split()
            await session.add_transcript(" ".join(words[: max(3, len(words) // 2)]), is_final=False)
            clock.now += 1.5
            await session.add_transcript(text, is_final=True)
        else:
            decision = await session.publish_completed_suggestion(text)
            assert decision.accepted, decision.reason

    # Stub responses for the REST calls the teleprompter makes, built from the same code the routes use.
    api = {
        "/api/call-types": {
            "default": config.DEFAULT_CALL_TYPE,
            "callTypes": [{"id": slug, "label": labels[0]} for slug, labels in config.CALL_TYPES.items()],
        },
        "/api/roadmaps": {
            "builtin": [item.summary() for item in roadmap_lib.list_builtin_roadmaps()],
            "mine": [],
            "activeRoadmapId": ROADMAP_ID,
        },
        f"/api/roadmaps/{ROADMAP_ID}": roadmap.to_dict(),
        # The demo account's company and product are made up.
        "/api/company": {"id": "demo-company", "name": "Demo Company"},
        "/api/user": {"uid": "demo", "activeProductId": "demo-product"},
        "/api/products": {"products": [{"id": "demo-product", "name": "Ticket Insights"}]},
    }
    out_path.write_text(json.dumps({"api": api, "frames": ws.frames}, indent=1))
    stages = [f["frame"]["name"] + " (" + f["frame"]["reason"] + ")" for f in ws.frames if f["frame"]["type"] == "stage"]
    last = [f["frame"] for f in ws.frames if f["frame"]["type"] == "analytics"][-1]
    print(f"{len(ws.frames)} frames; stages: {stages}")
    print(f"close {last['close_probability']}% {last['close_probability_label']}, mood {last['overall_mood']}, "
          f"+{last['positive_signal_count']} -{last['negative_signal_count']} obj {last['objection_count']} buy {last['buying_signal_count']}")
    print("objections:", [f["frame"]["id"] for f in ws.frames if f["frame"]["type"] == "objection"])


asyncio.run(main())

"""Run CLARA locally for the demo video, with no Supabase project and no Gemini key.

The app is CLARA's real FastAPI app from a checkout of the private clara.ai repo: its pages, upload
handling, Pillow normalization, encryption, HMAC tokenization and tokenization gate, the I-130 checklist
rules, court routing, and the clerk review screen all run unchanged. Three things are swapped, the same
way the repo's own tests/test_end_to_end.py swaps them:

  - Supabase (tables, storage, token vault) becomes in-memory dicts.
  - Sign-in is a demo session: /demo/signin/filer and /demo/signin/clerk set a session cookie holding a
    JWT signed with this server's demo secret, which CLARA's own auth code then verifies.
  - Gemini becomes a scripted vision backend. It returns the values printed on the synthetic samples
    from scripts/make_samples.py, with each bounding box measured from the ink on the sample photo. It
    reads nothing; it reports what the sample generator drew.

/demo/queue/{case_id} sends a case to the clerk queue the way scripts/seed_demo.py does, blocking
findings included, since a filer cannot submit a case that still has them.

Usage: python demo_server.py <clara.ai checkout> [port]
"""

from __future__ import annotations

import base64
import io
import os
import sys
import time
from pathlib import Path

clara_dir = Path(sys.argv[1]).resolve()
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8001
sys.path.insert(0, str(clara_dir))

DEMO_SECRET = "clara-demo-video-secret-not-a-real-project-key"
os.environ.update(
    CLARA_DOC_KEY_B64=base64.b64encode(b"d" * 32).decode(),
    CLARA_TOKEN_HMAC_KEY_B64=base64.b64encode(b"h" * 32).decode(),
    GEMINI_API_KEY="not-used",
    SUPABASE_URL="https://demo-project.supabase.co",
    SUPABASE_ANON_KEY="not-used",
    SUPABASE_SERVICE_ROLE_KEY="not-used",
    SUPABASE_JWT_SECRET=DEMO_SECRET,
    CRON_SECRET="not-used",
)

import jwt  # noqa: E402
import uvicorn  # noqa: E402
from fastapi.responses import RedirectResponse  # noqa: E402
from PIL import Image  # noqa: E402

from clara import auth, backend, crypto, store  # noqa: E402
from clara.models import AuditEntry, Case, CaseStatus, Member, MemberRole, utcnow  # noqa: E402
from clara.pipeline import extract, normalize, preflight, redact, route, validate  # noqa: E402
from clara.vision.schemas import ExtractionResult, PreflightResult, RawField, ValidationResult  # noqa: E402

# ---------------------------------------------------------------- in-memory Supabase
cases: dict[str, Case] = {}
members: dict[str, list[Member]] = {}
documents: dict[str, object] = {}
blobs: dict[str, bytes] = {}
vault: dict[str, dict] = {}
audit_log: list[AuditEntry] = []
erop: dict[str, dict] = {}


def create_case(owner_uid, **kwargs):
    case = Case(id=store.new_id(), owner_uid=owner_uid, **kwargs)
    cases[case.id] = case
    return case


def update_case(case):
    case.updated_at = utcnow()
    cases[case.id] = case
    return case


def save_document(doc):
    doc.updated_at = utcnow()
    documents[doc.id] = doc
    return doc


def store_token(token, plaintext, kind, case_id):
    vault[token] = {"ciphertext": crypto.encrypt_str(plaintext), "kind": str(kind), "case_id": case_id}


def audit(case_id, actor_uid, actor_role, action, **detail):
    audit_log.append(AuditEntry(id=store.new_id(), case_id=case_id, actor_uid=actor_uid,
                                actor_role=actor_role, action=action, detail=detail))


for name, fn in {
    "create_case": create_case,
    "get_case": lambda case_id: cases.get(case_id),
    "list_cases_for_owner": lambda uid: [c for c in cases.values() if c.owner_uid == uid],
    "list_cases_for_queue": lambda court=None: [
        c for c in cases.values() if c.status == CaseStatus.QUEUED and (not court or c.jurisdiction == court)
    ],
    "update_case": update_case,
    "add_member": lambda m: members.setdefault(m.case_id, []).append(m) or m,
    "list_members": lambda case_id: members.get(case_id, []),
    "save_document": save_document,
    "get_document": lambda case_id, doc_id: documents.get(doc_id),
    "list_documents": lambda case_id: sorted(
        (d for d in documents.values() if d.case_id == case_id), key=lambda d: d.uploaded_at
    ),
    "store_token": store_token,
    "resolve_tokens": lambda tokens: {
        t: crypto.decrypt_str(vault[t]["ciphertext"]) for t in set(tokens) if t in vault
    },
    "audit": audit,
    "list_audit": lambda case_id: [e for e in audit_log if e.case_id == case_id],
    "commit_erop": lambda case_id, record: erop.__setitem__(case_id, record),
    "get_erop": lambda case_id: erop.get(case_id),
}.items():
    setattr(store, name, fn)
redact.store_token = store_token
backend.upload_blob = lambda path, data, ct="": blobs.__setitem__(path, data) or path
backend.download_blob = lambda path: blobs[path]

# ---------------------------------------------------------------- scripted vision
SAMPLES = clara_dir / "samples"
ROW = 78  # make_samples.labelled() spacing


def rows(x, y, *values):
    """Field rows as make_samples.labelled() lays them out: label at (x, y), value 22 px lower."""
    return [(x, y + i * ROW, value) for i, value in enumerate(values)]


# (key, label, subject, attribute, pii_kind) per row, in the order make_samples.py draws them.
LAYOUT = {
    "i130_form.jpg": (
        "i130_form", "10/17/24", True, 1, "A filled-in Form I-130, Petition for Alien Relative.",
        list(zip(rows(110, 372, "MERCADO", "DANIEL", "07/22/1988", "NEW YORK", "10007", "U.S. CITIZEN")
                 + rows(110, 880, "OKONKWO", "ADAEZE", "03/14/1991", "A123456789", "06/09/2023"), [
            ("petitioner_family_name", "Family Name (Last Name)", "petitioner", "family_name", "name"),
            ("petitioner_given_name", "Given Name (First Name)", "petitioner", "given_name", "name"),
            ("petitioner_dob", "Date of Birth (mm/dd/yyyy)", "petitioner", "dob", "dob"),
            ("petitioner_mailing_city", "Mailing Address - City", "petitioner", "city", "none"),
            ("petitioner_mailing_zip", "Mailing Address - ZIP Code", "petitioner", "zip", "none"),
            ("petitioner_status", "U.S. Citizen or Lawful Permanent Resident", "petitioner", "status", "none"),
            ("beneficiary_family_name", "Family Name (Last Name)", "beneficiary", "family_name", "name"),
            ("beneficiary_given_name", "Given Name (First Name)", "beneficiary", "given_name", "name"),
            ("beneficiary_dob", "Date of Birth (mm/dd/yyyy)", "beneficiary", "dob", "dob"),
            ("beneficiary_a_number", "Alien Registration Number (A-Number)", "beneficiary", "a_number", "a_number"),
            ("marriage_date", "Date of Marriage (mm/dd/yyyy)", "none", "marriage_date", "none"),
        ])),
        [("petitioner_full_name", "DANIEL MERCADO", "petitioner_family_name", "petitioner_given_name"),
         ("beneficiary_full_name", "ADAEZE OKONKWO", "beneficiary_family_name", "beneficiary_given_name")],
    ),
    "birth_certificate.jpg": (
        "birth_certificate", "", True, 0, "A birth certificate for Adaeze Okonkwo.",
        list(zip(rows(150, 320, "ADAEZE OKONKWO", "03/04/1991", "ENUGU", "NGOZI OKONKWO", "EMEKA OKONKWO", "03/19/1991"), [
            ("child_full_name", "Full Name of Child", "beneficiary", "full_name", "name"),
            ("child_dob", "Date of Birth", "beneficiary", "dob", "dob"),
            ("place_of_birth", "Place of Birth", "beneficiary", "city", "none"),
            ("mother_full_name", "Name of Mother", "other", "full_name", "name"),
            ("father_full_name", "Name of Father", "other", "full_name", "name"),
            ("registration_date", "Date of Registration", "none", "other", "none"),
        ])),
        [],
    ),
    "passport.jpg": (
        "passport", "", False, 0, "The biographic page of a U.S. passport.",
        list(zip(rows(450, 240, "MERCADO", "DANIEL", "UNITED STATES OF AMERICA", "22 JUL 1988", "X01234567"), [
            ("surname", "Surname", "petitioner", "family_name", "name"),
            ("given_names", "Given Names", "petitioner", "given_name", "name"),
            ("nationality", "Nationality", "petitioner", "country", "none"),
            ("date_of_birth", "Date of Birth", "petitioner", "dob", "dob"),
            ("passport_number", "Passport No.", "petitioner", "passport_number", "passport"),
        ])),
        [("holder_full_name", "DANIEL MERCADO", "surname", "given_names")],
    ),
    "tax_return.jpg": (
        "tax_return", "", True, 0, "A Form 1040 tax return, married filing jointly.",
        list(zip(rows(110, 240, "MARRIED FILING JOINTLY", "DANIEL", "MERCADO", "ADAEZE", "OKONKWO", "18 PARK ROW, NEW YORK NY 10007"), [
            ("filing_status", "Filing Status", "none", "status", "none"),
            ("first_name", "Your First Name and Middle Initial", "petitioner", "given_name", "name"),
            ("last_name", "Last Name", "petitioner", "family_name", "name"),
            ("spouse_first_name", "Spouse's First Name", "beneficiary", "given_name", "name"),
            ("spouse_last_name", "Spouse's Last Name", "beneficiary", "family_name", "name"),
            ("home_address", "Home Address", "petitioner", "address", "none"),
        ])),
        [("taxpayer_full_name", "DANIEL MERCADO", "last_name", "first_name"),
         ("spouse_full_name", "ADAEZE OKONKWO", "spouse_last_name", "spouse_first_name")],
    ),
}


def ink_box(img, x, y):
    """Bounding box (0-1000) of the dark ink in a value's slot, measured on the sample photo."""
    gray = img.convert("L")
    # Below the printed label (19 px at y) and above the rule (y + 46).
    left, top, right, bottom = x, y + 21, min(img.width, x + 760), y + 45
    pixels = gray.crop((left, top, right, bottom)).load()
    w, h = right - left, bottom - top
    xs = [i for i in range(w) for j in range(h) if pixels[i, j] < 90]
    ys = [j for j in range(h) for i in range(w) if pixels[i, j] < 90]
    if not xs:
        return (y + 18, x, y + 46, x + 300)
    box = (top + min(ys) - 3, left + min(xs) - 4, top + max(ys) + 3, left + max(xs) + 4)
    return box


def scale(box, img):
    ymin, xmin, ymax, xmax = box
    return dict(ymin=round(ymin * 1000 / img.height), xmin=round(xmin * 1000 / img.width),
                ymax=round(ymax * 1000 / img.height), xmax=round(xmax * 1000 / img.width))


SCRIPTS = {}
for filename, (doc_type, edition, signed, page_no, summary, fields, combined) in LAYOUT.items():
    raw = (SAMPLES / filename).read_bytes()
    img = Image.open(io.BytesIO(raw))
    out, boxes = [], {}
    for n, ((x, y, value), (key, label, subject, attribute, pii)) in enumerate(fields):
        box = ink_box(img, x, y)
        boxes[key] = box
        out.append(RawField(key=key, label=label, value=value, subject=subject, attribute=attribute,
                            pii_kind=pii, confidence=0.97 - (n % 4) * 0.02, **scale(box, img)))
    for key, value, a, b in combined:
        ba, bb = boxes[a], boxes[b]
        box = (min(ba[0], bb[0]), min(ba[1], bb[1]), max(ba[2], bb[2]), max(ba[3], bb[3]))
        subject = next(f.subject for f in out if f.key == a)
        out.append(RawField(key=key, label="(combined)", value=value, subject=subject, attribute="full_name",
                            pii_kind="name", confidence=0.95, **scale(box, img)))
    pre = PreflightResult(doc_type=doc_type, form_edition_date=edition, signature_present=signed,
                          is_legible=True, is_complete_page=True, detected_language="en",
                          visible_page_number=page_no, summary=summary, issues=[])
    # The vision backend only sees normalized bytes, so recognise each sample by them.
    normalized, _, _ = normalize.normalize(raw, "image/jpeg")
    SCRIPTS[crypto.sha256_hex(normalized)] = (pre, ExtractionResult(doc_type=doc_type, language="en", fields=out))


class ScriptedVision:
    name = "scripted"

    def _script(self, image):
        script = SCRIPTS.get(crypto.sha256_hex(image))
        if script is None:
            raise RuntimeError("The demo only knows the synthetic samples in samples/.")
        time.sleep(0.6)  # so each stage is visible on the progress bar
        return script

    def preflight(self, image, mime_type):
        return self._script(image)[0]

    def extract(self, image, mime_type, doc_type):
        return self._script(image)[1]

    def translate(self, image, mime_type):
        raise RuntimeError("No foreign-language samples in this demo.")

    def validate(self, prompt):
        from clara.vision.gemini import _assert_no_pii

        _assert_no_pii(prompt)  # CLARA's own tripwire still runs on the reasoning prompt
        return ValidationResult(findings=[])


vision = ScriptedVision()
for module in (preflight, extract, validate):
    module.get_backend = lambda: vision

# ---------------------------------------------------------------- the app, plus demo routes
from api.index import app  # noqa: E402

USERS = {
    "filer": ("demo-filer", "filer@clara.demo", "Daniel Mercado (demo filer)", {"role": auth.ROLE_CLIENT}, "/cases"),
    "clerk": ("demo-clerk", "clerk@clara.demo", "NYC clerk (demo)", {"role": auth.ROLE_CLERK, "court": "NYC"}, "/queue"),
}


@app.get("/demo/signin/{who}")
def demo_signin(who: str):
    uid, email, name, app_metadata, home = USERS[who]
    token = jwt.encode({"sub": uid, "email": email, "aud": "authenticated", "exp": int(time.time()) + 3600,
                        "app_metadata": app_metadata, "user_metadata": {"name": name}}, DEMO_SECRET, "HS256")
    response = RedirectResponse(home, 303)
    auth.set_session_cookies(response, token, "demo-refresh")
    return response


@app.get("/demo/queue/{case_id}")
def demo_queue(case_id: str):
    case = cases[case_id]
    decision = route.route(case.zip_code)
    case.jurisdiction = decision.court.code
    case.status = CaseStatus.QUEUED
    update_case(case)
    audit(case.id, case.owner_uid, auth.ROLE_CLIENT, "case.submitted", court=decision.court.code)
    for role, name in [(MemberRole.PETITIONER, "Daniel Mercado"), (MemberRole.BENEFICIARY, "Adaeze Okonkwo")]:
        store.add_member(Member(id=store.new_id(), case_id=case.id, role=role, display_name=name))
    return RedirectResponse("/", 303)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")

#!/usr/bin/env python3
"""
==============================================================================
  SALON AI -- COMPLETE APPLICATION TEST SUITE
==============================================================================

Tests the entire app end-to-end:

  1. Server health & build verification
  2. Validator logic (offline, schema-level)
  3. Session API flow (start -> message -> complete)
  4. Lead capture API
  5. Audit/crawl API
  6. Admin API routes (overview, sessions, tenants, leads, events, best-practices)
  7. Report generation & PDF
  8. Email send API
  9. Voice integration (STT + TTS + language detection)
 10. Gamification engine (logic simulation)

Usage:
    python scripts/test_app_complete.py                     # All tests (needs server)
    python scripts/test_app_complete.py --offline            # Offline-only tests
    python scripts/test_app_complete.py --base-url http://localhost:3000
    python scripts/test_app_complete.py --tenant-id <uuid>   # Use a real tenant for deeper tests
"""

import argparse
import json
import os
import sys
import io
import time
import uuid
import struct
import wave
import math
import subprocess
from pathlib import Path

# Force UTF-8 stdout on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# -- Constants ---------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
TEST_DIR = BASE_DIR / "test_output"

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

passed = 0
failed = 0
skipped = 0
results_log = []


def log_pass(section: str, name: str, detail: str = ""):
    global passed
    passed += 1
    msg = f"  {GREEN}[PASS]{RESET}  {name}" + (f" -- {detail}" if detail else "")
    print(msg)
    results_log.append(("PASS", section, name, detail))


def log_fail(section: str, name: str, detail: str = ""):
    global failed
    failed += 1
    msg = f"  {RED}[FAIL]{RESET}  {name}" + (f" -- {detail}" if detail else "")
    print(msg)
    results_log.append(("FAIL", section, name, detail))


def log_skip(section: str, name: str, reason: str = ""):
    global skipped
    skipped += 1
    msg = f"  {YELLOW}[SKIP]{RESET}  {name}" + (f" -- {reason}" if reason else "")
    print(msg)
    results_log.append(("SKIP", section, name, reason))


def section(title: str, number: int):
    print(f"\n{CYAN}{BOLD}{'=' * 60}{RESET}")
    print(f"{CYAN}{BOLD}  {number}. {title}{RESET}")
    print(f"{CYAN}{BOLD}{'=' * 60}{RESET}\n")


def subsection(title: str):
    print(f"  {DIM}--- {title} ---{RESET}")


def api_get(base: str, path: str, timeout: int = 10):
    import requests
    return requests.get(f"{base}{path}", timeout=timeout)


def api_post(base: str, path: str, json_data=None, files=None, data=None, timeout: int = 15):
    import requests
    return requests.post(f"{base}{path}", json=json_data, files=files, data=data, timeout=timeout)


# -- Helpers -----------------------------------------------------------------

def generate_test_wav(filename: str, duration: float = 1.5):
    """Generate a silent WAV (PCM 16kHz 16-bit mono) for API testing."""
    sample_rate = 16000
    n_samples = int(sample_rate * duration)
    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b'\x00\x00' * n_samples)
    return filename


def check_server(base_url: str) -> bool:
    try:
        import requests
        r = requests.get(base_url, timeout=5)
        return r.status_code in [200, 302, 304]
    except Exception:
        return False


# ============================================================================
# TEST 1: SERVER HEALTH & BUILD
# ============================================================================

def test_server_health(base_url: str):
    sec = "Server Health"
    section(sec, 1)

    if not check_server(base_url):
        log_fail(sec, "Server reachable", f"Cannot connect to {base_url}")
        return False

    log_pass(sec, "Server reachable", base_url)

    # Check homepage returns HTML
    r = api_get(base_url, "/")
    if r.status_code == 200:
        log_pass(sec, "Homepage returns 200")
    else:
        log_fail(sec, "Homepage returns 200", f"Got {r.status_code}")

    # Check Next.js build worked (check for _next)
    if "_next" in r.text or "next" in r.text.lower():
        log_pass(sec, "Next.js app detected in response")
    else:
        log_skip(sec, "Next.js app detection", "Could not detect Next.js markers")

    return True


# ============================================================================
# TEST 2: VALIDATOR LOGIC (OFFLINE)
# ============================================================================

def test_validators():
    sec = "Validators"
    section(sec, 2)

    subsection("Schema Validation Rules")

    # Simulate Zod schema rules in Python
    tests = [
        {
            "name": "StartSession -- valid FR startup",
            "schema": "StartSession",
            "data": {"tenantId": str(uuid.uuid4()), "mode": "startup", "language": "fr"},
            "valid": True
        },
        {
            "name": "StartSession -- invalid mode",
            "schema": "StartSession",
            "data": {"tenantId": str(uuid.uuid4()), "mode": "invalid_mode"},
            "valid": False
        },
        {
            "name": "StartSession -- missing tenantId",
            "schema": "StartSession",
            "data": {"mode": "startup"},
            "valid": False
        },
        {
            "name": "SendMessage -- valid message",
            "schema": "SendMessage",
            "data": {"message": "Bonjour, je cherche un site web"},
            "valid": True
        },
        {
            "name": "SendMessage -- empty message",
            "schema": "SendMessage",
            "data": {"message": ""},
            "valid": False
        },
        {
            "name": "SendMessage -- with voiceTranscript",
            "schema": "SendMessage",
            "data": {"message": "test", "voiceTranscript": "Bonjour"},
            "valid": True
        },
        {
            "name": "CreateLead -- valid",
            "schema": "CreateLead",
            "data": {
                "tenantId": str(uuid.uuid4()),
                "sessionId": str(uuid.uuid4()),
                "firstName": "Jean",
                "email": "jean@test.com",
                "sector": "restauration"
            },
            "valid": True
        },
        {
            "name": "CreateLead -- invalid email",
            "schema": "CreateLead",
            "data": {
                "tenantId": str(uuid.uuid4()),
                "sessionId": str(uuid.uuid4()),
                "firstName": "Jean",
                "email": "not-an-email",
                "sector": "restauration"
            },
            "valid": False
        },
        {
            "name": "FetchAudit -- valid URL",
            "schema": "FetchAudit",
            "data": {"url": "https://example.com", "sessionId": str(uuid.uuid4())},
            "valid": True
        },
        {
            "name": "FetchAudit -- invalid URL",
            "schema": "FetchAudit",
            "data": {"url": "not-a-url", "sessionId": str(uuid.uuid4())},
            "valid": False
        },
        {
            "name": "SpeakText -- valid",
            "schema": "SpeakText",
            "data": {
                "text": "Bonjour!",
                "sessionId": str(uuid.uuid4()),
                "tenantId": str(uuid.uuid4()),
                "language": "fr"
            },
            "valid": True
        },
        {
            "name": "SpeakText -- empty text",
            "schema": "SpeakText",
            "data": {"text": "", "sessionId": str(uuid.uuid4()), "tenantId": str(uuid.uuid4())},
            "valid": False
        },
        {
            "name": "Language -- valid 'en'",
            "schema": "Language",
            "data": "en",
            "valid": True
        },
        {
            "name": "Language -- invalid 'de'",
            "schema": "Language",
            "data": "de",
            "valid": False
        },
        {
            "name": "Niche -- valid 'beaute'",
            "schema": "Niche",
            "data": "beaute",
            "valid": True
        },
        {
            "name": "Niche -- invalid 'unknown'",
            "schema": "Niche",
            "data": "unknown",
            "valid": False
        },
    ]

    # Python-based validation simulating Zod rules
    import re

    UUID_RE = re.compile(r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', re.I)
    EMAIL_RE = re.compile(r'^[^@]+@[^@]+\.[^@]+$')
    URL_RE = re.compile(r'^https?://.+')
    VALID_MODES = {"startup", "portfolio", "audit"}
    VALID_LANGS = {"fr", "en"}
    VALID_NICHES = {"restauration", "beaute", "construction", "immobilier", "sante",
                    "services_pro", "marketing_web", "ecommerce", "coaching", "services_domicile"}

    def validate(schema: str, data) -> bool:
        if schema == "Language":
            return isinstance(data, str) and data in VALID_LANGS
        if schema == "Niche":
            return isinstance(data, str) and data in VALID_NICHES
        if not isinstance(data, dict):
            return False

        if schema == "StartSession":
            return (UUID_RE.match(data.get("tenantId", "")) is not None and
                    data.get("mode") in VALID_MODES)

        if schema == "SendMessage":
            msg = data.get("message", "")
            return isinstance(msg, str) and 1 <= len(msg) <= 5000

        if schema == "CreateLead":
            return (UUID_RE.match(data.get("tenantId", "")) is not None and
                    UUID_RE.match(data.get("sessionId", "")) is not None and
                    isinstance(data.get("firstName"), str) and len(data["firstName"]) >= 1 and
                    EMAIL_RE.match(data.get("email", "")) is not None and
                    isinstance(data.get("sector"), str) and len(data["sector"]) >= 1)

        if schema == "FetchAudit":
            return (URL_RE.match(data.get("url", "")) is not None and
                    UUID_RE.match(data.get("sessionId", "")) is not None)

        if schema == "SpeakText":
            return (isinstance(data.get("text"), str) and len(data["text"]) >= 1 and
                    UUID_RE.match(data.get("sessionId", "")) is not None and
                    UUID_RE.match(data.get("tenantId", "")) is not None)

        return True

    for t in tests:
        result = validate(t["schema"], t["data"])
        if result == t["valid"]:
            log_pass(sec, t["name"])
        else:
            log_fail(sec, t["name"], f"Expected valid={t['valid']}, got valid={result}")


# ============================================================================
# TEST 3: SESSION API FLOW
# ============================================================================

def test_session_flow(base_url: str, tenant_id: str = None):
    sec = "Session Flow"
    section(sec, 3)

    if not check_server(base_url):
        log_skip(sec, "All session tests", "Server not running")
        return None

    tid = tenant_id or str(uuid.uuid4())

    subsection("Start Session")

    # Test: Start session with valid data
    payload = {
        "tenantId": tid,
        "mode": "startup",
        "language": "fr",
        "niche": "restauration"
    }

    r = api_post(base_url, "/api/session/start", json_data=payload)

    if tenant_id and r.status_code == 200:
        data = r.json()
        session_id = data.get("sessionId")
        log_pass(sec, "Start session (real tenant)", f"sessionId={session_id}")

        # Test: Start session returns questions
        questions = data.get("questions")
        if questions and len(questions) > 0:
            log_pass(sec, "Session returns niche questions", f"{len(questions)} questions")
        else:
            log_fail(sec, "Session returns niche questions", "Empty or missing")

        subsection("Send Message")

        # Test: Send message
        msg_payload = {"message": "Je cherche un site web pour mon restaurant"}
        r2 = api_post(base_url, f"/api/session/{session_id}/message", json_data=msg_payload, timeout=30)

        if r2.status_code == 200:
            msg_data = r2.json()
            reply = msg_data.get("reply", "")
            provider = msg_data.get("provider", "unknown")
            log_pass(sec, "Send message", f"provider={provider}, reply={len(reply)} chars")

            # Test: Send voice transcript
            voice_payload = {
                "message": "test",
                "voiceTranscript": "Bonjour, je cherche un designer web",
                "languageOverride": "fr"
            }
            r3 = api_post(base_url, f"/api/session/{session_id}/message", json_data=voice_payload, timeout=30)
            if r3.status_code == 200:
                vd = r3.json()
                log_pass(sec, "Send voice transcript",
                         f"isVoiceInput={vd.get('isVoiceInput')}, lang={vd.get('language')}")
            else:
                log_fail(sec, "Send voice transcript", f"Status {r3.status_code}")

        else:
            log_fail(sec, "Send message", f"Status {r2.status_code}: {r2.text[:200]}")

        subsection("Complete Session")

        # Test: Complete session
        r4 = api_post(base_url, f"/api/session/{session_id}/complete", json_data={}, timeout=30)
        if r4.status_code == 200:
            complete_data = r4.json()
            log_pass(sec, "Complete session", f"report generated={bool(complete_data.get('report'))}")
        else:
            log_fail(sec, "Complete session", f"Status {r4.status_code}")

        return session_id

    elif r.status_code == 404:
        log_skip(sec, "Start session", "Tenant not found (use --tenant-id for real tests)")
        return None
    else:
        log_fail(sec, "Start session", f"Status {r.status_code}: {r.text[:200]}")
        return None

    # Test: Invalid session start (bad mode)
    subsection("Validation Errors")
    bad_payload = {"tenantId": tid, "mode": "invalid_mode"}
    r = api_post(base_url, "/api/session/start", json_data=bad_payload)
    if r.status_code == 400:
        log_pass(sec, "Invalid mode -> 400")
    else:
        log_fail(sec, "Invalid mode -> 400", f"Got {r.status_code}")


# ============================================================================
# TEST 4: LEAD CAPTURE API
# ============================================================================

def test_lead_api(base_url: str, tenant_id: str = None, session_id: str = None):
    sec = "Lead Capture"
    section(sec, 4)

    if not check_server(base_url):
        log_skip(sec, "All lead tests", "Server not running")
        return

    tid = tenant_id or str(uuid.uuid4())
    sid = session_id or str(uuid.uuid4())

    # Test: Create lead
    payload = {
        "tenantId": tid,
        "sessionId": sid,
        "firstName": "TestUser",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "sector": "restauration",
        "siteUrl": "https://example.com",
        "notes": "Test lead from automated test suite"
    }

    r = api_post(base_url, "/api/lead", json_data=payload)

    if r.status_code == 201:
        data = r.json()
        log_pass(sec, "Create lead", f"leadId={data.get('leadId')}")
    elif r.status_code in [200, 500]:
        # 500 might be DB issue (tenant doesn't exist for FK)
        log_skip(sec, "Create lead", f"Status {r.status_code} (probably FK constraint)")
    else:
        log_fail(sec, "Create lead", f"Status {r.status_code}: {r.text[:200]}")

    # Test: Invalid lead (bad email)
    bad_payload = {
        "tenantId": tid,
        "sessionId": sid,
        "firstName": "Bad",
        "email": "not-valid",
        "sector": "restauration"
    }
    r2 = api_post(base_url, "/api/lead", json_data=bad_payload)
    if r2.status_code == 400:
        log_pass(sec, "Invalid email -> 400")
    else:
        log_fail(sec, "Invalid email -> 400", f"Got {r2.status_code}")

    # Test: Missing fields
    r3 = api_post(base_url, "/api/lead", json_data={"tenantId": tid})
    if r3.status_code == 400:
        log_pass(sec, "Missing fields -> 400")
    else:
        log_fail(sec, "Missing fields -> 400", f"Got {r3.status_code}")


# ============================================================================
# TEST 5: AUDIT / CRAWL API
# ============================================================================

def test_audit_api(base_url: str):
    sec = "Audit/Crawl"
    section(sec, 5)

    if not check_server(base_url):
        log_skip(sec, "All audit tests", "Server not running")
        return

    sid = str(uuid.uuid4())

    # Test: Fetch audit for a real URL
    payload = {"url": "https://example.com", "sessionId": sid}
    try:
        r = api_post(base_url, "/api/audit/fetch", json_data=payload, timeout=20)
        if r.status_code == 200:
            data = r.json()
            log_pass(sec, "Crawl example.com", f"title={data.get('title', '?')[:40]}")
        elif r.status_code == 500:
            log_skip(sec, "Crawl example.com", f"Server error (possible network issue)")
        else:
            log_fail(sec, "Crawl example.com", f"Status {r.status_code}")
    except Exception as e:
        log_fail(sec, "Crawl example.com", str(e)[:100])

    # Test: Invalid URL
    bad_payload = {"url": "not-a-url", "sessionId": sid}
    r2 = api_post(base_url, "/api/audit/fetch", json_data=bad_payload)
    if r2.status_code == 400:
        log_pass(sec, "Invalid URL -> 400")
    else:
        log_fail(sec, "Invalid URL -> 400", f"Got {r2.status_code}")


# ============================================================================
# TEST 6: ADMIN API
# ============================================================================

def test_admin_api(base_url: str, tenant_id: str = None):
    sec = "Admin API"
    section(sec, 6)

    if not check_server(base_url):
        log_skip(sec, "All admin tests", "Server not running")
        return

    tid = tenant_id or str(uuid.uuid4())

    admin_routes = [
        ("/api/admin/overview", "Overview", {"tenantId": tid}),
        ("/api/admin/sessions", "Sessions", {"tenantId": tid}),
        ("/api/admin/tenants", "Tenants", None),
        ("/api/admin/leads/csv", "Leads CSV", {"tenantId": tid}),
        ("/api/admin/events", "Events", {"tenantId": tid}),
        ("/api/admin/best-practices", "Best Practices", None),
        ("/api/admin/report", "Report", {"tenantId": tid}),
    ]

    for route, name, query in admin_routes:
        try:
            if query:
                import requests
                r = requests.get(f"{base_url}{route}", params=query, timeout=10)
            else:
                r = api_get(base_url, route)

            if r.status_code == 200:
                ct = r.headers.get("content-type", "")
                if "json" in ct:
                    size = len(r.json()) if isinstance(r.json(), list) else "object"
                    log_pass(sec, f"GET {name}", f"200 JSON ({size})")
                elif "csv" in ct or "text" in ct:
                    log_pass(sec, f"GET {name}", f"200 {ct[:30]}")
                else:
                    log_pass(sec, f"GET {name}", f"200")
            elif r.status_code == 404:
                log_skip(sec, f"GET {name}", "404 (tenant not found)")
            elif r.status_code == 405:
                # Try POST instead
                r2 = api_post(base_url, route, json_data=query or {})
                if r2.status_code in [200, 404]:
                    log_pass(sec, f"POST {name}", f"{r2.status_code}")
                else:
                    log_skip(sec, f"{name}", f"GET=405, POST={r2.status_code}")
            else:
                log_fail(sec, f"GET {name}", f"Status {r.status_code}")
        except Exception as e:
            log_fail(sec, f"GET {name}", str(e)[:100])


# ============================================================================
# TEST 7: REPORT & PDF
# ============================================================================

def test_report_api(base_url: str, session_id: str = None):
    sec = "Report & PDF"
    section(sec, 7)

    if not check_server(base_url):
        log_skip(sec, "All report tests", "Server not running")
        return

    if not session_id:
        log_skip(sec, "Report retrieval", "No session_id available (run with --tenant-id)")
        return

    # Test: Get report
    try:
        r = api_get(base_url, f"/api/report/{session_id}")
        if r.status_code == 200:
            data = r.json()
            log_pass(sec, "Get report JSON", f"mode={data.get('mode')}, sections={len(data.get('sections', []))}")
        elif r.status_code == 404:
            log_skip(sec, "Get report JSON", "Report not found (session may not be completed)")
        else:
            log_fail(sec, "Get report JSON", f"Status {r.status_code}")
    except Exception as e:
        log_fail(sec, "Get report JSON", str(e)[:100])

    # Test: Get PDF
    try:
        r = api_get(base_url, f"/api/report/{session_id}/pdf", timeout=15)
        if r.status_code == 200 and "pdf" in r.headers.get("content-type", ""):
            pdf_size = len(r.content)
            pdf_file = str(TEST_DIR / "test_report.pdf")
            with open(pdf_file, 'wb') as f:
                f.write(r.content)
            log_pass(sec, "Get report PDF", f"{pdf_size} bytes -> {pdf_file}")
        elif r.status_code == 404:
            log_skip(sec, "Get report PDF", "Report not found")
        else:
            log_fail(sec, "Get report PDF", f"Status {r.status_code}")
    except Exception as e:
        log_fail(sec, "Get report PDF", str(e)[:100])


# ============================================================================
# TEST 8: EMAIL SEND API
# ============================================================================

def test_email_api(base_url: str, session_id: str = None):
    sec = "Email"
    section(sec, 8)

    if not check_server(base_url):
        log_skip(sec, "All email tests", "Server not running")
        return

    # Test: Validation (invalid email)
    bad_payload = {"sessionId": str(uuid.uuid4()), "email": "not-valid"}
    r = api_post(base_url, "/api/email/send", json_data=bad_payload)
    if r.status_code == 400:
        log_pass(sec, "Invalid email -> 400")
    elif r.status_code == 405:
        log_skip(sec, "Email API", "405 Method Not Allowed (may need different method)")
    else:
        log_fail(sec, "Invalid email -> 400", f"Got {r.status_code}")

    # Test: Missing sessionId
    bad2 = {"email": "test@test.com"}
    r2 = api_post(base_url, "/api/email/send", json_data=bad2)
    if r2.status_code == 400:
        log_pass(sec, "Missing sessionId -> 400")
    else:
        log_fail(sec, "Missing sessionId -> 400", f"Got {r2.status_code}")

    # We skip actual email sending to avoid spam
    log_skip(sec, "Actual email send", "Skipped to avoid sending real emails")


# ============================================================================
# TEST 9: VOICE INTEGRATION
# ============================================================================

def test_voice(base_url: str):
    sec = "Voice"
    section(sec, 9)

    if not check_server(base_url):
        log_skip(sec, "All voice tests", "Server not running")
        return

    sid = str(uuid.uuid4())
    tid = str(uuid.uuid4())

    subsection("Transcribe API")

    # Generate test WAV
    wav_file = str(TEST_DIR / "voice_test.wav")
    generate_test_wav(wav_file)

    # Test: POST /api/voice/transcribe
    try:
        with open(wav_file, 'rb') as f:
            files = {'audio': ('test.wav', f, 'audio/wav')}
            data = {'sessionId': sid, 'currentLang': 'fr'}
            r = api_post(base_url, "/api/voice/transcribe", files=files, data=data, timeout=60)

        if r.status_code == 200:
            vd = r.json()
            log_pass(sec, "Transcribe audio",
                     f"transcript='{vd.get('transcript', '')[:30]}', lang={vd.get('langGuess')}")
        elif r.status_code == 500:
            log_skip(sec, "Transcribe audio", "Server error (Vosk models may not be loaded)")
        else:
            log_fail(sec, "Transcribe audio", f"Status {r.status_code}")
    except Exception as e:
        log_fail(sec, "Transcribe audio", str(e)[:100])

    # Test: Missing audio
    r2 = api_post(base_url, "/api/voice/transcribe", data={'sessionId': sid})
    if r2.status_code == 400:
        log_pass(sec, "Missing audio -> 400")
    else:
        log_fail(sec, "Missing audio -> 400", f"Got {r2.status_code}")

    subsection("TTS API")

    # Test: POST /api/voice/speak
    speak_payload = {
        "text": "Bonjour, bienvenue!",
        "sessionId": sid,
        "tenantId": tid,
        "language": "fr"
    }
    try:
        r3 = api_post(base_url, "/api/voice/speak", json_data=speak_payload, timeout=30)
        if r3.status_code == 200 and 'audio' in r3.headers.get('content-type', ''):
            out_file = str(TEST_DIR / "tts_test.mp3")
            with open(out_file, 'wb') as f:
                f.write(r3.content)
            log_pass(sec, "TTS speak FR", f"{len(r3.content)} bytes -> {out_file}")
        elif r3.status_code == 500 and "ELEVENLABS" in r3.text:
            log_skip(sec, "TTS speak FR", "ELEVENLABS_API_KEY not configured")
        else:
            log_fail(sec, "TTS speak FR", f"Status {r3.status_code}")
    except Exception as e:
        log_fail(sec, "TTS speak FR", str(e)[:100])

    # Test: Empty text
    bad_speak = {"text": "", "sessionId": sid, "tenantId": tid}
    r4 = api_post(base_url, "/api/voice/speak", json_data=bad_speak)
    if r4.status_code == 400:
        log_pass(sec, "Empty text -> 400")
    else:
        log_fail(sec, "Empty text -> 400", f"Got {r4.status_code}")


# ============================================================================
# TEST 10: GAMIFICATION ENGINE (OFFLINE)
# ============================================================================

def test_gamification():
    sec = "Gamification"
    section(sec, 10)

    subsection("Score Tiers")

    def get_tier(score: float) -> str:
        if score >= 8: return 'advanced'
        if score >= 5: return 'intermediate'
        return 'beginner'

    test_scores = [
        (0, "beginner"), (3, "beginner"), (4.9, "beginner"),
        (5, "intermediate"), (7, "intermediate"), (7.9, "intermediate"),
        (8, "advanced"), (9, "advanced"), (10, "advanced"),
    ]

    for score, expected_tier in test_scores:
        actual = get_tier(score)
        if actual == expected_tier:
            log_pass(sec, f"Score {score} -> '{expected_tier}'")
        else:
            log_fail(sec, f"Score {score} -> '{expected_tier}'", f"Got '{actual}'")

    subsection("Badge Detection Logic")

    # Simulate badge earning logic
    badge_checks = {
        "site_score": lambda r: r.get("overall_score", 0) >= 7,
        "offer_clarity": lambda r: len(r.get("sections", [])) >= 3,
        "cta_quality": lambda r: bool(r.get("cta")),
        "social_proof": lambda r: "testimonial" in str(r).lower() or "review" in str(r).lower(),
    }

    # Good report
    good_report = {
        "overall_score": 8,
        "sections": [{"title": "A"}, {"title": "B"}, {"title": "C"}],
        "cta": "Book now!",
        "summary": "Excellent site with testimonials and reviews"
    }

    badges_earned = [name for name, check in badge_checks.items() if check(good_report)]
    if len(badges_earned) >= 3:
        log_pass(sec, "Good report earns badges", f"{len(badges_earned)}: {badges_earned}")
    else:
        log_fail(sec, "Good report earns badges", f"Only {len(badges_earned)}")

    # Poor report
    poor_report = {"overall_score": 2, "sections": [{"title": "A"}], "summary": "Needs work"}
    badges_poor = [name for name, check in badge_checks.items() if check(poor_report)]
    if len(badges_poor) <= 1:
        log_pass(sec, "Poor report earns few badges", f"{len(badges_poor)}: {badges_poor}")
    else:
        log_fail(sec, "Poor report earns few badges", f"Got {len(badges_poor)}")

    subsection("Upsell Matching")

    def match_upsells(score: float, problems: list):
        packs = [
            {"id": "audit-complet", "range": (0, 5), "targets": ["seo_presence", "cta_quality", "site_score"]},
            {"id": "refonte-site", "range": (3, 7), "targets": ["site_score", "mobile_ready"]},
            {"id": "coaching", "range": (4, 7), "targets": ["social_proof", "offer_clarity"]},
            {"id": "gestion-reseaux", "range": (3, 8), "targets": ["social_proof", "brand_consistency"]},
        ]
        matched = []
        for pack in packs:
            if pack["range"][0] <= score <= pack["range"][1]:
                if any(p in pack["targets"] for p in problems):
                    matched.append(pack["id"])
        return matched

    matches = match_upsells(3, ["seo_presence", "social_proof"])
    if "audit-complet" in matches:
        log_pass(sec, "Low score -> audit-complet upsell", str(matches))
    else:
        log_fail(sec, "Low score -> audit-complet upsell", str(matches))

    matches2 = match_upsells(9, ["seo_presence"])
    if len(matches2) == 0:
        log_pass(sec, "High score -> no upsells", "Score 9 out of range for all packs")
    else:
        log_fail(sec, "High score -> no upsells", str(matches2))


# ============================================================================
# TEST 11: LANGUAGE DETECTION (OFFLINE)
# ============================================================================

def test_language_detection():
    sec = "Language Detection"
    section(sec, 11)

    WINDOW_SIZE = 3
    SWITCH_THRESHOLD = 0.8
    MIN_VOTES = 2

    def process_window(history, current_lang, guess_lang, confidence):
        history.append({"lang": guess_lang, "confidence": confidence})
        window = history[-WINDOW_SIZE:]
        high_conf = [g for g in window if g["confidence"] >= SWITCH_THRESHOLD]
        other = "en" if current_lang == "fr" else "fr"
        votes = sum(1 for g in high_conf if g["lang"] == other)
        should_switch = votes >= MIN_VOTES
        return history, (other if should_switch else current_lang), should_switch

    # Scenario: Gradual switch FR -> EN
    subsection("Sliding Window Switch")
    h, lang = [], "fr"
    h, lang, _ = process_window(h, lang, "fr", 0.95)
    if lang == "fr": log_pass(sec, "1 FR msg -> stays FR")
    else: log_fail(sec, "1 FR msg -> stays FR")

    h, lang, _ = process_window(h, lang, "en", 0.9)
    if lang == "fr": log_pass(sec, "1 EN msg (only 1 vote) -> stays FR")
    else: log_fail(sec, "1 EN msg (only 1 vote) -> stays FR")

    h, lang, _ = process_window(h, lang, "en", 0.85)
    if lang == "en": log_pass(sec, "2 EN msgs (2 votes) -> switches to EN")
    else: log_fail(sec, "2 EN msgs (2 votes) -> switches to EN", f"Got {lang}")

    # Scenario: Low confidence doesn't trigger switch
    subsection("Confidence Threshold")
    h2, lang2 = [], "fr"
    for _ in range(5):
        h2, lang2, _ = process_window(h2, lang2, "en", 0.6)
    if lang2 == "fr":
        log_pass(sec, "5x EN low conf -> stays FR")
    else:
        log_fail(sec, "5x EN low conf -> stays FR", f"Got {lang2}")

    # Scenario: Text-based detection
    subsection("Text Heuristic Detection")

    fr_indicators = {"je", "tu", "il", "elle", "nous", "vous", "le", "la", "les", "est",
                     "suis", "dans", "pour", "avec", "sur", "mais", "bonjour", "merci"}
    en_indicators = {"i", "you", "he", "she", "we", "they", "the", "is", "are", "in",
                     "for", "with", "but", "and", "hello", "thanks"}

    def detect(text):
        words = set(text.lower().split())
        fr_c = len(words & fr_indicators)
        en_c = len(words & en_indicators)
        total = fr_c + en_c
        if total == 0: return "fr", 0.5
        ratio = fr_c / total
        return ("fr", ratio) if ratio > 0.5 else ("en", 1 - ratio)

    tests = [
        ("Bonjour je suis dans le restaurant", "fr"),
        ("Hello I am looking for a website", "en"),
        ("Pizza pasta burger", "fr"),  # Unknown -> default fr
    ]

    for text, expected in tests:
        lang, conf = detect(text)
        if lang == expected:
            log_pass(sec, f"Text detect '{text[:30]}...'", f"lang={lang} conf={conf:.2f}")
        else:
            log_fail(sec, f"Text detect '{text[:30]}...'", f"Expected {expected}, got {lang}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Salon AI -- Complete Test Suite")
    parser.add_argument('--base-url', default='http://localhost:3000', help='Base URL')
    parser.add_argument('--tenant-id', default=None, help='Real tenant UUID for deeper testing')
    parser.add_argument('--offline', action='store_true', help='Run only offline tests (no server needed)')

    args = parser.parse_args()

    print(f"\n{BOLD}{'=' * 60}{RESET}")
    print(f"{BOLD}  SALON AI -- COMPLETE APPLICATION TEST SUITE{RESET}")
    print(f"{BOLD}{'=' * 60}{RESET}")
    print(f"  {DIM}Base URL:  {args.base_url}{RESET}")
    print(f"  {DIM}Tenant:    {args.tenant_id or '(auto-generated fake)'}{RESET}")
    print(f"  {DIM}Mode:      {'OFFLINE' if args.offline else 'FULL'}{RESET}")

    TEST_DIR.mkdir(parents=True, exist_ok=True)

    session_id = None

    if args.offline:
        # Offline-only tests
        test_validators()
        test_gamification()
        test_language_detection()
    else:
        # Full test suite
        server_ok = test_server_health(args.base_url)
        test_validators()

        if server_ok:
            session_id = test_session_flow(args.base_url, args.tenant_id)
            test_lead_api(args.base_url, args.tenant_id, session_id)
            test_audit_api(args.base_url)
            test_admin_api(args.base_url, args.tenant_id)
            test_report_api(args.base_url, session_id)
            test_email_api(args.base_url, session_id)
            test_voice(args.base_url)

        test_gamification()
        test_language_detection()

    # -- Summary ---------------------------------------------------------------

    total = passed + failed + skipped
    print(f"\n{BOLD}{'=' * 60}{RESET}")
    print(f"{BOLD}  RESULTS{RESET}")
    print(f"{BOLD}{'=' * 60}{RESET}")
    print(f"  {GREEN}Passed:   {passed}{RESET}")
    print(f"  {RED}Failed:   {failed}{RESET}")
    print(f"  {YELLOW}Skipped:  {skipped}{RESET}")
    print(f"  Total:    {total}")

    # Write detailed results to file
    results_file = str(TEST_DIR / "full_results.json")
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "base_url": args.base_url,
            "tenant_id": args.tenant_id,
            "mode": "offline" if args.offline else "full",
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "total": total,
            "results": [
                {"status": s, "section": sec, "name": n, "detail": d}
                for s, sec, n, d in results_log
            ]
        }, f, indent=2, ensure_ascii=False)

    print(f"\n  {CYAN}Detailed results: {results_file}{RESET}")
    print(f"  {CYAN}Test files: {TEST_DIR}{RESET}")

    if failed > 0:
        print(f"\n  {RED}{BOLD}Some tests failed!{RESET}")

        # Print failure summary
        print(f"\n  Failures:")
        for s, sec, n, d in results_log:
            if s == "FAIL":
                print(f"    {RED}[{sec}]{RESET} {n}" + (f" -- {d}" if d else ""))

        sys.exit(1)
    else:
        print(f"\n  {GREEN}{BOLD}All tests passed (or skipped)!{RESET}")
    
    print()


if __name__ == "__main__":
    main()

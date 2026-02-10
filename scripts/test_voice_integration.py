#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════
  🧪  VOSK + VOICE INTEGRATION — COMPLETE TEST SUITE
═══════════════════════════════════════════════════════════════════════

Tests:
  1. Vosk Python script (direct)
  2. Language detector logic
  3. API /api/voice/transcribe  (requires running Next.js server)
  4. API /api/voice/speak        (requires ElevenLabs API key)
  5. API /api/session flow       (full voice chat test)

Usage:
    python scripts/test_voice_integration.py                    # Run all offline tests
    python scripts/test_voice_integration.py --api              # Include API tests (need server running)
    python scripts/test_voice_integration.py --api --base-url http://localhost:3000
"""

import argparse
import json
import os
import struct
import sys
import wave
import math
import time
import subprocess
import io
from pathlib import Path

# Force UTF-8 stdout on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ─── Constants ─────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts"
MODELS_DIR = BASE_DIR / "models"
TEST_DIR = BASE_DIR / "test_output"

# Colors for terminal output
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

passed = 0
failed = 0
skipped = 0


def log_pass(name: str, detail: str = ""):
    global passed
    passed += 1
    print(f"  {GREEN}[PASS]{RESET}  {name}" + (f" -- {detail}" if detail else ""))


def log_fail(name: str, detail: str = ""):
    global failed
    failed += 1
    print(f"  {RED}[FAIL]{RESET}  {name}" + (f" -- {detail}" if detail else ""))


def log_skip(name: str, reason: str = ""):
    global skipped
    skipped += 1
    print(f"  {YELLOW}[SKIP]{RESET}  {name}" + (f" -- {reason}" if reason else ""))


def log_section(title: str):
    print(f"\n{CYAN}{BOLD}{'-' * 60}{RESET}")
    print(f"{CYAN}{BOLD}  {title}{RESET}")
    print(f"{CYAN}{BOLD}{'-' * 60}{RESET}\n")


# ─── Test Helpers ──────────────────────────────────────────────────────────────

def generate_test_wav(filename: str, duration: float = 2.0, freq: float = 440):
    """Generate a simple sine wave WAV (PCM 16kHz 16-bit mono)."""
    sample_rate = 16000
    n_samples = int(sample_rate * duration)
    amplitude = 16000

    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)

    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)

        for i in range(n_samples):
            value = int(amplitude * math.sin(2 * math.pi * freq * i / sample_rate))
            wf.writeframes(struct.pack('<h', value))

    return filename


def generate_silence_wav(filename: str, duration: float = 1.0):
    """Generate a silent WAV file."""
    sample_rate = 16000
    n_samples = int(sample_rate * duration)

    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)

    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b'\x00\x00' * n_samples)

    return filename


# ═══════════════════════════════════════════════════════════════════════
#  TEST 1: Vosk Python Script (Direct)
# ═══════════════════════════════════════════════════════════════════════

def test_vosk_python_script():
    log_section("TEST 1: Vosk Python Script (Direct)")

    script = str(SCRIPTS_DIR / "vosk_transcribe.py")

    if not os.path.exists(script):
        log_fail("Script exists", f"Not found: {script}")
        return

    log_pass("Script exists", script)

    # Check if Vosk is installed
    try:
        import vosk
        log_pass("Vosk Python module installed")
    except ImportError:
        log_fail("Vosk Python module", "Not installed. Run: pip install vosk")
        return

    # Check models
    fr_model = MODELS_DIR / "vosk-model-fr-0.22"
    en_model = MODELS_DIR / "vosk-model-en-us-0.22"

    fr_exists = fr_model.exists()
    en_exists = en_model.exists()

    if fr_exists:
        log_pass("French model", str(fr_model))
    else:
        log_skip("French model", f"Not found: {fr_model}")

    if en_exists:
        log_pass("English model", str(en_model))
    else:
        log_skip("English model", f"Not found: {en_model}")

    if not fr_exists and not en_exists:
        log_skip("Vosk transcription test", "No models available")
        return

    # Test with a tone WAV (won't produce real text, but should not crash)
    test_wav = str(TEST_DIR / "test_tone.wav")
    generate_test_wav(test_wav, duration=1.5)
    log_pass("Test WAV generated", test_wav)

    # Test with silence (should return empty text)
    silence_wav = str(TEST_DIR / "test_silence.wav")
    generate_silence_wav(silence_wav)
    log_pass("Silence WAV generated", silence_wav)

    model_to_test = str(fr_model) if fr_exists else str(en_model)
    model_lang = "FR" if fr_exists else "EN"

    # Run vosk_transcribe.py on silence
    try:
        result = subprocess.run(
            [sys.executable, script, "--model", model_to_test, "--file", silence_wav],
            capture_output=True, text=True, timeout=30
        )

        if result.returncode == 0:
            output = json.loads(result.stdout.strip())
            log_pass(f"Vosk silence test ({model_lang})",
                     f"text=\"{output.get('text', '')}\", confidence={output.get('confidence', 0)}")
        else:
            log_fail(f"Vosk silence test ({model_lang})", f"Exit code {result.returncode}: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        log_fail(f"Vosk silence test ({model_lang})", "Timed out (30s)")
    except Exception as e:
        log_fail(f"Vosk silence test ({model_lang})", str(e))

    # Run vosk_transcribe.py on tone
    try:
        result = subprocess.run(
            [sys.executable, script, "--model", model_to_test, "--file", test_wav],
            capture_output=True, text=True, timeout=30
        )

        if result.returncode == 0:
            output = json.loads(result.stdout.strip())
            log_pass(f"Vosk tone test ({model_lang})",
                     f"text=\"{output.get('text', '')}\", confidence={output.get('confidence', 0)}")
        else:
            log_fail(f"Vosk tone test ({model_lang})", f"Exit code {result.returncode}: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        log_fail(f"Vosk tone test ({model_lang})", "Timed out (30s)")
    except Exception as e:
        log_fail(f"Vosk tone test ({model_lang})", str(e))


# ═══════════════════════════════════════════════════════════════════════
#  TEST 2: Language Detector Logic
# ═══════════════════════════════════════════════════════════════════════

def test_language_detector():
    log_section("TEST 2: Language Detector Logic (Python simulation)")

    # Simulate the sliding window logic from language-detector.ts
    WINDOW_SIZE = 3
    SWITCH_THRESHOLD = 0.8
    MIN_VOTES = 2

    def process_guess(history, current_lang, guess_lang, confidence):
        history.append({"lang": guess_lang, "confidence": confidence})
        history = history[-WINDOW_SIZE:]

        high_conf = [g for g in history if g["confidence"] >= SWITCH_THRESHOLD]
        other_lang = "en" if current_lang == "fr" else "fr"
        other_votes = sum(1 for g in high_conf if g["lang"] == other_lang)
        should_switch = other_votes >= MIN_VOTES

        new_lang = other_lang if should_switch else current_lang
        return history, new_lang, should_switch

    # Test 1: All French — should NOT switch
    history = []
    current = "fr"
    for _ in range(3):
        history, current, switched = process_guess(history, current, "fr", 0.95)

    if current == "fr" and not switched:
        log_pass("All FR messages → stays FR")
    else:
        log_fail("All FR messages → stays FR", f"Got: {current}, switched={switched}")

    # Test 2: 3 English with high confidence — should switch
    history = []
    current = "fr"
    for _ in range(3):
        history, current, switched = process_guess(history, current, "en", 0.9)

    if current == "en":
        log_pass("3x EN (high conf) → switches to EN")
    else:
        log_fail("3x EN (high conf) → switches to EN", f"Got: {current}")

    # Test 3: Mixed with low confidence — should NOT switch
    history = []
    current = "fr"
    guesses = [("en", 0.6), ("en", 0.5), ("en", 0.7)]
    for lang, conf in guesses:
        history, current, switched = process_guess(history, current, lang, conf)

    if current == "fr":
        log_pass("3x EN (low conf <0.8) → stays FR")
    else:
        log_fail("3x EN (low conf <0.8) → stays FR", f"Got: {current}")

    # Test 4: 2 EN + 1 FR high conf — should switch (2/3 >= MIN_VOTES)
    history = []
    current = "fr"
    guesses = [("en", 0.9), ("fr", 0.9), ("en", 0.85)]
    for lang, conf in guesses:
        history, current, switched = process_guess(history, current, lang, conf)

    if current == "en":
        log_pass("2 EN + 1 FR (high conf) → switches to EN")
    else:
        log_fail("2 EN + 1 FR (high conf) → switches to EN", f"Got: {current}")

    # Test 5: Text-based language detection simulation
    fr_words = {"je", "tu", "il", "elle", "nous", "vous", "le", "la", "les", "est", "suis",
                "dans", "pour", "avec", "sur", "mais", "mon", "ma", "bonjour", "merci"}
    en_words = {"i", "you", "he", "she", "we", "they", "the", "is", "are", "in", "on",
                "for", "with", "but", "and", "my", "hello", "thanks"}

    def detect_text_lang(text):
        words = text.lower().split()
        fr_score = sum(1 for w in words if w in fr_words)
        en_score = sum(1 for w in words if w in en_words)
        total = fr_score + en_score
        if total == 0:
            return "fr", 0.5
        ratio = fr_score / total
        if ratio > 0.5:
            return "fr", min(ratio, 0.99)
        return "en", min(1 - ratio, 0.99)

    lang, conf = detect_text_lang("Bonjour, je suis intéressé par vos services")
    if lang == "fr" and conf > 0.7:
        log_pass(f"Text detection FR", f"lang={lang}, conf={conf:.2f}")
    else:
        log_fail(f"Text detection FR", f"lang={lang}, conf={conf:.2f}")

    lang, conf = detect_text_lang("Hello, I am interested in your web design services")
    if lang == "en" and conf > 0.7:
        log_pass(f"Text detection EN", f"lang={lang}, conf={conf:.2f}")
    else:
        log_fail(f"Text detection EN", f"lang={lang}, conf={conf:.2f}")

    lang, conf = detect_text_lang("pizza pasta sushi")
    if conf < 0.7:
        log_pass(f"Text detection unknown", f"lang={lang}, conf={conf:.2f} (low as expected)")
    else:
        log_fail(f"Text detection unknown", f"lang={lang}, conf={conf:.2f} (expected low)")


# ═══════════════════════════════════════════════════════════════════════
#  TEST 3: API — /api/voice/transcribe
# ═══════════════════════════════════════════════════════════════════════

def test_api_transcribe(base_url: str):
    log_section("TEST 3: API /api/voice/transcribe")

    try:
        import requests
    except ImportError:
        log_skip("API tests", "Install requests: pip install requests")
        return

    # Check if server is running
    try:
        r = requests.get(base_url, timeout=5)
    except requests.ConnectionError:
        log_skip("API transcribe", f"Server not running at {base_url}")
        return

    log_pass("Server reachable", base_url)

    # Generate test audio
    test_wav = str(TEST_DIR / "api_test.wav")
    generate_silence_wav(test_wav, duration=1.0)

    url = f"{base_url}/api/voice/transcribe"

    # Test with a fake session ID (will work for transcription even if session doesn't exist in DB)
    import uuid
    fake_session_id = str(uuid.uuid4())

    # Test 1: Basic transcription
    try:
        with open(test_wav, 'rb') as f:
            files = {'audio': ('test.wav', f, 'audio/wav')}
            data = {'sessionId': fake_session_id, 'currentLang': 'fr'}
            r = requests.post(url, files=files, data=data, timeout=60)

        if r.status_code == 200:
            result = r.json()
            log_pass("Transcribe — basic FR",
                     f"transcript=\"{result.get('transcript', '')}\", "
                     f"langGuess={result.get('langGuess')}, "
                     f"confidence={result.get('confidence', 0)}")
        else:
            body = r.text[:200]
            log_fail(f"Transcribe — basic FR", f"Status {r.status_code}: {body}")
    except Exception as e:
        log_fail("Transcribe — basic FR", str(e))

    # Test 2: Dual language mode
    try:
        with open(test_wav, 'rb') as f:
            files = {'audio': ('test.wav', f, 'audio/wav')}
            data = {'sessionId': fake_session_id, 'currentLang': 'fr', 'dualLang': 'true'}
            r = requests.post(url, files=files, data=data, timeout=120)

        if r.status_code == 200:
            result = r.json()
            log_pass("Transcribe — dual lang",
                     f"bestLang={result.get('langGuess')}, "
                     f"shouldSwitch={result.get('shouldSwitchLang')}")
        else:
            body = r.text[:200]
            log_fail(f"Transcribe — dual lang", f"Status {r.status_code}: {body}")
    except Exception as e:
        log_fail("Transcribe — dual lang", str(e))

    # Test 3: Missing audio field
    try:
        data = {'sessionId': fake_session_id}
        r = requests.post(url, data=data, timeout=10)
        if r.status_code == 400:
            log_pass("Transcribe — missing audio → 400")
        else:
            log_fail("Transcribe — missing audio → 400", f"Got status {r.status_code}")
    except Exception as e:
        log_fail("Transcribe — missing audio", str(e))


# ═══════════════════════════════════════════════════════════════════════
#  TEST 4: API — /api/voice/speak
# ═══════════════════════════════════════════════════════════════════════

def test_api_speak(base_url: str):
    log_section("TEST 4: API /api/voice/speak")

    try:
        import requests
    except ImportError:
        log_skip("API tests", "Install requests: pip install requests")
        return

    try:
        r = requests.get(base_url, timeout=5)
    except requests.ConnectionError:
        log_skip("API speak", f"Server not running at {base_url}")
        return

    import uuid
    url = f"{base_url}/api/voice/speak"
    fake_tenant_id = str(uuid.uuid4())
    fake_session_id = str(uuid.uuid4())

    # Test 1: Basic TTS
    try:
        payload = {
            "text": "Bonjour, bienvenue dans notre salon!",
            "tenantId": fake_tenant_id,
            "sessionId": fake_session_id,
            "language": "fr"
        }
        r = requests.post(url, json=payload, timeout=30)

        if r.status_code == 200 and r.headers.get('content-type', '').startswith('audio/'):
            audio_size = len(r.content)
            output_file = str(TEST_DIR / "tts_output_fr.mp3")
            with open(output_file, 'wb') as f:
                f.write(r.content)
            log_pass(f"TTS — French", f"Audio size: {audio_size} bytes → {output_file}")
        elif r.status_code == 500:
            result = r.json()
            if "ELEVENLABS_API_KEY" in result.get("error", ""):
                log_skip("TTS — French", "ELEVENLABS_API_KEY not configured")
            else:
                log_fail("TTS — French", f"Status 500: {result.get('error', '')[:200]}")
        else:
            log_fail("TTS — French", f"Status {r.status_code}")
    except Exception as e:
        log_fail("TTS — French", str(e))

    # Test 2: English TTS
    try:
        payload = {
            "text": "Hello, welcome to our salon!",
            "tenantId": fake_tenant_id,
            "sessionId": fake_session_id,
            "language": "en"
        }
        r = requests.post(url, json=payload, timeout=30)

        if r.status_code == 200 and r.headers.get('content-type', '').startswith('audio/'):
            audio_size = len(r.content)
            output_file = str(TEST_DIR / "tts_output_en.mp3")
            with open(output_file, 'wb') as f:
                f.write(r.content)
            log_pass(f"TTS — English", f"Audio size: {audio_size} bytes → {output_file}")
        elif r.status_code == 500:
            result = r.json()
            if "ELEVENLABS_API_KEY" in result.get("error", ""):
                log_skip("TTS — English", "ELEVENLABS_API_KEY not configured")
            else:
                log_fail("TTS — English", f"Status 500: {result.get('error', '')[:200]}")
        else:
            log_fail("TTS — English", f"Status {r.status_code}")
    except Exception as e:
        log_fail("TTS — English", str(e))

    # Test 3: Missing text → error
    try:
        payload = {"tenantId": fake_tenant_id, "sessionId": fake_session_id}
        r = requests.post(url, json=payload, timeout=10)
        if r.status_code == 400:
            log_pass("TTS — missing text → 400")
        else:
            log_fail("TTS — missing text → 400", f"Got status {r.status_code}")
    except Exception as e:
        log_fail("TTS — missing text", str(e))


# ═══════════════════════════════════════════════════════════════════════
#  TEST 5: Full Voice Chat Flow
# ═══════════════════════════════════════════════════════════════════════

def test_full_flow(base_url: str):
    log_section("TEST 5: Full Voice Chat Flow (simulated)")

    try:
        import requests
    except ImportError:
        log_skip("Full flow", "Install requests: pip install requests")
        return

    try:
        r = requests.get(base_url, timeout=5)
    except requests.ConnectionError:
        log_skip("Full flow", f"Server not running at {base_url}")
        return

    print(f"  {CYAN}[INFO] This test simulates a voice chat using text-based voiceTranscript{RESET}")
    print(f"  {CYAN}       (no actual audio recording -- just validates the full API chain){RESET}\n")

    import uuid

    # Step 1: Start a session (needs a valid tenant_id in the DB)
    # We'll try with a fake tenant — expect 404 but verify the endpoint works
    try:
        fake_tenant_id = str(uuid.uuid4())
        payload = {
            "tenantId": fake_tenant_id,
            "mode": "startup",
            "language": "fr",
            "niche": "restauration"
        }
        r = requests.post(f"{base_url}/api/session/start", json=payload, timeout=10)

        if r.status_code == 200:
            session = r.json()
            session_id = session["sessionId"]
            log_pass(f"Session started", f"sessionId={session_id}")

            # Step 2: Send a voice transcript message
            msg_payload = {
                "message": "test",
                "voiceTranscript": "Bonjour, je voudrais créer un site web pour mon restaurant",
                "languageOverride": "fr"
            }
            r2 = requests.post(
                f"{base_url}/api/session/{session_id}/message",
                json=msg_payload, timeout=30
            )

            if r2.status_code == 200:
                msg = r2.json()
                log_pass("Voice message sent",
                         f"reply length={len(msg.get('reply', ''))}, "
                         f"provider={msg.get('provider')}, "
                         f"isVoiceInput={msg.get('isVoiceInput')}, "
                         f"language={msg.get('language')}")

                # Step 3: TTS the reply
                speak_payload = {
                    "text": msg.get("reply", "Bonjour!")[:200],
                    "tenantId": fake_tenant_id,
                    "sessionId": session_id,
                    "language": "fr"
                }
                r3 = requests.post(f"{base_url}/api/voice/speak", json=speak_payload, timeout=30)

                if r3.status_code == 200 and 'audio' in r3.headers.get('content-type', ''):
                    audio_file = str(TEST_DIR / "flow_reply.mp3")
                    with open(audio_file, 'wb') as f:
                        f.write(r3.content)
                    log_pass("Reply → TTS audio", f"{len(r3.content)} bytes → {audio_file}")
                elif r3.status_code == 500 and "ELEVENLABS" in r3.text:
                    log_skip("Reply → TTS audio", "ELEVENLABS_API_KEY not set")
                else:
                    log_fail("Reply → TTS audio", f"Status {r3.status_code}")

            else:
                log_fail("Voice message", f"Status {r2.status_code}: {r2.text[:200]}")

        elif r.status_code == 404:
            log_skip("Full flow",
                     "Tenant not found (expected — create a tenant in Supabase first)")
        else:
            log_fail("Session start", f"Status {r.status_code}: {r.text[:200]}")

    except Exception as e:
        log_fail("Full flow", str(e))


# ═══════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Vosk + Voice Integration Test Suite")
    parser.add_argument('--api', action='store_true', help='Include API tests (requires running server)')
    parser.add_argument('--base-url', default='http://localhost:3000', help='Base URL of the Next.js server')

    args = parser.parse_args()

    print(f"\n{BOLD}{'=' * 60}{RESET}")
    print(f"{BOLD}  VOSK + VOICE INTEGRATION -- TEST SUITE{RESET}")
    print(f"{BOLD}{'=' * 60}{RESET}")

    # Create test output directory
    TEST_DIR.mkdir(parents=True, exist_ok=True)

    # Always run offline tests
    test_vosk_python_script()
    test_language_detector()

    # API tests only when --api flag is set
    if args.api:
        test_api_transcribe(args.base_url)
        test_api_speak(args.base_url)
        test_full_flow(args.base_url)
    else:
        print(f"\n  {YELLOW}[INFO] Skipping API tests. Run with --api to include them.{RESET}")
        print(f"  {YELLOW}       Make sure the Next.js server is running first: npm run dev{RESET}")

    # Summary
    total = passed + failed + skipped
    print(f"\n{BOLD}{'=' * 60}{RESET}")
    print(f"{BOLD}  RESULTS{RESET}")
    print(f"{BOLD}{'=' * 60}{RESET}")
    print(f"  {GREEN}Passed:  {passed}{RESET}")
    print(f"  {RED}Failed:  {failed}{RESET}")
    print(f"  {YELLOW}Skipped: {skipped}{RESET}")
    print(f"  Total:    {total}")

    if failed > 0:
        print(f"\n  {RED}{BOLD}Some tests failed!{RESET}")
        sys.exit(1)
    else:
        print(f"\n  {GREEN}{BOLD}All tests passed (or skipped)!{RESET}")

    # Cleanup hint
    print(f"\n  {CYAN}Test files saved in: {TEST_DIR}{RESET}")
    print(f"  {CYAN}To clean up: rmdir /s /q test_output{RESET}\n")


if __name__ == "__main__":
    main()

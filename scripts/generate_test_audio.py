#!/usr/bin/env python3
"""
Generate a test WAV file with spoken text using system TTS (pyttsx3)
or a simple sine tone if TTS is not available.

Usage:
    python scripts/generate_test_audio.py --output test_fr.wav --lang fr
    python scripts/generate_test_audio.py --output test_en.wav --lang en
    python scripts/generate_test_audio.py --output test_tone.wav --tone
"""

import argparse
import struct
import wave
import math
import sys


def generate_sine_wav(filename: str, freq: float = 440, duration: float = 3.0, sample_rate: int = 16000):
    """Generate a simple sine wave WAV file (PCM 16kHz 16-bit mono)."""
    n_samples = int(sample_rate * duration)
    amplitude = 16000

    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)

        for i in range(n_samples):
            value = int(amplitude * math.sin(2 * math.pi * freq * i / sample_rate))
            data = struct.pack('<h', value)
            wf.writeframes(data)

    print(f"[OK] Tone WAV generated: {filename} ({duration}s, {freq}Hz, {sample_rate}Hz)")


def generate_silence_wav(filename: str, duration: float = 2.0, sample_rate: int = 16000):
    """Generate a silent WAV file (useful as baseline test)."""
    n_samples = int(sample_rate * duration)

    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b'\x00\x00' * n_samples)

    print(f"[OK] Silent WAV generated: {filename} ({duration}s)")


def generate_tts_wav(filename: str, text: str, lang: str = 'fr'):
    """Generate a WAV file with spoken text using pyttsx3 (offline TTS)."""
    try:
        import pyttsx3
    except ImportError:
        print("[WARN] pyttsx3 not installed. Install with: pip install pyttsx3")
        print("[INFO] Falling back to sine tone generation.")
        generate_sine_wav(filename)
        return

    engine = pyttsx3.init()

    # Try to set language-appropriate voice
    voices = engine.getProperty('voices')
    target_lang = 'french' if lang == 'fr' else 'english'

    for voice in voices:
        if target_lang in voice.name.lower() or target_lang in str(voice.languages).lower():
            engine.setProperty('voice', voice.id)
            break

    engine.setProperty('rate', 150)

    # Save to file
    engine.save_to_file(text, filename)
    engine.runAndWait()

    # Convert to 16kHz mono if needed (pyttsx3 may output at different rate)
    try:
        import subprocess
        temp_file = filename + '.tmp.wav'
        import shutil
        shutil.move(filename, temp_file)
        subprocess.run([
            'ffmpeg', '-y', '-i', temp_file,
            '-ar', '16000', '-ac', '1', '-sample_fmt', 's16',
            filename
        ], capture_output=True)
        import os
        os.remove(temp_file)
        print(f"[OK] TTS WAV generated and converted: {filename} (lang={lang})")
    except Exception:
        print(f"[OK] TTS WAV generated: {filename} (lang={lang}, may need manual conversion to 16kHz)")


def main():
    parser = argparse.ArgumentParser(description="Generate test audio files")
    parser.add_argument('--output', '-o', default='test_audio.wav', help='Output WAV filename')
    parser.add_argument('--lang', '-l', default='fr', choices=['fr', 'en'], help='Language for TTS')
    parser.add_argument('--tone', action='store_true', help='Generate sine tone instead of TTS')
    parser.add_argument('--silence', action='store_true', help='Generate silence')
    parser.add_argument('--text', '-t', default=None, help='Custom text to speak')

    args = parser.parse_args()

    if args.silence:
        generate_silence_wav(args.output)
    elif args.tone:
        generate_sine_wav(args.output)
    else:
        default_texts = {
            'fr': "Bonjour, je suis intéressé par vos services de création de site web pour mon restaurant.",
            'en': "Hello, I am interested in your web design services for my restaurant business.",
        }
        text = args.text or default_texts[args.lang]
        generate_tts_wav(args.output, text, args.lang)


if __name__ == "__main__":
    main()

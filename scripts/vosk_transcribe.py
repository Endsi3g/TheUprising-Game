#!/usr/bin/env python3
"""
Vosk offline speech-to-text transcription script.
Called by the Node.js backend as a subprocess.

Usage:
    python vosk_transcribe.py --model <model_path> --file <audio_path>
    echo <raw_audio> | python vosk_transcribe.py --model <model_path> --stdin

Output (JSON to stdout):
    { "text": "transcribed text", "confidence": 0.95 }
"""

import argparse
import json
import sys
import wave
import os

from vosk import Model, KaldiRecognizer


def transcribe_file(model_path: str, audio_path: str) -> dict:
    """Transcribe a WAV file (PCM 16kHz 16-bit mono)."""
    if not os.path.exists(model_path):
        return {"text": "", "confidence": 0, "error": f"Model not found: {model_path}"}

    model = Model(model_path)
    rec = KaldiRecognizer(model, 16000)
    rec.SetWords(True)

    try:
        wf = wave.open(audio_path, "rb")
    except Exception as e:
        return {"text": "", "confidence": 0, "error": f"Cannot open audio: {str(e)}"}

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        return {
            "text": "",
            "confidence": 0,
            "error": f"Audio must be PCM 16kHz 16-bit mono. Got: "
                     f"channels={wf.getnchannels()}, width={wf.getsampwidth()}, rate={wf.getframerate()}"
        }

    total_confidence = 0.0
    word_count = 0

    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        rec.AcceptWaveform(data)

    wf.close()

    # Get final result
    final = json.loads(rec.FinalResult())
    text = final.get("text", "")

    # Calculate average confidence from word-level results
    if "result" in final:
        for word_info in final["result"]:
            total_confidence += word_info.get("conf", 0)
            word_count += 1

    avg_confidence = (total_confidence / word_count) if word_count > 0 else 0.0

    return {
        "text": text,
        "confidence": round(avg_confidence, 3),
    }


def transcribe_stdin(model_path: str) -> dict:
    """Transcribe raw PCM audio from stdin."""
    if not os.path.exists(model_path):
        return {"text": "", "confidence": 0, "error": f"Model not found: {model_path}"}

    model = Model(model_path)
    rec = KaldiRecognizer(model, 16000)
    rec.SetWords(True)

    # Read raw PCM from stdin
    data = sys.stdin.buffer.read()
    if len(data) == 0:
        return {"text": "", "confidence": 0, "error": "No audio data received"}

    # Process in chunks
    chunk_size = 8000
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]
        rec.AcceptWaveform(chunk)

    final = json.loads(rec.FinalResult())
    text = final.get("text", "")

    total_confidence = 0.0
    word_count = 0
    if "result" in final:
        for word_info in final["result"]:
            total_confidence += word_info.get("conf", 0)
            word_count += 1

    avg_confidence = (total_confidence / word_count) if word_count > 0 else 0.0

    return {
        "text": text,
        "confidence": round(avg_confidence, 3),
    }


def main():
    parser = argparse.ArgumentParser(description="Vosk speech-to-text transcription")
    parser.add_argument("--model", required=True, help="Path to the Vosk model directory")
    parser.add_argument("--file", help="Path to WAV audio file (PCM 16kHz 16-bit mono)")
    parser.add_argument("--stdin", action="store_true", help="Read raw PCM audio from stdin")

    args = parser.parse_args()

    if args.file:
        result = transcribe_file(args.model, args.file)
    elif args.stdin:
        result = transcribe_stdin(args.model)
    else:
        result = {"text": "", "confidence": 0, "error": "Specify --file or --stdin"}

    # Output JSON to stdout
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()

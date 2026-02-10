import { NextRequest, NextResponse } from 'next/server';
import { transcribe, transcribeDualLang } from '@/lib/vosk-service';
import {
    processLanguageGuess,
    detectLanguageFromText,
    createDetectionState,
    type LanguageDetectionState,
    type LangGuess,
} from '@/lib/language-detector';
import type { Language } from '@/types/database';

// ─── In-Memory Session Language State ─────────────────────────────────────────
// In production, move this to Redis or Supabase for persistence across restarts.

const sessionLangStates = new Map<string, LanguageDetectionState>();

function getOrCreateState(sessionId: string, lang: Language): LanguageDetectionState {
    if (!sessionLangStates.has(sessionId)) {
        sessionLangStates.set(sessionId, createDetectionState(lang));
    }
    return sessionLangStates.get(sessionId)!;
}

// ─── POST /api/voice/transcribe ───────────────────────────────────────────────

/**
 * Receives audio from the kiosk browser, transcribes it with Vosk,
 * runs language detection, and returns the transcript + language info.
 *
 * Accepts multipart/form-data:
 *   - audio: WAV/WebM audio blob (PCM 16kHz 16-bit mono)
 *   - sessionId: UUID of the current session
 *   - currentLang: current session language ('fr' | 'en')
 *   - dualLang: optional, set to 'true' to run both FR+EN models for auto-detection
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const audioFile = formData.get('audio');
        const sessionId = formData.get('sessionId') as string | null;
        const currentLang = (formData.get('currentLang') as Language) || 'fr';
        const dualLang = formData.get('dualLang') === 'true';

        if (!audioFile || !(audioFile instanceof Blob)) {
            return NextResponse.json(
                { error: 'Missing or invalid audio file. Send as multipart/form-data with field name "audio".' },
                { status: 400 }
            );
        }

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing sessionId field.' },
                { status: 400 }
            );
        }

        // Convert Blob → Buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        if (audioBuffer.length === 0) {
            return NextResponse.json(
                { error: 'Audio file is empty.' },
                { status: 400 }
            );
        }

        // Validate file size (max 25MB)
        if (audioBuffer.length > 25 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Audio file too large (max 25MB).' },
                { status: 413 }
            );
        }

        let transcript: string;
        let confidence: number;
        let langGuess: Language;
        let error: string | undefined;

        if (dualLang) {
            // Run both FR + EN models for language auto-detection
            const dualResult = await transcribeDualLang(audioBuffer);
            transcript = dualResult.bestText;
            confidence = dualResult.bestConfidence;
            langGuess = dualResult.bestLang;

            if (dualResult.primary.error) error = dualResult.primary.error;
            if (dualResult.secondary.error) error = error ? `${error}; ${dualResult.secondary.error}` : dualResult.secondary.error;
        } else {
            // Single-language transcription
            const result = await transcribe(audioBuffer, currentLang);
            transcript = result.text;
            confidence = result.confidence;
            langGuess = currentLang;
            error = result.error;

            // Also run text-based language detection on the transcript
            if (transcript.length > 5) {
                const textGuess = detectLanguageFromText(transcript);
                if (textGuess.confidence > 0.7 && textGuess.lang !== currentLang) {
                    langGuess = textGuess.lang;
                    confidence = textGuess.confidence;
                }
            }
        }

        // Process language detection through the sliding window
        const state = getOrCreateState(sessionId, currentLang);
        const guess: LangGuess = { lang: langGuess, confidence };
        const { result: langResult, newState } = processLanguageGuess(state, guess);
        sessionLangStates.set(sessionId, newState);

        return NextResponse.json({
            transcript,
            confidence,
            langGuess,
            shouldSwitchLang: langResult.shouldSwitch,
            newSessionLang: langResult.newSessionLang,
            switchMessage: langResult.switchMessage,
            error,
        });
    } catch (err) {
        console.error('[Voice/Transcribe] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 });
        }

<<<<<<< HEAD
        // Validate file size before memory intensive operations (max 25MB)
        if (audioFile.size > 25 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Audio file too large (max 25MB).' },
                { status: 413 }
            );
        }

        // Convert Blob → Buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);
=======
        // Save blob to temp file (OpenAI SDK expects a file object or path in Node)
        // Note: fs access is generally server-side only. Next.js App Router runs in Node env.
        const buffer = Buffer.from(await file.arrayBuffer());
        const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.webm`);
>>>>>>> 91470b8 (Update: 2026-02-10 12:10)

        await writeFile(tempFilePath, buffer);

<<<<<<< HEAD
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
=======
        const openai = new OpenAI({ apiKey });

        // Call Whisper API
        const transcription = await openai.audio.transcriptions.create({
            file: createReadStream(tempFilePath),
            model: 'whisper-1',
            language: 'fr', // Force French for optimization
>>>>>>> 91470b8 (Update: 2026-02-10 12:10)
        });

        // Cleanup temp file
        await unlink(tempFilePath);

        return NextResponse.json({ text: transcription.text });

    } catch (error: any) {
        console.error('Transcription error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

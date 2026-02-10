import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';
import { rateLimitGuard } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    // ── Rate limiting (10 req/min per IP) ────────────────────────────────
    const limited = rateLimitGuard(req, { prefix: 'transcribe', max: 10 });
    if (limited) return limited;

    let tempFilePath: string | null = null;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file size (max 25MB)
        if (file.size > 25 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Audio file too large (max 25MB).' },
                { status: 413 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 });
        }

        // Save blob to temp file
        const buffer = Buffer.from(await file.arrayBuffer());
        tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.webm`);
        await writeFile(tempFilePath, buffer);

        const openai = new OpenAI({ apiKey });

        // Call Whisper API
        const transcription = await openai.audio.transcriptions.create({
            file: createReadStream(tempFilePath),
            model: 'whisper-1',
            language: 'fr',
        });

        return NextResponse.json({ text: transcription.text });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[Transcribe] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        // ── Always cleanup temp file ─────────────────────────────────────
        if (tempFilePath) {
            try {
                await unlink(tempFilePath);
            } catch {
                // File may not exist if write failed — ignore
            }
        }
    }
}

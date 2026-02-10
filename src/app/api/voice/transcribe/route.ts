import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip, 'transcribe', { limit: 5, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
    }

    let tempFilePath: string | null = null;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file size (max 25MB - OpenAI limit)
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
        // We use createReadStream from 'fs' but we can also just pass the path if using a form-data compatible lib,
        // but OpenAI Node SDK expects a ReadStream or File object.
        // We need to import createReadStream specifically.
        const { createReadStream } = await import('fs');

        const transcription = await openai.audio.transcriptions.create({
            file: createReadStream(tempFilePath),
            model: 'whisper-1',
            language: 'fr', // Defaulting to French as per requirement, or we could auto-detect
        });

        return NextResponse.json({ text: transcription.text });

    } catch (error: any) {
        console.error('Transcription error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    } finally {
        // Cleanup temp file
        if (tempFilePath) {
            try {
                await unlink(tempFilePath);
            } catch (cleanupError) {
                // Ignore cleanup errors (file might not exist if write failed)
                console.warn('Failed to delete temp file:', tempFilePath);
            }
        }
    }
}

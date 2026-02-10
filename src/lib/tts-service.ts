import type { Language } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TTSOptions {
    text: string;
    voiceId?: string;
    language?: Language;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
}

export interface TTSResult {
    audioBuffer: Buffer;
    contentType: string;
    error?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel

// Language → optimal model mapping
const LANGUAGE_MODELS: Record<Language, string> = {
    fr: 'eleven_multilingual_v2',
    en: 'eleven_multilingual_v2',
};

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

/**
 * Convert text to speech using ElevenLabs API.
 * Returns an MP3 audio buffer.
 */
export async function textToSpeech(opts: TTSOptions): Promise<TTSResult> {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        return {
            audioBuffer: Buffer.alloc(0),
            contentType: 'audio/mpeg',
            error: 'Missing ELEVENLABS_API_KEY environment variable',
        };
    }

    const {
        text,
        voiceId = DEFAULT_VOICE_ID,
        language = 'fr',
        modelId,
        stability = 0.5,
        similarityBoost = 0.75,
    } = opts;

    const model = modelId || LANGUAGE_MODELS[language];

    try {
        const response = await fetch(
            `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                    'Accept': 'audio/mpeg',
                },
                body: JSON.stringify({
                    text,
                    model_id: model,
                    voice_settings: {
                        stability,
                        similarity_boost: similarityBoost,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TTS] ElevenLabs error:', response.status, errorText);
            return {
                audioBuffer: Buffer.alloc(0),
                contentType: 'audio/mpeg',
                error: `ElevenLabs API error (${response.status}): ${errorText.slice(0, 200)}`,
            };
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        return {
            audioBuffer,
            contentType: 'audio/mpeg',
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown TTS error';
        console.error('[TTS] Error:', message);
        return {
            audioBuffer: Buffer.alloc(0),
            contentType: 'audio/mpeg',
            error: message,
        };
    }
}

/**
 * Stream text-to-speech using ElevenLabs streaming endpoint.
 * Returns a ReadableStream for real-time audio playback.
 */
export async function textToSpeechStream(opts: TTSOptions): Promise<{
    stream: ReadableStream<Uint8Array> | null;
    contentType: string;
    error?: string;
}> {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        return {
            stream: null,
            contentType: 'audio/mpeg',
            error: 'Missing ELEVENLABS_API_KEY environment variable',
        };
    }

    const {
        text,
        voiceId = DEFAULT_VOICE_ID,
        language = 'fr',
        modelId,
        stability = 0.5,
        similarityBoost = 0.75,
    } = opts;

    const model = modelId || LANGUAGE_MODELS[language];

    try {
        const response = await fetch(
            `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                    'Accept': 'audio/mpeg',
                },
                body: JSON.stringify({
                    text,
                    model_id: model,
                    voice_settings: {
                        stability,
                        similarity_boost: similarityBoost,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                stream: null,
                contentType: 'audio/mpeg',
                error: `ElevenLabs streaming error (${response.status}): ${errorText.slice(0, 200)}`,
            };
        }

        return {
            stream: response.body,
            contentType: 'audio/mpeg',
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown TTS stream error';
        return {
            stream: null,
            contentType: 'audio/mpeg',
            error: message,
        };
    }
}

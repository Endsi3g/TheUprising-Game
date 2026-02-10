import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import type { Language } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VoskTranscription {
    text: string;
    confidence: number;
    error?: string;
}

export interface DualLangTranscription {
    primary: VoskTranscription;
    secondary: VoskTranscription;
    bestLang: Language;
    bestText: string;
    bestConfidence: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MODEL_PATHS: Record<Language, string> = {
    fr: process.env.VOSK_MODEL_FR_PATH || path.join(process.cwd(), 'models', 'vosk-model-fr-0.22'),
    en: process.env.VOSK_MODEL_EN_PATH || path.join(process.cwd(), 'models', 'vosk-model-en-us-0.22'),
};

const PYTHON_BIN = process.env.PYTHON_BIN || 'python';
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'vosk_transcribe.py');

// ─── Transcription ────────────────────────────────────────────────────────────

/**
 * Transcribe a WAV audio buffer using Vosk (via Python subprocess).
 * The audio must be PCM 16kHz 16-bit mono WAV.
 */
export async function transcribe(
    audioBuffer: Buffer,
    lang: Language
): Promise<VoskTranscription> {
    const modelPath = MODEL_PATHS[lang];

    if (!fs.existsSync(modelPath)) {
        return {
            text: '',
            confidence: 0,
            error: `Vosk model not found at: ${modelPath}. Download it first.`,
        };
    }

    // Write audio to a temp file
    const tmpFile = path.join(os.tmpdir(), `vosk_${Date.now()}_${lang}.wav`);
    fs.writeFileSync(tmpFile, audioBuffer);

    try {
        const result = await runPythonScript(modelPath, tmpFile);
        return result;
    } finally {
        // Cleanup temp file
        try {
            fs.unlinkSync(tmpFile);
        } catch {
            // ignore cleanup errors
        }
    }
}

/**
 * Transcribe with both FR and EN models to determine the best language match.
 * Useful for auto-detection: the model with higher confidence wins.
 */
export async function transcribeDualLang(
    audioBuffer: Buffer
): Promise<DualLangTranscription> {
    const [frResult, enResult] = await Promise.all([
        transcribe(audioBuffer, 'fr'),
        transcribe(audioBuffer, 'en'),
    ]);

    const bestLang: Language = frResult.confidence >= enResult.confidence ? 'fr' : 'en';
    const best = bestLang === 'fr' ? frResult : enResult;

    return {
        primary: frResult,
        secondary: enResult,
        bestLang,
        bestText: best.text,
        bestConfidence: best.confidence,
    };
}

// ─── Python Subprocess ────────────────────────────────────────────────────────

function runPythonScript(
    modelPath: string,
    audioPath: string
): Promise<VoskTranscription> {
    return new Promise((resolve, reject) => {
        const proc = spawn(PYTHON_BIN, [
            SCRIPT_PATH,
            '--model', modelPath,
            '--file', audioPath,
        ]);

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        proc.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                console.error('[Vosk] Python script error:', stderr);
                resolve({
                    text: '',
                    confidence: 0,
                    error: `Vosk process exited with code ${code}: ${stderr.slice(0, 500)}`,
                });
                return;
            }

            try {
                const result = JSON.parse(stdout.trim());
                resolve({
                    text: result.text || '',
                    confidence: result.confidence || 0,
                    error: result.error,
                });
            } catch (parseErr) {
                resolve({
                    text: '',
                    confidence: 0,
                    error: `Failed to parse Vosk output: ${stdout.slice(0, 200)}`,
                });
            }
        });

        proc.on('error', (err) => {
            resolve({
                text: '',
                confidence: 0,
                error: `Failed to spawn Python: ${err.message}`,
            });
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            proc.kill('SIGTERM');
            resolve({
                text: '',
                confidence: 0,
                error: 'Vosk transcription timed out (30s)',
            });
        }, 30_000);
    });
}

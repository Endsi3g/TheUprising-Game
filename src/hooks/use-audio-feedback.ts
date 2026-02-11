import { useCallback, useRef } from 'react';

type FeedbackKind =
    | 'record-start'
    | 'record-stop'
    | 'message-send'
    | 'message-receive'
    | 'toggle-on';

interface Tone {
    frequency: number;
    durationMs: number;
    type: OscillatorType;
    gain: number;
}

const tonePresets: Record<FeedbackKind, Tone[]> = {
    'record-start': [
        { frequency: 520, durationMs: 90, type: 'sine', gain: 0.055 },
        { frequency: 700, durationMs: 110, type: 'sine', gain: 0.045 },
    ],
    'record-stop': [{ frequency: 260, durationMs: 120, type: 'triangle', gain: 0.055 }],
    'message-send': [{ frequency: 460, durationMs: 80, type: 'square', gain: 0.045 }],
    'message-receive': [
        { frequency: 390, durationMs: 70, type: 'triangle', gain: 0.045 },
        { frequency: 620, durationMs: 90, type: 'triangle', gain: 0.04 },
    ],
    'toggle-on': [{ frequency: 760, durationMs: 80, type: 'sine', gain: 0.05 }],
};

export function useAudioFeedback(isEnabled: boolean) {
    const audioContextRef = useRef<AudioContext | null>(null);

    const ensureAudioContext = useCallback(() => {
        if (typeof window === 'undefined') return null;

        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return null;
            audioContextRef.current = new AudioCtx();
        }

        return audioContextRef.current;
    }, []);

    const play = useCallback(
        (kind: FeedbackKind) => {
            if (!isEnabled) return;

            const ctx = ensureAudioContext();
            if (!ctx) return;

            let cursor = ctx.currentTime;
            const tones = tonePresets[kind];

            tones.forEach((tone) => {
                const oscillator = ctx.createOscillator();
                const gain = ctx.createGain();

                oscillator.type = tone.type;
                oscillator.frequency.setValueAtTime(tone.frequency, cursor);
                gain.gain.setValueAtTime(0.0001, cursor);
                gain.gain.exponentialRampToValueAtTime(tone.gain, cursor + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, cursor + tone.durationMs / 1000);

                oscillator.connect(gain);
                gain.connect(ctx.destination);

                oscillator.start(cursor);
                oscillator.stop(cursor + tone.durationMs / 1000 + 0.01);

                cursor += tone.durationMs / 1000 + 0.02;
            });
        },
        [ensureAudioContext, isEnabled]
    );

    return { play };
}

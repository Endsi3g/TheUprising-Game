import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTTSReturn {
    isPlaying: boolean;
    speak: (text: string) => Promise<void>;
    stop: () => void;
    error: string | null;
}

export function useTTS(): UseTTSReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }
    }, []);

    const speak = useCallback(async (text: string) => {
        console.log('[useTTS] speak called with:', text, typeof text);
        if (!text || typeof text !== 'string' || !text.trim()) {
            console.warn('[useTTS] Invalid text, aborting');
            return;
        }

        try {
            setError(null);
            stop(); // Stop any current playback

            const response = await fetch('/api/voice/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'TTS request failed');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = (e) => {
                console.error('Audio playback error', e);
                setIsPlaying(false);
                setError('Erreur de lecture audio');
            };

            await audio.play();

        } catch (err: unknown) {
            console.error('TTS Error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Erreur de synthèse vocale';
            setError(errorMessage);
            setIsPlaying(false);
        }
    }, [stop]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return { isPlaying, speak, stop, error };
}

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecorderReturn {
    isRecording: boolean;
    isTranscribing: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    transcript: string;
    resetTranscript: () => void;
    error: string | null;
}

interface UseVoiceRecorderOptions {
    onTranscript?: (text: string) => void;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const onTranscriptRef = useRef(options.onTranscript);

    useEffect(() => {
        onTranscriptRef.current = options.onTranscript;
    }, [options.onTranscript]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            chunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // webm is widely supported

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                try {
                    setIsTranscribing(true);
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'audio.webm');
                    formData.append('model', 'whisper-1');

                    // Call Next.js API route which will relay to OpenAI
                    const response = await fetch('/api/voice/transcribe', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) throw new Error('Transcription failed');

                    const data = await response.json();
                    if (data.text) {
                        setTranscript(data.text);
                        onTranscriptRef.current?.(data.text);
                    }
                } catch (err) {
                    console.error('Transcription error:', err);
                    setError('Erreur de transcription.');
                } finally {
                    setIsTranscribing(false);
                }

                // Clean up tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);

        } catch (err) {
            console.error('Failed to access microphone:', err);
            setError('Accès au micro refusé ou impossible.');
            setIsTranscribing(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return {
        isRecording,
        isTranscribing,
        startRecording,
        stopRecording,
        transcript,
        resetTranscript,
        error
    };
}

'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import { gameReducer, initialGameState, type GameState, type GameAction } from '@/lib/game-state';
import type { SessionMode, Niche, Language, ReportJson } from '@/types/database';

const STORAGE_KEY = 'uprising_game_state';

function isValidHydrationCandidate(value: unknown): value is Partial<GameState> {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<GameState>;
    return typeof candidate.phase === 'string' && candidate.phase.length > 0;
}

function sanitizeHydratedState(candidate: Partial<GameState>): GameState {
    return {
        ...initialGameState,
        ...candidate,
        conversation: Array.isArray(candidate.conversation) ? candidate.conversation : [],
        isLoading: false,
        error: null,
        isInitialized: true,
    };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GameContextValue {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    // Convenience methods
    selectMode: (mode: SessionMode) => void;
    selectNiche: (niche: Niche) => void;
    setCompanyInfo: (companyName: string, siteUrl?: string) => void;
    setLanguage: (language: Language) => void;
    addUserMessage: (content: string) => void;
    addAssistantMessage: (content: string) => void;
    setReport: (report: ReportJson) => void;
    reset: () => void;
    sendMessage: (content: string) => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GameProvider({ children, initialMode }: { children: ReactNode; initialMode?: SessionMode }) {
    const [state, dispatch] = useReducer(gameReducer, {
        ...initialGameState,
        mode: initialMode ?? null,
        phase: initialMode ? 'company_info' : 'mode_select',
    });

    const selectMode = useCallback((mode: SessionMode) => {
        dispatch({ type: 'SELECT_MODE', mode });
    }, []);

    const selectNiche = useCallback((niche: Niche) => {
        dispatch({ type: 'SELECT_NICHE', niche });
    }, []);

    const setCompanyInfo = useCallback((companyName: string, siteUrl?: string) => {
        dispatch({ type: 'SET_COMPANY_INFO', companyName, siteUrl });
    }, []);

    const setLanguage = useCallback((language: Language) => {
        dispatch({ type: 'SET_LANGUAGE', language });
    }, []);

    const addUserMessage = useCallback((content: string) => {
        dispatch({ type: 'ADD_USER_MESSAGE', content });
    }, []);

    const addAssistantMessage = useCallback((content: string) => {
        dispatch({ type: 'ADD_ASSISTANT_MESSAGE', content });
    }, []);

    const setReport = useCallback((report: ReportJson) => {
        dispatch({ type: 'SET_REPORT', report });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        dispatch({ type: 'ADD_USER_MESSAGE', content });
        dispatch({ type: 'SET_LOADING', loading: true });
        dispatch({ type: 'SET_ERROR', error: null });

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    mode: state.mode ?? undefined,
                    niche: state.niche ?? undefined,
                    language: state.language,
                    companyName: state.companyName,
                    siteUrl: state.siteUrl,
                    history: state.conversation,
                    sessionId: state.sessionId ?? undefined,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to get AI response');
            }

            const data = await res.json();
            const assistantMsg = data.message ?? data.response ?? '';

            dispatch({ type: 'ADD_ASSISTANT_MESSAGE', content: assistantMsg });

            // Check if AI signals report readiness
            if (assistantMsg.includes('[READY_FOR_REPORT]')) {
                dispatch({ type: 'START_REPORT_GENERATION' });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            dispatch({ type: 'SET_ERROR', error: msg });
            toast.error(`Erreur: ${msg}`);
        } finally {
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    }, [state.mode, state.niche, state.language, state.companyName, state.siteUrl, state.conversation, state.sessionId, dispatch]);

    // DB Persistence: Auto-initialize session when company info and niche are ready
    useEffect(() => {
        if (state.phase === 'conversation' && !state.sessionId && state.companyName && state.mode) {
            const startSession = async () => {
                try {
                    const res = await fetch('/api/game/session/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mode: state.mode,
                            niche: state.niche,
                            language: state.language,
                            companyName: state.companyName,
                            siteUrl: state.siteUrl,
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.sessionId) {
                            dispatch({ type: 'SET_SESSION_ID', sessionId: data.sessionId });
                        }
                    }
                } catch (err) {
                    console.error('[Session] Failed to auto-start session:', err);
                }
            };
            startSession();
        }
    }, [state.phase, state.sessionId, state.companyName, state.mode, state.niche, state.language, state.siteUrl, dispatch]);

    // LocalStorage Persistence
    useEffect(() => {
        if (!state.isInitialized) return;

        if (state.phase !== 'idle' && state.phase !== 'mode_select') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [state]);

    // Hydration
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (!savedState) {
                dispatch({ type: 'SET_INITIALIZED' });
                return;
            }

            const parsed = JSON.parse(savedState) as unknown;
            if (!isValidHydrationCandidate(parsed)) {
                localStorage.removeItem(STORAGE_KEY);
                dispatch({ type: 'SET_INITIALIZED' });
                return;
            }

            dispatch({ type: 'HYDRATE', state: sanitizeHydratedState(parsed) });
        } catch (e) {
            console.error('Failed to parse saved state', e);
            localStorage.removeItem(STORAGE_KEY);
            dispatch({ type: 'SET_INITIALIZED' });
        }
    }, []);


    // Auto-trigger report generation
    useEffect(() => {
        let mounted = true;

        if (state.phase === 'generating_report') {
            const generate = async () => {
                try {
                    // Set a timeout for report generation (e.g., 60s)
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 60000);

                    const res = await fetch('/api/game/generate-report', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mode: state.mode,
                            niche: state.niche,
                            language: state.language,
                            history: state.conversation,
                            companyName: state.companyName,
                            siteUrl: state.siteUrl,
                            sessionId: state.sessionId,
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!res.ok) throw new Error('Report generation failed');

                    const data = await res.json();
                    if (mounted) {
                        dispatch({ type: 'SET_REPORT', report: data.report });
                    }
                } catch (err) {
                    console.error(err);
                    if (mounted) {
                        const errMsg = err instanceof Error && err.name === 'AbortError'
                            ? 'Le délai de génération a expiré.'
                            : 'Failed to generate report';

                        dispatch({ type: 'SET_ERROR', error: errMsg });
                        toast.error("Échec de la génération du rapport");
                    }
                }
            };

            generate();
        }

        return () => { mounted = false; };
    }, [state.phase, state.mode, state.niche, state.language, state.conversation, state.companyName, state.siteUrl, state.sessionId, dispatch]);

    return (
        <GameContext.Provider value={{
            state,
            dispatch,
            selectMode,
            selectNiche,
            setCompanyInfo,
            setLanguage,
            addUserMessage,
            addAssistantMessage,
            setReport,
            reset,
            sendMessage,
        }}>
            {children}
        </GameContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(): GameContextValue {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return ctx;
}

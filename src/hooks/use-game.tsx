'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { gameReducer, initialGameState, type GameState, type GameAction } from '@/lib/game-state';
import type { SessionMode, Niche, Language, ReportJson } from '@/types/database';

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
        dispatch({ type: 'ADD_USER_MESSAGE', content });
        dispatch({ type: 'SET_LOADING', loading: true });

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    mode: state.mode,
                    niche: state.niche,
                    language: state.language,
                    companyName: state.companyName,
                    siteUrl: state.siteUrl,
                    history: state.conversation,
                }),
            });

            if (!res.ok) throw new Error('Failed to get AI response');

            const data = await res.json();
            dispatch({ type: 'ADD_ASSISTANT_MESSAGE', content: data.message ?? data.response ?? '' });

            // Check if AI signals report readiness
            if (data.message?.includes('[READY_FOR_REPORT]') || data.response?.includes('[READY_FOR_REPORT]')) {
                dispatch({ type: 'START_REPORT_GENERATION' });
            }
        } catch (err) {
            dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Unknown error' });
        }
    }, [state.mode, state.niche, state.language, state.companyName, state.siteUrl, state.conversation]);

    // Auto-trigger report generation
    useEffect(() => {
        let mounted = true;

        if (state.phase === 'generating_report') {
            const generate = async () => {
                try {
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
                        }),
                    });

                    if (!res.ok) throw new Error('Report generation failed');

                    const data = await res.json();
                    if (mounted) {
                        dispatch({ type: 'SET_REPORT', report: data.report });
                    }
                } catch (err) {
                    console.error(err);
                    if (mounted) {
                        dispatch({ type: 'SET_ERROR', error: 'Failed to generate report' });
                    }
                }
            };

            generate();
        }

        return () => { mounted = false; };
    }, [state.phase, state.mode, state.niche, state.language, state.conversation, state.companyName, state.siteUrl]);

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
        }
        }>
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

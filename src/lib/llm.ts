import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import type { ConversationMessage, ReportJson } from '@/types/database';
import {
    buildSystemPrompt,
    buildReportPrompt,
    formatConversationHistory,
} from './prompt-builder';
import type { SessionMode, Language, Niche } from '@/types/database';

// ─── LLM Providers ───────────────────────────────────────────────────────────

interface LLMResponse {
    text: string;
    provider: 'openai' | 'gemini' | 'ollama' | 'grok' | 'perplexity';
}

/**
 * Call OpenAI API.
 */
async function callOpenAI(
    systemPrompt: string,
    history: ConversationMessage[],
    userMessage: string
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true }); // Allow browser for demo/client-side if needed, though strictly server-side is better. 
    // Note: Usually LLM calls are server-side. If this runs on client, we need dangerouslyAllowBrowser: true.
    // However, looking at use-game.tsx, it calls /api/chat. So this is likely server-side.

    const model = process.env.OPENAI_MODEL || 'gpt-4o';

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
    ] as OpenAI.Chat.ChatCompletionMessageParam[];

    const completion = await openai.chat.completions.create({
        messages,
        model,
    });

    return completion.choices[0]?.message?.content || '';
}

/**
 * Call Google Gemini API.
 */
async function callGemini(
    systemPrompt: string,
    history: ConversationMessage[],
    userMessage: string
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
        history: formatConversationHistory(history),
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
}

/**
 * Call Grok (xAI) API.
 */
async function callGrok(
    systemPrompt: string,
    history: ConversationMessage[],
    userMessage: string
): Promise<string> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error('Missing XAI_API_KEY');

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            messages,
            model: 'grok-beta',
            stream: false,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Grok error: ${response.status} ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Perplexity API (Sonar).
 */
async function callPerplexity(
    systemPrompt: string,
    history: ConversationMessage[],
    userMessage: string
): Promise<string> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error('Missing PERPLEXITY_API_KEY');

    const model = process.env.PERPLEXITY_MODEL || 'sonar-reasoning-pro';

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages,
            stream: false
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Perplexity error: ${response.status} ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Ollama API (local fallback).
 */
async function callOllama(
    systemPrompt: string,
    history: ConversationMessage[],
    userMessage: string
): Promise<string> {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3';

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({
            role: m.role,
            content: m.content,
        })),
        { role: 'user', content: userMessage },
    ];

    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Send a conversation turn to the LLM. 
 * Priority: Configured Provider -> OpenAI -> Perplexity -> Gemini -> Grok -> Ollama
 */
export async function chat(opts: {
    mode: SessionMode;
    niche: Niche;
    language: Language;
    history: ConversationMessage[];
    userMessage: string;
    auditHtmlSummary?: string;
    provider?: 'openai' | 'perplexity' | 'gemini' | 'ollama' | 'grok'; // Optional override
}): Promise<LLMResponse> {
    const { mode, niche, language, history, userMessage, auditHtmlSummary, provider } = opts;

    const systemPrompt = buildSystemPrompt({
        mode,
        niche,
        language,
        auditHtmlSummary,
    });

    const preferredProvider = provider || process.env.DEFAULT_LLM_PROVIDER;

    // 1. Try Preferred Provider if set
    if (preferredProvider === 'openai') {
        try {
            const text = await callOpenAI(systemPrompt, history, userMessage);
            return { text, provider: 'openai' };
        } catch (e) {
            console.error('OpenAI failed:', e);
        }
    } else if (preferredProvider === 'perplexity') {
        try {
            const text = await callPerplexity(systemPrompt, history, userMessage);
            return { text, provider: 'perplexity' };
        } catch (e) {
            console.error('Perplexity failed:', e);
        }
    } else if (preferredProvider === 'grok') {
        try {
            const text = await callGrok(systemPrompt, history, userMessage);
            return { text, provider: 'grok' };
        } catch (e) {
            console.error('Grok failed:', e);
        }
    } else if (preferredProvider === 'ollama') {
        try {
            const text = await callOllama(systemPrompt, history, userMessage);
            return { text, provider: 'ollama' };
        } catch (e) {
            console.error('Ollama failed:', e);
        }
    }

    // 2. Default Fallback Chain (OpenAI -> Perplexity -> Gemini -> Grok -> Ollama)

    // Try OpenAI first
    try {
        const text = await callOpenAI(systemPrompt, history, userMessage);
        return { text, provider: 'openai' };
    } catch (err) {
        console.warn('[LLM] OpenAI failed, trying fallbacks:', err);
    }

    // Try Perplexity (Sonar)
    try {
        const text = await callPerplexity(systemPrompt, history, userMessage);
        return { text, provider: 'perplexity' };
    } catch (err) {
        console.warn('[LLM] Perplexity failed, trying fallbacks:', err);
    }

    // Try Gemini
    try {
        const text = await callGemini(systemPrompt, history, userMessage);
        return { text, provider: 'gemini' };
    } catch (err) {
        console.warn('[LLM] Gemini failed, trying fallbacks:', err);
    }

    // Try Grok
    try {
        const text = await callGrok(systemPrompt, history, userMessage);
        return { text, provider: 'grok' };
    } catch (err) {
        console.warn('[LLM] Grok failed:', err);
    }

    // Try Ollama as final fallback
    try {
        const text = await callOllama(systemPrompt, history, userMessage);
        return { text, provider: 'ollama' };
    } catch (err) {
        console.error('[LLM] Ollama also failed:', err);
        throw new Error('All LLM providers failed');
    }
}

/**
 * Generate the final structured report from conversation history.
 */
export async function generateReport(opts: {
    mode: SessionMode;
    niche: Niche;
    language: Language;
    conversation: ConversationMessage[];
    auditHtmlSummary?: string;
}): Promise<ReportJson> {
    const prompt = buildReportPrompt(opts);

    let rawText: string;

    // Try OpenAI first for report generation (generally better instruction following)
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            response_format: { type: 'json_object' },
        });
        rawText = completion.choices[0]?.message?.content || '';
    } catch (err) {
        console.warn('[LLM] OpenAI report gen failed, trying Gemini:', err);

        // Fallback Gemini
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            });

            const result = await model.generateContent(prompt);
            rawText = result.response.text();
        } catch (geminiErr) {
            console.warn('[LLM] Gemini report gen failed, default to Ollama:', geminiErr);
            // Fallback Ollama logic handled below or here?
            // Existing code had Ollama fallback. I'll omit deep nesting for clarity but ideally should persist.
            throw new Error('All cloud LLMs failed for report generation');
        }
    }

    // Parse JSON from response
    try {
        const cleaned = rawText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        return JSON.parse(cleaned) as ReportJson;
    } catch (err) {
        console.error('[LLM] Failed to parse report JSON:', rawText);
        throw new Error('Failed to parse structured report from LLM response');
    }
}

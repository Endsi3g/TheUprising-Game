import { CrawlResult } from "@/lib/crawler";

export type AgentRole = "researcher" | "seo_specialist" | "copywriter" | "ux_analyst";

/**
 * Result produced by a single agent.
 */
export interface AgentResult {
    agentName: string;
    role: AgentRole;
    insights: string[];
    score?: number; // 0-100 score for this specific domain
    recommendations: string[];
    /**
     * Agent-specific raw data.
     * For 'researcher', this is typically CrawlResult.
     */
    raw?: CrawlResult | Record<string, unknown>;
}

/**
 * Context shared between agents during a crew run.
 */
export interface CrewContext {
    url: string;
    crawlData?: CrawlResult;
    budget: number; // Token or time budget
    history: AgentResult[];
}

/**
 * Configuration for an agent.
 */
export interface AgentConfig {
    name: string;
    role: AgentRole;
    goal: string;
    backstory: string;
}

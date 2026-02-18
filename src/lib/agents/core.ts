import { AgentConfig, AgentResult, CrewContext } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Base class for all agents.
 */
export abstract class Agent {
    protected config: AgentConfig;

    constructor(config: AgentConfig) {
        this.config = config;
    }

    /**
     * Main execution method for the agent.
     */
    abstract work(context: CrewContext): Promise<AgentResult>;

    /**
     * Helper to call LLM with agent persona.
     */
    protected async askLLM(prompt: string, context: CrewContext): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

        const systemPrompt = `
      You are ${this.config.name}, a world-class ${this.config.role}.
      GOAL: ${this.config.goal}
      BACKSTORY: ${this.config.backstory}
      
      Analyze the provided data and return insights.
    `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt 
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}

/**
 * Orchestrator that manages the agents.
 */
export class Crew {
    private agents: Agent[];
    private context: CrewContext;

    constructor(agents: Agent[], url: string) {
        this.agents = agents;
        this.context = {
            url,
            budget: 10000,
            history: [],
        };
    }

    /**
     * Run all agents sequentially (can be parallelized later).
     */
    async kickoff(): Promise<AgentResult[]> {
        console.log(`🚀 Crew starting audit for ${this.context.url}`);

        for (const agent of this.agents) {
            console.log(`🤖 Agent ${agent['config'].name} working...`);
            try {
                const result = await agent.work(this.context);
                this.context.history.push(result);

                // If this was the researcher, update context with crawl data
                if (result.role === 'researcher' && result.raw) {
                    this.context.crawlData = result.raw;
                }
            } catch (err) {
                console.error(`❌ Agent ${agent['config'].name} failed:`, err);
                this.context.history.push({
                    agentName: agent['config'].name,
                    role: agent['config'].role,
                    insights: [`Error: ${err instanceof Error ? err.message : String(err)}`],
                    recommendations: [],
                });
            }
        }

        console.log(`🏁 Crew finished. Generated ${this.context.history.length} reports.`);
        return this.context.history;
    }
}

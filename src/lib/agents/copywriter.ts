import { Agent } from "./core";
import { AgentResult, CrewContext } from "./types";
import { chat } from "@/lib/llm"; // Reuse our LLM wrapper

export class CopywriterAgent extends Agent {
    constructor() {
        super({
            name: "Wordsmith",
            role: "copywriter",
            goal: "Analyze the tone, clarity, and persuasive power of the content.",
            backstory: "A veteran copywriter who believes every word must earn its place on the page. Hate jargon, love clarity.",
        });
    }

    async work(context: CrewContext): Promise<AgentResult> {
        const data = context.crawlData;
        if (!data) throw new Error("No crawl data available for Copy analysis");

        // Construct a prompt for the LLM to analyze the content summary
        const prompt = `
      Analyze the following website content summary from a copywriting perspective.
      
      URL: ${context.url}
      Title: ${data.title}
      Description: ${data.metaDescription}
      Summary: ${data.summary}

      Evaluate:
      1. Clarity of the value proposition (Is it clear what they do?)
      2. Tone of voice (Is it appropriate for the sector?)
      3. Persuasiveness (Do they use social proof, benefits over features?)
      
      Return a JSON object with:
      {
        "score": number (0-100),
        "insights": string[],
        "recommendations": string[]
      }
    `;

        try {
            // We reuse the existing chat function which handles Gemini/Ollama fallback
            // We simulate a "user" message call
            const response = await chat({
                mode: 'audit',
                niche: 'marketing_web', // Generic fallback
                language: 'en', // Analysis is in English internaly
                history: [],
                userMessage: prompt,
                auditHtmlSummary: data.summary
            });

            // Extract JSON from response (naive parsing, robust implementation would use strict JSON mode)
            const text = response.text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            let analysis = { score: 50, insights: ["Failed to parse AI response"], recommendations: [] };

            if (jsonMatch) {
                try {
                    analysis = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error("Failed to parse Copywriter JSON", e);
                }
            }

            return {
                agentName: this.config.name,
                role: this.config.role,
                score: analysis.score || 50,
                insights: analysis.insights || [],
                recommendations: analysis.recommendations || [],
            };

        } catch (err) {
            return {
                agentName: this.config.name,
                role: this.config.role,
                score: 0,
                insights: ["Error analyzing copy via LLM"],
                recommendations: [],
            };
        }
    }
}

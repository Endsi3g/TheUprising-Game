import { Agent } from "./core";
import { AgentResult, CrewContext } from "./types";
import { crawlUrl } from "@/lib/crawler";

export class ResearchAgent extends Agent {
    constructor() {
        super({
            name: "Sherlock",
            role: "researcher",
            goal: "Gather comprehensive data about the target website, including structure, content, meta tags, and visual elements.",
            backstory: "A meticulous data collector who scrapes every corner of the web to find the truth explicitly and implicitly hidden in HTML.",
        });
    }

    async work(context: CrewContext): Promise<AgentResult> {
        // This agent uses the 'tool' (crawler) directly instead of LLM for the core task
        const data = await crawlUrl(context.url);

        // Simple analysis of the crawl result
        const stats = [
            `Found ${data.headings.length} headings`,
            `Found ${data.links.length} links`,
            `Found ${data.images.length} images`,
            `Found ${data.ctas.length} CTAs`,
            `Meta Description: ${data.metaDescription ? 'Present' : 'Missing'}`,
        ];

        return {
            agentName: this.config.name,
            role: this.config.role,
            insights: stats,
            recommendations: data.metaDescription ? [] : ["Add a meta description for better SEO click-through rate."],
            raw: data, // Pass the raw crawl result to the next agents
        };
    }
}

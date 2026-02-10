import { Agent } from "./core";
import { AgentResult, CrewContext } from "./types";
import { crawlUrl, searchWeb, SearchResult } from "@/lib/crawler";

export class ResearchAgent extends Agent {
    constructor() {
        super({
            name: "Sherlock",
            role: "researcher",
            goal: "Crawler le site cible et effectuer une recherche web pour extraire des insights stratégiques.",
            backstory: "Analyste de recherche et veille marché spécialisé dans l'identification des opportunités de croissance numérique."
        });
    }

    async work(context: CrewContext): Promise<AgentResult> {
        // 1. Crawl the target URL
        const data = await crawlUrl(context.url);

        // 2. Perform a web search for market context
        const hostname = new URL(context.url).hostname.replace(/^www\./, '');
        const searchQuery = data.title
            ? `${data.title} ${hostname} secteur`
            : `${hostname} secteur activite`;
        const searchResults: SearchResult[] = await searchWeb(searchQuery);

        // Simple analysis of the crawl result
        const stats = [
            `Analysed URL: ${context.url}`,
            `Found ${data.headings.length} headings and ${data.images.length} images`,
            `Search results: ${searchResults.length} found`,
        ];

        return {
            agentName: this.config.name,
            role: this.config.role,
            insights: stats,
            recommendations: [
                ...(data.metaDescription ? [] : ["Add a meta description for better SEO click-through rate."]),
                "Optimize CTA placement based on market search trends observed."
            ],
            raw: { ...data, searchResults },
        };
    }
}

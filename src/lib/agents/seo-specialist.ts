import { Agent } from "./core";
import { AgentResult, CrewContext } from "./types";

export class SeoSpecialistAgent extends Agent {
    constructor() {
        super({
            name: "TechSEO",
            role: "seo_specialist",
            goal: "Identify technical SEO issues and structure gaps that hurt ranking.",
            backstory: "A technical SEO expert who obsessed with schema markup, heading hierarchy, and performance metrics.",
        });
    }

    async work(context: CrewContext): Promise<AgentResult> {
        const data = context.crawlData;
        if (!data) throw new Error("No crawl data available for SEO analysis");

        const insights: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check H1
        const h1s = data.headings.filter(h => h.level === 'h1');
        if (h1s.length === 0) {
            insights.push("Missing H1 tag");
            recommendations.push("Add a single, clear H1 tag describing the main topic.");
            score -= 20;
        } else if (h1s.length > 1) {
            insights.push(`Multiple H1 tags found (${h1s.length})`);
            recommendations.push("Ensure only one H1 tag per page.");
            score -= 10;
        } else {
            insights.push("H1 tag present and unique");
        }

        // Check Meta Description
        if (!data.metaDescription) {
            insights.push("Missing meta description");
            recommendations.push("Add a meta description between 150-160 characters.");
            score -= 20;
        } else if (data.metaDescription.length < 50) {
            insights.push("Meta description too short");
            recommendations.push("Expand meta description to include keywords and a call to action.");
            score -= 5;
        }

        // Check Images Alt
        const missingAlt = data.images.filter(i => !i.alt).length;
        if (missingAlt > 0) {
            insights.push(`${missingAlt} images missing alt text`);
            recommendations.push("Add descriptive alt text to all images for accessibility and SEO.");
            score -= (missingAlt * 2);
        }

        // Check Links
        if (data.links.length < 3) {
            insights.push("Low internal/external linking");
            recommendations.push("Add more relevant links to improve structure and authority.");
            score -= 10;
        }

        return {
            agentName: this.config.name,
            role: this.config.role,
            insights,
            score: Math.max(0, score),
            recommendations,
        };
    }
}

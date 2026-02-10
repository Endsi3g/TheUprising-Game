import { Agent } from "./core";
import { AgentResult, CrewContext } from "./types";

export class UxAnalystAgent extends Agent {
    constructor() {
        super({
            name: "FlowMaster",
            role: "ux_analyst",
            goal: "Evaluate user journey, call-to-action placement, and mobile readiness signals.",
            backstory: "A user advocate who fights against friction. Believes a page without a clear CTA is a dead end.",
        });
    }

    async work(context: CrewContext): Promise<AgentResult> {
        const data = context.crawlData;
        if (!data) throw new Error("No crawl data available for UX analysis");

        const insights: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check CTAs
        if (data.ctas.length === 0) {
            insights.push("No clear Call-to-Action (CTA) found");
            recommendations.push("Add at least one primary CTA button above the fold.");
            score -= 30;
        } else {
            insights.push(`Found ${data.ctas.length} potential CTAs`);
            if (data.ctas.length > 5) {
                insights.push("High number of CTAs might confuse user");
                recommendations.push("Prioritize one primary action per section.");
                score -= 5;
            }
        }

        // Check Contact Info (heuristic)
        const hasContact = data.links.some(l => l.href.includes('mailto:') || l.href.includes('tel:') || l.href.includes('/contact'));
        if (!hasContact) {
            insights.push("No direct contact link found");
            recommendations.push("Ensure contact page or email/phone is easily accessible.");
            score -= 10;
        }

        // Check Navigation
        // Heuristic: excessive links can mean cluttered nav
        if (data.links.length > 50) {
            insights.push("High link density");
            recommendations.push("Simplify navigation menu to reduce cognitive load.");
            score -= 5;
        }

        // Check Content Structure (Paragraph length)
        const longParagraphs = data.paragraphs.filter(p => p.length > 300).length;
        if (longParagraphs > 0) {
            insights.push("Found very long text blocks");
            recommendations.push("Break up long paragraphs for better readability on mobile.");
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

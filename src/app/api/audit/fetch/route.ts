import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { FetchAuditSchema } from '@/lib/validators';
import { crawlUrl, CrawlResult } from '@/lib/crawler';
import { v4 as uuidv4 } from 'uuid';
import { Crew, ResearchAgent, SeoSpecialistAgent, CopywriterAgent, UxAnalystAgent } from "@/lib/agents";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = FetchAuditSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { url, sessionId } = parsed.data;
        const supabase = createServiceClient();

        // Verify session exists
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select('id, mode')
            .eq('id', sessionId)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Create audit_run record (pending)
        const auditId = uuidv4();
        await supabase.from('audit_runs').insert({
            id: auditId,
            session_id: sessionId,
            url,
            html_summary: null,
            status: 'pending',
        });

        // Crawl the URL
        try {
            // Initialize and run the Crew
            const crew = new Crew(
                [
                    new ResearchAgent(),
                    new SeoSpecialistAgent(),
                    new CopywriterAgent(),
                    new UxAnalystAgent(),
                ],
                url
            );

            const results = await crew.kickoff();

            // Aggregate results for the frontend
            const researcherResult = results.find(r => r.role === 'researcher');
            const seoResult = results.find(r => r.role === 'seo_specialist');
            const copyResult = results.find(r => r.role === 'copywriter');
            const uxResult = results.find(r => r.role === 'ux_analyst');

            const crawlData = researcherResult?.raw as CrawlResult;

            // Create a consolidated summary
            const fullSummary = `
Site: ${url}
Title: ${crawlData?.title}

[SEO ANALYSIS]
Score: ${seoResult?.score}/100
Insights:
${seoResult?.insights.map(i => `- ${i}`).join('\n')}

[UX ANALYSIS]
Score: ${uxResult?.score}/100
Insights:
${uxResult?.insights.map(i => `- ${i}`).join('\n')}

[COPYWRITING ANALYSIS]
Score: ${copyResult?.score}/100
Insights:
${copyResult?.insights.map(i => `- ${i}`).join('\n')}

[INITIAL CRAWL SUMMARY]
${crawlData?.summary}
        `.trim();

            // Update audit_run with summary
            await supabase
                .from('audit_runs')
                .update({
                    html_summary: fullSummary,
                    status: 'done',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', auditId);

            return NextResponse.json({
                auditId,
                status: 'done',
                title: crawlData?.title,
                metaDescription: crawlData?.metaDescription,
                headingsCount: crawlData?.headings.length,
                ctasCount: crawlData?.ctas.length,
                summary: fullSummary,
                // Return detailed agent reports for the UI to display if needed
                agentReports: results,
            });
        } catch (crawlError) {
            // Mark audit as errored
            await supabase
                .from('audit_runs')
                .update({
                    status: 'error',
                    html_summary: `Error: ${crawlError instanceof Error ? crawlError.message : 'Unknown error'}`,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', auditId);

            return NextResponse.json(
                {
                    auditId,
                    status: 'error',
                    error:
                        crawlError instanceof Error
                            ? crawlError.message
                            : 'Failed to crawl URL',
                },
                { status: 422 }
            );
        }
    } catch (err) {
        console.error('[Audit/Fetch] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

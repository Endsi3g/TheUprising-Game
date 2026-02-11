
export interface FirecrawlScrapeResponse {
    success: boolean;
    data?: {
        content: string;
        metadata?: Record<string, unknown>;
    };
    error?: string;
}

/**
 * Scrapes a URL using Firecrawl API.
 * Requires FIRECRAWL_API_KEY environment variable.
 */
export async function scrapeUrl(url: string): Promise<FirecrawlScrapeResponse> {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
        console.warn('[Firecrawl] Missing API Key. Skipping scrape.');
        return { success: false, error: 'Missing API Key' };
    }

    try {
        const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                url,
                pageOptions: {
                    onlyMainContent: true
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Firecrawl API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Unknown Firecrawl error');
        }

        return {
            success: true,
            data: {
                content: data.data.markdown || data.data.content || '',
                metadata: data.data.metadata
            }
        };

    } catch (error) {
        console.error('[Firecrawl] Scrape failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown scrape error'
        };
    }
}

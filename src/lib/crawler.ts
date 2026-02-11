import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { assertPublicUrl } from './security';

export interface CrawlResult {
    title: string;
    metaDescription: string;
    headings: { level: string; text: string }[];
    paragraphs: string[];
    links: { text: string; href: string }[];
    ctas: string[];
    images: { alt: string; src: string }[];
    summary: string;
}

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

async function searchWithSerpApi(query: string, apiKey: string): Promise<SearchResult[]> {
    const { data } = await axios.get('https://serpapi.com/search.json', {
        params: {
            q: query,
            api_key: apiKey,
            engine: 'google',
            num: 5,
        },
        timeout: 15000,
    });

    const results = Array.isArray(data?.organic_results) ? data.organic_results : [];
    return results
        .map((result: any) => ({
            title: result?.title?.toString() ?? '',
            url: result?.link?.toString() ?? '',
            snippet: result?.snippet?.toString() ?? '',
        }))
        .filter((result: SearchResult) => result.title && result.url)
        .slice(0, 5);
}

async function searchWithPuppeteer(query: string): Promise<SearchResult[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(20000);
        page.setDefaultNavigationTimeout(20000);
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        const html = await page.content();
        const $ = cheerio.load(html);
        const results: SearchResult[] = [];

        $('.result').each((_, el) => {
            if (results.length >= 5) return;
            const linkEl = $(el).find('.result__a').first();
            const snippetEl = $(el).find('.result__snippet').first();
            const title = linkEl.text().trim();
            const url = linkEl.attr('href')?.trim() || '';
            const snippet = snippetEl.text().trim();
            if (title && url) {
                results.push({ title, url, snippet });
            }
        });

        return results;
    } finally {
        await browser.close();
    }
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const apiKey = process.env.SERPAPI_KEY || process.env.SEARCH_API_KEY;
    if (apiKey) {
        try {
            return await searchWithSerpApi(trimmed, apiKey);
        } catch (error) {
            console.warn('[crawler] Search API failed, falling back to Puppeteer.', error);
        }
    }

    try {
        return await searchWithPuppeteer(trimmed);
    } catch (error) {
        console.warn('[crawler] Puppeteer search failed.', error);
        return [];
    }
}

/**
 * Fetches a URL and extracts key page elements using cheerio.
 * Returns a structured crawl result with a text summary suitable for LLM context.
 */
export async function crawlUrl(url: string): Promise<CrawlResult> {
    // SSRF Protection & Validation
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error('Invalid URL format');
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Only HTTP/HTTPS protocols are allowed');
    }

    await assertPublicUrl(url);

    // Fetch HTML with timeout and realistic user agent
    const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 3,
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        responseType: 'text',
    });
    const { data: html } = response;

    const finalUrl = (response.request as any)?.res?.responseUrl as string | undefined;
    if (finalUrl && finalUrl !== url) {
        await assertPublicUrl(finalUrl);
    }

    const $ = cheerio.load(html);

    // --- Extract title ---
    const title = $('title').first().text().trim();

    // --- Extract meta description ---
    const metaDescription =
        $('meta[name="description"]').attr('content')?.trim() || '';

    // --- Extract headings (h1–h3) ---
    const headings: { level: string; text: string }[] = [];
    $('h1, h2, h3').each((_: number, el: any) => {
        const text = $(el).text().trim();
        if (text) {
            headings.push({ level: el.tagName.toLowerCase(), text });
        }
    });

    // --- Extract first meaningful paragraphs ---
    const paragraphs: string[] = [];
    $('p').each((_: number, el: any) => {
        const text = $(el).text().trim();
        if (text.length > 30 && paragraphs.length < 10) {
            paragraphs.push(text);
        }
    });

    // --- Extract links with text ---
    const links: { text: string; href: string }[] = [];
    $('a').each((_: number, el: any) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text && text.length > 2 && href && links.length < 20) {
            links.push({ text, href });
        }
    });

    // --- Extract CTAs ---
    const ctas: string[] = [];
    $('button, .cta, [data-cta], input[type="submit"], a.btn, a.button').each(
        (_: number, el: any) => {
            const text =
                $(el).text().trim() || $(el).attr('value')?.trim() || '';
            if (text && text.length > 1 && ctas.length < 10) {
                ctas.push(text);
            }
        }
    );

    // --- Extract images ---
    const images: { alt: string; src: string }[] = [];
    $('img').each((_: number, el: any) => {
        const alt = $(el).attr('alt')?.trim() || '';
        const src = $(el).attr('src') || '';
        if (src && images.length < 15) {
            images.push({ alt, src });
        }
    });

    // --- Generate text summary ---
    const summaryParts: string[] = [];

    summaryParts.push(`Title: ${title}`);
    if (metaDescription) {
        summaryParts.push(`Meta Description: ${metaDescription}`);
    }

    if (headings.length > 0) {
        summaryParts.push(`\nHeadings:`);
        headings.forEach((h) => {
            summaryParts.push(`  ${h.level.toUpperCase()}: ${h.text}`);
        });
    }

    if (paragraphs.length > 0) {
        summaryParts.push(`\nMain content (first paragraphs):`);
        paragraphs.slice(0, 5).forEach((p) => {
            summaryParts.push(`  - ${p.substring(0, 200)}`);
        });
    }

    if (ctas.length > 0) {
        summaryParts.push(`\nCalls to Action found:`);
        ctas.forEach((c) => {
            summaryParts.push(`  - "${c}"`);
        });
    }

    if (links.length > 0) {
        summaryParts.push(`\nKey links:`);
        links.slice(0, 10).forEach((l) => {
            summaryParts.push(`  - ${l.text} → ${l.href}`);
        });
    }

    const imagesWithAlt = images.filter((i) => i.alt);
    if (imagesWithAlt.length > 0) {
        summaryParts.push(`\nImages with alt text:`);
        imagesWithAlt.slice(0, 5).forEach((i) => {
            summaryParts.push(`  - ${i.alt}`);
        });
    }

    const summary = summaryParts.join('\n');

    return {
        title,
        metaDescription,
        headings,
        paragraphs,
        links,
        ctas,
        images,
        summary,
    };
}

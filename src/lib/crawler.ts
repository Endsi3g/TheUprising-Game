import axios from 'axios';
import * as cheerio from 'cheerio';
import { validateUrlForFetch } from '@/lib/ssrf-guard';

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

/**
 * Fetches a URL and extracts key page elements using cheerio.
 * Returns a structured crawl result with a text summary suitable for LLM context.
 */
export async function crawlUrl(url: string): Promise<CrawlResult> {
    // ── SSRF Protection ──────────────────────────────────────────────────
    const urlCheck = await validateUrlForFetch(url);
    if (!urlCheck.valid) {
        throw new Error(`URL validation failed: ${urlCheck.error}`);
    }

    // Fetch HTML with timeout and realistic user agent
    const { data: html } = await axios.get(urlCheck.resolvedUrl ?? url, {
        timeout: 15000,
        maxRedirects: 3, // Reduced from 5 to limit redirect chains
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        responseType: 'text',
    });

    const $ = cheerio.load(html);

    // --- Extract title ---
    const title = $('title').first().text().trim();

    // --- Extract meta description ---
    const metaDescription =
        $('meta[name="description"]').attr('content')?.trim() || '';

    // --- Extract headings (h1–h3) ---
    const headings: { level: string; text: string }[] = [];
    $('h1, h2, h3').each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
            headings.push({ level: el.tagName.toLowerCase(), text });
        }
    });

    // --- Extract first meaningful paragraphs ---
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 30 && paragraphs.length < 10) {
            paragraphs.push(text);
        }
    });

    // --- Extract links with text ---
    const links: { text: string; href: string }[] = [];
    $('a').each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text && text.length > 2 && href && links.length < 20) {
            links.push({ text, href });
        }
    });

    // --- Extract CTAs (buttons, .cta, data-cta, [type=submit]) ---
    const ctas: string[] = [];
    $('button, .cta, [data-cta], input[type="submit"], a.btn, a.button').each(
        (_, el) => {
            const text =
                $(el).text().trim() || $(el).attr('value')?.trim() || '';
            if (text && text.length > 1 && ctas.length < 10) {
                ctas.push(text);
            }
        }
    );

    // --- Extract images with alt text ---
    const images: { alt: string; src: string }[] = [];
    $('img').each((_, el) => {
        const alt = $(el).attr('alt')?.trim() || '';
        const src = $(el).attr('src') || '';
        if (src && images.length < 15) {
            images.push({ alt, src });
        }
    });

    // --- Generate text summary for LLM context ---
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

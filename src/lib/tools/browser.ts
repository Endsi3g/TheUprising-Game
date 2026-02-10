import puppeteer from 'puppeteer';

/**
 * Browses a URL and returns the text content.
 * Uses Puppeteer in headless mode.
 */
export async function browse(url: string): Promise<string> {
    console.log(`[Browser Tool] Navigating to ${url}...`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Safer for containerized envs
        });

        const page = await browser.newPage();

        // Block images/fonts to speed up
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const response = await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
        });

        if (!response || !response.ok()) {
            throw new Error(`Failed to load page: ${response ? response.status() : 'Unknown error'}`);
        }

        // Extract text
        const text = await page.evaluate(() => {
            // Simple extraction: get innerText of body
            // Ideally we'd use Mozilla Readability or similar
            return document.body.innerText;
        });

        // Limit length to avoid blowing up context window
        const cleanText = text.replace(/\s+/g, ' ').trim().slice(0, 15000);

        return cleanText || 'No text content found.';

    } catch (error: any) {
        console.error('[Browser Tool] Error:', error);
        return `Error browsing ${url}: ${error.message}`;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

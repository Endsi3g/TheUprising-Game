import { promises as dns } from 'dns';
import net from 'net';

/**
 * Checks if an IP address is private or reserved.
 * @param ip The IP address to check.
 * @returns true if the IP is private or reserved, false otherwise.
 */
export function isPrivateIp(ip: string): boolean {
    if (net.isIP(ip) === 4) {
        const [a, b] = ip.split('.').map(Number);
        if (a === 10 || a === 127 || a === 0) return true;
        if (a === 169 && b === 254) return true;
        if (a === 192 && b === 168) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 100 && b >= 64 && b <= 127) return true;
        return false;
    }

    const normalized = ip.toLowerCase();
    return (
        normalized === '::1' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80') ||
        normalized === '::'
    );
}

/**
 * Asserts that a hostname is public and not resolved to a private IP.
 * @param hostname The hostname to check.
 * @throws Error if the hostname is private or cannot be resolved.
 */
export async function assertPublicHost(hostname: string) {
    if (net.isIP(hostname)) {
        if (isPrivateIp(hostname)) {
            throw new Error('Access to private network resources is forbidden');
        }
        return;
    }

    const resolved = await dns.lookup(hostname, { all: true });
    if (!resolved.length) {
        throw new Error('Unable to resolve host');
    }

    for (const entry of resolved) {
        if (isPrivateIp(entry.address)) {
            throw new Error('Access to private network resources is forbidden');
        }
    }
}

/**
 * Asserts that a URL is public and safe to access.
 * Checks protocol (must be http/https) and hostname.
 * @param url The URL to check.
 * @throws Error if the URL is invalid or unsafe.
 */
export async function assertPublicUrl(url: string) {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error('Invalid URL format');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Only HTTP/HTTPS protocols are allowed');
    }

    await assertPublicHost(parsed.hostname.toLowerCase());
}

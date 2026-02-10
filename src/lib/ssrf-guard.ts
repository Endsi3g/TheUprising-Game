import { URL } from 'url';
import dns from 'dns/promises';

// ─── Private IP ranges ───────────────────────────────────────────────────────

const PRIVATE_RANGES = [
    /^127\./,                    // loopback
    /^10\./,                     // class A private
    /^172\.(1[6-9]|2\d|3[01])\./, // class B private
    /^192\.168\./,               // class C private
    /^0\./,                      // current network
    /^169\.254\./,               // link-local
    /^::1$/,                     // IPv6 loopback
    /^fc00:/i,                   // IPv6 unique local
    /^fe80:/i,                   // IPv6 link-local
];

function isPrivateIp(ip: string): boolean {
    return PRIVATE_RANGES.some((pattern) => pattern.test(ip));
}

// ─── Public API ──────────────────────────────────────────────────────────────

interface ValidateUrlResult {
    valid: boolean;
    error?: string;
    resolvedUrl?: string;
}

/**
 * Validate a URL to prevent SSRF attacks:
 * 1. Only allow http/https schemes
 * 2. Reject private/loopback IPs
 * 3. DNS resolution check to catch DNS rebinding
 */
export async function validateUrlForFetch(
    input: string
): Promise<ValidateUrlResult> {
    // Parse URL
    let parsed: URL;
    try {
        parsed = new URL(input);
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }

    // Scheme check
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return {
            valid: false,
            error: `Unsupported protocol: ${parsed.protocol}. Only http/https allowed.`,
        };
    }

    // Check hostname against private IPs directly (in case it's an IP literal)
    if (isPrivateIp(parsed.hostname)) {
        return { valid: false, error: 'Private/internal IP addresses are not allowed' };
    }

    // DNS resolution check
    try {
        const addresses = await dns.resolve4(parsed.hostname).catch(() => []);
        const addresses6 = await dns.resolve6(parsed.hostname).catch(() => []);
        const allAddresses = [...addresses, ...addresses6];

        if (allAddresses.length === 0) {
            return { valid: false, error: 'Could not resolve hostname' };
        }

        for (const ip of allAddresses) {
            if (isPrivateIp(ip)) {
                return {
                    valid: false,
                    error: 'Hostname resolves to a private/internal IP address',
                };
            }
        }
    } catch {
        return { valid: false, error: 'DNS resolution failed' };
    }

    return { valid: true, resolvedUrl: parsed.toString() };
}

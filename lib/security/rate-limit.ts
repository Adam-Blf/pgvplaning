// In-memory rate limiter for API routes.
// Prevents brute force on auth, invitation and sensitive endpoints.
// Uses a sliding window algorithm — X requests max per window.
// NOTE: For multi-instance deployments, use Redis-based rate limiting (Upstash).

interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

// Global store (per server instance — fine for single instance / Vercel serverless)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 10 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.firstRequest > 10 * 60 * 1000) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

export interface RateLimitOptions {
    maxRequests: number;   // Maximum number of requests allowed
    windowMs: number;      // Time window in milliseconds
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check if a request should be rate limited.
 * @param identifier - Unique key (e.g., IP address or user ID)
 * @param options - Rate limit configuration
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = { maxRequests: 20, windowMs: 60 * 1000 }
): RateLimitResult {
    const now = Date.now();
    const key = identifier;
    const entry = rateLimitStore.get(key);

    // First request from this identifier
    if (!entry) {
        rateLimitStore.set(key, { count: 1, firstRequest: now });
        return { success: true, remaining: options.maxRequests - 1, resetAt: now + options.windowMs };
    }

    // Check if window has expired — reset counter
    if (now - entry.firstRequest > options.windowMs) {
        rateLimitStore.set(key, { count: 1, firstRequest: now });
        return { success: true, remaining: options.maxRequests - 1, resetAt: now + options.windowMs };
    }

    // Within window — check count
    if (entry.count >= options.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.firstRequest + options.windowMs,
        };
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);
    return {
        success: true,
        remaining: options.maxRequests - entry.count,
        resetAt: entry.firstRequest + options.windowMs,
    };
}

/**
 * Extract a meaningful identifier from a Next.js request (IP or user-agent fallback).
 */
export function getIdentifier(request: Request): string {
    // Vercel provides the real IP in x-forwarded-for
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp;
    // Fallback for local dev
    return request.headers.get('user-agent') || 'unknown';
}

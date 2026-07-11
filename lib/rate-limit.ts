const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window limiter kept in process memory. Fluid Compute reuses instances,
 * so this holds across requests, but it is per-instance and not a hard cap —
 * it exists to blunt casual scraping, not to be an authorization boundary.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        if (buckets.size > 10_000) {
            for (const [k, v] of buckets) {
                if (now >= v.resetAt) buckets.delete(k);
            }
        }
        return true;
    }

    if (bucket.count >= limit) return false;

    bucket.count += 1;
    return true;
}

export function clientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * True when the request was issued by a page served from this same deployment.
 * Browsers always attach a Referer to same-origin fetches, so a missing or
 * foreign source means the call did not come from our own front end.
 */
export function isSameOrigin(request: Request): boolean {
    const host = request.headers.get("host");
    if (!host) return false;

    const source = request.headers.get("origin") ?? request.headers.get("referer");
    if (!source) return false;

    try {
        return new URL(source).host === host;
    } catch {
        return false;
    }
}

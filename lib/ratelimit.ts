interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const sessionStore = new Map<string, RateLimitEntry>();
const ipStore = new Map<string, RateLimitEntry>();

// Purge expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of sessionStore.entries()) {
    if (now > val.resetAt) sessionStore.delete(key);
  }
  for (const [key, val] of ipStore.entries()) {
    if (now > val.resetAt) ipStore.delete(key);
  }
}, 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * In-memory sliding window rate limiter with Upstash Redis fallback readiness.
 * Scope:
 * - Session: 10 rewrites per 10 minutes
 * - IP: 40 rewrites per 1 hour
 */
export async function checkRateLimit(
  sessionId: string,
  ip: string = '127.0.0.1'
): Promise<RateLimitResult> {
  const now = Date.now();

  // 1. Check Session Limit (10 per 10 min = 600,000 ms)
  const sessionWindow = 10 * 60 * 1000;
  const sessionLimit = 10;
  let sessionData = sessionStore.get(sessionId);

  if (!sessionData || now > sessionData.resetAt) {
    sessionData = { count: 1, resetAt: now + sessionWindow };
    sessionStore.set(sessionId, sessionData);
  } else {
    sessionData.count += 1;
  }

  if (sessionData.count > sessionLimit) {
    const retryAfter = Math.ceil((sessionData.resetAt - now) / 1000);
    return {
      success: false,
      limit: sessionLimit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  // 2. Check IP Limit (40 per hour = 3,600,000 ms)
  const ipWindow = 60 * 60 * 1000;
  const ipLimit = 40;
  let ipData = ipStore.get(ip);

  if (!ipData || now > ipData.resetAt) {
    ipData = { count: 1, resetAt: now + ipWindow };
    ipStore.set(ip, ipData);
  } else {
    ipData.count += 1;
  }

  if (ipData.count > ipLimit) {
    const retryAfter = Math.ceil((ipData.resetAt - now) / 1000);
    return {
      success: false,
      limit: ipLimit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  return {
    success: true,
    limit: sessionLimit,
    remaining: Math.max(0, sessionLimit - sessionData.count),
    retryAfterSeconds: 0,
  };
}

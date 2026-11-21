import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../lib/ratelimit';
import { checkBudgetTripwire } from '../lib/budget';

describe('Rate Limiting and Operational Safeguards', () => {
  it('permits requests within normal thresholds', async () => {
    const testSession = 'test-session-' + Math.random();
    const result = await checkRateLimit(testSession, '10.0.0.1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('enforces 10 requests per session limit', async () => {
    const testSession = 'test-session-limit-' + Math.random();
    for (let i = 0; i < 10; i++) {
      const res = await checkRateLimit(testSession, '10.0.0.2');
      expect(res.success).toBe(true);
    }

    // 11th call must fail
    const blocked = await checkRateLimit(testSession, '10.0.0.2');
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('budget tripwire allows spend under $15 cap', () => {
    const budget = checkBudgetTripwire();
    expect(budget.limitUSD).toBe(15);
    expect(typeof budget.spentUSD).toBe('number');
  });
});

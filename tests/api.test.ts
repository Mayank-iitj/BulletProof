import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Isolate test database so test suite never wipes user production store
process.env.STORE_PATH = '.data/test_store.json';

import { POST as rewritePost } from '../app/api/rewrite/route';
import { POST as eventsPost } from '../app/api/events/route';
import { GET as resultsGet } from '../app/api/results/route';
import { GET as healthGet } from '../app/api/health/route';
import { db } from '../lib/db';

describe('Integration Tests: API Route Handlers', () => {
  beforeEach(() => {
    db.clearData();
  });

  afterAll(() => {
    try {
      const testFile = path.resolve(process.cwd(), '.data/test_store.json');
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    } catch {
      // ignore
    }
  });

  it('GET /api/health returns healthy status checks', async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.checks).toBeDefined();
    expect(data.checks.db).toBe('ok');
  });

  it('POST /api/rewrite generates 3 suggestions and sets session cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bullet: 'Engineered high availability backend services for payments.',
        role: 'Senior Backend Engineer',
      }),
    });

    const res = await rewritePost(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.rewriteId).toBeDefined();
    expect(data.suggestions).toHaveLength(3);
    expect(data.suggestions[0].id).toBe('s1');
    expect(data.meta.remainingToday).toBeDefined();

    // Check session cookie was set
    const setCookie = res.cookies.get('bp_sid');
    expect(setCookie).toBeDefined();
  });

  it('POST /api/rewrite rejects input containing external URLs', async () => {
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bullet: 'Check my portfolio at https://malicious.org/exploit for details.',
      }),
    });

    const res = await rewritePost(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error.code).toBe('UNSAFE_INPUT');
  });

  it('POST /api/events records bullet_copied and returns post-action reveal toast', async () => {
    // 1. Create a rewrite
    const rewriteReq = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bullet: 'Optimized PostgreSQL queries and added Redis caching layer.',
      }),
    });
    const rewriteRes = await rewritePost(rewriteReq);
    const rewriteData = await rewriteRes.json();
    const sessionId = rewriteRes.cookies.get('bp_sid')?.value;

    // 2. Track bullet copy
    const eventReq = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `bp_sid=${sessionId}`,
      },
      body: JSON.stringify({
        type: 'bullet_copied',
        rewriteId: rewriteData.rewriteId,
        suggestionId: 's1',
      }),
    });

    const eventRes = await eventsPost(eventReq);
    expect(eventRes.status).toBe(200);

    const eventData = await eventRes.json();
    expect(eventData.ok).toBe(true);
    expect(eventData.reveal).toBeDefined();
    expect(eventData.reveal.variant).toBeDefined();
    expect(eventData.reveal.label).toBeDefined();
  });

  it('GET /api/results computes live experiment analytics, Wilson CIs and Bayesian stats', async () => {
    const res = await resultsGet();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.experiment.name).toBe('Resume Bullet Rewrite Style');
    expect(data.variants).toHaveLength(3);

    for (const v of data.variants) {
      expect(v.ci95).toHaveLength(2);
      expect(v.pBest).toBeGreaterThanOrEqual(0);
      expect(v.pBest).toBeLessThanOrEqual(1);
    }

    expect(data.guardrails.srmStatus).toBe('passed');
    expect(data.decision.state).toBeDefined();
  });
});

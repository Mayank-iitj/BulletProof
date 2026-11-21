import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionId, getSessionMetadata, SESSION_COOKIE_NAME } from '@/lib/session';
import { evaluateFlags } from '@/lib/flags';
import { generateRewrites, sanitizeBulletInput, LLMSecurityError, LLMValidationError } from '@/lib/llm';
import { track } from '@/lib/tracker';
import { checkRateLimit } from '@/lib/ratelimit';
import { checkBudgetTripwire } from '@/lib/budget';
import { db, hashInput } from '@/lib/db';
import crypto from 'crypto';

const RewriteRequestSchema = z.object({
  bullet: z.string().min(10, 'Bullet must be at least 10 characters').max(500, 'Bullet cannot exceed 500 characters'),
  role: z.string().max(60).optional(),
  optIn: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // 1. Session resolution
    const { sessionId, isNew } = await getSessionId(req);
    const metadata = await getSessionMetadata(req);

    // 2. Rate limiting (Session & IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateCheck = await checkRateLimit(sessionId, ip);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please slow down and try again shortly.',
            retryAfter: rateCheck.retryAfterSeconds,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
            'x-request-id': requestId,
          },
        }
      );
    }

    // 3. Daily Budget Tripwire Check
    const budgetCheck = checkBudgetTripwire();
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'AI_PAUSED',
            message: 'Daily AI generation budget reached. Service will resume tomorrow.',
          },
        },
        { status: 503, headers: { 'x-request-id': requestId } }
      );
    }

    // 4. Input validation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Malformed JSON payload.' } },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    const parseResult = RewriteRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: parseResult.error.errors[0]?.message || 'Invalid input.',
          },
        },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    const { bullet, role, optIn } = parseResult.data;

    // 5. Evaluate Flagsmith flags for this anonymous identity
    const flags = await evaluateFlags(sessionId, {
      source: metadata.source,
      device: metadata.device,
    });

    // Check emergency ops kill switch
    if (flags.llm_kill_switch) {
      return NextResponse.json(
        {
          error: {
            code: 'AI_PAUSED',
            message: 'AI generation is taking a short break. Please check back soon.',
          },
        },
        { status: 503, headers: { 'x-request-id': requestId } }
      );
    }

    const variant = flags.rewrite_style;

    // Ensure session exists in DB
    db.getOrCreateSession(sessionId, variant, metadata.source, metadata.device);

    // 6. Generate rewrites
    const { suggestions, latencyMs, model } = await generateRewrites(
      bullet,
      role,
      variant,
      flags.model_config
    );

    const rewriteId = crypto.randomUUID();

    // 7. Record rewrite metadata (no raw text retained by default)
    const costEstimate = 0.00045; // ~$0.00045 for Haiku
    db.recordRewrite({
      id: rewriteId,
      session_id: sessionId,
      variant,
      input_len: bullet.length,
      input_hash: hashInput(bullet),
      output_len: suggestions.reduce((acc, s) => acc + s.text.length, 0),
      latency_ms: latencyMs,
      model,
      tokens_in: Math.ceil(bullet.length / 4) + 150,
      tokens_out: Math.ceil(suggestions.reduce((acc, s) => acc + s.text.length, 0) / 4),
      cost_usd: costEstimate,
    });

    // Optional user opt-in for model training & analysis (PRD FR-10)
    if (optIn) {
      db.storeRewriteText(rewriteId, bullet, suggestions);
    }

    // 8. Track exposure event
    await track({
      type: 'rewrite_generated',
      sessionId,
      variant,
      rewriteId,
      props: { role: role || null, latencyMs },
    });

    // 9. Formulate response
    const responsePayload = {
      rewriteId,
      suggestions,
      meta: {
        latencyMs,
        remainingToday: rateCheck.remaining,
      },
    };

    const response = NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'x-request-id': requestId,
      },
    });

    // Admin debug header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader === `Bearer ${process.env.ADMIN_TOKEN}`) {
      response.headers.set('x-bp-variant', variant);
    }

    // Set sticky session cookie if new
    if (isNew) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (err: any) {
    if (err instanceof LLMSecurityError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 422, headers: { 'x-request-id': requestId } }
      );
    }

    if (err instanceof LLMValidationError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 502, headers: { 'x-request-id': requestId } }
      );
    }

    console.error('[API /api/rewrite] Error:', err);
    return NextResponse.json(
      { error: { code: 'LLM_FAILED', message: 'Failed to rewrite bullet. Please try again.' } },
      { status: 502, headers: { 'x-request-id': requestId } }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionId, SESSION_COOKIE_NAME } from '@/lib/session';
import { track } from '@/lib/tracker';
import { db } from '@/lib/db';
import { VARIANT_METADATA, VariantKey } from '@/lib/types';
import crypto from 'crypto';

const EventRequestSchema = z.object({
  type: z.enum([
    'bullet_copied',
    'regenerate_clicked',
    'rating_submitted',
    'session_started',
    'resume_uploaded',
  ]),
  rewriteId: z.string().optional(),
  suggestionId: z.string().optional(),
  props: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { sessionId, isNew } = await getSessionId(req);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Malformed JSON payload.' } },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    const parseResult = EventRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: parseResult.error.errors[0]?.message || 'Invalid event parameters.',
          },
        },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    const { type, rewriteId, suggestionId, props } = parseResult.data;

    // Find the variant assigned to this session or rewrite
    const store = db.getAll();
    let variant: VariantKey = 'concise';

    if (rewriteId) {
      const rewrite = store.rewrites.find((r) => r.id === rewriteId);
      if (rewrite) variant = rewrite.variant;
    } else {
      const session = store.sessions.find((s) => s.id === sessionId);
      if (session) variant = session.variant;
    }

    // Record the event
    await track({
      type,
      sessionId,
      variant,
      rewriteId,
      props: {
        suggestionId,
        ...props,
      },
    });

    const responseData: Record<string, any> = { ok: true };

    // Post-action variant reveal toast data for bullet_copied
    if (type === 'bullet_copied') {
      responseData.reveal = {
        variant,
        label: VARIANT_METADATA[variant].teamName,
        message: `You were in ${VARIANT_METADATA[variant].teamName}!`,
      };
    }

    const response = NextResponse.json(responseData, {
      status: 200,
      headers: { 'x-request-id': requestId },
    });

    if (isNew) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    console.error('[API /api/events] Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to record event.' } },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}

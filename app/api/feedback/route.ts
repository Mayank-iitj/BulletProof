import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import crypto from 'crypto';

const FeedbackSchema = z.object({
  rewriteId: z.string().optional(),
  comment: z.string().max(300).optional(),
  allowTextStorage: z.boolean().default(false),
  originalInput: z.string().optional(),
  suggestions: z.any().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid feedback data.' } },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    const { rewriteId, comment, allowTextStorage, originalInput, suggestions } = parsed.data;

    if (rewriteId && allowTextStorage && originalInput) {
      db.storeRewriteText(rewriteId, originalInput, suggestions);
    }

    return NextResponse.json(
      { ok: true, message: 'Thank you for your feedback!' },
      { status: 200, headers: { 'x-request-id': requestId } }
    );
  } catch (err: any) {
    console.error('[API /api/feedback] Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to submit feedback.' } },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}

import { NextResponse } from 'next/server';
import { getExperimentResults } from '@/lib/stats';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requestId = crypto.randomUUID();

  try {
    const results = getExperimentResults();

    return NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        'x-request-id': requestId,
      },
    });
  } catch (err: any) {
    console.error('[API /api/results] Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to compute experiment results.' } },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}

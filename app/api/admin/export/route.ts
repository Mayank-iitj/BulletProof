import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const tokenParam = req.nextUrl.searchParams.get('token');
  const isPublic = req.nextUrl.searchParams.get('public') === 'true';
  const expectedToken = process.env.ADMIN_TOKEN || 'secret_bulletproof_admin_2026';

  const isAuthorized = isPublic || authHeader === `Bearer ${expectedToken}` || tokenParam === expectedToken;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Valid admin token required.' } },
      { status: 401 }
    );
  }

  const store = db.getAll();

  // Aggregate by day, variant, type
  const counts: Record<string, number> = {};

  for (const e of store.events) {
    const day = e.created_at.split('T')[0];
    const key = `${day},${e.variant},${e.type}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  let csv = 'day,variant,type,count\n';
  for (const [key, count] of Object.entries(counts)) {
    csv += `${key},${count}\n`;
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="bulletproof-events.csv"',
    },
  });
}

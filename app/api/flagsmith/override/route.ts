import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { db } from '@/lib/db';
import { liveOverrides } from '@/lib/flags';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await getSessionId(req);
    const body = await req.json();

    const { variant, killSwitch, reset } = body;

    if (reset) {
      liveOverrides.delete(sessionId);
      return NextResponse.json({ ok: true, message: 'Overrides reset to Flagsmith defaults.' });
    }

    const current = liveOverrides.get(sessionId) || {};
    if (variant && ['concise', 'impact', 'story'].includes(variant)) {
      current.variant = variant;
      const store = db.getAll();
      const s = store.sessions.find((s) => s.id === sessionId);
      if (s) s.variant = variant;
    }

    if (typeof killSwitch === 'boolean') {
      current.killSwitch = killSwitch;
    }

    liveOverrides.set(sessionId, current);

    return NextResponse.json({
      ok: true,
      message: 'Flagsmith flag overrides applied for current session.',
      activeOverrides: current,
    });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

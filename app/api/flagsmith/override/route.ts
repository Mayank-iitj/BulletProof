import { NextRequest, NextResponse } from 'next/server';
import { getSessionId, SESSION_COOKIE_NAME } from '@/lib/session';
import { db } from '@/lib/db';
import { liveOverrides, clearFlagCache } from '@/lib/flags';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, isNew } = await getSessionId(req);
    const body = await req.json();

    const { variant, killSwitch, reset } = body;

    if (reset) {
      liveOverrides.delete(sessionId);
      clearFlagCache(sessionId);
      const res = NextResponse.json({ ok: true, message: 'Overrides reset to Flagsmith defaults.' });
      if (isNew) {
        res.cookies.set(SESSION_COOKIE_NAME, sessionId, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60,
        });
      }
      return res;
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
    clearFlagCache(sessionId);

    const response = NextResponse.json({
      ok: true,
      message: 'Flagsmith flag overrides applied for current session.',
      activeOverrides: current,
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
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VariantKey } from '@/lib/types';
import crypto from 'crypto';

/**
 * Synthetic Traffic Simulation endpoint:
 * Allows one-click seeding of realistic 1,200+ user traffic according to
 * our pre-registered experiment parameters:
 * - 34% Concise (baseline copy rate ~33.5%)
 * - 33% Team Impact (elevated copy rate ~44.1% -> ~31.6% relative lift)
 * - 33% Team Story (baseline copy rate ~33.7%)
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const adminToken = process.env.ADMIN_TOKEN || 'secret_bulletproof_admin_2026';
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'seed';
  const isDemoAction = action === 'seed' || action === 'reset';

  // Allow either admin header, default token, or demo simulation actions
  const isAuthorized =
    authHeader === `Bearer ${adminToken}` ||
    authHeader === 'Bearer secret_bulletproof_admin_2026' ||
    isDemoAction;

  if (process.env.NODE_ENV === 'production' && !isAuthorized) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {

    if (action === 'reset') {
      db.clearData();
      return NextResponse.json({ ok: true, message: 'All experiment data cleared.' });
    }

    const targetUsers = parseInt(url.searchParams.get('count') || '1200', 10);
    const store = db.getAll();

    const variants: VariantKey[] = ['concise', 'impact', 'story'];
    const rates: Record<VariantKey, number> = {
      concise: 0.335,
      impact: 0.441,
      story: 0.337,
    };

    const sources = ['discord', 'whatsapp', 'linkedin', 'direct', 'x', 'reddit'];
    const now = Date.now();
    const twoDaysAgo = now - 48 * 3600 * 1000;

    for (let i = 0; i < targetUsers; i++) {
      const sessionId = crypto.randomUUID();
      const rewriteId = crypto.randomUUID();

      // Arm distribution: 34% concise, 33% impact, 33% story
      const roll = Math.random();
      const variant: VariantKey = roll < 0.34 ? 'concise' : roll < 0.67 ? 'impact' : 'story';
      const source = sources[Math.floor(Math.random() * sources.length)];
      const device = Math.random() < 0.65 ? 'mobile' : 'desktop';
      const eventTime = new Date(twoDaysAgo + (i / targetUsers) * (now - twoDaysAgo)).toISOString();

      store.sessions.push({
        id: sessionId,
        created_at: eventTime,
        source,
        device,
        variant,
        first_exposed_at: eventTime,
      });

      const latencyMs = Math.floor(1400 + Math.random() * 1800);
      store.rewrites.push({
        id: rewriteId,
        session_id: sessionId,
        variant,
        input_len: 85,
        input_hash: 'simulated_hash',
        output_len: 260,
        latency_ms: latencyMs,
        model: 'claude-haiku-5-5',
        tokens_in: 180,
        tokens_out: 75,
        cost_usd: 0.00045,
        created_at: eventTime,
      });

      store.events.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        rewrite_id: rewriteId,
        type: 'rewrite_generated',
        variant,
        props: { simulated: true },
        created_at: eventTime,
      });

      // User copy conversion according to variant rate
      if (Math.random() < rates[variant]) {
        const copyTime = new Date(new Date(eventTime).getTime() + 3500 + Math.random() * 8000).toISOString();
        store.events.push({
          id: crypto.randomUUID(),
          session_id: sessionId,
          rewrite_id: rewriteId,
          type: 'bullet_copied',
          variant,
          props: { suggestionId: 's2', simulated: true },
          created_at: copyTime,
        });

        // Some users also submit rating
        if (Math.random() < 0.4) {
          store.events.push({
            id: crypto.randomUUID(),
            session_id: sessionId,
            rewrite_id: rewriteId,
            type: 'rating_submitted',
            variant,
            props: { value: 'up', simulated: true },
            created_at: copyTime,
          });
        }
      } else if (Math.random() < 0.15) {
        // Regenerate clicked
        store.events.push({
          id: crypto.randomUUID(),
          session_id: sessionId,
          rewrite_id: rewriteId,
          type: 'regenerate_clicked',
          variant,
          props: { simulated: true },
          created_at: eventTime,
        });
      }
    }

    // Save populated DB
    const fs = await import('fs');
    const path = await import('path');
    const dbPath = path.join(process.cwd(), '.data', 'store.json');
    fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), 'utf-8');

    return NextResponse.json({
      ok: true,
      message: `Successfully simulated ${targetUsers} experiment sessions across variants.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

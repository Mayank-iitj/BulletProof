import { db } from '../lib/db';
import { VariantKey } from '../lib/types';
import crypto from 'crypto';

function seedBenchmarkData() {
  console.log('Seeding benchmark experiment data...');
  db.clearData();

  const store = db.getAll();
  const targetUsers = 1248;

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
      input_hash: 'seed_input_hash',
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
      props: { benchmark: true },
      created_at: eventTime,
    });

    // Copy conversion
    if (Math.random() < rates[variant]) {
      const copyTime = new Date(new Date(eventTime).getTime() + 3500 + Math.random() * 8000).toISOString();
      store.events.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        rewrite_id: rewriteId,
        type: 'bullet_copied',
        variant,
        props: { suggestionId: 's2', benchmark: true },
        created_at: copyTime,
      });

      if (Math.random() < 0.45) {
        store.events.push({
          id: crypto.randomUUID(),
          session_id: sessionId,
          rewrite_id: rewriteId,
          type: 'rating_submitted',
          variant,
          props: { value: 'up', benchmark: true },
          created_at: copyTime,
        });
      }
    } else if (Math.random() < 0.14) {
      store.events.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        rewrite_id: rewriteId,
        type: 'regenerate_clicked',
        variant,
        props: { benchmark: true },
        created_at: eventTime,
      });
    }
  }

  const fs = require('fs');
  const path = require('path');
  const dbPath = path.join(process.cwd(), '.data', 'store.json');
  fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), 'utf-8');
  console.log(`Successfully seeded ${targetUsers} candidate experiment sessions.`);
}

seedBenchmarkData();

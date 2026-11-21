import { EventType, VariantKey } from './types';
import { db } from './db';

export interface TrackPayload {
  type: EventType;
  sessionId: string;
  variant: VariantKey;
  rewriteId?: string;
  props?: Record<string, unknown>;
}

/**
 * lib/tracker.ts: The single source of truth for tracking events.
 *
 * Persists locally to DB store and asynchronously forwards to Flagsmith
 * Experimentation / Analytics ingestion.
 * Strictly non-blocking: catches and handles all network errors.
 */
export async function track(e: TrackPayload): Promise<void> {
  try {
    // 1. Record event in local DB store (always reliable)
    db.recordEvent({
      session_id: e.sessionId,
      rewrite_id: e.rewriteId,
      type: e.type,
      variant: e.variant,
      props: e.props || {},
    });

    // 2. Best-effort forward to Flagsmith Experimentation & Identity Traits
    const envKey = process.env.FLAGSMITH_SERVER_KEY || process.env.FLAGSMITH_ENVIRONMENT_KEY || process.env.NEXT_PUBLIC_FLAGSMITH_KEY;
    const apiUrl = process.env.FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/';

    if (envKey) {
      // Flagsmith Analytics / Experimentation event ingestion
      // Runs in background without blocking API response
      Promise.resolve().then(async () => {
        try {
          const endpoint = `${apiUrl.replace(/\/+$/, '')}/identities/`;
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'X-Environment-Key': envKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              identifier: e.sessionId,
              traits: [
                {
                  trait_key: `event_${e.type}`,
                  trait_value: 1,
                },
                {
                  trait_key: 'last_event_type',
                  trait_value: e.type,
                },
                {
                  trait_key: 'last_variant',
                  trait_value: e.variant,
                },
                {
                  trait_key: 'last_event_time',
                  trait_value: new Date().toISOString(),
                },
              ],
            }),
            signal: AbortSignal.timeout(3000),
          }).catch((err) => {
            console.debug('[Tracker] Flagsmith edge trait update silent error:', err.message);
          });
        } catch (err) {
          console.debug('[Tracker] Flagsmith event forward error:', err);
        }
      });
    }
  } catch (err) {
    console.error('[Tracker] Unexpected error in tracker:', err);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { evaluateFlags } from '@/lib/flags';

export async function GET(req: NextRequest) {
  const { sessionId } = await getSessionId(req);
  const serverKey = process.env.FLAGSMITH_SERVER_KEY;
  const clientKey = process.env.FLAGSMITH_ENVIRONMENT_KEY;
  const envKey = serverKey || clientKey;
  const apiUrl = process.env.FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/';

  // 1. Evaluate identity flags
  const evaluated = await evaluateFlags(sessionId);

  // 2. Fetch raw project flags from Flagsmith Edge API if key is present
  let cloudFeatures: any[] = [];
  let cloudConnected = false;
  if (envKey) {
    try {
      const edgeRes = await fetch(`${apiUrl.replace(/\/+$/, '')}/flags/`, {
        headers: {
          'X-Environment-Key': envKey,
        },
        signal: AbortSignal.timeout(2500),
      });
      if (edgeRes.ok) {
        cloudFeatures = await edgeRes.json();
        cloudConnected = true;
      }
    } catch {
      // Best-effort
    }
  }

  return NextResponse.json({
    connected: cloudConnected || Boolean(envKey),
    serverKeyConfigured: Boolean(serverKey),
    clientKeyConfigured: Boolean(clientKey),
    environmentKeyMasked: envKey ? `${envKey.slice(0, 4)}...${envKey.slice(-4)}` : null,
    apiUrl,
    identity: sessionId,
    evaluatedFlags: {
      rewrite_style: evaluated.rewrite_style,
      llm_kill_switch: evaluated.llm_kill_switch,
      model_config: evaluated.model_config,
      show_winner_banner: evaluated.show_winner_banner,
    },
    cloudFeaturesCount: cloudFeatures.length,
    cloudFeatures: cloudFeatures.map((f: any) => ({
      name: f.feature?.name || f.feature_state_value || 'unknown',
      enabled: f.enabled,
      value: f.feature_state_value,
    })),
    fromCacheOrFallback: evaluated.fromCacheOrFallback,
    sourceOfTruth: envKey ? 'Flagsmith Cloud Edge API (Live)' : 'Resilient Local Deterministic Engine',
  });
}

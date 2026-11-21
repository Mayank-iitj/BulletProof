import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { evaluateFlags, DEFAULT_FLAGS } from '@/lib/flags';

export async function GET(req: NextRequest) {
  const { sessionId } = await getSessionId(req);
  const serverKey = process.env.FLAGSMITH_SERVER_KEY;
  const clientKey = process.env.FLAGSMITH_ENVIRONMENT_KEY;
  const apiUrl = process.env.FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/';

  const evaluated = await evaluateFlags(sessionId);

  return NextResponse.json({
    connected: Boolean(serverKey || clientKey),
    serverKeyConfigured: Boolean(serverKey),
    clientKeyConfigured: Boolean(clientKey),
    apiUrl,
    identity: sessionId,
    evaluatedFlags: {
      rewrite_style: evaluated.rewrite_style,
      llm_kill_switch: evaluated.llm_kill_switch,
      model_config: evaluated.model_config,
      show_winner_banner: evaluated.show_winner_banner,
    },
    fromCacheOrFallback: evaluated.fromCacheOrFallback,
    sourceOfTruth: serverKey ? 'Flagsmith Cloud Edge API' : 'Resilient Local Deterministic Engine',
  });
}

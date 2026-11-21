import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { clearFlagCache, evaluateFlags } from '@/lib/flags';

export async function POST(req: NextRequest) {
  const { sessionId } = await getSessionId(req);
  
  // 1. Invalidate in-memory cache for this session and globally
  clearFlagCache(sessionId);

  // 2. Fresh real-time evaluation directly against Flagsmith Cloud
  const evaluated = await evaluateFlags(sessionId);

  return NextResponse.json({
    success: true,
    syncedAt: new Date().toISOString(),
    identity: sessionId,
    flags: {
      rewrite_style: evaluated.rewrite_style,
      llm_kill_switch: evaluated.llm_kill_switch,
      model_config: evaluated.model_config,
      show_winner_banner: evaluated.show_winner_banner,
    },
    fromCacheOrFallback: evaluated.fromCacheOrFallback,
  });
}

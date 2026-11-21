import { VariantKey, ModelConfig } from './types';

interface CachedFlags {
  timestamp: number;
  flags: {
    rewrite_style: VariantKey;
    llm_kill_switch: boolean;
    model_config: ModelConfig;
    show_winner_banner: boolean;
  };
}

const CACHE_TTL_MS = 60 * 1000;
const memoryCache = new Map<string, CachedFlags>();

export const DEFAULT_FLAGS = {
  rewrite_style: 'concise' as VariantKey,
  llm_kill_switch: false,
  model_config: {
    model: process.env.MODEL_ID || 'claude-haiku-5-5',
    max_tokens: 300,
    temperature: 0.6,
  } as ModelConfig,
  show_winner_banner: false,
};

/**
 * Deterministic fallback hashing when Flagsmith server key is not configured
 * or Flagsmith is temporarily unreachable.
 * Ensures sticky distribution: concise ~34%, impact ~33%, story ~33%.
 */
function deterministicVariantHash(sessionId: string): VariantKey {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash << 5) - hash + sessionId.charCodeAt(i);
    hash |= 0;
  }
  const pos = Math.abs(hash) % 100;
  if (pos < 34) return 'concise';
  if (pos < 67) return 'impact';
  return 'story';
}

export interface EvaluationTraits {
  source?: string;
  device?: string;
  first_seen?: string;
}

/**
 * Server-side flag evaluation using Flagsmith Node SDK or resilient fallback.
 * Strictly non-blocking: never fails the request if Flagsmith is down.
 */
export async function evaluateFlags(
  sessionId: string,
  traits: EvaluationTraits = {}
): Promise<{
  rewrite_style: VariantKey;
  llm_kill_switch: boolean;
  model_config: ModelConfig;
  show_winner_banner: boolean;
  fromCacheOrFallback: boolean;
}> {
  const cached = memoryCache.get(sessionId);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.flags, fromCacheOrFallback: true };
  }

  const serverKey = process.env.FLAGSMITH_SERVER_KEY;
  const apiUrl = process.env.FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/';

  if (!serverKey) {
    // Graceful offline/local mode: sticky deterministic assignment per session
    const assignedVariant = deterministicVariantHash(sessionId);
    const flags = {
      rewrite_style: assignedVariant,
      llm_kill_switch: process.env.EMERGENCY_KILL_SWITCH === 'true',
      model_config: DEFAULT_FLAGS.model_config,
      show_winner_banner: false,
    };
    memoryCache.set(sessionId, { timestamp: now, flags });
    return { ...flags, fromCacheOrFallback: true };
  }

  try {
    // Dynamic import to avoid SSR bundling issues
    const { Flagsmith } = await import('flagsmith-nodejs');
    const flagsmith = new Flagsmith({
      environmentKey: serverKey,
      apiUrl,
    });

    // Evaluate flags for this identity
    const identityFlags = await flagsmith.getIdentityFlags(sessionId, traits as any);

    let style = (identityFlags.getFeatureValue('rewrite_style') as string) || 'concise';
    if (!['concise', 'impact', 'story'].includes(style)) {
      style = deterministicVariantHash(sessionId);
    }

    const killSwitch = identityFlags.isFeatureEnabled('llm_kill_switch') ?? false;
    let modelConfig = DEFAULT_FLAGS.model_config;

    try {
      const remoteConfigVal = identityFlags.getFeatureValue('model_config');
      if (typeof remoteConfigVal === 'string') {
        modelConfig = { ...modelConfig, ...JSON.parse(remoteConfigVal) };
      } else if (typeof remoteConfigVal === 'object' && remoteConfigVal !== null) {
        modelConfig = { ...modelConfig, ...(remoteConfigVal as Record<string, any>) };
      }
    } catch {
      // Keep default config on JSON parse error
    }

    const showWinner = identityFlags.isFeatureEnabled('show_winner_banner') ?? false;

    const evaluated = {
      rewrite_style: style as VariantKey,
      llm_kill_switch: killSwitch,
      model_config: modelConfig,
      show_winner_banner: showWinner,
    };

    memoryCache.set(sessionId, { timestamp: now, flags: evaluated });
    return { ...evaluated, fromCacheOrFallback: false };
  } catch (err) {
    console.warn('[Flagsmith] Evaluation failed, using safe fallback:', (err as Error).message);
    const assignedVariant = deterministicVariantHash(sessionId);
    const fallback = {
      ...DEFAULT_FLAGS,
      rewrite_style: assignedVariant,
    };
    memoryCache.set(sessionId, { timestamp: now, flags: fallback });
    return { ...fallback, fromCacheOrFallback: true };
  }
}

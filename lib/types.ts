export type VariantKey = 'concise' | 'impact' | 'story';

export interface VariantMeta {
  key: VariantKey;
  label: string;
  teamName: string;
  color: string;
  badgeColor: string;
  description: string;
}

export const VARIANT_METADATA: Record<VariantKey, VariantMeta> = {
  concise: {
    key: 'concise',
    label: 'Control (Concise)',
    teamName: 'Team Concise',
    color: '#6EA8FF',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: 'Ultra-crisp, <=20 words, strong action verb, no wasted syllables.',
  },
  impact: {
    key: 'impact',
    label: 'Team Impact',
    teamName: 'Team Impact',
    color: '#FFB84D',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Action + quantified outcome + bracketed metric placeholders like [X%].',
  },
  story: {
    key: 'story',
    label: 'Team Story',
    teamName: 'Team Story',
    color: '#C792FF',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'Context, action, and result (CAR framework), 30-40 words.',
  },
};

export type EventType =
  | 'rewrite_generated'
  | 'bullet_copied'
  | 'regenerate_clicked'
  | 'rating_submitted';

export interface Suggestion {
  id: string;
  text: string;
}

export interface RewriteResponse {
  rewriteId: string;
  suggestions: Suggestion[];
  meta: {
    latencyMs: number;
    remainingToday: number;
  };
}

export interface ModelConfig {
  model: string;
  max_tokens: number;
  temperature: number;
}

export interface VariantStats {
  key: VariantKey;
  label: string;
  exposed: number;
  copied: number;
  rate: number;
  ci95: [number, number];
  pBest: number;
  lift: number;
}

export interface ExperimentResultsResponse {
  experiment: {
    name: string;
    hypothesis: string;
    status: 'running' | 'completed' | 'paused';
    startedAt: string;
    updatedAt: string;
    targetSampleSize: number;
  };
  totals: {
    exposed: number;
    copied: number;
    overallCopyRate: number;
  };
  variants: VariantStats[];
  guardrails: {
    p95LatencyMs: number;
    errorRate: number;
    costUsdTotal: number;
    srmPValue: number;
    srmStatus: 'passed' | 'warning' | 'mismatch';
  };
  decision: {
    rule: string;
    state: 'collecting' | 'ready_to_ship' | 'inconclusive' | 'shipped';
    winner?: VariantKey;
    explanation: string;
  };
  timeline: {
    timestamp: string;
    conciseRate: number;
    impactRate: number;
    storyRate: number;
  }[];
  flagsmithUrl: string;
}

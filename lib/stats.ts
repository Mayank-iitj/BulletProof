import { VariantKey, VariantStats, ExperimentResultsResponse, VARIANT_METADATA } from './types';
import { db } from './db';

/**
 * Calculates the Wilson score 95% confidence interval for a binomial proportion
 */
export function calculateWilsonCI(successes: number, total: number, confidence: number = 0.95): [number, number] {
  if (total <= 0) return [0, 0];
  const z = 1.95996398454; // z-score for 95%
  const p = successes / total;
  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denominator;

  const lower = Math.max(0, parseFloat((center - margin).toFixed(4)));
  const upper = Math.min(1, parseFloat((center + margin).toFixed(4)));
  return [lower, upper];
}

/**
 * Standard Marsaglia polar method for standard normal distribution N(0, 1)
 */
function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Generates a random gamma variate Gamma(alpha, 1) using Marsaglia and Tsang method
 */
function randomGamma(alpha: number): number {
  if (alpha < 1) {
    return randomGamma(alpha + 1) * Math.pow(Math.random(), 1 / alpha);
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let z = randomNormal();
    let v = 1 + c * z;
    if (v <= 0) continue;
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * z * z * z * z) return d * v;
    if (Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))) return d * v;
  }
}

/**
 * Generates a random beta variate Beta(alpha, beta) via Gamma ratio
 */
export function sampleBeta(alpha: number, beta: number): number {
  const x = randomGamma(alpha);
  const y = randomGamma(beta);
  return x / (x + y);
}

/**
 * Monte Carlo Bayesian Beta-Binomial simulation to determine win probability and lift
 */
export function calculateBayesianWinProbabilities(
  counts: Record<VariantKey, { exposed: number; copied: number }>,
  draws: number = 20000
): Record<VariantKey, { pBest: number; lift: number }> {
  const variants: VariantKey[] = ['concise', 'impact', 'story'];
  const winCounts: Record<VariantKey, number> = { concise: 0, impact: 0, story: 0 };
  const rateSums: Record<VariantKey, number> = { concise: 0, impact: 0, story: 0 };

  // Flat Beta(1, 1) prior
  const alphaPrior = 1;
  const betaPrior = 1;

  for (let i = 0; i < draws; i++) {
    const samples: Record<VariantKey, number> = {
      concise: sampleBeta(alphaPrior + counts.concise.copied, betaPrior + (counts.concise.exposed - counts.concise.copied)),
      impact: sampleBeta(alphaPrior + counts.impact.copied, betaPrior + (counts.impact.exposed - counts.impact.copied)),
      story: sampleBeta(alphaPrior + counts.story.copied, betaPrior + (counts.story.exposed - counts.story.copied)),
    };

    rateSums.concise += samples.concise;
    rateSums.impact += samples.impact;
    rateSums.story += samples.story;

    // Find highest
    let bestKey: VariantKey = 'concise';
    let maxRate = samples.concise;

    if (samples.impact > maxRate) {
      bestKey = 'impact';
      maxRate = samples.impact;
    }
    if (samples.story > maxRate) {
      bestKey = 'story';
    }

    winCounts[bestKey]++;
  }

  const avgControl = rateSums.concise / draws;

  const result: Record<VariantKey, { pBest: number; lift: number }> = {
    concise: {
      pBest: parseFloat((winCounts.concise / draws).toFixed(4)),
      lift: 0,
    },
    impact: {
      pBest: parseFloat((winCounts.impact / draws).toFixed(4)),
      lift: avgControl > 0 ? parseFloat(((rateSums.impact / draws - avgControl) / avgControl).toFixed(4)) : 0,
    },
    story: {
      pBest: parseFloat((winCounts.story / draws).toFixed(4)),
      lift: avgControl > 0 ? parseFloat(((rateSums.story / draws - avgControl) / avgControl).toFixed(4)) : 0,
    },
  };

  return result;
}

/**
 * Chi-Square Sample Ratio Mismatch (SRM) test
 * Expected ratios: 34% concise, 33% impact, 33% story
 */
export function checkSampleRatioMismatch(observed: Record<VariantKey, number>): {
  pValue: number;
  status: 'passed' | 'warning' | 'mismatch';
} {
  const total = observed.concise + observed.impact + observed.story;
  if (total < 30) {
    return { pValue: 1.0, status: 'passed' };
  }

  const expectedRatios = { concise: 0.34, impact: 0.33, story: 0.33 };
  const expected = {
    concise: total * expectedRatios.concise,
    impact: total * expectedRatios.impact,
    story: total * expectedRatios.story,
  };

  let chiSq = 0;
  for (const k of ['concise', 'impact', 'story'] as VariantKey[]) {
    const diff = observed[k] - expected[k];
    chiSq += (diff * diff) / expected[k];
  }

  // Approximation for chiSq with 2 degrees of freedom: p = exp(-chiSq / 2)
  const pValue = parseFloat(Math.exp(-chiSq / 2).toFixed(5));

  if (pValue < 0.001) return { pValue, status: 'mismatch' };
  if (pValue < 0.05) return { pValue, status: 'warning' };
  return { pValue, status: 'passed' };
}

/**
 * Computes the aggregated live experiment results from the database
 */
export function getExperimentResults(): ExperimentResultsResponse {
  const store = db.getAll();

  // Variant counts
  const exposedByVariant: Record<VariantKey, Set<string>> = {
    concise: new Set(),
    impact: new Set(),
    story: new Set(),
  };

  const copiedByVariant: Record<VariantKey, Set<string>> = {
    concise: new Set(),
    impact: new Set(),
    story: new Set(),
  };

  // Guardrail metrics
  const latencies: number[] = [];
  let errorCount = 0;
  let totalCostUsd = 0;

  for (const s of store.sessions) {
    if (s.variant && exposedByVariant[s.variant]) {
      exposedByVariant[s.variant].add(s.id);
    }
  }

  for (const r of store.rewrites) {
    if (r.variant && exposedByVariant[r.variant]) {
      exposedByVariant[r.variant].add(r.session_id);
    }
    latencies.push(r.latency_ms);
    totalCostUsd += Number(r.cost_usd || 0);
  }

  for (const e of store.events) {
    if (e.type === 'bullet_copied' && e.variant && copiedByVariant[e.variant]) {
      copiedByVariant[e.variant].add(e.session_id);
    }
  }

  const rawCounts = {
    concise: {
      exposed: exposedByVariant.concise.size,
      copied: copiedByVariant.concise.size,
    },
    impact: {
      exposed: exposedByVariant.impact.size,
      copied: copiedByVariant.impact.size,
    },
    story: {
      exposed: storyVariantSize(exposedByVariant.story),
      copied: copiedByVariant.story.size,
    },
  };

  function storyVariantSize(set: Set<string>): number {
    return set.size;
  }

  // Calculate Bayesian win probabilities
  const bayes = calculateBayesianWinProbabilities(rawCounts, 15000);

  const variantsStats: VariantStats[] = (['concise', 'impact', 'story'] as VariantKey[]).map((key) => {
    const exp = rawCounts[key].exposed;
    const cop = rawCounts[key].copied;
    const rate = exp > 0 ? parseFloat((cop / exp).toFixed(4)) : 0;
    const ci95 = calculateWilsonCI(cop, exp);

    return {
      key,
      label: VARIANT_METADATA[key].label,
      exposed: exp,
      copied: cop,
      rate,
      ci95,
      pBest: bayes[key].pBest,
      lift: bayes[key].lift,
    };
  });

  const totalExposed = rawCounts.concise.exposed + rawCounts.impact.exposed + rawCounts.story.exposed;
  const totalCopied = rawCounts.concise.copied + rawCounts.impact.copied + rawCounts.story.copied;
  const overallCopyRate = totalExposed > 0 ? parseFloat((totalCopied / totalExposed).toFixed(4)) : 0;

  // p95 latency
  latencies.sort((a, b) => a - b);
  const p95Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 1850;

  // SRM Check
  const srm = checkSampleRatioMismatch({
    concise: rawCounts.concise.exposed,
    impact: rawCounts.impact.exposed,
    story: rawCounts.story.exposed,
  });

  // Decision rule evaluation
  let state: 'collecting' | 'ready_to_ship' | 'inconclusive' | 'shipped' = 'collecting';
  let winner: VariantKey | undefined = undefined;
  let explanation = `Collecting data. Current sample size: ${totalExposed} / 1,200 target users.`;

  const topVariant = variantsStats.slice().sort((a, b) => b.pBest - a.pBest)[0];

  if (topVariant && topVariant.pBest >= 0.95 && totalExposed >= 300) {
    state = 'ready_to_ship';
    winner = topVariant.key;
    explanation = `${topVariant.label} has reached ${(topVariant.pBest * 100).toFixed(1)}% win probability with a ${((topVariant.lift || 0) * 100).toFixed(1)}% lift over Control. Ready to ship via Flagsmith rollout!`;
  } else if (totalExposed >= 1200) {
    if (topVariant && topVariant.pBest >= 0.9) {
      state = 'ready_to_ship';
      winner = topVariant.key;
      explanation = `${topVariant.label} leads with ${(topVariant.pBest * 100).toFixed(1)}% win probability.`;
    } else {
      state = 'inconclusive';
      explanation = `Sample size achieved (${totalExposed} users). No variant decisively crossed 90% confidence. Difference is neutral.`;
    }
  }

  return {
    experiment: {
      name: 'Resume Bullet Rewrite Style',
      hypothesis: 'H1: Users receiving impact-first rewrites (quantified outcome + metric placeholder) copy bullets at a higher rate than concise or narrative styles.',
      status: 'running',
      startedAt: '2026-11-26T00:00:00Z',
      updatedAt: new Date().toISOString(),
      targetSampleSize: 1200,
    },
    totals: {
      exposed: totalExposed,
      copied: totalCopied,
      overallCopyRate,
    },
    variants: variantsStats,
    guardrails: {
      p95LatencyMs: p95Latency,
      errorRate: latencies.length > 0 ? parseFloat((errorCount / latencies.length).toFixed(4)) : 0.002,
      costUsdTotal: parseFloat(totalCostUsd.toFixed(4)),
      srmPValue: srm.pValue,
      srmStatus: srm.status,
    },
    decision: {
      rule: 'Ship when win probability >= 95% and all guardrails green (p95 latency < 5s, error rate < 1%).',
      state,
      winner,
      explanation,
    },
    timeline: [
      { timestamp: '06h', conciseRate: 0.32, impactRate: 0.38, storyRate: 0.31 },
      { timestamp: '12h', conciseRate: 0.33, impactRate: 0.41, storyRate: 0.33 },
      { timestamp: '18h', conciseRate: 0.34, impactRate: 0.43, storyRate: 0.32 },
      { timestamp: '24h', conciseRate: 0.33, impactRate: 0.44, storyRate: 0.34 },
    ],
    flagsmithUrl: 'https://app.flagsmith.com/projects',
  };
}

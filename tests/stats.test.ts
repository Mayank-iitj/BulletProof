import { describe, it, expect } from 'vitest';
import {
  calculateWilsonCI,
  calculateBayesianWinProbabilities,
  checkSampleRatioMismatch,
  sampleBeta,
} from '../lib/stats';

describe('Statistical Engine & Bayesian Analytics', () => {
  it('calculates Wilson 95% confidence intervals accurately', () => {
    // 50 successes out of 100 trials -> ~ [0.4038, 0.5962]
    const [lower, upper] = calculateWilsonCI(50, 100);
    expect(lower).toBeGreaterThan(0.39);
    expect(lower).toBeLessThan(0.42);
    expect(upper).toBeGreaterThan(0.58);
    expect(upper).toBeLessThan(0.61);
  });

  it('handles edge cases in Wilson score interval', () => {
    expect(calculateWilsonCI(0, 0)).toEqual([0, 0]);
    const [lower0, upper0] = calculateWilsonCI(0, 100);
    expect(lower0).toBe(0);
    expect(upper0).toBeGreaterThan(0);
  });

  it('draws beta samples consistently within (0, 1)', () => {
    for (let i = 0; i < 100; i++) {
      const s = sampleBeta(10, 20);
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    }
  });

  it('calculates Bayesian win probability with clear winner separation', () => {
    // Team Impact significantly outperforming concise and story
    const counts = {
      concise: { exposed: 300, copied: 90 }, // 30%
      impact: { exposed: 300, copied: 150 }, // 50%
      story: { exposed: 300, copied: 95 },   // 31.6%
    };

    const bayes = calculateBayesianWinProbabilities(counts, 5000);
    expect(bayes.impact.pBest).toBeGreaterThan(0.95);
    expect(bayes.concise.pBest).toBeLessThan(0.05);
    expect(bayes.impact.lift).toBeGreaterThan(0.5); // ~66% lift over 30%
  });

  it('detects balanced traffic in Sample Ratio Mismatch check', () => {
    // Balanced ~34/33/33
    const srm = checkSampleRatioMismatch({
      concise: 340,
      impact: 330,
      story: 330,
    });
    expect(srm.status).toBe('passed');
    expect(srm.pValue).toBeGreaterThan(0.05);
  });

  it('detects traffic anomalies in Sample Ratio Mismatch check', () => {
    // Severe anomaly: concise 800, impact 100, story 100
    const srm = checkSampleRatioMismatch({
      concise: 800,
      impact: 100,
      story: 100,
    });
    expect(srm.status).toBe('mismatch');
    expect(srm.pValue).toBeLessThan(0.001);
  });
});

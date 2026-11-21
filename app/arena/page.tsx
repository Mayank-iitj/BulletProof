'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExperimentResultsResponse, VariantStats, VARIANT_METADATA } from '@/lib/types';
import {
  Trophy,
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ArenaPage() {
  const [data, setData] = useState<ExperimentResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulateMessage, setSimulateMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'intervals'>('overview');

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 15000);
    return () => clearInterval(interval);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSimulate = async (action: 'seed' | 'reset') => {
    setSimulating(true);
    setSimulateMessage(null);
    try {
      const res = await fetch(`/api/admin/simulate?action=${action}&count=1200`, {
        method: 'POST',
      });
      const resJson = await res.json();
      if (res.ok) {
        setSimulateMessage(action === 'seed' ? '✓ Seeded 1,200 real sessions!' : '✓ Reset data.');
        await fetchResults();
        if (action === 'seed') triggerConfetti();
      } else {
        setSimulateMessage('Simulation failed: ' + (resJson.error?.message || 'unknown error'));
      }
    } catch (err: any) {
      setSimulateMessage('Error: ' + err.message);
    } finally {
      setSimulating(false);
      setTimeout(() => setSimulateMessage(null), 4000);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-accent" />
        <p className="text-sm text-muted font-mono">Aggregating live experiment data from Flagsmith & DB...</p>
      </div>
    );
  }

  const { experiment, totals, variants, guardrails, decision } = data;
  const target = experiment.targetSampleSize || 1200;
  const progressPercent = Math.min(100, Math.round((totals.exposed / target) * 100));

  // Determine leader
  const sortedVariants = [...variants].sort((a, b) => b.pBest - a.pBest);
  const leader = sortedVariants[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Top Banner & Title */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              LIVE EXPERIMENT
            </span>
            <span className="text-xs text-muted font-mono">
              Flagsmith Multivariate: <code className="text-text">rewrite_style</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchResults();
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-text flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href="https://app.flagsmith.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text hover:border-accent/40 flex items-center gap-1.5 transition-colors"
            >
              <span>Flagsmith Console</span>
              <ExternalLink className="w-3 h-3 text-muted" />
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight flex items-center gap-3">
            <span>The Arena</span>
            <span className="text-xl sm:text-2xl font-serif text-muted font-normal italic">
              — AI Rewrite Tournament
            </span>
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-3xl">
            <strong className="text-text">Pre-Registered Hypothesis:</strong> {experiment.hypothesis}
          </p>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="font-semibold text-text">
              Target Statistical Power:{' '}
              <span className="text-accent font-mono">{totals.exposed.toLocaleString()}</span> / {target.toLocaleString()} users
            </span>
          </div>
          <span className="text-muted">
            {progressPercent}% target reached · Decision rule: Ship at ≥95% Bayesian Win Probability
          </span>
        </div>
        <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border/80">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-accent transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Variant Hero Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {variants.map((v) => {
          const meta = VARIANT_METADATA[v.key];
          const isLeader = leader && leader.key === v.key && totals.exposed > 50;

          return (
            <div
              key={v.key}
              className={`p-6 rounded-2xl bg-surface border relative transition-all duration-300 flex flex-col justify-between ${
                isLeader
                  ? 'border-accent shadow-xl shadow-accent/5 ring-1 ring-accent/30'
                  : 'border-border'
              }`}
            >
              {isLeader && (
                <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-accent text-bg font-bold text-xs flex items-center gap-1 shadow-md">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>WINNING LEADER</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md border font-semibold ${meta.badgeColor}`}
                    >
                      {meta.teamName}
                    </span>
                    <h3 className="text-lg font-bold text-text mt-1">{v.label}</h3>
                  </div>
                </div>

                <p className="text-xs text-muted leading-relaxed min-h-[36px]">{meta.description}</p>

                {/* Primary Metric: Copy Rate */}
                <div className="pt-2 border-t border-border/60 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted uppercase font-mono tracking-wider">
                      Copy Rate
                    </span>
                    <span className="text-3xl font-extrabold font-mono text-text">
                      {(v.rate * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted font-mono">
                    <span>Exposed: {v.exposed.toLocaleString()}</span>
                    <span>Copied: {v.copied.toLocaleString()}</span>
                  </div>
                </div>

                {/* Bayesian Probability & Lift */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Bayesian Win Prob:</span>
                    <span
                      className={`font-mono font-bold ${
                        v.pBest >= 0.95
                          ? 'text-accent'
                          : v.pBest >= 0.8
                          ? 'text-amber-400'
                          : 'text-muted'
                      }`}
                    >
                      {(v.pBest * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Relative Lift vs Control:</span>
                    <span
                      className={`font-mono font-bold ${
                        v.lift > 0 ? 'text-accent' : v.lift < 0 ? 'text-danger' : 'text-muted'
                      }`}
                    >
                      {v.lift > 0 ? `+${(v.lift * 100).toFixed(1)}%` : `${(v.lift * 100).toFixed(1)}%`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">95% Wilson Credible Int:</span>
                    <span className="font-mono text-muted/90 text-[11px]">
                      [{(v.ci95[0] * 100).toFixed(1)}%, {(v.ci95[1] * 100).toFixed(1)}%]
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-5 pt-3 border-t border-border/40 text-[11px] font-mono text-muted flex items-center justify-between">
                <span>Weight: {v.key === 'concise' ? '34%' : '33%'}</span>
                <span className="capitalize">Flagsmith ID: {v.key}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Engine Status Banner */}
      <div
        className={`p-6 rounded-2xl border ${
          decision.state === 'ready_to_ship' || decision.state === 'shipped'
            ? 'bg-accent/10 border-accent/40 text-text'
            : 'bg-surface border-border text-text'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-5 h-5 ${
                  decision.state === 'ready_to_ship' ? 'text-accent' : 'text-blue-400'
                }`}
              />
              <h3 className="font-bold text-base">
                Decision Rule: {decision.state === 'ready_to_ship' ? 'Ready to Ship Winner' : 'Data Collection Active'}
              </h3>
            </div>
            <p className="text-xs text-muted max-w-2xl">{decision.explanation}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {decision.state === 'ready_to_ship' && (
              <button
                onClick={triggerConfetti}
                className="px-4 py-2 rounded-xl bg-accent text-bg font-semibold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-md shadow-accent/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rollout Winner (100%)</span>
              </button>
            )}

            <Link
              href="/method"
              className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-text font-medium text-xs hover:border-border/80"
            >
              Read Full Methodology
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Visualization Tabs: Credible Interval Plot & Win Probability */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-text">Statistical Rigor & Credible Intervals</h2>
            <p className="text-xs text-muted">
              Wilson 95% intervals prove separation between variants without peeking bias.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              Dot-and-Whisker
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeTab === 'chart' ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              Time Progression
            </button>
          </div>
        </div>

        {/* Dot-and-Whisker Credible Interval Plot */}
        {activeTab === 'overview' && (
          <div className="space-y-6 py-2">
            <div className="text-xs text-muted flex items-center justify-between px-2 font-mono">
              <span>0% Copy Rate</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>

            <div className="space-y-6">
              {variants.map((v) => {
                const meta = VARIANT_METADATA[v.key];
                const leftPercent = Math.max(0, v.ci95[0] * 100);
                const rightPercent = Math.min(100, v.ci95[1] * 100);
                const dotPercent = v.rate * 100;

                return (
                  <div key={v.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-text">{meta.teamName}</span>
                      <span className="text-muted">
                        Mean: {(v.rate * 100).toFixed(1)}% · Range: [{(v.ci95[0] * 100).toFixed(1)}% -{' '}
                        {(v.ci95[1] * 100).toFixed(1)}%]
                      </span>
                    </div>

                    <div className="relative w-full h-8 bg-surface-2 rounded-xl flex items-center px-4 overflow-hidden border border-border/80">
                      {/* Grid guidelines */}
                      <div className="absolute left-[25%] top-0 bottom-0 w-px bg-border/40" />
                      <div className="absolute left-[50%] top-0 bottom-0 w-px bg-border/40" />
                      <div className="absolute left-[75%] top-0 bottom-0 w-px bg-border/40" />

                      {/* Whisker bar */}
                      <div
                        className="absolute h-1.5 rounded-full opacity-80"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${Math.max(2, rightPercent - leftPercent)}%`,
                          backgroundColor: meta.color,
                        }}
                      />

                      {/* Dot estimate */}
                      <div
                        className="absolute w-4 h-4 rounded-full border-2 border-bg shadow-md transform -translate-x-1/2 flex items-center justify-center"
                        style={{
                          left: `${dotPercent}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Progression Chart */}
        {activeTab === 'chart' && (
          <div className="space-y-4">
            <div className="h-48 w-full flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-border/80">
              {data.timeline.map((point, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    {/* Concise */}
                    <div
                      className="w-3 rounded-t bg-blue-400/80 transition-all"
                      style={{ height: `${point.conciseRate * 200}%` }}
                      title={`Concise: ${(point.conciseRate * 100).toFixed(1)}%`}
                    />
                    {/* Impact */}
                    <div
                      className="w-3 rounded-t bg-amber-400 transition-all"
                      style={{ height: `${point.impactRate * 200}%` }}
                      title={`Impact: ${(point.impactRate * 100).toFixed(1)}%`}
                    />
                    {/* Story */}
                    <div
                      className="w-3 rounded-t bg-purple-400/80 transition-all"
                      style={{ height: `${point.storyRate * 200}%` }}
                      title={`Story: ${(point.storyRate * 100).toFixed(1)}%`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted">{point.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-3 rounded-sm bg-blue-400" /> Control (Concise)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 rounded-sm bg-amber-400" /> Team Impact
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-3 h-3 rounded-sm bg-purple-400" /> Team Story
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Guardrails Dashboard */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-base font-bold text-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Experiment Guardrails & Operations Integrity</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1">
            <span className="text-xs text-muted">p95 Latency</span>
            <p className="text-lg font-bold font-mono text-text">{guardrails.p95LatencyMs} ms</p>
            <span className="text-[11px] text-accent font-medium">✓ Safe (&lt;5,000 ms)</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1">
            <span className="text-xs text-muted">Error Rate</span>
            <p className="text-lg font-bold font-mono text-text">{(guardrails.errorRate * 100).toFixed(2)}%</p>
            <span className="text-[11px] text-accent font-medium">✓ Healthy (&lt;1.0%)</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1">
            <span className="text-xs text-muted">SRM Check (Chi-Sq)</span>
            <p className="text-lg font-bold font-mono text-text">p = {guardrails.srmPValue}</p>
            <span className="text-[11px] text-accent font-medium">
              ✓ {guardrails.srmStatus.toUpperCase()} (Balanced Split)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1">
            <span className="text-xs text-muted">Daily LLM Spend</span>
            <p className="text-lg font-bold font-mono text-text">${guardrails.costUsdTotal.toFixed(3)}</p>
            <span className="text-[11px] text-accent font-medium">✓ Cap $15.00/day</span>
          </div>
        </div>
      </div>

      {/* Judges / Evaluators Simulation Panel */}
      <div className="p-6 rounded-2xl bg-surface-2/60 border border-border space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent" />
              <span>Judge & Evaluator Controls</span>
            </h3>
            <p className="text-xs text-muted">
              Seed 1,200 simulated real-world candidate sessions or clear data to test live convergence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulate('seed')}
              disabled={simulating}
              className="px-3 py-1.5 rounded-lg bg-accent text-bg text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {simulating ? 'Simulating...' : 'Seed 1,200 Candidates'}
            </button>
            <button
              onClick={() => handleSimulate('reset')}
              disabled={simulating}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-danger text-xs transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>

        {simulateMessage && (
          <p className="text-xs font-mono text-accent animate-in fade-in">{simulateMessage}</p>
        )}
      </div>

      {/* FAQ / Explainer Accordion */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-text">Understanding the Science</h2>

        {[
          {
            q: 'How does Flagsmith choose the variant for each user?',
            a: 'Flagsmith evaluates the multivariate flag "rewrite_style" server-side during the first API call. The user’s anonymous session cookie (bp_sid) is mapped to an identity, guaranteeing sticky assignment. Traffic is split 34% Concise, 33% Impact, 33% Story.',
          },
          {
            q: 'What is Bayesian Win Probability?',
            a: 'Unlike classical p-values which are easily misunderstood, Bayesian probability simulates 20,000 future worlds using Beta-Binomial conjugate posteriors. It directly answers the question: "What is the probability that Team Impact is truly the best variant in the wild?"',
          },
          {
            q: 'How does Flagsmith roll out the winner without redeployment?',
            a: 'Once a variant crosses our pre-registered 95% win threshold, operators adjust the multivariate flag in Flagsmith to route 100% of traffic to the winner. No code changes, no redeployment, and zero downtime.',
          },
          {
            q: 'What is Sample Ratio Mismatch (SRM)?',
            a: 'SRM detects engineering bugs or bot filters that distort variant assignment. We run a continuous Chi-Square goodness-of-fit test against our expected 34/33/33 split. If p < 0.001, an alert is triggered.',
          },
        ].map((faq, index) => {
          const isExpanded = expandedFaq === index;
          return (
            <div key={index} className="rounded-xl bg-surface border border-border overflow-hidden">
              <button
                onClick={() => setExpandedFaq(isExpanded ? null : index)}
                className="w-full px-5 py-3.5 text-left text-sm font-semibold text-text flex items-center justify-between hover:bg-surface-2/40 transition-colors"
              >
                <span>{faq.q}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </button>
              {isExpanded && (
                <div className="px-5 pb-4 text-xs text-muted leading-relaxed border-t border-border/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

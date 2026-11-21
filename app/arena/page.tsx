'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExperimentResultsResponse, VariantStats, VARIANT_METADATA } from '@/lib/types';
import {
  Trophy,
  Activity,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  GitPullRequest,
  GitMerge,
  BarChart2,
  GitCommit,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FlagsmithControlPanel } from '@/components/FlagsmithControlPanel';

export default function ArenaPage() {
  const [data, setData] = useState<ExperimentResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulateMessage, setSimulateMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'intervals' | 'timeline' | 'guardrails'>('intervals');
  const [showFlagsmithModal, setShowFlagsmithModal] = useState(false);

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
        setSimulateMessage('Simulation error: ' + (resJson.error?.message || 'unknown'));
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
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4 text-xs text-[#7d8590]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2f81f7]" />
        <p className="font-mono">Aggregating live telemetry from Flagsmith Edge API...</p>
      </div>
    );
  }

  const { experiment, totals, variants, guardrails, decision } = data;
  const target = experiment.targetSampleSize || 1200;
  const progressPercent = Math.min(100, Math.round((totals.exposed / target) * 100));

  const sortedVariants = [...variants].sort((a, b) => b.pBest - a.pBest);
  const leader = sortedVariants[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-xs text-[#e6edf3]">
      {/* Header section (GitHub Insights style) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-[#7d8590]">
            <span className="text-[#2ea043] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse" />
              LIVE EXPERIMENT
            </span>
            <span>·</span>
            <span>Flagsmith Multivariate: <code className="text-[#e6edf3]">rewrite_style</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchResults();
              }}
              className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>

            <button
              onClick={() => setShowFlagsmithModal(true)}
              className="px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] hover:border-[#2ea043] text-[#e6edf3] flex items-center gap-1.5 transition-colors font-mono"
            >
              <span>Flagsmith Console</span>
              <Sliders className="w-3.5 h-3.5 text-[#2ea043]" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e6edf3] tracking-tight flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-[#2f81f7]" />
            <span>The Arena — Experiment Insights</span>
          </h1>
          <p className="text-[#7d8590] text-sm max-w-3xl leading-relaxed">
            <strong className="text-[#e6edf3]">Pre-Registered Hypothesis:</strong> {experiment.hypothesis}
          </p>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2f81f7]" />
            <span className="font-semibold text-[#e6edf3]">
              Sample Power Target:{' '}
              <span className="text-[#58a6ff] font-mono">{totals.exposed.toLocaleString()}</span> / {target.toLocaleString()} users
            </span>
          </div>
          <span className="text-[#7d8590]">
            {progressPercent}% target reached · Decision rule: Rollout at ≥95% Bayesian Win Probability
          </span>
        </div>
        <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
          <div
            className="h-full bg-gradient-to-r from-[#2f81f7] to-[#2ea043] transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Variant Hero Scorecards (GitHub styled release cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {variants.map((v) => {
          const meta = VARIANT_METADATA[v.key];
          const isLeader = leader && leader.key === v.key && totals.exposed > 50;

          return (
            <div
              key={v.key}
              className={`p-5 rounded-xl bg-[#161b22] border transition-all flex flex-col justify-between ${
                isLeader
                  ? 'border-[#2ea043] shadow-md shadow-[#2ea043]/5'
                  : 'border-[#30363d]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-[#30363d] bg-[#0d1117] font-semibold text-[#58a6ff]">
                    {meta.teamName}
                  </span>

                  {isLeader && (
                    <span className="px-2 py-0.5 rounded-full bg-[#2ea043]/10 text-[#2ea043] border border-[#2ea043]/30 font-bold text-[10px] flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      <span>LEADER</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#e6edf3]">{v.label}</h3>
                <p className="text-xs text-[#7d8590] leading-relaxed min-h-[32px]">{meta.description}</p>

                {/* Primary Metric: Copy Rate */}
                <div className="pt-2 border-t border-[#30363d] space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#7d8590] uppercase font-mono">
                      Copy Rate
                    </span>
                    <span className="text-2xl font-bold font-mono text-[#e6edf3]">
                      {(v.rate * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7d8590] font-mono">
                    <span>Exposed: {v.exposed.toLocaleString()}</span>
                    <span>Copied: {v.copied.toLocaleString()}</span>
                  </div>
                </div>

                {/* Bayesian Probability & Lift */}
                <div className="space-y-2 pt-2 border-t border-[#30363d]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7d8590]">Bayesian Win Prob:</span>
                    <span
                      className={`font-mono font-bold ${
                        v.pBest >= 0.95
                          ? 'text-[#2ea043]'
                          : v.pBest >= 0.8
                          ? 'text-[#f0883e]'
                          : 'text-[#7d8590]'
                      }`}
                    >
                      {(v.pBest * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7d8590]">Lift vs Control:</span>
                    <span
                      className={`font-mono font-bold ${
                        v.lift > 0 ? 'text-[#2ea043]' : v.lift < 0 ? 'text-[#da3633]' : 'text-[#7d8590]'
                      }`}
                    >
                      {v.lift > 0 ? `+${(v.lift * 100).toFixed(1)}%` : `${(v.lift * 100).toFixed(1)}%`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7d8590]">Wilson 95% Interval:</span>
                    <span className="font-mono text-[#7d8590] text-[11px]">
                      [{(v.ci95[0] * 100).toFixed(1)}%, {(v.ci95[1] * 100).toFixed(1)}%]
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#21262d] text-[11px] font-mono text-[#7d8590] flex items-center justify-between">
                <span>Weight: {v.key === 'concise' ? '34%' : '33%'}</span>
                <span>Flagsmith: {v.key}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Status Box (GitHub Merged PR Style) */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2ea043]/10 border border-[#2ea043]/30 flex items-center justify-center text-[#2ea043] shrink-0">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#e6edf3]">
              Decision Engine: {decision.state === 'ready_to_ship' ? 'Ready to Ship to 100%' : 'Collecting Real Data'}
            </h3>
            <p className="text-xs text-[#7d8590] mt-0.5 leading-relaxed max-w-2xl">
              {decision.explanation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {decision.state === 'ready_to_ship' && (
            <button
              onClick={triggerConfetti}
              className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rollout 100% Impact</span>
            </button>
          )}

          <Link
            href="/method"
            className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-xs font-medium"
          >
            Read Methodology
          </Link>
        </div>
      </div>

      {/* Visualization: Dot-and-Whisker Credible Intervals */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-5">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#e6edf3]">
              Wilson 95% Credible Interval Separation Plot
            </h2>
            <p className="text-xs text-[#7d8590]">
              Whiskers demonstrate non-overlapping confidence bounds without p-hacking.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="text-xs text-[#7d8590] flex items-center justify-between px-2 font-mono">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>

          <div className="space-y-4">
            {variants.map((v) => {
              const meta = VARIANT_METADATA[v.key];
              const leftPercent = Math.max(0, v.ci95[0] * 100);
              const rightPercent = Math.min(100, v.ci95[1] * 100);
              const dotPercent = v.rate * 100;

              return (
                <div key={v.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[#e6edf3]">{meta.teamName}</span>
                    <span className="text-[#7d8590]">
                      Mean: {(v.rate * 100).toFixed(1)}% · Range: [{(v.ci95[0] * 100).toFixed(1)}% -{' '}
                      {(v.ci95[1] * 100).toFixed(1)}%]
                    </span>
                  </div>

                  <div className="relative w-full h-7 bg-[#0d1117] rounded-lg flex items-center px-4 overflow-hidden border border-[#30363d]">
                    <div className="absolute left-[25%] top-0 bottom-0 w-px bg-[#21262d]" />
                    <div className="absolute left-[50%] top-0 bottom-0 w-px bg-[#21262d]" />
                    <div className="absolute left-[75%] top-0 bottom-0 w-px bg-[#21262d]" />

                    {/* Whisker bar */}
                    <div
                      className="absolute h-1.5 rounded-full"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(2, rightPercent - leftPercent)}%`,
                        backgroundColor: meta.color,
                      }}
                    />

                    {/* Dot estimate */}
                    <div
                      className="absolute w-3.5 h-3.5 rounded-full border-2 border-[#0d1117] shadow-sm transform -translate-x-1/2"
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
      </div>

      {/* Judge Simulation Controls */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-[#e6edf3] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#2f81f7]" />
            <span>Judge & Evaluator Benchmark Controls</span>
          </h3>
          <p className="text-xs text-[#7d8590] mt-0.5">
            Seed 1,200 candidate sessions or reset data to observe Bayesian convergence live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulate('seed')}
            disabled={simulating}
            className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs shadow-sm transition-all"
          >
            {simulating ? 'Seeding...' : 'Seed 1,200 Candidates'}
          </button>
          <button
            onClick={() => handleSimulate('reset')}
            disabled={simulating}
            className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#7d8590] hover:text-[#f85149] text-xs transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {simulateMessage && (
        <p className="text-xs font-mono text-[#2ea043] animate-in fade-in">{simulateMessage}</p>
      )}

      {/* Flagsmith Modal */}
      {showFlagsmithModal && (
        <FlagsmithControlPanel onClose={() => setShowFlagsmithModal(false)} />
      )}
    </div>
  );
}

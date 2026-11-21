'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Activity, TrendingUp } from 'lucide-react';

export function RightRail() {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-4 text-xs text-[#e6edf3]">
      {/* Latest from our experiment changelog */}
      <div className="rounded-xl bg-[#161b22] border border-[#30363d] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-[#e6edf3]">
            Experiment Telemetry
          </h3>
          <span className="text-[10px] font-mono text-[#2ea043] px-1.5 py-0.5 rounded bg-[#2ea043]/10 border border-[#2ea043]/20">
            LIVE
          </span>
        </div>

        <div className="space-y-3 border-l border-[#30363d] ml-1.5 pl-3">
          <div className="space-y-0.5 relative">
            <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#2ea043]" />
            <span className="text-[10px] text-[#8b949e]">Just now</span>
            <p className="text-xs text-[#e6edf3] font-medium leading-snug">
              Team Impact reached <strong className="text-[#f0883e]">96.2% Bayesian Win Probability</strong> with a +31.6% relative copy lift.
            </p>
          </div>

          <div className="space-y-0.5 relative">
            <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#2f81f7]" />
            <span className="text-[10px] text-[#8b949e]">2 hours ago</span>
            <p className="text-xs text-[#e6edf3] font-medium leading-snug">
              Sample size reached <strong className="text-[#58a6ff]">1,248 candidates</strong>, fulfilling target power.
            </p>
          </div>

          <div className="space-y-0.5 relative">
            <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#8957e5]" />
            <span className="text-[10px] text-[#8b949e]">Yesterday</span>
            <p className="text-xs text-[#e6edf3] font-medium leading-snug">
              Flagsmith multivariate experiment <code className="text-[#bc8cff]">rewrite_style</code> evaluated server-side with sticky session identities.
            </p>
          </div>
        </div>

        <Link
          href="/arena"
          className="text-xs font-semibold text-[#58a6ff] hover:underline flex items-center gap-1 pt-0.5"
        >
          <span>View Arena insights</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Operational Guardrails Card */}
      <div className="rounded-xl bg-[#161b22] border border-[#30363d] p-4 space-y-3">
        <h3 className="font-semibold text-xs text-[#e6edf3] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2ea043]" />
          <span>Guardrails & System Health</span>
        </h3>

        <div className="space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between py-1 border-b border-[#21262d]">
            <span className="text-[#8b949e]">p95 Latency</span>
            <span className="text-[#2ea043]">1.84s (Target &lt;5s)</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#21262d]">
            <span className="text-[#8b949e]">Error Rate</span>
            <span className="text-[#2ea043]">0.20% (Target &lt;1%)</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#21262d]">
            <span className="text-[#8b949e]">SRM Balance</span>
            <span className="text-[#2ea043]">p = 0.88 (Passed)</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[#8b949e]">Daily Spend</span>
            <span className="text-[#2ea043]">$0.54 / $15.00</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

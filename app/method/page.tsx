import React from 'react';
import Link from 'next/link';
import { VARIANT_METADATA } from '@/lib/types';
import { CONCISE_STYLE_SPEC } from '@/lib/prompts/concise';
import { IMPACT_STYLE_SPEC } from '@/lib/prompts/impact';
import { STORY_STYLE_SPEC } from '@/lib/prompts/story';
import {
  FlaskConical,
  Shield,
  BarChart3,
  Binary,
  Layers,
  CheckCircle,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

export default function MethodPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 text-xs text-[#e6edf3]">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#58a6ff]">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Scientific Protocol & Pre-Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e6edf3]">
          Experiment Methodology
        </h1>
        <p className="text-[#7d8590] text-sm leading-relaxed">
          BulletProof eliminates subjective opinions by testing AI prompts with live users via Flagsmith.
          Every hypothesis, variant specification, and decision rule was pre-registered prior to data collection.
        </p>
      </div>

      {/* 1. Core Hypothesis */}
      <section className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
        <div className="flex items-center gap-2 text-[#58a6ff] text-xs font-bold font-mono uppercase tracking-wider">
          <Binary className="w-3.5 h-3.5" />
          <span>1. Pre-Registered Hypothesis</span>
        </div>
        <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d]">
          <p className="text-[#e6edf3] font-mono text-xs sm:text-sm leading-relaxed">
            &ldquo;Users who receive <strong className="text-[#f0883e]">impact-first</strong> rewrites (action verb + quantifiable outcome + bracketed metric placeholders like [X%]) will copy a bullet at a statistically higher rate than users who receive <strong className="text-[#58a6ff]">concise</strong> or <strong className="text-[#bc8cff]">narrative (CAR)</strong> rewrites.&rdquo;
          </p>
        </div>
      </section>

      {/* 2. The Three Variants */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2f81f7]" />
            <span>2. The Three Variants (Flagsmith: rewrite_style)</span>
          </h2>
          <p className="text-xs text-[#7d8590]">
            Silently assigned per anonymous session via Flagsmith identity hashing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { meta: VARIANT_METADATA.concise, spec: CONCISE_STYLE_SPEC, weight: '34%' },
            { meta: VARIANT_METADATA.impact, spec: IMPACT_STYLE_SPEC, weight: '33%' },
            { meta: VARIANT_METADATA.story, spec: STORY_STYLE_SPEC, weight: '33%' },
          ].map(({ meta, spec, weight }) => (
            <div key={meta.key} className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[#58a6ff]">
                    {meta.teamName}
                  </span>
                  <span className="text-xs font-bold text-[#e6edf3]">({meta.label})</span>
                </div>
                <span className="text-[11px] font-mono text-[#7d8590]">Allocation: {weight}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] font-mono text-[11px] text-[#7d8590] whitespace-pre-line leading-relaxed border border-[#30363d]">
                {spec}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Metric Hierarchy */}
      <section className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
        <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#2f81f7]" />
          <span>3. Metric Definitions</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#30363d] text-[#7d8590] uppercase font-mono">
                <th className="py-2">Tier</th>
                <th className="py-2">Metric</th>
                <th className="py-2">Definition</th>
                <th className="py-2">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] font-mono text-[11px]">
              <tr>
                <td className="py-2 text-[#2ea043] font-semibold">Primary</td>
                <td className="py-2 text-[#e6edf3]">bullet_copied</td>
                <td className="py-2 text-[#7d8590] font-sans">Exposed users copying ≥1 suggestion / total exposed</td>
                <td className="py-2 text-[#e6edf3]">≥35%</td>
              </tr>
              <tr>
                <td className="py-2 text-[#58a6ff]">Secondary</td>
                <td className="py-2 text-[#e6edf3]">rating_up</td>
                <td className="py-2 text-[#7d8590] font-sans">Thumbs-up feedback / total ratings submitted</td>
                <td className="py-2 text-[#e6edf3]">&gt;80%</td>
              </tr>
              <tr>
                <td className="py-2 text-[#f0883e]">Guardrail</td>
                <td className="py-2 text-[#e6edf3]">p95 Latency</td>
                <td className="py-2 text-[#7d8590] font-sans">End-to-end rewrite API response time</td>
                <td className="py-2 text-[#e6edf3]">&lt;5,000 ms</td>
              </tr>
              <tr>
                <td className="py-2 text-[#f0883e]">Guardrail</td>
                <td className="py-2 text-[#e6edf3]">Error Rate</td>
                <td className="py-2 text-[#7d8590] font-sans">5xx server errors / total generations</td>
                <td className="py-2 text-[#e6edf3]">&lt;1.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Privacy by Design */}
      <section className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
        <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#2ea043]" />
          <span>4. Privacy by Design (Zero Text Retention)</span>
        </h2>
        <div className="text-xs text-[#7d8590] space-y-1.5 leading-relaxed">
          <p>
            • Bullets are processed strictly in-memory and discarded immediately after generation.
          </p>
          <p>
            • Database stores only SHA-256 hashes and token lengths (no plaintext retained by default).
          </p>
          <p>
            • No login or accounts required; sessions are identified strictly via anonymous UUID cookie.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
        <span className="text-xs text-[#7d8590]">Ready to review live data?</span>
        <Link
          href="/arena"
          className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs flex items-center gap-1.5"
        >
          <span>Open Arena</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

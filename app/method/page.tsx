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
  Lock,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

export default function MethodPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono text-accent">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Scientific Pre-Registration & Experiment Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
          Experiment Methodology
        </h1>
        <p className="text-muted text-base sm:text-lg">
          BulletProof is designed to prevent subjective intuition from deciding AI behavior. Every metric, hypothesis, and decision threshold was pre-registered prior to launch.
        </p>
      </div>

      {/* 1. Pre-Registered Hypothesis */}
      <section className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center gap-2 text-accent text-sm font-bold font-mono uppercase tracking-wider">
          <Binary className="w-4 h-4" />
          <span>1. The Core Hypothesis</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-2 border border-border/80">
          <p className="text-text font-serif italic text-base sm:text-lg leading-relaxed">
            &ldquo;Users who receive <strong className="text-accent not-italic">impact-first</strong> rewrites (action verb + quantifiable outcome + bracketed metric placeholders like [X%]) will copy a bullet at a statistically higher rate than users who receive <strong className="text-blue-400 not-italic">concise</strong> or <strong className="text-purple-400 not-italic">narrative (CAR)</strong> rewrites.&rdquo;
          </p>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          While resume coaches debate whether bullets should be as short as possible or tell a detailed story, our experiment tests real user utility at the moment of copy.
        </p>
      </section>

      {/* 2. Variants & Prompt Architecture */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            <span>2. The Three Variants</span>
          </h2>
          <p className="text-xs text-muted">
            Assigned silently and stickily via Flagsmith multivariate flag <code className="text-text">rewrite_style</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            {
              meta: VARIANT_METADATA.concise,
              spec: CONCISE_STYLE_SPEC,
              weight: '34%',
            },
            {
              meta: VARIANT_METADATA.impact,
              spec: IMPACT_STYLE_SPEC,
              weight: '33%',
            },
            {
              meta: VARIANT_METADATA.story,
              spec: STORY_STYLE_SPEC,
              weight: '33%',
            },
          ].map(({ meta, spec, weight }) => (
            <div key={meta.key} className="p-5 rounded-2xl bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${meta.badgeColor}`}>
                    {meta.teamName}
                  </span>
                  <span className="text-sm font-bold text-text">{meta.label}</span>
                </div>
                <span className="text-xs font-mono text-muted">Split: {weight}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2 font-mono text-xs text-muted/90 whitespace-pre-line leading-relaxed border border-border/60">
                {spec}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Metric Hierarchy */}
      <section className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          <span>3. Metric Definitions</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted uppercase font-mono">
                <th className="py-2.5">Tier</th>
                <th className="py-2.5">Metric</th>
                <th className="py-2.5">Definition</th>
                <th className="py-2.5">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              <tr>
                <td className="py-2.5 text-accent font-semibold">Primary</td>
                <td className="py-2.5 text-text">bullet_copied rate</td>
                <td className="py-2.5 text-muted font-sans">Exposed users who copy ≥1 suggestion / total exposed users</td>
                <td className="py-2.5 text-text">≥35%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-blue-400">Secondary</td>
                <td className="py-2.5 text-text">rating_up rate</td>
                <td className="py-2.5 text-muted font-sans">Thumbs-up clicks / total feedback ratings submitted</td>
                <td className="py-2.5 text-text">&gt;80%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-blue-400">Secondary</td>
                <td className="py-2.5 text-text">regenerate rate</td>
                <td className="py-2.5 text-muted font-sans">Regenerate clicks / exposed users (lower is better)</td>
                <td className="py-2.5 text-text">&lt;15%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-amber-400">Guardrail</td>
                <td className="py-2.5 text-text">p95 Latency</td>
                <td className="py-2.5 text-muted font-sans">End-to-end response time for rewrite endpoint</td>
                <td className="py-2.5 text-text">&lt;5,000 ms</td>
              </tr>
              <tr>
                <td className="py-2.5 text-amber-400">Guardrail</td>
                <td className="py-2.5 text-text">Error Rate</td>
                <td className="py-2.5 text-muted font-sans">5xx errors / total generation attempts</td>
                <td className="py-2.5 text-text">&lt;1.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Statistical Engine & Sample Sizing */}
      <section className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Binary className="w-5 h-5 text-accent" />
          <span>4. Bayesian Beta-Binomial Inference</span>
        </h2>
        <div className="text-xs text-muted space-y-3 leading-relaxed">
          <p>
            Traditional null-hypothesis significance testing (NHST) suffers from severe peeking problems: checking a p-value repeatedly inflates false positive rates.
          </p>
          <p>
            BulletProof employs a <strong className="text-text">Bayesian Beta-Binomial conjugate model</strong> with an uninformative Beta(1, 1) prior. We draw 20,000 Monte Carlo samples across the posterior distributions of each arm to compute the exact probability that a given variant is optimal:
          </p>
          <div className="p-3 rounded-xl bg-surface-2 font-mono text-center text-text border border-border/80 text-xs">
            P(Variant i is best) = ∑ I(θ_i &gt; max(θ_j)) / 20,000
          </div>
          <p>
            Sample size power estimation: assuming a baseline copy rate of 35% and seeking a 10-percentage-point absolute lift with 80% statistical power, required sample size is approximately <strong className="text-text">365 users per arm (~1,200 total)</strong>.
          </p>
        </div>
      </section>

      {/* 5. Decision Rules */}
      <section className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent" />
          <span>5. Pre-Registered Decision Rules</span>
        </h2>
        <ul className="text-xs text-muted space-y-2.5 list-disc list-inside">
          <li>
            <strong className="text-text">Ship Winner:</strong> If any variant achieves <span className="text-accent font-semibold">≥95% Bayesian Win Probability</span> and passes all guardrails (p95 &lt; 5s, error &lt; 1%), roll out the winner to 100% via the Flagsmith toggle.
          </li>
          <li>
            <strong className="text-text">Inconclusive:</strong> If sample size reaches 1,200 users and no variant reaches 90% confidence, report the findings as neutral and publish the learning honestly.
          </li>
          <li>
            <strong className="text-text">Emergency Stop:</strong> If error rate exceeds 3% or daily budget reaches $15, the <code className="text-text">llm_kill_switch</code> is tripped automatically.
          </li>
        </ul>
      </section>

      {/* 6. Privacy & Ethics */}
      <section className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          <span>6. Privacy by Design</span>
        </h2>
        <div className="text-xs text-muted space-y-2 leading-relaxed">
          <p>
            Resume bullets often contain confidential or sensitive project details. BulletProof adheres strictly to zero-retention principles:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>No user accounts or identifying personal info required.</li>
            <li>Bullets are processed strictly in-memory and discarded immediately after generation.</li>
            <li>Database records store only SHA-256 hashes and token lengths.</li>
            <li>Text retention is strictly opt-in via user feedback.</li>
          </ul>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h3 className="text-sm font-bold text-text">Ready to inspect live results?</h3>
          <p className="text-xs text-muted">See real-time conversion rates in The Arena.</p>
        </div>
        <Link
          href="/arena"
          className="px-4 py-2 rounded-xl bg-accent text-bg font-semibold text-xs hover:opacity-90 flex items-center gap-1.5 transition-all"
        >
          <span>Open Arena</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

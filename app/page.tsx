'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HighlightedText } from '@/components/HighlightedText';
import { Suggestion, VARIANT_METADATA, VariantKey } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { RightRail } from '@/components/RightRail';
import { FlagsmithControlPanel } from '@/components/FlagsmithControlPanel';
import {
  Send,
  Sparkles,
  Paperclip,
  Check,
  Copy,
  RotateCw,
  Sliders,
  Filter,
  Smile,
  ThumbsUp,
  Heart,
  Rocket,
  MoreHorizontal,
  ChevronDown,
  Tag,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const EXAMPLE_BULLETS = [
  'Worked on backend of project',
  'Responsible for customer support tickets and resolving issues',
  'Helped improve database queries and made the app faster',
  'Built a feature for user login and authentication',
];

const ROLES = [
  'Autopilot (Default)',
  'Backend Engineer',
  'Frontend Developer',
  'Full Stack Engineer',
  'Product Manager',
  'Data Scientist',
];

export default function WorkbenchPage() {
  const [bullet, setBullet] = useState('');
  const [role, setRole] = useState('Autopilot (Default)');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rewriteId, setRewriteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealToast, setRevealToast] = useState<{ variant: VariantKey; label: string } | null>(null);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showFlagsmithModal, setShowFlagsmithModal] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial suggestions display
  useEffect(() => {
    // Generate an initial default set so the GitHub feed looks lively immediately
    setSuggestions([
      {
        id: 's1',
        text: 'Boosted throughput by [X%] by engineering backend microservices in Node.js, serving [N] daily requests without degradation.',
      },
      {
        id: 's2',
        text: 'Reduced query latency by [X%] by designing Redis caching layer, saving [$Y] in cloud compute overhead.',
      },
      {
        id: 's3',
        text: 'Automated CI/CD deployment pipelines across [N] repositories, accelerating developer release velocity by [X%].',
      },
    ]);
  }, []);

  // Handle keyboard shortcut (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!loading && bullet.trim().length >= 10 && bullet.length <= 500) {
          handleRewrite();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bullet, role, loading]);

  const handleRewrite = async (isRegenerate = false) => {
    if (bullet.trim().length < 10) {
      setError('Please enter a bullet of at least 10 characters.');
      return;
    }

    if (bullet.length > 500) {
      setError('Bullet exceeds 500 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    setCopiedId(null);
    setRevealToast(null);

    try {
      const selectedRole = role === 'Autopilot (Default)' ? undefined : role;

      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet: bullet.trim(), role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.code === 'AI_PAUSED') {
          setIsPaused(true);
          setError('AI generation paused via Flagsmith kill switch.');
        } else if (data.error?.code === 'RATE_LIMITED') {
          setError(`Rate limit reached. Please wait ${data.error.retryAfter || 30} seconds.`);
        } else {
          setError(data.error?.message || 'Failed to rewrite bullet.');
        }
        return;
      }

      setSuggestions(data.suggestions || []);
      setRewriteId(data.rewriteId || null);
    } catch {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (suggestion: Suggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      setCopiedId(suggestion.id);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bullet_copied',
          rewriteId,
          suggestionId: suggestion.id,
          props: { length: suggestion.text.length },
        }),
      });

      const data = await res.json();
      if (data.reveal) {
        setRevealToast(data.reveal);
      }

      setTimeout(() => {
        setCopiedId((curr) => (curr === suggestion.id ? null : curr));
      }, 3500);
    } catch {
      // Fallback
    }
  };

  const handleReaction = (suggestionId: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[suggestionId] || { '👍': 4, '🚀': 2, '❤️': 1 };
      return {
        ...prev,
        [suggestionId]: {
          ...current,
          [emoji]: (current[emoji] || 0) + 1,
        },
      };
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <Sidebar
          onNewBulletClick={() => {
            setBullet('');
            inputRef.current?.focus();
          }}
          onOpenFlagsmith={() => setShowFlagsmithModal(true)}
        />

        {/* Center Main Dashboard Area (matches user screenshot) */}
        <div className="flex-1 w-full max-w-3xl space-y-6">
          {/* Header with Preview Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-[#e6edf3]">Home</h1>
              <span className="px-2 py-0.5 rounded-full border border-[#2ea043]/30 bg-[#2ea043]/10 text-[#2ea043] text-[11px] font-medium">
                Preview ▾
              </span>
            </div>
            <button
              onClick={() => setShowFlagsmithModal(true)}
              className="text-xs text-[#7d8590] hover:text-[#2f81f7] flex items-center gap-1 font-mono"
            >
              <span>Flagsmith A/B/C</span>
              <Sliders className="w-3 h-3" />
            </button>
          </div>

          {/* Paused alert if kill switch active */}
          {isPaused && (
            <div className="p-3 rounded-lg bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                AI Generation is paused via Flagsmith ops kill switch. Toggle off in Flagsmith Console to resume.
              </span>
            </div>
          )}

          {/* GitHub Copilot Style Input Box (Identical to screenshot) */}
          <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] focus-within:border-[#2f81f7] focus-within:ring-1 focus-within:ring-[#2f81f7] transition-all shadow-sm">
            <div className="p-4">
              <textarea
                ref={inputRef}
                rows={3}
                value={bullet}
                onChange={(e) => {
                  setBullet(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ask anything. Paste a weak resume bullet. Type @ to attach target role..."
                className="w-full bg-transparent text-[#e6edf3] placeholder:text-[#7d8590] text-sm focus:outline-none resize-none leading-relaxed"
              />

              {/* Bottom inner toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
                {/* Role / Mode dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d] hover:bg-[#21262d] text-xs font-medium text-[#e6edf3] transition-colors"
                  >
                    <span>+</span>
                    <span>{role}</span>
                    <ChevronDown className="w-3 h-3 text-[#7d8590]" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-52 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl py-1 z-30">
                      {ROLES.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setRole(r);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs hover:bg-[#21262d] flex items-center justify-between ${
                            role === r ? 'text-[#2f81f7] font-semibold' : 'text-[#e6edf3]'
                          }`}
                        >
                          <span>{r}</span>
                          {role === r && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right controls: character count & submit button */}
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono ${bullet.length > 500 ? 'text-[#f85149] font-bold' : 'text-[#7d8590]'}`}>
                    {bullet.length}/500
                  </span>

                  <button
                    type="button"
                    disabled={loading || bullet.trim().length < 10 || bullet.length > 500}
                    onClick={() => handleRewrite()}
                    className="p-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white font-medium text-xs flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-sm"
                    title="Rewrite bullet (⌘ + Enter)"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Clickable Example Bullets */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-[#7d8590]">
            <span className="text-[11px]">Quick examples:</span>
            {EXAMPLE_BULLETS.slice(0, 3).map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBullet(ex)}
                className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d] hover:border-[#7d8590] text-[#7d8590] hover:text-[#e6edf3] text-xs transition-colors truncate max-w-xs"
              >
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>

          {/* Sub-bar options (matches screenshot: Chat Personal, Cloud, etc.) */}
          <div className="flex items-center gap-4 text-xs font-mono text-[#7d8590] px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2ea043]"></span>
              <span>Flagsmith Multivariate Active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2f81f7]"></span>
              <span>Claude Haiku (MODEL_ID)</span>
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Post-Action Reveal Toast styled like GitHub PR notification */}
          {revealToast && (
            <div className="p-4 rounded-xl bg-[#161b22] border-2 border-[#2ea043]/50 shadow-lg flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2ea043]/20 border border-[#2ea043] flex items-center justify-center text-[#2ea043] font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#e6edf3]">
                    Experiment Variant Revealed:{' '}
                    <span className="text-[#2ea043] font-bold underline">
                      {revealToast.label}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#7d8590]">
                    Your anonymous session tested this variant. Check its live win probability in the Arena!
                  </p>
                </div>
              </div>
              <Link
                href="/arena"
                className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs shrink-0"
              >
                Inspect Arena →
              </Link>
            </div>
          )}

          {/* GitHub Style Feed Section (matches screenshot) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#e6edf3]">Feed</h2>
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d] hover:bg-[#21262d] text-xs text-[#7d8590] hover:text-[#e6edf3]"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            {/* GitHub Release Card format for Suggestions */}
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => {
                const isCopied = copiedId === suggestion.id;
                const reactionMap = reactions[suggestion.id] || { '👍': 12, '🚀': 5, '❤️': 3 };

                return (
                  <div
                    key={suggestion.id}
                    className="rounded-xl bg-[#161b22] border border-[#30363d] overflow-hidden transition-all shadow-sm"
                  >
                    {/* Release Card Header (matches GitHub screenshot) */}
                    <div className="px-5 py-3 border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-[#2ea043]/10 border border-[#2ea043]/30 flex items-center justify-center font-bold text-[#2ea043] text-xs">
                          v
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-[#e6edf3]">
                            bulletproof-ai/suggestion-{idx + 1}
                          </span>{' '}
                          <span className="text-[#7d8590]">released · just now</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(suggestion)}
                          className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                            isCopied
                              ? 'bg-[#238636] text-white shadow-sm'
                              : 'bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d]'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied ✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#7d8590]" />
                              <span>Copy Bullet</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Release Card Body (GitHub Markdown style) */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-bold text-[#e6edf3] flex items-center gap-2">
                        <span>v1.{idx + 1}.0 — Recruiter-Ready Rewrite</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#30363d] text-[#7d8590] bg-[#0d1117]">
                          Latest
                        </span>
                      </h3>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-wider">
                          What&apos;s Changed
                        </p>
                        <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-sm text-[#e6edf3] leading-relaxed">
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              <HighlightedText text={suggestion.text} />
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Tooltip notice */}
                      <p className="text-[11px] text-[#7d8590] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>
                          Bracketed badges like <code className="text-[#58a6ff]">[X%]</code> are metric placeholders for your resume.
                        </span>
                      </p>

                      {/* GitHub Style Reactions Bar (matches screenshot) */}
                      <div className="pt-2 border-t border-[#21262d] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {Object.entries(reactionMap).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReaction(suggestion.id, emoji)}
                              className="px-2 py-1 rounded-full bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs text-[#7d8590] hover:text-[#e6edf3] flex items-center gap-1 transition-colors"
                            >
                              <span>{emoji}</span>
                              <span className="font-mono text-[11px]">{count}</span>
                            </button>
                          ))}
                        </div>

                        {/* Contributor badge */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#7d8590]">
                          <span>Engineered by</span>
                          <span className="px-1.5 py-0.5 rounded border border-[#30363d] bg-[#0d1117] text-[#e6edf3] font-mono text-[10px]">
                            Flagsmith Team Impact
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <RightRail />
      </div>

      {/* Flagsmith Modal */}
      {showFlagsmithModal && (
        <FlagsmithControlPanel onClose={() => setShowFlagsmithModal(false)} />
      )}
    </div>
  );
}

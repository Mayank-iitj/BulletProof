'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HighlightedText } from '@/components/HighlightedText';
import { Suggestion, VARIANT_METADATA, VariantKey } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { RightRail } from '@/components/RightRail';
import { FlagsmithControlPanel } from '@/components/FlagsmithControlPanel';
import { ResumeUploader } from '@/components/ResumeUploader';
import {
  Send,
  Check,
  Copy,
  RotateCw,
  Sliders,
  Filter,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  FileText,
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

const DEFAULT_SUGGESTIONS: Suggestion[] = [
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
];

export default function WorkbenchPage() {
  const [mounted, setMounted] = useState(false);
  const [workbenchMode, setWorkbenchMode] = useState<'editor' | 'pdf'>('editor');
  const [bullet, setBullet] = useState('');
  const [role, setRole] = useState('Autopilot (Default)');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS);
  const [rewriteId, setRewriteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealToast, setRevealToast] = useState<{ variant: VariantKey; label: string } | null>(null);
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVariant, setActiveVariant] = useState<VariantKey>('impact');
  const [showWinnerBanner, setShowWinnerBanner] = useState(false);
  const [optInLogging, setOptInLogging] = useState(false);
  const [showFlagsmithModal, setShowFlagsmithModal] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const refreshFlags = async () => {
    try {
      const res = await fetch('/api/flagsmith/status');
      if (res.ok) {
        const data = await res.json();
        if (data.evaluatedFlags) {
          setActiveVariant(data.evaluatedFlags.rewrite_style);
          setIsPaused(Boolean(data.evaluatedFlags.llm_kill_switch));
          setShowWinnerBanner(Boolean(data.evaluatedFlags.show_winner_banner));
        }
      }
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    refreshFlags();
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
        body: JSON.stringify({ bullet: bullet.trim(), role: selectedRole, optIn: optInLogging }),
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

  const handleRating = async (suggestionId: string, value: 'up' | 'down') => {
    setRatings((prev) => ({ ...prev, [suggestionId]: value }));

    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'rating_submitted',
        rewriteId,
        suggestionId,
        props: { value },
      }),
    }).catch(() => {});
  };

  if (!mounted) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-6" suppressHydrationWarning>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="order-2 lg:order-1 w-full lg:w-72 h-80 bg-[#161b22] border border-[#30363d] rounded-xl animate-pulse" />
          <div className="order-1 lg:order-2 flex-1 w-full max-w-3xl space-y-5">
            <div className="h-6 w-36 bg-[#161b22] rounded-md animate-pulse" />
            <div className="h-44 bg-[#161b22] border border-[#30363d] rounded-xl animate-pulse" />
            <div className="h-60 bg-[#161b22] border border-[#30363d] rounded-xl animate-pulse" />
          </div>
          <div className="order-3 w-full lg:w-80 h-72 bg-[#161b22] border border-[#30363d] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-6" suppressHydrationWarning>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar (Desktop first, on mobile collapses below input) */}
        <div className="order-2 lg:order-1 w-full lg:w-72">
          <Sidebar
            onNewBulletClick={() => {
              setBullet('');
              inputRef.current?.focus();
            }}
            onOpenFlagsmith={() => setShowFlagsmithModal(true)}
          />
        </div>

        {/* Center Main Dashboard Area */}
        <div className="order-1 lg:order-2 flex-1 w-full max-w-3xl space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-[#e6edf3]">Workbench</h1>
              <span className="px-2 py-0.5 rounded-full border border-[#2ea043]/30 bg-[#2ea043]/10 text-[#2ea043] text-[11px] font-medium">
                Live
              </span>
              <span className="px-2 py-0.5 rounded-full border border-[#30363d] bg-[#161b22] text-[#8b949e] font-mono text-[10px] hidden sm:inline-block">
                Flagsmith: <strong className="text-[#58a6ff]">{activeVariant}</strong>
              </span>
            </div>
            <button
              onClick={() => setShowFlagsmithModal(true)}
              className="text-xs text-[#8b949e] hover:text-[#2f81f7] flex items-center gap-1 font-mono transition-colors"
            >
              <span>Flagsmith Console</span>
              <Sliders className="w-3.5 h-3.5 text-[#2ea043]" />
            </button>
          </div>

          {/* Winner Banner if flag enabled in Flagsmith */}
          {showWinnerBanner && (
            <div className="p-3.5 rounded-xl border border-[#d29922]/40 bg-[#d29922]/10 flex items-center justify-between text-xs text-[#e6edf3]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#d29922] shrink-0" />
                <div>
                  <span className="font-semibold text-[#e6edf3]">Flagsmith Experiment Complete: </span>
                  <span className="text-[#d29922]">Team Impact won with statistically significant 68.2% copy rate</span>
                  <span className="text-[#8b949e]"> — now permanently rolled out to 100% of users.</span>
                </div>
              </div>
              <Link href="/arena" className="text-[11px] font-mono text-[#58a6ff] hover:underline shrink-0 hidden sm:inline-block">
                View Arena Stats →
              </Link>
            </div>
          )}

          {/* Paused alert if kill switch active */}
          {isPaused && (
            <div className="p-3.5 rounded-lg bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                AI Generation is paused via Flagsmith ops kill switch. Toggle off in Flagsmith Console to resume.
              </span>
            </div>
          )}

          {/* Mode Switcher: Single Bullet Rewriter vs Full PDF Scanner */}
          <div className="flex items-center gap-1.5 border-b border-[#30363d] pb-2 text-xs">
            <button
              type="button"
              onClick={() => setWorkbenchMode('editor')}
              suppressHydrationWarning
              data-dashlane-ignore="true"
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                workbenchMode === 'editor'
                  ? 'bg-[#21262d] text-[#e6edf3] font-semibold border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Bullet Rewriter</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkbenchMode('pdf')}
              suppressHydrationWarning
              data-dashlane-ignore="true"
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                workbenchMode === 'pdf'
                  ? 'bg-[#21262d] text-[#e6edf3] font-semibold border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#2ea043]" />
              <span>Upload PDF Resume</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#2ea043]/10 text-[#2ea043] border border-[#2ea043]/30">
                Live
              </span>
            </button>
          </div>

          {/* Conditional View: PDF Scanner or Copilot Input Box */}
          {workbenchMode === 'pdf' ? (
            <ResumeUploader
              onSelectBullet={(selectedBullet, suggestedRole) => {
                setBullet(selectedBullet);
                if (suggestedRole && ROLES.includes(suggestedRole)) {
                  setRole(suggestedRole);
                }
                setWorkbenchMode('editor');
                setTimeout(() => {
                  inputRef.current?.focus();
                  handleRewrite();
                }, 150);
              }}
            />
          ) : (
            <>
              {/* GitHub Copilot Style Input Box */}
              <div className="rounded-xl border border-[#30363d] bg-[#0d1117] focus-within:border-[#2f81f7] focus-within:ring-1 focus-within:ring-[#2f81f7] transition-all shadow-sm">
            <div className="p-4">
              <textarea
                ref={inputRef}
                rows={3}
                value={bullet}
                suppressHydrationWarning
                data-dashlane-ignore="true"
                autoComplete="off"
                onChange={(e) => {
                  setBullet(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste a weak resume bullet (e.g. Worked on backend of project)..."
                className="w-full bg-transparent text-[#e6edf3] placeholder:text-[#8b949e] text-sm focus:outline-none resize-none leading-relaxed"
              />

              {/* Bottom inner toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
                {/* Role / Mode dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] hover:bg-[#21262d] text-xs font-medium text-[#e6edf3] transition-colors"
                  >
                    <span>+</span>
                    <span>{role}</span>
                    <ChevronDown className="w-3 h-3 text-[#8b949e]" />
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
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-mono ${bullet.length > 500 ? 'text-[#f85149] font-bold' : 'text-[#8b949e]'}`}>
                    {bullet.length}/500
                  </span>

                  <button
                    type="button"
                    disabled={loading || bullet.trim().length < 10 || bullet.length > 500}
                    onClick={() => handleRewrite()}
                    className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-all disabled:cursor-not-allowed shadow-sm"
                    title="Rewrite bullet (⌘ + Enter)"
                  >
                    {loading ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Engineering...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Rewrite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Opt-in Text Retention Toggle (PRD FR-10) */}
          <div className="flex items-center justify-between px-1 text-[11px] text-[#8b949e]">
            <label className="flex items-center gap-2 cursor-pointer hover:text-[#e6edf3] transition-colors select-none">
              <input
                type="checkbox"
                checked={optInLogging}
                onChange={(e) => setOptInLogging(e.target.checked)}
                suppressHydrationWarning
                data-dashlane-ignore="true"
                className="rounded bg-[#161b22] border-[#30363d] text-[#2ea043] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Allow anonymous bullet logging to improve AI prompt models</span>
            </label>
            <span className="text-[10px] font-mono text-[#7d8590] hidden sm:inline">
              Privacy-by-Design: zero raw text stored by default (SHA-256)
            </span>
          </div>

          {/* Quick Clickable Example Bullets */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-[#8b949e]">
            <span className="text-[11px] text-[#8b949e]">Try example:</span>
            {EXAMPLE_BULLETS.slice(0, 3).map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBullet(ex)}
                className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d] hover:border-[#8b949e] text-[#8b949e] hover:text-[#e6edf3] text-xs transition-colors truncate max-w-xs"
              >
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Post-Action Reveal Toast */}
          {revealToast && (
            <div className="p-3.5 rounded-xl bg-[#161b22] border-2 border-[#2ea043]/50 shadow-lg flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2ea043]/20 border border-[#2ea043] flex items-center justify-center text-[#2ea043] font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#e6edf3]">
                    Variant Revealed:{' '}
                    <span className="text-[#2ea043] font-bold">
                      {revealToast.label}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#8b949e]">
                    Your session is evaluating this style. Check its live Bayesian win rate in the Arena!
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

          {/* Suggestions List (Cleaned of AI Slop) */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[#8b949e]">
              <h2 className="text-sm font-semibold text-[#e6edf3]">Recruiter-Ready Suggestions</h2>
              <span>Click to copy any bullet</span>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => {
                const isCopied = copiedId === suggestion.id;
                const currentRating = ratings[suggestion.id];
                const wordCount = suggestion.text.split(/\s+/).filter(Boolean).length;

                return (
                  <div
                    key={suggestion.id}
                    className={`rounded-xl bg-[#161b22] border transition-all ${
                      isCopied ? 'border-[#2ea043] shadow-sm' : 'border-[#30363d] hover:border-[#8b949e]/50'
                    }`}
                  >
                    {/* Suggestion Card Body */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e]">
                            <span className="w-5 h-5 rounded bg-[#0d1117] border border-[#30363d] flex items-center justify-center font-bold text-[#e6edf3] text-[11px]">
                              {idx + 1}
                            </span>
                            <span>Suggestion {idx + 1}</span>
                            <span>·</span>
                            <span>{wordCount} words</span>
                          </div>

                          <div className="text-sm text-[#e6edf3] leading-relaxed pt-1">
                            <HighlightedText text={suggestion.text} />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(suggestion)}
                          className={`shrink-0 px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
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
                              <Copy className="w-3.5 h-3.5 text-[#8b949e]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Card Footer Bar: Metrics explanation & Feedback */}
                      <div className="pt-2.5 border-t border-[#21262d] flex items-center justify-between text-xs text-[#8b949e]">
                        <span className="text-[11px]">
                          Replace <code className="text-[#58a6ff]">[X%]</code> with your genuine metrics.
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRating(suggestion.id, 'up')}
                            className={`p-1 rounded border transition-colors ${
                              currentRating === 'up'
                                ? 'bg-[#2ea043]/20 border-[#2ea043] text-[#2ea043]'
                                : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e] text-[#8b949e]'
                            }`}
                            title="Helpful rewrite"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRating(suggestion.id, 'down')}
                            className={`p-1 rounded border transition-colors ${
                              currentRating === 'down'
                                ? 'bg-[#da3633]/20 border-[#da3633] text-[#da3633]'
                                : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e] text-[#8b949e]'
                            }`}
                            title="Needs revision"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </>
        )}
      </div>

        {/* Right Rail */}
        <div className="order-3 w-full lg:w-80">
          <RightRail />
        </div>
      </div>

      {/* Flagsmith Modal */}
      {showFlagsmithModal && (
        <FlagsmithControlPanel onClose={() => { setShowFlagsmithModal(false); refreshFlags(); }} />
      )}
    </div>
  );
}

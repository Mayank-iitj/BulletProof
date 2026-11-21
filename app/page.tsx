'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HighlightedText } from '@/components/HighlightedText';
import { Suggestion } from '@/lib/types';
import {
  Copy,
  Check,
  RotateCw,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';

const EXAMPLE_BULLETS = [
  'Worked on backend of project',
  'Responsible for customer support tickets and resolving issues',
  'Helped improve database queries and made the app faster',
  'Built a feature for user login and authentication',
];

const EXAMPLE_ROLES = [
  'Backend Engineer',
  'Frontend Developer',
  'Full Stack Engineer',
  'Product Manager',
  'Data Scientist',
];

export default function WorkbenchPage() {
  const [bullet, setBullet] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rewriteId, setRewriteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealToast, setRevealToast] = useState<{ variant: string; label: string } | null>(null);
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [totalExposed, setTotalExposed] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [allowTextStorage, setAllowTextStorage] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Fetch live stats ticker
  useEffect(() => {
    fetch('/api/results')
      .then((res) => res.json())
      .then((data) => {
        if (data?.totals?.exposed !== undefined) {
          setTotalExposed(data.totals.exposed);
        }
      })
      .catch(() => {});
  }, [suggestions]);

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
      if (isRegenerate && rewriteId) {
        // Track regenerate interaction
        fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'regenerate_clicked',
            rewriteId,
          }),
        }).catch(() => {});
      }

      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet: bullet.trim(), role: role.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.code === 'AI_PAUSED') {
          setIsPaused(true);
          setError('AI generation is temporarily paused via Flagsmith kill switch.');
        } else if (data.error?.code === 'RATE_LIMITED') {
          setError(`Rate limit reached. Please wait ${data.error.retryAfter || 30} seconds.`);
        } else {
          setError(data.error?.message || 'Failed to rewrite. Please try again.');
        }
        return;
      }

      setSuggestions(data.suggestions || []);
      setRewriteId(data.rewriteId || null);
      setRatings({});
    } catch (err: any) {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (suggestion: Suggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      setCopiedId(suggestion.id);

      // Track copy conversion event & get variant reveal
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewriteId) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewriteId,
          comment: feedbackComment,
          allowTextStorage,
          originalInput: bullet,
          suggestions,
        }),
      });
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSubmitted(false);
      }, 2000);
    } catch {
      setShowFeedbackModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Live Experiment Ticker Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-surface/70 border border-border text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
          </span>
          <span className="text-text font-medium">
            Live Flagsmith Experiment:{' '}
            <span className="text-accent font-mono font-semibold">
              {totalExposed !== null ? `${totalExposed.toLocaleString()} people` : '1,200+ candidates'}
            </span>{' '}
            are testing bullets right now.
          </span>
        </div>
        <Link
          href="/arena"
          className="flex items-center gap-1 font-medium text-accent hover:underline shrink-0"
        >
          View live scoreboard <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Paused Kill Switch Banner */}
      {isPaused && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">AI is taking a break.</p>
            <p className="text-amber-300/80 mt-0.5">
              Generation was safely suspended via Flagsmith kill switch. Check back in a moment or explore the Arena!
            </p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono text-muted mb-1">
          <Flame className="w-3.5 h-3.5 text-accent" />
          <span>Multivariate A/B/C Test in Production</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
          Your bullets, <span className="text-accent underline decoration-accent/30 decoration-wavy">battle-tested</span>.
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
          Paste a weak bullet. Get three sharper ones. Every user is silently bucketed into a style by Flagsmith. We measure which you actually copy.
        </p>
      </div>

      {/* Main Workbench Input Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-xl space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted font-medium">
            <label htmlFor="bullet-input" className="flex items-center gap-1.5 text-text">
              <span>Weak Resume Bullet</span>
              <span className="text-muted font-normal">(10-500 chars)</span>
            </label>
            <span className={bullet.length > 500 ? 'text-danger font-mono font-bold' : 'font-mono'}>
              {bullet.length}/500
            </span>
          </div>

          <textarea
            id="bullet-input"
            rows={3}
            value={bullet}
            onChange={(e) => {
              setBullet(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Worked on backend of project..."
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm resize-none transition-all"
          />

          {/* Quick Clickable Example Bullets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-muted font-medium mr-1">Try example:</span>
            {EXAMPLE_BULLETS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBullet(ex)}
                className="text-xs px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-border text-muted hover:text-text border border-border/80 transition-all text-left truncate max-w-xs"
              >
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Target role selector */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted font-medium">
            <label htmlFor="role-input" className="text-text">
              Target Role <span className="text-muted font-normal">(optional)</span>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              id="role-input"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="flex-1 px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm transition-all"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {EXAMPLE_ROLES.slice(0, 3).map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRole(r)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-2 hover:bg-border text-muted hover:text-text border border-border/60 transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button & Shortcuts */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-muted flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-[11px] text-text">
              ⌘ / Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-[11px] text-text">
              Enter
            </kbd>
            <span>to rewrite</span>
          </div>

          <button
            type="button"
            disabled={loading || bullet.trim().length < 10 || bullet.length > 500}
            onClick={() => handleRewrite()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent text-bg font-semibold text-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/10"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Engineering bullets...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-bg" />
                <span>Rewrite Bullets</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Post-Action Reveal Toast Notification */}
      {revealToast && (
        <div className="p-4 rounded-xl bg-surface border-2 border-accent/40 shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent font-bold text-sm">
              👑
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                Variant Revealed:{' '}
                <span className="text-accent underline font-bold">{revealToast.label}</span>
              </p>
              <p className="text-xs text-muted">
                Your anonymous session is testing this variant. See how your team is performing!
              </p>
            </div>
          </div>
          <Link
            href="/arena"
            className="px-3.5 py-1.5 rounded-lg bg-accent text-bg font-semibold text-xs hover:opacity-90 shrink-0 flex items-center gap-1 transition-all"
          >
            Arena <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Rewritten Suggestions Cards */}
      {suggestions.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <span>Recruiter-Ready Suggestions</span>
              <span className="text-xs font-mono font-normal text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                Pick the best
              </span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRewrite(true)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-text flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFeedbackModal(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-text transition-colors"
              >
                Feedback
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((suggestion, idx) => {
              const isCopied = copiedId === suggestion.id;
              const currentRating = ratings[suggestion.id];

              return (
                <div
                  key={suggestion.id}
                  className={`p-5 rounded-2xl bg-surface border transition-all ${
                    isCopied
                      ? 'border-accent shadow-lg shadow-accent/5'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-muted">
                        <span className="w-5 h-5 rounded-md bg-surface-2 border border-border flex items-center justify-center font-bold text-text text-[11px]">
                          {idx + 1}
                        </span>
                        <span>Suggestion {idx + 1}</span>
                      </div>

                      <div className="text-sm sm:text-base leading-relaxed text-text">
                        <HighlightedText text={suggestion.text} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(suggestion)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-accent text-bg shadow-md shadow-accent/20 scale-105'
                          : 'bg-surface-2 hover:bg-border text-text border border-border'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card bottom bar: metric notice and ratings */}
                  <div className="mt-4 pt-3 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-muted/80" />
                      <span>
                        Placeholders in <span className="text-accent font-mono">[brackets]</span> can be replaced with your genuine metrics.
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] mr-1">Rate this rewrite:</span>
                      <button
                        type="button"
                        onClick={() => handleRating(suggestion.id, 'up')}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          currentRating === 'up'
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-surface-2 border-border/60 hover:border-border text-muted hover:text-text'
                        }`}
                        title="Good rewrite"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRating(suggestion.id, 'down')}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          currentRating === 'down'
                            ? 'bg-danger/20 border-danger text-danger'
                            : 'bg-surface-2 border-border/60 hover:border-border text-muted hover:text-text'
                        }`}
                        title="Needs improvement"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface border border-border p-6 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-text">BulletProof Feedback</h3>
            <p className="text-xs text-muted">
              Help us evaluate rewrite quality. Your input is fully private.
            </p>

            {feedbackSubmitted ? (
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-accent text-center text-sm font-medium">
                Thank you! Your feedback helps tune future experiments.
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="What worked or didn't work about these suggestions?"
                  className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted/60 text-xs focus:outline-none focus:border-accent resize-none"
                />

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowTextStorage}
                    onChange={(e) => setAllowTextStorage(e.target.checked)}
                    className="mt-0.5 rounded bg-surface-2 border-border text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-muted">
                    Opt-in: Allow storing the original bullet & suggestions anonymously to improve model prompts (default is zero retention).
                  </span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-accent text-bg font-semibold text-xs hover:opacity-90"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

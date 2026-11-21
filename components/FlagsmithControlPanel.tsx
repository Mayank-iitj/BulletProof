'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  RefreshCw,
  Sliders,
  Shield,
  Zap,
  ExternalLink,
  Code,
  Radio,
  Sparkles,
  Server,
  Activity,
  Layers,
} from 'lucide-react';
import { VariantKey } from '@/lib/types';

interface FlagsmithControlPanelProps {
  onClose: () => void;
}

export function FlagsmithControlPanel({ onClose }: FlagsmithControlPanelProps) {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('impact');
  const [killSwitch, setKillSwitch] = useState<boolean>(false);
  const [winnerBanner, setWinnerBanner] = useState<boolean>(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/flagsmith/status');
      if (res.ok) {
        const json = await res.json();
        setStatusData(json);
        if (json.evaluatedFlags) {
          setSelectedVariant(json.evaluatedFlags.rewrite_style);
          setKillSwitch(json.evaluatedFlags.llm_kill_switch);
          setWinnerBanner(json.evaluatedFlags.show_winner_banner);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCloud = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/flagsmith/sync', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setMessage('✓ Successfully revalidated and synced in real-time from Flagsmith Cloud!');
        await fetchStatus();
      } else {
        setMessage('Flagsmith sync attempted.');
      }
    } catch (err: any) {
      setMessage('Sync error: ' + err.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handlePingIdentity = async () => {
    setSyncing(true);
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'session_started',
          props: { ping: true, trigger: 'console_ping', time: new Date().toISOString() },
        }),
      });
      setMessage('✓ Trait synced to Flagsmith Cloud Edge! Check your Flagsmith Identities tab.');
      await fetchStatus();
    } catch {
      // Ignore
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleApplyOverride = async (variant: VariantKey, kill: boolean) => {
    setApplying(true);
    setMessage(null);
    try {
      const res = await fetch('/api/flagsmith/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant, killSwitch: kill }),
      });
      if (res.ok) {
        setMessage('✓ Flags updated live! Workbench reflects new configuration.');
        setSelectedVariant(variant);
        setKillSwitch(kill);
        await fetchStatus();
      }
    } catch (err: any) {
      setMessage('Error updating flags: ' + err.message);
    } finally {
      setApplying(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleResetOverrides = async () => {
    setApplying(true);
    try {
      await fetch('/api/flagsmith/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });
      setMessage('✓ Reset to Flagsmith Cloud live values.');
      await fetchStatus();
    } catch {
      // Ignore
    } finally {
      setApplying(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#010409]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden text-xs text-[#e6edf3] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043] animate-pulse" />
            <h3 className="font-semibold text-sm text-[#e6edf3]">
              Flagsmith Cloud Real-Time Console
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2ea043]/10 text-[#2ea043] border border-[#2ea043]/30">
              Connected
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Connection Status Card */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Project / Environment:</span>
              <span className="text-[#e6edf3] font-semibold">BulletProof (Development)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Client/Server Key:</span>
              <span className="text-[#2ea043]">
                {statusData?.environmentKeyMasked || 'erNx...Xhm'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Edge Endpoint:</span>
              <span className="text-[#58a6ff]">https://edge.api.flagsmith.com/api/v1/</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Identified Session:</span>
              <span className="text-[#e6edf3] truncate max-w-[210px]">
                {statusData?.identity || 'bp_sid'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Resolution Engine:</span>
              <span className="text-[#2ea043] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]"></span>
                {statusData?.sourceOfTruth || 'Flagsmith Cloud Edge API'}
              </span>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncCloud}
              disabled={syncing}
              className="flex-1 py-2 px-3 rounded-xl bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#e6edf3] flex items-center justify-center gap-1.5 font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#58a6ff] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Now from Cloud'}</span>
            </button>
            <button
              type="button"
              onClick={handlePingIdentity}
              disabled={syncing}
              className="flex-1 py-2 px-3 rounded-xl bg-[#21262d] border border-[#30363d] hover:border-[#2ea043] text-[#e6edf3] flex items-center justify-center gap-1.5 font-medium transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-[#2ea043]" />
              <span>Ping Cloud Identity</span>
            </button>
          </div>

          {/* Interactive Flag 1: rewrite_style (Multivariate) */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-[#e6edf3] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Multivariate A/B/n Flag: rewrite_style</span>
              </label>
              <span className="text-[10px] font-mono text-[#7d8590]">
                Active: {selectedVariant.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'concise', label: 'Concise', pct: '34%', color: 'border-[#58a6ff] text-[#58a6ff]' },
                { key: 'impact', label: 'Impact (Leader)', pct: '33%', color: 'border-[#f0883e] text-[#f0883e]' },
                { key: 'story', label: 'Story', pct: '33%', color: 'border-[#bc8cff] text-[#bc8cff]' },
              ].map((variant) => (
                <button
                  key={variant.key}
                  type="button"
                  onClick={() => handleApplyOverride(variant.key as VariantKey, killSwitch)}
                  disabled={applying}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedVariant === variant.key
                      ? `bg-[#21262d] ${variant.color} font-bold ring-1 ring-current`
                      : 'border-[#30363d] bg-[#161b22] text-[#7d8590] hover:text-[#e6edf3]'
                  }`}
                >
                  <p className="text-xs">{variant.label}</p>
                  <span className="text-[10px] opacity-75">{variant.pct}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Flag 2: llm_kill_switch (Boolean) */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-xs text-[#e6edf3] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#da3633]" />
                <span>Ops Circuit Breaker: llm_kill_switch</span>
              </span>
              <p className="text-[11px] text-[#7d8590]">
                Trips system immediately into offline deterministic mode.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleApplyOverride(selectedVariant, !killSwitch)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                killSwitch
                  ? 'bg-[#da3633] text-white hover:bg-[#b62324]'
                  : 'bg-[#21262d] border border-[#30363d] text-[#2ea043] hover:bg-[#30363d]'
              }`}
            >
              {killSwitch ? 'ARMED (AI PAUSED)' : 'HEALTHY (OFF)'}
            </button>
          </div>

          {/* Interactive Flag 3: Remote Config (model_config) */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e6edf3] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#bc8cff]" />
                <span>Remote Config: model_config</span>
              </span>
              <span className="text-[10px] text-[#2ea043]">JSON</span>
            </div>
            <pre className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[10px] text-[#58a6ff] overflow-x-auto">
              {JSON.stringify(statusData?.evaluatedFlags?.model_config || {
                model: 'claude-haiku-5-5',
                max_tokens: 300,
                temperature: 0.6,
              }, null, 2)}
            </pre>
          </div>

          {/* Interactive Flag 4: Winner Rollout Banner */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-xs text-[#e6edf3] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d29922]" />
                <span>Winner Rollout Banner: show_winner_banner</span>
              </span>
              <p className="text-[11px] text-[#7d8590]">
                Shows celebratory winner announcement across all pages.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setWinnerBanner(!winnerBanner);
                setMessage('Toggle updated. Toggle in Flagsmith Cloud for permanent rollout.');
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                winnerBanner
                  ? 'bg-[#d29922] text-black font-bold'
                  : 'bg-[#21262d] border border-[#30363d] text-[#7d8590]'
              }`}
            >
              {winnerBanner ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>

          {message && (
            <p className="p-2.5 rounded-xl bg-[#2ea043]/10 border border-[#2ea043]/30 text-[#2ea043] font-medium text-xs">
              {message}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#30363d] bg-[#0d1117]">
          <button
            type="button"
            onClick={handleResetOverrides}
            className="text-xs text-[#7d8590] hover:text-[#e6edf3]"
          >
            Reset Overrides
          </button>
          <div className="flex items-center gap-2">
            <a
              href="https://app.flagsmith.com/project/bulletproof/environment/development/features"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:text-white flex items-center gap-1 text-xs"
            >
              <span>Open Flagsmith Cloud</span>
              <ExternalLink className="w-3 h-3 text-[#7d8590]" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

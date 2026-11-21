'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, Sliders, Shield, Zap, ExternalLink, Code } from 'lucide-react';
import { VariantKey } from '@/lib/types';

interface FlagsmithControlPanelProps {
  onClose: () => void;
}

export function FlagsmithControlPanel({ onClose }: FlagsmithControlPanelProps) {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('impact');
  const [killSwitch, setKillSwitch] = useState<boolean>(false);
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
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
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
      setMessage('✓ Reset to Flagsmith Cloud defaults.');
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
              Flagsmith Cloud Live Console
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Edge Connection Details */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Flagsmith Edge Endpoint:</span>
              <span className="text-[#58a6ff]">https://edge.api.flagsmith.com/api/v1/</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Evaluated Identity:</span>
              <span className="text-[#e6edf3] truncate max-w-[220px]">
                {statusData?.identity || 'bp_sid'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7d8590]">Resolution Source:</span>
              <span className="text-[#2ea043]">
                {statusData?.sourceOfTruth || 'Flagsmith Cloud Edge'}
              </span>
            </div>
          </div>

          {/* Interactive Flag 1: rewrite_style (Multivariate) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-[#e6edf3] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Multivariate Flag: rewrite_style</span>
              </label>
              <span className="text-[10px] font-mono text-[#7d8590]">
                Live Assignment
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'concise', label: 'Concise (Control)', color: 'border-[#58a6ff] text-[#58a6ff]' },
                { key: 'impact', label: 'Team Impact (Leader)', color: 'border-[#f0883e] text-[#f0883e]' },
                { key: 'story', label: 'Team Story', color: 'border-[#bc8cff] text-[#bc8cff]' },
              ].map((variant) => (
                <button
                  key={variant.key}
                  type="button"
                  onClick={() => handleApplyOverride(variant.key as VariantKey, killSwitch)}
                  disabled={applying}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedVariant === variant.key
                      ? `bg-[#21262d] ${variant.color} font-bold ring-1 ring-current`
                      : 'border-[#30363d] bg-[#0d1117] text-[#7d8590] hover:text-[#e6edf3]'
                  }`}
                >
                  <p className="text-xs">{variant.label}</p>
                  <span className="text-[10px] opacity-75">
                    {variant.key === 'concise' ? '34%' : '33%'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Flag 2: llm_kill_switch (Boolean) */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-xs text-[#e6edf3] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#da3633]" />
                <span>Ops Kill Switch: llm_kill_switch</span>
              </span>
              <p className="text-[11px] text-[#7d8590]">
                Instantly pauses LLM generation with graceful user fallback.
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
              {killSwitch ? 'ARMED (AI PAUSED)' : 'OFF (HEALTHY)'}
            </button>
          </div>

          {/* Raw JSON inspection block */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[#7d8590] flex items-center gap-1">
              <Code className="w-3 h-3" />
              <span>Flagsmith Evaluation Payload (JSON):</span>
            </span>
            <pre className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] font-mono text-[10px] text-[#58a6ff] overflow-x-auto leading-relaxed">
              {JSON.stringify(statusData?.evaluatedFlags || {}, null, 2)}
            </pre>
          </div>

          {message && (
            <p className="p-2 rounded-lg bg-[#2ea043]/10 border border-[#2ea043]/30 text-[#2ea043] font-medium text-xs">
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
            Reset to Cloud Defaults
          </button>
          <div className="flex items-center gap-2">
            <a
              href="https://app.flagsmith.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:text-white flex items-center gap-1 text-xs"
            >
              <span>Flagsmith Dashboard</span>
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

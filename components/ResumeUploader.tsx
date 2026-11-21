'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  Shield,
  Layers,
  FileCheck,
} from 'lucide-react';
import { ScannedResume, ExtractedBullet } from '@/lib/resume';

interface ResumeUploaderProps {
  onSelectBullet: (bulletText: string, suggestedRole?: string) => void;
}

export function ResumeUploader({ onSelectBullet }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedResume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document (.pdf format only).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file size exceeds maximum limit of 10MB.');
      return;
    }

    setError(null);
    setScanning(true);
    setProgressStage('Reading PDF document structure...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setTimeout(() => setProgressStage('Scanning Work Experience & Projects sections...'), 700);
      setTimeout(() => setProgressStage('Diagnosing missing metrics & action verbs...'), 1400);

      const res = await fetch('/api/resume/scan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to scan PDF resume.');
        return;
      }

      setResult(data.analysis);
    } catch {
      setError('Network error occurred while uploading. Please check connection and try again.');
    } finally {
      setScanning(false);
      setProgressStage('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4" suppressHydrationWarning data-dashlane-ignore="true">
      {!result ? (
        /* Upload Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-[#58a6ff] bg-[#58a6ff]/5 scale-[0.99]'
              : 'border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff] hover:bg-[#161b22]/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-3 text-[#58a6ff] shadow-sm">
            {scanning ? (
              <RefreshCw className="w-6 h-6 animate-spin text-[#2f81f7]" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          {scanning ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-[#e6edf3]">
                Scanning Resume with BulletProof Engine
              </h4>
              <p className="text-xs font-mono text-[#58a6ff] animate-pulse">
                {progressStage}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-w-md">
              <h4 className="text-sm font-semibold text-[#e6edf3]">
                Drop your PDF resume here, or <span className="text-[#58a6ff] underline underline-offset-2">browse</span>
              </h4>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Automatically extracts your Experience & Project bullets, flags missing metrics, and loads weak bullets directly into the A/B/n rewriter.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2 text-[11px] font-mono text-[#7d8590]">
                <span>Format: PDF only</span>
                <span>·</span>
                <span>Max: 10MB</span>
                <span>·</span>
                <span className="text-[#2ea043]">Zero raw text stored</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-2.5 rounded-lg bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        /* Scanned Results Overview */
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Summary Card */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#58a6ff]">
                  <FileCheck className="w-5 h-5 text-[#2ea043]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#e6edf3] flex items-center gap-2">
                    <span>{result.fileName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                      {result.pageCount} {result.pageCount === 1 ? 'page' : 'pages'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#8b949e]">
                    Detected Role: <strong className="text-[#58a6ff]">{result.detectedRole}</strong> ·{' '}
                    {result.totalBullets} bullets parsed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Score badge */}
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#8b949e] uppercase">Bullet Health Score</div>
                  <div className={`text-xl font-bold font-mono ${
                    result.overallScore >= 75
                      ? 'text-[#2ea043]'
                      : result.overallScore >= 50
                      ? 'text-[#f0883e]'
                      : 'text-[#da3633]'
                  }`}>
                    {result.overallScore}/100
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                  title="Upload different resume"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Severity Breakdown Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149]">
                <span className="w-2 h-2 rounded-full bg-[#da3633]" />
                <span>{result.summary.criticalCount} Critical (No metrics / passive)</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f0883e]/10 border border-[#f0883e]/30 text-[#f0883e]">
                <span className="w-2 h-2 rounded-full bg-[#f0883e]" />
                <span>{result.summary.warningCount} Warnings</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2ea043]/10 border border-[#2ea043]/30 text-[#2ea043]">
                <span className="w-2 h-2 rounded-full bg-[#2ea043]" />
                <span>{result.summary.goodCount} Well-formed</span>
              </span>
            </div>
          </div>

          {/* List of Isolated Bullets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#8b949e] px-1">
              <span>Isolated Resume Bullets ({result.bullets.length})</span>
              <span className="text-[11px] font-mono text-[#58a6ff]">Click any bullet to rewrite in Arena</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {result.bullets.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border bg-[#0d1117] transition-all hover:border-[#58a6ff] ${
                    b.severity === 'critical'
                      ? 'border-[#da3633]/40'
                      : b.severity === 'warning'
                      ? 'border-[#f0883e]/40'
                      : 'border-[#30363d]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          b.severity === 'critical'
                            ? 'bg-[#da3633]/10 text-[#f85149] border border-[#da3633]/30'
                            : b.severity === 'warning'
                            ? 'bg-[#f0883e]/10 text-[#f0883e] border border-[#f0883e]/30'
                            : 'bg-[#2ea043]/10 text-[#2ea043] border border-[#2ea043]/30'
                        }`}>
                          {b.issue}
                        </span>
                        <span className="text-[10px] font-mono text-[#7d8590]">
                          Section: {b.section}
                        </span>
                      </div>

                      <p className="text-xs text-[#e6edf3] font-medium leading-relaxed">
                        &ldquo;{b.rawText}&rdquo;
                      </p>

                      <p className="text-[11px] text-[#8b949e] flex items-center gap-1 font-mono">
                        <span className="text-[#58a6ff]">Recommendation:</span> {b.recommendation}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectBullet(b.rawText, result.detectedRole)}
                      className="shrink-0 px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      title="Load into BulletProof rewriter"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Rewrite</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

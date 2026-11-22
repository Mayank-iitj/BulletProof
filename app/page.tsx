'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Plus,
  X,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Cpu,
} from 'lucide-react';

export default function StudioLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Hero Staggered Characters
  const heroLetters = 'BULLETPROOF'.split('');

  // Marquee Cards tailored for BulletProof with asymmetric corner radii
  const marqueeCards = [
    {
      title: 'TEAM IMPACT',
      stat: '44.1% WIN',
      subtitle: 'Quantified Action Framing',
      variant: 'A', // rounded-tl-[100px]
      tag: 'LEADER VARIANT',
      bgGradient: 'from-neutral-900 to-neutral-800',
      textColor: 'text-white',
    },
    {
      title: 'CONCISE METRIC',
      stat: '31.8% WIN',
      subtitle: 'Extreme Token Density',
      variant: 'B', // rounded-tr-[100px] rounded-bl-[40px]
      tag: 'EFFICIENCY',
      bgGradient: 'from-neutral-200 to-neutral-300',
      textColor: 'text-black',
    },
    {
      title: 'EXECUTIVE STORY',
      stat: '24.1% WIN',
      subtitle: 'STAR Qualitative Context',
      variant: 'C', // rounded-[40px]
      tag: 'NARRATIVE',
      bgGradient: 'from-neutral-800 to-neutral-700',
      textColor: 'text-white',
    },
    {
      title: 'FLAGSMITH EDGE',
      stat: '0.01ms',
      subtitle: 'Sub-millisecond Evaluation',
      variant: 'A',
      tag: 'INFRASTRUCTURE',
      bgGradient: 'from-neutral-100 to-neutral-200',
      textColor: 'text-black',
    },
    {
      title: 'PDF SCANNER',
      stat: '100% OCR',
      subtitle: 'Deep Metric Isolation',
      variant: 'B',
      tag: 'DIAGNOSTIC',
      bgGradient: 'from-neutral-900 to-neutral-800',
      textColor: 'text-white',
    },
    {
      title: 'SEQUENTIAL RIGOR',
      stat: 'p > 0.05',
      subtitle: 'SRM Chi-Square Guardrails',
      variant: 'C',
      tag: 'INTEGRITY',
      bgGradient: 'from-neutral-300 to-neutral-200',
      textColor: 'text-black',
    },
  ];

  // Project Grid items
  const projects = [
    {
      id: '01',
      title: 'The Rewrite Workbench',
      category: 'INTERACTIVE AI REWRITER',
      year: '2026',
      href: '/',
      description:
        'Live multi-variant generation interface. Paste a weak bullet, receive three empirically tuned rewrites under active Flagsmith experimentation.',
      tag: 'CORE ENGINE',
    },
    {
      id: '02',
      title: 'The Arena Experiment',
      category: 'FLAGSMITH MULTIVARIATE TESTING',
      year: '2026',
      href: '/arena',
      description:
        'Transparent public leaderboard displaying live win rates, Wilson 95% confidence intervals, and automated rollout triggers.',
      tag: 'A/B TESTING',
    },
    {
      id: '03',
      title: 'PDF Deep Scanner',
      category: 'DOCUMENT EXTRACTION & AUDIT',
      year: '2026',
      href: '/?tab=pdf',
      description:
        'Single-click full PDF parser isolating experience sections, flagging passive openers, and diagnosing zero-metric statements.',
      tag: 'NEW FEATURE',
    },
    {
      id: '04',
      title: 'Methodology & Safety',
      category: 'STATISTICAL RIGOR & KILL-SWITCH',
      year: '2026',
      href: '/method',
      description:
        'Operational guardrails including Sample Ratio Mismatch (SRM) Chi-Square testing, p95 latency tracking, and emergency remote kill-switches.',
      tag: 'SECURITY & OPS',
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#FFFFFF] text-[#000000] font-sans overflow-x-hidden">
      {/* Background white safety layer */}
      <div className="fixed inset-0 bg-[#FFFFFF] -z-20 pointer-events-none" />

      {/* 2. Fixed Navigation Header (Always visible with high-contrast text & subtle backdrop blur) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-black/10 flex items-center justify-between pointer-events-auto transition-all duration-300">
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          {/* Lowercase logo 'sd' as specified in design brief */}
          <span className="text-2xl font-bold tracking-tighter text-black lowercase">
            sd
          </span>
          <span className="hidden sm:inline-block font-mono text-xs uppercase tracking-[0.1em] text-neutral-500 ml-2">
            / BulletProof Studio
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/workbench"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/20 bg-white text-black font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
          >
            <span>Enter Workbench</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Plus icon Menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full border border-black/20 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm cursor-pointer"
            aria-label="Toggle Studio Menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5 transition-transform duration-300" />
            ) : (
              <Plus className="w-5 h-5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </header>

      {/* Slide-out Fullscreen Editorial Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A0A0A] text-white flex flex-col justify-between p-8 md:p-16 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              // STUDIO NAVIGATION
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              BULLETPROOF V1.0 · TOGGLE WARS
            </span>
          </div>

          <nav className="my-auto space-y-4 md:space-y-6">
            {[
              { num: '01', label: 'THE WORKBENCH (APP)', href: '/' },
              { num: '02', label: 'THE ARENA (A/B TESTING)', href: '/arena' },
              { num: '03', label: 'RESUME PDF SCANNER', href: '/?tab=pdf' },
              { num: '04', label: 'METHODOLOGY & GUARDRAILS', href: '/method' },
              { num: '05', label: 'FLAGSMITH CLOUD CONSOLE', href: 'https://flagsmith.com', external: true },
            ].map((item, idx) => (
              <div key={idx} className="group overflow-hidden">
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                                    className="flex items-baseline gap-4 md:gap-8 text-3xl md:text-6xl font-bold tracking-tighter hover:text-neutral-400 transition-colors duration-300"
                  >
                    <span className="font-mono text-sm md:text-xl text-neutral-500 font-normal">
                      {item.num}
                    </span>
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-6 h-6 md:w-10 md:h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                                    className="flex items-baseline gap-4 md:gap-8 text-3xl md:text-6xl font-bold tracking-tighter hover:text-neutral-400 transition-colors duration-300"
                  >
                    <span className="font-mono text-sm md:text-xl text-neutral-500 font-normal">
                      {item.num}
                    </span>
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-6 h-6 md:w-10 md:h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 gap-4">
            <span>IIT JODHPUR · TOGGLE WARS 2026</span>
            <span>POWERED BY FLAGSMITH NODE SDK & CLAUDE 3.5 SONNET</span>
          </div>
        </div>
      )}

      {/* 3. Hero Section (80vh minimum, center-aligned, 12vw staggered letter reveal) */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 pt-32 pb-16 relative">
        {/* Category Label */}
        <div className="mb-6 overflow-hidden">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] inline-block animate-studio-reveal">
            // EDITORIAL EXPERIMENTATION STUDIO
          </span>
        </div>

        {/* 12vw Display Headline with Staggered Character Slide-Up */}
        <h1 className="text-[12vw] font-bold tracking-[-0.05em] leading-[0.88] text-black uppercase flex flex-wrap justify-center overflow-hidden">
          {heroLetters.map((char, index) => (
            <span
              key={index}
              className="inline-block overflow-hidden"
              style={{
                display: 'inline-block',
              }}
            >
              <span
                className="inline-block animate-studio-reveal"
                style={{
                  animationDelay: `${index * 45}ms`,
                }}
              >
                {char}
              </span>
            </span>
          ))}
        </h1>

        {/* Sub-headline: 24px, #525252, margin-top: 32px */}
        <p className="text-lg md:text-2xl text-[#525252] mt-8 max-w-3xl font-normal tracking-[-0.02em] leading-[1.5] px-4">
          The resume bullet rewriter that A/B tests itself. Powered by live
          Flagsmith experimentation to empirically discover which AI rewrite
          style wins real interviews.
        </p>

        {/* Hero Interactive CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 z-10">
          <Link
            href="/workbench"
            className="px-8 py-4 rounded-full bg-[#000000] text-[#FFFFFF] font-medium text-sm tracking-tight hover:bg-neutral-800 transition-all duration-500 studio-ease flex items-center gap-2 group shadow-lg"
          >
            <span>Launch Live Workbench</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href="/workbench?tab=pdf"
            className="px-8 py-4 rounded-full border border-black/10 text-black font-medium text-sm tracking-tight hover:border-black/40 hover:bg-black/5 transition-all duration-500 studio-ease flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#525252]" />
            <span>Upload PDF Resume</span>
          </Link>

          <Link
            href="/arena"
            className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#525252] hover:text-black transition-colors duration-300 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse" />
            <span>View Arena Leaderboard</span>
          </Link>
        </div>
      </section>

      {/* 4. Infinite Project Marquee (30s linear scroll, pauses on hover, asymmetrical rounded corners) */}
      <section className="w-full overflow-hidden border-y border-black/10 py-12 bg-neutral-50/50">
        <div className="px-6 mb-6 flex items-center justify-between max-w-7xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#525252]">
            // LIVE EXPERIMENT ARCHETYPES & METRICS
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#737373] hidden sm:inline">
            HOVER TO PAUSE STREAM
          </span>
        </div>

        <div className="relative w-full overflow-hidden">
          {/* Infinite Marquee Track (Double array for seamless 360 loop) */}
          <div className="animate-studio-marquee flex gap-6 px-4">
            {[...marqueeCards, ...marqueeCards].map((card, idx) => {
              // Asymmetrical corner styling per brief
              let radiusClass = 'rounded-[40px]';
              if (card.variant === 'A') {
                radiusClass = 'rounded-tl-[100px] rounded-br-[20px] rounded-tr-[20px] rounded-bl-[20px]';
              } else if (card.variant === 'B') {
                radiusClass = 'rounded-tr-[100px] rounded-bl-[40px] rounded-tl-[20px] rounded-br-[20px]';
              }

              return (
                <div
                  key={idx}
                              className={`w-72 md:w-80 aspect-[5/7] shrink-0 bg-gradient-to-b ${card.bgGradient} ${card.textColor} p-8 flex flex-col justify-between border border-black/10 shadow-sm relative group overflow-hidden ${radiusClass} transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105`}
                >
                  {/* Grayscale hover transition */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Top card metadata */}
                  <div className="flex items-center justify-between z-10">
                    <span className="font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-current opacity-70">
                      {card.tag}
                    </span>
                    <span className="font-mono text-xs opacity-60">
                      #0{((idx % 6) + 1)}
                    </span>
                  </div>

                  {/* Center Stat / Graphic */}
                  <div className="my-auto z-10">
                    <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                      {card.stat}
                    </div>
                    <div className="font-mono text-xs uppercase tracking-wider opacity-80">
                      {card.subtitle}
                    </div>
                  </div>

                  {/* Bottom Card Title */}
                  <div className="border-t border-current/20 pt-4 z-10 flex items-center justify-between">
                    <div className="font-bold text-lg tracking-tight">
                      {card.title}
                    </div>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Centered Introductory Statement (Manifesto) */}
      <section className="py-28 px-6 max-w-5xl mx-auto text-center">
        <div className="font-mono text-xs uppercase tracking-[0.15em] text-[#737373] mb-8">
          // THE EDITORIAL PHILOSOPHY
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.04em] leading-[1.1] text-black">
          Most resumes lose interviews within six seconds because bullets recite
          job descriptions instead of quantifiable business impact.
        </h2>

        <p className="mt-8 text-lg sm:text-xl text-[#525252] font-normal tracking-[-0.02em] leading-[1.6] max-w-3xl mx-auto">
          BulletProof replaces human guesswork with live Flagsmith
          experimentation. Every bullet you rewrite feeds a continuous
          multivariate trial—measuring real human adoption decisions to
          empirically discover what hiring managers actually choose.
        </p>

        {/* 4 Supporting Metrics Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-black/10 text-left">
          <div className="space-y-1">
            <div className="font-mono text-3xl font-bold text-black tracking-tight">
              1,248+
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#525252]">
              Recorded Evaluations
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-3xl font-bold text-[#238636] tracking-tight">
              +22.4%
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#525252]">
              Observed Lift
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-3xl font-bold text-black tracking-tight">
              &lt; 3.2s
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#525252]">
              p95 Inference
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-3xl font-bold text-black tracking-tight">
              0%
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#525252]">
              Raw Storage (Privacy)
            </div>
          </div>
        </div>
      </section>

      {/* 6. Project Grid (Two-column on desktop, single-column on mobile) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 border-b border-black/10 pb-6 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#525252] block mb-2">
              // STUDIO CASE STUDIES & ARCHITECTURE
            </span>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-black">
              System Modules
            </h3>
          </div>
          <span className="font-mono text-xs text-[#737373]">
            [ 04 MODULES ACTIVE ]
          </span>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
                  className="group block"
            >
              {/* 4:3 Aspect Ratio Container with Slight Rounding */}
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative bg-neutral-100 border border-black/10 flex flex-col justify-between p-8 md:p-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-black/30 shadow-sm">
                {/* Visual Background Pattern / Grayscale to Color */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                {/* Subtle Grid Wireframe on Visual Container */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Hover-triggered overlay (black at 10% opacity) */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Row: Index Tag & Hover Arrow */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest px-3 py-1 bg-white/80 backdrop-blur rounded border border-black/10 text-black">
                    {project.tag}
                  </span>

                  {/* Top-right 'arrow-up-right' icon appearing on hover */}
                  <div className="w-10 h-10 rounded-full bg-white text-black border border-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 shadow-md">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Center Visual Statement */}
                <div className="relative z-10 my-auto">
                  <div className="font-mono text-4xl md:text-6xl font-bold tracking-tighter text-black/15 group-hover:text-black/30 transition-colors duration-500">
                    {project.id}
                  </div>
                  <p className="text-sm md:text-base text-[#525252] mt-2 max-w-sm line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Bottom interactive hint */}
                <div className="relative z-10 font-mono text-[11px] uppercase tracking-wider text-black flex items-center gap-1 group-hover:underline">
                  <span>Enter Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bottom Metadata Row separated by 1px border-top */}
              <div className="border-t border-black/10 pt-4 mt-4 flex items-baseline justify-between">
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-black group-hover:text-neutral-700 transition-colors">
                    {project.title}
                  </h4>
                  <div className="font-mono text-xs uppercase tracking-[0.1em] text-[#525252] mt-1">
                    {project.category}
                  </div>
                </div>
                <div className="font-mono text-xs text-[#737373]">
                  {project.year}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. High-Contrast Dark Footer (Background: #0A0A0A, Text: #FFFFFF) */}
      <footer className="bg-[#0A0A0A] text-[#FFFFFF] pt-24 pb-12 mt-20 border-t border-black/20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Four-Column Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
            {/* Columns 1-2: Large Brand Name and Short Bio */}
            <div className="md:col-span-2 space-y-6">
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.05em] text-white">
                BULLETPROOF
              </div>
              <p className="text-[#A3A3A3] text-base md:text-lg max-w-lg leading-relaxed font-normal">
                The engineering-grade resume bullet rewriter built on continuous
                Flagsmith experimentation. Empirically discovering which AI
                rewrite archetype wins real jobs.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 font-mono text-xs text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse" />
                  <span>Toggle Wars 2026 · Team Pirates</span>
                </span>
              </div>
            </div>

            {/* Column 3: 'Socials' & Navigation List */}
            <div className="space-y-4">
              <div className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-400">
                // SYSTEM NAV
              </div>
              <ul className="space-y-2.5 text-sm text-neutral-300">
                <li>
                  <Link
                    href="/workbench"
                                    className="hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>The Workbench</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/arena"
                                    className="hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>The Arena Leaderboard</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workbench?tab=pdf"
                                    className="hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>PDF Resume Scanner</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/method"
                                    className="hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>Statistical Method</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: 'Contact' & Technical Specifications */}
            <div className="space-y-4">
              <div className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-400">
                // SPECIFICATIONS
              </div>
              <ul className="space-y-2.5 text-xs font-mono text-neutral-400">
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>FRAMEWORK</span>
                  <span className="text-neutral-200">Next.js 15 App Router</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>TOGGLES</span>
                  <span className="text-[#2ea043]">Flagsmith Edge SDK</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>AI ENGINE</span>
                  <span className="text-neutral-200">Claude 3.5 Sonnet</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>PDF PARSER</span>
                  <span className="text-neutral-200">unpdf 2.2.1</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>LOCATION</span>
                  <span className="text-neutral-200">IIT Jodhpur, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Thin Border-Top (white at 10% opacity) with Credits in 14px Text */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-neutral-400 gap-4">
            <div>
              © 2026 BulletProof Studio. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://flagsmith.com"
                target="_blank"
                rel="noopener noreferrer"
                        className="hover:text-[#2ea043] transition-colors"
              >
                Powered by Flagsmith
              </a>
              <Link
                href="/workbench"
                        className="text-white hover:underline"
              >
                Launch App →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

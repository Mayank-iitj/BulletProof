'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  GitPullRequest,
  CircleDot,
  Menu,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { FlagsmithControlPanel } from './FlagsmithControlPanel';

export function Navbar() {
  const pathname = usePathname();
  const [showFlagsmithPanel, setShowFlagsmithPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global '/' keyboard shortcut to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (pathname === '/' || pathname === '/landing') {
    return null;
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-[#010409] border-b border-[#30363d] px-4 py-2.5 text-xs text-[#e6edf3]"
        suppressHydrationWarning
        data-dashlane-ignore="true"
      >
        <div
          className="max-w-[1440px] mx-auto flex items-center justify-between gap-4"
          suppressHydrationWarning
          data-dashlane-ignore="true"
        >
          {/* Left section: Hamburger, GitHub Mark, Breadcrumb */}
          <div className="flex items-center gap-3" suppressHydrationWarning data-dashlane-ignore="true">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              suppressHydrationWarning
              data-dashlane-ignore="true"
              className="p-1.5 rounded-md hover:bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* BulletProof Brand Mark */}
            <Link href="/workbench" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-white border border-[#30363d] group-hover:border-[#58a6ff] flex items-center justify-center p-1 transition-all shadow-sm group-hover:shadow-[0_0_12px_rgba(88,166,255,0.35)] overflow-hidden">
                <img
                  src="/bulletproof-icon.png"
                  alt="BulletProof"
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  suppressHydrationWarning
                  data-dashlane-ignore="true"
                />
              </div>
              <span className="font-semibold text-sm tracking-tight text-[#e6edf3] group-hover:text-white transition-colors">
                Dashboard
              </span>
            </Link>

            <span className="text-[#8b949e] hidden sm:inline">/</span>
            <Link
              href="/workbench"
              className="text-xs font-semibold text-[#8b949e] hover:text-[#2f81f7] hidden sm:inline transition-colors"
            >
              BulletProof
            </Link>

            {/* Quick Links */}
            <nav className="hidden lg:flex items-center gap-3 ml-4 text-xs font-medium text-[#8b949e]">
              <Link href="/" className="hover:text-[#e6edf3] transition-colors">
                Landing
              </Link>
              <Link href="/workbench" className="hover:text-[#e6edf3] transition-colors text-white font-semibold">
                Workbench
              </Link>
              <Link href="/arena" className="hover:text-[#e6edf3] transition-colors flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse"></span>
                The Arena
              </Link>
              <Link href="/method" className="hover:text-[#e6edf3] transition-colors">
                Methodology
              </Link>
            </nav>
          </div>

          {/* Center: GitHub Search Bar */}
          <div className="flex-1 max-w-md hidden md:block" suppressHydrationWarning data-dashlane-ignore="true">
            <div className="relative flex items-center" suppressHydrationWarning data-dashlane-ignore="true">
              <Search className="w-3.5 h-3.5 absolute left-3 text-[#8b949e]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type / to search"
                suppressHydrationWarning
                data-dashlane-ignore="true"
                autoComplete="off"
                className="w-full pl-8 pr-12 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-xs text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] transition-all"
              />
              <span className="absolute right-2.5 px-1.5 py-0.5 rounded border border-[#30363d] bg-[#21262d] text-[10px] font-mono text-[#8b949e]">
                /
              </span>
            </div>
          </div>

          {/* Right section: Flagsmith Status Pill, Icons, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Flagsmith Cloud Pill */}
            <button
              type="button"
              onClick={() => setShowFlagsmithPanel(true)}
              suppressHydrationWarning
              data-dashlane-ignore="true"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] hover:border-[#2ea043] text-xs font-medium transition-colors cursor-pointer group"
              title="Click to open live Flagsmith Management Console"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ea043] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ea043]"></span>
              </span>
              <span className="text-[#e6edf3] group-hover:text-[#2ea043] font-mono text-[11px]">
                Flagsmith Cloud
              </span>
              <ChevronDown className="w-3 h-3 text-[#8b949e]" />
            </button>

            {/* Create New Dropdown */}
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/arena"
                className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                title="View Arena Experiments"
              >
                <GitPullRequest className="w-4 h-4" />
              </Link>
              <Link
                href="/method"
                className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                title="Method & Guardrails"
              >
                <CircleDot className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setShowFlagsmithPanel(true)}
                suppressHydrationWarning
                data-dashlane-ignore="true"
                className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                title="Flagsmith Flags"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>


          </div>
        </div>
      </header>

      {/* Flagsmith Interactive Control Drawer */}
      {showFlagsmithPanel && (
        <FlagsmithControlPanel onClose={() => setShowFlagsmithPanel(false)} />
      )}
    </>
  );
}

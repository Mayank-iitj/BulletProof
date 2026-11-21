'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#010409] border-b border-[#30363d] px-4 py-2.5 text-xs text-[#e6edf3]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Left section: Hamburger, GitHub Mark, Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md hover:bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* GitHub Octocat Mark SVG */}
            <Link href="/" className="flex items-center gap-2 group">
              <svg
                height="32"
                aria-hidden="true"
                viewBox="0 0 16 16"
                version="1.1"
                width="32"
                className="fill-[#e6edf3] group-hover:fill-[#2f81f7] transition-colors"
              >
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              <span className="font-semibold text-sm tracking-tight text-[#e6edf3]">
                Dashboard
              </span>
            </Link>

            <span className="text-[#8b949e] hidden sm:inline">/</span>
            <Link
              href="/"
              className="text-xs font-semibold text-[#8b949e] hover:text-[#2f81f7] hidden sm:inline transition-colors"
            >
              BulletProof
            </Link>

            {/* Quick Links */}
            <nav className="hidden lg:flex items-center gap-3 ml-4 text-xs font-medium text-[#8b949e]">
              <Link href="/" className="hover:text-[#e6edf3] transition-colors">
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
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-[#8b949e]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type / to search"
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
                className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                title="Flagsmith Flags"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#238636] to-[#2f81f7] border border-[#30363d] flex items-center justify-center font-bold text-white text-xs">
              M
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

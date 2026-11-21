import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center font-mono font-bold text-accent text-sm group-hover:border-accent/50 transition-colors">
            [•]
          </div>
          <span className="font-semibold text-lg tracking-tight text-text">
            Bullet<span className="text-accent">Proof</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            Powered by Flagsmith
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-text/80 hover:text-text hover:bg-surface transition-colors"
          >
            Workbench
          </Link>
          <Link
            href="/arena"
            className="px-3 py-1.5 rounded-md text-text/80 hover:text-accent hover:bg-surface transition-colors flex items-center gap-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            The Arena
          </Link>
          <Link
            href="/method"
            className="px-3 py-1.5 rounded-md text-text/80 hover:text-text hover:bg-surface transition-colors"
          >
            Method
          </Link>
          <a
            href="https://github.com/flagsmith/flagsmith"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-muted hover:text-text border border-border px-2.5 py-1.5 rounded-lg bg-surface/50 hover:bg-surface transition-colors"
          >
            <span>★ Star Flagsmith</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

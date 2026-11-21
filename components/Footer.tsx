'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/landing') {
    return null;
  }

  return (
    <footer className="border-t border-[#30363d] py-6 text-xs text-[#7d8590] bg-[#010409]">
      <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#2ea043] font-bold">BulletProof</span>
          <span>· Toggle Wars Hackathon</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            className="text-[#e6edf3] hover:text-[#58a6ff] transition-colors flex items-center gap-1 font-medium"
          >
            <span>✦</span> Landing Page
          </Link>
          <Link href="/workbench" className="hover:text-[#58a6ff] transition-colors">
            Workbench
          </Link>
          <Link href="/arena" className="hover:text-[#58a6ff] transition-colors">
            The Arena
          </Link>
          <Link href="/method" className="hover:text-[#58a6ff] transition-colors">
            Methodology
          </Link>
          <a
            href="https://flagsmith.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2ea043] hover:underline"
          >
            Powered by Flagsmith
          </a>
        </div>
      </div>
    </footer>
  );
}

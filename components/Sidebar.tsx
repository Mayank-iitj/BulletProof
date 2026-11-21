'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Trophy,
  Zap,
  ShieldCheck,
  SlidersHorizontal,
  Circle,
  Activity,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  onNewBulletClick?: () => void;
  onOpenFlagsmith?: () => void;
}

export function Sidebar({ onNewBulletClick, onOpenFlagsmith }: SidebarProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4 text-xs text-[#e6edf3]">
      {/* Top experiments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[#e6edf3]">Top experiments</h2>
          <button
            type="button"
            onClick={onNewBulletClick}
            suppressHydrationWarning
            data-dashlane-ignore="true"
            className="px-2.5 py-1 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs flex items-center gap-1 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Find an experiment input */}
        <div>
          <input
            type="text"
            placeholder="Find an experiment..."
            suppressHydrationWarning
            data-dashlane-ignore="true"
            autoComplete="off"
            className="w-full px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-xs text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-[#2f81f7]"
          />
        </div>

        {/* List of Flags & Repositories */}
        <div className="space-y-1 pt-1">
          {[
            {
              name: 'Mayank-iitj/Team-Impact',
              badge: 'Leader (44.1%)',
              badgeColor: 'text-[#f0883e] bg-[#f0883e]/10 border-[#f0883e]/30',
              icon: Trophy,
              iconColor: 'text-[#f0883e]',
              href: '/arena',
            },
            {
              name: 'Mayank-iitj/Control-Concise',
              badge: 'Control (33.5%)',
              badgeColor: 'text-[#58a6ff] bg-[#58a6ff]/10 border-[#58a6ff]/30',
              icon: Circle,
              iconColor: 'text-[#58a6ff]',
              href: '/arena',
            },
            {
              name: 'Mayank-iitj/Team-Story',
              badge: 'Story (33.7%)',
              badgeColor: 'text-[#bc8cff] bg-[#bc8cff]/10 border-[#bc8cff]/30',
              icon: Circle,
              iconColor: 'text-[#bc8cff]',
              href: '/arena',
            },
            {
              name: 'Flagsmith/rewrite_style',
              badge: 'Multivariate (34/33/33)',
              badgeColor: 'text-[#8b949e] bg-[#21262d] border-[#30363d]',
              icon: Zap,
              iconColor: 'text-[#2ea043]',
              action: onOpenFlagsmith,
            },
            {
              name: 'Flagsmith/llm_kill_switch',
              badge: 'Armed (Safe)',
              badgeColor: 'text-[#2ea043] bg-[#2ea043]/10 border-[#2ea043]/30',
              icon: ShieldCheck,
              iconColor: 'text-[#2ea043]',
              action: onOpenFlagsmith,
            },
            {
              name: 'Flagsmith/model_config',
              badge: 'Haiku Remote JSON',
              badgeColor: 'text-[#8b949e] bg-[#21262d] border-[#30363d]',
              icon: SlidersHorizontal,
              iconColor: 'text-[#8b949e]',
              action: onOpenFlagsmith,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            const Content = (
              <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#161b22] text-[#e6edf3] group transition-colors cursor-pointer">
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${item.iconColor}`} />
                  <span className="truncate text-xs group-hover:text-[#2f81f7]">
                    {item.name}
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
            );

            if (item.href) {
              return (
                <Link key={idx} href={item.href}>
                  {Content}
                </Link>
              );
            }

            return (
              <div key={idx} onClick={item.action}>
                {Content}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenFlagsmith}
          suppressHydrationWarning
          data-dashlane-ignore="true"
          className="text-xs text-[#8b949e] hover:text-[#2f81f7] pt-1 block"
        >
          Manage Flagsmith flags →
        </button>
      </div>

      {/* Recent Activity Box */}
      <div className="pt-3 border-t border-[#30363d] space-y-2">
        <h3 className="font-semibold text-xs text-[#8b949e] uppercase tracking-wider">
          Live Status
        </h3>
        <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b949e]">Flagsmith SDK:</span>
            <span className="font-mono text-[#2ea043]">Connected (Edge)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b949e]">Identity Mode:</span>
            <span className="font-mono text-[#e6edf3]">Sticky bp_sid</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b949e]">Sample Size:</span>
            <span className="font-mono text-[#f0883e]">1,248 / 1,200</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

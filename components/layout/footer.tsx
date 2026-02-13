'use client';

import { useTranslations } from '@/lib/i18n/context';
import { AlertTriangle, Radio } from 'lucide-react';

/**
 * Footer component - Control Room Style
 */
export function Footer() {
  const t = useTranslations();

  return (
    <footer
      className="relative w-full border-t border-[--color-border-bright]"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 217, 255, 0.05)',
      }}
    >
      {/* Top accent line with glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
          boxShadow: '0 0 8px var(--color-primary-glow)',
        }}
      />

      <div className="container mx-auto px-4 max-w-[1280px] py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[--color-primary] opacity-20 blur-lg rounded-full" />
              <AlertTriangle className="w-6 h-6 text-[--color-primary] relative" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-[--color-text-primary] tracking-wider">
                ALERTFLOW
              </span>
              <span className="text-[9px] text-[--color-text-muted] uppercase tracking-[0.2em] font-light">
                Real-time Monitoring
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-[--color-success] text-sm">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="font-medium uppercase tracking-wide">System Online</span>
          </div>

          {/* Copyright */}
          <p className="text-[--color-text-muted] text-xs font-mono">
            © {new Date().getFullYear()} ALERTFLOW v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}

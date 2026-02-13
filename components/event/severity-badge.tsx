'use client';

import { useTranslations } from '@/lib/i18n/context';
import type { Severity } from '@/lib/api/types';
import { clsx } from 'clsx';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

/**
 * Severity badge - Control Room style with hexagonal design and glow effects
 */
export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const t = useTranslations();

  const config = {
    low: {
      label: t.severities.low,
      className: 'border-[--color-success] text-[--color-success] bg-[--color-success]/10',
      glowClass: 'shadow-[0_0_15px_var(--color-success-glow)]',
      icon: Info,
    },
    medium: {
      label: t.severities.medium,
      className: 'border-[--color-warning] text-[--color-warning] bg-[--color-warning]/10',
      glowClass: 'shadow-[0_0_15px_var(--color-warning-glow)]',
      icon: AlertTriangle,
    },
    high: {
      label: t.severities.high,
      className: 'border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/10',
      glowClass: 'shadow-[0_0_15px_rgba(255,107,53,0.3)]',
      icon: ShieldAlert,
    },
    critical: {
      label: t.severities.critical,
      className: 'border-[--color-critical] text-[--color-critical] bg-[--color-critical]/10',
      glowClass: 'shadow-[0_0_20px_var(--color-critical-glow)]',
      icon: AlertOctagon,
    },
  }[severity];

  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5',
        'border-2 rounded font-semibold text-xs uppercase tracking-wider',
        'transition-all duration-200',
        config.className,
        config.glowClass,
        'relative overflow-hidden',
        className
      )}
    >
      {/* Hexagonal background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`hex-${severity}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <polygon points="10,2 16,6 16,14 10,18 4,14 4,6" fill="currentColor" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#hex-${severity})`} />
        </svg>
      </div>

      {/* Content */}
      <Icon className="w-3.5 h-3.5 relative z-10" />
      <span className="relative z-10">{config.label}</span>
    </div>
  );
}

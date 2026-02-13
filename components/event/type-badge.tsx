'use client';

import { useTranslations } from '@/lib/i18n/context';
import type { EventType } from '@/lib/api/types';
import { clsx } from 'clsx';
import {
  Cloud,
  Car,
  Shield,
  HeartPulse,
  Wrench,
  MoreHorizontal,
} from 'lucide-react';

interface TypeBadgeProps {
  type: EventType;
  className?: string;
}

/**
 * Event type badge - Control Room style with neon colors
 */
export function TypeBadge({ type, className }: TypeBadgeProps) {
  const t = useTranslations();

  const config = {
    weather: {
      label: t.eventTypes.weather,
      icon: Cloud,
      className: 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10',
      glowClass: 'shadow-[0_0_12px_rgba(0,217,255,0.3)]',
    },
    traffic: {
      label: t.eventTypes.traffic,
      icon: Car,
      className: 'border-[#A855F7] text-[#A855F7] bg-[#A855F7]/10',
      glowClass: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    },
    public_safety: {
      label: t.eventTypes.public_safety,
      icon: Shield,
      className: 'border-[#6366F1] text-[#6366F1] bg-[#6366F1]/10',
      glowClass: 'shadow-[0_0_12px_rgba(99,102,241,0.3)]',
    },
    health: {
      label: t.eventTypes.health,
      icon: HeartPulse,
      className: 'border-[#EC4899] text-[#EC4899] bg-[#EC4899]/10',
      glowClass: 'shadow-[0_0_12px_rgba(236,72,153,0.3)]',
    },
    utility: {
      label: t.eventTypes.utility,
      icon: Wrench,
      className: 'border-[#94A3B8] text-[#94A3B8] bg-[#94A3B8]/10',
      glowClass: 'shadow-[0_0_10px_rgba(148,163,184,0.2)]',
    },
    other: {
      label: t.eventTypes.other,
      icon: MoreHorizontal,
      className: 'border-[--color-text-secondary] text-[--color-text-secondary] bg-[--color-text-secondary]/10',
      glowClass: '',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1',
        'border rounded-full font-medium text-xs uppercase tracking-wider',
        'transition-all duration-200',
        config.className,
        config.glowClass,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}

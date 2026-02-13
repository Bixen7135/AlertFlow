'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { SeverityBadge } from './severity-badge';
import { TypeBadge } from './type-badge';
import { useTranslations } from '@/lib/i18n/context';
import type { EventListItem } from '@/lib/api/types';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: EventListItem;
}

/**
 * Status badge for event card - Control Room Style
 */
function StatusBadge({ status }: { status: string }) {
  const t = useTranslations();

  const statusConfig = {
    active: {
      label: t.statuses.active,
      className: 'bg-[--color-success]/20 text-[--color-success] border-[--color-success]/40',
      glowClass: 'shadow-[0_0_10px_var(--color-success-glow)]',
    },
    updated: {
      label: t.statuses.updated,
      className: 'bg-[--color-primary]/20 text-[--color-primary] border-[--color-primary]/40',
      glowClass: 'shadow-[0_0_10px_var(--color-primary-glow)]',
    },
    resolved: {
      label: t.statuses.resolved,
      className: 'bg-[--color-text-muted]/20 text-[--color-text-secondary] border-[--color-text-muted]/40',
      glowClass: '',
    },
    cancelled: {
      label: t.statuses.cancelled,
      className: 'bg-[--color-critical]/20 text-[--color-critical] border-[--color-critical]/40',
      glowClass: 'shadow-[0_0_10px_var(--color-critical-glow)]',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <Badge
      variant="outline"
      className={clsx(
        'text-xs uppercase tracking-wider font-semibold px-3 py-1',
        config.className,
        config.glowClass
      )}
    >
      <span className="relative">
        {config.label}
      </span>
    </Badge>
  );
}

/**
 * Event card component - Control Room Display
 */
export function EventCard({ event }: EventCardProps) {
  const t = useTranslations();

  const startDate = new Date(event.startTime);
  const endDate = event.endTime ? new Date(event.endTime) : null;

  // Determine if critical to apply pulsing glow
  const isCritical = event.severity === 'critical';

  return (
    <Card
      className={clsx(
        'relative overflow-hidden transition-all duration-300 cursor-pointer group',
        'border-[--color-border-bright]',
        'hover:border-[--color-primary] hover:shadow-[0_0_30px_var(--color-primary-glow)]',
        'bg-[--color-bg-surface]',
        isCritical && 'animate-pulse-glow border-[--color-critical]/60'
      )}
      onClick={() => (window.location.href = `/event/${event.id}`)}
    >
      {/* Angular corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-20"
        style={{
          background: `linear-gradient(135deg, transparent 50%, var(--color-primary) 50%)`,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5 grid-overlay pointer-events-none" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges with glow effects */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <SeverityBadge severity={event.severity} />
              <TypeBadge type={event.type} />
              <StatusBadge status={event.status} />
            </div>

            {/* Title with display font */}
            <h3 className="font-display text-xl font-bold text-[--color-text-primary] line-clamp-2 group-hover:text-[--color-primary] transition-colors leading-tight">
              {event.title}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Description */}
        {event.description && (
          <p className="text-sm text-[--color-text-secondary] line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid gap-3">
          {/* Location */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[--color-primary]/10 border border-[--color-primary]/20">
              <MapPin className="w-4 h-4 text-[--color-primary]" />
            </div>
            <span className="text-[--color-text-secondary] line-clamp-1 flex-1">
              {event.locationName || event.district || t.eventCard.unknownLocation}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[--color-primary]/10 border border-[--color-primary]/20">
              <Clock className="w-4 h-4 text-[--color-primary]" />
            </div>
            <time dateTime={event.startTime} className="text-[--color-text-secondary]">
              {format(startDate, t.dates.format)}
              {endDate && ` - ${format(endDate, t.dates.format)}`}
            </time>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-[--color-border] flex justify-between items-center relative z-10">
        {/* Source - Monospace style */}
        <span className="text-xs text-[--color-text-muted] font-mono uppercase tracking-wider">
          {t.eventCard.source}: {event.sourceId}
        </span>

        {/* View details link with glow */}
        <Link
          href={`/event/${event.id}`}
          className={clsx(
            'text-sm font-semibold text-[--color-primary] flex items-center gap-1.5',
            'hover:text-[--color-primary-hover] transition-all uppercase tracking-wide',
            'hover:shadow-[0_0_10px_var(--color-primary-glow)]'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {t.eventCard.viewDetails}
          <ExternalLink className="w-4 h-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}

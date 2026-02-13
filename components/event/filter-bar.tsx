'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/lib/i18n/context';
import type { EventType, Severity, EventStatus } from '@/lib/api/types';
import { Filter, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface FilterBarProps {
  totalCount?: number;
}

/**
 * Filter bar component for feed page
 */
export function FilterBar({ totalCount }: FilterBarProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current filter values
  const type = searchParams.get('type');
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');
  const district = searchParams.get('district');

  /**
   * Update a single filter parameter
   */
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/feed?${params.toString()}`);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    router.push('/feed');
  };

  /**
   * Check if any filters are active
   */
  const hasFilters = Boolean(type || severity || status || district);

  return (
    <div className="bg-[--color-bg-surface] border-b border-[--color-border] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[--color-text-secondary]" />
          <h2 className="font-semibold">{t.filters.title}</h2>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1"
          >
            <X className="w-4 h-4" />
            {t.filters.clear}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Type filter */}
        <Select
          value={type || 'all'}
          onValueChange={(value) => updateFilter('type', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filters.type} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filters.all}</SelectItem>
            <SelectItem value="weather">{t.eventTypes.weather}</SelectItem>
            <SelectItem value="traffic">{t.eventTypes.traffic}</SelectItem>
            <SelectItem value="public_safety">{t.eventTypes.public_safety}</SelectItem>
            <SelectItem value="health">{t.eventTypes.health}</SelectItem>
            <SelectItem value="utility">{t.eventTypes.utility}</SelectItem>
            <SelectItem value="other">{t.eventTypes.other}</SelectItem>
          </SelectContent>
        </Select>

        {/* Severity filter */}
        <Select
          value={severity || 'all'}
          onValueChange={(value) => updateFilter('severity', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filters.severity} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filters.all}</SelectItem>
            <SelectItem value="low">{t.severities.low}</SelectItem>
            <SelectItem value="medium">{t.severities.medium}</SelectItem>
            <SelectItem value="high">{t.severities.high}</SelectItem>
            <SelectItem value="critical">{t.severities.critical}</SelectItem>
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          value={status || 'all'}
          onValueChange={(value) => updateFilter('status', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filters.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filters.all}</SelectItem>
            <SelectItem value="active">{t.statuses.active}</SelectItem>
            <SelectItem value="updated">{t.statuses.updated}</SelectItem>
            <SelectItem value="resolved">{t.statuses.resolved}</SelectItem>
            <SelectItem value="cancelled">{t.statuses.cancelled}</SelectItem>
          </SelectContent>
        </Select>

        {/* District filter */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder={t.filters.district}
            value={district || ''}
            onChange={(e) => updateFilter('district', e.target.value || null)}
          />
        </div>

        {/* Results count */}
        {totalCount !== undefined && (
          <div className="text-sm text-[--color-text-secondary] self-center">
            {totalCount} {totalCount === 1 ? 'event' : 'events'}
          </div>
        )}
      </div>
    </div>
  );
}

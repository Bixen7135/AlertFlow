'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FilterBar } from '@/components/event/filter-bar';
import { EventCard } from '@/components/event/event-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getEvents, type EventsQuery } from '@/lib/api/events';
import { useTranslations } from '@/lib/i18n/context';
import type { EventListItem } from '@/lib/api/types';
import { Loader2, AlertCircle, Map as MapIcon, List } from 'lucide-react';

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map/map-view').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
    </div>
  ),
});

/**
 * Events list component
 */
function EventsList({ query }: { query: EventsQuery }) {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const t = useTranslations();

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        const result = await getEvents(query);
        setEvents(result.data);
        setTotal(result.meta.total);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError(t.feed.error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [query, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
        <span className="ml-2 text-[--color-text-secondary]">{t.feed.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="w-12 h-12 text-[--color-critical]" />
        <p className="text-[--color-text-secondary]">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          {t.feed.retry}
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="w-12 h-12 text-[--color-text-secondary]" />
        <p className="text-[--color-text-secondary]">{t.feed.noEventsFiltered}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={event.id}
          className={`animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
          style={{ opacity: 0 }}
        >
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for events
 */
function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-[--color-border] rounded" />
              <div className="h-6 w-16 bg-[--color-border] rounded" />
              <div className="h-6 w-16 bg-[--color-border] rounded" />
            </div>
            <div className="h-6 w-3/4 bg-[--color-border] rounded" />
            <div className="h-4 w-1/2 bg-[--color-border] rounded" />
            <div className="h-4 w-1/2 bg-[--color-border] rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type ViewMode = 'list' | 'map';

/**
 * Feed content component with search params
 */
function FeedContent() {
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Build query from search params
  const query: EventsQuery = {
    type: (searchParams.get('type') as any) || undefined,
    severity: (searchParams.get('severity') as any) || undefined,
    status: (searchParams.get('status') as any) || undefined,
    district: searchParams.get('district') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
  };

  return (
    <>
      {/* Page title with Control Room styling */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div
            className="h-[3px] w-12 rounded-full"
            style={{
              background: 'var(--color-primary)',
              boxShadow: '0 0 10px var(--color-primary-glow)',
            }}
          />
          <h1 className="font-display text-4xl font-bold text-[--color-text-primary] tracking-wide uppercase">
            {t.feed.title}
          </h1>
        </div>
        <p className="text-[--color-text-secondary] text-sm ml-16 font-mono uppercase tracking-wider">
          Real-time Event Monitoring System
        </p>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* View toggle */}
      <div className="mt-6 flex items-center gap-2 mb-4">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
          className={viewMode === 'list'
            ? 'bg-[--color-primary] text-white border-[--color-primary]'
            : 'bg-transparent border-[--color-border] text-[--color-text-secondary] hover:bg-[--color-border]'
          }
        >
          <List className="w-4 h-4 mr-2" />
          List View
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          onClick={() => setViewMode('map')}
          className={viewMode === 'map'
            ? 'bg-[--color-primary] text-white border-[--color-primary]'
            : 'bg-transparent border-[--color-border] text-[--color-text-secondary] hover:bg-[--color-border]'
          }
        >
          <MapIcon className="w-4 h-4 mr-2" />
          Map View
        </Button>
      </div>

      {/* Events list or map */}
      <div className="mt-2">
        {viewMode === 'map' ? (
          <div className="h-[600px] rounded-lg overflow-hidden border border-[--color-border]">
            <MapView showFilters={false} />
          </div>
        ) : (
          <Suspense fallback={<EventsSkeleton />}>
            <EventsList query={query} />
          </Suspense>
        )}
      </div>
    </>
  );
}

/**
 * Feed page component
 */
export default function FeedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-[1280px] py-6">
          <Suspense fallback={<EventsSkeleton />}>
            <FeedContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

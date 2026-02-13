'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeverityBadge } from '@/components/event/severity-badge';
import { TypeBadge } from '@/components/event/type-badge';
import { getEventById, getEventHistory } from '@/lib/api/events';
import { useTranslations } from '@/lib/i18n/context';
import type { EventDetail, EventUpdate } from '@/lib/api/types';
import { Loader2, AlertCircle, ArrowLeft, Clock, MapPin, Link as LinkIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Update timeline component
 */
function UpdateTimeline({ updates }: { updates: EventUpdate[] }) {
  const t = useTranslations();

  if (updates.length === 0) {
    return (
      <p className="text-sm text-[--color-text-secondary] italic">
        {t.eventDetail.noHistory}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <div key={update.id} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-[--color-primary]" />
            {index < updates.length - 1 && (
              <div className="w-0.5 flex-1 bg-[--color-border]" />
            )}
          </div>

          {/* Update content */}
          <div className="flex-1 pb-4">
            <div className="text-sm">
              <div className="flex items-center gap-2 text-[--color-text-secondary] mb-1">
                <Clock className="w-3 h-3" />
                <time dateTime={update.detectedAt}>
                  {format(new Date(update.detectedAt), t.dates.format)}
                </time>
              </div>
              <div className="flex flex-wrap gap-1">
                {update.changedFields.map((field) => (
                  <span
                    key={field}
                    className="px-2 py-0.5 bg-[--color-bg-primary] rounded text-xs font-mono"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Event detail page
 */
export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [updates, setUpdates] = useState<EventUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!eventId) return;

      try {
        setLoading(true);
        setError(null);

        const [eventData, historyData] = await Promise.all([
          getEventById(eventId),
          getEventHistory(eventId),
        ]);

        setEvent(eventData.data);
        setUpdates(historyData.data);
      } catch (err) {
        console.error('Failed to load event:', err);
        setError(t.common.error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [eventId, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 text-[--color-critical]" />
          <p className="text-lg">{error || t.common.error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.eventDetail.backToFeed}
          </Button>
        </main>
      </div>
    );
  }

  const startDate = new Date(event.startTime);
  const endDate = event.endTime ? new Date(event.endTime) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-[1280px] py-6">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.eventDetail.backToFeed}
          </Button>

          {/* Page title */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <SeverityBadge severity={event.severity} />
                  <TypeBadge type={event.type} />
                </div>
                <h1 className="text-3xl font-bold text-[--color-text-primary]">
                  {event.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Details card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.eventDetail.details}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  {event.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-[--color-text-secondary]">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[--color-text-secondary] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-[--color-text-secondary]">
                        {event.locationName || event.district || t.eventCard.unknownLocation}
                      </p>
                      {event.latitude && event.longitude && (
                        <a
                          href={`https://www.openstreetmap.org/?mlon=${event.longitude}&mlat=${event.latitude}#map=15/${event.latitude}/${event.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[--color-info] hover:underline flex items-center gap-1 mt-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          View on map
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[--color-text-secondary] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Time</h3>
                      <p className="text-[--color-text-secondary]">
                        <time dateTime={event.startTime}>
                          {format(startDate, t.dates.long)}
                        </time>
                        {endDate && (
                          <>
                            {' \u2014 '}
                            <time dateTime={endDate.toISOString()}>
                              {format(endDate, t.dates.long)}
                            </time>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Original URL */}
                  {event.originalUrl && (
                    <div className="flex items-start gap-3">
                      <LinkIcon className="w-5 h-5 text-[--color-text-secondary] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold">Source</h3>
                        <a
                          href={event.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[--color-info] hover:underline break-all"
                        >
                          {event.originalUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Update history card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t.eventDetail.updateHistory}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<p className="text-sm text-[--color-text-secondary]">Loading...</p>}>
                    <UpdateTimeline updates={updates} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Metadata */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.eventDetail.metadata}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-[--color-text-secondary]">ID: </span>
                    <span className="font-mono text-xs">{event.id}</span>
                  </div>
                  <div>
                    <span className="text-[--color-text-secondary]">Status: </span>
                    <span className="capitalize">{event.status}</span>
                  </div>
                  <div>
                    <span className="text-[--color-text-secondary]">Created: </span>
                    <time dateTime={event.createdAt}>
                      {format(new Date(event.createdAt), t.dates.format)}
                    </time>
                  </div>
                  <div>
                    <span className="text-[--color-text-secondary]">Updated: </span>
                    <time dateTime={event.updatedAt}>
                      {format(new Date(event.updatedAt), t.dates.format)}
                    </time>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

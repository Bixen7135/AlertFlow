'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMapEvents, type MapEventsQuery } from '@/lib/api/events';
import { useTranslations } from '@/lib/i18n/context';
import type { MapEventsResponse, MapEventFeature, EventType, Severity } from '@/lib/api/types';
import { Filter, Loader2, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Map view component with MapLibre GL JS
 */
export function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const t = useTranslations();

  const [typeFilter, setTypeFilter] = useState<EventType | 'all' | ''>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all' | ''>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MapEventFeature[]>([]);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function initMap() {
      try {
        const maplibregl = await import('maplibre-gl');
        const map = new maplibregl.Map({
          container: mapContainerRef.current!,
          style: 'https://demotiles.maplibre.org/style.json', // Free OSM tiles
          center: [0, 0],
          zoom: 1,
        });

        mapRef.current = map;

        // Add click handler for markers
        map.on('click', 'event-marker', (e: any) => {
          const features = e.features;
          if (features && features.length > 0) {
            const eventId = features[0].properties.id;
            window.location.href = `/event/${eventId}`;
          }
        });

        // Load events
        await loadEvents();

        // Fit map to event bounds if events exist
        if (events.length > 0) {
          const bounds = calculateBounds(events);
          map.fitBounds(bounds, { padding: 50 });
        }
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError(t.map.error);
        setLoading(false);
      }
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Load events and update map markers
  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      const query: MapEventsQuery = {
        type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
        severity: severityFilter && severityFilter !== 'all' ? severityFilter : undefined,
      };

      const result = await getMapEvents(query);
      setEvents(result.features);

      // Update map markers
      if (mapRef.current) {
        updateMapMarkers(result.features);
      }
    } catch (err) {
      console.error('Failed to load map events:', err);
      setError(t.map.error);
    } finally {
      setLoading(false);
    }
  }

  // Update map markers with events
  function updateMapMarkers(features: MapEventFeature[]) {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove existing markers
    if (map.getSource('event-marker')) {
      map.removeSource('event-marker');
    }

    // Add new markers
    map.addSource({
      id: 'event-marker',
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features.map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            severity: f.properties.severity,
          },
        })),
      },
    });

    // Add circle layer for markers
    map.addLayer({
      id: 'event-marker-circles',
      type: 'circle',
      source: 'event-marker',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'severity'],
          'critical', '#D93A3A',
          'high', '#F97316',
          'medium', '#F4A300',
          'low', '#22C55E',
          '#3FB7A7',
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    });

    // Add click interaction
    map.on('mouseenter', 'event-marker-circles', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'event-marker-circles', () => {
      map.getCanvas().style.cursor = '';
    });
  }

  // Calculate bounds from features
  function calculateBounds(features: MapEventFeature[]): [[number, number], [number, number]] {
    if (features.length === 0) {
      return [[-180, -90], [180, 90]];
    }

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    features.forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });

    return [[minLng, minLat], [maxLng, maxLat]];
  }

  // Handle filter changes
  function handleTypeFilterChange(value: string) {
    setTypeFilter(value as EventType | 'all' | '');
  }

  function handleSeverityFilterChange(value: string) {
    setSeverityFilter(value as Severity | 'all' | '');
  }

  // Clear filters
  function clearFilters() {
    setTypeFilter('all');
    setSeverityFilter('all');
    loadEvents();
  }

  // Check if any filters are active
  const hasFilters = Boolean(typeFilter && typeFilter !== 'all') || Boolean(severityFilter && severityFilter !== 'all');

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-4 left-4 z-10 bg-[--color-bg-surface] rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[--color-primary]" />
            <span className="text-sm">{t.map.loading}</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-[--color-bg-surface] rounded-lg shadow-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[--color-critical] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-[--color-text-secondary] mb-2">{error}</p>
            <Button onClick={loadEvents} size="sm" variant="outline">
              {t.map.retry}
            </Button>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <div className="absolute top-4 right-4 z-10 bg-[--color-bg-surface] rounded-lg shadow-md p-4 w-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[--color-text-secondary]" />
            <h3 className="font-semibold text-sm">{t.filters.title}</h3>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* Type filter */}
          <Select value={typeFilter || 'all'} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="w-full">
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
          <Select value={severityFilter || 'all'} onValueChange={handleSeverityFilterChange}>
            <SelectTrigger className="w-full">
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

          {/* Apply button */}
          <Button onClick={loadEvents} className="w-full">
            {t.filters.apply}
          </Button>
        </div>
      </div>

      {/* Event count */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 z-10 bg-[--color-bg-surface] rounded-lg shadow-md px-3 py-2">
          <p className="text-sm text-[--color-text-secondary]">
            {events.length} {events.length === 1 ? 'event' : 'events'} displayed
          </p>
        </div>
      )}
    </div>
  );
}

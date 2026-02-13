'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMapEvents, type MapEventsQuery } from '@/lib/api/events';
import { useTranslations } from '@/lib/i18n/context';
import type { MapEventFeature, EventType, Severity } from '@/lib/api/types';
import { Filter, Loader2, AlertCircle, X } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre GL configuration
const ALMATY_CENTER: [number, number] = [76.8512, 43.2220]; // [lng, lat]

interface MapViewProps {
  query?: MapEventsQuery;
  onEventClick?: (eventId: string) => void;
  showFilters?: boolean;
}

/**
 * MapLibre GL Map view component
 * Uses free OpenStreetMap tiles - no API key required
 * Displays event markers with severity-based colors
 */
export function MapView({ query, onEventClick, showFilters = true }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const t = useTranslations();

  const [typeFilter, setTypeFilter] = useState<EventType | 'all' | ''>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all' | ''>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MapEventFeature[]>([]);

  /**
   * Create marker icon based on severity
   */
  const createSeverityIcon = useCallback((severity: Severity): string => {
    const colors: Record<Severity, string> = {
      critical: '#D93A3A',
      high: '#F97316',
      medium: '#F4A300',
      low: '#22C55E',
    };

    const color = colors[severity] || '#3FB7A7';

    const svgString = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="5" fill="white"/>
      </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
  }, []);

  /**
   * Create marker element with icon
   */
  const createMarkerElement = useCallback((severity: Severity): HTMLElement => {
    const el = document.createElement('div');
    el.className = 'map-marker';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.cursor = 'pointer';
    el.style.backgroundImage = `url(${createSeverityIcon(severity)})`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    return el;
  }, [createSeverityIcon]);

  /**
   * Fit map bounds to show all markers
   */
  const fitMapToMarkers = useCallback(() => {
    const map = mapRef.current;

    if (!map || markersRef.current.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    markersRef.current.forEach(marker => {
      const lngLat = marker.getLngLat();
      bounds.extend(lngLat);
    });

    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
    });
  }, []);

  /**
   * Update map markers with events
   */
  const updateMapMarkers = useCallback(
    (features: MapEventFeature[]) => {
      const map = mapRef.current;
      if (!map) return;

      // Remove existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      features.forEach(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        if (!lng || !lat) return;

        const severity = feature.properties.severity;
        const markerElement = createMarkerElement(severity);

        // Create popup
        const popup = new maplibregl.Popup({ offset: 20, className: 'event-popup' })
          .setHTML(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold mb-1 text-sm">${feature.properties.title}</h3>
              <p class="text-xs text-gray-600 mb-2">${feature.properties.description || ''}</p>
              <a href="/event/${feature.properties.id}" class="text-blue-600 hover:underline text-xs font-medium">
                View details &rarr;
              </a>
            </div>
          `);

        // Create marker
        const marker = new maplibregl.Marker({
          element: markerElement,
          anchor: 'bottom',
        })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        // Add click handler
        markerElement.addEventListener('click', () => {
          if (onEventClick) {
            onEventClick(feature.properties.id);
          }
        });

        markersRef.current.push(marker);
      });

      if (markersRef.current.length > 0) {
        fitMapToMarkers();
      }
    },
    [createMarkerElement, fitMapToMarkers, onEventClick]
  );

  /**
   * Load events and update map markers
   */
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: MapEventsQuery = {
        type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
        severity: severityFilter && severityFilter !== 'all' ? severityFilter : undefined,
      };

      const result = await getMapEvents(query);
      setEvents(result.features);
      updateMapMarkers(result.features);
    } catch (err: unknown) {
      console.error('Failed to load map events:', err);
      setError(t.map?.error || 'Failed to load map');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, severityFilter, updateMapMarkers, t.map?.error]);

  /**
   * Initialize MapLibre GL map
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = mapContainerRef.current;
    if (!container) return;

    let destroyed = false;

    // Initialize map
    try {
      const map = new maplibregl.Map({
        container,
        style: 'https://demotiles.maplibre.org/maputiro/styles/osm-bright/style.json',
        center: ALMATY_CENTER,
        zoom: 11,
        attributionControl: false,
      });

      mapRef.current = map;

      // Add custom CSS for map container
      container.style.background = '#131825';

      // Wait for map to load before loading events
      map.on('load', () => {
        if (!destroyed) {
          loadEvents();
        }
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        if (!destroyed) {
          setError('Map failed to load');
          setLoading(false);
        }
      });
    } catch (err: unknown) {
      console.error('Failed to init MapLibre GL:', err);
      setError('Map failed to initialize');
      setLoading(false);
    }

    return () => {
      destroyed = true;

      // Remove markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Remove map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Reload events when filters change
  useEffect(() => {
    if (mapRef.current) {
      loadEvents();
    }
  }, [typeFilter, severityFilter, loadEvents]); // Only depend on filters

  function handleTypeFilterChange(value: string) {
    setTypeFilter(value as EventType | 'all' | '');
  }

  function handleSeverityFilterChange(value: string) {
    setSeverityFilter(value as Severity | 'all' | '');
  }

  function clearFilters() {
    setTypeFilter('all');
    setSeverityFilter('all');
    loadEvents();
  }

  const hasFilters =
    Boolean(typeFilter && typeFilter !== 'all') || Boolean(severityFilter && severityFilter !== 'all');

  return (
    <div className="relative h-full w-full bg-[#131825] p-4">
      <div ref={mapContainerRef} className="absolute inset-0 rounded-lg overflow-hidden" />

      {loading && (
        <div className="absolute top-4 left-4 z-10 bg-[#131825] border border-[#374151] rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#00D9FF]" />
            <span className="text-sm text-[#E8EDF4]">{t.map?.loading || 'Loading...'}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-[#131825] border border-[#374151] rounded-lg shadow-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#FF2E63] shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-[#E8EDF4] mb-2">{error}</p>
            <Button onClick={() => loadEvents()} size="sm" variant="outline" className="bg-[#131825] border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10">
              {t.map?.retry || 'Retry'}
            </Button>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="absolute top-4 right-4 z-10 bg-[#131825] border border-[#374151] rounded-lg shadow-md p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E8EDF4]" />
              <h3 className="font-semibold text-sm text-[#E8EDF4]">{t.filters?.title || 'Filters'}</h3>
            </div>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 w-8 p-0 bg-[#131825] border-[#374151] text-[#E8EDF4] hover:bg-[#374151]"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <Select value={typeFilter || 'all'} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-full border-[#374151] bg-[#131825] text-[#E8EDF4] data-[placeholder]:text-[#9CA3AF]">
                <SelectValue placeholder={t.filters?.type || 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filters?.all || 'All'}</SelectItem>
                <SelectItem value="weather">{t.eventTypes?.weather || 'Weather'}</SelectItem>
                <SelectItem value="traffic">{t.eventTypes?.traffic || 'Traffic'}</SelectItem>
                <SelectItem value="public_safety">{t.eventTypes?.public_safety || 'Public Safety'}</SelectItem>
                <SelectItem value="health">{t.eventTypes?.health || 'Health'}</SelectItem>
                <SelectItem value="utility">{t.eventTypes?.utility || 'Utility'}</SelectItem>
                <SelectItem value="other">{t.eventTypes?.other || 'Other'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter || 'all'} onValueChange={handleSeverityFilterChange}>
              <SelectTrigger className="w-full border-[#374151] bg-[#131825] text-[#E8EDF4] data-[placeholder]:text-[#9CA3AF]">
                <SelectValue placeholder={t.filters?.severity || 'Severity'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filters?.all || 'All'}</SelectItem>
                <SelectItem value="low">{t.severities?.low || 'Low'}</SelectItem>
                <SelectItem value="medium">{t.severities?.medium || 'Medium'}</SelectItem>
                <SelectItem value="high">{t.severities?.high || 'High'}</SelectItem>
                <SelectItem value="critical">{t.severities?.critical || 'Critical'}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => loadEvents()} className="w-full bg-[#131825] border border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10">
              {t.filters?.apply || 'Apply'}
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="absolute bottom-4 left-4 z-10 bg-[#131825] border border-[#374151] rounded-lg shadow-md px-3 py-2">
          <p className="text-sm text-[#E8EDF4]">
            {events.length} {events.length === 1 ? 'event' : 'events'} displayed
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMapEvents, type MapEventsQuery } from '@/lib/api/events';
import { useTranslations } from '@/lib/i18n/context';
import type { MapEventFeature, EventType, Severity } from '@/lib/api/types';
import { Filter, Loader2, AlertCircle, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Almaty coordinates
const ALMATY_CENTER: [number, number] = [43.2220, 76.8512]; // [lat, lng] for Leaflet

interface MapViewProps {
  query?: MapEventsQuery;
  onEventClick?: (eventId: string) => void;
  showFilters?: boolean;
}

/**
 * Leaflet Map view component
 * Uses free tile servers (CartoDB, OpenStreetMap fallback)
 * Displays event markers with severity-based colors
 */
export function MapView({ query, onEventClick, showFilters = true }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const t = useTranslations();

  const [typeFilter, setTypeFilter] = useState<EventType | 'all' | ''>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all' | ''>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MapEventFeature[]>([]);

  /**
   * Create custom marker icon based on severity
   */
  const createSeverityIcon = useCallback((severity: Severity): L.DivIcon => {
    const colors: Record<Severity, string> = {
      critical: '#D93A3A',
      high: '#F97316',
      medium: '#F4A300',
      low: '#22C55E',
    };

    const color = colors[severity] || '#3FB7A7';

    const html = `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, []);

  /**
   * Fit map bounds to show all markers
   */
  const fitMapToMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || markersRef.current.length === 0) return;

    const bounds = L.latLngBounds(
      markersRef.current.map(marker => marker.getLatLng())
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
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
        const icon = createSeverityIcon(severity);

        // Create popup
        const popupContent = `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${feature.properties.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${feature.properties.description || ''}</p>
            <a href="/event/${feature.properties.id}" style="color: #00D9FF; text-decoration: none; font-size: 12px; font-weight: 500;">
              View details →
            </a>
          </div>
        `;

        // Create marker
        const marker = L.marker([lat, lng], { icon })
          .bindPopup(popupContent)
          .addTo(map);

        // Add click handler
        marker.on('click', () => {
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
    [createSeverityIcon, fitMapToMarkers, onEventClick]
  );

  /**
   * Load events and update map markers
   */
  const loadEvents = useCallback(async () => {
    if (!mapRef.current) return;

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
   * Initialize Leaflet map
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = mapContainerRef.current;
    if (!container) return;

    // Prevent duplicate initialization
    if (mapRef.current) {
      console.warn('Map already initialized, skipping...');
      return;
    }

    try {
      // Initialize Leaflet map
      const map = L.map(container, {
        center: ALMATY_CENTER,
        zoom: 11,
        zoomControl: true,
      });

      // Add tile layer with multiple providers for reliability
      // Primary: CartoDB Voyager (free, reliable, no API key)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapRef.current = map;

      // Load events after map is ready
      setTimeout(() => {
        loadEvents();
      }, 100);
    } catch (err: unknown) {
      console.error('Failed to init Leaflet map:', err);
      setError('Map failed to initialize');
      setLoading(false);
    }

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, severityFilter]);

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
        <div className="absolute top-4 left-4 z-[1000] bg-[#131825] border border-[#374151] rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#00D9FF]" />
            <span className="text-sm text-[#E8EDF4]">{t.map?.loading || 'Loading...'}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-[#131825] border border-[#374151] rounded-lg shadow-md p-4 flex items-start gap-3">
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
        <div className="absolute top-4 right-4 z-[1000] bg-[#131825] border border-[#374151] rounded-lg shadow-md p-4 w-64">
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
        <div className="absolute bottom-4 left-4 z-[1000] bg-[#131825] border border-[#374151] rounded-lg shadow-md px-3 py-2">
          <p className="text-sm text-[#E8EDF4]">
            {events.length} {events.length === 1 ? 'event' : 'events'} displayed
          </p>
        </div>
      )}

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

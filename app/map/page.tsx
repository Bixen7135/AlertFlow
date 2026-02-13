'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useTranslations } from '@/lib/i18n/context';
import { Loader2 } from 'lucide-react';

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map/map-view').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#131825]">
      <Loader2 className="w-8 h-8 animate-spin text-[#00D9FF]" />
    </div>
  ),
});

/**
 * Map page component
 */
export default function MapPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-[1280px] py-6 h-full">
          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[--color-text-primary]">
              {t.map.title}
            </h1>
          </div>

          {/* Map container */}
          <div className="h-[600px] rounded-lg overflow-hidden border border-[--color-border]">
            <MapView />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

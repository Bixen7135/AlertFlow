'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MapView } from '@/components/map/map-view';
import { useTranslations } from '@/lib/i18n/context';

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

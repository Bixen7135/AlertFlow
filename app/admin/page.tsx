'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n/context';
import { Settings, Info } from 'lucide-react';

/**
 * Admin page for source management
 * Note: This is a placeholder UI. Backend source management endpoints need to be implemented.
 */
export default function AdminPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-[1280px] py-6">
          {/* Page title */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-[--color-primary]" />
              <h1 className="text-3xl font-bold text-[--color-text-primary]">
                {t.admin.title}
              </h1>
            </div>
            <p className="text-[--color-text-secondary] mt-2">
              Manage event sources and their configuration
            </p>
          </div>

          {/* Placeholder for sources list */}
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.sources}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <Info className="w-12 h-12 text-[--color-info]" />
                <div className="max-w-md">
                  <h2 className="text-xl font-semibold mb-2">Feature Coming Soon</h2>
                  <p className="text-[--color-text-secondary]">
                    The backend API for source management is not yet implemented.
                    This admin interface will allow you to:
                  </p>
                  <ul className="text-[--color-text-secondary] text-left mt-4 space-y-2">
                    <li>• View all configured event sources</li>
                    <li>• Enable/disable sources</li>
                    <li>• View source status and fetch history</li>
                    <li>• Manually trigger source polling</li>
                  </ul>
                  <p className="text-sm text-[--color-text-secondary] mt-4">
                    For now, use the CLI scripts for source management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

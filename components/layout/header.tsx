'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage, useTranslations } from '@/lib/i18n/context';
import { LANGUAGES } from '@/lib/i18n/types';
import { AlertTriangle, Map, Settings } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Navigation link component - Control Room style
 */
function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-2 px-5 py-2.5 rounded transition-all duration-200',
        'font-medium tracking-wide text-sm uppercase',
        'before:absolute before:inset-0 before:rounded before:border before:transition-all',
        active
          ? 'text-[--color-primary] before:border-[--color-primary] before:shadow-[0_0_10px_var(--color-primary-glow)] bg-[--color-primary]/10'
          : 'text-[--color-text-secondary] before:border-transparent hover:text-[--color-primary] hover:before:border-[--color-border-bright]'
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Header component with navigation and language switcher
 */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations();

  // Determine active page
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/feed') return true;
    return pathname?.startsWith(path);
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'en' | 'ru' | 'kk');
    // Refresh to apply new language
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[--color-border]"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 217, 255, 0.1)',
      }}
    >
      {/* Top accent line with glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
          boxShadow: '0 0 10px var(--color-primary-glow)',
        }}
      />

      <div className="container mx-auto px-4 max-w-[1280px]">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Control Room Style */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[--color-primary] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity" />
              <AlertTriangle className="w-8 h-8 text-[--color-primary] relative" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-[--color-text-primary] tracking-wider">
                ALERTFLOW
              </span>
              <span className="text-[10px] text-[--color-text-muted] uppercase tracking-[0.2em] font-light">
                Operations Center
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="/feed" active={isActive('/feed')}>
              <AlertTriangle className="w-4 h-4" />
              <span>{t.nav.feed}</span>
            </NavLink>
            <NavLink href="/map" active={isActive('/map')}>
              <Map className="w-4 h-4" />
              <span>{t.nav.map}</span>
            </NavLink>
            <NavLink href="/admin" active={isActive('/admin')}>
              <Settings className="w-4 h-4" />
              <span>{t.nav.admin}</span>
            </NavLink>
          </nav>

          {/* Language Switcher - Tech Style */}
          <div className="flex items-center gap-4">
            <Select
              value={language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger
                className={clsx(
                  'w-[140px] bg-[--color-bg-elevated] text-[--color-text-primary]',
                  'border-[--color-border-bright] hover:border-[--color-primary]',
                  'transition-all duration-200',
                  'hover:shadow-[0_0_10px_var(--color-primary-glow)]'
                )}
                aria-label={t.common.language}
              >
                <SelectValue>
                  {LANGUAGES.find((l) => l.code === language)?.flag}{' '}
                  {LANGUAGES.find((l) => l.code === language)?.nativeName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[--color-bg-elevated] border-[--color-border-bright]">
                {LANGUAGES.map((lang) => (
                  <SelectItem
                    key={lang.code}
                    value={lang.code}
                    className="text-[--color-text-primary] hover:bg-[--color-bg-surface] focus:bg-[--color-bg-surface]"
                  >
                    {lang.flag} {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}

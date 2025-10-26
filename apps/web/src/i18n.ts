/**
 * i18n Configuration
 * Supports 5 languages: English, Chinese, Hindi, Spanish, Arabic
 */

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['en', 'zh', 'hi', 'es', 'ar'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// Locale names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  hi: 'हिन्दी',
  es: 'Español',
  ar: 'العربية',
};

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale: locale!,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

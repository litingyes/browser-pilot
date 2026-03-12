import { createStore } from '@tanstack/react-store'

export const SUPPORTED_LOCALES = ['en-US', 'zh-CN'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_STORAGE_KEY = 'local:locale'

export function normalizeLocale(input?: string | null): SupportedLocale {
  const locale = (input ?? '').toLowerCase()
  if (locale.startsWith('zh')) {
    return 'zh-CN'
  }

  return 'en-US'
}

export function resolveInitialLocale(): SupportedLocale {
  if (typeof browser !== 'undefined') {
    return normalizeLocale(browser.i18n.getUILanguage())
  }
  if (typeof navigator !== 'undefined') {
    return normalizeLocale(navigator.language)
  }
  return 'en-US'
}

export const localeStore = createStore<SupportedLocale>(resolveInitialLocale())

import type { SupportedLocale } from '@/stores/locale'
import { createIntl, createIntlCache } from 'react-intl'
import enUS from '@/locales/en-US.json'
import zhCN from '@/locales/zh-CN.json'
import { resolveInitialLocale } from '@/stores/locale'

type MessageValues = Record<string, string | number | boolean | Date | null | undefined>

function flattenMessages(
  source: Record<string, unknown>,
  parentKey = '',
  target: Record<string, string> = {},
) {
  Object.entries(source).forEach(([key, value]) => {
    const nextKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof value === 'string') {
      target[nextKey] = value
      return
    }
    if (value && typeof value === 'object') {
      flattenMessages(value as Record<string, unknown>, nextKey, target)
    }
  })

  return target
}

const MESSAGES: Record<SupportedLocale, Record<string, string>> = {
  'en-US': flattenMessages(enUS as Record<string, unknown>),
  'zh-CN': flattenMessages(zhCN as Record<string, unknown>),
}

const cache = createIntlCache()

let currentLocale: SupportedLocale = resolveInitialLocale()
let currentIntl = createIntl({
  locale: currentLocale,
  messages: MESSAGES[currentLocale],
}, cache)

export function getMessages(locale: SupportedLocale) {
  return MESSAGES[locale]
}

export function setI18nLocale(locale: SupportedLocale) {
  if (locale === currentLocale) {
    return
  }

  currentLocale = locale
  currentIntl = createIntl({
    locale,
    messages: MESSAGES[locale],
  }, cache)
}

export function getI18nLocale() {
  return currentLocale
}

export const i18n = {
  t(id: string, values?: MessageValues) {
    return currentIntl.formatMessage({ id, defaultMessage: id }, values)
  },
}

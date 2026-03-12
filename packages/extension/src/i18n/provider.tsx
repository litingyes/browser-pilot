import type { ReactNode } from 'react'
import { useStore } from '@tanstack/react-store'
import { IntlProvider } from 'react-intl'
import { localeStore } from '@/stores/locale'
import { getI18nLocale, getMessages, setI18nLocale } from './index'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const locale = useStore(localeStore, state => state)

  if (getI18nLocale() !== locale) {
    setI18nLocale(locale)
  }

  return (
    <IntlProvider locale={locale} messages={getMessages(locale)}>
      {children}
    </IntlProvider>
  )
}

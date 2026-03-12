import zhCN from './zh-CN'
import enUS from './en-US'

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const

export type Locale = keyof typeof locales
export type TranslationKey = keyof typeof zhCN

let currentLocale: Locale = 'zh-CN'

export function setLocale(locale: Locale) {
  currentLocale = locale
}

export function getLocale(): Locale {
  return currentLocale
}

export function t(key: TranslationKey): string {
  return locales[currentLocale][key] ?? key
}

export function useT(locale?: Locale): (key: TranslationKey) => string {
  const loc = locale ?? currentLocale
  return (key: TranslationKey) => locales[loc][key] ?? key
}

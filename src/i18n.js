import i18next from 'i18next'
import en from './translations/en'
import ms from './translations/ms'

const supportedLanguages = ['en', 'ms']

export async function initialiseI18n(language) {
  const selectedLanguage = supportedLanguages.includes(language) ? language : 'en'

  await i18next.init({
    lng: selectedLanguage,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ms: { translation: ms }
    },
    interpolation: {
      escapeValue: false
    }
  })

  return i18next
}

export function translateDocument() {
  document.documentElement.lang = i18next.language

  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.textContent = i18next.t(element.dataset.i18n)
  }

  for (const element of document.querySelectorAll('[data-i18n-aria-label]')) {
    element.setAttribute('aria-label', i18next.t(element.dataset.i18nAriaLabel))
  }
}

export { i18next, supportedLanguages }

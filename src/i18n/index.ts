import { create } from 'zustand'
import { UI, type Dict } from './ui'

export type Lang = 'en' | 'ko'
export const LANGS: Lang[] = ['en', 'ko']

/** A localized string. Game state stores these (not resolved strings) so switching language mid-stage works. */
export type L = Record<Lang, string>
/** Plain strings are language-neutral (file paths, commands, code). */
export type Text = string | L

export const l = (en: string, ko: string): L => ({ en, ko })

/** Build an L from the UI dictionary: `ui((d) => d.lockedToast('Mail'))`. */
export const ui = (fn: (d: Dict, lang: Lang) => string): L => ({ en: fn(UI.en, 'en'), ko: fn(UI.ko, 'ko') })

/** Combine localized parts into one L: `join((p) => `${p(a)} → ${p(b)}`)`. */
export const join = (fn: (pick: (t: Text) => string, lang: Lang) => string): L => ({
  en: fn((t) => resolve(t, 'en'), 'en'),
  ko: fn((t) => resolve(t, 'ko'), 'ko'),
})

export function resolve(t: Text, lang: Lang): string {
  return typeof t === 'string' ? t : t[lang]
}

const STORAGE_KEY = 'herdr-tycoon:lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ko') return saved
  } catch {
    /* storage unavailable */
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ko')) return 'ko'
  return 'en'
}

function applyHtmlLang(lang: Lang) {
  if (typeof document !== 'undefined') document.documentElement.lang = lang
}

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLang = create<LangState>((set) => ({
  lang: initialLang(),
  setLang: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* storage unavailable */
    }
    applyHtmlLang(lang)
    set({ lang })
  },
}))
applyHtmlLang(useLang.getState().lang)

/** Hook: UI dictionary + resolver for the current language. Re-renders on language change. */
export function useT() {
  const lang = useLang((s) => s.lang)
  return { d: UI[lang], tx: (t: Text) => resolve(t, lang), lang }
}

import en from './en';
import ko from './ko';

const isKo = (locale: string) => locale.toLowerCase().startsWith('ko');

type Locale = 'en' | 'ko';
type Dictionary = Record<string, string>;

const dict: Record<Locale, Dictionary> = { en, ko };

export function resolveLocale(raw: string): Locale {
  return isKo(raw || '') ? 'ko' : 'en';
}

export function t(locale: Locale, key: keyof Dictionary) {
  return dict[locale][key] ?? dict.en[key] ?? String(key);
}

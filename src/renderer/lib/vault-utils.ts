import { normalizeQuery } from './search';
import { getChoseong, romanize } from 'es-hangul';
import { transliterate } from 'transliteration';
import { t } from '../locales';
import { EntryMeta } from '../../shared/types';

export type Locale = 'en' | 'ko';

export type ThemeMode = 'system' | 'light' | 'dark';

export type PasswordOptions = {
  length: number;
  includeUppercase: boolean;
  includeSymbols: boolean;
};

export const PAGE_SIZE = 12;

export const LOCALE_STORAGE_KEY = 'vault-locale';
export const THEME_STORAGE_KEY = 'vault-theme';
export const PASSWORD_OPTIONS_STORAGE_KEY = 'vault-password-options';

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 18,
  includeUppercase: true,
  includeSymbols: true,
};

export function createLabels(locale: Locale) {
  return {
    appTitle: t(locale, 'appTitle'),
    setupTitle: t(locale, 'setupTitle'),
    setupSubtitle: t(locale, 'setupSubtitle'),
    unlockTitle: t(locale, 'unlockTitle'),
    unlockSubtitle: t(locale, 'unlockSubtitle'),
    appTagline: t(locale, 'appTagline'),
    searchPlaceholder: t(locale, 'searchPlaceholder'),
    noEntries: t(locale, 'noEntries'),
    noMatch: t(locale, 'noMatch'),
    titleLabel: t(locale, 'titleLabel'),
    noteLabel: t(locale, 'noteLabel'),
    titlePlaceholder: t(locale, 'titlePlaceholder'),
    notePlaceholder: t(locale, 'notePlaceholder'),
    password: t(locale, 'password'),
    add: t(locale, 'add'),
    create: t(locale, 'create'),
    edit: t(locale, 'edit'),
    save: t(locale, 'save'),
    cancel: t(locale, 'cancel'),
    delete: t(locale, 'delete'),
    deleteConfirm: t(locale, 'deleteConfirm'),
    reveal: t(locale, 'reveal'),
    hide: t(locale, 'hide'),
    copy: t(locale, 'copy'),
    deleteSuccess: t(locale, 'deleteSuccess'),
    optional: t(locale, 'optional'),
    lock: t(locale, 'lock'),
    unlock: t(locale, 'unlock'),
    reset: t(locale, 'reset'),
    resetConfirm: t(locale, 'resetConfirm'),
    loading: t(locale, 'loading'),
    requiredTitle: t(locale, 'requiredTitle'),
    requiredPassword: t(locale, 'requiredPassword'),
    mismatch: t(locale, 'mismatch'),
    weakPassword: t(locale, 'weakPassword'),
    previousPage: t(locale, 'previousPage'),
    nextPage: t(locale, 'nextPage'),
    showing: t(locale, 'showing'),
    totalItems: t(locale, 'totalItems'),
    themeSystem: t(locale, 'themeSystem'),
    themeLight: t(locale, 'themeLight'),
    themeDark: t(locale, 'themeDark'),
    themeLabel: t(locale, 'themeLabel'),
    errorSetup: t(locale, 'errorSetup'),
    errorAction: t(locale, 'errorAction'),
    copySuccess: t(locale, 'copySuccess'),
    generatePassword: t(locale, 'generatePassword'),
    capsLockOn: t(locale, 'capsLockOn'),
    settings: t(locale, 'settings'),
    settingsTitle: t(locale, 'settingsTitle'),
    exportVault: t(locale, 'exportVault'),
    importVault: t(locale, 'importVault'),
    importSourcePassword: t(locale, 'importSourcePassword'),
    exportVaultDescription: t(locale, 'exportVaultDescription'),
    importVaultDescription: t(locale, 'importVaultDescription'),
    exportSuccess: t(locale, 'exportSuccess'),
    exportFailed: t(locale, 'exportFailed'),
    importSuccess: t(locale, 'importSuccess'),
    importFailed: t(locale, 'importFailed'),
    passwordGenerationSection: t(locale, 'passwordGenerationSection'),
    vaultResetSection: t(locale, 'vaultResetSection'),
    passwordLength: t(locale, 'passwordLength'),
    uppercase: t(locale, 'uppercase'),
    symbols: t(locale, 'symbols'),
    close: t(locale, 'close'),
    saveSettings: t(locale, 'saveSettings'),
    resetVault: t(locale, 'resetVault'),
    wrongPassword: t(locale, 'wrongPassword'),
  };
}

export function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === 'system' || raw === 'light' || raw === 'dark' ? raw : 'system';
  } catch {
    return 'system';
  }
}

export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return raw === 'en' || raw === 'ko' ? raw : null;
  } catch {
    return null;
  }
}

export async function resolveLocalePreference(): Promise<Locale> {
  const stored = readStoredLocale();
  if (stored) return stored;
  const localeRaw = await window.electronAPI.getLocale();
  return /ko/i.test(localeRaw || '') ? 'ko' : 'en';
}

export function isDarkMode(mode: ThemeMode, prefersDark: boolean) {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return prefersDark;
}

export function normalizePasswordForStorage(raw: string) {
  if (!raw) return raw;
  const hasHangul = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(raw);
  return transliterate(hasHangul ? romanize(raw) : raw);
}

export function readStoredPasswordOptions(): PasswordOptions {
  if (typeof window === 'undefined') return DEFAULT_PASSWORD_OPTIONS;
  try {
    const raw = window.localStorage.getItem(PASSWORD_OPTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_PASSWORD_OPTIONS;
    const parsed = JSON.parse(raw) as PasswordOptions;
    const length = Number(parsed.length);
    const sanitizedLength = Number.isFinite(length)
      ? Math.max(10, Math.min(40, Math.round(length)))
      : DEFAULT_PASSWORD_OPTIONS.length;
    return {
      length: sanitizedLength,
      includeUppercase: parsed.includeUppercase !== false,
      includeSymbols: parsed.includeSymbols !== false,
    };
  } catch {
    return DEFAULT_PASSWORD_OPTIONS;
  }
}

export function writeStoredPasswordOptions(options: PasswordOptions) {
  try {
    window.localStorage.setItem(PASSWORD_OPTIONS_STORAGE_KEY, JSON.stringify(options));
  } catch {
    // no-op
  }
}

function randomIndex(length: number) {
  const bytes = new Uint32Array(1);
  window.crypto.getRandomValues(bytes);
  return bytes[0] % length;
}

function randomBetween(min: number, max: number) {
  return min + randomIndex(max - min + 1);
}

export function createStrongPassword(options: PasswordOptions = DEFAULT_PASSWORD_OPTIONS) {
  const safeLength = Math.max(10, Math.min(40, Math.round(options.length)));
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()-_=+[]{};:,.?';
  const charset = `${lower}${digits}${
    options.includeUppercase ? upper : ''
  }${options.includeSymbols ? symbols : ''}`;

  const required: string[] = [lower[randomIndex(lower.length)], digits[randomIndex(digits.length)]];

  if (options.includeUppercase) {
    required.push(upper[randomIndex(upper.length)]);
  }

  if (options.includeSymbols) {
    required.push(symbols[randomIndex(symbols.length)]);
  }

  const targetLength = randomBetween(safeLength, safeLength + 2);
  const password: string[] = [...required];
  for (let i = required.length; i < targetLength; i += 1) {
    if (!charset) {
      password.push(lower[randomIndex(lower.length)]);
      continue;
    }
    password.push(charset[randomIndex(charset.length)]);
  }

  for (let i = password.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

export function filterEntriesByQuery(entries: EntryMeta[], query: string, isKorean: boolean) {
  const lowered = normalizeQuery(query);
  if (!lowered) {
    return entries;
  }

  const chosen = isKorean ? getChoseong(lowered) : '';
  return entries.filter((entry) => {
    const haystack = `${entry.title} ${entry.note || ''}`.toLowerCase();
    if (haystack.includes(lowered)) {
      return true;
    }

    if (isKorean && chosen) {
      return getChoseong(haystack).includes(chosen);
    }

    return false;
  });
}

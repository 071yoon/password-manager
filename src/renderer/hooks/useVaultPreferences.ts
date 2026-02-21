import * as React from 'react';

import { type ThemeModeLabel } from '../components/password-manager/ThemeSelect';
import { type VaultLabels } from '../components/password-manager/types';
import {
  LOCALE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  PasswordOptions,
  ThemeMode,
  createLabels,
  isDarkMode,
  readStoredLocale,
  readStoredPasswordOptions,
  readStoredTheme,
  writeStoredPasswordOptions,
} from '../lib/vault-utils';
import { t } from '../locales';

export type VaultPreferences = {
  locale: 'en' | 'ko';
  setLocale: React.Dispatch<React.SetStateAction<'en' | 'ko'>>;
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  passwordOptions: PasswordOptions;
  setPasswordOptions: React.Dispatch<React.SetStateAction<PasswordOptions>>;
  labels: VaultLabels;
  themeLabels: ThemeModeLabel;
};

export function useVaultPreferences(): VaultPreferences {
  const [locale, setLocale] = React.useState<'en' | 'ko'>(readStoredLocale() ?? 'en');
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(readStoredTheme());
  const [passwordOptions, setPasswordOptions] = React.useState<PasswordOptions>(
    readStoredPasswordOptions(),
  );

  React.useEffect(() => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // no-op
    }
  }, [locale]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // no-op
    }
  }, [themeMode]);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', isDarkMode(themeMode, media.matches));
    };
    applyTheme();

    if (themeMode !== 'system' || typeof media.addEventListener !== 'function') {
      return undefined;
    }
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [themeMode]);

  React.useEffect(() => {
    writeStoredPasswordOptions(passwordOptions);
  }, [passwordOptions]);

  const labels = React.useMemo(() => createLabels(locale), [locale]);
  const themeLabels: ThemeModeLabel = React.useMemo(
    () => ({
      system: t(locale, 'themeSystem'),
      light: t(locale, 'themeLight'),
      dark: t(locale, 'themeDark'),
    }),
    [locale],
  );

  return {
    locale,
    setLocale,
    themeMode,
    setThemeMode,
    passwordOptions,
    setPasswordOptions,
    labels,
    themeLabels,
  };
}

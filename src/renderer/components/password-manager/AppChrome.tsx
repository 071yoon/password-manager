import { Cog, Lock as AppIcon, Unlock } from 'lucide-react';

import { Locale, ThemeMode } from '../../lib/vault-utils';
import { isMacPlatform, isWindowsPlatform } from '../../lib/platform';
import { ChromeControlButton } from './ChromeControlButton';
import { LocaleSelect } from './LocaleSelect';
import { ThemeModeLabel, ThemeSelect } from './ThemeSelect';
import { VaultLabels } from './types';

type AppChromeProps = {
  labels: VaultLabels;
  locale: Locale;
  themeMode: ThemeMode;
  themeLabels: ThemeModeLabel;
  hasMaster: boolean;
  unlocked: boolean;
  onLocaleChange: (locale: Locale) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onOpenSettings: () => void;
  onLock: () => void;
};

export function AppChrome({
  labels,
  locale,
  themeMode,
  themeLabels,
  hasMaster,
  unlocked,
  onLocaleChange,
  onThemeModeChange,
  onOpenSettings,
  onLock,
}: AppChromeProps) {
  const hasWindowsControls = isWindowsPlatform();
  const hasMacControls = isMacPlatform();
  const chromeClass = `vault-drag-region fixed inset-x-0 top-0 z-40 border-b border-black/5 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-[0_1px_0_0_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 ${
    hasMaster && !unlocked ? 'pointer-events-none' : ''
  }`;

  return (
    <header className={chromeClass}>
      <div className="flex min-h-8 w-full items-center gap-2 px-2">
        <div
          className={`vault-no-drag flex min-w-0 items-center gap-2 ${
            hasMacControls ? 'ml-16 md:ml-16' : ''
          }`}
        >
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-slate-900 text-slate-100 ring-1 ring-slate-400/80">
            <AppIcon size={13} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">{labels.appTitle}</h1>
            <p className="truncate text-[11px] text-slate-500 dark:text-zinc-300">
              {labels.appTagline}
            </p>
          </div>
        </div>

        <div
          className={`vault-no-drag ml-auto flex items-center gap-1.5 ${
            hasWindowsControls ? 'pr-28' : 'pr-2'
          }`}
        >
          <ThemeSelect mode={themeMode} labels={themeLabels} onModeChange={onThemeModeChange} />
          <LocaleSelect locale={locale} onLocaleChange={onLocaleChange} />

          {hasMaster ? (
            <>
              <ChromeControlButton
                className="vault-no-drag h-8 gap-1.5 px-2 text-xs"
                onClick={onOpenSettings}
                aria-label={labels.settings}
              >
                <Cog size={13} />
                {labels.settings}
              </ChromeControlButton>
              <ChromeControlButton
                className="vault-no-drag h-8 gap-1.5 px-2 text-xs"
                onClick={onLock}
                aria-label={labels.lock}
              >
                <Unlock size={13} />
                {labels.lock}
              </ChromeControlButton>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

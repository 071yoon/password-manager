import * as React from 'react';

import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { panelClass } from '../../lib/vault-ui-classes';
import { PasswordOptions } from '../../lib/vault-utils';

export type SettingsModalLabels = {
  settingsTitle: string;
  passwordGenerationSection: string;
  passwordLength: string;
  uppercase: string;
  symbols: string;
  vaultResetSection: string;
  resetConfirm: string;
  save: string;
  close: string;
  resetVault: string;
};

export function SettingsModal({
  open,
  onClose,
  onSave,
  onReset,
  labels,
  options,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (next: PasswordOptions) => void;
  onReset: () => Promise<void> | void;
  labels: SettingsModalLabels;
  options: PasswordOptions;
}) {
  const [nextOptions, setNextOptions] = React.useState<PasswordOptions>(options);

  React.useEffect(() => {
    setNextOptions(options);
  }, [options, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4 backdrop-blur-md">
      <div
        className={`${panelClass} vault-strong-shadow vault-fade-up w-full max-w-md bg-white/98 p-5 dark:bg-slate-900`}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {labels.settingsTitle}
          </h3>
        </div>

        <div className="space-y-4">
          <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {labels.passwordGenerationSection}
            </h4>
            <div className="space-y-2">
              <Label htmlFor="password-length">{labels.passwordLength}</Label>
              <Input
                id="password-length"
                type="number"
                min={10}
                max={40}
                value={nextOptions.length}
                onChange={(event) => {
                  const nextLength = Number(event.target.value);
                  if (Number.isNaN(nextLength)) return;
                  setNextOptions((current) => ({
                    ...current,
                    length: Math.max(10, Math.min(40, nextLength)),
                  }));
                }}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={nextOptions.includeUppercase}
                onCheckedChange={(checked) => {
                  setNextOptions((current) => ({
                    ...current,
                    includeUppercase: Boolean(checked),
                  }));
                }}
              />
              <span>{labels.uppercase}</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={nextOptions.includeSymbols}
                onCheckedChange={(checked) => {
                  setNextOptions((current) => ({
                    ...current,
                    includeSymbols: Boolean(checked),
                  }));
                }}
              />
              <span>{labels.symbols}</span>
            </label>
          </section>

          <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {labels.vaultResetSection}
              </h4>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {labels.resetConfirm}
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={() => onReset()}>
              {labels.resetVault}
            </Button>
          </section>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              {labels.close}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSave(nextOptions);
                onClose();
              }}
            >
              {labels.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

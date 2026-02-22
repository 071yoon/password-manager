import * as React from 'react';

import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { panelClass } from '../../lib/vault-ui-classes';
import { PasswordOptions } from '../../lib/vault-utils';

export type SettingsModalLabels = {
  settingsTitle: string;
  exportVault: string;
  exportVaultDescription: string;
  importVault: string;
  importVaultDescription: string;
  importSourcePassword: string;
  exportSuccess: string;
  exportFailed: string;
  importSuccess: string;
  importFailed: string;
  wrongPassword: string;
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
  onExport,
  onImport,
  labels,
  options,
  disabled = false,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (next: PasswordOptions) => void;
  onReset: () => Promise<void> | void;
  onExport: () => Promise<{ success: boolean; reason?: string }>;
  onImport: (sourcePassword: string) => Promise<{ success: boolean; reason?: string; count?: number }>;
  labels: SettingsModalLabels;
  options: PasswordOptions;
  disabled?: boolean;
}) {
  const [nextOptions, setNextOptions] = React.useState<PasswordOptions>(options);
  const [sourcePassword, setSourcePassword] = React.useState('');
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    setNextOptions(options);
  }, [options, open]);

  if (!open) return null;

  const handleExport = async () => {
    setIsExporting(true);
    const result = await onExport();
    setIsExporting(false);
    if (result.success) {
      return;
    }
    if (result.reason === 'cancelled') {
      return;
    }
  };

  const handleImport = async () => {
    if (!sourcePassword) {
      return;
    }
    setIsImporting(true);
    const result = await onImport(sourcePassword);
    setSourcePassword('');
    setIsImporting(false);
    if (!result.success) {
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4 backdrop-blur-md">
      <div
        className={`${panelClass} vault-strong-shadow vault-fade-up flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col bg-white/98 p-5 dark:bg-zinc-900`}
      >
        <div className="mb-4 shrink-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            {labels.settingsTitle}
          </h3>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
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

            <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                {labels.importVault}
              </h4>
              <Label htmlFor="import-source-password">{labels.importSourcePassword}</Label>
              <Input
                id="import-source-password"
                type="password"
                value={sourcePassword}
                onChange={(event) => setSourcePassword(event.target.value)}
                placeholder={labels.importSourcePassword}
              />
              <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                {labels.importVaultDescription}
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleImport}
                disabled={isImporting || !sourcePassword || disabled}
              >
                {labels.importVault}
              </Button>
            </section>

            <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  {labels.exportVault}
                </h4>
                <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                  {labels.exportVaultDescription}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleExport}
                disabled={isExporting || disabled}
              >
                {labels.exportVault}
              </Button>
            </section>

            <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  {labels.vaultResetSection}
                </h4>
                <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                  {labels.resetConfirm}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsResetConfirmOpen(true);
                }}
              >
                {labels.resetVault}
              </Button>
            </section>
          </div>
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 pt-3 dark:border-zinc-700">
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

        <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{labels.vaultResetSection}</AlertDialogTitle>
              <AlertDialogDescription>{labels.resetConfirm}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{labels.close}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  void onReset();
                }}
              >
                {labels.resetVault}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

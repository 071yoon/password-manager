import * as React from 'react';

import { useTimedToast } from './useTimedToast';
import { useVaultPreferences } from './useVaultPreferences';
import { type VaultRuntime, useVaultRuntime } from './useVaultRuntime';

type WorkspaceRowLabels = {
  reveal: string;
  hide: string;
  copy: string;
  edit: string;
  delete: string;
};

type SettingsLabels = {
  exportVault: string;
  importVault: string;
  exportVaultDescription: string;
  importVaultDescription: string;
  importSourcePassword: string;
  wrongPassword: string;
  exportSuccess: string;
  exportFailed: string;
  importSuccess: string;
  importFailed: string;
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

type EntryModalLabels = {
  titleLabel: string;
  noteLabel: string;
  titlePlaceholder: string;
  notePlaceholder: string;
  password: string;
  generatePassword: string;
  capsLockOn: string;
  optional: string;
  cancel: string;
  requiredTitle: string;
  requiredPassword: string;
  loading: string;
  save: string;
  hide: string;
  reveal: string;
};

export type VaultController = ReturnType<typeof useVaultPreferences> &
  VaultRuntime & {
    toastMessage: string;
    toastType: 'success' | 'error';
    workspaceRowLabels: WorkspaceRowLabels;
    settingsLabels: SettingsLabels;
    entryModalLabels: EntryModalLabels;
  };

export function useVaultController(): VaultController {
  const preferences = useVaultPreferences();
  const { message: toastMessage, type: toastType, showToast } = useTimedToast({ duration: 1400 });

  const runtime = useVaultRuntime({
    locale: preferences.locale,
    setLocale: preferences.setLocale,
    labels: preferences.labels,
    showToast,
  });

  const workspaceRowLabels = React.useMemo(
    () => ({
      reveal: preferences.labels.reveal,
      hide: preferences.labels.hide,
      copy: preferences.labels.copy,
      edit: preferences.labels.edit,
      delete: preferences.labels.delete,
    }),
    [
      preferences.labels.copy,
      preferences.labels.delete,
      preferences.labels.edit,
      preferences.labels.hide,
      preferences.labels.reveal,
    ],
  );

  const settingsLabels = React.useMemo(
    () => ({
      exportVault: preferences.labels.exportVault,
      importVault: preferences.labels.importVault,
      exportVaultDescription: preferences.labels.exportVaultDescription,
      importVaultDescription: preferences.labels.importVaultDescription,
      importSourcePassword: preferences.labels.importSourcePassword,
      wrongPassword: preferences.labels.wrongPassword,
      exportSuccess: preferences.labels.exportSuccess,
      exportFailed: preferences.labels.exportFailed,
      importSuccess: preferences.labels.importSuccess,
      importFailed: preferences.labels.importFailed,
      settingsTitle: preferences.labels.settingsTitle,
      passwordGenerationSection: preferences.labels.passwordGenerationSection,
      passwordLength: preferences.labels.passwordLength,
      uppercase: preferences.labels.uppercase,
      symbols: preferences.labels.symbols,
      vaultResetSection: preferences.labels.vaultResetSection,
      resetConfirm: preferences.labels.resetConfirm,
      save: preferences.labels.saveSettings,
      close: preferences.labels.close,
      resetVault: preferences.labels.resetVault,
    }),
    [
      preferences.labels.close,
      preferences.labels.exportFailed,
      preferences.labels.exportSuccess,
      preferences.labels.exportVault,
      preferences.labels.exportVaultDescription,
      preferences.labels.passwordGenerationSection,
      preferences.labels.passwordLength,
      preferences.labels.importFailed,
      preferences.labels.importSourcePassword,
      preferences.labels.importVaultDescription,
      preferences.labels.importSuccess,
      preferences.labels.importVault,
      preferences.labels.wrongPassword,
      preferences.labels.resetConfirm,
      preferences.labels.resetVault,
      preferences.labels.saveSettings,
      preferences.labels.settingsTitle,
      preferences.labels.symbols,
      preferences.labels.uppercase,
      preferences.labels.vaultResetSection,
    ],
  );

  const entryModalLabels = React.useMemo(
    () => ({
      titleLabel: preferences.labels.titleLabel,
      noteLabel: preferences.labels.noteLabel,
      titlePlaceholder: preferences.labels.titlePlaceholder,
      notePlaceholder: preferences.labels.notePlaceholder,
      password: preferences.labels.password,
      generatePassword: preferences.labels.generatePassword,
      capsLockOn: preferences.labels.capsLockOn,
      optional: preferences.labels.optional,
      cancel: preferences.labels.cancel,
      requiredTitle: preferences.labels.requiredTitle,
      requiredPassword: preferences.labels.requiredPassword,
      loading: preferences.labels.loading,
      save: preferences.labels.save,
      hide: preferences.labels.hide,
      reveal: preferences.labels.reveal,
    }),
    [
      preferences.labels.cancel,
      preferences.labels.capsLockOn,
      preferences.labels.generatePassword,
      preferences.labels.hide,
      preferences.labels.loading,
      preferences.labels.noteLabel,
      preferences.labels.notePlaceholder,
      preferences.labels.optional,
      preferences.labels.password,
      preferences.labels.requiredPassword,
      preferences.labels.requiredTitle,
      preferences.labels.reveal,
      preferences.labels.save,
      preferences.labels.titleLabel,
      preferences.labels.titlePlaceholder,
    ],
  );

  return {
    ...preferences,
    ...runtime,
    toastMessage,
    toastType,
    workspaceRowLabels,
    settingsLabels,
    entryModalLabels,
  };
}

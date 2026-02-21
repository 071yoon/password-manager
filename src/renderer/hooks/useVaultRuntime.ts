import * as React from 'react';

import { EntryMeta } from '../../shared/types';
import { type VaultLabels } from '../components/password-manager/types';
import { normalizePasswordForStorage, resolveLocalePreference } from '../lib/vault-utils';
import { useVaultPagination } from './useVaultPagination';

type ToastFn = (message: string, type?: 'success' | 'error') => void;

export type VaultState = {
  hasMaster: boolean;
  unlocked: boolean;
};

type SubmitEntryPayload = {
  id?: string;
  title: string;
  note: string;
  password?: string;
};

type UseVaultRuntimeArgs = {
  locale: 'en' | 'ko';
  setLocale: React.Dispatch<React.SetStateAction<'en' | 'ko'>>;
  labels: VaultLabels;
  showToast: ToastFn;
};

export type VaultRuntime = {
  state: VaultState;
  entries: EntryMeta[];
  filteredEntries: EntryMeta[];
  visibleEntries: EntryMeta[];
  visiblePasswords: Record<string, string>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isBusy: boolean;
  isInitializing: boolean;
  editingEntry: EntryMeta | null;
  isFormOpen: boolean;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  page: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onReveal: (id: string) => Promise<void>;
  onCopy: (id: string) => Promise<void>;
  onSubmitMaster: (password: string, confirmPassword?: string) => Promise<void>;
  onSubmitEntry: (payload: SubmitEntryPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReset: () => Promise<void>;
  onUnlockCancel: () => void;
  lockVault: () => Promise<void>;
  openCreate: () => void;
  openEdit: (entry: EntryMeta) => void;
  closeForm: () => void;
};

export function useVaultRuntime({
  locale,
  setLocale,
  labels,
  showToast,
}: UseVaultRuntimeArgs): VaultRuntime {
  const [state, setState] = React.useState<VaultState>({ hasMaster: false, unlocked: false });
  const [entries, setEntries] = React.useState<EntryMeta[]>([]);
  const [visiblePasswords, setVisiblePasswords] = React.useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isBusy, setIsBusy] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<EntryMeta | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);

  const refreshEntries = React.useCallback(async () => {
    const list = await window.electronAPI.listEntries();
    if (list.success && list.entries) {
      setEntries(list.entries);
      return;
    }
    setEntries([]);
  }, []);

  const updateState = React.useCallback(async () => {
    const [resolvedLocale, vaultState] = await Promise.all([
      resolveLocalePreference(),
      window.electronAPI.getVaultState(),
    ]);

    setLocale(resolvedLocale);
    setState({ hasMaster: !!vaultState.hasMaster, unlocked: !!vaultState.unlocked });

    if (vaultState.unlocked) {
      await refreshEntries();
      return;
    }
    setEntries([]);
    setVisiblePasswords({});
  }, [refreshEntries, setLocale]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await updateState();
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [updateState]);

  const {
    filteredEntries,
    visibleEntries,
    page,
    totalPages,
    pageStart,
    pageEnd,
    goToPrevious: onPrevPage,
    goToNext: onNextPage,
  } = useVaultPagination(entries, searchQuery, locale === 'ko');

  const setEntryVisibility = React.useCallback((id: string, value?: string) => {
    if (value === undefined) {
      setVisiblePasswords((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }
    setVisiblePasswords((current) => ({ ...current, [id]: value }));
  }, []);

  const onReveal = React.useCallback(
    async (id: string) => {
      if (Object.prototype.hasOwnProperty.call(visiblePasswords, id)) {
        setEntryVisibility(id);
        return;
      }
      const found = await window.electronAPI.revealPassword(id);
      if (found.success && typeof found.password === 'string') {
        setEntryVisibility(id, found.password);
      }
    },
    [setEntryVisibility, visiblePasswords],
  );

  const onCopy = React.useCallback(
    async (id: string) => {
      const current = visiblePasswords[id];
      if (current !== undefined) {
        await window.electronAPI.copyToClipboard(current);
        showToast(labels.copySuccess, 'success');
        return;
      }

      const found = await window.electronAPI.revealPassword(id);
      if (!found.success || typeof found.password !== 'string') {
        showToast(labels.errorAction, 'error');
        return;
      }
      await window.electronAPI.copyToClipboard(found.password);
      showToast(labels.copySuccess, 'success');
    },
    [labels.copySuccess, labels.errorAction, showToast, visiblePasswords],
  );

  const lockVault = React.useCallback(async () => {
    await window.electronAPI.lock();
    setState((previous) => ({ ...previous, unlocked: false }));
    setVisiblePasswords({});
    setIsFormOpen(false);
    setEditingEntry(null);
  }, []);

  const onSubmitMaster = React.useCallback(
    async (password: string, confirmPassword?: string) => {
      setIsBusy(true);
      if (state.hasMaster) {
        const result = await window.electronAPI.unlock(password);
        if (!result.success) {
          showToast(labels.wrongPassword, 'error');
          setIsBusy(false);
          return;
        }
      } else {
        if (password.length < 8) {
          showToast(labels.weakPassword, 'error');
          setIsBusy(false);
          return;
        }
        if (password !== (confirmPassword ?? '')) {
          showToast(labels.mismatch, 'error');
          setIsBusy(false);
          return;
        }
        const result = await window.electronAPI.setupMaster(password);
        if (!result.success) {
          showToast(labels.errorSetup, 'error');
          setIsBusy(false);
          return;
        }
      }
      await updateState();
      setIsBusy(false);
    },
    [
      labels.errorSetup,
      labels.mismatch,
      labels.weakPassword,
      labels.wrongPassword,
      showToast,
      state.hasMaster,
      updateState,
    ],
  );

  const onSubmitEntry = React.useCallback(
    async (payload: SubmitEntryPayload) => {
      const normalizedPassword = payload.password ? normalizePasswordForStorage(payload.password) : '';
      if (payload.id) {
        const result = await window.electronAPI.updateEntry({
          id: payload.id,
          title: payload.title,
          note: payload.note,
          ...(normalizedPassword ? { password: normalizedPassword } : {}),
        });
        if (!result.success) {
          throw new Error(labels.errorAction);
        }
      } else {
        const result = await window.electronAPI.createEntry({
          title: payload.title,
          note: payload.note,
          password: normalizedPassword,
        });
        if (!result.success) {
          throw new Error(labels.errorAction);
        }
      }
      await refreshEntries();
    },
    [labels.errorAction, refreshEntries],
  );

  const onDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm(labels.deleteConfirm)) return;
      const result = await window.electronAPI.deleteEntry(id);
      if (!result.success) {
        showToast(labels.errorAction, 'error');
        return;
      }
      await refreshEntries();
      setEntryVisibility(id);
    },
    [labels.deleteConfirm, labels.errorAction, refreshEntries, setEntryVisibility, showToast],
  );

  const onReset = React.useCallback(async () => {
    if (!window.confirm(labels.resetConfirm)) return;
    await window.electronAPI.resetVault();
    setEntries([]);
    setVisiblePasswords({});
    setSearchQuery('');
    await updateState();
    showToast(labels.reset, 'success');
  }, [labels.reset, labels.resetConfirm, showToast, updateState]);

  const openCreate = React.useCallback(() => {
    setEditingEntry(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = React.useCallback((entry: EntryMeta) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  }, []);

  const closeForm = React.useCallback(() => {
    setIsFormOpen(false);
    setEditingEntry(null);
  }, []);

  const onUnlockCancel = React.useCallback(() => {
    setState((previous) => ({ ...previous, hasMaster: false }));
  }, []);

  return {
    state,
    entries,
    filteredEntries,
    visibleEntries,
    visiblePasswords,
    searchQuery,
    setSearchQuery,
    isBusy,
    isInitializing,
    editingEntry,
    isFormOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    page,
    totalPages,
    pageStart,
    pageEnd,
    onPrevPage,
    onNextPage,
    onReveal,
    onCopy,
    onSubmitMaster,
    onSubmitEntry,
    onDelete,
    onReset,
    onUnlockCancel,
    lockVault,
    openCreate,
    openEdit,
    closeForm,
  };
}

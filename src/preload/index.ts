import { contextBridge, ipcRenderer } from 'electron';
import { EntryMeta } from '../shared/types';

type VaultState = {
  hasMaster: boolean;
  unlocked: boolean;
  entries: number;
};

type CreateResult = { success: boolean; reason?: string; entry?: EntryMeta };
type UpdateResult = { success: boolean; reason?: string; entry?: EntryMeta };
type DeleteResult = { success: boolean; reason?: string };
type ListResult = { success: boolean; entries?: EntryMeta[] };
type RevealResult = { success: boolean; reason?: string; password?: string };
type CopyResult = { success: boolean; reason?: string };
type ExportResult = { success: boolean; reason?: string; count?: number; path?: string };
type ImportResult = { success: boolean; reason?: string; count?: number };

const electronAPI = {
  getLocale: () => ipcRenderer.invoke('app:get-locale') as Promise<string>,
  getVaultState: () => ipcRenderer.invoke('vault:state') as Promise<VaultState>,
  setupMaster: (password: string) =>
    ipcRenderer.invoke('vault:setup-master', password) as Promise<CreateResult>,
  unlock: (password: string) =>
    ipcRenderer.invoke('vault:unlock', password) as Promise<{ success: boolean; reason?: string }>,
  lock: () => ipcRenderer.invoke('vault:lock') as Promise<{ success: boolean }>,
  listEntries: () => ipcRenderer.invoke('vault:list') as Promise<ListResult>,
  createEntry: (payload: { title: string; note: string; password: string }) =>
    ipcRenderer.invoke('vault:add', payload) as Promise<CreateResult>,
  updateEntry: (payload: { id: string; title: string; note: string; password?: string }) =>
    ipcRenderer.invoke('vault:update', payload) as Promise<UpdateResult>,
  deleteEntry: (id: string) => ipcRenderer.invoke('vault:delete', id) as Promise<DeleteResult>,
  revealPassword: (id: string) => ipcRenderer.invoke('vault:reveal', id) as Promise<RevealResult>,
  copyToClipboard: (value: string) =>
    ipcRenderer.invoke('vault:copy', value) as Promise<CopyResult>,
  resetVault: () => ipcRenderer.invoke('vault:reset') as Promise<{ success: boolean }>,
  exportVault: () => ipcRenderer.invoke('vault:export') as Promise<ExportResult>,
  importVault: (sourcePassword: string) =>
    ipcRenderer.invoke('vault:import', sourcePassword) as Promise<ImportResult>,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;

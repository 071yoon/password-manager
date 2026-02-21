import { app, BrowserWindow, clipboard, ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import {
  CreateEntryInput,
  EntryMeta,
  MasterRecord,
  ScryptParams,
  UpdateEntryInput,
  VaultEntryRecord,
  VaultFile,
} from '../shared/types';
import {
  DEFAULT_SCRYPT_PARAMS,
  decryptPassword,
  deriveMasterKey,
  encryptPassword,
  randomId,
  createSalt,
  verifyMasterHash,
} from './crypto';
import { loadVault, saveVault } from './storage';

const FALLBACK_LOCALE = 'en';
const APP_TITLE = 'Local Password Vault';
const IS_MAC = process.platform === 'darwin';
app.setName(APP_TITLE);
process.title = APP_TITLE;
const VAULT_PATH = path.join(app.getPath('userData'), 'vault.json');

let unlockedKey: Buffer | null = null;
const DEFAULT_WINDOW_WIDTH = 1400;
const DEFAULT_WINDOW_HEIGHT = 940;
const MIN_WINDOW_WIDTH = 1280;
const MIN_WINDOW_HEIGHT = 840;

function nowIso() {
  return new Date().toISOString();
}

function safeMaster(vault: VaultFile | null): MasterRecord | null {
  if (!vault || !vault.master || !vault.master.salt || !vault.master.hash) return null;
  return vault.master;
}

async function readVault(): Promise<VaultFile> {
  const loaded = await loadVault(VAULT_PATH);
  if (!loaded) {
    return {
      version: '1.0.0',
      updatedAt: nowIso(),
      master: null,
      entries: [],
    };
  }
  if (!loaded.version) {
    loaded.version = '1.0.0';
  }
  return loaded;
}

function normalizeEntries(entries: VaultEntryRecord[]): EntryMeta[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    note: entry.note,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }));
}

async function getVaultState() {
  const vault = await readVault();
  return {
    hasMaster: !!safeMaster(vault),
    unlocked: !!unlockedKey,
    entries: vault.entries.length,
  };
}

function requireUnlock() {
  if (!unlockedKey) throw new Error('UNLOCK_REQUIRED');
}

async function setupMaster(password: string): Promise<boolean> {
  const vault = await readVault();
  if (safeMaster(vault)) {
    return false;
  }

  const params: ScryptParams = {
    ...DEFAULT_SCRYPT_PARAMS,
  };
  const salt = createSalt();
  const derived = await deriveMasterKey(password, salt, params);
  const next: VaultFile = {
    version: '1.0.0',
    updatedAt: nowIso(),
    master: {
      algorithm: 'scrypt',
      salt: salt.toString('base64'),
      hash: derived.toString('base64'),
      params,
    },
    entries: [],
  };
  await saveVault(VAULT_PATH, next);
  unlockedKey = derived;
  return true;
}

async function verifyAndUnlock(password: string): Promise<boolean> {
  const vault = await readVault();
  const master = safeMaster(vault);
  if (!master) return false;
  const salt = Buffer.from(master.salt, 'base64');
  const stored = Buffer.from(master.hash, 'base64');
  const derived = await deriveMasterKey(password, salt, master.params);
  const ok = verifyMasterHash(stored, derived);
  if (!ok) return false;
  unlockedKey = derived;
  return true;
}

async function listEntries(): Promise<EntryMeta[]> {
  const vault = await readVault();
  return normalizeEntries(vault.entries);
}

async function addEntry(payload: CreateEntryInput): Promise<EntryMeta> {
  requireUnlock();
  const vault = await readVault();
  const now = nowIso();
  const id = randomId();
  const crypt = encryptPassword(unlockedKey as Buffer, payload.password, id);
  const entry: VaultEntryRecord = {
    id,
    title: payload.title.trim(),
    note: payload.note?.trim() || '',
    createdAt: now,
    updatedAt: now,
    passwordCrypto: {
      version: 'enc-v1',
      algorithm: 'aes-256-gcm',
      iv: crypt.iv,
      ciphertext: crypt.ciphertext,
      tag: crypt.tag,
      aad: crypt.aad,
    },
  };
  vault.entries.unshift(entry);
  vault.updatedAt = now;
  await saveVault(VAULT_PATH, vault);
  return {
    id,
    title: entry.title,
    note: entry.note,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

async function updateEntry(payload: UpdateEntryInput): Promise<EntryMeta | null> {
  requireUnlock();
  const vault = await readVault();
  const targetIndex = vault.entries.findIndex((entry) => entry.id === payload.id);
  if (targetIndex === -1) return null;
  const target = vault.entries[targetIndex];
  target.title = payload.title.trim();
  target.note = payload.note?.trim() || '';
  target.updatedAt = nowIso();
  if (payload.password) {
    const crypt = encryptPassword(unlockedKey as Buffer, payload.password, target.id);
    target.passwordCrypto = {
      version: 'enc-v1',
      algorithm: 'aes-256-gcm',
      iv: crypt.iv,
      ciphertext: crypt.ciphertext,
      tag: crypt.tag,
      aad: crypt.aad,
    };
  }
  vault.entries[targetIndex] = target;
  vault.updatedAt = nowIso();
  await saveVault(VAULT_PATH, vault);
  return {
    id: target.id,
    title: target.title,
    note: target.note,
    createdAt: target.createdAt,
    updatedAt: target.updatedAt,
  };
}

async function removeEntry(id: string): Promise<boolean> {
  requireUnlock();
  const vault = await readVault();
  const before = vault.entries.length;
  vault.entries = vault.entries.filter((entry) => entry.id !== id);
  if (vault.entries.length === before) return false;
  vault.updatedAt = nowIso();
  await saveVault(VAULT_PATH, vault);
  return true;
}

async function revealPassword(id: string): Promise<string> {
  requireUnlock();
  const vault = await readVault();
  const target = vault.entries.find((entry) => entry.id === id);
  if (!target) throw new Error('ENTRY_NOT_FOUND');

  return decryptPassword(unlockedKey as Buffer, {
    iv: target.passwordCrypto.iv,
    ciphertext: target.passwordCrypto.ciphertext,
    tag: target.passwordCrypto.tag,
    aad: target.passwordCrypto.aad,
  });
}

function lockVault() {
  unlockedKey = null;
}

function resolveIconPath() {
  const iconPathCandidates = [
    path.join(app.getAppPath(), 'resources', 'icon.png'),
    path.join(process.resourcesPath, 'resources', 'icon.png'),
    path.join(process.resourcesPath, 'app', 'resources', 'icon.png'),
  ];
  return iconPathCandidates.find((entry) => fs.existsSync(entry));
}

function createWindow() {
  const iconPath = resolveIconPath();

  const window = new BrowserWindow({
    title: APP_TITLE,
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    backgroundColor: '#f1efea',
    ...(iconPath ? { icon: iconPath } : {}),
    titleBarStyle: IS_MAC ? 'hiddenInset' : 'default',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#1f2937',
      height: IS_MAC ? 36 : 34,
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:5173');
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  window.setTitle(APP_TITLE);
}

function registerIpc() {
  ipcMain.handle('app:get-locale', async () => {
    return app.getLocale() || FALLBACK_LOCALE;
  });

  ipcMain.handle('vault:state', async () => {
    return getVaultState();
  });

  ipcMain.handle('vault:setup-master', async (_event, password: string) => {
    if (!password || typeof password !== 'string' || password.length < 8) {
      return { success: false, reason: 'short-password' };
    }
    const success = await setupMaster(password);
    return { success };
  });

  ipcMain.handle('vault:unlock', async (_event, password: string) => {
    if (!password || typeof password !== 'string') {
      return { success: false, reason: 'invalid-password' };
    }
    const success = await verifyAndUnlock(password);
    return { success };
  });

  ipcMain.handle('vault:lock', async () => {
    lockVault();
    return { success: true };
  });

  ipcMain.handle('vault:list', async () => {
    if (!unlockedKey) return { success: false };
    return { success: true, entries: await listEntries() };
  });

  ipcMain.handle('vault:add', async (_event, payload: CreateEntryInput) => {
    if (!unlockedKey) return { success: false };
    if (!payload?.title?.trim() || !payload?.password) {
      return { success: false, reason: 'invalid-input' };
    }
    const entry = await addEntry(payload);
    return { success: true, entry };
  });

  ipcMain.handle('vault:update', async (_event, payload: UpdateEntryInput) => {
    if (!unlockedKey) return { success: false };
    if (!payload?.id || !payload?.title?.trim()) {
      return { success: false, reason: 'invalid-input' };
    }
    const entry = await updateEntry(payload);
    return { success: !!entry, entry };
  });

  ipcMain.handle('vault:delete', async (_event, id: string) => {
    if (!unlockedKey) return { success: false };
    const success = await removeEntry(id);
    return { success };
  });

  ipcMain.handle('vault:reveal', async (_event, id: string) => {
    if (!unlockedKey) return { success: false, reason: 'locked' };
    try {
      const password = await revealPassword(id);
      return { success: true, password };
    } catch {
      return { success: false, reason: 'decryption-failed' };
    }
  });

  ipcMain.handle('vault:copy', async (_event, value: string) => {
    if (typeof value !== 'string') {
      return { success: false, reason: 'invalid-value' };
    }
    clipboard.writeText(value);
    return { success: true };
  });

  ipcMain.handle('vault:reset', async () => {
    lockVault();
    await saveVault(VAULT_PATH, {
      version: '1.0.0',
      updatedAt: nowIso(),
      master: null,
      entries: [],
    }).catch(() => {});
    return { success: true };
  });
}

app.whenReady().then(() => {
  app.setName(APP_TITLE);
  const iconPath = resolveIconPath();
  if (IS_MAC && iconPath) {
    app.dock.setIcon(iconPath);
  }
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

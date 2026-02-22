import { app, BrowserWindow, clipboard, dialog, ipcMain, shell } from 'electron';
import fs from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
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
const VAULT_PATH = path.join(app.getPath('userData'), 'vault.json');

let unlockedKey: Buffer | null = null;
const DEFAULT_WINDOW_WIDTH = 1080;
const DEFAULT_WINDOW_HEIGHT = 780;
const MIN_WINDOW_WIDTH = 800;
const MIN_WINDOW_HEIGHT = 560;

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

function isValidMaster(master: unknown): master is MasterRecord {
  if (!master || typeof master !== 'object') {
    return false;
  }

  const candidate = master as MasterRecord;
  return (
    candidate.algorithm === 'scrypt' &&
    typeof candidate.salt === 'string' &&
    typeof candidate.hash === 'string' &&
    isValidScryptParams(candidate.params)
  );
}

function isValidScryptParams(params: unknown): params is ScryptParams {
  if (!params || typeof params !== 'object') return false;
  const candidate = params as ScryptParams;
  return (
    Number.isInteger(candidate.N) &&
    Number.isInteger(candidate.r) &&
    Number.isInteger(candidate.p) &&
    Number.isInteger(candidate.keyLen) &&
    Number.isInteger(candidate.maxmem) &&
    candidate.N > 0 &&
    candidate.r > 0 &&
    candidate.p > 0 &&
    candidate.keyLen > 0 &&
    candidate.maxmem > 0
  );
}

function isValidPasswordCrypto(value: unknown): value is VaultEntryRecord['passwordCrypto'] {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as VaultEntryRecord['passwordCrypto'];
  return (
    candidate.version === 'enc-v1' &&
    candidate.algorithm === 'aes-256-gcm' &&
    typeof candidate.iv === 'string' &&
    typeof candidate.ciphertext === 'string' &&
    typeof candidate.tag === 'string' &&
    typeof candidate.aad === 'string'
  );
}

function isValidVaultEntry(entry: unknown): entry is VaultEntryRecord {
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  const candidate = entry as VaultEntryRecord;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.note === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    isValidPasswordCrypto(candidate.passwordCrypto)
  );
}

function mapEntriesWithCurrentMaster(
  entries: VaultEntryRecord[],
  sourceKey: Buffer,
  destinationKey: Buffer,
): VaultEntryRecord[] {
  const result: VaultEntryRecord[] = [];
  for (const entry of entries) {
    if (!isValidVaultEntry(entry)) {
      throw new Error('invalid-file');
    }

    const plainPassword = decryptPassword(sourceKey, {
      iv: entry.passwordCrypto.iv,
      ciphertext: entry.passwordCrypto.ciphertext,
      tag: entry.passwordCrypto.tag,
      aad: entry.passwordCrypto.aad,
    });
    const nextId = randomId();
    const crypt = encryptPassword(destinationKey, plainPassword, nextId);

    result.push({
      id: nextId,
      title: entry.title,
      note: entry.note,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      passwordCrypto: {
        version: 'enc-v1',
        algorithm: 'aes-256-gcm',
        iv: crypt.iv,
        ciphertext: crypt.ciphertext,
        tag: crypt.tag,
        aad: nextId,
      },
    });
  }
  return result;
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

function syncAppIdentity() {
  app.setName(APP_TITLE);
  process.title = APP_TITLE;
  app.setAboutPanelOptions({
    applicationName: APP_TITLE,
    applicationVersion: app.getVersion(),
  });
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

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:5173');
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  window.setTitle(app.getName());
}

function isVaultPayloadValid(raw: unknown): raw is VaultFile {
  const candidate = raw as VaultFile;
  return (
    !!raw &&
    typeof raw === 'object' &&
    raw !== null &&
    'version' in raw &&
    'master' in raw &&
    'entries' in raw &&
    candidate.version === '1.0.0' &&
    typeof candidate.updatedAt === 'string' &&
    isValidMaster(candidate.master) &&
    Array.isArray(candidate.entries) &&
    candidate.entries.every(isValidVaultEntry)
  );
}

function getVaultImportError(error: unknown) {
  if (error instanceof Error && error.message === 'ERR_OSSL_EVP_BAD_DECRYPT') {
    return 'decryption-failed';
  }
  return 'invalid-file';
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

  ipcMain.handle('vault:export', async () => {
    if (!unlockedKey) {
      return { success: false, reason: 'locked' };
    }

    const filePath = await dialog
      .showSaveDialog({
        title: 'Export vault',
        defaultPath: path.join(app.getPath('documents'), `vault-backup-${Date.now()}.json`),
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation'],
        buttonLabel: 'Export',
      })
      .then((result) => {
        if (result.canceled || !result.filePath) {
          return null;
        }
        return result.filePath;
      });

    if (!filePath) {
      return { success: false, reason: 'cancelled' };
    }

    const vault = await readVault();
    try {
      await writeFile(filePath, JSON.stringify(vault, null, 2), 'utf8');
    } catch {
      return { success: false, reason: 'invalid-file' };
    }
    return { success: true, count: vault.entries.length, path: filePath };
  });

  ipcMain.handle('vault:import', async (_event, sourcePassword: string) => {
    if (!unlockedKey) {
      return { success: false, reason: 'locked' };
    }
    if (typeof sourcePassword !== 'string' || !sourcePassword) {
      return { success: false, reason: 'invalid-password' };
    }

    const filePath = await dialog
      .showOpenDialog({
        title: 'Import vault',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
      })
      .then((result) => {
        if (result.canceled || !result.filePaths[0]) {
          return null;
        }
        return result.filePaths[0];
      });
    if (!filePath) {
      return { success: false, reason: 'cancelled' };
    }

    let rawContent: string;
    try {
      rawContent = await readFile(filePath, 'utf8');
    } catch {
      return { success: false, reason: 'invalid-file' };
    }

    let parsed: VaultFile;
    try {
      parsed = JSON.parse(rawContent) as VaultFile;
    } catch {
      return { success: false, reason: 'invalid-file' };
    }

    if (!isVaultPayloadValid(parsed)) {
      return { success: false, reason: 'invalid-file' };
    }

    const sourceSalt = Buffer.from(parsed.master.salt, 'base64');
    const sourceHash = Buffer.from(parsed.master.hash, 'base64');
    let sourceKey: Buffer;
    try {
      sourceKey = await deriveMasterKey(sourcePassword, sourceSalt, parsed.master.params);
    } catch {
      return { success: false, reason: 'invalid-file' };
    }
    const matched = verifyMasterHash(sourceHash, sourceKey);
    if (!matched) {
      return { success: false, reason: 'wrong-password' };
    }

  let nextEntries: VaultEntryRecord[];
  try {
      nextEntries = mapEntriesWithCurrentMaster(parsed.entries, sourceKey, unlockedKey as Buffer);
    } catch (error) {
      return { success: false, reason: getVaultImportError(error) };
    }

    const currentVault = await readVault();
    currentVault.entries = [...currentVault.entries, ...nextEntries];
    currentVault.updatedAt = nowIso();
    try {
      await saveVault(VAULT_PATH, currentVault);
    } catch {
      return { success: false, reason: 'invalid-file' };
    }

    return { success: true, count: nextEntries.length };
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
  syncAppIdentity();
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

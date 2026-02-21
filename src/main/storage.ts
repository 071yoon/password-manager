import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { VaultFile } from '../shared/types';

export async function loadVault(filePath: string): Promise<VaultFile | null> {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as VaultFile;
  } catch {
    return null;
  }
}

export async function saveVault(filePath: string, vault: VaultFile): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(vault, null, 2), 'utf8');
}

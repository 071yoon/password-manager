export type ScryptParams = {
  N: number;
  r: number;
  p: number;
  keyLen: number;
  maxmem: number;
};

export type MasterRecord = {
  algorithm: 'scrypt';
  salt: string;
  hash: string;
  params: ScryptParams;
};

export type PasswordCryptoRecord = {
  version: 'enc-v1';
  algorithm: 'aes-256-gcm';
  iv: string;
  ciphertext: string;
  tag: string;
  aad: string;
};

export type VaultEntryRecord = {
  id: string;
  title: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  passwordCrypto: PasswordCryptoRecord;
};

export type VaultFile = {
  version: '1.0.0';
  updatedAt: string;
  master: MasterRecord | null;
  entries: VaultEntryRecord[];
};

export type EntryMeta = Omit<VaultEntryRecord, 'passwordCrypto'>;

export type CreateEntryInput = {
  title: string;
  note: string;
  password: string;
};

export type UpdateEntryInput = {
  id: string;
  title: string;
  note: string;
  password?: string;
};

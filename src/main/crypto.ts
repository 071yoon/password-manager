import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { randomBytes as randomBytesCallback } from 'node:crypto';
import { ScryptParams } from '../shared/types';

const scryptAsync = promisify(require('node:crypto').scrypt);

export const DEFAULT_SCRYPT_PARAMS: ScryptParams = {
  N: 16384,
  r: 8,
  p: 1,
  keyLen: 32,
  maxmem: 64 * 1024 * 1024,
};

export function createSalt() {
  return randomBytes(16);
}

export function randomId() {
  return randomBytesCallback(16).toString('hex');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export async function deriveMasterKey(
  password: string,
  salt: Buffer,
  params: ScryptParams,
): Promise<Buffer> {
  return (await scryptAsync(password, salt, params.keyLen, {
    N: params.N,
    r: params.r,
    p: params.p,
    maxmem: params.maxmem,
  })) as Buffer;
}

export function verifyMasterHash(stored: Buffer, derived: Buffer): boolean {
  if (stored.length !== derived.length) return false;
  return timingSafeEqual(stored, derived);
}

export async function hashMasterForStorage(
  password: string,
  salt: Buffer,
  params: ScryptParams,
): Promise<string> {
  const key = await deriveMasterKey(password, salt, params);
  return key.toString('base64');
}

export function encryptPassword(key: Buffer, value: string, aad: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  if (aad) {
    cipher.setAAD(Buffer.from(aad, 'utf8'));
  }
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    tag: tag.toString('base64'),
    aad,
  };
}

export function decryptPassword(
  key: Buffer,
  crypt: {
    iv: string;
    ciphertext: string;
    tag: string;
    aad: string;
  },
) {
  const iv = Buffer.from(crypt.iv, 'base64');
  const encrypted = Buffer.from(crypt.ciphertext, 'base64');
  const tag = Buffer.from(crypt.tag, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from(crypt.aad, 'utf8'));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

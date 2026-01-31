'use client';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha512 } from '@noble/hashes/sha2.js';
import * as ed from '@noble/ed25519';
ed.hashes.sha512 = sha512;
import { base64UrlEncode, bytesToHex, utf8ToBytes } from './base64url';

export type BrowserDeviceIdentity = {
  deviceId: string; // sha256(publicKeyRaw) hex
  publicKeyRawBase64Url: string;
  privateKeyRawBase64Url: string; // stored locally
};

const STORAGE_KEY = 'mcc.gateway.deviceIdentity.v1';

function randomBytes(len: number) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return b;
}

export function loadOrCreateDeviceIdentity(): BrowserDeviceIdentity {
  if (typeof window === 'undefined') {
    // SSR fallback (won't be used for signing)
    return {
      deviceId: 'server',
      publicKeyRawBase64Url: 'server',
      privateKeyRawBase64Url: 'server',
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.deviceId === 'string' &&
        typeof parsed.publicKeyRawBase64Url === 'string' &&
        typeof parsed.privateKeyRawBase64Url === 'string'
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // Ed25519 private key is 32 bytes.
  const priv = randomBytes(32);
  const pub = ed.getPublicKey(priv);
  const deviceId = bytesToHex(sha256(pub));

  const identity: BrowserDeviceIdentity = {
    deviceId,
    publicKeyRawBase64Url: base64UrlEncode(pub),
    privateKeyRawBase64Url: base64UrlEncode(priv),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}

export function buildDeviceAuthPayload(opts: {
  version?: 'v1' | 'v2';
  deviceId: string;
  clientId: string;
  clientMode: string;
  role: string;
  scopes: string[];
  signedAtMs: number;
  token?: string | null;
  nonce?: string | null;
}) {
  const version = opts.version ?? (opts.nonce ? 'v2' : 'v1');
  const scopesJoined = opts.scopes.join(',');
  const token = opts.token ?? '';

  const parts = [
    version,
    opts.deviceId,
    opts.clientId,
    opts.clientMode,
    opts.role,
    scopesJoined,
    String(opts.signedAtMs),
    token,
  ];

  if (version === 'v2') parts.push(opts.nonce ?? '');
  return parts.join('|');
}

export async function signDevicePayload(
  privateKeyRawBase64Url: string,
  payload: string
): Promise<string> {
  // Decode base64url → bytes
  const b64 = privateKeyRawBase64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const priv = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) priv[i] = bin.charCodeAt(i);

  const sig = await ed.sign(utf8ToBytes(payload), priv);
  return base64UrlEncode(sig);
}

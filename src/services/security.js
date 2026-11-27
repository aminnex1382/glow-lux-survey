// Security and Encryption Utilities (Supports both HTTPS Web Crypto API and HTTP fallback)
import { getApiBaseUrl } from './api';

const AUTH_STORAGE_KEY = 'glow_lux_admin_auth_session';
const PASS_HASH_KEY = 'glow_lux_admin_pass_hash';

// Default initial password: Amin1382
// SHA-256 hash of "Amin1382"
const DEFAULT_PASS_HASH = '5cf7cf09b68be4411fe94db770e19d9984265519b9782958b529ca7adff49957';

/**
 * Pure JavaScript SHA-256 fallback for non-HTTPS contexts (where crypto.subtle is unavailable)
 */
function pureSha256(asciiBytes) {
  const rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';

  const words = [];
  const asciiBitLength = asciiBytes.length * 8;

  const hash = [];
  const k = [];
  let primeCounter = 0;

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  const padded = Array.from(asciiBytes);
  padded.push(0x80);
  while ((padded.length % 64) !== 56) padded.push(0x00);

  for (let i = 0; i < padded.length; i++) {
    words[i >> 2] |= padded[i] << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];

      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash.pop();
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Helper to compute SHA-256 hash of a string safely in both HTTP and HTTPS
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    try {
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {}
  }

  return pureSha256(data);
}

export const securityService = {
  // Check if currently authenticated in this browser session
  isAuthenticated() {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  },

  // Set session authentication state
  setAuthenticated(state) {
    try {
      if (state) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {}
  },

  // Verify entered password against backend server or stored/default hash
  async verifyPassword(inputPassword) {
    if (!inputPassword) return false;
    const trimmed = inputPassword.trim();

    // First try server verification if backend is reachable
    try {
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${getApiBaseUrl()}/settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_password', password: trimmed }),
        signal: controller.signal
      });
      clearTimeout(tId);
      if (res.ok) {
        const json = await res.json();
        if (typeof json.valid === 'boolean') {
          if (json.valid) {
            this.setAuthenticated(true);
            const h = await sha256(trimmed);
            localStorage.setItem(PASS_HASH_KEY, h);
          }
          return json.valid;
        }
      }
    } catch (e) {
      // Fallback gracefully to local SHA-256 check
    }

    const inputHash = await sha256(trimmed);
    const savedHash = localStorage.getItem(PASS_HASH_KEY) || DEFAULT_PASS_HASH;

    const isValid = inputHash === savedHash;
    if (isValid) {
      this.setAuthenticated(true);
    }
    return isValid;
  },

  // Change admin password (syncs to backend MySQL + local storage)
  async changePassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
    }
    const trimmed = newPassword.trim();
    const newHash = await sha256(trimmed);
    localStorage.setItem(PASS_HASH_KEY, newHash);

    try {
      await fetch(`${getApiBaseUrl()}/settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', newPassword: trimmed })
      });
    } catch (e) {}

    return true;
  },

  // Reset to default password
  resetPassword() {
    localStorage.removeItem(PASS_HASH_KEY);
  },

  // AES-GCM Encrypt data with password (when secure context is available)
  async encrypt(dataObj, password) {
    try {
      if (!globalThis.crypto?.subtle) return dataObj;
      const enc = new TextEncoder();
      const encodedData = enc.encode(JSON.stringify(dataObj));
      const pwUtf8 = enc.encode(password);
      const pwHash = await globalThis.crypto.subtle.digest('SHA-256', pwUtf8);

      const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
      const alg = { name: 'AES-GCM', iv: iv };
      const key = await globalThis.crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

      const cipherBuffer = await globalThis.crypto.subtle.encrypt(alg, key, encodedData);

      return {
        encrypted: true,
        iv: Array.from(iv),
        ciphertext: Array.from(new Uint8Array(cipherBuffer))
      };
    } catch (err) {
      console.error('Encryption failed:', err);
      return dataObj;
    }
  },

  // AES-GCM Decrypt data with password
  async decrypt(encryptedPackage, password) {
    try {
      if (!encryptedPackage || !encryptedPackage.encrypted) {
        return encryptedPackage;
      }
      if (!globalThis.crypto?.subtle) {
        throw new Error('مرورگر در حالت HTTP از رمزگشایی AES پشتیبانی نمی‌کند.');
      }
      const enc = new TextEncoder();
      const pwUtf8 = enc.encode(password);
      const pwHash = await globalThis.crypto.subtle.digest('SHA-256', pwUtf8);

      const iv = new Uint8Array(encryptedPackage.iv);
      const ciphertext = new Uint8Array(encryptedPackage.ciphertext);
      const alg = { name: 'AES-GCM', iv: iv };
      const key = await globalThis.crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);

      const decryptedBuffer = await globalThis.crypto.subtle.decrypt(alg, key, ciphertext);
      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decryptedBuffer));
    } catch (err) {
      throw new Error('رمز عبور برای رمزگشایی اطلاعات نادرست است.');
    }
  }
};

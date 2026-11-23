// Security and Encryption Utilities using standard Web Crypto API

const AUTH_STORAGE_KEY = 'glow_lux_admin_auth_session';
const PASS_HASH_KEY = 'glow_lux_admin_pass_hash';

// Default initial password: glowlux2026
// SHA-256 hash of "glowlux2026"
const DEFAULT_PASS_HASH = 'f05cb6723b86e3cea55f087d91610bef830b3553925b37c99c937edfed506d8b';

// Helper to compute SHA-256 hash of a string
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

  // Verify entered password against stored or default hash
  async verifyPassword(inputPassword) {
    if (!inputPassword) return false;
    const inputHash = await sha256(inputPassword.trim());
    const savedHash = localStorage.getItem(PASS_HASH_KEY) || DEFAULT_PASS_HASH;
    
    const isValid = inputHash === savedHash;
    if (isValid) {
      this.setAuthenticated(true);
    }
    return isValid;
  },

  // Change admin password
  async changePassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
    }
    const newHash = await sha256(newPassword.trim());
    localStorage.setItem(PASS_HASH_KEY, newHash);
    return true;
  },

  // Reset to default password
  resetPassword() {
    localStorage.removeItem(PASS_HASH_KEY);
  },

  // AES-GCM Encrypt data with password
  async encrypt(dataObj, password) {
    try {
      const enc = new TextEncoder();
      const encodedData = enc.encode(JSON.stringify(dataObj));
      const pwUtf8 = enc.encode(password);
      const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const alg = { name: 'AES-GCM', iv: iv };
      const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

      const cipherBuffer = await crypto.subtle.encrypt(alg, key, encodedData);
      
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
      const enc = new TextEncoder();
      const pwUtf8 = enc.encode(password);
      const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

      const iv = new Uint8Array(encryptedPackage.iv);
      const ciphertext = new Uint8Array(encryptedPackage.ciphertext);
      const alg = { name: 'AES-GCM', iv: iv };
      const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);

      const decryptedBuffer = await crypto.subtle.decrypt(alg, key, ciphertext);
      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decryptedBuffer));
    } catch (err) {
      throw new Error('رمز عبور برای رمزگشایی اطلاعات نادرست است.');
    }
  }
};

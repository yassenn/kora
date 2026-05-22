import { Platform } from 'react-native';

const STORAGE_PREFIX = '@kora:';

// SECURITY NOTE: VULN-002
// localStorage on web is unencrypted and vulnerable to XSS.
// For sensitive tokens in production web apps, consider HttpOnly cookies
// or more secure browser storage mechanisms if available.
const isWeb = Platform.OS === 'web';

// Lazy load EncryptedStorage only on native platforms
let EncryptedStorage;
if (!isWeb) {
  try {
    EncryptedStorage = require('react-native-encrypted-storage').default;
  } catch (e) {
    console.warn('Failed to load EncryptedStorage', e);
  }
}

export const setItem = async (key, value) => {
  try {
    let text = typeof value === 'string' ? value : JSON.stringify(value);
    const prefixedKey = STORAGE_PREFIX + key;
    
    if (isWeb) {
      // SECURITY FIX (VULN-004): Do not store authentication tokens in localStorage on web.
      // These are now handled via HttpOnly cookies.
      if (key === 'token' || key === 'refresh_token') {
        return;
      }

      // If it's the 'auth' object, sanitize it before storing
      if (key === 'auth' && typeof value === 'object') {
        const sanitized = { ...value };
        delete sanitized.token;
        delete sanitized.refresh_token;
        text = JSON.stringify(sanitized);
      }
      
      localStorage.setItem(prefixedKey, text);
    } else {
      await EncryptedStorage.setItem(prefixedKey, text);
    }
  } catch (err) {
    console.warn('secureStorage.setItem error', err);
    throw err;
  }
};

export const getItem = async (key) => {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    let text;
    
    if (isWeb) {
      text = localStorage.getItem(prefixedKey);
    } else {
      text = await EncryptedStorage.getItem(prefixedKey);
    }
    
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  } catch (err) {
    console.warn('secureStorage.getItem error', err);
    throw err;
  }
};

export const removeItem = async (key) => {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    
    if (isWeb) {
      localStorage.removeItem(prefixedKey);
    } else {
      await EncryptedStorage.removeItem(prefixedKey);
    }
  } catch (err) {
    console.warn('secureStorage.removeItem error', err);
    throw err;
  }
};

export default { setItem, getItem, removeItem };

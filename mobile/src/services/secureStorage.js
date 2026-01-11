import EncryptedStorage from 'react-native-encrypted-storage';

const STORAGE_PREFIX = '@kora:';

export const setItem = async (key, value) => {
  try {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    await EncryptedStorage.setItem(STORAGE_PREFIX + key, text);
  } catch (err) {
    console.warn('secureStorage.setItem error', err);
    throw err;
  }
};

export const getItem = async (key) => {
  try {
    const text = await EncryptedStorage.getItem(STORAGE_PREFIX + key);
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
    await EncryptedStorage.removeItem(STORAGE_PREFIX + key);
  } catch (err) {
    console.warn('secureStorage.removeItem error', err);
    throw err;
  }
};

export default { setItem, getItem, removeItem };

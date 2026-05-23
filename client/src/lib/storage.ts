// ============================================================
// IndexedDB Storage Utility
// Replaces localStorage with IndexedDB for better performance
// and larger storage capacity (typically 50MB+)
// ============================================================

const DB_NAME = 'PortfolioTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'portfolio-data';

interface StorageData {
  key: string;
  value: any;
  timestamp: number;
}

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('Object store created');
      }
    };
  });
}

/**
 * Set item in IndexedDB
 */
export async function setItem(key: string, value: any): Promise<void> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data: StorageData = {
      key,
      value,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error setting item in IndexedDB:', error);
    // Fallback to localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error setting item in localStorage:', e);
    }
  }
}

/**
 * Get item from IndexedDB
 */
export async function getItem(key: string): Promise<any> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  } catch (error) {
    console.error('Error getting item from IndexedDB:', error);
    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error getting item from localStorage:', e);
      return null;
    }
  }
}

/**
 * Remove item from IndexedDB
 */
export async function removeItem(key: string): Promise<void> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error removing item from IndexedDB:', error);
    // Fallback to localStorage
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing item from localStorage:', e);
    }
  }
}

/**
 * Clear all data from IndexedDB
 */
export async function clear(): Promise<void> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    // Fallback to localStorage
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }
}

/**
 * Get all keys from IndexedDB
 */
export async function keys(): Promise<string[]> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve((request.result as string[]) || []);
      };
    });
  } catch (error) {
    console.error('Error getting keys from IndexedDB:', error);
    // Fallback to localStorage
    try {
      return Object.keys(localStorage);
    } catch (e) {
      console.error('Error getting keys from localStorage:', e);
      return [];
    }
  }
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    console.log('Starting migration from localStorage to IndexedDB...');
    
    // Get all keys from localStorage
    const localStorageKeys = Object.keys(localStorage);
    
    if (localStorageKeys.length === 0) {
      console.log('No data in localStorage to migrate');
      return;
    }

    // Migrate each item
    for (const key of localStorageKeys) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const parsedValue = JSON.parse(value);
          await setItem(key, parsedValue);
          console.log(`Migrated: ${key}`);
        }
      } catch (e) {
        console.error(`Error migrating key ${key}:`, e);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

/**
 * Get storage size info (for debugging)
 */
export async function getStorageInfo(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
}> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
      };
    }
  } catch (error) {
    console.error('Error getting storage info:', error);
  }

  return {
    usage: 0,
    quota: 0,
    percentage: 0,
  };
}

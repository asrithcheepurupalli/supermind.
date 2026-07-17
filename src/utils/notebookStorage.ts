import { StateStorage } from 'zustand/middleware';

// The notebook's shelf. localStorage caps out around 5MB, which forced people
// to export and prune. IndexedDB is the browser's real vault: quotas run to
// gigabytes, and navigator.storage.persist() (requested at boot) asks the
// browser never to evict it. Anyone arriving from the localStorage era is
// migrated silently on first read, then the old copy is removed so the 5MB
// shelf is freed.

const DB_NAME = 'supermind';
const STORE = 'notebook';
const FILE_STORE = 'files';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      if (!req.result.objectStoreNames.contains(FILE_STORE)) req.result.createObjectStore(FILE_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('indexeddb blocked'));
  });

const db = () => (dbPromise ??= openDB().catch(err => { dbPromise = null; throw err; }));

const idbGet = async (key: string): Promise<string | null> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null);
    req.onerror = () => reject(req.error);
  });
};

const idbSet = async (key: string, value: string): Promise<void> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const idbDel = async (key: string): Promise<void> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// localStorage can be unavailable (sandboxed iframes, privacy modes) and
// IndexedDB can be too. Memory is the storage of last resort: the app still
// runs, it just forgets on close.
const memoryStore = new Map<string, string>();

const safeLocal = {
  getItem: (k: string): string | null => {
    try { return window.localStorage.getItem(k); } catch { return memoryStore.get(k) ?? null; }
  },
  setItem: (k: string, v: string): void => {
    try { window.localStorage.setItem(k, v); } catch { memoryStore.set(k, v); }
  },
  removeItem: (k: string): void => {
    try { window.localStorage.removeItem(k); } catch { /* ignore */ }
    memoryStore.delete(k);
  },
};

export const notebookStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const existing = await idbGet(name);
      if (existing != null) return existing;
      // One-time move from the old 5MB shelf.
      const legacy = safeLocal.getItem(name);
      if (legacy != null) {
        await idbSet(name, legacy);
        safeLocal.removeItem(name);
        return legacy;
      }
      return null;
    } catch {
      return safeLocal.getItem(name);
    }
  },
  setItem: async (name, value) => {
    try {
      await idbSet(name, value);
    } catch {
      safeLocal.setItem(name, value);
    }
  },
  removeItem: async (name) => {
    try { await idbDel(name); } catch { /* ignore */ }
    safeLocal.removeItem(name);
  },
};

// The file drawer: attachments live as native Blobs in their own object
// store, so filing a note never rewrites megabytes of media. Sealed
// notebooks store {sealed, iv, data, type} records instead of raw blobs.
export type StoredFile = Blob | { sealed: true; iv: number[]; data: ArrayBuffer; type: string };

export const putFile = async (key: string, value: StoredFile): Promise<void> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getFile = async (key: string): Promise<StoredFile | null> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const req = d.transaction(FILE_STORE, 'readonly').objectStore(FILE_STORE).get(key);
    req.onsuccess = () => resolve((req.result as StoredFile) ?? null);
    req.onerror = () => reject(req.error);
  });
};

export const deleteFile = async (key: string): Promise<void> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const clearFiles = async (): Promise<void> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const listFileKeys = async (): Promise<string[]> => {
  const d = await db();
  return new Promise((resolve, reject) => {
    const req = d.transaction(FILE_STORE, 'readonly').objectStore(FILE_STORE).getAllKeys();
    req.onsuccess = () => resolve((req.result as string[]) ?? []);
    req.onerror = () => reject(req.error);
  });
};

// Attachments up to this size tuck into the file drawer whole.
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Text files up to this size are inlined as searchable ink; bigger ones
// stay files.
export const MAX_INLINE_TEXT = 256 * 1024;

// Legacy cap, still the ceiling for images arriving through share links.
export const MAX_EMBED_SIZE = 8 * 1024 * 1024;

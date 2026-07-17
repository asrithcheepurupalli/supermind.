import { putFile, getFile, deleteFile, clearFiles, listFileKeys, StoredFile } from './notebookStorage';
import { encryptionManager } from './encryption';

// The file vault: attachments live as Blobs in their own IndexedDB drawer,
// referenced from entries by fileKey. Filing a note never rewrites media,
// and a sealed notebook seals its files too: AES-GCM over the raw bytes,
// same key as the ink.

const urlCache = new Map<string, string>();

export const storeFile = async (key: string, blob: Blob, sealed: boolean): Promise<void> => {
  if (sealed) {
    const { iv, data } = await encryptionManager.encryptBytes(await blob.arrayBuffer());
    await putFile(key, { sealed: true, iv, data, type: blob.type });
  } else {
    await putFile(key, blob);
  }
};

// Resolve a fileKey to a URL the page can render. Object URLs are cached
// for the session and torn down on lock, so decrypted bytes never outlive
// the key that opened them.
export const loadFileUrl = async (key: string): Promise<string | null> => {
  const cached = urlCache.get(key);
  if (cached) return cached;
  const stored = await getFile(key).catch(() => null);
  if (!stored) return null;
  let blob: Blob;
  if (stored instanceof Blob) {
    blob = stored;
  } else {
    if (!encryptionManager.isUnlocked()) return null;
    const bytes = await encryptionManager.decryptBytes(stored.iv, stored.data);
    blob = new Blob([bytes], { type: stored.type });
  }
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
};

export const loadFileBlob = async (key: string): Promise<Blob | null> => {
  const stored = await getFile(key).catch(() => null);
  if (!stored) return null;
  if (stored instanceof Blob) return stored;
  if (!encryptionManager.isUnlocked()) return null;
  const bytes = await encryptionManager.decryptBytes(stored.iv, stored.data);
  return new Blob([bytes], { type: stored.type });
};

export const removeFile = async (key: string): Promise<void> => {
  const url = urlCache.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(key);
  }
  await deleteFile(key).catch(() => {});
};

export const clearFileVault = async (): Promise<void> => {
  clearUrlCache();
  await clearFiles().catch(() => {});
};

// On lock, decrypted object URLs must die with the key.
export const clearUrlCache = (): void => {
  for (const url of urlCache.values()) URL.revokeObjectURL(url);
  urlCache.clear();
};

// When encryption is switched on mid-life, plain blobs already in the
// drawer get sealed in place.
export const sealExistingFiles = async (): Promise<void> => {
  const keys = await listFileKeys().catch(() => [] as string[]);
  for (const key of keys) {
    const stored: StoredFile | null = await getFile(key).catch(() => null);
    if (stored instanceof Blob) {
      await storeFile(key, stored, true);
    }
  }
  clearUrlCache();
};

// For export: inline a file back into a data URL so the notebook file
// stays a single, portable document.
export const fileToDataUrl = async (key: string): Promise<string | null> => {
  const blob = await loadFileBlob(key);
  if (!blob) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

// For import and migration: a data URL becomes a Blob in the drawer.
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob | null> => {
  try {
    return await (await fetch(dataUrl)).blob();
  } catch {
    return null;
  }
};

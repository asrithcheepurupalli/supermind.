import { SavedContent, EncryptedContent } from '../types';

const ENCRYPTION_VERSION = '1';
const PBKDF2_ITERATIONS = 250000;

// Web Crypto API wrapper for client-side AES-256-GCM encryption.
// The master key is derived from the user's passphrase and only ever lives in memory.
class EncryptionManager {
  private static instance: EncryptionManager;
  private masterKey: CryptoKey | null = null;
  private keyDerivationSalt: Uint8Array | null = null;

  private constructor() {}

  static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  isUnlocked(): boolean {
    return this.masterKey !== null;
  }

  // Derive the master key from the user's password.
  // Uses the provided salt, else a previously imported salt, else generates a fresh one.
  async generateMasterKey(password: string, salt?: Uint8Array): Promise<void> {
    const effectiveSalt = salt ?? this.keyDerivationSalt ?? crypto.getRandomValues(new Uint8Array(16));
    this.keyDerivationSalt = effectiveSalt;

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    this.masterKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: effectiveSalt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt the sensitive fields of a content item with AES-GCM.
  async encryptContent(content: SavedContent): Promise<EncryptedContent> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const sensitiveData = {
      contentText: content.contentText,
      summary: content.summary,
      tags: content.tags,
      fileUrl: content.fileUrl,
      fileKey: content.fileKey,
    };

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      encoder.encode(JSON.stringify(sensitiveData))
    );

    return {
      id: content.id,
      encryptedData: Array.from(new Uint8Array(encryptedBuffer)),
      iv: Array.from(iv),
      contentType: content.contentType,
      sourceApp: content.sourceApp,
      timestamp: content.timestamp,
      userId: content.userId,
      category: content.category,
      isFavorite: content.isFavorite,
      reminderDate: content.reminderDate,
      metadata: content.metadata,
      aiGenerated: content.aiGenerated,
      encryptionVersion: ENCRYPTION_VERSION,
    };
  }

  async decryptContent(encryptedContent: EncryptedContent): Promise<SavedContent> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const iv = new Uint8Array(encryptedContent.iv);
    const encryptedData = new Uint8Array(encryptedContent.encryptedData);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.masterKey,
        encryptedData
      );

      const sensitiveData = JSON.parse(new TextDecoder().decode(decryptedBuffer));

      return {
        id: encryptedContent.id,
        contentText: sensitiveData.contentText,
        summary: sensitiveData.summary,
        tags: sensitiveData.tags,
        fileUrl: sensitiveData.fileUrl,
        fileKey: sensitiveData.fileKey,
        contentType: encryptedContent.contentType as SavedContent['contentType'],
        sourceApp: encryptedContent.sourceApp,
        timestamp: encryptedContent.timestamp,
        userId: encryptedContent.userId,
        category: encryptedContent.category,
        isFavorite: encryptedContent.isFavorite,
        reminderDate: encryptedContent.reminderDate,
        metadata: encryptedContent.metadata,
        aiGenerated: encryptedContent.aiGenerated,
        isEncrypted: true,
        encryptionVersion: encryptedContent.encryptionVersion,
      };
    } catch {
      throw new Error('Failed to decrypt content. Invalid key or corrupted data.');
    }
  }

  // Raw-byte encryption for attachments: same key, same AES-GCM, no JSON
  // detour, so a 50MB file is one pass over its own bytes.
  async encryptBytes(bytes: ArrayBuffer): Promise<{ iv: number[]; data: ArrayBuffer }> {
    if (!this.masterKey) throw new Error('Master key not initialized');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.masterKey, bytes);
    return { iv: Array.from(iv), data };
  }

  async decryptBytes(iv: number[], data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.masterKey) throw new Error('Master key not initialized');
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, this.masterKey, data);
  }

  exportSalt(): string | null {
    if (!this.keyDerivationSalt) return null;
    return btoa(String.fromCharCode(...this.keyDerivationSalt));
  }

  importSalt(saltString: string): void {
    this.keyDerivationSalt = Uint8Array.from(atob(saltString), c => c.charCodeAt(0));
  }

  generateSecurePassword(length: number = 20): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, n => charset[n % charset.length]).join('');
  }

  clearKeys(): void {
    this.masterKey = null;
    // Keep the salt so a subsequent unlock can re-derive the same key.
  }
}

export type { EncryptedContent };
export const encryptionManager = EncryptionManager.getInstance();

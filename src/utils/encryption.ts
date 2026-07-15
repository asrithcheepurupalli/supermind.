import { SavedContent } from '../types';

// Web Crypto API wrapper for secure encryption
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

  // Generate a new master key from user password
  async generateMasterKey(password: string, salt?: Uint8Array): Promise<void> {
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16));
      this.keyDerivationSalt = salt;
    } else {
      this.keyDerivationSalt = salt;
    }

    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive master key using PBKDF2
    this.masterKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt content using AES-GCM
  async encryptContent(content: SavedContent): Promise<EncryptedContent> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Prepare sensitive data for encryption
    const sensitiveData = {
      contentText: content.contentText,
      summary: content.summary,
      tags: content.tags,
      fileUrl: content.fileUrl,
    };

    const dataBuffer = encoder.encode(JSON.stringify(sensitiveData));

    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      this.masterKey,
      dataBuffer
    );

    // Return encrypted content with metadata
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
      // Keep AI-generated data unencrypted for functionality
      aiGenerated: content.aiGenerated,
    };
  }

  // Decrypt content
  async decryptContent(encryptedContent: EncryptedContent): Promise<SavedContent> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const iv = new Uint8Array(encryptedContent.iv);
    const encryptedData = new Uint8Array(encryptedContent.encryptedData);

    try {
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        this.masterKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedBuffer);
      const sensitiveData = JSON.parse(decryptedText);

      // Reconstruct the original content
      return {
        id: encryptedContent.id,
        contentText: sensitiveData.contentText,
        summary: sensitiveData.summary,
        tags: sensitiveData.tags,
        fileUrl: sensitiveData.fileUrl,
        contentType: encryptedContent.contentType,
        sourceApp: encryptedContent.sourceApp,
        timestamp: encryptedContent.timestamp,
        userId: encryptedContent.userId,
        category: encryptedContent.category,
        isFavorite: encryptedContent.isFavorite,
        reminderDate: encryptedContent.reminderDate,
        metadata: encryptedContent.metadata,
        aiGenerated: encryptedContent.aiGenerated,
      };
    } catch (error) {
      throw new Error('Failed to decrypt content. Invalid key or corrupted data.');
    }
  }

  // Export key derivation salt for storage
  exportSalt(): string | null {
    if (!this.keyDerivationSalt) return null;
    return btoa(String.fromCharCode(...this.keyDerivationSalt));
  }

  // Import key derivation salt
  importSalt(saltString: string): void {
    const saltArray = Uint8Array.from(atob(saltString), c => c.charCodeAt(0));
    this.keyDerivationSalt = saltArray;
  }

  // Generate secure random password
  generateSecurePassword(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    // Ensure password contains at least one character from each category
    const categories = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz', 
      '0123456789',
      '!@#$%^&*()_+-=[]{}|;:,.<>?'
    ];
    
    categories.forEach((category, index) => {
      if (!password.split('').some(char => category.includes(char))) {
        const randomIndex = Math.floor(Math.random() * password.length);
        const randomChar = category[Math.floor(Math.random() * category.length)];
        password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
      }
    });
    
    return password;
  }

  // Clear keys from memory
  clearKeys(): void {
    this.masterKey = null;
    this.keyDerivationSalt = null;
  }
}

// Encrypted content interface
export interface EncryptedContent {
  id: string;
  encryptedData: number[];
  iv: number[];
  contentType: string;
  sourceApp: string;
  timestamp: Date;
  userId: string;
  category: string;
  isFavorite: boolean;
  reminderDate?: Date;
  metadata?: any;
  aiGenerated?: any;
}

export const encryptionManager = EncryptionManager.getInstance();
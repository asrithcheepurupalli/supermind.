import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SavedContent, User, Category, FilterState, AppSettings, EncryptedContent } from '../types';
import { baseCategories, createOnboardingContent } from '../utils/onboarding';
import { encryptionManager } from '../utils/encryption';
import { clientSideAI } from '../utils/clientSideAI';
import toast from 'react-hot-toast';

export const defaultFilter: FilterState = {
  category: 'all',
  contentType: '',
  tags: [],
  searchQuery: '',
  favoritesOnly: false,
  dateRange: undefined,
  sortBy: 'recent',
  viewMode: 'grid',
};

const defaultSettings: AppSettings = {
  theme: 'light',
  notifications: {
    email: false,
    push: false,
    reminders: true,
  },
  privacy: {
    analytics: false,
    crashReports: false,
  },
  ai: {
    autoTagging: true,
    smartSummaries: true,
    contentSuggestions: true,
  },
  display: {
    compactMode: false,
    showPreviews: true,
    animationsEnabled: true,
  },
  security: {
    encryptionEnabled: false,
    autoLock: false,
    autoLockTimeout: 15,
  },
};

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  // True while the encryption key is loaded in memory. Never persisted —
  // after a reload the user must unlock with their passphrase again.
  isEncryptionSetup: boolean;
  encryptedContent: EncryptedContent[];

  // Content
  content: SavedContent[];

  // UI State
  filter: FilterState;
  isUploadModalOpen: boolean;
  isSettingsModalOpen: boolean;
  settingsSection: string;
  isEncryptionModalOpen: boolean;
  selectedContent: SavedContent | null;

  // App Settings
  settings: AppSettings;

  // Loading States
  isLoading: boolean;
  isProcessing: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setupEncryption: (password: string) => Promise<void>;
  unlockEncryption: (password: string) => Promise<boolean>;
  lock: () => void;
  addContent: (content: SavedContent) => Promise<void>;
  updateContent: (id: string, updates: Partial<SavedContent>) => void;
  deleteContent: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setFilter: (filter: FilterState) => void;
  setUploadModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean, section?: string) => void;
  setEncryptionModalOpen: (open: boolean) => void;
  setSelectedContent: (content: SavedContent | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (loading: boolean) => void;
  setProcessing: (processing: boolean) => void;
  bulkDeleteContent: (ids: string[]) => void;
  bulkToggleFavorite: (ids: string[]) => void;
  exportContent: (ids?: string[]) => void;
  importContent: (content: unknown) => number;
  deleteAllContent: () => void;
  getSecurityScore: () => number;
  logout: () => void;
}

// Derive per-category counts from actual content.
export const getCategoriesWithCounts = (content: SavedContent[]): Category[] =>
  baseCategories.map(cat => ({
    ...cat,
    count: cat.id === 'all' ? content.length : content.filter(c => c.category === cat.id).length,
  }));

const parseDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value as string);
  return isNaN(date.getTime()) ? undefined : date;
};

// Re-encrypt a single item in the background so encrypted storage stays in
// sync with in-memory edits.
const syncEncryptedItem = async (
  item: SavedContent,
  set: (fn: (state: AppState) => Partial<AppState>) => void
) => {
  if (!encryptionManager.isUnlocked()) return;
  try {
    const encrypted = await encryptionManager.encryptContent(item);
    set(state => ({
      encryptedContent: state.encryptedContent.some(e => e.id === item.id)
        ? state.encryptedContent.map(e => (e.id === item.id ? encrypted : e))
        : [encrypted, ...state.encryptedContent],
    }));
  } catch (error) {
    console.error('Failed to re-encrypt item:', item.id, error);
  }
};

const isValidImportItem = (item: unknown): item is SavedContent => {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.contentText === 'string' &&
    typeof c.contentType === 'string' &&
    ['text', 'link', 'image', 'pdf', 'audio', 'video'].includes(c.contentType)
  );
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isEncryptionSetup: false,
      encryptedContent: [],
      content: [],
      filter: defaultFilter,
      isUploadModalOpen: false,
      isSettingsModalOpen: false,
      settingsSection: 'profile',
      isEncryptionModalOpen: false,
      selectedContent: null,
      settings: defaultSettings,
      isLoading: false,
      isProcessing: false,

      // Actions
      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: !!user,
          // Seed the interactive onboarding guides for a brand-new profile.
          content: user && state.content.length === 0 && state.encryptedContent.length === 0
            ? createOnboardingContent(user.id)
            : state.content,
        })),

      setupEncryption: async (password) => {
        try {
          await encryptionManager.generateMasterKey(password);
          const salt = encryptionManager.exportSalt();

          // Encrypt all existing content before flipping the switch.
          const { content } = get();
          const encryptedItems: EncryptedContent[] = [];
          for (const item of content) {
            encryptedItems.push(await encryptionManager.encryptContent(item));
          }

          set((state) => ({
            isEncryptionSetup: true,
            encryptedContent: encryptedItems,
            user: state.user
              ? { ...state.user, encryptionEnabled: true, encryptionSalt: salt || undefined }
              : null,
            settings: {
              ...state.settings,
              security: { ...state.settings.security, encryptionEnabled: true },
            },
          }));

          toast.success('Encryption enabled. Your data is now encrypted at rest.');
        } catch (error) {
          toast.error('Failed to set up encryption');
          throw error;
        }
      },

      unlockEncryption: async (password) => {
        try {
          const { user, encryptedContent } = get();
          if (user?.encryptionSalt) {
            encryptionManager.importSalt(user.encryptionSalt);
          }

          await encryptionManager.generateMasterKey(password);

          // Decrypting any item verifies the passphrase (AES-GCM authenticates).
          const decryptedItems: SavedContent[] = [];
          for (const encrypted of encryptedContent) {
            decryptedItems.push(await encryptionManager.decryptContent(encrypted));
          }

          set({ content: decryptedItems, isEncryptionSetup: true });
          return true;
        } catch {
          encryptionManager.clearKeys();
          toast.error('Invalid encryption passphrase');
          return false;
        }
      },

      lock: () => {
        const { user } = get();
        if (!user?.encryptionEnabled) return;
        encryptionManager.clearKeys();
        set({ content: [], isEncryptionSetup: false });
      },

      addContent: async (newContent) => {
        const { user, settings } = get();

        if (!user) {
          toast.error('Please set up your profile to add content');
          return;
        }

        const autoTags = settings.ai.autoTagging
          ? clientSideAI.generateTags(newContent.contentText, newContent.contentType)
          : [];

        // A summary only earns its place on longer content — for short notes it
        // would just repeat the text.
        const generatedSummary = settings.ai.smartSummaries && newContent.contentText.length > 200
          ? clientSideAI.generateSummary(newContent.contentText, newContent.contentType)
          : '';

        const enhancedContent: SavedContent = {
          ...newContent,
          userId: user.id,
          tags: [...new Set([...(newContent.tags || []), ...autoTags])].slice(0, 8),
          summary: generatedSummary || newContent.summary || '',
          category: clientSideAI.suggestCategory(newContent.contentText, newContent.tags || []),
          reminderDate: newContent.reminderDate || clientSideAI.suggestReminderDate(newContent.contentText),
          isEncrypted: encryptionManager.isUnlocked(),
          timestamp: new Date(),
        };

        set((state) => ({ content: [enhancedContent, ...state.content] }));
        await syncEncryptedItem(enhancedContent, set);
        toast.success('Content added!');
      },

      updateContent: (id, updates) => {
        set((state) => ({
          content: state.content.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
        const updated = get().content.find(c => c.id === id);
        if (updated) void syncEncryptedItem(updated, set);
      },

      deleteContent: (id) => set((state) => ({
        content: state.content.filter(item => item.id !== id),
        encryptedContent: state.encryptedContent.filter(item => item.id !== id),
      })),

      toggleFavorite: (id) => {
        set((state) => ({
          content: state.content.map(item =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
          ),
          // isFavorite is stored unencrypted on the envelope, so update it directly.
          encryptedContent: state.encryptedContent.map(item =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
          ),
        }));
      },

      setFilter: (filter) => set({ filter }),
      setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
      setSettingsModalOpen: (open, section) =>
        set((state) => ({
          isSettingsModalOpen: open,
          settingsSection: section ?? (open ? state.settingsSection : 'profile'),
        })),
      setEncryptionModalOpen: (open) => set({ isEncryptionModalOpen: open }),
      setSelectedContent: (content) => set({ selectedContent: content }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      setProcessing: (processing) => set({ isProcessing: processing }),

      bulkDeleteContent: (ids) => set((state) => ({
        content: state.content.filter(item => !ids.includes(item.id)),
        encryptedContent: state.encryptedContent.filter(item => !ids.includes(item.id)),
      })),

      bulkToggleFavorite: (ids) => {
        const { content } = get();
        // If any selected item is not yet a favorite, favorite them all; else unfavorite all.
        const makeFavorite = content.some(c => ids.includes(c.id) && !c.isFavorite);
        set((state) => ({
          content: state.content.map(item =>
            ids.includes(item.id) ? { ...item, isFavorite: makeFavorite } : item
          ),
          encryptedContent: state.encryptedContent.map(item =>
            ids.includes(item.id) ? { ...item, isFavorite: makeFavorite } : item
          ),
        }));
      },

      exportContent: (ids) => {
        const { content } = get();
        const items = ids ? content.filter(c => ids.includes(c.id)) : content;
        const payload = {
          app: 'supermind',
          version: 1,
          exportedAt: new Date().toISOString(),
          items,
        };
        const dataBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `supermind-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },

      importContent: (data) => {
        // Accept both the current export format ({items: [...]}) and a raw array.
        const rawItems = Array.isArray(data)
          ? data
          : (data as { items?: unknown[] })?.items;
        if (!Array.isArray(rawItems)) return 0;

        const { content } = get();
        const existingIds = new Set(content.map(c => c.id));
        const newItems = rawItems
          .filter(isValidImportItem)
          .filter(item => !existingIds.has(item.id))
          .map(item => ({
            ...item,
            timestamp: parseDate(item.timestamp) ?? new Date(),
            reminderDate: parseDate(item.reminderDate),
            tags: Array.isArray(item.tags) ? item.tags : [],
            summary: typeof item.summary === 'string' ? item.summary : '',
            category: typeof item.category === 'string' ? item.category : 'articles',
            isFavorite: !!item.isFavorite,
            sourceApp: item.sourceApp || 'Import',
            userId: get().user?.id || item.userId || 'local',
          }));

        set((state) => ({ content: [...newItems, ...state.content] }));
        newItems.forEach(item => void syncEncryptedItem(item, set));
        return newItems.length;
      },

      deleteAllContent: () => set({ content: [], encryptedContent: [], selectedContent: null }),

      getSecurityScore: () => {
        const { settings, content, encryptedContent } = get();
        let score = 30; // Local-first baseline: data never leaves the device.

        if (settings.security.encryptionEnabled) score += 40;
        if (settings.security.autoLock) score += 15;
        if (!settings.privacy.analytics) score += 5;
        if (!settings.privacy.crashReports) score += 5;

        const encryptionRatio = settings.security.encryptionEnabled && content.length > 0
          ? Math.min(1, encryptedContent.length / content.length)
          : settings.security.encryptionEnabled ? 1 : 0;
        score += Math.floor(encryptionRatio * 5);

        return Math.min(score, 100);
      },

      logout: () => {
        encryptionManager.clearKeys();
        set({
          user: null,
          isAuthenticated: false,
          isEncryptionSetup: false,
          content: [],
          encryptedContent: [],
          selectedContent: null,
          isUploadModalOpen: false,
          isSettingsModalOpen: false,
          isEncryptionModalOpen: false,
          filter: defaultFilter,
          settings: defaultSettings,
        });
        // Remove persisted data after the state update flushes.
        setTimeout(() => localStorage.removeItem('supermind-storage'), 50);
        toast.success('Signed out. Local data cleared.');
      },
    }),
    {
      name: 'supermind-storage',
      storage: createJSONStorage(() => localStorage, {
        // Revive Date fields (timestamp/reminderDate) that JSON turned into strings.
        reviver: (key, value) => {
          if ((key === 'timestamp' || key === 'reminderDate') && typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? undefined : date;
          }
          return value;
        },
      }),
      version: 3,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        encryptedContent: state.encryptedContent,
        // Never persist plaintext content when encryption is on — it lives
        // only in memory and is restored by unlocking.
        content: state.user?.encryptionEnabled ? [] : state.content,
        settings: state.settings,
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = (persistedState ?? {}) as Partial<AppState> & { settings?: AppSettings };
        if (version < 3) {
          // Older versions persisted mock demo content and a different
          // settings shape; reset to a clean slate but keep the profile.
          return {
            user: state.user ?? null,
            isAuthenticated: !!state.user,
            encryptedContent: [],
            content: [],
            settings: defaultSettings,
          };
        }
        return state;
      },
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SavedContent, User, Category, FilterState, AppSettings, EncryptedContent } from '../types';
import { mockContent, mockCategories } from '../utils/mockData';
import { encryptionManager } from '../utils/encryption';
import { clientSideAI } from '../utils/clientSideAI';
import { authService } from '../utils/auth';
import toast from 'react-hot-toast';

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  isEncryptionSetup: boolean;
  encryptedContent: EncryptedContent[];
  
  // Content
  content: SavedContent[];
  categories: Category[];
  
  // UI State
  filter: FilterState;
  isUploadModalOpen: boolean;
  isSettingsModalOpen: boolean;
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
  addContent: (content: SavedContent) => Promise<void>;
  updateContent: (id: string, updates: Partial<SavedContent>) => void;
  deleteContent: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setFilter: (filter: FilterState) => void;
  setUploadModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setEncryptionModalOpen: (open: boolean) => void;
  setSelectedContent: (content: SavedContent | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (loading: boolean) => void;
  setProcessing: (processing: boolean) => void;
  bulkDeleteContent: (ids: string[]) => void;
  exportContent: () => void;
  importContent: (content: SavedContent[]) => void;
  getSecurityScore: () => number;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isEncryptionSetup: false,
      encryptedContent: [],
      content: mockContent,
      categories: mockCategories,
      filter: {
        category: 'all',
        contentType: '',
        tags: [],
        searchQuery: '',
        dateRange: undefined,
        sortBy: 'recent',
        viewMode: 'grid',
      },
      isUploadModalOpen: false,
      isSettingsModalOpen: false,
      isEncryptionModalOpen: false,
      selectedContent: null,
      settings: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          reminders: true,
        },
        privacy: {
          analytics: true,
          crashReports: true,
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
          biometricAuth: false,
          autoLock: true,
          autoLockTimeout: 15,
        },
      },
      isLoading: false,
      isProcessing: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setupEncryption: async (password) => {
        try {
          await encryptionManager.generateMasterKey(password);
          const salt = encryptionManager.exportSalt();
          
          set((state) => ({
            isEncryptionSetup: true,
            user: state.user ? {
              ...state.user,
              encryptionEnabled: true,
              encryptionSalt: salt || undefined,
            } : null,
            settings: {
              ...state.settings,
              security: {
                ...state.settings.security,
                encryptionEnabled: true,
              },
            },
          }));
          
          // Encrypt existing content
          const { content } = get();
          const encryptedItems: EncryptedContent[] = [];
          
          for (const item of content) {
            try {
              const encrypted = await encryptionManager.encryptContent(item);
              encryptedItems.push(encrypted);
            } catch (error) {
              console.error('Failed to encrypt item:', item.id, error);
            }
          }
          
          set({ encryptedContent: encryptedItems });
          toast.success('Encryption setup complete! Your data is now secure.');
        } catch (error) {
          toast.error('Failed to setup encryption');
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
          
          // Try to decrypt a test item to verify password
          if (encryptedContent.length > 0) {
            await encryptionManager.decryptContent(encryptedContent[0]);
          }
          
          // Decrypt all content
          const decryptedItems: SavedContent[] = [];
          for (const encrypted of encryptedContent) {
            try {
              const decrypted = await encryptionManager.decryptContent(encrypted);
              decryptedItems.push(decrypted);
            } catch (error) {
              console.error('Failed to decrypt item:', encrypted.id, error);
            }
          }
          
          set({ content: decryptedItems, isEncryptionSetup: true });
          return true;
        } catch (error) {
          toast.error('Invalid encryption password');
          return false;
        }
      },
      
      addContent: async (newContent) => {
        const { isEncryptionSetup, user } = get();
        
        if (!user) {
          toast.error('Please log in to add content');
          return;
        }
        
        // Use client-side AI for processing
        const enhancedContent = {
          ...newContent,
          userId: user.id,
          tags: clientSideAI.generateTags(newContent.contentText, newContent.contentType),
          summary: clientSideAI.generateSummary(newContent.contentText, newContent.contentType),
          category: clientSideAI.suggestCategory(newContent.contentText, newContent.tags),
          reminderDate: newContent.reminderDate || clientSideAI.suggestReminderDate(newContent.contentText),
          isEncrypted: isEncryptionSetup,
          timestamp: new Date(), // Ensure fresh timestamp
        };
        
        set((state) => {
          const updatedCategories = state.categories.map(cat => 
            cat.id === enhancedContent.category 
              ? { ...cat, count: cat.count + 1 }
              : cat.id === 'all'
              ? { ...cat, count: cat.count + 1 }
              : cat
          );
          
          return {
            content: [enhancedContent, ...state.content],
            categories: updatedCategories,
          };
        });
        
        // Encrypt and store if encryption is enabled
        if (isEncryptionSetup) {
          try {
            const encrypted = await encryptionManager.encryptContent(enhancedContent);
            set((state) => ({
              encryptedContent: [encrypted, ...state.encryptedContent],
            }));
          } catch (error) {
            console.error('Failed to encrypt new content:', error);
            toast.error('Failed to encrypt content');
          }
        }
        
        toast.success('Content added successfully!');
      },
      
      updateContent: (id, updates) => set((state) => ({
        content: state.content.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
      
      deleteContent: (id) => set((state) => {
        const contentToDelete = state.content.find(c => c.id === id);
        if (!contentToDelete) return state;
        
        const updatedCategories = state.categories.map(cat => 
          cat.id === contentToDelete.category 
            ? { ...cat, count: Math.max(0, cat.count - 1) }
            : cat.id === 'all'
            ? { ...cat, count: Math.max(0, cat.count - 1) }
            : cat
        );
        
        return {
          content: state.content.filter(item => item.id !== id),
          categories: updatedCategories,
          encryptedContent: state.encryptedContent.filter(item => item.id !== id),
        };
      }),
      
      toggleFavorite: (id) => set((state) => ({
        content: state.content.map(item => 
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ),
      })),
      
      setFilter: (filter) => set({ filter }),
      setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
      setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
      setEncryptionModalOpen: (open) => set({ isEncryptionModalOpen: open }),
      setSelectedContent: (content) => set({ selectedContent: content }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      
      bulkDeleteContent: (ids) => set((state) => {
        const deletedContent = state.content.filter(c => ids.includes(c.id));
        const categoryUpdates: Record<string, number> = {};
        
        deletedContent.forEach(content => {
          categoryUpdates[content.category] = (categoryUpdates[content.category] || 0) + 1;
          categoryUpdates['all'] = (categoryUpdates['all'] || 0) + 1;
        });
        
        const updatedCategories = state.categories.map(cat => ({
          ...cat,
          count: Math.max(0, cat.count - (categoryUpdates[cat.id] || 0)),
        }));
        
        return {
          content: state.content.filter(item => !ids.includes(item.id)),
          categories: updatedCategories,
          encryptedContent: state.encryptedContent.filter(item => !ids.includes(item.id)),
        };
      }),
      
      exportContent: () => {
        const { content } = get();
        const dataStr = JSON.stringify(content, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `supermind-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
      
      importContent: (importedContent) => set((state) => {
        const newContent = importedContent.filter(
          imported => !state.content.some(existing => existing.id === imported.id)
        );
        
        const categoryUpdates: Record<string, number> = {};
        newContent.forEach(content => {
          categoryUpdates[content.category] = (categoryUpdates[content.category] || 0) + 1;
          categoryUpdates['all'] = (categoryUpdates['all'] || 0) + 1;
        });
        
        const updatedCategories = state.categories.map(cat => ({
          ...cat,
          count: cat.count + (categoryUpdates[cat.id] || 0),
        }));
        
        return {
          content: [...newContent, ...state.content],
          categories: updatedCategories,
        };
      }),
      
      getSecurityScore: () => {
        const { settings, content, encryptedContent } = get();
        let score = 0;
        
        if (settings.security.encryptionEnabled) score += 40;
        if (settings.security.biometricAuth) score += 20;
        if (settings.security.autoLock) score += 15;
        if (!settings.privacy.analytics) score += 10;
        if (!settings.privacy.crashReports) score += 5;
        
        const encryptionRatio = content.length > 0 ? encryptedContent.length / content.length : 1;
        score += Math.floor(encryptionRatio * 10);
        
        return Math.min(score, 100);
      },
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        isEncryptionSetup: false,
        content: [],
        encryptedContent: [],
        selectedContent: null,
        isUploadModalOpen: false,
        isSettingsModalOpen: false,
        isEncryptionModalOpen: false,
        filter: {
          category: 'all',
          contentType: '',
          tags: [],
          searchQuery: '',
          dateRange: undefined,
          sortBy: 'recent',
          viewMode: 'grid',
        },
      }, false, 'logout'), // Don't persist logout action
      
      // Enhanced logout with OAuth cleanup
      logoutWithCleanup: () => {
        // Clear authentication state immediately
        authService.signOut();
        
        // Reset all state to initial values
        set({
          user: null,
          isAuthenticated: false,
          isEncryptionSetup: false,
          content: mockContent, // Reset to initial mock content for demo
          encryptedContent: [],
          categories: mockCategories,
          selectedContent: null,
          isUploadModalOpen: false,
          isSettingsModalOpen: false,
          isEncryptionModalOpen: false,
          filter: {
            category: 'all',
            contentType: '',
            tags: [],
            searchQuery: '',
            dateRange: undefined,
            sortBy: 'recent',
            viewMode: 'grid',
          },
          settings: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              reminders: true,
            },
            privacy: {
              analytics: true,
              crashReports: true,
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
              biometricAuth: false,
              autoLock: true,
              autoLockTimeout: 15,
            },
          },
        }, false, 'logout-with-cleanup');
        
        // Clear localStorage after state update
        setTimeout(() => {
          localStorage.removeItem('supermind-storage');
        }, 50);
      }
    }),
    {
      name: 'supermind-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2, // Increment version to force data migration
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isEncryptionSetup: state.isEncryptionSetup,
        encryptedContent: state.encryptedContent,
        content: state.content,
        categories: state.categories,
        settings: state.settings,
      }),
      migrate: (persistedState: any, version: number) => {
        // Force reload of mock content for new users or version updates
        if (version < 2 || !persistedState.isAuthenticated) {
          return {
            ...persistedState,
            content: mockContent,
            categories: mockCategories,
          };
        }
        return persistedState;
      },
      deserialize: (str) => {
        const parseDate = (value: any): Date => {
          if (!value) return new Date();
          
          try {
            const date = new Date(value);
            const timestamp = date.getTime();
            
            // Check if the date is valid and within a reasonable range
            // Valid JavaScript date range is approximately -8,640,000,000,000,000 to 8,640,000,000,000,000 milliseconds
            // But we'll use a more practical range: year 1900 to year 2100
            const minTimestamp = new Date('1900-01-01').getTime();
            const maxTimestamp = new Date('2100-12-31').getTime();
            
            if (isNaN(timestamp) || timestamp < minTimestamp || timestamp > maxTimestamp) {
              return new Date();
            }
            
            return date;
          } catch (error) {
            // If any error occurs during date parsing, return current date
            return new Date();
          }
        };

        const state = JSON.parse(str);
        
        // Convert date strings back to Date objects for content items
        if (state.content && Array.isArray(state.content)) {
          state.content = state.content.map((item: any) => ({
            ...item,
            timestamp: parseDate(item.timestamp),
            reminderDate: item.reminderDate ? parseDate(item.reminderDate) : undefined,
          }));
        }
        
        // Convert date strings back to Date objects for encrypted content items
        if (state.encryptedContent && Array.isArray(state.encryptedContent)) {
          state.encryptedContent = state.encryptedContent.map((item: any) => ({
            ...item,
            timestamp: parseDate(item.timestamp),
          }));
        }
        
        return state;
      },
    }
  )
);
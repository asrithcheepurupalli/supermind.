export interface SavedContent {
  id: string;
  contentText: string;
  contentType: 'text' | 'link' | 'image' | 'pdf' | 'audio' | 'video';
  sourceApp: string;
  timestamp: Date;
  tags: string[];
  summary: string;
  fileUrl?: string;
  reminderDate?: Date;
  userId: string;
  category: string;
  isFavorite: boolean;
  metadata?: {
    fileSize?: number;
    duration?: number;
    dimensions?: { width: number; height: number };
    wordCount?: number;
    readingTime?: number;
    isGuide?: boolean;
    guideStep?: number;
    canDismiss?: boolean;
  };
  aiGenerated?: {
    confidence: number;
    suggestedActions?: string[];
    relatedContent?: string[];
  };
  isEncrypted?: boolean;
  encryptionVersion?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: 'free' | 'pro' | 'enterprise';
  preferences?: {
    defaultCategory: string;
    autoReminders: boolean;
    emailDigest: 'daily' | 'weekly' | 'never';
  };
  encryptionEnabled?: boolean;
  encryptionSalt?: string;
  oauthProvider?: 'google' | 'github' | 'apple' | 'email';
  oauthId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color?: string;
  description?: string;
}

export interface FilterState {
  category: string;
  contentType: string;
  tags: string[];
  searchQuery: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'recent' | 'oldest' | 'favorites' | 'alphabetical' | 'size';
  viewMode: 'grid' | 'list' | 'timeline';
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
  };
  ai: {
    autoTagging: boolean;
    smartSummaries: boolean;
    contentSuggestions: boolean;
  };
  display: {
    compactMode: boolean;
    showPreviews: boolean;
    animationsEnabled: boolean;
  };
  security: {
    encryptionEnabled: boolean;
    biometricAuth: boolean;
    autoLock: boolean;
    autoLockTimeout: number;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface SearchResult {
  content: SavedContent;
  score: number;
  highlights: string[];
}

export interface AnalyticsData {
  totalItems: number;
  itemsThisWeek: number;
  favoriteItems: number;
  topCategories: Array<{ name: string; count: number }>;
  topTags: Array<{ name: string; count: number }>;
  activityData: Array<{ date: string; count: number }>;
  encryptedItems: number;
  securityScore: number;
}

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
  encryptionVersion: string;
}
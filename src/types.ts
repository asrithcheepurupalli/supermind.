export interface LinkPreview {
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  // Embeddable player URL (YouTube/Vimeo); the card becomes playable in place.
  video?: string;
}

export interface SavedContent {
  id: string;
  contentText: string;
  contentType: 'text' | 'link' | 'image' | 'pdf' | 'audio' | 'video';
  sourceApp: string;
  timestamp: Date;
  tags: string[];
  summary: string;
  fileUrl?: string;
  // Reference into the IndexedDB file drawer; replaces embedded data URLs.
  fileKey?: string;
  // The page's own card for saved links: title, image, and blurb, fetched once
  // at save time. Rides inside the encrypted payload like the text it belongs to.
  preview?: LinkPreview;
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
  encryptionEnabled?: boolean;
  encryptionSalt?: string;
  createdAt?: Date;
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
  favoritesOnly: boolean;
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
    startPage?: 'home' | 'timeline';
    companion?: boolean;
  };
  security: {
    encryptionEnabled: boolean;
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
  encryptedItems?: number;
  securityScore?: number;
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
  metadata?: SavedContent['metadata'];
  aiGenerated?: SavedContent['aiGenerated'];
  encryptionVersion: string;
}
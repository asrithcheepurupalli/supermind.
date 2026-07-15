import { SavedContent, Category } from '../types';

export const mockCategories: Category[] = [
  { id: 'all', name: 'All Items', icon: 'Grid3X3', count: 6 },
  { id: 'guides', name: 'Getting Started', icon: 'GraduationCap', count: 6 },
  { id: 'articles', name: 'Articles', icon: 'FileText', count: 0 },
  { id: 'education', name: 'Education', icon: 'GraduationCap', count: 0 },
  { id: 'health', name: 'Health', icon: 'Heart', count: 0 },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt', count: 0 },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', count: 0 },
];

export const mockContent: SavedContent[] = [
  {
    id: 'guide-1',
    contentText: '🎯 Welcome to supermind! Your AI-powered second brain is ready to transform how you capture, organize, and rediscover information. This interactive guide will walk you through the essential features to get you started on your knowledge journey.',
    contentType: 'text',
    sourceApp: 'supermind. Guide',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    tags: ['welcome', 'getting-started', 'tutorial', 'onboarding'],
    summary: 'Your journey begins here! Learn the basics of organizing your digital life with supermind\'s AI-powered features and discover how to build your perfect second brain.',
    userId: 'user1',
    category: 'guides',
    isFavorite: false,
    metadata: {
      readingTime: 2,
      wordCount: 150,
      isGuide: true,
      guideStep: 1,
      canDismiss: true
    },
    aiGenerated: {
      confidence: 100,
      suggestedActions: ['Click around to explore', 'Find the + button', 'Try searching'],
      relatedContent: ['guide-2', 'guide-3']
    }
  },
  {
    id: 'guide-2',
    contentText: '📝 Adding Content Made Simple: Click the floating + button (bottom right) or press Cmd/Ctrl+N to add anything - text notes, web links, images, PDFs, or voice recordings. Our AI automatically organizes, tags, and summarizes everything for you! Try it now with a quick note or paste a link.',
    contentType: 'text',
    sourceApp: 'supermind. Guide',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    tags: ['tutorial', 'add-content', 'shortcuts', 'ai-organization'],
    summary: 'Master the art of capturing content. From quick thoughts to complex documents, learn all the ways to save information to your knowledge base with AI assistance.',
    userId: 'user1',
    category: 'guides',
    isFavorite: false,
    metadata: {
      readingTime: 3,
      wordCount: 200,
      isGuide: true,
      guideStep: 2,
      canDismiss: true
    },
    aiGenerated: {
      confidence: 100,
      suggestedActions: ['Click the + button', 'Try Cmd+N shortcut', 'Upload a file', 'Add a quick note'],
      relatedContent: ['guide-3', 'guide-4']
    }
  },
  {
    id: 'guide-3',
    contentText: '🔍 Smart Search & Powerful Filters: Use the search bar at the top to find anything instantly with AI-powered natural language queries. Try searching "health articles from last week" or "productivity tips". Use the filter buttons to narrow down by content type, category, or tags. The search understands context and meaning!',
    contentType: 'text',
    sourceApp: 'supermind. Guide',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    tags: ['search', 'filters', 'natural-language', 'ai-search'],
    summary: 'Discover the power of AI-enhanced search. Find exactly what you need with intelligent queries, semantic understanding, and advanced filtering options.',
    userId: 'user1',
    category: 'guides',
    isFavorite: false,
    metadata: {
      readingTime: 2,
      wordCount: 180,
      isGuide: true,
      guideStep: 3,
      canDismiss: true
    },
    aiGenerated: {
      confidence: 100,
      suggestedActions: ['Search for something', 'Try "health tips"', 'Use filters', 'Test AI search'],
      relatedContent: ['guide-4', 'guide-5']
    }
  },
  {
    id: 'guide-4',
    contentText: '🏷️ Smart Organization with AI Tags & Categories: Our AI automatically analyzes and tags your content based on meaning, context, and relationships. You can also add custom tags and organize content into categories like Work, Personal, Learning, etc. Everything stays connected and discoverable through intelligent cross-references.',
    contentType: 'text',
    sourceApp: 'supermind. Guide',
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    tags: ['organization', 'tags', 'categories', 'ai-tagging'],
    summary: 'Learn how supermind\'s AI organizes your content automatically and how you can customize the organization to match your workflow and thinking patterns perfectly.',
    userId: 'user1',
    category: 'guides',
    isFavorite: false,
    metadata: {
      readingTime: 3,
      wordCount: 220,
      isGuide: true,
      guideStep: 4,
      canDismiss: true
    },
    aiGenerated: {
      confidence: 100,
      suggestedActions: ['See auto-tags', 'Add custom tag', 'Explore categories', 'Watch AI magic'],
      relatedContent: ['guide-5', 'guide-6']
    }
  },
  {
    id: 'guide-5',
    contentText: '📊 Analytics & Insights Dashboard: Click the Analytics tab to discover fascinating patterns in your knowledge consumption and creation. See your most productive times, favorite topics, learning trends, knowledge gaps, and content relationships. Use these insights to optimize your learning workflow and discover new connections.',
    contentType: 'text',
    sourceApp: 'supermind. Guide',
    timestamp: new Date(Date.now() - 18000000), // 5 hours ago
    tags: ['analytics', 'insights', 'productivity', 'learning-patterns'],
    summary: 'Unlock the power of data-driven learning. Understand your knowledge patterns, optimize your information consumption habits, and discover hidden insights in your content.',
    userId: 'user1',
    category: 'guides',
    isFavorite: false,
    metadata: {
      readingTime: 2,
      wordCount: 160,
      isGuide: true,
      guideStep: 5,
      canDismiss: true
    },
    aiGenerated: {
      confidence: 100,
      suggestedActions: ['Click Analytics', 'See your patterns', 'Discover insights', 'Track progress'],
      relatedContent: ['guide-6']
    }
  },
  {
    id: 'guide-6',
    contentText: '🔐 Privacy & Security First: Your data is protected with military-grade end-to-end encryption. All AI processing happens locally on your device - we never see your content. Enable biometric authentication in Settings for extra protection. Your thoughts, ideas, and knowledge remain completely private and secure.',
    contentType: 'text',
    sourceApp: 'supermind. Guide',
    timestamp: new Date(Date.now() - 21600000), // 6 hours ago
    tags: ['privacy', 'security', 'encryption', 'local-ai'],
    summary: 'Understand how supermind protects your privacy with local AI processing and end-to-end encryption. Your digital thoughts are safe, secure, and completely private.',
    userId: 'user1',
    category: 'guides',
    isFavorite: false,
    metadata: {
      readingTime: 3,
      wordCount: 190,
      isGuide: true,
      guideStep: 6,
      canDismiss: true
    },
    aiGenerated: {
      confidence: 100,
      suggestedActions: ['Check security', 'Enable encryption', 'Setup biometrics', 'Stay private'],
      relatedContent: []
    }
  }
];
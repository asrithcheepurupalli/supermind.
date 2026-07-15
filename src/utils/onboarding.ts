import { SavedContent, Category } from '../types';

// Base category definitions. Counts are derived from content at render time.
export const baseCategories: Omit<Category, 'count'>[] = [
  { id: 'all', name: 'All Items', icon: 'Grid3X3' },
  { id: 'guides', name: 'Getting Started', icon: 'GraduationCap' },
  { id: 'articles', name: 'Articles', icon: 'FileText' },
  { id: 'education', name: 'Education', icon: 'GraduationCap' },
  { id: 'health', name: 'Health', icon: 'Heart' },
  { id: 'work', name: 'Work', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', icon: 'Heart' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag' },
];

// Interactive onboarding guides seeded once when a profile is created.
// Each one is dismissible and disappears for good once completed.
export const createOnboardingContent = (userId: string): SavedContent[] => {
  const now = Date.now();
  const guide = (
    step: number,
    contentText: string,
    summary: string,
    tags: string[],
    suggestedActions: string[]
  ): SavedContent => ({
    id: `guide-${step}`,
    contentText,
    contentType: 'text',
    sourceApp: 'supermind. Guide',
    timestamp: new Date(now - step * 60000),
    tags,
    summary,
    userId,
    category: 'guides',
    isFavorite: false,
    metadata: {
      isGuide: true,
      guideStep: step,
      canDismiss: true,
    },
    aiGenerated: {
      confidence: 100,
      suggestedActions,
    },
  });

  return [
    guide(
      1,
      '🎯 Welcome to supermind! This is your local-first second brain: everything you save is stored on this device, organized automatically, and searchable instantly. These short guides show you around — dismiss each one when you are done with it.',
      'Start here: what supermind is and how these guides work.',
      ['welcome', 'getting-started'],
      ['Read the next guides', 'Dismiss this card when done']
    ),
    guide(
      2,
      '📝 Adding content: click the + button (or press Cmd/Ctrl+N) to save text notes, web links, images, PDFs, audio, or video. Content is tagged, summarized, and categorized automatically as you add it.',
      'How to capture notes, links, and files into your knowledge base.',
      ['tutorial', 'add-content', 'shortcuts'],
      ['Click the + button', 'Try Cmd/Ctrl+N', 'Add a quick note']
    ),
    guide(
      3,
      '🔍 Finding things: use the search bar (Cmd/Ctrl+K) for instant fuzzy search across all your content, tags, and summaries. Combine it with the category, type, and tag filters in the sidebar to narrow down results.',
      'Search and filter your entire knowledge base in milliseconds.',
      ['search', 'filters'],
      ['Press Cmd/Ctrl+K', 'Try a search', 'Click a sidebar filter']
    ),
    guide(
      4,
      '🏷️ Smart organization: every item is tagged and categorized automatically from its content. Click any tag to filter by it, edit an item to adjust its tags, and use the sidebar to browse by category or content type.',
      'How auto-tagging and categories keep your library organized.',
      ['organization', 'tags', 'categories'],
      ['Click a tag on any card', 'Edit an item\'s tags', 'Browse sidebar categories']
    ),
    guide(
      5,
      '📊 Analytics & Insights: the Analytics view charts your activity, top categories, and popular tags — all computed from your real data. The Insights view surfaces related items, tag connections, and personalized suggestions.',
      'See patterns in what you save and rediscover forgotten content.',
      ['analytics', 'insights'],
      ['Open the Analytics tab', 'Check the Insights view']
    ),
    guide(
      6,
      '🔐 Privacy: your data never leaves this device. You can additionally enable encryption at rest in Settings → Security — content is then encrypted with AES-256-GCM using a passphrase only you know. Export a backup any time from Settings → Data & Storage.',
      'Local-first storage, optional AES-256 encryption at rest, and one-click backups.',
      ['privacy', 'security', 'encryption'],
      ['Open Settings → Security', 'Enable encryption', 'Export a backup']
    ),
  ];
};

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
      'Welcome to supermind. Everything you save lives on this device, gets organized automatically, and turns up instantly when you search. These six short guides show you around. Dismiss each one once you have read it.',
      'What supermind is and how these guides work.',
      ['welcome', 'getting-started'],
      ['Read the next guides', 'Dismiss this card when done']
    ),
    guide(
      2,
      'Adding things: press the + button or Cmd/Ctrl+N and a fresh page opens. Write a note, paste a link, or drop in an image, PDF, or recording. Whatever you file gets tagged and categorized on the spot.',
      'How to capture notes, links, and files into your knowledge base.',
      ['tutorial', 'add-content', 'shortcuts'],
      ['Click the + button', 'Try Cmd/Ctrl+N', 'Add a quick note']
    ),
    guide(
      3,
      'Finding things: Cmd/Ctrl+K opens the command palette, which searches everything you have written, including tags and summaries, and forgives typos. The sidebar filters by category, type, and tag when you want to narrow it down.',
      'Search and filter your entire knowledge base in milliseconds.',
      ['search', 'filters'],
      ['Press Cmd/Ctrl+K', 'Try a search', 'Click a sidebar filter']
    ),
    guide(
      4,
      'Tags do the filing. Every entry is tagged from its own words, so you rarely need to sort anything by hand. Click a tag to see everything that shares it, or edit an entry if the tags miss the point.',
      'How auto-tagging and categories keep your library organized.',
      ['organization', 'tags', 'categories'],
      ['Click a tag on any card', 'Edit an item\'s tags', 'Browse sidebar categories']
    ),
    guide(
      5,
      'Two more pages worth knowing: the graph draws your tags as a constellation, connected when they appear in the same entries. The almanac is a printed summary of your own habits: what you capture, when, and which ideas keep meeting each other.',
      'The graph and the almanac, two views of your own thinking.',
      ['graph', 'almanac'],
      ['Open the Graph view', 'Open the Almanac']
    ),
    guide(
      6,
      'Privacy: nothing you write leaves this device. If you want more than that, turn on encryption in Settings under Security and your content is sealed with AES-256 behind a passphrase only you know. Export a backup any time from Data & Storage.',
      'Local-first storage, optional AES-256 encryption at rest, and one-click backups.',
      ['privacy', 'security', 'encryption'],
      ['Open Settings → Security', 'Enable encryption', 'Export a backup']
    ),
  ];
};

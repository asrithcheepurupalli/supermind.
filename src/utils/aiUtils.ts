import { SavedContent } from '../types';

// Simulated AI functions for demo purposes
export const generateTags = (content: string, contentType: string): string[] => {
  const tagMap: Record<string, string[]> = {
    productivity: ['productivity', 'efficiency', 'work'],
    health: ['health', 'wellness', 'fitness'],
    education: ['learning', 'education', 'knowledge'],
    technology: ['tech', 'innovation', 'digital'],
    design: ['design', 'ui-ux', 'creative'],
    business: ['business', 'strategy', 'growth'],
  };

  // Simple keyword matching for demo
  const keywords = content.toLowerCase();
  const tags: string[] = [];

  Object.entries(tagMap).forEach(([category, categoryTags]) => {
    if (keywords.includes(category) || categoryTags.some(tag => keywords.includes(tag))) {
      tags.push(...categoryTags.slice(0, 2));
    }
  });

  // Add content type as tag
  tags.push(contentType);

  return [...new Set(tags)].slice(0, 4);
};

export const generateSummary = (content: string, contentType: string): string => {
  const summaries: Record<string, string[]> = {
    text: [
      'Personal note with important reminders and action items.',
      'Quick thoughts and ideas captured for future reference.',
      'Meeting notes with key decisions and next steps.',
    ],
    link: [
      'Interesting article about productivity and personal development.',
      'Resource for learning new skills and improving knowledge.',
      'Valuable content for professional growth and insights.',
    ],
    image: [
      'Visual inspiration and creative reference material.',
      'Design concepts and aesthetic ideas for projects.',
      'Infographic with useful information and data.',
    ],
    pdf: [
      'Comprehensive document with detailed information and analysis.',
      'Research paper or guide with actionable insights.',
      'Important reference material for future projects.',
    ],
    audio: [
      'Podcast episode with valuable insights and perspectives.',
      'Audio content for learning during commute or exercise.',
      'Interview or discussion with industry experts.',
    ],
    video: [
      'Educational video content with practical tips.',
      'Tutorial or demonstration of useful techniques.',
      'Presentation or talk from thought leaders.',
    ],
  };

  const typeSummaries = summaries[contentType] || summaries.text;
  return typeSummaries[Math.floor(Math.random() * typeSummaries.length)];
};

export const suggestCategory = (content: string, tags: string[]): string => {
  const categoryKeywords: Record<string, string[]> = {
    articles: ['article', 'blog', 'news', 'read'],
    education: ['learn', 'course', 'tutorial', 'education', 'knowledge'],
    health: ['health', 'fitness', 'wellness', 'meditation', 'exercise'],
    fashion: ['fashion', 'style', 'clothing', 'outfit'],
    shopping: ['buy', 'purchase', 'shop', 'product', 'deal'],
  };

  const contentLower = content.toLowerCase();
  const allTags = tags.join(' ').toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword) || allTags.includes(keyword))) {
      return category;
    }
  }

  return 'articles';
};

export const suggestReminderDate = (content: string): Date | undefined => {
  const reminders = ['remind', 'follow up', 'deadline', 'due', 'schedule'];
  const contentLower = content.toLowerCase();

  if (reminders.some(reminder => contentLower.includes(reminder))) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  return undefined;
};
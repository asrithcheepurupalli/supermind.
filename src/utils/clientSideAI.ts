// Client-side heuristics for tagging, summaries, categories, and reminders.
// Everything here runs synchronously on-device — no model, no API calls.
export class ClientSideAI {
  private static instance: ClientSideAI;
  
  private constructor() {}

  static getInstance(): ClientSideAI {
    if (!ClientSideAI.instance) {
      ClientSideAI.instance = new ClientSideAI();
    }
    return ClientSideAI.instance;
  }

  // Enhanced client-side tag generation
  generateTags(content: string, contentType: string): string[] {
    const tagMap: Record<string, string[]> = {
      productivity: ['productivity', 'efficiency', 'work', 'focus', 'time-management'],
      health: ['health', 'wellness', 'fitness', 'nutrition', 'mental-health'],
      education: ['learning', 'education', 'knowledge', 'study', 'research'],
      technology: ['tech', 'innovation', 'digital', 'software', 'ai'],
      design: ['design', 'ui-ux', 'creative', 'visual', 'art'],
      business: ['business', 'strategy', 'growth', 'marketing', 'finance'],
      science: ['science', 'research', 'data', 'analysis', 'discovery'],
      personal: ['personal', 'life', 'goals', 'habits', 'mindfulness'],
    };

    const keywords = content.toLowerCase();
    const tags: string[] = [];

    // Advanced keyword matching with context
    Object.entries(tagMap).forEach(([category, categoryTags]) => {
      const matches = categoryTags.filter(tag => 
        keywords.includes(tag) || 
        this.semanticMatch(keywords, tag)
      );
      
      if (matches.length > 0) {
        tags.push(category);
        tags.push(...matches.slice(0, 2));
      }
    });

    // Add content type and length-based tags
    tags.push(contentType);
    if (content.length > 1000) tags.push('long-form');
    if (content.length < 100) tags.push('quick-note');

    // Extract entities (simplified)
    const entities = this.extractEntities(content);
    tags.push(...entities);

    return [...new Set(tags)].slice(0, 6);
  }

  // Enhanced client-side summary generation
  generateSummary(content: string, contentType: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      return this.getDefaultSummary(contentType);
    }

    // Score sentences based on various factors
    const scoredSentences = sentences.map(sentence => ({
      text: sentence.trim(),
      score: this.scoreSentence(sentence, content)
    }));

    // Sort by score and take top sentences
    scoredSentences.sort((a, b) => b.score - a.score);
    const topSentences = scoredSentences.slice(0, 2);

    if (topSentences.length > 0) {
      return topSentences.map(s => s.text).join('. ') + '.';
    }

    return this.getDefaultSummary(contentType);
  }

  // Enhanced category suggestion
  suggestCategory(content: string, tags: string[]): string {
    const categoryKeywords: Record<string, string[]> = {
      articles: ['article', 'blog', 'news', 'read', 'story', 'post'],
      education: ['learn', 'course', 'tutorial', 'education', 'knowledge', 'study'],
      health: ['health', 'fitness', 'wellness', 'meditation', 'exercise', 'nutrition'],
      fashion: ['fashion', 'style', 'clothing', 'outfit', 'trend', 'wear'],
      shopping: ['buy', 'purchase', 'shop', 'product', 'deal', 'price'],
      work: ['work', 'job', 'career', 'business', 'meeting', 'project'],
      personal: ['personal', 'diary', 'thoughts', 'feelings', 'life'],
    };

    const contentLower = content.toLowerCase();
    const allTags = tags.join(' ').toLowerCase();
    const combinedText = `${contentLower} ${allTags}`;

    // Score each category
    const categoryScores: Record<string, number> = {};
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const occurrences = (combinedText.match(new RegExp(keyword, 'g')) || []).length;
        score += occurrences;
        
        // Bonus for exact matches
        if (contentLower.includes(keyword)) score += 2;
        if (allTags.includes(keyword)) score += 3;
      });
      categoryScores[category] = score;
    });

    // Find the category with the highest score
    const bestCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0];

    return bestCategory && bestCategory[1] > 0 ? bestCategory[0] : 'articles';
  }

  // Smart reminder date suggestion
  suggestReminderDate(content: string): Date | undefined {
    const reminders = [
      'remind', 'follow up', 'deadline', 'due', 'schedule', 
      'meeting', 'appointment', 'call', 'review', 'check'
    ];
    
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'today', 'now'];
    const weekKeywords = ['week', 'weekly', 'next week'];
    const monthKeywords = ['month', 'monthly', 'next month'];

    const contentLower = content.toLowerCase();

    if (!reminders.some(reminder => contentLower.includes(reminder))) {
      return undefined;
    }

    const now = new Date();
    
    if (urgentKeywords.some(keyword => contentLower.includes(keyword))) {
      // Set reminder for later today
      const reminder = new Date(now);
      reminder.setHours(now.getHours() + 2, 0, 0, 0);
      return reminder;
    }
    
    if (weekKeywords.some(keyword => contentLower.includes(keyword))) {
      // Set reminder for next week
      const reminder = new Date(now);
      reminder.setDate(now.getDate() + 7);
      reminder.setHours(9, 0, 0, 0);
      return reminder;
    }
    
    if (monthKeywords.some(keyword => contentLower.includes(keyword))) {
      // Set reminder for next month
      const reminder = new Date(now);
      reminder.setMonth(now.getMonth() + 1);
      reminder.setHours(9, 0, 0, 0);
      return reminder;
    }

    // Default: tomorrow morning
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  // Private helper methods
  private semanticMatch(text: string, keyword: string): boolean {
    const synonyms: Record<string, string[]> = {
      'productivity': ['efficient', 'effective', 'optimize', 'streamline'],
      'health': ['wellbeing', 'medical', 'doctor', 'exercise'],
      'learning': ['education', 'study', 'knowledge', 'skill'],
      'technology': ['digital', 'software', 'app', 'tech'],
    };

    if (synonyms[keyword]) {
      return synonyms[keyword].some(synonym => text.includes(synonym));
    }
    return false;
  }

  private extractEntities(content: string): string[] {
    const entities: string[] = [];
    
    // Extract URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex);
    if (urls) entities.push('contains-link');

    // Extract mentions
    const mentionRegex = /@\w+/g;
    const mentions = content.match(mentionRegex);
    if (mentions) entities.push('mentions');

    // Extract hashtags
    const hashtagRegex = /#\w+/g;
    const hashtags = content.match(hashtagRegex);
    if (hashtags) entities.push('hashtags');

    // Extract dates
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g;
    const dates = content.match(dateRegex);
    if (dates) entities.push('contains-date');

    return entities;
  }

  private scoreSentence(sentence: string, fullContent: string): number {
    let score = 0;
    
    // Length scoring (prefer medium-length sentences)
    const length = sentence.length;
    if (length > 50 && length < 200) score += 2;
    else if (length > 20 && length < 300) score += 1;

    // Position scoring (prefer sentences from beginning)
    const position = fullContent.indexOf(sentence) / fullContent.length;
    if (position < 0.3) score += 2;
    else if (position < 0.6) score += 1;

    // Keyword scoring
    const importantWords = ['important', 'key', 'main', 'primary', 'essential', 'crucial'];
    importantWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) score += 1;
    });

    return score;
  }

  private getDefaultSummary(contentType: string): string {
    const summaries: Record<string, string[]> = {
      text: [
        'Personal note with important information and insights.',
        'Quick thoughts and ideas captured for future reference.',
        'Important content saved for later review and action.',
      ],
      link: [
        'Valuable web content saved for future reference and learning.',
        'Online resource with useful information and insights.',
        'Web article or page with relevant content and data.',
      ],
      image: [
        'Visual content saved for inspiration and reference.',
        'Image containing important information or creative ideas.',
        'Visual material for future projects and inspiration.',
      ],
      pdf: [
        'Document with comprehensive information and analysis.',
        'Important file containing detailed data and insights.',
        'Reference material for research and future projects.',
      ],
      audio: [
        'Audio content with valuable insights and information.',
        'Recorded material for learning and future reference.',
        'Sound file containing important discussions or ideas.',
      ],
      video: [
        'Video content with educational or informational value.',
        'Visual material containing important demonstrations or talks.',
        'Recorded content for learning and skill development.',
      ],
    };

    const typeSummaries = summaries[contentType] || summaries.text;
    return typeSummaries[Math.floor(Math.random() * typeSummaries.length)];
  }
}

export const clientSideAI = ClientSideAI.getInstance();
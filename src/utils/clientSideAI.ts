// Client-side heuristics for tagging, summaries, categories, and reminders.
// Everything here runs synchronously on-device. No model, no API calls.
//
// Two ideas carry the organizer:
// 1. Tags come from the note's own words (frequency-scored keyword
//    extraction), so a note about sourdough gets #sourdough, not #text.
// 2. Reminders come from a real date parser: "on tuesday at 5pm",
//    "aug 3", "in 3 days", "tomorrow evening" all resolve to actual dates.

// Words that carry no meaning of their own. Kept deliberately broad so the
// keyword extractor only surfaces words the writer actually chose.
const STOPWORDS = new Set(('a,about,above,after,again,against,all,also,am,an,and,any,are,as,at,be,because,been,before,being,' +
  'below,between,both,but,by,can,cannot,could,did,do,does,doing,down,during,each,few,for,from,further,get,got,had,has,have,' +
  'having,he,her,here,hers,herself,him,himself,his,how,i,if,in,into,is,it,its,itself,just,let,like,make,me,more,most,my,' +
  'myself,need,no,nor,not,now,of,off,on,once,only,or,other,our,ours,ourselves,out,over,own,really,same,she,should,so,some,' +
  'still,such,than,that,the,their,theirs,them,themselves,then,there,these,they,this,those,through,to,too,under,until,up,' +
  'upon,us,very,want,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,you,your,yours,yourself,thing,' +
  'things,stuff,item,note,notes,list,week,month,year,today,tomorrow,tonight,day,days,time,remember,remind,reminder,check,' +
  'review,later,next,new,one,two,three,going,think,thought,maybe,much,many,lot,bit,http,https,www,com,org,' +
  'trying,tried,looking,looked,making,made,getting,came,gone,take,took,taken,put,keep,kept,back,well,even,said,says,' +
  'tell,told,ask,asked,using,used,find,found,know,knew,known,feel,felt,seem,seemed,look,come,goes,went,gets,give,gave,' +
  'good,great,nice,better,best,little,long,right,sure,fresh,every,always,never,around,another,something,anything,everything,' +
  'finished,started,second,half,part,whole,pretty,quite,really,actually,probably,definitely').split(','));

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const monthIndex = (word: string): number =>
  MONTHS.findIndex(m => m === word || m.slice(0, 3) === word.slice(0, 3).toLowerCase());

// Parse a time fragment like "5pm", "5:30 pm", "17:30", "noon".
const parseTime = (text: string): { h: number; m: number } | null => {
  if (/\b(at\s+)?noon\b/.test(text)) return { h: 12, m: 0 };
  if (/\bmidnight\b/.test(text)) return { h: 23, m: 59 };
  const m = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/) ?? text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\b/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const suffix = m[3];
  if (h > 23 || min > 59) return null;
  if (suffix === 'pm' && h < 12) h += 12;
  if (suffix === 'am' && h === 12) h = 0;
  // "at 5" with no am/pm: assume the working day, 5 means 17:00.
  if (!suffix && h >= 1 && h <= 7) h += 12;
  return { h, m: min };
};

// Find a concrete future date in free text. Returns undefined if the text
// carries no usable temporal phrase.
export const parseNaturalDate = (raw: string, now: Date = new Date()): Date | undefined => {
  const text = raw.toLowerCase();
  const result = new Date(now);
  let dated = false;

  const time = parseTime(text);

  if (/\bday after tomorrow\b/.test(text)) {
    result.setDate(now.getDate() + 2); dated = true;
  } else if (/\btomorrow\b/.test(text)) {
    result.setDate(now.getDate() + 1); dated = true;
  } else if (/\btonight\b|\bthis evening\b/.test(text)) {
    result.setHours(20, 0, 0, 0);
    if (result.getTime() <= now.getTime()) result.setHours(now.getHours() + 1, 0, 0, 0);
    return result;
  } else if (/\bthis afternoon\b/.test(text)) {
    result.setHours(15, 0, 0, 0);
    return result.getTime() > now.getTime() ? result : undefined;
  } else if (/\bnext week\b/.test(text)) {
    result.setDate(now.getDate() + 7); dated = true;
  } else if (/\bnext month\b/.test(text)) {
    result.setMonth(now.getMonth() + 1); dated = true;
  }

  // "in 3 days" / "in 2 weeks" / "in 4 hours" / "in 30 minutes"
  if (!dated) {
    const rel = text.match(/\bin\s+(\d+|a|an)\s+(minute|hour|day|week|month)s?\b/);
    if (rel) {
      const n = rel[1] === 'a' || rel[1] === 'an' ? 1 : parseInt(rel[1], 10);
      const unit = rel[2];
      if (unit === 'minute') { result.setMinutes(now.getMinutes() + n); return result; }
      if (unit === 'hour') { result.setHours(now.getHours() + n); return result; }
      if (unit === 'day') result.setDate(now.getDate() + n);
      if (unit === 'week') result.setDate(now.getDate() + n * 7);
      if (unit === 'month') result.setMonth(now.getMonth() + n);
      dated = true;
    }
  }

  // Weekdays need a qualifier ("on tuesday", "next friday", "by monday",
  // "due wednesday") so "notes from tuesday" stays a memory, not a plan.
  if (!dated) {
    const wd = text.match(/\b(on|next|this|by|before|until|due)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
    if (wd) {
      const target = WEEKDAYS.indexOf(wd[2]);
      let ahead = (target - now.getDay() + 7) % 7;
      if (wd[1] === 'next') {
        // "next friday" always reaches into next week.
        if (ahead < 7) ahead += 7;
      } else if (ahead === 0) {
        // "on friday", said on a Friday: today, unless the moment has
        // already slipped past, in which case next week.
        const probe = new Date(now);
        if (time) probe.setHours(time.h, time.m, 0, 0);
        else probe.setHours(9, 0, 0, 0);
        if (probe.getTime() <= now.getTime()) ahead = 7;
      }
      result.setDate(now.getDate() + ahead);
      dated = true;
    }
  }

  // "aug 3", "august 3rd", "3 august", "on 3rd of august"
  if (!dated) {
    const m1 = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
    const m2 = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/);
    const pair = m1 ? { mo: monthIndex(m1[1]), d: parseInt(m1[2], 10) } : m2 ? { mo: monthIndex(m2[2]), d: parseInt(m2[1], 10) } : null;
    if (pair && pair.mo >= 0 && pair.d >= 1 && pair.d <= 31) {
      result.setMonth(pair.mo, pair.d);
      if (result.getTime() < now.getTime() - 86400000) result.setFullYear(now.getFullYear() + 1);
      dated = true;
    }
  }

  // ISO dates: 2026-08-03
  if (!dated) {
    const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (iso) {
      const d = new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
      if (!isNaN(d.getTime()) && d.getTime() > now.getTime() - 86400000) {
        result.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
        dated = true;
      }
    }
  }

  if (!dated) {
    // A bare time still counts: "call mom at 5pm" means today, or tomorrow
    // if 5pm already passed.
    if (time) {
      result.setHours(time.h, time.m, 0, 0);
      if (result.getTime() <= now.getTime()) result.setDate(result.getDate() + 1);
      return result;
    }
    return undefined;
  }

  if (time) result.setHours(time.h, time.m, 0, 0);
  else result.setHours(9, 0, 0, 0);
  if (result.getTime() <= now.getTime()) return undefined;
  return result;
};

// Frequency-scored keyword extraction: the words the writer used most,
// minus the words everyone uses.
export const extractKeywords = (text: string, limit = 3): string[] => {
  const words = text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && w.length < 24 && !STOPWORDS.has(w) && !/^\d+$/.test(w) && !WEEKDAYS.includes(w) && monthIndex(w) === -1);

  if (words.length === 0) return [];

  const counts = new Map<string, number>();
  words.forEach((w, i) => {
    // Earlier words get a nudge: openings carry the subject.
    const positionBoost = i < 8 ? 1.5 : 1;
    counts.set(w, (counts.get(w) ?? 0) + positionBoost);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
};

export class ClientSideAI {
  private static instance: ClientSideAI;

  private constructor() {}

  static getInstance(): ClientSideAI {
    if (!ClientSideAI.instance) {
      ClientSideAI.instance = new ClientSideAI();
    }
    return ClientSideAI.instance;
  }

  // Tags: the note's own strongest words first, then the domain buckets
  // that categorization and the graph lean on.
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

    // The writer's own words lead.
    tags.push(...extractKeywords(content, 3));

    Object.entries(tagMap).forEach(([category, categoryTags]) => {
      const matches = categoryTags.filter(tag =>
        keywords.includes(tag) ||
        this.semanticMatch(keywords, tag)
      );

      if (matches.length > 0) {
        tags.push(category);
        tags.push(...matches.slice(0, 1));
      }
    });

    // No meta-tags: the entry's type already has a glyph and a filter of its
    // own, and a graph whose brightest star is "text" tells you nothing.
    void contentType;

    return [...new Set(tags)].slice(0, 6);
  }

  // Enhanced client-side summary generation
  generateSummary(content: string, contentType: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);

    if (sentences.length === 0) {
      return this.getDefaultSummary(contentType);
    }

    const scoredSentences = sentences.map(sentence => ({
      text: sentence.trim(),
      score: this.scoreSentence(sentence, content)
    }));

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

    const categoryScores: Record<string, number> = {};

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const occurrences = (combinedText.match(new RegExp(keyword, 'g')) || []).length;
        score += occurrences;

        if (contentLower.includes(keyword)) score += 2;
        if (allTags.includes(keyword)) score += 3;
      });
      categoryScores[category] = score;
    });

    const bestCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0];

    return bestCategory && bestCategory[1] > 0 ? bestCategory[0] : 'articles';
  }

  // Reminders: a real date parser first, the old trigger-word defaults as
  // the fallback when intent is clear but no date was written.
  suggestReminderDate(content: string): Date | undefined {
    const triggers = [
      'remind', 'follow up', 'deadline', 'due', 'schedule', 'meeting',
      'appointment', 'call', 'review', 'check', 'pay', 'renew', 'submit',
      'book', 'send', "don't forget", 'dont forget',
    ];
    const contentLower = content.toLowerCase();
    const hasTrigger = triggers.some(t => contentLower.includes(t));

    const parsed = parseNaturalDate(content);
    if (parsed) {
      // An explicit future date or time is intent enough on its own:
      // "dinner with sam on friday" deserves the nudge.
      return parsed;
    }

    if (!hasTrigger) return undefined;

    const now = new Date();

    if (['urgent', 'asap', 'immediately'].some(k => contentLower.includes(k))) {
      const reminder = new Date(now);
      reminder.setHours(now.getHours() + 2, 0, 0, 0);
      return reminder;
    }

    // Nothing dated, but the note wants following up: tomorrow morning.
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

  private scoreSentence(sentence: string, fullContent: string): number {
    let score = 0;

    const length = sentence.length;
    if (length > 50 && length < 200) score += 2;
    else if (length > 20 && length < 300) score += 1;

    const position = fullContent.indexOf(sentence) / fullContent.length;
    if (position < 0.3) score += 2;
    else if (position < 0.6) score += 1;

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

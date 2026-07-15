import { useMemo } from 'react';
import { SavedContent } from '../types';

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  type: string;
  match: number;
}

export interface TagConnection {
  tagA: string;
  tagB: string;
  count: number;
}

export interface Suggestion {
  title: string;
  detail: string;
}

export interface InsightsData {
  recommendations: Recommendation[];
  tagConnections: TagConnection[];
  peakTime: string | null;
  favoriteType: string | null;
  weeklyGrowth: number | null;
  suggestions: Suggestion[];
}

const truncate = (text: string, max = 60) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

// All "AI insights" are computed locally from the user's actual content.
export const useInsights = (content: SavedContent[]): InsightsData => {
  return useMemo(() => {
    const items = content.filter(c => !c.metadata?.isGuide);

    // Related-content recommendations: items sharing tags with the most recent saves.
    const recent = [...items]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
    const recommendations: Recommendation[] = [];
    const recommended = new Set<string>();
    for (const source of recent) {
      if (recommendations.length >= 4) break;
      let best: { item: SavedContent; shared: number } | null = null;
      for (const other of items) {
        if (other.id === source.id || recommended.has(other.id)) continue;
        const shared = other.tags.filter(t => source.tags.includes(t)).length;
        if (shared > 0 && (!best || shared > best.shared)) {
          best = { item: other, shared };
        }
      }
      if (best) {
        recommended.add(best.item.id);
        recommendations.push({
          id: best.item.id,
          title: truncate(best.item.contentText),
          reason: `Related to "${truncate(source.contentText, 40)}"`,
          type: best.item.contentType,
          match: Math.min(99, Math.round((best.shared / Math.max(1, source.tags.length)) * 100)),
        });
      }
    }

    // Tag connections: pairs of tags that appear together most often.
    const pairCounts = new Map<string, number>();
    for (const item of items) {
      const tags = [...new Set(item.tags)].sort();
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const key = `${tags[i]}|${tags[j]}`;
          pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
        }
      }
    }
    const tagConnections: TagConnection[] = [...pairCounts.entries()]
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, count]) => {
        const [tagA, tagB] = key.split('|');
        return { tagA, tagB, count };
      });

    // Peak activity time-of-day.
    let peakTime: string | null = null;
    if (items.length >= 3) {
      const buckets = { 'Morning (5am–12pm)': 0, 'Afternoon (12–5pm)': 0, 'Evening (5–10pm)': 0, 'Night (10pm–5am)': 0 };
      for (const item of items) {
        const h = item.timestamp.getHours();
        if (h >= 5 && h < 12) buckets['Morning (5am–12pm)']++;
        else if (h >= 12 && h < 17) buckets['Afternoon (12–5pm)']++;
        else if (h >= 17 && h < 22) buckets['Evening (5–10pm)']++;
        else buckets['Night (10pm–5am)']++;
      }
      peakTime = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0];
    }

    // Most-saved content type.
    let favoriteType: string | null = null;
    if (items.length > 0) {
      const typeCounts = items.reduce<Record<string, number>>((acc, item) => {
        acc[item.contentType] = (acc[item.contentType] || 0) + 1;
        return acc;
      }, {});
      favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
    }

    // Week-over-week growth in saved items.
    const now = Date.now();
    const week = 7 * 24 * 3600 * 1000;
    const thisWeek = items.filter(i => now - i.timestamp.getTime() < week).length;
    const lastWeek = items.filter(i => {
      const age = now - i.timestamp.getTime();
      return age >= week && age < 2 * week;
    }).length;
    const weeklyGrowth = lastWeek > 0
      ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
      : thisWeek > 0 ? 100 : null;

    // Rule-based suggestions from real data.
    const suggestions: Suggestion[] = [];
    const overdue = items.filter(i => i.reminderDate && i.reminderDate.getTime() < now);
    if (overdue.length > 0) {
      suggestions.push({
        title: `Review ${overdue.length} overdue reminder${overdue.length > 1 ? 's' : ''}`,
        detail: `Oldest: "${truncate(overdue[0].contentText, 50)}"`,
      });
    }
    const untagged = items.filter(i => i.tags.length === 0);
    if (untagged.length > 0) {
      suggestions.push({
        title: `Tag ${untagged.length} untagged item${untagged.length > 1 ? 's' : ''}`,
        detail: 'Tagged content is easier to rediscover through search and filters.',
      });
    }
    const staleFavorites = items.filter(
      i => i.isFavorite && now - i.timestamp.getTime() > 30 * 24 * 3600 * 1000
    );
    if (staleFavorites.length > 0) {
      suggestions.push({
        title: 'Revisit your older favorites',
        detail: `${staleFavorites.length} favorite${staleFavorites.length > 1 ? 's are' : ' is'} more than a month old.`,
      });
    }
    if (items.length === 0) {
      suggestions.push({
        title: 'Start capturing',
        detail: 'Add your first note or link with the + button to unlock insights.',
      });
    } else if (suggestions.length === 0) {
      suggestions.push({
        title: 'All caught up',
        detail: 'No overdue reminders and nothing left untagged.',
      });
    }

    return { recommendations, tagConnections, peakTime, favoriteType, weeklyGrowth, suggestions };
  }, [content]);
};

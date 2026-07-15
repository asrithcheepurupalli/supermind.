import { useMemo } from 'react';
import { SavedContent, AnalyticsData } from '../types';
import { startOfWeek, isWithinInterval, format } from 'date-fns';

export const useAnalytics = (content: SavedContent[]): AnalyticsData => {
  return useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    
    const itemsThisWeek = content.filter(item => 
      isWithinInterval(item.timestamp, { start: weekStart, end: now })
    ).length;
    
    const favoriteItems = content.filter(item => item.isFavorite).length;
    
    // Top categories
    const categoryCount: Record<string, number> = {};
    content.forEach(item => {
      if (item.category !== 'all') {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }
    });
    
    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Top tags
    const tagCount: Record<string, number> = {};
    content.forEach(item => {
      item.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Activity data for the last 30 days
    const activityData: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const count = content.filter(item => 
        item.timestamp && 
        !isNaN(item.timestamp.getTime()) && 
        format(item.timestamp, 'yyyy-MM-dd') === dateStr
      ).length;
      
      activityData.push({ date: dateStr, count });
    }
    
    return {
      totalItems: content.length,
      itemsThisWeek,
      favoriteItems,
      topCategories,
      topTags,
      activityData,
    };
  }, [content]);
};
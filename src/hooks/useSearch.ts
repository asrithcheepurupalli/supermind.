import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { SavedContent, SearchResult } from '../types';

const searchOptions = {
  keys: [
    { name: 'contentText', weight: 0.4 },
    { name: 'summary', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'sourceApp', weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export const useSearch = (content: SavedContent[], query: string): SearchResult[] => {
  const fuse = useMemo(() => new Fuse(content, searchOptions), [content]);

  return useMemo(() => {
    if (!query.trim()) return [];

    const results = fuse.search(query);
    
    return results.map(result => ({
      content: result.item,
      score: 1 - (result.score || 0),
      highlights: result.matches?.map(match => match.value || '') || [],
    }));
  }, [fuse, query]);
};
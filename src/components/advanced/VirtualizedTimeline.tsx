import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { SavedContent } from '../../types';
import ContentCard from '../ContentCard';

interface VirtualizedTimelineProps {
  content: SavedContent[];
  onToggleFavorite: (id: string) => void;
}

const ITEM_HEIGHT = 280;

export default function VirtualizedTimeline({ content, onToggleFavorite }: VirtualizedTimelineProps) {
  const Row = React.useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = content[index];
    
    return (
      <div style={style} className="px-6 pb-6">
        <ContentCard
          content={item}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    );
  }, [content, onToggleFavorite]);

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <span className="text-gray-500 text-2xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
        <p className="text-gray-400 text-center max-w-md">
          Start adding content to build your second brain. Share from any app or upload directly.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={content.length}
            itemSize={ITEM_HEIGHT}
            overscanCount={5}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
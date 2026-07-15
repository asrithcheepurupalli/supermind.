import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedContent, FilterState } from '../types';
import ContentCard from './ContentCard';
import VirtualizedTimeline from './advanced/VirtualizedTimeline';
import { Search, Filter, SortDesc, Grid, List, Clock, Calendar, Star, TrendingUp, Zap, Eye, BarChart3, Layers, Sparkles, Target, Compass, Map, Route, Infinity, Brain, Network, Telescope, Microscope, Lightbulb, Puzzle, Magnet, Orbit, Waves, Globe, Database, Cpu, Activity, Heart, Coffee, Music, Camera, Video, Mic, FileText, Image, Link as LinkIcon, Headphones, Type, FileType, Tag, Bookmark, Archive, Share2, Download, Upload, Trash2, Edit3, EyeOff, Lock, Unlock, RefreshCw, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useStore } from '../store/useStore';

interface TimelineProps {
  content: SavedContent[];
  filter: FilterState;
  onToggleFavorite: (id: string) => void;
  onFilterChange: (filter: FilterState) => void;
}

export default function Timeline({ content, filter, onToggleFavorite, onFilterChange }: TimelineProps) {
  const { deleteContent, settings } = useStore();
  const [sortBy, setSortBy] = React.useState<'recent' | 'oldest' | 'favorites' | 'alphabetical'>('recent');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'masonry'>('grid');
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [groupBy, setGroupBy] = React.useState<'none' | 'date' | 'category' | 'type'>('none');
  
  const searchResults = useSearch(content, filter.searchQuery);

  const filteredContent = React.useMemo(() => {
    let filtered = filter.searchQuery ? searchResults.map(r => r.content) : content;

    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter(item => item.category === filter.category);
    }

    if (filter.contentType) {
      filtered = filtered.filter(item => item.contentType === filter.contentType);
    }

    if (filter.tags.length > 0) {
      filtered = filtered.filter(item => 
        filter.tags.some(tag => item.tags.includes(tag))
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'favorites':
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'alphabetical':
          return a.contentText.localeCompare(b.contentText);
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  }, [content, filter, sortBy, searchResults]);

  const groupedContent = React.useMemo(() => {
    if (groupBy === 'none') return { 'All Items': filteredContent };

    const groups: Record<string, SavedContent[]> = {};

    filteredContent.forEach(item => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'date':
          const date = new Date(item.timestamp);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (date.toDateString() === today.toDateString()) {
            groupKey = 'Today';
          } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = 'Yesterday';
          } else {
            groupKey = date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          }
          break;
        case 'category':
          groupKey = item.category.charAt(0).toUpperCase() + item.category.slice(1);
          break;
        case 'type':
          groupKey = item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1);
          break;
        default:
          groupKey = 'All Items';
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredContent, groupBy]);

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredContent.length 
        ? [] 
        : filteredContent.map(item => item.id)
    );
  };

  const stats = React.useMemo(() => {
    const total = filteredContent.length;
    const favorites = filteredContent.filter(c => c.isFavorite).length;
    const guides = filteredContent.filter(c => c.metadata?.isGuide).length;
    const types = filteredContent.reduce((acc, item) => {
      acc[item.contentType] = (acc[item.contentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, favorites, guides, types };
  }, [filteredContent]);

  const handleDismissAllGuides = () => {
    const guideIds = content.filter(c => c.metadata?.isGuide && c.metadata?.canDismiss).map(c => c.id);
    guideIds.forEach(id => deleteContent(id));
    toast.success(`Dismissed ${guideIds.length} guide${guideIds.length !== 1 ? 's' : ''}`);
  };

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-header p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1 
              key={filter.category}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-primary mb-2 flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: 999999999, ease: "linear" }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.theme === 'dark' ? 'bg-white' : 'bg-black'}`}
              >
                <Database className={settings.theme === 'dark' ? 'text-black' : 'text-white'} size={20} />
              </motion.div>
              {filter.category === 'all' ? 'Knowledge Base' : `${filter.category.charAt(0).toUpperCase() + filter.category.slice(1)}`}
            </motion.h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <BarChart3 size={14} className="text-secondary" />
                <span className="text-secondary">{stats.total} items</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-500" />
                <span className="text-secondary">{stats.favorites} favorites</span>
              </div>
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <Target size={14} />
                  <span className="text-secondary">{selectedItems.length} selected</span>
                </div>
              )}
              {stats.guides > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDismissAllGuides}
                  className="flex items-center gap-2 text-secondary hover:text-primary text-sm font-medium transition-colors duration-200"
                >
                  <Lightbulb size={14} />
                  <span>Dismiss all guides ({stats.guides})</span>
                </motion.button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4">
              {Object.entries(stats.types).slice(0, 3).map(([type, count]) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1 glass rounded-full text-xs"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-secondary">{type}: {count}</span>
                </motion.div>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              {[
                { mode: 'grid', icon: Grid, label: 'Grid' },
                { mode: 'list', icon: List, label: 'List' },
                { mode: 'masonry', icon: Layers, label: 'Masonry' },
              ].map(({ mode, icon: Icon, label }) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(mode as any)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === mode
                      ? settings.theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                      : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={label}
                >
                  <Icon size={16} />
                </motion.button>
              ))}
            </div>

            {/* Advanced Filters */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl glass hover:bg-white/10 transition-all duration-200 ${
                showFilters 
                  ? settings.theme === 'dark' ? 'text-white bg-white/20' : 'text-black bg-black/20'
                  : 'text-secondary'
              }`}
            >
              <Filter size={18} />
            </motion.button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 glass-input text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="favorites">Favorites First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Group By */}
                <div>
                  <label className="block text-primary font-medium mb-3">Group By</label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="w-full px-4 py-2 glass-input text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="none">No Grouping</option>
                    <option value="date">Date</option>
                    <option value="category">Category</option>
                    <option value="type">Content Type</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-primary font-medium mb-3">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 glass-input text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                    />
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 glass-input text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="block text-primary font-medium mb-3">Quick Filters</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Favorites', icon: Star, active: false },
                      { label: 'Recent', icon: Clock, active: false },
                      { label: 'Unread', icon: Eye, active: false },
                    ].map((quickFilter) => (
                      <motion.button
                        key={quickFilter.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                          quickFilter.active
                            ? settings.theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                            : 'glass-button text-secondary hover:text-primary'
                        }`}
                      >
                        <quickFilter.icon size={14} />
                        {quickFilter.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Actions */}
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between glass-card rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="text-emerald-500 hover:text-emerald-600 text-sm font-medium"
                >
                  {selectedItems.length === filteredContent.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-secondary text-sm">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {[
                  { icon: Star, label: 'Favorite', color: 'text-secondary hover:text-primary' },
                  { icon: Archive, label: 'Archive', color: 'text-secondary hover:text-primary' },
                  { icon: Share2, label: 'Share', color: 'text-secondary hover:text-primary' },
                  { icon: Download, label: 'Export', color: 'text-secondary hover:text-primary' },
                  { icon: Trash2, label: 'Delete', color: 'text-secondary hover:text-primary' },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg glass-button transition-all duration-200 ${action.color}`}
                    title={action.label}
                  >
                    <action.icon size={16} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden pb-16 sm:pb-0">
        {filteredContent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full p-8"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: 999999999, ease: "linear" },
                scale: { duration: 4, repeat: 999999999, ease: "easeInOut" }
              }}
              className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 ${
                settings.theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
              }`}
            >
              <Search className="text-secondary" size={48} />
            </motion.div>
            <h3 className="text-2xl font-bold text-primary mb-4">No items found</h3>
            <p className="text-secondary text-center max-w-md mb-8 leading-relaxed">
              {filter.searchQuery 
                ? `No results for "${filter.searchQuery}". Try adjusting your search terms or filters.`
                : 'Start building your knowledge base. Add content from any source and let AI organize it for you.'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange({ 
                category: 'all',
                contentType: '',
                tags: [],
                searchQuery: '',
                dateRange: undefined,
                sortBy: 'recent',
                viewMode: 'grid',
              })}
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg ${
                settings.theme === 'dark' 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {filter.searchQuery ? 'Clear Filters' : 'Add Your First Item'}
            </motion.button>
          </motion.div>
        ) : (
          <div className="p-6 h-full overflow-y-auto custom-scrollbar">
            {Object.entries(groupedContent).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-8">
                {groupBy !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <h2 className="text-xl font-bold text-primary">{groupName}</h2>
                    <div className={`flex-1 h-px bg-gradient-to-r ${settings.theme === 'dark' ? 'from-white/20' : 'from-black/20'} to-transparent`} />
                    <span className="text-secondary text-sm">{groupItems.length} items</span>
                  </motion.div>
                )}
                
                <motion.div 
                  layout
                  className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                      : viewMode === 'list'
                      ? 'grid-cols-1'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}
                >
                  <AnimatePresence>
                    {groupItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
                        whileHover={{ y: -5 }}
                        className={viewMode === 'masonry' ? `break-inside-avoid mb-6` : ''}
                      >
                        <ContentCard
                          content={item}
                          onToggleFavorite={onToggleFavorite}
                          isSelected={selectedItems.includes(item.id)}
                          onSelect={() => handleSelectItem(item.id)}
                          viewMode={viewMode === 'masonry' ? 'grid' : viewMode}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
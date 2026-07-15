import React from 'react';
import { motion } from 'framer-motion';
import {
  Grid3X3,
  FileText,
  GraduationCap,
  Heart,
  Briefcase,
  ShoppingBag,
  Link,
  Image,
  FileType,
  Video,
  Headphones,
  Type,
  Search,
  Settings,
  Star,
  Command,
  Shield,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { Category, FilterState } from '../types';
import { useStore } from '../store/useStore';
import SecurityBadge from './SecurityBadge';

interface SidebarProps {
  categories: Category[];
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const contentTypeIcons = {
  link: Link,
  image: Image,
  pdf: FileType,
  video: Video,
  audio: Headphones,
  text: Type,
};

const categoryIcons: Record<string, LucideIcon> = {
  Grid3X3,
  FileText,
  GraduationCap,
  Heart,
  Briefcase,
  ShoppingBag,
};

export default function Sidebar({
  categories,
  filter,
  onFilterChange,
  onClose,
  isMobile = false,
}: SidebarProps) {
  const { user, content, setSettingsModalOpen, settings, getSecurityScore, logout } = useStore();
  const securityScore = getSecurityScore();

  // Top tags derived from actual content.
  const topTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of content) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [content]);

  const handleCategorySelect = (categoryId: string) => {
    onFilterChange({ ...filter, category: categoryId });
  };

  const handleContentTypeSelect = (contentType: string) => {
    onFilterChange({
      ...filter,
      contentType: filter.contentType === contentType ? '' : contentType,
    });
  };

  const handleTagToggle = (tag: string) => {
    onFilterChange({
      ...filter,
      tags: filter.tags.includes(tag)
        ? filter.tags.filter(t => t !== tag)
        : [...filter.tags, tag],
    });
  };

  const handleLogout = () => {
    if (!window.confirm('Sign out? This clears your profile and all locally stored data on this device. Export a backup first if you want to keep your content.')) {
      return;
    }
    logout();
    if (isMobile) onClose?.();
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-80 h-screen glass-sidebar flex flex-col"
    >
      {/* Header */}
      <div className={`p-6 ${settings.theme === 'dark' ? 'border-b border-white/10' : 'border-b border-black/10'}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="logo-text">supermind.</h1>
          <div className="flex items-center gap-2">
            {settings.security.encryptionEnabled && (
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600" title="Encryption enabled">
                <Shield size={14} />
              </div>
            )}
            {isMobile ? (
              <button
                onClick={onClose}
                className="p-2 rounded-lg glass-button text-secondary hover:text-primary transition-all duration-200"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="p-2 rounded-lg glass-button text-secondary hover:text-primary transition-all duration-200"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Security Status */}
        {settings.security.encryptionEnabled && (
          <div className="mb-4">
            <SecurityBadge variant="compact" />
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search everything..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-primary placeholder-muted transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-muted text-xs">
            <Command size={12} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Categories */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Library</h2>
          <div className="space-y-2">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.icon] ?? FileText;
              const isActive = filter.category === category.id;

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    handleCategorySelect(category.id);
                    if (isMobile) onClose?.();
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 touch-manipulation ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={18} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      isActive
                        ? settings.theme === 'dark' ? 'bg-white/30' : 'bg-black/30'
                        : settings.theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                    }`}
                  >
                    {category.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Data Types */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Data Types</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(contentTypeIcons).map(([type, IconComponent], index) => {
              const isActive = filter.contentType === type;
              return (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    handleContentTypeSelect(type);
                    if (isMobile) onClose?.();
                  }}
                  className={`flex items-center gap-2 p-4 rounded-xl transition-all duration-200 touch-manipulation ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary'
                  }`}
                >
                  <IconComponent size={16} />
                  <span className="text-sm capitalize">{type}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Quick Filters</h3>
          <button
            onClick={() => {
              onFilterChange({ ...filter, favoritesOnly: !filter.favoritesOnly });
              if (isMobile) onClose?.();
            }}
            className={`w-full flex items-center gap-2 p-3 text-sm rounded-xl transition-all duration-200 touch-manipulation ${
              filter.favoritesOnly
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Star size={14} fill={filter.favoritesOnly ? 'currentColor' : 'none'} />
            Favorites Only
          </button>
        </div>

        {/* Tags */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Top Tags</h3>
          {topTags.length === 0 ? (
            <p className="text-muted text-sm">Tags appear here as you add content.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topTags.map((tag) => {
                const isActive = filter.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all duration-200 touch-manipulation ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40'
                        : 'text-secondary hover:text-primary glass-button'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-800/50">
        {/* Security Score */}
        {settings.security.encryptionEnabled && !isMobile && (
          <div className="mb-4 p-3 glass-button rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm">Security Score</span>
              <span className="text-emerald-600 font-semibold">{securityScore}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${securityScore}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-2 rounded-full ${settings.theme === 'dark' ? 'bg-white' : 'bg-black'}`}
              />
            </div>
          </div>
        )}

        {/* Mobile Settings Button */}
        {isMobile && (
          <button
            onClick={() => {
              setSettingsModalOpen(true);
              onClose?.();
            }}
            className="w-full flex items-center gap-3 p-4 glass-button rounded-xl transition-all duration-200 mb-4 touch-manipulation"
          >
            <Settings size={18} className="text-secondary" />
            <span className="text-primary font-medium">Settings</span>
          </button>
        )}

        {/* Profile & Logout */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-3 p-3 glass-button rounded-xl mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
              settings.theme === 'dark' ? 'bg-white' : 'bg-black'
            }`}>
              <span className={`font-bold ${settings.theme === 'dark' ? 'text-black' : 'text-white'}`}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-primary font-semibold truncate">{user?.name || 'User'}</div>
              {user?.email && <div className="text-secondary text-sm truncate">{user.email}</div>}
              <div className="flex items-center gap-2 mt-1">
                <div className={`text-xs px-2 py-0.5 rounded-full border ${
                  settings.theme === 'dark'
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-black/10 text-black border-black/20'
                }`}>
                  Local
                </div>
                {settings.security.encryptionEnabled && (
                  <div className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    settings.theme === 'dark'
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-black/10 text-black border-black/20'
                  }`}>
                    <Shield size={8} />
                    Encrypted
                  </div>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 border ${
              settings.theme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white'
                : 'bg-black/10 hover:bg-black/20 border-black/20 hover:border-black/30 text-black'
            }`}
          >
            <LogOut size={16} />
            <span className="font-medium">Sign Out & Clear Data</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

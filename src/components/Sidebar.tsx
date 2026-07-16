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
  X,
  ChevronRight,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { Category, FilterState } from '../types';
import { useStore } from '../store/useStore';
import { hapticTap } from '../utils/haptics';

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
  const { user, content, setSettingsModalOpen, settings, getSecurityScore, setActiveView, lock, isEncryptionSetup } = useStore();
  const securityScore = getSecurityScore();

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

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-72 h-screen bg-paper border-r-[1.5px] border-ink flex flex-col"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[var(--ink-line)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl tracking-tight text-ink">supermind</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </div>
          <div className="flex items-center gap-1.5">
            {settings.security.encryptionEnabled && (
              <span className="stamp !py-0.5 !px-1.5 text-[8px] text-accent" title="Encryption enabled">sealed</span>
            )}
            {isMobile ? (
              <button onClick={onClose} className="btn-paper haptic p-1.5 rounded-sm" aria-label="Close">
                <X size={15} />
              </button>
            ) : (
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="btn-paper haptic p-1.5 rounded-sm"
                aria-label="Settings"
              >
                <Settings size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={14} />
          <input
            type="text"
            placeholder="Search everything..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            className="bare-input w-full pl-9 pr-3 py-2 bg-paper-raised border-[1.5px] border-ink rounded-sm text-sm text-ink placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      {/* Scrollable index */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Categories */}
        <div className="px-5 py-5">
          <div className="font-label text-[9px] text-ink-faint mb-3">index</div>
          <div className="space-y-0.5">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.icon] ?? FileText;
              const isActive = filter.category === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    hapticTap();
                    onFilterChange({ ...filter, category: category.id });
                    if (isMobile) onClose?.();
                  }}
                  className={`haptic w-full flex items-center justify-between py-2 pl-3 pr-2 rounded-sm border-l-[3px] transition-colors ${
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-transparent hover:bg-[var(--accent-soft)]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <IconComponent size={14} className={isActive ? 'text-accent' : 'text-ink-faint'} />
                    <span className={`font-display text-lg leading-none truncate ${isActive ? 'text-ink' : 'text-ink-soft'}`}>
                      {category.name}
                    </span>
                  </span>
                  <span className="font-label text-[9px] text-ink-faint tabular-nums">{category.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data types */}
        <div className="px-5 pb-5">
          <div className="font-label text-[9px] text-ink-faint mb-3">by type</div>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(contentTypeIcons).map(([type, IconComponent]) => {
              const isActive = filter.contentType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    hapticTap();
                    onFilterChange({ ...filter, contentType: isActive ? '' : type });
                    if (isMobile) onClose?.();
                  }}
                  className={`haptic flex flex-col items-center gap-1 py-2 border-[1.5px] rounded-sm transition-colors ${
                    isActive
                      ? 'border-ink bg-ink text-paper'
                      : 'border-[var(--ink-line)] bg-paper-raised text-ink-soft hover:border-ink'
                  }`}
                >
                  <IconComponent size={13} />
                  <span className="font-label text-[8px]">{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Starred */}
        <div className="px-5 pb-5">
          <button
            onClick={() => {
              hapticTap();
              onFilterChange({ ...filter, favoritesOnly: !filter.favoritesOnly });
              if (isMobile) onClose?.();
            }}
            className={`haptic w-full flex items-center gap-2.5 py-2 px-3 border-[1.5px] rounded-sm transition-colors ${
              filter.favoritesOnly
                ? 'border-ink bg-[var(--highlight)]'
                : 'border-[var(--ink-line)] bg-paper-raised hover:border-ink'
            }`}
          >
            <Star size={13} className={filter.favoritesOnly ? 'text-ink' : 'text-ink-faint'} fill={filter.favoritesOnly ? 'currentColor' : 'none'} />
            <span className="font-label text-[10px] text-ink">starred only</span>
          </button>
        </div>

        {/* Tags */}
        <div className="px-5 pb-5">
          <div className="font-label text-[9px] text-ink-faint mb-3">top tags</div>
          {topTags.length === 0 ? (
            <p className="font-display italic text-sm text-ink-faint">tags appear as you write…</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {topTags.map((tag) => {
                const isActive = filter.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      hapticTap();
                      onFilterChange({
                        ...filter,
                        tags: isActive ? filter.tags.filter(t => t !== tag) : [...filter.tags, tag],
                      });
                    }}
                    className={`haptic font-label text-[9px] px-2 py-1 rounded-sm border transition-colors ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-accent'
                        : 'border-[var(--ink-line)] text-ink-soft hover:border-ink hover:text-ink'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t-[1.5px] border-ink">
        {settings.security.encryptionEnabled && !isMobile && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-label text-[9px] text-ink-faint">security</span>
              <span className="font-label text-[9px] text-accent tabular-nums">{securityScore}%</span>
            </div>
            <div className="w-full h-[5px] border border-ink rounded-full overflow-hidden bg-paper-raised">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${securityScore}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-accent"
              />
            </div>
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => {
              setSettingsModalOpen(true);
              onClose?.();
            }}
            className="btn-paper haptic w-full flex items-center justify-center gap-2 py-2.5 rounded-sm mb-3 font-label text-[10px]"
          >
            <Settings size={13} /> settings
          </button>
        )}

        <button
          onClick={() => { setActiveView('profile'); onClose?.(); }}
          className="haptic w-full flex items-center gap-3 group text-left rounded-sm -mx-1 px-1 py-1 hover:bg-[var(--accent-soft)]/40 transition-colors"
          title="Open your page"
        >
          <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-display text-lg flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg leading-tight text-ink truncate">{user?.name || 'User'}</div>
            <div className="font-label text-[8px] text-ink-faint truncate">
              {user?.email || 'local profile'}
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-faint group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </button>

        {settings.security.encryptionEnabled && isEncryptionSetup && (
          <button
            onClick={() => lock()}
            className="btn-paper haptic w-full flex items-center justify-center gap-2 py-2.5 rounded-sm font-label text-[10px] mt-3"
          >
            <Lock size={12} />
            lock the notebook
          </button>
        )}
      </div>
    </motion.div>
  );
}

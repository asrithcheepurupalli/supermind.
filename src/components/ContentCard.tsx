import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileType, 
  Video, 
  Headphones,
  Type,
  Clock,
  Star,
  ExternalLink,
  Calendar,
  Tag,
  MoreHorizontal,
  Share,
  Copy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Bookmark,
  Archive,
  Download,
  Zap,
  Brain,
  Sparkles,
  Target,
  Heart,
  Coffee,
  Music,
  Camera,
  Mic,
  Globe,
  Database,
  Cpu,
  Network,
  Activity,
  TrendingUp,
  BarChart3,
  Layers,
  Compass,
  Map,
  Route,
  Infinity,
  Telescope,
  Microscope,
  Lightbulb,
  Puzzle,
  Magnet,
  Orbit,
  Waves,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SavedContent } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';
import InteractiveGuide from './InteractiveGuide';

interface ContentCardProps {
  content: SavedContent;
  onToggleFavorite: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  viewMode?: 'grid' | 'list';
}

const contentTypeIcons = {
  link: LinkIcon,
  image: ImageIcon,
  pdf: FileType,
  video: Video,
  audio: Headphones,
  text: Type,
};

const contentTypeColors = {
  link: 'from-blue-500 to-cyan-500',
  image: 'from-green-500 to-emerald-500',
  pdf: 'from-red-500 to-pink-500',
  video: 'from-purple-500 to-violet-500',
  audio: 'from-orange-500 to-yellow-500',
  text: 'from-gray-500 to-slate-500',
};

const contentTypeGradients = {
  link: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20',
  image: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20',
  pdf: 'bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20',
  video: 'bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20',
  audio: 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20',
  text: 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20',
};

export default function ContentCard({ 
  content, 
  onToggleFavorite, 
  isSelected = false, 
  onSelect,
  viewMode = 'grid' 
}: ContentCardProps) {
  const { deleteContent } = useStore();
  const [showActions, setShowActions] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const IconComponent = contentTypeIcons[content.contentType];
  const gradientClasses = contentTypeGradients[content.contentType];
  const colorGradient = contentTypeColors[content.contentType];

  const formatTimeAgo = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'unknown time';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content.contentText);
    toast.success('Content copied to clipboard');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content.contentText.slice(0, 50) + '...',
        text: content.summary,
        url: content.fileUrl,
      });
    } else {
      handleCopy();
    }
  };

  const handleDismissGuide = () => {
    if (content.metadata?.isGuide && content.metadata?.canDismiss) {
      deleteContent(content.id);
      toast.success('Guide dismissed! You can always revisit guides in settings.');
    }
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const wordCount = content.contentText.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  // If this is a guide, render the interactive guide component
  if (content.metadata?.isGuide) {
    return (
      <InteractiveGuide
        content={content}
        onComplete={() => {
          toast.success('🎉 Guide completed! Great job!');
          deleteContent(content.id);
        }}
        onDismiss={handleDismissGuide}
      />
    );
  }

  const cardContent = (
    <>
      {/* Selection Overlay */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Selection Checkbox */}
      {onSelect && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isSelected || isHovered ? 1 : 0,
            opacity: isSelected || isHovered ? 1 : 0
          }}
          className="absolute top-4 left-4 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'glass border border-white/20 text-gray-400 hover:text-white'
            }`}
          >
            {isSelected && <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-white"
            >
              ✓
            </motion.div>}
          </motion.button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-xl border ${gradientClasses} backdrop-blur-sm flex-shrink-0`}
          >
            <IconComponent size={20} className="text-white" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="text-primary font-semibold text-sm lg:text-base truncate">
              {content.sourceApp}
            </div>
            <div className="text-secondary text-xs lg:text-sm flex items-center gap-2">
              <Clock size={12} />
              <span>{formatTimeAgo(content.timestamp)}</span>
              {content.contentType === 'text' && (
                <>
                  <span>•</span>
                  <span>{getReadingTime()} min read</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* AI Confidence Badge */}
          {content.aiGenerated?.confidence && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 glass-button rounded-full text-xs"
            >
              <Brain size={10} className="text-purple-400" />
              <span className="text-purple-500">{content.aiGenerated.confidence}%</span>
            </motion.div>
          )}

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(content.id);
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              content.isFavorite
                ? 'text-primary bg-black/10 dark:bg-white/10'
                : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Star size={16} fill={content.isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
          
          {/* Actions Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <MoreHorizontal size={16} />
            </motion.button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 glass-card rounded-xl p-2 min-w-[180px] z-30 shadow-premium"
                >
                  {[
                    { icon: Eye, label: 'Preview', action: () => setShowPreview(true), danger: false },
                    { icon: Share, label: 'Share', action: handleShare, danger: false },
                    { icon: Copy, label: 'Copy', action: handleCopy, danger: false },
                    { icon: Download, label: 'Download', action: () => {}, danger: false },
                    { icon: Edit, label: 'Edit', action: () => {}, danger: false },
                    { icon: Archive, label: 'Archive', action: () => {}, danger: false },
                    { icon: Trash2, label: content.metadata?.isGuide ? 'Dismiss Guide' : 'Delete', action: content.metadata?.isGuide ? handleDismissGuide : () => {}, danger: true },
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.action();
                        setShowActions(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                        action.danger
                          ? 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                          : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <action.icon size={14} />
                      {action.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      {content.fileUrl && (content.contentType === 'image' || content.contentType === 'video') && (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="mb-4 rounded-xl overflow-hidden relative group"
        >
          <img
            src={content.fileUrl}
            alt={content.contentText}
            className={`w-full object-cover transition-all duration-300 ${
              viewMode === 'list' ? 'h-24 lg:h-32' : 'h-40 lg:h-48'
            }`}
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4"
          >
            <div className="flex items-center gap-2 text-white text-sm">
              {content.contentType === 'video' && <Video size={14} />}
              {content.contentType === 'image' && <Camera size={14} />}
              <span className="font-medium">View Full Size</span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Text Content */}
      <div className="mb-4">
        <motion.p 
          className={`text-primary leading-relaxed mb-3 text-sm lg:text-base ${
            viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
          }`}
        >
          {content.contentText}
        </motion.p>
        <motion.p 
          className={`text-secondary text-xs lg:text-sm leading-relaxed ${
            viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'
          }`}
        >
          {content.summary}
        </motion.p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {content.tags.slice(0, viewMode === 'list' ? 3 : 5).map((tag, index) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-1 px-3 py-1 glass-button rounded-full text-xs hover:border-emerald-500/30 transition-all duration-200 cursor-pointer bg-gradient-to-r ${colorGradient}/10`}
          >
            <Tag size={10} />
            {tag}
          </motion.span>
        ))}
        {content.tags.length > (viewMode === 'list' ? 3 : 5) && (
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-muted text-xs px-2 py-1 glass-button rounded-full cursor-pointer hover:text-secondary transition-colors duration-200"
          >
            +{content.tags.length - (viewMode === 'list' ? 3 : 5)} more
          </motion.span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {content.reminderDate && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 text-emerald-500 text-xs lg:text-sm glass-button px-2 py-1 rounded-full"
            >
              <Calendar size={12} />
              <span>Reminder</span>
            </motion.div>
          )}
          <div className="text-muted text-xs lg:text-sm capitalize flex items-center gap-1">
            <Layers size={12} />
            {content.category}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {content.contentType === 'link' && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 text-secondary hover:text-primary text-xs lg:text-sm transition-colors px-2 py-1 glass-button rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ExternalLink size={12} />
              Open
            </motion.button>
          )}
          
          {/* Engagement Indicators */}
          <div className="flex items-center gap-1">
            {content.metadata?.readingTime && (
              <div className="flex items-center gap-1 text-muted text-xs">
                <Clock size={10} />
                <span>{content.metadata.readingTime}m</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Content Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-secondary leading-relaxed">
                {content.contentText}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <motion.div
      layout
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect?.()}
      className={`
        group relative glass-dark border border-white/10 rounded-2xl p-6 
        hover:border-white/20 transition-all duration-300 cursor-pointer
        hover:shadow-2xl hover:shadow-black/20
        ${isSelected ? 'ring-2 ring-emerald-500/50' : ''}
        ${viewMode === 'list' ? 'flex gap-6 items-start' : ''}
      `}
      style={{
        background: isHovered 
          ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`
          : undefined
      }}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${colorGradient.replace('from-', 'rgba(').replace('to-', 'rgba(').replace('-500', ', 0.05)').replace('-500', ', 0.02)')} 0%, transparent 100%)`
        }}
      />

      {viewMode === 'list' ? (
        <>
          {content.fileUrl && (content.contentType === 'image' || content.contentType === 'video') && (
            <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={content.fileUrl}
                alt={content.contentText}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 relative">
            {cardContent}
          </div>
        </>
      ) : (
        <div className="relative">
          {cardContent}
        </div>
      )}
    </motion.div>
  );
}
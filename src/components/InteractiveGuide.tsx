import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Target, Zap, Brain, Search, Plus, Filter, BarChart3, Shield, X, Trophy, Rocket, Wand2, Clock } from 'lucide-react';
import { SavedContent } from '../types';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface InteractiveGuideProps {
  content: SavedContent;
  onComplete: () => void;
  onDismiss: () => void;
}

const guideConfigs = {
  1: {
    title: "Welcome to Your AI-Powered Second Brain! 🧠",
    subtitle: "Let's start your knowledge journey",
    color: "from-emerald-500 to-blue-500",
    icon: Brain,
    tasks: [
      { id: 'explore', label: 'Explore the interface', icon: Target, completed: false },
      { id: 'understand', label: 'Understand AI features', icon: Sparkles, completed: false },
      { id: 'ready', label: 'Ready to add content', icon: Rocket, completed: false }
    ],
    interactive: {
      type: 'pulse-demo',
      elements: ['sidebar', 'search', 'add-button']
    }
  },
  2: {
    title: "Master Content Creation 📝",
    subtitle: "Add anything, anywhere, anytime",
    color: "from-purple-500 to-pink-500",
    icon: Plus,
    tasks: [
      { id: 'find-button', label: 'Find the + button', icon: Target, completed: false },
      { id: 'try-shortcut', label: 'Try Cmd/Ctrl+N', icon: Zap, completed: false },
      { id: 'add-content', label: 'Add your first item', icon: CheckCircle, completed: false }
    ],
    interactive: {
      type: 'highlight-demo',
      target: 'add-button',
      action: 'click'
    }
  },
  3: {
    title: "Unlock Smart Search 🔍",
    subtitle: "Find anything with AI-powered queries",
    color: "from-cyan-500 to-blue-500",
    icon: Search,
    tasks: [
      { id: 'try-search', label: 'Try the search bar', icon: Search, completed: false },
      { id: 'natural-query', label: 'Use natural language', icon: Brain, completed: false },
      { id: 'use-filters', label: 'Explore filters', icon: Filter, completed: false }
    ],
    interactive: {
      type: 'search-demo',
      examples: ['health articles', 'productivity tips', 'last week content']
    }
  },
  4: {
    title: "AI Organization Magic 🏷️",
    subtitle: "Watch AI organize everything automatically",
    color: "from-orange-500 to-red-500",
    icon: Sparkles,
    tasks: [
      { id: 'see-tags', label: 'See auto-generated tags', icon: Target, completed: false },
      { id: 'explore-categories', label: 'Explore categories', icon: BarChart3, completed: false },
      { id: 'customize', label: 'Add custom tags', icon: Wand2, completed: false }
    ],
    interactive: {
      type: 'tag-demo',
      showAnimation: true
    }
  },
  5: {
    title: "Discover Your Patterns 📊",
    subtitle: "Unlock insights about your knowledge",
    color: "from-indigo-500 to-purple-500",
    icon: BarChart3,
    tasks: [
      { id: 'visit-analytics', label: 'Visit Analytics tab', icon: BarChart3, completed: false },
      { id: 'see-patterns', label: 'Discover patterns', icon: Target, completed: false },
      { id: 'optimize', label: 'Optimize workflow', icon: Zap, completed: false }
    ],
    interactive: {
      type: 'analytics-preview',
      showCharts: true
    }
  },
  6: {
    title: "Your Privacy, By Design 🔐",
    subtitle: "Local-first storage with optional encryption at rest",
    color: "from-green-500 to-emerald-500",
    icon: Shield,
    tasks: [
      { id: 'understand-encryption', label: 'Understand encryption at rest', icon: Shield, completed: false },
      { id: 'local-ai', label: 'Learn about on-device processing', icon: Brain, completed: false },
      { id: 'setup-security', label: 'Review Settings → Security', icon: CheckCircle, completed: false }
    ],
    interactive: {
      type: 'security-demo',
      showEncryption: true
    }
  }
};

export default function InteractiveGuide({ content, onComplete, onDismiss }: InteractiveGuideProps) {
  const { setUploadModalOpen, settings, content: allContent } = useStore();
  const [completedTasks, setCompletedTasks] = React.useState<string[]>([]);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const guideStep = content.metadata?.guideStep || 1;
  const config = guideConfigs[guideStep as keyof typeof guideConfigs];

  React.useEffect(() => {
    const completed = completedTasks.length;
    const total = config.tasks.length;
    setProgress((completed / total) * 100);

    if (completed === total && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onComplete();
      }, 3000);
    }
  }, [completedTasks, config.tasks.length, showCelebration, onComplete]);

  const handleTaskComplete = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
      toast.success('Task completed! 🎉');
    }
  };

  const handleInteractiveAction = (action: string) => {
    switch (action) {
      case 'add-content':
        setUploadModalOpen(true);
        handleTaskComplete('add-content');
        break;
      case 'try-search': {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          handleTaskComplete('try-search');
        }
        break;
      }
      case 'visit-analytics':
        handleTaskComplete('visit-analytics');
        break;
      default:
        handleTaskComplete(action);
    }
  };

  const renderInteractiveDemo = () => {
    switch (config.interactive.type) {
      case 'pulse-demo':
        return (
          <div className="interactive-demo relative h-48 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: 999999999 }}
              className="absolute top-4 right-4 w-12 h-12 bg-emerald-500/30 rounded-full"
            />
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 3, repeat: 999999999 }}
              className="absolute top-4 left-4 w-8 h-32 bg-blue-500/30 rounded-lg"
            />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: 999999999 }}
              className="absolute top-16 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-purple-500/30 rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: 999999999, ease: "linear" }}
                className="text-emerald-500"
              >
                <Brain size={32} />
              </motion.div>
            </div>
          </div>
        );

      case 'highlight-demo':
        return (
          <div className="interactive-demo relative h-48 overflow-hidden flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleInteractiveAction('add-content')}
              className="relative w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-premium"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                  "0 0 40px rgba(16, 185, 129, 0.6)",
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                ]
              }}
              transition={{ duration: 2, repeat: 999999999 }}
            >
              <Plus className="text-white" size={24} />
              <motion.div
                className="absolute -inset-2 border-2 border-emerald-400 rounded-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: 999999999 }}
              />
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-emerald-500 text-sm font-medium"
            >
              Click me to add content!
            </motion.div>
          </div>
        );

      case 'search-demo':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Try: 'health articles from last week'"
                onClick={() => handleTaskComplete('try-search')}
                className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-primary placeholder-muted transition-all duration-200"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {('examples' in config.interactive ? config.interactive.examples : []).map((example: string, index: number) => (
                <motion.button
                  key={example}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleTaskComplete('natural-query')}
                  className="px-3 py-1 glass-button border border-emerald-500/30 text-emerald-600 rounded-full text-sm hover:bg-emerald-500/10 transition-all duration-200"
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'tag-demo':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {['productivity', 'health', 'ai', 'learning'].map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-600 text-sm"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: 999999999, ease: "linear" }}
                  >
                    <Sparkles size={12} />
                  </motion.div>
                  {tag}
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center text-secondary text-sm"
            >
              ✨ AI automatically generated these tags!
            </motion.div>
          </div>
        );

      case 'analytics-preview':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Items Added', value: String(allContent.length), color: 'text-emerald-600' },
                { label: 'Categories', value: String(new Set(allContent.map(c => c.category)).size), color: 'text-blue-600' },
                { label: 'Favorites', value: String(allContent.filter(c => c.isFavorite).length), color: 'text-yellow-600' },
                { label: 'Unique Tags', value: String(new Set(allContent.flatMap(c => c.tags)).size), color: 'text-purple-600' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="glass-button rounded-xl p-3 text-center"
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-secondary text-xs">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTaskComplete('visit-analytics')}
              className="w-full py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-600 rounded-xl hover:bg-indigo-500/30 transition-all duration-200"
            >
              View Full Analytics Dashboard
            </motion.button>
          </div>
        );

      case 'security-demo':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Shield className="text-emerald-500" size={48} />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: 999999999 }}
                  className="absolute inset-0 bg-emerald-400/20 rounded-full"
                />
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: Shield, label: 'AES-256 encryption at rest (optional)', status: 'active' },
                { icon: Brain, label: 'On-device processing only', status: 'active' },
                { icon: Target, label: 'No servers, no accounts, no tracking', status: 'active' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className="flex items-center gap-3 p-2 glass-button rounded-lg"
                >
                  <feature.icon className="text-emerald-500" size={16} />
                  <span className="text-primary text-sm">{feature.label}</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: 999999999, delay: index * 0.5 }}
                    className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative guide-card rounded-3xl p-8 overflow-hidden"
    >
      {/* Animated Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5`}
        animate={{ 
          background: [
            `linear-gradient(135deg, ${config.color.replace('from-', 'rgba(').replace('to-', 'rgba(').replace('-500', ', 0.05)').replace('-500', ', 0.02)')} 0%, transparent 100%)`,
            `linear-gradient(225deg, ${config.color.replace('from-', 'rgba(').replace('to-', 'rgba(').replace('-500', ', 0.08)').replace('-500', ', 0.03)')} 0%, transparent 100%)`,
            `linear-gradient(135deg, ${config.color.replace('from-', 'rgba(').replace('to-', 'rgba(').replace('-500', ', 0.05)').replace('-500', ', 0.02)')} 0%, transparent 100%)`
          ]
        }}
        transition={{ duration: 4, repeat: 999999999 }}
      />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: 999999999,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center shadow-premium`}
            >
              <config.icon className="text-white" size={28} />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-primary mb-2"
              >
                {config.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-secondary"
              >
                {config.subtitle}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              className="guide-step-badge flex items-center gap-2 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="text-white" size={16} />
              <span className="text-white text-sm font-medium">
                Step {guideStep}/6
              </span>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="dismiss-button p-2 rounded-lg transition-all duration-200"
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="guide-progress-bar w-full h-3 rounded-full">
            <motion.div
              className="guide-progress-fill h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <motion.div
            className="absolute -top-1 bg-white w-4 h-4 rounded-full shadow-lg border-2 border-emerald-500"
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="relative z-10 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {renderInteractiveDemo()}
        </motion.div>
      </div>

      {/* Tasks Checklist */}
      <div className="relative z-10 space-y-4">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Target className="text-emerald-500" size={20} />
          Complete These Tasks:
        </h3>
        
        {config.tasks.map((task, index) => {
          const isCompleted = completedTasks.includes(task.id);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`task-item flex items-center gap-4 p-4 rounded-xl ${
                isCompleted ? 'completed' : ''
              }`}
            >
              <motion.div
                animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : settings.theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={16} />
                ) : (
                  <task.icon size={16} />
                )}
              </motion.div>
              
              <span className={`flex-1 ${isCompleted ? 'text-emerald-600 line-through' : 'text-primary'}`}>
                {task.label}
              </span>
              
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-500"
                >
                  ✨
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex items-center justify-between mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCompletedTasks(config.tasks.map(t => t.id))}
          className="flex items-center gap-2 px-4 py-2 glass-button text-secondary hover:text-primary rounded-xl transition-all duration-200"
        >
          <Zap size={16} />
          Skip Guide
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          disabled={progress < 100}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            progress === 100
              ? `btn-primary shadow-premium`
              : settings.theme === 'dark' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {progress === 100 ? (
            <>
              <Trophy size={16} />
              Complete Guide
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <Clock size={16} />
              {Math.round(progress)}% Complete
            </>
          )}
        </motion.button>
      </div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-center"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.3 }}
                className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="text-white" size={40} />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">Congratulations! 🎉</h3>
              <p className="text-gray-300">You've mastered this guide!</p>
              
              {/* Confetti */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    rotate: 0 
                  }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 2,
                    ease: "easeOut"
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
import React from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Plus, BarChart3, Menu, X, Search, Command, Bell, Settings, User, Zap, Brain, Shield, Star, Filter, Grid, List, Calendar, Tag, TrendingUp, Activity, Clock, Bookmark, Archive, Share2, Download, Upload, Trash2, Edit3, Eye, EyeOff, Lock, Unlock, RefreshCw, ChevronDown, ChevronRight, Layers, Sparkles, Globe, Database, Cpu, Network, Infinity, Telescope, Microscope, Compass, Map, Route, Puzzle, Magnet, Orbit, Waves, Target, Rocket, Heart, Coffee, Lightbulb, Palette, Code, Music, Camera, Video, Mic, FileText, Image, Link as LinkIcon, Headphones, Type, FileType, LogOut, Grid3X3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from './utils/auth';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/advanced/SettingsModal';
import EncryptionSetup from './components/EncryptionSetup';
import SecurityBadge from './components/SecurityBadge';
import AnalyticsDashboard from './components/advanced/AnalyticsDashboard';
import Toast from './components/ui/Toast';
import OAuthCallback from './components/OAuthCallback';
import AboutPage from './components/AboutPage';
import { useStore } from './store/useStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const { scrollY } = useScroll();
  const {
    user,
    isAuthenticated,
    isEncryptionSetup,
    isEncryptionModalOpen,
    setEncryptionModalOpen,
    setupEncryption,
    unlockEncryption,
    content,
    categories,
    filter,
    isUploadModalOpen,
    setUploadModalOpen,
    setUser,
    addContent,
    toggleFavorite,
    setFilter,
    settings,
    setSettingsModalOpen,
  } = useStore();

  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);
  const [showLanding, setShowLanding] = React.useState(!isAuthenticated);
  const [showAbout, setShowAbout] = React.useState(false);
  const [needsEncryptionUnlock, setNeedsEncryptionUnlock] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState<'home' | 'timeline' | 'analytics' | 'search' | 'profile'>('home');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [quickActions, setQuickActions] = React.useState(false);
  const [showWelcome, setShowWelcome] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Handle OAuth callbacks
  React.useEffect(() => {
    const path = window.location.pathname;
    const callbackMatch = path.match(/^\/auth\/callback\/(.+)$/);
    
    if (callbackMatch) {
      const provider = callbackMatch[1];
      return;
    }
    
    if (path === '/about') {
      setShowAbout(true);
      setShowLanding(false);
    }
  }, []);

  // Apply theme
  React.useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const handleAuth = (email: string, password: string, name?: string) => {
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      name: name || email.split('@')[0],
      subscription: 'free' as const,
      encryptionEnabled: false,
    };
    setUser(newUser);
    toast.success(`Welcome ${newUser.name}! 🎉`);
  };

  const handleNewTag = (tag: string) => {
    console.log('New tag added:', tag);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };
  
  const handleShowAbout = () => {
    setShowAbout(true);
    setShowLanding(false);
    window.history.pushState({}, '', '/about');
  };
  
  const handleBackFromAbout = () => {
    setShowAbout(false);
    setShowLanding(true);
    window.history.pushState({}, '', '/');
  };

  const handleEncryptionSetup = async (password: string) => {
    try {
      await setupEncryption(password);
      setEncryptionModalOpen(false);
    } catch (error) {
      console.error('Encryption setup failed:', error);
    }
  };

  const handleEncryptionUnlock = async (password: string) => {
    const success = await unlockEncryption(password);
    if (success) {
      setNeedsEncryptionUnlock(false);
    }
    return success;
  };

  React.useEffect(() => {
    if (isAuthenticated && user?.encryptionEnabled && !isEncryptionSetup) {
      setNeedsEncryptionUnlock(true);
    }
  }, [isAuthenticated, user?.encryptionEnabled, isEncryptionSetup]);

  // Transform values for parallax effects
  const headerY = useTransform(scrollY, [0, 300], [0, -50]);

  const path = window.location.pathname;
  const callbackMatch = path.match(/^\/auth\/callback\/(.+)$/);
  
  if (callbackMatch) {
    const provider = callbackMatch[1];
    return <OAuthCallback provider={provider} />;
  }

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} onAbout={handleShowAbout} />;
  }
  
  if (showAbout) {
    return <AboutPage onBack={handleBackFromAbout} />;
  }

  if (needsEncryptionUnlock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <EncryptionSetup 
            onComplete={handleEncryptionUnlock} 
            isLogin={true}
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthModal
          isLogin={isLogin}
          onToggle={() => setIsLogin(!isLogin)}
          onAuth={handleAuth}
        />
        <Toast />
      </>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${settings.theme === 'dark' ? 'dark bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Minimal Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 50, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${
            settings.theme === 'dark' 
              ? 'bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5' 
              : 'bg-gradient-to-br from-emerald-500/3 via-blue-500/3 to-purple-500/3'
          }`}
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute top-40 -left-40 w-96 h-96 rounded-full blur-3xl ${
            settings.theme === 'dark'
              ? 'bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5'
              : 'bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-orange-500/3'
          }`}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 backdrop-blur-sm z-40 lg:hidden ${
                settings.theme === 'dark' ? 'bg-black/60' : 'bg-white/60'
              }`}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <Sidebar
                categories={categories}
                filter={filter}
                onFilterChange={(newFilter) => {
                  setFilter(newFilter);
                  setIsMobileSidebarOpen(false);
                }}
                onNewTag={handleNewTag}
                onClose={() => setIsMobileSidebarOpen(false)}
                isMobile={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          categories={categories}
          filter={filter}
          onFilterChange={setFilter}
          onNewTag={handleNewTag}
        />
      </div>
      
      <div className="flex-1 flex flex-col relative">
        {/* Advanced Header */}
        <motion.div
          style={{ y: headerY }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-header p-4 lg:p-6 relative z-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl glass-button text-secondary hover:text-primary transition-all duration-200"
              >
                <Menu size={20} />
              </motion.button>
              
              {/* Advanced Search */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    width: searchFocused ? 400 : 300,
                    scale: searchFocused ? 1.02 : 1
                  }}
                  className="relative"
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search everything with AI..."
                    value={filter.searchQuery}
                    onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-12 pr-16 py-3 glass-input rounded-xl text-primary placeholder-muted transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <div className={`hidden sm:flex items-center gap-1 text-muted text-xs px-2 py-1 rounded-md ${
                      settings.theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-200/50'
                    }`}>
                      <Command size={10} />
                      <span>K</span>
                    </div>
                    {filter.searchQuery && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setFilter({ ...filter, searchQuery: '' })}
                        className="text-muted hover:text-primary"
                      >
                        <X size={14} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center gap-1 glass-button rounded-xl p-1">
                {[
                  { id: 'timeline', icon: Clock, label: 'Timeline' },
                  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                  { id: 'insights', icon: Brain, label: 'Insights' },
                  { id: 'search', icon: Telescope, label: 'Explore' },
                ].map((view) => {
                  const IconComponent = view.icon;
                  return (
                    <motion.button
                      key={view.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveView(view.id as any)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                        activeView === view.id && view.id === 'timeline'
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                        : activeView === view.id
                          ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                          : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <IconComponent size={16} />
                      <span className="hidden lg:block">{view.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-4 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <Database size={14} />
                  <span>{content.length} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} />
                  <span>{content.filter(c => c.isFavorite).length}</span>
                </div>
                {settings.security.encryptionEnabled && (
                  <div className="flex items-center gap-2">
                    <Shield size={14} />
                    <span>Encrypted</span>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifications(!notifications)}
                  className="p-2 rounded-xl glass-button text-secondary hover:text-primary transition-all duration-200 relative"
                >
                  <Bell size={18} />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-black dark:bg-white rounded-full"
                  />
                </motion.button>

                <AnimatePresence>
                  {notifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-80 glass-card rounded-2xl p-4 shadow-premium z-50"
                    >
                      <h3 className="text-primary font-semibold mb-3">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 glass-button rounded-xl">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                          <div>
                            <p className="text-primary text-sm">AI processed 5 new items</p>
                            <p className="text-muted text-xs">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 glass-button rounded-xl">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <div>
                            <p className="text-primary text-sm">Weekly summary ready</p>
                            <p className="text-muted text-xs">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Actions */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuickActions(!quickActions)}
                  className="p-2 rounded-xl glass-button text-secondary hover:text-primary transition-all duration-200"
                >
                  <Zap size={18} />
                </motion.button>

                <AnimatePresence>
                  {quickActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-64 glass-card rounded-2xl p-4 shadow-premium z-50"
                    >
                      <h3 className="text-primary font-semibold mb-3">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: Plus, label: 'Add Content', action: () => setUploadModalOpen(true) },
                          { icon: Camera, label: 'Capture', action: () => {} },
                          { icon: Mic, label: 'Record', action: () => {} },
                          { icon: Download, label: 'Export', action: () => {} },
                        ].map((action, index) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              action.action();
                              setQuickActions(false);
                            }}
                            className="flex flex-col items-center gap-2 p-3 glass-button rounded-xl transition-all duration-200"
                          >
                            <action.icon size={18} className="text-emerald-400" />
                            <span className="text-primary text-xs">{action.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-lg ${
                    settings.theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                  }`}
                >
                  {user?.name?.[0] || 'U'}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Active Filters Bar */}
          <AnimatePresence>
            {(filter.contentType || filter.tags.length > 0 || filter.category !== 'all') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex flex-wrap gap-2 mt-4 pt-4 border-t ${
                  settings.theme === 'dark' ? 'border-white/10' : 'border-black/10'
                }`}
              >
                {filter.category !== 'all' && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 glass-button rounded-full text-emerald-600 text-sm border border-emerald-500/30"
                  >
                    Category: {filter.category}
                    <button
                      onClick={() => setFilter({ ...filter, category: 'all' })}
                      className="hover:text-emerald-500"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                )}
                {filter.contentType && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 glass-button rounded-full text-blue-600 text-sm border border-blue-500/30"
                  >
                    Type: {filter.contentType}
                    <button
                      onClick={() => setFilter({ ...filter, contentType: '' })}
                      className="hover:text-blue-500"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                )}
                {filter.tags.map(tag => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 glass-button rounded-full text-purple-600 text-sm border border-purple-500/30"
                  >
                    Tag: {tag}
                    <button
                      onClick={() => setFilter({ 
                        ...filter, 
                        tags: filter.tags.filter(t => t !== tag) 
                      })}
                      className="hover:text-purple-500"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeView === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                {/* Home Content */}
                <div className="relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        rotate: { duration: 50, repeat: Infinity, ease: "linear" },
                        scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                      }}
                      className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${
                        settings.theme === 'dark' 
                          ? 'bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10' 
                          : 'bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5'
                      }`}
                    />
                    <motion.div
                      animate={{ 
                        rotate: -360,
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                        scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                      }}
                      className={`absolute top-40 -left-40 w-96 h-96 rounded-full blur-3xl ${
                        settings.theme === 'dark'
                          ? 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10'
                          : 'bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5'
                      }`}
                    />
                  </div>

                  {/* Welcome Section */}
                  <div className="relative p-8 lg:p-12">
                    <div className="relative z-10 text-center max-w-4xl mx-auto">
                      {/* Welcome Badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full mb-8"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center"
                        >
                          <Sparkles className="text-white" size={12} />
                        </motion.div>
                        <span className="text-primary font-medium">Welcome to supermind.</span>
                      </motion.div>

                      {/* Main Heading */}
                      <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl lg:text-7xl font-bold mb-6"
                      >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-emerald-600 to-blue-600 dark:from-white dark:via-emerald-400 dark:to-blue-400">
                          supermind.
                        </span>
                      </motion.h1>

                      {/* Subtitle */}
                      <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl lg:text-2xl text-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
                      >
                        Capture, organize, and rediscover everything with AI-powered automation. Your universal second brain for the digital age.
                      </motion.p>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUploadModalOpen(true)}
                          className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg flex items-center gap-3 ${
                            settings.theme === 'dark' 
                              ? 'bg-white text-black hover:bg-gray-100' 
                              : 'bg-black text-white hover:bg-gray-900'
                          }`}
                        >
                          <Plus size={20} />
                          Add Your First Item
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            // Show features or explore functionality
                          }}
                          className="px-8 py-4 glass rounded-2xl font-semibold text-lg text-primary transition-all duration-200 shadow-lg flex items-center gap-3"
                        >
                          <Eye size={20} />
                          Explore Features
                        </motion.button>
                      </motion.div>

                      {/* Feature Cards */}
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                      >
                        {[
                          { 
                            icon: Shield, 
                            title: "100% Private", 
                            desc: "End-to-end encrypted",
                            gradient: "from-emerald-500 to-green-500"
                          },
                          { 
                            icon: Zap, 
                            title: "Lightning Fast", 
                            desc: "Instant AI processing",
                            gradient: "from-yellow-500 to-orange-500"
                          },
                          { 
                            icon: Brain, 
                            title: "Smart AI", 
                            desc: "Learns your patterns",
                            gradient: "from-purple-500 to-pink-500"
                          }
                        ].map((feature, index) => (
                          <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 + index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
                          >
                            <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                              <feature.icon className="text-white" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                            <p className="text-secondary text-sm">{feature.desc}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                {/* Welcome Hero Section */}
                <AnimatePresence>
                  {showWelcome && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="relative overflow-hidden"
                    >
                      <div className="relative p-8 lg:p-12">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10" />
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
                              animate={{
                                x: [0, Math.random() * 100 - 50],
                                y: [0, Math.random() * 100 - 50],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                              }}
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                              }}
                            />
                          ))}
                        </div>

                        <div className="relative z-10 text-center max-w-4xl mx-auto">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6"
                          >
                            <div className="inline-flex items-center gap-3 px-6 py-3 glass-button rounded-full mb-6">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center"
                              >
                                <Sparkles className="text-white" size={16} />
                              </motion.div>
                              <span className="text-primary font-semibold">Welcome to supermind.</span>
                            </div>
                          </motion.div>

                          <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl lg:text-6xl font-bold text-primary mb-6 leading-tight"
                          >
                            Your AI-Powered
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
                              Second Brain
                            </span>
                          </motion.h1>

                          <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed"
                          >
                            Capture, organize, and rediscover everything with AI-powered automation. 
                            Your universal knowledge companion for the digital age.
                          </motion.p>

                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setUploadModalOpen(true)}
                              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-3"
                            >
                              <Plus size={20} />
                              Add Your First Item
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowWelcome(false)}
                              className="px-6 py-4 glass-button text-secondary hover:text-primary rounded-2xl transition-all duration-200 flex items-center gap-2"
                            >
                              <Eye size={18} />
                              Explore Features
                            </motion.button>
                          </motion.div>

                          {/* Quick Stats */}
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
                          >
                            {[
                              { icon: Shield, label: "100% Private", desc: "End-to-end encrypted" },
                              { icon: Zap, label: "Lightning Fast", desc: "Instant AI processing" },
                              { icon: Brain, label: "Smart AI", desc: "Learns your patterns" }
                            ].map((stat, index) => (
                              <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="glass-button rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300"
                              >
                                <stat.icon className="text-emerald-500 mx-auto mb-3" size={32} />
                                <div className="text-lg font-bold text-primary mb-1">{stat.label}</div>
                                <div className="text-sm text-secondary">{stat.desc}</div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>

                        {/* Dismiss Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowWelcome(false)}
                          className="absolute top-4 right-4 p-2 glass-button rounded-full text-secondary hover:text-primary transition-all duration-200"
                        >
                          <X size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Timeline Content */}
                <div className={showWelcome ? 'pt-0' : 'pt-6'}>
                  <Timeline
                    content={content}
                    filter={filter}
                    onToggleFavorite={toggleFavorite}
                    onFilterChange={setFilter}
                  />
                </div>
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full p-6 overflow-y-auto custom-scrollbar"
              >
                <div className="text-primary">
                  <AnalyticsDashboard />
                </div>
              </motion.div>
            )}

            {activeView === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full p-6 overflow-y-auto custom-scrollbar"
              >
                <div className="max-w-6xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <Brain className="text-white" size={32} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-primary mb-2">AI Insights</h2>
                    <p className="text-secondary">Discover patterns and connections in your knowledge</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Knowledge Graph */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Network className="text-emerald-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">Knowledge Graph</h3>
                      </div>
                      <div className={`h-64 rounded-xl flex items-center justify-center ${
                        settings.theme === 'dark' 
                          ? 'bg-gradient-to-br from-emerald-500/10 to-blue-500/10' 
                          : 'bg-gradient-to-br from-emerald-500/5 to-blue-500/5'
                      }`}>
                        <div className="text-center">
                          <Orbit className="text-emerald-400 mx-auto mb-2" size={48} />
                          <p className="text-secondary">Interactive knowledge visualization</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content Recommendations */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-purple-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">Smart Recommendations</h3>
                      </div>
                      <div className="space-y-3">
                        {[
                          { title: 'Related to your productivity research', type: 'article', confidence: 95 },
                          { title: 'Similar health content you might like', type: 'video', confidence: 87 },
                          { title: 'Trending in your education category', type: 'link', confidence: 82 },
                        ].map((rec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="flex items-center justify-between p-3 glass-button rounded-xl"
                          >
                            <div>
                              <p className="text-primary text-sm">{rec.title}</p>
                              <p className="text-muted text-xs">{rec.confidence}% match</p>
                            </div>
                            <div className={`w-12 h-2 rounded-full overflow-hidden ${
                              settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                            }`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${rec.confidence}%` }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Learning Patterns */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="text-blue-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">Learning Patterns</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Peak learning time</span>
                          <span className="text-blue-400 font-semibold">2-4 PM</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Favorite content type</span>
                          <span className="text-blue-400 font-semibold">Articles</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Weekly growth</span>
                          <span className="text-emerald-400 font-semibold">+23%</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* AI Suggestions */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="text-yellow-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">AI Suggestions</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 glass-button rounded-xl">
                          <p className="text-primary text-sm mb-1">Create a "Morning Routine" collection</p>
                          <p className="text-muted text-xs">Based on your health and productivity content</p>
                        </div>
                        <div className="p-3 glass-button rounded-xl">
                          <p className="text-primary text-sm mb-1">Set reminder for weekly review</p>
                          <p className="text-muted text-xs">You haven't reviewed content in 5 days</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full p-6 overflow-y-auto custom-scrollbar"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                        settings.theme === 'dark' ? 'bg-white' : 'bg-black'
                      }`}
                    >
                      <User className={`${settings.theme === 'dark' ? 'text-black' : 'text-white'}`} size={32} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Profile & Settings</h2>
                    <p className="text-secondary">Manage your account and preferences</p>
                  </div>

                  {/* User Profile Card */}
                  <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                        settings.theme === 'dark' ? 'bg-white' : 'bg-black'
                      }`}>
                        <span className={`font-bold text-xl ${
                          settings.theme === 'dark' ? 'text-black' : 'text-white'
                        }`}>{user?.name?.[0] || 'U'}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary">{user?.name || 'User'}</h3>
                        <p className="text-secondary">{user?.email || 'user@example.com'}</p>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                          settings.theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                        }`}>
                          {user?.subscription || 'Free'} Plan
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    {[
                      { icon: Settings, label: 'Settings', action: () => setSettingsModalOpen(true) },
                      { icon: Download, label: 'Export Data', action: () => {} },
                      { icon: Shield, label: 'Privacy & Security', action: () => {} },
                      { icon: Bell, label: 'Notifications', action: () => {} },
                    ].map((item) => (
                      <motion.button
                        key={item.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={item.action}
                        className="w-full flex items-center gap-4 p-4 glass rounded-xl hover:shadow-lg transition-all duration-200"
                      >
                        <item.icon className="text-primary" size={20} />
                        <span className="text-primary font-medium">{item.label}</span>
                        <ChevronRight className="text-secondary ml-auto" size={16} />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Floating Add Button */}
      {activeView !== 'home' && (
        <motion.div
          className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.button
            onClick={() => setUploadModalOpen(true)}
            className="relative w-16 h-16 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white rounded-2xl shadow-premium transition-all duration-300 flex items-center justify-center group overflow-hidden"
            animate={{
              boxShadow: [
                "0 0 20px rgba(16, 185, 129, 0.3)",
                "0 0 30px rgba(59, 130, 246, 0.4)",
                "0 0 20px rgba(16, 185, 129, 0.3)",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <Plus size={24} className="relative z-10" />
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-2xl"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        </motion.div>
      )}

      {/* Mobile Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 safe-area-bottom">
        <div 
          className="flex items-center justify-center gap-8 py-4 px-8 rounded-full backdrop-blur-xl border shadow-2xl"
          style={{
            background: settings.theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
            borderColor: settings.theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Home */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center gap-1 p-3 transition-all duration-300 ${
              activeView === 'home' ? 'text-primary' : 'text-secondary'
            }`}
          >
            <motion.div
              animate={activeView === 'home' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Grid size={24} strokeWidth={activeView === 'home' ? 2.5 : 2} />
            </motion.div>
            <span className={`text-xs font-medium ${activeView === 'home' ? 'text-primary' : 'text-secondary'}`}>
              Home
            </span>
          </motion.button>
          
          {/* Timeline */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('timeline')}
            className={`flex flex-col items-center gap-1 p-3 transition-all duration-300 ${
              activeView === 'timeline' ? 'text-primary' : 'text-secondary'
            }`}
          >
            <motion.div
              animate={activeView === 'timeline' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Clock size={24} strokeWidth={activeView === 'timeline' ? 2.5 : 2} />
            </motion.div>
            <span className={`text-xs font-medium ${activeView === 'timeline' ? 'text-primary' : 'text-secondary'}`}>
              Timeline
            </span>
          </motion.button>
          
          {/* Ultra Advanced Animated Plus Button */}
          <motion.div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                  "0 0 40px rgba(16, 185, 129, 0.6)",
                  "0 0 60px rgba(59, 130, 246, 0.4)",
                  "0 0 40px rgba(16, 185, 129, 0.6)",
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <motion.button
              whileHover={{ 
                scale: 1.2,
                rotate: 90,
              }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setUploadModalOpen(true)}
              className="relative w-20 h-20 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 text-white border-4 border-white/40"
              animate={{
                background: [
                  "linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)",
                  "linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)",
                  "linear-gradient(225deg, #8b5cf6, #10b981, #3b82f6)",
                  "linear-gradient(315deg, #10b981, #3b82f6, #8b5cf6)",
                ],
              }}
              transition={{ 
                background: { duration: 4, repeat: Infinity },
                scale: { duration: 0.4 },
                rotate: { duration: 0.6 }
              }}
            >
              {/* Multiple rotating rings */}
              <motion.div
                className="absolute inset-1 rounded-full border-2 border-white/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border border-white/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Pulsing inner circles */}
              <motion.div
                className="absolute inset-3 rounded-full bg-white/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-white/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
              
              {/* Enhanced Plus icon */}
              <motion.div
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10"
              >
                <Plus size={32} strokeWidth={3} />
              </motion.div>
              
              {/* Enhanced sparkle effects */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-lg"
                  style={{
                    top: '15%',
                    left: '15%',
                    transformOrigin: '32px 32px',
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Magnetic attraction effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/0"
                whileHover={{
                  borderColor: "rgba(255, 255, 255, 0.6)",
                  scale: 1.1,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
          
          {/* Explore */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('search')}
            className={`flex flex-col items-center gap-1 p-3 transition-all duration-300 ${
              activeView === 'search' ? 'text-primary' : 'text-secondary'
            }`}
          >
            <motion.div
              animate={activeView === 'search' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Telescope size={24} strokeWidth={activeView === 'search' ? 2.5 : 2} />
            </motion.div>
            <span className={`text-xs font-medium ${activeView === 'search' ? 'text-primary' : 'text-secondary'}`}>
              Explore
            </span>
          </motion.button>
          
          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('profile')}
            className={`flex flex-col items-center gap-1 p-3 transition-all duration-300 ${
              activeView === 'profile' ? 'text-primary' : 'text-secondary'
            }`}
          >
            <motion.div
              animate={activeView === 'profile' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <User size={24} strokeWidth={activeView === 'profile' ? 2.5 : 2} />
            </motion.div>
            <span className={`text-xs font-medium ${activeView === 'profile' ? 'text-primary' : 'text-secondary'}`}>
              Profile
            </span>
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onAddContent={addContent}
      />
      
      {isEncryptionModalOpen && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          settings.theme === 'dark' ? 'bg-black/60' : 'bg-white/60'
        }`}>
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <EncryptionSetup onComplete={handleEncryptionSetup} />
          </div>
        </div>
      )}
      
      <SettingsModal />
      
      {settings.security.encryptionEnabled && (
        <SecurityBadge variant="floating" />
      )}
      
      <Toast />
    </div>
  );
}

export default App;
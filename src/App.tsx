import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, BarChart3, Menu, X, Search, Command, Bell, Settings, User, Zap,
  Brain, Shield, Star, Grid, Clock, TrendingUp, Sparkles, Database,
  Network, Lightbulb, Download, ChevronRight, Tag as TagIcon, CalendarClock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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
import AboutPage from './components/AboutPage';
import Dashboard from './components/Dashboard';
import KnowledgeGraph from './components/KnowledgeGraph';
import CommandPalette from './components/CommandPalette';
import { useStore, getCategoriesWithCounts } from './store/useStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoLock } from './hooks/useAutoLock';
import { useInsights } from './hooks/useInsights';
import { hapticTap } from './utils/haptics';
import { formatDistanceToNow } from 'date-fns';

function App() {
  const {
    user,
    isAuthenticated,
    isEncryptionSetup,
    isEncryptionModalOpen,
    setEncryptionModalOpen,
    setupEncryption,
    unlockEncryption,
    content,
    filter,
    isUploadModalOpen,
    setUploadModalOpen,
    setUser,
    addContent,
    toggleFavorite,
    setFilter,
    settings,
    setSettingsModalOpen,
    exportContent,
    activeView,
    setActiveView,
    setCommandPaletteOpen,
  } = useStore();

  const [showLanding, setShowLanding] = React.useState(!isAuthenticated);
  const [showAbout, setShowAbout] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [quickActions, setQuickActions] = React.useState(false);
  const [showWelcome, setShowWelcome] = React.useState(true);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  useKeyboardShortcuts();
  useAutoLock();

  const categories = React.useMemo(() => getCategoriesWithCounts(content), [content]);
  const insights = useInsights(content);

  // Real notifications, derived from the user's own data.
  const remindersEnabled = settings.notifications.reminders;
  const notifications = React.useMemo(() => {
    if (!remindersEnabled) return [];
    const now = Date.now();
    const items: Array<{ id: string; text: string; detail: string; color: string }> = [];
    for (const c of content) {
      if (c.metadata?.isGuide) continue;
      if (c.reminderDate && c.reminderDate.getTime() < now) {
        items.push({
          id: `overdue-${c.id}`,
          text: `Reminder due: ${c.contentText.slice(0, 60)}`,
          detail: formatDistanceToNow(c.reminderDate, { addSuffix: true }),
          color: 'bg-red-500',
        });
      } else if (c.reminderDate) {
        items.push({
          id: `upcoming-${c.id}`,
          text: `Upcoming: ${c.contentText.slice(0, 60)}`,
          detail: formatDistanceToNow(c.reminderDate, { addSuffix: true }),
          color: 'bg-blue-500',
        });
      }
    }
    return items.slice(0, 6);
  }, [content, remindersEnabled]);

  React.useEffect(() => {
    if (window.location.pathname === '/about') {
      setShowAbout(true);
      setShowLanding(false);
    }
  }, []);

  // Apply theme
  React.useEffect(() => {
    const root = document.documentElement;
    const applyDark = (dark: boolean) => root.classList.toggle('dark', dark);
    if (settings.theme === 'dark') {
      applyDark(true);
    } else if (settings.theme === 'light') {
      applyDark(false);
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(media.matches);
      const listener = (e: MediaQueryListEvent) => applyDark(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleCreateProfile = async (name: string, email: string, encryptionPassword?: string) => {
    const newUser = {
      id: `local_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      email,
      name,
      encryptionEnabled: false,
      createdAt: new Date(),
    };
    setUser(newUser);
    toast.success(`Welcome, ${newUser.name}! 🎉`);
    if (encryptionPassword) {
      await setupEncryption(encryptionPassword);
    }
  };

  const handleShowAbout = () => {
    setShowAbout(true);
    setShowLanding(false);
    window.history.pushState({}, '', '/about');
  };

  const handleBackFromAbout = () => {
    setShowAbout(false);
    setShowLanding(!isAuthenticated);
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

  const needsEncryptionUnlock = isAuthenticated && user?.encryptionEnabled && !isEncryptionSetup;

  if (showAbout) {
    return <AboutPage onBack={handleBackFromAbout} />;
  }

  if (!isAuthenticated && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} onAbout={handleShowAbout} />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthModal onComplete={handleCreateProfile} />
        <Toast />
      </>
    );
  }

  if (needsEncryptionUnlock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <EncryptionSetup onComplete={unlockEncryption} isLogin={true} />
        </div>
        <Toast />
      </div>
    );
  }

  const viewSwitcher = [
    { id: 'timeline' as const, icon: Clock, label: 'Timeline' },
    { id: 'graph' as const, icon: Network, label: 'Graph' },
    { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
    { id: 'insights' as const, icon: Brain, label: 'Insights' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${
          isDark
            ? 'bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5'
            : 'bg-gradient-to-br from-emerald-500/3 via-blue-500/3 to-purple-500/3'
        }`} />
        <div className={`absolute top-40 -left-40 w-96 h-96 rounded-full blur-3xl ${
          isDark
            ? 'bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5'
            : 'bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-orange-500/3'
        }`} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 backdrop-blur-sm z-40 lg:hidden ${isDark ? 'bg-black/60' : 'bg-white/60'}`}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <Sidebar
                categories={categories}
                filter={filter}
                onFilterChange={(newFilter) => {
                  setFilter(newFilter);
                  setIsMobileSidebarOpen(false);
                }}
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
        />
      </div>

      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <motion.div
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

              {/* Search */}
              <div className="relative hidden sm:block">
                <motion.div
                  animate={{ width: searchFocused ? 400 : 300 }}
                  className="relative"
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search everything..."
                    value={filter.searchQuery}
                    onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-12 pr-16 py-3 glass-input rounded-xl text-primary placeholder-muted transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={() => { hapticTap(); setCommandPaletteOpen(true); }}
                      title="Open command palette"
                      className={`hidden sm:flex items-center gap-1 text-muted hover:text-primary text-xs px-2 py-1 rounded-md transition-colors ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}
                    >
                      <Command size={10} />
                      <span>K</span>
                    </button>
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
                {viewSwitcher.map((view) => {
                  const IconComponent = view.icon;
                  return (
                    <motion.button
                      key={view.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveView(view.id)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                        activeView === view.id
                          ? 'bg-black text-white dark:bg-white dark:text-black'
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
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl glass-button text-secondary hover:text-primary transition-all duration-200 relative"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-80 glass-card rounded-2xl p-4 shadow-premium z-50"
                    >
                      <h3 className="text-primary font-semibold mb-3">Reminders</h3>
                      {notifications.length === 0 ? (
                        <p className="text-secondary text-sm py-4 text-center">
                          No reminders. Add a note mentioning a deadline or follow-up and
                          supermind will remind you here.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((n) => (
                            <div key={n.id} className="flex items-start gap-3 p-3 glass-button rounded-xl">
                              <div className={`w-2 h-2 ${n.color} rounded-full mt-2 flex-shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-primary text-sm truncate">{n.text}</p>
                                <p className="text-muted text-xs">{n.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                          {
                            icon: Download,
                            label: 'Export All',
                            action: () => {
                              exportContent();
                              toast.success('Export downloaded');
                            },
                          },
                          { icon: Settings, label: 'Settings', action: () => setSettingsModalOpen(true) },
                          { icon: Brain, label: 'Insights', action: () => setActiveView('insights') },
                        ].map((action) => (
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

              {/* User Avatar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveView('profile')}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-lg ${
                  isDark ? 'bg-white text-black' : 'bg-black text-white'
                }`}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </motion.button>
            </div>
          </div>

          {/* Active Filters Bar */}
          <AnimatePresence>
            {(filter.contentType || filter.tags.length > 0 || filter.category !== 'all' || filter.favoritesOnly) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex flex-wrap gap-2 mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}
              >
                {filter.category !== 'all' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 glass-button rounded-full text-emerald-600 text-sm border border-emerald-500/30">
                    Category: {filter.category}
                    <button onClick={() => setFilter({ ...filter, category: 'all' })} className="hover:text-emerald-500">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filter.contentType && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 glass-button rounded-full text-blue-600 text-sm border border-blue-500/30">
                    Type: {filter.contentType}
                    <button onClick={() => setFilter({ ...filter, contentType: '' })} className="hover:text-blue-500">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filter.favoritesOnly && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 glass-button rounded-full text-yellow-600 text-sm border border-yellow-500/30">
                    Favorites only
                    <button onClick={() => setFilter({ ...filter, favoritesOnly: false })} className="hover:text-yellow-500">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filter.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-2 px-3 py-1 glass-button rounded-full text-purple-600 text-sm border border-purple-500/30">
                    Tag: {tag}
                    <button
                      onClick={() => setFilter({ ...filter, tags: filter.tags.filter(t => t !== tag) })}
                      className="hover:text-purple-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
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
                <Dashboard />
              </motion.div>
            )}

            {activeView === 'graph' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <KnowledgeGraph />
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
                <AnimatePresence>
                  {showWelcome && content.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="relative overflow-hidden"
                    >
                      <div className="relative p-8 lg:p-12 text-center">
                        <h2 className="text-3xl font-bold text-primary mb-4">Your timeline is empty</h2>
                        <p className="text-secondary mb-6">Everything you save will show up here, newest first.</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUploadModalOpen(true)}
                          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg inline-flex items-center gap-3"
                        >
                          <Plus size={20} />
                          Add Your First Item
                        </motion.button>
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

                <Timeline
                  content={content}
                  filter={filter}
                  onToggleFavorite={toggleFavorite}
                  onFilterChange={setFilter}
                />
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

            {activeView === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full p-6 overflow-y-auto custom-scrollbar"
              >
                <div className="max-w-6xl mx-auto space-y-6 pb-24">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Insights</h2>
                    <p className="text-secondary">Patterns and connections computed from your own content — right here on your device</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tag Connections */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Network className="text-emerald-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">Tag Connections</h3>
                      </div>
                      {insights.tagConnections.length === 0 ? (
                        <p className="text-secondary text-sm py-8 text-center">
                          Add more content — connections appear when tags co-occur across items.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {insights.tagConnections.map((conn) => (
                            <div key={`${conn.tagA}-${conn.tagB}`} className="flex items-center justify-between p-3 glass-button rounded-xl">
                              <div className="flex items-center gap-2 text-sm min-w-0">
                                <TagIcon size={12} className="text-emerald-400 flex-shrink-0" />
                                <span className="text-primary truncate">{conn.tagA}</span>
                                <span className="text-muted">↔</span>
                                <span className="text-primary truncate">{conn.tagB}</span>
                              </div>
                              <span className="text-muted text-xs flex-shrink-0 ml-2">{conn.count} items</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Related Content */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-purple-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">Rediscover</h3>
                      </div>
                      {insights.recommendations.length === 0 ? (
                        <p className="text-secondary text-sm py-8 text-center">
                          As your library grows, items related to your recent saves will surface here.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {insights.recommendations.map((rec) => (
                            <div key={rec.id} className="flex items-center justify-between p-3 glass-button rounded-xl gap-3">
                              <div className="min-w-0">
                                <p className="text-primary text-sm truncate">{rec.title}</p>
                                <p className="text-muted text-xs truncate">{rec.reason}</p>
                              </div>
                              <div className={`w-12 h-2 rounded-full overflow-hidden flex-shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  style={{ width: `${rec.match}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Your Patterns */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="text-blue-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">Your Patterns</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Most active time</span>
                          <span className="text-blue-400 font-semibold">{insights.peakTime ?? 'Not enough data'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Most saved type</span>
                          <span className="text-blue-400 font-semibold capitalize">{insights.favoriteType ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Week-over-week</span>
                          <span className={`font-semibold ${insights.weeklyGrowth !== null && insights.weeklyGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {insights.weeklyGrowth === null ? '—' : `${insights.weeklyGrowth >= 0 ? '+' : ''}${insights.weeklyGrowth}%`}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Suggestions */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="text-yellow-400" size={24} />
                        <h3 className="text-xl font-semibold text-primary">Suggestions</h3>
                      </div>
                      <div className="space-y-3">
                        {insights.suggestions.map((s) => (
                          <div key={s.title} className="p-3 glass-button rounded-xl">
                            <p className="text-primary text-sm mb-1">{s.title}</p>
                            <p className="text-muted text-xs">{s.detail}</p>
                          </div>
                        ))}
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
                <div className="max-w-2xl mx-auto pb-24">
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white' : 'bg-black'}`}>
                      <User className={isDark ? 'text-black' : 'text-white'} size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Profile & Settings</h2>
                    <p className="text-secondary">Manage your local profile and preferences</p>
                  </div>

                  <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${isDark ? 'bg-white' : 'bg-black'}`}>
                        <span className={`font-bold text-xl ${isDark ? 'text-black' : 'text-white'}`}>
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary">{user?.name || 'User'}</h3>
                        {user?.email && <p className="text-secondary">{user.email}</p>}
                        <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                          Local profile · {content.length} items
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: Settings, label: 'Settings', action: () => setSettingsModalOpen(true) },
                      {
                        icon: Download,
                        label: 'Export Data',
                        action: () => {
                          exportContent();
                          toast.success('Export downloaded');
                        },
                      },
                      { icon: Shield, label: 'Privacy & Security', action: () => setSettingsModalOpen(true, 'security') },
                      { icon: CalendarClock, label: 'Notifications & Reminders', action: () => setSettingsModalOpen(true, 'notifications') },
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

      {/* Floating Add Button (desktop) */}
      {activeView !== 'home' && (
        <motion.div
          className="hidden sm:block fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.button
            onClick={() => { hapticTap(); setUploadModalOpen(true); }}
            className="haptic relative w-16 h-16 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white rounded-2xl shadow-premium transition-all duration-300 flex items-center justify-center"
          >
            <Plus size={24} />
          </motion.button>
        </motion.div>
      )}

      {/* Mobile Navigation */}
      <div className="sm:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 safe-area-bottom">
        <div
          className="flex items-center justify-center gap-4 py-3 px-6 rounded-full backdrop-blur-xl border shadow-2xl"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {([
            { id: 'home', icon: Grid, label: 'Home' },
            { id: 'timeline', icon: Clock, label: 'Timeline' },
          ] as const).map((nav) => (
            <motion.button
              key={nav.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(nav.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
                activeView === nav.id ? 'text-primary' : 'text-secondary'
              }`}
            >
              <nav.icon size={22} strokeWidth={activeView === nav.id ? 2.5 : 2} />
              <span className="text-xs font-medium">{nav.label}</span>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticTap(); setUploadModalOpen(true); }}
            className="haptic w-14 h-14 rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 text-white border-4 border-white/40"
          >
            <Plus size={26} strokeWidth={3} />
          </motion.button>

          {([
            { id: 'graph', icon: Network, label: 'Graph' },
            { id: 'profile', icon: User, label: 'Profile' },
          ] as const).map((nav) => (
            <motion.button
              key={nav.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(nav.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
                activeView === nav.id ? 'text-primary' : 'text-secondary'
              }`}
            >
              <nav.icon size={22} strokeWidth={activeView === nav.id ? 2.5 : 2} />
              <span className="text-xs font-medium">{nav.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onAddContent={addContent}
      />

      {isEncryptionModalOpen && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/60' : 'bg-white/60'}`}>
          <div className="glass-card rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setEncryptionModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-secondary hover:text-primary transition-colors"
            >
              <X size={18} />
            </button>
            <EncryptionSetup onComplete={handleEncryptionSetup} />
          </div>
        </div>
      )}

      <SettingsModal />

      <CommandPalette />

      {settings.security.encryptionEnabled && <SecurityBadge variant="floating" />}

      <Toast />
    </div>
  );
}

export default App;

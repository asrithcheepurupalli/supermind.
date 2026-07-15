import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, BarChart3, Menu, X, Search, Command, Bell, Settings, Zap,
  Shield, Grid, Clock, Smartphone,
  Network, Download, ChevronRight, CalendarClock,
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
import Almanac from './components/Almanac';
import Toast from './components/ui/Toast';
import AboutPage from './components/AboutPage';
import Dashboard from './components/Dashboard';
import KnowledgeGraph from './components/KnowledgeGraph';
import CommandPalette from './components/CommandPalette';
import Legend from './components/Legend';
import MadeBadge from './components/MadeBadge';
import { useStore, getCategoriesWithCounts } from './store/useStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoLock } from './hooks/useAutoLock';
import { hapticTap, hapticSuccess } from './utils/haptics';
import { formatDistanceToNow } from 'date-fns';
import type { SavedContent } from './types';

// Build a capture item from raw text; single URLs become links.
const makeCapture = (text: string, fileUrl?: string, contentType?: SavedContent['contentType']): SavedContent => {
  const isUrl = !fileUrl && /^https?:\/\/\S+$/i.test(text) && !text.includes('\n');
  let sourceApp = 'Note';
  if (isUrl) {
    try { sourceApp = new URL(text).hostname; } catch { sourceApp = 'Link'; }
  }
  return {
    id: `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    contentText: text,
    contentType: contentType ?? (isUrl ? 'link' : 'text'),
    sourceApp: fileUrl ? 'Clipboard' : sourceApp,
    timestamp: new Date(),
    tags: [],
    summary: '',
    fileUrl,
    userId: 'local',
    category: isUrl ? 'articles' : 'personal',
    isFavorite: false,
  };
};

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

  // PWA install: browsers hand us the prompt via beforeinstallprompt; we
  // stash it and offer "Install App" in quick actions while it's valid.
  const [installPrompt, setInstallPrompt] = React.useState<
    (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null
  >(null);
  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as typeof installPrompt);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      toast.success('supermind is on your shelf now');
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome !== 'accepted') return;
    setInstallPrompt(null);
  };
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  useKeyboardShortcuts();
  useAutoLock();

  const categories = React.useMemo(() => getCategoriesWithCounts(content), [content]);

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
    if (window.location.hash === '#about') {
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


  // Capture, everywhere: paste anything outside a text field and it files
  // itself. Images become plates; single URLs become links.
  const canCapture = isAuthenticated && !(user?.encryptionEnabled && !isEncryptionSetup);
  React.useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      if (!canCapture) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) return;

      const imageItem = [...(e.clipboardData?.items ?? [])].find(i => i.type.startsWith('image/'));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file && file.size <= 1.5 * 1024 * 1024) {
          e.preventDefault();
          const fileUrl = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = () => reject(r.error);
            r.readAsDataURL(file);
          });
          await addContent({ ...makeCapture(file.name || 'pasted image', fileUrl, 'image'), metadata: { fileSize: file.size } });
          hapticSuccess();
          toast.success('Filed from your clipboard');
          return;
        }
      }

      const text = e.clipboardData?.getData('text')?.trim();
      if (!text) return;
      e.preventDefault();
      await addContent(makeCapture(text));
      hapticSuccess();
      toast.success('Filed from your clipboard');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [canCapture, addContent]);

  // PWA share target: content shared from another app arrives as URL params.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = [params.get('title'), params.get('text'), params.get('url')]
      .filter(Boolean).join('\n').trim();
    if (!shared) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (canCapture) {
      addContent(makeCapture(shared)).then(() => toast.success('Filed from share'));
    } else {
      try { localStorage.setItem('supermind_first_thought', shared); } catch { /* private mode */ }
    }
    // Run once on mount with whatever auth state the app booted into.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProfile = async (name: string, email: string, encryptionPassword?: string) => {
    const newUser = {
      id: `local_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      email,
      name,
      encryptionEnabled: false,
      createdAt: new Date(),
    };
    setUser(newUser);
    toast.success(`Welcome, ${newUser.name}.`);
    if (encryptionPassword) {
      await setupEncryption(encryptionPassword);
    }
    // If they wrote a thought on the landing page, it becomes entry one.
    let pending: string | null = null;
    try {
      pending = localStorage.getItem('supermind_first_thought');
      localStorage.removeItem('supermind_first_thought');
    } catch { /* private mode */ }
    if (pending?.trim()) {
      await addContent(makeCapture(pending.trim()));
      toast('Your first thought is already filed.');
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
      <div className="min-h-screen bg-paper dot-grid noise flex flex-col items-center justify-center p-8">
        <div className="flex items-baseline gap-1 mb-10">
          <span className="font-display text-2xl tracking-tight text-ink">supermind</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
        </div>
        <div className="w-full max-w-md">
          <EncryptionSetup onComplete={unlockEncryption} isLogin={true} />
        </div>
        <Toast />
      </div>
    );
  }

  // Shared view transition: the new page settles into place while the ink
  // "dries" (a brief blur clearing). Honors the animations toggle.
  const pageMotion = settings.display.animationsEnabled
    ? {
        initial: { opacity: 0, y: 18, filter: 'blur(3px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -14, filter: 'blur(2px)' },
        transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
      }
    : { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const viewSwitcher = [
    { id: 'timeline' as const, icon: Clock, label: 'Timeline' },
    { id: 'graph' as const, icon: Network, label: 'Graph' },
    { id: 'almanac' as const, icon: BarChart3, label: 'Almanac' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink noise">

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden bg-black/30"
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
      <div className="hidden lg:block print:!hidden">
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
          className="bg-paper border-b-[1.5px] border-ink px-4 lg:px-6 py-3.5 relative z-10 print:hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden btn-paper haptic p-2 rounded-sm"
              >
                <Menu size={20} />
              </motion.button>

              {/* Search */}
              <div className="relative hidden sm:block">
                <motion.div
                  animate={{ width: searchFocused ? 400 : 300 }}
                  className="relative"
                >
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-ink-faint" size={16} />
                  <input
                    type="text"
                    placeholder="Search everything..."
                    value={filter.searchQuery}
                    onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="bare-input w-full pl-10 pr-16 py-2.5 bg-paper-raised border-[1.5px] border-ink rounded-sm text-ink placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={() => { hapticTap(); setCommandPaletteOpen(true); }}
                      title="Open command palette"
                      className="keycap keycap-press hidden sm:inline-flex text-[10px] !py-0.5 !px-1.5"
                    >
                      <Command size={9} />K
                    </button>
                    {filter.searchQuery && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setFilter({ ...filter, searchQuery: '' })}
                        className="text-ink-faint hover:text-ink"
                      >
                        <X size={14} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* View Switcher */}
              <div className="hidden sm:flex items-stretch border-[1.5px] border-ink rounded-sm overflow-hidden divide-x-[1.5px] divide-[var(--ink)]">
                {viewSwitcher.map((view) => {
                  const IconComponent = view.icon;
                  const active = activeView === view.id;
                  return (
                    <button
                      key={view.id}
                      onClick={() => { hapticTap(); setActiveView(view.id); }}
                      className={`haptic px-4 py-2 flex items-center gap-2 font-label text-[10px] transition-colors ${
                        active ? 'bg-ink text-paper' : 'bg-paper-raised text-ink-soft hover:text-ink hover:bg-[var(--accent-soft)]'
                      }`}
                    >
                      <IconComponent size={13} />
                      <span className="hidden lg:block">{view.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-4 font-label text-[10px] text-ink-faint">
                <span>{content.length} items</span>
                <span>·</span>
                <span>{content.filter(c => c.isFavorite).length} starred</span>
                {settings.security.encryptionEnabled && (
                  <span className="stamp !py-0.5 !px-1.5 text-[9px] text-accent">sealed</span>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="btn-paper haptic p-2 rounded-sm relative"
                >
                  <Bell size={16} />
                  {notifications.length > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-accent border border-ink rounded-full" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="card-ink-static absolute right-0 top-full mt-3 w-80 rounded-sm p-5 z-50"
                    >
                      <div className="font-label text-[10px] text-ink-faint mb-4">reminders</div>
                      {notifications.length === 0 ? (
                        <p className="font-display italic text-ink-soft py-3 text-center">
                          Nothing due. Write a note with a deadline and it lands here.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((n) => (
                            <div key={n.id} className="flex items-start gap-3 pb-3 border-b border-[var(--ink-line)] last:border-0 last:pb-0">
                              <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-ink text-sm truncate">{n.text}</p>
                                <p className="font-label text-[9px] text-ink-faint mt-0.5">{n.detail}</p>
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
                  className="btn-paper haptic p-2 rounded-sm"
                >
                  <Zap size={16} />
                </motion.button>

                <AnimatePresence>
                  {quickActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="card-ink-static absolute right-0 top-full mt-3 w-64 rounded-sm p-4 z-50"
                    >
                      <div className="font-label text-[10px] text-ink-faint mb-3">quick actions</div>
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
                          { icon: BarChart3, label: 'Almanac', action: () => setActiveView('almanac') },
                          ...(installPrompt
                            ? [{ icon: Smartphone, label: 'Install App', action: handleInstall }]
                            : []),
                        ].map((action) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              action.action();
                              setQuickActions(false);
                            }}
                            className="haptic flex flex-col items-center gap-2 p-3 border-[1.5px] border-ink rounded-sm bg-paper hover:bg-[var(--accent-soft)] transition-colors"
                          >
                            <action.icon size={16} className="text-accent" />
                            <span className="font-label text-[9px] text-ink">{action.label}</span>
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
                className="haptic w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-display text-lg border-[1.5px] border-ink"
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
className="flex flex-wrap gap-2 mt-3.5 pt-3.5 border-t border-[var(--ink-line)]"
              >
                {filter.category !== 'all' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 border-[1.5px] border-ink rounded-sm bg-[var(--accent-soft)] text-ink font-label text-[10px]">
                    Category: {filter.category}
                    <button onClick={() => setFilter({ ...filter, category: 'all' })} className="hover:text-accent">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filter.contentType && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 border-[1.5px] border-ink rounded-sm bg-[var(--accent-soft)] text-ink font-label text-[10px]">
                    Type: {filter.contentType}
                    <button onClick={() => setFilter({ ...filter, contentType: '' })} className="hover:text-accent">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filter.favoritesOnly && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 border-[1.5px] border-ink rounded-sm bg-[var(--accent-soft)] text-ink font-label text-[10px]">
                    Favorites only
                    <button onClick={() => setFilter({ ...filter, favoritesOnly: false })} className="hover:text-accent">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filter.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-2 px-3 py-1 border-[1.5px] border-ink rounded-sm bg-[var(--accent-soft)] text-ink font-label text-[10px]">
                    Tag: {tag}
                    <button
                      onClick={() => setFilter({ ...filter, tags: filter.tags.filter(t => t !== tag) })}
                      className="hover:text-accent"
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
                {...pageMotion}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <Dashboard />
              </motion.div>
            )}

            {activeView === 'graph' && (
              <motion.div
                key="graph"
                {...pageMotion}
                className="h-full"
              >
                <KnowledgeGraph />
              </motion.div>
            )}

            {activeView === 'timeline' && (
              <motion.div
                key="timeline"
                {...pageMotion}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <Timeline
                  content={content}
                  filter={filter}
                  onToggleFavorite={toggleFavorite}
                  onFilterChange={setFilter}
                />
              </motion.div>
            )}

            {activeView === 'almanac' && (
              <motion.div
                key="almanac"
                {...pageMotion}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <Almanac />
              </motion.div>
            )}

            {activeView === 'profile' && (
              <motion.div
                key="profile"
                {...pageMotion}
                className="h-full p-6 overflow-y-auto custom-scrollbar"
              >
                <div className="max-w-xl mx-auto pt-6 pb-24">
                  {/* The flyleaf: whose notebook this is */}
                  <p className="font-label text-[10px] text-accent mb-2">the flyleaf</p>
                  <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-1">
                    This notebook belongs to{' '}
                    <span className="marker">{user?.name || 'you'}</span>
                    <span className="text-accent">.</span>
                  </h2>
                  {user?.email && (
                    <p className="font-mono text-xs text-ink-soft mt-2">{user.email}</p>
                  )}
                  <p className="font-label text-[9px] text-ink-faint mt-3">
                    local profile · {content.length} entr{content.length === 1 ? 'y' : 'ies'} ·{' '}
                    {settings.security.encryptionEnabled ? 'sealed with aes-256' : 'unsealed'}
                  </p>

                  {/* Index of settings pages */}
                  <div className="mt-10 border-t-2 border-[var(--ink)]">
                    {[
                      { icon: Settings, label: 'Settings', detail: 'the fine print, all sections', action: () => setSettingsModalOpen(true) },
                      { icon: Shield, label: 'Privacy & Security', detail: 'encryption, auto-lock, the seal', action: () => setSettingsModalOpen(true, 'security') },
                      { icon: CalendarClock, label: 'Reminders', detail: 'deadline detection on or off', action: () => setSettingsModalOpen(true, 'notifications') },
                      {
                        icon: Download,
                        label: 'Export everything',
                        detail: 'one JSON file, yours to keep',
                        action: () => {
                          exportContent();
                          toast.success('Export downloaded');
                        },
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { hapticTap(); item.action(); }}
                        className="haptic group w-full flex items-center gap-4 py-4 border-b border-[var(--ink-line)] text-left transition-colors hover:bg-[var(--accent-soft)]/40 -mx-3 px-3"
                      >
                        <item.icon size={16} className="text-ink-faint group-hover:text-accent transition-colors flex-shrink-0" />
                        <span className="font-display text-xl text-ink">{item.label}</span>
                        <span className="font-label text-[9px] text-ink-faint ml-auto hidden sm:block">{item.detail}</span>
                        <ChevronRight size={14} className="text-ink-faint group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 flex justify-center">
                    <MadeBadge />
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
          className="hidden sm:block print:!hidden fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.button
            onClick={() => { hapticTap(); setUploadModalOpen(true); }}
            className="btn-ink haptic relative w-14 h-14 rounded-sm flex items-center justify-center"
          >
            <Plus size={24} />
          </motion.button>
        </motion.div>
      )}

      {/* Mobile Navigation */}
      <div className="sm:hidden print:!hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 safe-area-bottom">
        <div className="card-ink-static flex items-center justify-center gap-4 py-2.5 px-6 rounded-sm">
          {([
            { id: 'home', icon: Grid, label: 'Home' },
            { id: 'timeline', icon: Clock, label: 'Timeline' },
          ] as const).map((nav) => (
            <motion.button
              key={nav.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(nav.id)}
              className={`haptic flex flex-col items-center gap-1 p-2 transition-colors ${
                activeView === nav.id ? 'text-accent' : 'text-ink-soft'
              }`}
            >
              <nav.icon size={20} strokeWidth={activeView === nav.id ? 2.5 : 2} />
              <span className="font-label text-[9px]">{nav.label}</span>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticTap(); setUploadModalOpen(true); }}
            className="btn-ink haptic w-12 h-12 rounded-sm flex items-center justify-center"
          >
            <Plus size={24} strokeWidth={2.5} />
          </motion.button>

          {([
            { id: 'graph', icon: Network, label: 'Graph' },
            { id: 'almanac', icon: BarChart3, label: 'Almanac' },
          ] as const).map((nav) => (
            <motion.button
              key={nav.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(nav.id)}
              className={`haptic flex flex-col items-center gap-1 p-2 transition-colors ${
                activeView === nav.id ? 'text-accent' : 'text-ink-soft'
              }`}
            >
              <nav.icon size={20} strokeWidth={activeView === nav.id ? 2.5 : 2} />
              <span className="font-label text-[9px]">{nav.label}</span>
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
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setEncryptionModalOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 text-ink-faint hover:text-ink transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <EncryptionSetup onComplete={handleEncryptionSetup} />
          </div>
        </div>
      )}

      <SettingsModal />

      <CommandPalette />
      <Legend />

      {settings.security.encryptionEnabled && <SecurityBadge variant="floating" />}

      <Toast />
    </div>
  );
}

export default App;

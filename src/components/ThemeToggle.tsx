import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { hapticTap } from '../utils/haptics';

// One-tap daylight/midnight switch, present on every top bar.
// System preference remains available in Settings → Display.
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { settings, updateSettings } = useStore();
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={() => {
        hapticTap();
        updateSettings({ theme: isDark ? 'light' : 'dark' });
      }}
      aria-label={isDark ? 'Switch to daylight' : 'Switch to midnight'}
      title={isDark ? 'Daylight' : 'Midnight'}
      className={`btn-paper haptic p-2 rounded-sm relative overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ y: 10, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.18 }}
          className="block"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

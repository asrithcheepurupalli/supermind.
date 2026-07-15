import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useKeyboardShortcuts = () => {
  const {
    setUploadModalOpen, setSettingsModalOpen, setCommandPaletteOpen,
    setLegendOpen, setActiveView, filter, setFilter,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, shiftKey, key } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // The command palette is global — it opens even while typing.
      if (key === 'k' && isModifierPressed) {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Everything else stays out of the way while the user is typing.
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Single-key page turns (no modifier), vim-style.
      if (!isModifierPressed && !shiftKey && !event.altKey) {
        const viewKeys: Record<string, 'home' | 'timeline' | 'graph' | 'almanac'> = {
          h: 'home', t: 'timeline', g: 'graph', a: 'almanac',
        };
        if (viewKeys[key]) {
          event.preventDefault();
          setActiveView(viewKeys[key]);
          return;
        }
      }

      // "?" opens the legend — the cheat sheet for all of this.
      if (key === '?') {
        event.preventDefault();
        setLegendOpen(true);
        return;
      }

      switch (key) {
        case 'n':
          if (isModifierPressed) {
            event.preventDefault();
            setUploadModalOpen(true);
          }
          break;

        case ',':
          if (isModifierPressed) {
            event.preventDefault();
            setSettingsModalOpen(true);
          }
          break;

        case 'Escape':
          setUploadModalOpen(false);
          setSettingsModalOpen(false);
          setLegendOpen(false);
          break;
        
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (isModifierPressed) {
            event.preventDefault();
            const categoryMap = ['all', 'articles', 'education', 'health', 'work'];
            const categoryIndex = parseInt(key) - 1;
            if (categoryMap[categoryIndex]) {
              setFilter({ ...filter, category: categoryMap[categoryIndex] });
            }
          }
          break;
        
        case 'f':
          if (isModifierPressed && shiftKey) {
            event.preventDefault();
            setFilter({
              ...filter,
              category: 'all',
              contentType: '',
              tags: [],
              searchQuery: '',
              favoritesOnly: false,
              dateRange: undefined,
            });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setUploadModalOpen, setSettingsModalOpen, setCommandPaletteOpen, setLegendOpen, setActiveView, filter, setFilter]);
};
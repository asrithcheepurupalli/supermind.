import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useKeyboardShortcuts = () => {
  const { setUploadModalOpen, setSettingsModalOpen, filter, setFilter } = useStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { ctrlKey, metaKey, shiftKey, key } = event;
      const isModifierPressed = ctrlKey || metaKey;

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
        
        case 'k':
          if (isModifierPressed) {
            event.preventDefault();
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            searchInput?.focus();
          }
          break;
        
        case 'Escape':
          setUploadModalOpen(false);
          setSettingsModalOpen(false);
          break;
        
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (isModifierPressed) {
            event.preventDefault();
            const categoryMap = ['all', 'articles', 'education', 'health', 'fashion'];
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
            });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setUploadModalOpen, setSettingsModalOpen, filter, setFilter]);
};
import { Category } from '../types';

// Base category definitions. Counts are derived from content at render time.
export const baseCategories: Omit<Category, 'count'>[] = [
  { id: 'all', name: 'All Items', icon: 'Grid3X3' },
  { id: 'articles', name: 'Articles', icon: 'FileText' },
  { id: 'education', name: 'Education', icon: 'GraduationCap' },
  { id: 'health', name: 'Health', icon: 'Heart' },
  { id: 'work', name: 'Work', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', icon: 'Heart' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag' },
];

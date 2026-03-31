import { create } from 'zustand';
import { LoadLevel, PriorityLevel, ViewMode, SortField, SortDirection } from '../types';
import { getSetting, saveSetting } from '../data/db';

interface FilterStore {
  filterLoad: LoadLevel | 'all';
  filterPriority: PriorityLevel | 'all';
  filterContext: string;
  showCompleted: boolean;
  showSnoozedTasks: boolean;
  filtersExpanded: boolean;
  viewMode: ViewMode;
  sortBy: SortField;
  sortDirection: SortDirection;
  focusModeEnabled: boolean;

  loadFilterSettings: () => Promise<void>;
  setFilterLoad: (value: LoadLevel | 'all') => void;
  setFilterPriority: (value: PriorityLevel | 'all') => void;
  setFilterContext: (value: string) => void;
  resetFilters: () => void;
  setShowCompleted: (value: boolean) => void;
  setShowSnoozedTasks: (value: boolean) => void;
  toggleFiltersExpanded: () => void;
  setViewMode: (value: ViewMode) => void;
  setSortBy: (value: SortField) => void;
  setSortDirection: (value: SortDirection) => void;
  setFocusModeEnabled: (value: boolean) => void;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filterLoad: 'all',
  filterPriority: 'all',
  filterContext: 'all',
  showCompleted: false,
  showSnoozedTasks: false,
  filtersExpanded: false,
  viewMode: 'custom',
  sortBy: 'load',
  sortDirection: 'asc',
  focusModeEnabled: false,

  loadFilterSettings: async () => {
    const [
      filterLoad,
      filterPriority,
      filterContext,
      showCompleted,
      showSnoozedTasks,
      filtersExpanded,
      viewMode,
      sortBy,
      sortDirection,
      focusModeEnabled,
    ] = await Promise.all([
      getSetting<LoadLevel | 'all'>('filterLoad', 'all'),
      getSetting<PriorityLevel | 'all'>('filterPriority', 'all'),
      getSetting<string>('filterContext', 'all'),
      getSetting<boolean>('showCompleted', false),
      getSetting<boolean>('showSnoozedTasks', false),
      getSetting<boolean>('filtersExpanded', false),
      getSetting<ViewMode>('viewMode', 'custom'),
      getSetting<SortField>('sortBy', 'load'),
      getSetting<SortDirection>('sortDirection', 'asc'),
      getSetting<boolean>('focusModeEnabled', false),
    ]);

    set({
      filterLoad,
      filterPriority,
      filterContext,
      showCompleted,
      showSnoozedTasks,
      filtersExpanded,
      viewMode,
      sortBy,
      sortDirection,
      focusModeEnabled,
    });
  },

  setFilterLoad: (value) => {
    set({ filterLoad: value });
    saveSetting('filterLoad', value);
  },

  setFilterPriority: (value) => {
    set({ filterPriority: value });
    saveSetting('filterPriority', value);
  },

  setFilterContext: (value) => {
    set({ filterContext: value });
    saveSetting('filterContext', value);
  },

  resetFilters: () => {
    set({ filterLoad: 'all', filterPriority: 'all', filterContext: 'all' });
    saveSetting('filterLoad', 'all');
    saveSetting('filterPriority', 'all');
    saveSetting('filterContext', 'all');
  },

  setShowCompleted: (value) => {
    set({ showCompleted: value });
    saveSetting('showCompleted', value);
  },

  setShowSnoozedTasks: (value) => {
    set({ showSnoozedTasks: value });
    saveSetting('showSnoozedTasks', value);
  },

  toggleFiltersExpanded: () => {
    const next = !get().filtersExpanded;
    set({ filtersExpanded: next });
    saveSetting('filtersExpanded', next);
  },

  setViewMode: (value) => {
    set({ viewMode: value });
    saveSetting('viewMode', value);
  },

  setSortBy: (value) => {
    set({ sortBy: value });
    saveSetting('sortBy', value);
  },

  setSortDirection: (value) => {
    set({ sortDirection: value });
    saveSetting('sortDirection', value);
  },

  setFocusModeEnabled: (value) => {
    set({ focusModeEnabled: value });
    saveSetting('focusModeEnabled', value);
  },
}));
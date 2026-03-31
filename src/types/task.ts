// Core value union types
export type LoadLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type EnergyLevel = 'tired' | 'normal' | 'ambitious';
export type ViewMode = 'custom' | 'sorted';
export type SortField = 'load' | 'priority';
export type SortDirection = 'asc' | 'desc';

// Core data shape
export interface Task {
  id: string;
  title: string;
  load: LoadLevel;
  priority: PriorityLevel;
  context: string;
  done: boolean;
  createdAt: number;
  snoozedUntil: number | null;
  position: number;
}

// Edit form draft — null means nothing is being edited
export interface EditDraft {
  taskId: string;
  title: string;
  load: LoadLevel;
  priority: PriorityLevel;
  context: string;
}
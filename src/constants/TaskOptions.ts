import { LoadLevel, PriorityLevel } from '../types';

// ── Labels ─────────────────────────────────────────────────────────────────

export const LOAD_LABELS: Record<LoadLevel, string> = {
  low: 'Low cognitive load',
  medium: 'Medium cognitive load',
  high: 'High cognitive load',
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low: 'Low priority',
  medium: 'Medium priority',
  high: 'High priority',
};

export const LOAD_PILL_LABELS: Record<LoadLevel, string> = {
  low: 'Low load',
  medium: 'Med load',
  high: 'High load',
};

export const PRIORITY_PILL_LABELS: Record<PriorityLevel, string> = {
  low: 'Low priority',
  medium: 'Med priority',
  high: 'High priority',
};

// ── Short labels (used in TaskForm segment picker) ─────────────────────────

export const LOAD_SHORT: Record<LoadLevel, string> = {
  low: 'low load',
  medium: 'med load',
  high: 'high load',
};

export const PRIORITY_SHORT: Record<PriorityLevel, string> = {
  low: 'low priority',
  medium: 'med priority',
  high: 'high priority',
};

// ── Select options (used in TaskForm and EditTaskModal) ────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export const LOAD_OPTIONS: SelectOption[] = [
  { value: 'low',    label: 'Low cognitive load' },
  { value: 'medium', label: 'Medium cognitive load' },
  { value: 'high',   label: 'High cognitive load' },
];

export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low',    label: 'Low priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'high',   label: 'High priority' },
];

// ── Default contexts ───────────────────────────────────────────────────────

export const DEFAULT_CONTEXT_OPTIONS: string[] = [
  'kitchen',
  'bathroom',
  'garage',
  'computer',
  'phone',
  'errands',
  'outside',
  'laundry',
  'admin',
  'general',
];

// ── Color types ────────────────────────────────────────────────────────────

export interface ColorPair {
  bg: string;
  text: string;
}

// ── Load pill colors ───────────────────────────────────────────────────────

export const LOAD_PILL_COLORS: Record<LoadLevel, ColorPair> = {
  low:    { bg: 'var(--load-low-bg)',    text: 'var(--load-low)' },
  medium: { bg: 'var(--load-medium-bg)', text: 'var(--load-medium)' },
  high:   { bg: 'var(--load-high-bg)',   text: 'var(--load-high)' },
};

// ── Priority pill colors ───────────────────────────────────────────────────

export const PRIORITY_PILL_COLORS: Record<PriorityLevel, ColorPair> = {
  low:    { bg: 'var(--priority-low-bg)',    text: 'var(--priority-low)' },
  medium: { bg: 'var(--priority-medium-bg)', text: 'var(--priority-medium)' },
  high:   { bg: 'var(--priority-high-bg)',   text: 'var(--priority-high)' },
};

// ── Context colors — preset ────────────────────────────────────────────────
// Note: Left as hex values. 20 colors across preset and custom pools makes
// CSS variables overkill for a demo app. Will remain bright in dark mode
// which works fine as accent colors.

const CONTEXT_COLORS: Record<string, ColorPair> = {
  kitchen:  { bg: '#fef3c7', text: '#92400e' }, // amber
  bathroom: { bg: '#ccfbf1', text: '#0f766e' }, // teal
  garage:   { bg: '#f1f5f9', text: '#475569' }, // slate
  computer: { bg: '#dbeafe', text: '#1e3a8a' }, // blue
  phone:    { bg: '#ede9fe', text: '#5b21b6' }, // violet
  errands:  { bg: '#ffedd5', text: '#c2410c' }, // orange
  outside:  { bg: '#dcfce7', text: '#15803d' }, // green
  laundry:  { bg: '#e0f2fe', text: '#075985' }, // sky
  admin:    { bg: '#ffe4e6', text: '#be123c' }, // rose
  general:  { bg: '#f3f4f6', text: '#4b5563' }, // gray
};

// ── Context colors — pool for custom contexts ──────────────────────────────

const CUSTOM_COLOR_POOL: ColorPair[] = [
  { bg: '#fce7f3', text: '#9d174d' }, // pink
  { bg: '#ecfdf5', text: '#065f46' }, // emerald
  { bg: '#fef9c3', text: '#854d0e' }, // yellow
  { bg: '#f0fdf4', text: '#166534' }, // light green
  { bg: '#fdf2f8', text: '#701a75' }, // fuchsia
  { bg: '#fff1f2', text: '#9f1239' }, // deep rose
  { bg: '#f0f9ff', text: '#0c4a6e' }, // deep sky
  { bg: '#fafaf9', text: '#292524' }, // stone
  { bg: '#f5f3ff', text: '#4c1d95' }, // deep violet
  { bg: '#ecfeff', text: '#164e63' }, // cyan
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

/**
 * Returns the color pair for a context.
 *
 * Priority order:
 * 1. User override (from contextColorOverrides, if provided and present)
 * 2. Preset CONTEXT_COLORS
 * 3. CUSTOM_COLOR_POOL (deterministic hash)
 */
export function getContextColor(
  context: string,
  overrides?: Record<string, ColorPair>
): ColorPair {
  if (!context) return CONTEXT_COLORS.general;
  if (overrides?.[context]) return overrides[context];
  if (CONTEXT_COLORS[context]) return CONTEXT_COLORS[context];
  return CUSTOM_COLOR_POOL[hashString(context) % CUSTOM_COLOR_POOL.length];
}
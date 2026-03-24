export const LOAD_LABELS = {
  low: "Low cognitive load",
  medium: "Medium cognitive load",
  high: "High cognitive load",
};

export const PRIORITY_LABELS = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
};

export const LOAD_PILL_LABELS = {
  low: "Low load",
  medium: "Med load",
  high: "High load",
};

export const PRIORITY_PILL_LABELS = {
  low: "Low priority",
  medium: "Med priority",
  high: "High priority",
};

export const DEFAULT_CONTEXT_OPTIONS = [
  "kitchen",
  "bathroom",
  "garage",
  "computer",
  "phone",
  "errands",
  "outside",
  "laundry",
  "admin",
  "general",
];

// ── Load pill colors ──
export const LOAD_PILL_COLORS = {
  low:    { bg: "#dbeafe", text: "#1e40af" }, // blue
  medium: { bg: "#ffedd5", text: "#9a3412" }, // orange
  high:   { bg: "#fee2e2", text: "#b91c1c" }, // red
};

// ── Priority pill colors ──
export const PRIORITY_PILL_COLORS = {
  low:    { bg: "#f1f5f9", text: "#475569" }, // slate
  medium: { bg: "#eef2ff", text: "#3730a3" }, // indigo
  high:   { bg: "#fdf4ff", text: "#86198f" }, // purple
};

// ── Context colors — preset ──
const CONTEXT_COLORS = {
  kitchen:  { bg: "#fef3c7", text: "#92400e" }, // amber
  bathroom: { bg: "#ccfbf1", text: "#0f766e" }, // teal
  garage:   { bg: "#f1f5f9", text: "#475569" }, // slate
  computer: { bg: "#dbeafe", text: "#1e3a8a" }, // blue
  phone:    { bg: "#ede9fe", text: "#5b21b6" }, // violet
  errands:  { bg: "#ffedd5", text: "#c2410c" }, // orange
  outside:  { bg: "#dcfce7", text: "#15803d" }, // green
  laundry:  { bg: "#e0f2fe", text: "#075985" }, // sky
  admin:    { bg: "#ffe4e6", text: "#be123c" }, // rose
  general:  { bg: "#f3f4f6", text: "#4b5563" }, // gray
};

// ── Context colors — pool for custom contexts ──
const CUSTOM_COLOR_POOL = [
  { bg: "#fce7f3", text: "#9d174d" }, // pink
  { bg: "#ecfdf5", text: "#065f46" }, // emerald
  { bg: "#fef9c3", text: "#854d0e" }, // yellow
  { bg: "#f0fdf4", text: "#166534" }, // light green
  { bg: "#fdf2f8", text: "#701a75" }, // fuchsia
  { bg: "#fff1f2", text: "#9f1239" }, // deep rose
  { bg: "#f0f9ff", text: "#0c4a6e" }, // deep sky
  { bg: "#fafaf9", text: "#292524" }, // stone
  { bg: "#f5f3ff", text: "#4c1d95" }, // deep violet
  { bg: "#ecfeff", text: "#164e63" }, // cyan
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

export function getContextColor(context) {
  if (!context) return CONTEXT_COLORS.general;
  if (CONTEXT_COLORS[context]) return CONTEXT_COLORS[context];
  return CUSTOM_COLOR_POOL[hashString(context) % CUSTOM_COLOR_POOL.length];
}
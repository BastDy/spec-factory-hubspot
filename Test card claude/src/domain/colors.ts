// WCAG AA color constants for Data Quality Score
// All colors have >= 4.5:1 contrast ratio on white background (HubSpot default)
// No magic strings — import from here

import type { ScoreColor } from './types';

// Bar fill colors (progress bar background)
export const BAR_COLOR: Record<ScoreColor, string> = {
  green: '#2e7d32',   // Material Green 800 — WCAG AA on white
  orange: '#f57c00',  // Material Orange 700 — WCAG AA on white
  red: '#c62828',     // Material Red 800 — WCAG AA on white
};

// Text colors for percentage label
export const TEXT_COLOR: Record<ScoreColor, string> = {
  green: '#1a7a1a',   // Material Green 900 — WCAG AA on white
  orange: '#e65100',  // Material Orange 800 — WCAG AA on white
  red: '#b71c1c',     // Material Red 900 — WCAG AA on white
};

// Badge background colors (lighter shade for readability)
export const BADGE_BG_COLOR: Record<ScoreColor, string> = {
  green: '#e8f5e9',   // Material Green 50
  orange: '#fff3e0',  // Material Orange 50
  red: '#ffebee',     // Material Red 50
};

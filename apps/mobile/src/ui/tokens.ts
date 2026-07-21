import type { ViewStyle } from 'react-native';

import { dashboardTheme } from '@/src/shared/dashboardTheme';
import { fonts, palette } from '@/src/shared/theme';

/**
 * Single import surface for the design system. Re-exports the existing token
 * files (do not re-derive colors) and adds the DSD §2-4 scales that only lived
 * in docs/dsd-drowzi.md, not in code.
 */
export { dashboardTheme, fonts, palette };

/** Semantic color aliases — dark shell is the app default (DSD §2). */
export const color = {
  ...dashboardTheme,
  primaryHover: '#D9AC1E',
  alarm: '#E63946',
  alarmAlt: '#FF5A5F',
  warning: '#FF9800',
  error: '#E63946',
  /** Alarm-active inversion (DSD §2 note): yellow bg, brown text. */
  invertBg: '#F4C430',
  invertText: '#654321',
} as const;

/** 4px base unit (DSD §3). */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
} as const;

/** DSD §4 component radii. */
export const radius = {
  input: 10,
  button: 12,
  card: 16,
  pill: 999,
} as const;

/** DSD §2 elevation table, as RN shadow objects. */
export const shadow: Record<'sm' | 'md' | 'lg', ViewStyle> = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 6 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.8, shadowRadius: 32, elevation: 12 },
};

/** Minimum tap target — groggy-user accessibility (DSD §4/§6). */
export const TAP_MIN = 52;

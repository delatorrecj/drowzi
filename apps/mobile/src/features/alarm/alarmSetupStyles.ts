import { Platform, StyleSheet } from 'react-native';

import { dashboardTheme } from '@/src/shared/dashboardTheme';

/** Shared dark DS for onboarding + add-alarm (matches dashboard). */
export const alarmSetupStyles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: dashboardTheme.bg,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    flexGrow: 1,
  },
  block: {
    gap: 12,
    paddingBottom: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    color: dashboardTheme.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hero: {
    fontSize: 30,
    fontWeight: '900',
    color: dashboardTheme.text,
    lineHeight: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: dashboardTheme.text,
    lineHeight: 32,
  },
  lede: {
    fontSize: 15,
    lineHeight: 22,
    color: dashboardTheme.textMuted,
    marginBottom: 8,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: dashboardTheme.text,
  },
  bodyMuted: {
    fontSize: 15,
    lineHeight: 22,
    color: dashboardTheme.textMuted,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: dashboardTheme.border,
    backgroundColor: dashboardTheme.surface,
    gap: 6,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: dashboardTheme.primary,
    backgroundColor: 'rgba(244, 196, 48, 0.12)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: dashboardTheme.text,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: dashboardTheme.textMuted,
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: dashboardTheme.textMuted,
  },
  input: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: dashboardTheme.border,
    fontSize: 17,
    color: dashboardTheme.text,
    backgroundColor: dashboardTheme.surface,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 28,
    gap: 12,
  },
  primary: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: dashboardTheme.primary,
    borderWidth: 2,
    borderColor: dashboardTheme.border,
    alignItems: 'center',
  },
  primaryDisabled: {
    opacity: 0.45,
  },
  primaryLabel: {
    color: dashboardTheme.textOnPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  secondary: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: dashboardTheme.border,
    alignItems: 'center',
    marginBottom: -4,
    backgroundColor: dashboardTheme.surface,
  },
  secondaryLabel: {
    color: dashboardTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  ghost: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostLabel: {
    color: dashboardTheme.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});

export const alarmSetupScreenOptions = {
  headerTintColor: dashboardTheme.text,
  headerStyle: { backgroundColor: dashboardTheme.bg },
  headerTitleStyle: { fontWeight: '800' as const, color: dashboardTheme.text },
  headerShadowVisible: false,
};

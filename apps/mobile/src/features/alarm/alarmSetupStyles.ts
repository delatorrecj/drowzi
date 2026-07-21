import { Platform, StyleSheet } from 'react-native';

import { dashboardTheme } from '@/src/shared/dashboardTheme';
import { fonts } from '@/src/shared/theme';

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
    fontFamily: fonts.bodyBold,
    color: dashboardTheme.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hero: {
    fontSize: 30,
    fontFamily: fonts.headlineBlack,
    color: dashboardTheme.text,
    lineHeight: 36,
  },
  title: {
    fontSize: 26,
    fontFamily: fonts.headlineBlack,
    color: dashboardTheme.text,
    lineHeight: 32,
  },
  lede: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
    color: dashboardTheme.textMuted,
    marginBottom: 8,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    fontFamily: fonts.body,
    color: dashboardTheme.text,
  },
  bodyMuted: {
    fontSize: 15,
    lineHeight: 22,
    color: dashboardTheme.textMuted,
    fontFamily: fonts.bodySemiBold,
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
    fontFamily: fonts.headlineExtraBold,
    color: dashboardTheme.text,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
    color: dashboardTheme.textMuted,
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
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
    fontFamily: fonts.body,
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
    fontFamily: fonts.headlineExtraBold,
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
    fontFamily: fonts.headlineBold,
  },
  ghost: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostLabel: {
    color: dashboardTheme.textMuted,
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
  },
  timeDisplayWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  timeDisplay: {
    fontSize: 56,
    lineHeight: 60,
    fontFamily: fonts.headlineExtraBold,
    color: dashboardTheme.text,
    letterSpacing: -1,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  stepper: {
    flex: 1,
    paddingHorizontal: 0,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: dashboardTheme.alarmAccent,
  },
});

export const alarmSetupScreenOptions = {
  headerTintColor: dashboardTheme.text,
  headerStyle: { backgroundColor: dashboardTheme.bg },
  headerTitleStyle: { fontWeight: '800' as const, color: dashboardTheme.text },
  headerShadowVisible: false,
};

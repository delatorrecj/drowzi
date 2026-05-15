import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, View } from 'react-native';

import { dashboardTheme } from '@/src/shared/dashboardTheme';

type Props = {
  /** Swap asset when streak thresholds land (PRD mascot evolution). */
  mood?: 'sleepy' | 'steady';
};

export function DashboardMascotPlaceholder({ mood = 'sleepy' }: Props) {
  return (
    <View style={styles.card} accessibilityRole="image" accessibilityLabel="Mascot placeholder">
      <View style={[styles.frame, mood === 'steady' && styles.frameSteady]}>
        <FontAwesome name="fire" size={48} color={dashboardTheme.primary} style={styles.icon} />
      </View>
      <Text style={styles.title}>Mascot</Text>
      <Text style={styles.hint}>
        Add pixel art to assets/dashboard/ — see ASSETS.md ({mood === 'sleepy' ? 'sleepy' : 'steady'} state)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  frame: {
    width: 168,
    height: 168,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: dashboardTheme.border,
    backgroundColor: dashboardTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameSteady: {
    borderColor: dashboardTheme.primary,
  },
  icon: {
    opacity: 0.85,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: dashboardTheme.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: dashboardTheme.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
    opacity: 0.9,
  },
});

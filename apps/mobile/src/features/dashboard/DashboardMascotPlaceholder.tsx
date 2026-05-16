import { Image, StyleSheet, Text, View } from 'react-native';

import { mascotAssets, MascotMood } from '@/assets/images/mascot';
import { dashboardTheme } from '@/src/shared/dashboardTheme';

type Props = {
  mood?: MascotMood;
};

export function DashboardMascotPlaceholder({ mood = 'idle' }: Props) {
  const imageSource = mascotAssets[mood] || mascotAssets.idle;

  return (
    <View style={styles.card} accessibilityRole="image" accessibilityLabel="Drowzi Mascot">
      <View style={styles.frame}>
        <Image source={imageSource} style={styles.mascotImage} resizeMode="contain" />
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{mood.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: -12, // Overlap the badge slightly
    paddingVertical: 12,
  },
  frame: {
    width: 180,
    height: 180,
    borderRadius: 90, // Circular frame
    borderWidth: 4,
    borderColor: dashboardTheme.primary,
    backgroundColor: dashboardTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: dashboardTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  mascotImage: {
    width: '85%',
    height: '85%',
  },
  badge: {
    backgroundColor: dashboardTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: dashboardTheme.textOnPrimary,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: dashboardTheme.textOnPrimary,
    letterSpacing: 1,
  },
});

import { Image, StyleSheet, Text, View } from 'react-native';

import { mascotAssets } from '@/assets/images/mascot';
import { dashboardTheme } from '@/src/shared/dashboardTheme';

type Props = {
  mood?: keyof typeof mascotAssets;
};

export function DashboardMascotPlaceholder({ mood = 'idle' }: Props) {
  const imageSource = mascotAssets[mood] || mascotAssets.idle;

  return (
    <View style={styles.card} accessibilityRole="image" accessibilityLabel="Mascot">
      <View style={styles.frame}>
        <Image source={imageSource} style={styles.mascotImage} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Mascot</Text>
      <Text style={styles.hint}>
        State: {mood}
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
    overflow: 'hidden',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
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

import { Image, StyleSheet, View } from 'react-native';

import { mascotAssets, type MascotMood } from '@/assets/images/mascot';
import { AppText } from '@/src/ui/Text';
import { color, radius, space } from '@/src/ui/tokens';

/** Streak stages — mirrors website MascotSection (Day 0 -> 30). */
const STAGES: { day: number; mood: MascotMood; name: string }[] = [
  { day: 0, mood: 'idle', name: 'Sleepy' },
  { day: 7, mood: 'awake', name: 'Awake' },
  { day: 14, mood: 'focused', name: 'Focused' },
  { day: 21, mood: 'pumped', name: 'Pumped' },
  { day: 30, mood: 'legendary', name: 'Legendary' },
];

/** Index of the highest stage the streak has reached. */
function currentStage(streak: number): number {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i += 1) if (streak >= STAGES[i].day) idx = i;
  return idx;
}

type Props = { streak: number };

/**
 * Dashboard hero: the mascot evolution strip. The reached stage is large + full
 * opacity; future stages shrink and fade. Progress bar fills toward Day 30.
 */
export function MascotEvolution({ streak }: Props) {
  const active = currentStage(streak);
  const fillPct = Math.min(100, (streak / 30) * 100);
  const stage = STAGES[active];

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Image source={mascotAssets[stage.mood]} style={styles.heroImg} resizeMode="contain" />
      </View>
      <AppText variant="h3" color={color.primary}>
        {stage.name}
      </AppText>
      <AppText variant="caption" color={color.textMuted}>
        {streak}-day streak
      </AppText>

      <View style={styles.strip}>
        {STAGES.map((s, i) => {
          const reached = i <= active;
          return (
            <View key={s.day} style={styles.stageCol}>
              <Image
                source={mascotAssets[s.mood]}
                style={[styles.thumb, { opacity: reached ? 1 : 0.35, transform: [{ scale: reached ? 1 : 0.8 }] }]}
                resizeMode="contain"
              />
              <AppText variant="caption" color={reached ? color.text : color.textMuted} style={styles.dayLabel}>
                D{s.day}
              </AppText>
            </View>
          );
        })}
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space[1], paddingVertical: space[2] },
  hero: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: color.primary,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImg: { width: '85%', height: '85%' },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    marginTop: space[3],
    paddingHorizontal: space[2],
  },
  stageCol: { alignItems: 'center', gap: 2, flex: 1 },
  thumb: { width: 40, height: 40 },
  dayLabel: { fontSize: 11 },
  track: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.border,
    overflow: 'hidden',
    marginTop: space[2],
  },
  fill: { height: 8, borderRadius: radius.pill, backgroundColor: color.primary },
});

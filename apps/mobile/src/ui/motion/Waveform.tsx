import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { color } from '@/src/ui/tokens';

const BARS = 7;

/** Voice-gate listening indicator — staggered pulsing bars (website PhoneMockup). */
export function Waveform() {
  return (
    <View style={styles.row}>
      {Array.from({ length: BARS }, (_, i) => (
        <Bar key={i} index={i} />
      ))}
    </View>
  );
}

function Bar({ index }: { index: number }) {
  const s = useSharedValue(0.3);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      s.value = 0.6;
      return;
    }
    // Deterministic per-bar height + phase (no Math.random in worklet scope).
    const peak = 0.5 + ((index * 37) % 50) / 100;
    s.value = withDelay(index * 90, withRepeat(withTiming(peak, { duration: 400 }), -1, true));
  }, [index, reduced, s]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: s.value }] }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 60 },
  bar: {
    width: 6,
    height: 60,
    borderRadius: 3,
    backgroundColor: color.primary,
  },
});

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { color } from '@/src/ui/tokens';

/** Barcode viewfinder scan line — sweeps top to bottom (website PhoneMockup). */
export function ScanLine({ height = 200 }: { height?: number }) {
  const y = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    y.value = withRepeat(withTiming(height - 3, { duration: 1600 }), -1, true);
  }, [height, reduced, y]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <View style={[styles.frame, { height }]} pointerEvents="none">
      <Animated.View style={[styles.line, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'stretch', overflow: 'hidden' },
  line: {
    height: 3,
    backgroundColor: color.primary,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
});

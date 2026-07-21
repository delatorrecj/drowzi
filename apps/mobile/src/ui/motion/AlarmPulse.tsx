import { useEffect } from 'react';
import { type ViewProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { color } from '@/src/ui/tokens';

type Props = ViewProps & {
  /** Colors to loop between (default yellow <-> red, DSD §5). */
  from?: string;
  to?: string;
};

/**
 * DSD §5 alarm pulse: background loops between two colors (1000ms). Sized by the
 * caller's `style` — use as a compact "alarm active" chip or a full backdrop
 * (`style={StyleSheet.absoluteFill}`). Holds `from` static under reduced motion.
 */
export function AlarmPulse({ from = color.invertBg, to = color.alarm, style, children, ...rest }: Props) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, [reduced, t]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [from, to]),
  }));

  return (
    <Animated.View style={[{ backgroundColor: from }, style, animatedStyle]} {...rest}>
      {children}
    </Animated.View>
  );
}

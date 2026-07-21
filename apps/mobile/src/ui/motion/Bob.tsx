import { useEffect } from 'react';
import { type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = ViewProps & {
  /** Vertical drift in px (default 6). */
  distance?: number;
  /** Half-cycle duration in ms (default 1600). */
  duration?: number;
};

/**
 * Gentle idle breathe/bob — small upward drift + subtle scale, looping. Gives a
 * static mascot a sense of life. Holds still under reduced motion.
 */
export function Bob({ distance = 6, duration = 1600, style, children, ...rest }: Props) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withTiming(1, { duration }), -1, true);
  }, [duration, reduced, t]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -distance * t.value }, { scale: 1 + 0.02 * t.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} {...rest}>
      {children}
    </Animated.View>
  );
}

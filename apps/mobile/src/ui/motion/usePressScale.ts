import { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * DSD §5 button press: scale to 0.96 on press-in, snap back on release.
 * Returns an animated style + press handlers to spread onto an Animated.Pressable.
 * No-op under reduced motion.
 */
export function usePressScale(pressedScale = 0.96) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = () => {
    if (!reduced) scale.value = withTiming(pressedScale, { duration: 100 });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return { animatedStyle, onPressIn, onPressOut };
}

import { ActivityIndicator, Pressable, type PressableProps, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/src/ui/Text';
import { usePressScale } from '@/src/ui/motion/usePressScale';
import { color, radius, TAP_MIN } from '@/src/ui/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'secondary';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: ViewStyle;
};

const BG: Record<ButtonVariant, string> = {
  primary: color.primary,
  danger: color.alarm,
  secondary: color.surface,
  ghost: 'transparent',
};
const FG: Record<ButtonVariant, string> = {
  primary: color.textOnPrimary,
  danger: '#FFFFFF',
  secondary: color.text,
  ghost: color.primary,
};

/**
 * DSD §4 button. 52px min tap target, radius 12, press dims (scale animation
 * wired in Phase 4 via usePressScale). Replaces the re-inlined Pressable+Text
 * buttons across screens.
 */
export function Button({ title, variant = 'primary', loading, disabled, style, onPressIn, onPressOut, ...rest }: Props) {
  const isDisabled = disabled || loading;
  const press = usePressScale();
  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPressIn={(e) => {
        press.onPressIn();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        press.onPressOut();
        onPressOut?.(e);
      }}
      style={[
        styles.base,
        {
          backgroundColor: BG[variant],
          borderColor: variant === 'ghost' ? color.primary : color.border,
          borderWidth: variant === 'primary' ? 2 : 1,
        },
        isDisabled && styles.disabled,
        press.animatedStyle,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <View style={styles.row}>
          <AppText variant="bodyStrong" color={FG[variant]} style={styles.label}>
            {title}
          </AppText>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TAP_MIN,
    borderRadius: radius.button,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 16 },
  disabled: { opacity: 0.4 },
});

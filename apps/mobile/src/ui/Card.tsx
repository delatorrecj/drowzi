import { StyleSheet, View, type ViewProps } from 'react-native';

import { color, radius, shadow, space } from '@/src/ui/tokens';

type Props = ViewProps & {
  selected?: boolean;
};

/** DSD §4 surface. Selected state = yellow border + tint (reused by ExercisePicker). */
export function Card({ selected, style, ...rest }: Props) {
  return <View style={[styles.card, selected && styles.selected, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    gap: space[2],
    ...shadow.sm,
  },
  selected: {
    borderWidth: 2,
    borderColor: color.primary,
    backgroundColor: 'rgba(244, 196, 48, 0.12)',
  },
});

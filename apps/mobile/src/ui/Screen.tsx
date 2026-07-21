import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { color } from '@/src/ui/tokens';

type Props = ViewProps & {
  /** Yellow alarm-active inversion (DSD §2 note). */
  inverted?: boolean;
  edges?: readonly Edge[];
};

/** SafeArea + themed background wrapper. `inverted` for the alarm ring screen. */
export function Screen({ inverted, edges = ['top'], style, ...rest }: Props) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: inverted ? color.invertBg : color.bg }]}>
      <View style={[styles.body, style]} {...rest} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1 },
});

import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { Icon, type IconName } from '@/src/ui/Icon';
import { color, radius, space } from '@/src/ui/tokens';

type Props = {
  icon?: IconName;
  title: string;
  body?: string;
  cta?: { label: string; onPress: () => void };
};

/** Composed placeholder for zero-data sections — icon tile + title + body + optional CTA. */
export function EmptyState({ icon, title, body, cta }: Props) {
  return (
    <View style={styles.wrap}>
      {icon ? (
        <View style={styles.iconTile}>
          <Icon name={icon} size={26} stroke={color.primary} />
        </View>
      ) : null}
      <AppText variant="h3" style={styles.center}>
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={color.textMuted} style={styles.center}>
          {body}
        </AppText>
      ) : null}
      {cta ? (
        <Button title={cta.label} onPress={cta.onPress} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space[3], paddingVertical: space[6], paddingHorizontal: space[4] },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  center: { textAlign: 'center' },
  cta: { marginTop: space[1] },
});

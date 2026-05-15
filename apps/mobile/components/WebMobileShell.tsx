import { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { LG_MIN_WIDTH, palette, WEB_APP_MAX_WIDTH } from '@/src/shared/theme';

type Props = {
  children: ReactNode;
};

export function WebMobileShell({ children }: Props) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isLgWeb = Platform.OS === 'web' && width >= LG_MIN_WIDTH;
  const gutterBg =
    colorScheme === 'dark' ? palette.shellGutterDark : palette.shellGutter;

  return (
    <View style={[styles.outer, { backgroundColor: gutterBg }]}>
      <View style={[styles.inner, isLgWeb && styles.innerLgWeb]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  innerLgWeb: {
    maxWidth: WEB_APP_MAX_WIDTH,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 18,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
        }
      : {}),
  },
});

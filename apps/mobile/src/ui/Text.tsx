import { Text, type TextProps, type TextStyle } from 'react-native';

import { color, fonts } from '@/src/ui/tokens';

/** DSD §2 typography roles. */
export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'caption' | 'label' | 'stat';

const VARIANTS: Record<TextVariant, TextStyle> = {
  h1: { fontFamily: fonts.headlineExtraBold, fontSize: 56, lineHeight: 56 },
  h2: { fontFamily: fonts.headlineExtraBold, fontSize: 30, lineHeight: 34 },
  h3: { fontFamily: fonts.headlineBold, fontSize: 22, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 18, letterSpacing: 1, textTransform: 'uppercase' },
  stat: { fontFamily: fonts.headlineExtraBold, fontSize: 48, lineHeight: 48 },
};

type Props = TextProps & {
  variant?: TextVariant;
  /** Override text color; defaults to cream body text on the dark shell. */
  color?: string;
};

/**
 * The one Text primitive. Applies the loaded Montserrat/Inter family per DSD §2
 * — fixes the app-wide system-font fallback where screens set only numeric
 * fontWeight. Use `color={color.invertText}` on the yellow alarm screens.
 */
export function AppText({ variant = 'body', color: c, style, ...rest }: Props) {
  return <Text {...rest} style={[VARIANTS[variant], { color: c ?? color.text }, style]} />;
}

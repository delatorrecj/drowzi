import { fonts } from '@/src/shared/theme';

import { Text, TextProps } from './Themed';

/** Paths / inline code: same as body (Inter), slight tracking for readability */
export function MonoText(props: TextProps) {
  return (
    <Text {...props} style={[props.style, { fontFamily: fonts.body, letterSpacing: 0.3 }]} />
  );
}

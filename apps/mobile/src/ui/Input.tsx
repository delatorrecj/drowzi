import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { color, fonts, radius } from '@/src/ui/tokens';

/** DSD §4 input — surface bg, radius 10, yellow focus ring. */
export function Input({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={color.placeholderMuted}
      style={[styles.input, focused && styles.focused, style]}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: color.border,
    fontFamily: fonts.body,
    fontSize: 16,
    color: color.text,
    backgroundColor: color.surface,
  },
  focused: {
    borderWidth: 2,
    borderColor: color.primary,
  },
});

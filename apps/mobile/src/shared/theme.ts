import {
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/** Tailwind `lg` — web centered shell activates at this width */
export const LG_MIN_WIDTH = 1024;
/** Typical phone logical width for centered web column */
export const WEB_APP_MAX_WIDTH = 428;

/** INIT.md + docs/dsd-drowzi.md brand tokens */
export const palette = {
  awakeningYellow: '#F4C430',
  groundedBrown: '#654321',
  adrenalineRed: '#E63946',
  pulseOrange: '#FF5A5F',
  surfaceLight: '#FFF8E7',
  surfaceDark: '#1a1510',
  /** Web lg+ gutters: desk / viewport behind centered phone column */
  shellGutter: '#ded8ce',
  shellGutterDark: '#252019',
} as const;

/** Names must match keys passed to expo-font useFonts */
export const fonts = {
  headlineBlack: 'Montserrat_900Black',
  headlineExtraBold: 'Montserrat_800ExtraBold',
  headlineBold: 'Montserrat_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Spread into useFonts({ ...loadAppFonts(), ...iconFonts }) */
export function loadAppFonts() {
  return {
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  };
}

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { WebMobileShell } from '@/components/WebMobileShell';
import { useColorScheme } from '@/components/useColorScheme';
import { alarmSetupScreenOptions } from '@/src/features/alarm/alarmSetupStyles';
import { fonts, loadAppFonts } from '@/src/shared/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...loadAppFonts(),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const navigationFonts = {
  regular: { fontFamily: fonts.body, fontWeight: '400' as const },
  medium: { fontFamily: fonts.bodyMedium, fontWeight: '500' as const },
  bold: { fontFamily: fonts.bodySemiBold, fontWeight: '600' as const },
  heavy: { fontFamily: fonts.headlineExtraBold, fontWeight: '800' as const },
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    fonts: navigationFonts,
  };

  return (
    <WebMobileShell>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ title: 'Welcome', ...alarmSetupScreenOptions }} />
          <Stack.Screen name="add-alarm" options={{ title: 'Add alarm', ...alarmSetupScreenOptions }} />
          <Stack.Screen name="habit-gate/[alarmId]" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </WebMobileShell>
  );
}

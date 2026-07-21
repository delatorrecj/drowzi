import { Stack } from 'expo-router';

import { dashboardTheme } from '@/src/shared/dashboardTheme';

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: dashboardTheme.bg },
        headerTintColor: dashboardTheme.primary,
        headerTitleStyle: { fontWeight: '800', color: dashboardTheme.text },
        contentStyle: { backgroundColor: dashboardTheme.bg },
      }}>
      <Stack.Screen name="motion" options={{ title: 'Practice · Motion' }} />
      <Stack.Screen name="barcode" options={{ title: 'Practice · Barcode' }} />
      <Stack.Screen name="voice" options={{ title: 'Practice · Voice' }} />
      <Stack.Screen name="alarm" options={{ title: 'Practice · Alarm test' }} />
    </Stack>
  );
}

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme/theme';
import { colors } from './src/theme/colors';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Request notification permissions on launch (no-op on web / when denied).
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

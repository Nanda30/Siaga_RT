import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Initialize push notifications
    registerForPushNotificationsAsync();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <AppNavigator />
    </PaperProvider>
  );
}

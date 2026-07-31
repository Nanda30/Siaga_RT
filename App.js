import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme, darkTheme } from './src/theme/theme';
import { colors, darkColors } from './src/theme/colors';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/notifications';
import { ThemeProvider, useThemeContext } from './src/theme/ThemeContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function MainApp() {
  const { isDark } = useThemeContext();
  const activeTheme = isDark ? darkTheme : theme;
  const activeColors = isDark ? darkColors : colors;

  useEffect(() => {
    // Request notification permissions on launch (no-op on web / when denied).
    registerForPushNotificationsAsync();
  }, []);

  return (
    <PaperProvider theme={activeTheme}>
      <StatusBar style="light" backgroundColor={activeColors.primary} />
      <AppNavigator />
    </PaperProvider>
  );
}

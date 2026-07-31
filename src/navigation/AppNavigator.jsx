import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import UserHomeScreen from '../screens/UserHomeScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import LogoutAction from '../components/LogoutAction';
import ThemeToggle from '../components/ThemeToggle';
import { colors, useThemeColors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const activeColors = useThemeColors();

  const baseScreenOptions = {
    headerStyle: { backgroundColor: activeColors.primary },
    headerTintColor: activeColors.onPrimary,
    headerTitleStyle: { fontWeight: '700', fontSize: 20 },
    headerTitleAlign: 'left',
    contentStyle: { backgroundColor: activeColors.background },
    animation: 'slide_from_right',
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={baseScreenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

        {/* Home screens are roots: no back button, logout on the right,
          and hardware back is disabled (gestureEnabled false) to prevent
          accidentally exiting to the login screen. */}
        <Stack.Screen
          name="UserHome"
          component={UserHomeScreen}
          options={({ navigation }) => ({
            title: 'SiagaRW',
            headerLeft: () => null,
            gestureEnabled: false,
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemeToggle />
                <LogoutAction navigation={navigation} />
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={({ navigation }) => ({
            title: 'Dasbor Petugas',
            headerLeft: () => null,
            gestureEnabled: false,
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemeToggle />
                <LogoutAction navigation={navigation} />
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="AlertDetail"
          component={AlertDetailScreen}
          options={{ title: 'Detail Laporan', headerBackTitle: 'Kembali' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

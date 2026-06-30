import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import UserHomeScreen from '../screens/UserHomeScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import LogoutAction from '../components/LogoutAction';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

// Shared AppBar styling so every screen looks consistent.
const baseScreenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.onPrimary,
  headerTitleStyle: { fontWeight: '700', fontSize: 20 },
  headerTitleAlign: 'left',
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
};

const AppNavigator = () => (
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
          title: 'SiagaRT',
          headerLeft: () => null,
          gestureEnabled: false,
          headerRight: () => <LogoutAction navigation={navigation} />,
        })}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={({ navigation }) => ({
          title: 'Dasbor Petugas',
          headerLeft: () => null,
          gestureEnabled: false,
          headerRight: () => <LogoutAction navigation={navigation} />,
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

export default AppNavigator;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import UserHomeScreen from '../screens/UserHomeScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#1E1E1E',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="UserHome"
                    component={UserHomeScreen}
                    options={{ title: 'SiagaRT - Warga' }}
                />
                <Stack.Screen
                    name="AdminDashboard"
                    component={AdminDashboardScreen}
                    options={{ title: 'SiagaRT - Satpam' }}
                />
                <Stack.Screen
                    name="AlertDetail"
                    component={AlertDetailScreen}
                    options={{ title: 'Detail Laporan' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

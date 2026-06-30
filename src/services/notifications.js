import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// SDK 54: shouldShowAlert is deprecated; use shouldShowBanner + shouldShowList.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register the device for notifications and return an Expo push token.
 * Safe to call on web (no-op) and when permissions are denied (returns null).
 */
export const registerForPushNotificationsAsync = async () => {
  try {
    if (Platform.OS === 'web') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D32F2F',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // projectId is required for getExpoPushTokenAsync in SDK 54 dev/standalone builds.
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      // No EAS project configured yet — local notifications still work.
      console.warn('No EAS projectId; skipping push token retrieval');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (error) {
    console.warn('registerForPushNotificationsAsync failed:', error?.message);
    return null;
  }
};

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Get the EAS project ID from environment or app config.
 */
const getProjectId = (): string | undefined => {
  // Prefer the env variable
  if (process.env.EXPO_PUBLIC_PROJECT_ID) {
    return process.env.EXPO_PUBLIC_PROJECT_ID;
  }
  // Fall back to app.json / app.config extra.eas.projectId
  const easProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (easProjectId) {
    return easProjectId;
  }
  return undefined;
};

export const registerForPushNotifications = async (): Promise<string | null> => {
  // Skip web push notifications
  if (Platform.OS === 'web') {
    return null;
  }

  let token: string | null = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Push notification permission not granted');
      return null;
    }

    try {
      const projectId = getProjectId();
      if (!projectId) {
        console.warn('⚠️ No EAS project ID found. Push notifications will not work.');
        console.warn('   Set EXPO_PUBLIC_PROJECT_ID in your .env or configure extra.eas.projectId in app.json');
        return null;
      }

      console.log('🔔 Requesting push token with projectId:', projectId);
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('✅ Push token obtained:', token);
    } catch (error: any) {
      console.warn('⚠️ Failed to get push token:', error.message);
      // Common in Expo Go — will work in production build
      token = null;
    }
  } else {
    console.warn('⚠️ Push notifications require a physical device');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // Order updates channel
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }

  return token;
};

export const scheduleLocalNotification = async (title: string, body: string, data?: any) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });
};

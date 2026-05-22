import messaging from '@react-native-firebase/messaging';
import { updateFcmToken } from './api';
import { Alert } from 'react-native';

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled && __DEV__) {
    console.log('Authorization status:', authStatus);
  }
  return enabled;
};

export const getFcmToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      // Sensitive token removed from logging
      return fcmToken;
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting FCM token:', error);
    }
  }
  return null;
};

export const saveFcmToken = async () => {
  const token = await getFcmToken();
  if (token) {
    try {
      await updateFcmToken(token);
      console.log('FCM token saved to backend');
    } catch (error) {
      console.error('Failed to save FCM token to backend:', error);
    }
  }
};

export const notificationListener = () => {
  // Foreground message handler
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    if (__DEV__) {
        console.log('A new FCM message arrived!');
    }
    if (remoteMessage.notification) {
        Alert.alert(
            remoteMessage.notification.title || 'Notification',
            remoteMessage.notification.body || ''
        );
    }
  });

  // Background/Quit state message handler
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
  });

  // Check if the app was opened by a notification from a quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
      }
    });

  return unsubscribe;
};

export const setupNotifications = async () => {
  const hasPermission = await requestUserPermission();
  if (hasPermission) {
    await saveFcmToken();
  }
  return notificationListener();
};

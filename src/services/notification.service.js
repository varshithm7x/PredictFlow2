import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register for push notifications
export const registerForPushNotifications = async () => {
  let token;
  
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    
    // Store the token in AsyncStorage
    await AsyncStorage.setItem('pushToken', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

// Schedule a local notification
export const scheduleLocalNotification = async (title, body, data = {}, trigger = null) => {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: trigger || { seconds: 1 },
  });
  
  return notificationId;
};

// Send notification for featured ponder
export const notifyFeaturedPonder = async (ponder) => {
  return await scheduleLocalNotification(
    'Featured Ponder Alert!',
    `"${ponder.question}" has a juiced pool of $${ponder.totalPool}! Vote now!`,
    { ponderId: ponder.id },
  );
};

// Send notification for voting result
export const notifyVotingResult = async (ponderId, question, won, amount) => {
  const title = won ? 'You Won!' : 'Better Luck Next Time';
  const body = won 
    ? `Your prediction for "${question}" was correct! You won $${amount}!` 
    : `Your prediction for "${question}" was incorrect.`;
  
  return await scheduleLocalNotification(
    title,
    body,
    { ponderId, won, amount },
  );
};

// Send notification for ponder ending soon
export const notifyPonderEndingSoon = async (ponder) => {
  return await scheduleLocalNotification(
    'Ponder Ending Soon!',
    `"${ponder.question}" is ending in 1 hour. Vote now!`,
    { ponderId: ponder.id },
  );
};

// Listen for notification interactions
export const addNotificationResponseReceivedListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Listen for notifications received while app is foregrounded
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

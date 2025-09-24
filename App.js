import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { PonderProvider } from './src/context/PonderContext';
import { LeaderboardProvider } from './src/context/LeaderboardContext';
import * as notificationService from './src/services/notification.service';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: The provided value',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  // Register for push notifications on app start
  useEffect(() => {
    registerForNotifications();
  }, []);

  // Register for push notifications
  const registerForNotifications = async () => {
    try {
      await notificationService.registerForPushNotifications();
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PonderProvider>
          <LeaderboardProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </LeaderboardProvider>
        </PonderProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

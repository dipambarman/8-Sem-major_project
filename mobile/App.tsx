/**
 * Smart Canteen App
 * https://github.com/your-username/smart-canteen-app
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { LogBox, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';

// Redux store (NO PERSISTOR)
import { store } from './src/store/store';
import { initializeAuth } from './src/store/slices/authSlice';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Services
import { registerForPushNotifications } from './src/services/notifications/pushNotifications';
import { initializeSocket } from './src/services/socket/socketService';

// Components
import LoadingSpinner from './src/components/common/LoadingSpinner';

// Utils
import { getToken } from './src/utils/storage';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('🔵 AppContent mounted - initializing auth');
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      <AppNavigator />
      <StatusBar
        style="auto"
        backgroundColor="transparent"
        translucent
      />
    </>
  );
};

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('🔵 App initialization started');

        // Create a timeout promise to ensure app loads even if something hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Initialization timed out')), 5000)
        );

        // Core initialization logic
        const initPromise = (async () => {
          // Check for stored authentication token
          const storedToken = await getToken();
          console.log('🔵 Stored token:', storedToken ? 'exists' : 'null');

          // Register for push notifications (with error handling)
          try {
            // Using a separate timeout for notifications specifically as they often hang on emulators
            const pushTokenPromise = registerForPushNotifications();
            const pushTimeoutPromise = new Promise(r => setTimeout(() => r(null), 2000));

            const pushToken = await Promise.race([pushTokenPromise, pushTimeoutPromise]);

            if (pushToken) {
              console.log('📱 Push notification token:', pushToken);
              // TODO: Send push token to your server
            }
          } catch (error) {
            console.warn('⚠️ Failed to register for push notifications:', error);
          }

          // Initialize Socket.IO connection if user is authenticated
          if (storedToken) {
            try {
              initializeSocket(storedToken);
              console.log('✅ Socket initialized');
            } catch (error) {
              console.warn('⚠️ Failed to initialize socket connection:', error);
            }
          }
        })();

        // Race init against global timeout
        await Promise.race([initPromise, timeoutPromise]);

        // Artificial delay to show splash screen (optional)
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('✅ App initialization complete');

      } catch (error) {
        console.error('❌ Error during app initialization:', error);
        // Don't show alert for timeout, just proceed
        // Alert.alert(
        //   'Initialization Error',
        //   'Failed to initialize the app. Please restart.',
        //   [{ text: 'OK' }]
        // );
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;

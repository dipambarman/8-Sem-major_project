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
import { Provider, useDispatch, useSelector } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Redux store (NO PERSISTOR)
import { store, AppDispatch, RootState } from './src/store/store';
import { initializeAuth } from './src/store/slices/authSlice';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Services
import { registerForPushNotifications } from './src/services/notifications/pushNotifications';
import { initializeSocket } from './src/services/socket/socketService';

// Components
import LoadingSpinner from './src/components/common/LoadingSpinner';
import GlobalRazorpay, { setGlobalRazorpayRef } from './src/components/payment/GlobalRazorpay';

// Utils
import { getToken } from './src/utils/storage';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
  'expo-notifications: Android Push notifications',
]);

// SplashScreen.preventAutoHideAsync();

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('🔵 AppContent mounted - initializing auth');
    dispatch(initializeAuth());
  }, [dispatch]);

  // Dynamically manage socket connection based on auth state
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔌 Auth state changed to authenticated: initializing socket');
      import('./src/services/socket/socketService').then(({ initializeSocket }) => {
        initializeSocket(token);
      });
    } else {
      console.log('🔌 Auth state changed to unauthenticated: disconnecting socket');
      import('./src/services/socket/socketService').then(({ disconnectSocket }) => {
        disconnectSocket();
      });
    }
  }, [isAuthenticated, token]);

  return (
    <>
      <AppNavigator />
      <GlobalRazorpay ref={(ref) => setGlobalRazorpayRef(ref)} />
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
    setAppIsReady(true);
  }, []);

  // Handle side effects (notifications, etc) after ready
  useEffect(() => {
    if (!appIsReady) return;

    async function initializeServices() {
      try {
        console.log('🔵 Background initialization started');
        const storedToken = await getToken();

        // Push Notifications
        const pushTokenPromise = registerForPushNotifications();
        const pushTimeoutPromise = new Promise(r => setTimeout(() => r(null), 3000));
        const pushToken = await Promise.race([pushTokenPromise, pushTimeoutPromise]);

        if (pushToken) {
          try {
            const { authApi } = await import('./src/services/api/authApi');
            await authApi.savePushToken(pushToken as string);
          } catch (e) {
            console.warn('⚠️ Failed to save push token:', e);
          }
        }

        // Socket
        if (storedToken) {
          initializeSocket(storedToken);
        }
      } catch (error) {
        console.warn('⚠️ Error in background init:', error);
      }
    }

    initializeServices();
  }, [appIsReady]);

  useEffect(() => {
    if (appIsReady) {
      const hideSplash = async () => {
        try {
          console.log('🔵 Hiding splash screen...');
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden');
        } catch (e) {
          console.warn('⚠️ Error hiding splash screen:', e);
        }
      };
      hideSplash();
    }
  }, [appIsReady]);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

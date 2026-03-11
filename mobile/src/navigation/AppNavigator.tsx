import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { RootState, AppDispatch } from '../store/store';
import { initializeAuth } from '../store/slices/authSlice';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = React.useState(true);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵 AppNavigator RENDER');
  console.log('   - isAuthenticated:', authState.isAuthenticated);
  console.log('   - isLoading:', authState.isLoading);
  console.log('   - token:', authState.token ? 'exists' : 'null');
  console.log('   - user:', authState.user?.email || 'null');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔵 Initializing auth...');
        await dispatch(initializeAuth());
        console.log('✅ Auth initialization complete');
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
      } finally {
        setInitializing(false);
      }
    };
    initialize();
  }, [dispatch]);

  // Monitor auth state changes
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵 AUTH STATE CHANGED');
    console.log('   - isAuthenticated:', authState.isAuthenticated);
    console.log('   - Will show:', authState.isAuthenticated ? 'Main (TabNavigator)' : 'Auth (Login)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [authState.isAuthenticated]);

  if (initializing) {
    console.log('🔵 Showing initialization loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  console.log('🔵 Rendering Stack Navigator with screen:', authState.isAuthenticated ? 'Main' : 'Auth');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ animationEnabled: false }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{ animationEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});

export default AppNavigator;

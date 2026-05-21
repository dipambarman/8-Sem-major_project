import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store/store';
import { initializeAuth } from '../store/slices/authSlice';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = React.useState(true);

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

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[Colors.background.primary, Colors.background.secondary]}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingLogo}>
            <LinearGradient colors={Colors.gradients.goldCta} style={styles.logoCircle}>
              <Ionicons name="restaurant" size={32} color={Colors.background.primary} />
            </LinearGradient>
          </View>
          <Text style={styles.loadingBrand}>SMART CANTEEN</Text>
          <ActivityIndicator size="small" color={Colors.accent.primary} style={{ marginTop: 24 }} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator id="AppStack" screenOptions={{ headerShown: false }}>
        {authState.isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ animation: 'none' }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{ animation: 'none' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingBrand: {
    ...Typography.h3,
    color: Colors.text.primary,
    letterSpacing: 4,
    fontWeight: '800',
  },
});

export default AppNavigator;

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PremiumScreen from '../screens/profile/PremiumScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import ReservationScreen from '../screens/reservations/ReservationScreen';
import TableBookingScreen from '../screens/reservations/TableBookingScreen';
import { Colors } from '../theme/colors';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      id="ProfileStack"
      screenOptions={({ navigation }: any) => ({
        headerStyle: {
          backgroundColor: Colors.background.secondary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.primary,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: Colors.text.primary,
        },
        headerLeft: ({ canGoBack }) => (
          <TouchableOpacity 
            onPress={() => {
              if (canGoBack) {
                navigation.goBack();
              } else {
                navigation.navigate('ProfileHome');
              }
            }} 
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        ),
      })}
    >
      {/* ✅ Change "Profile" to "ProfileHome" */}
      <Stack.Screen 
        name="ProfileHome" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="Premium" 
        component={PremiumScreen}
        options={{ title: 'SmartPass', headerShown: false }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen 
        name="Reservation" 
        component={ReservationScreen}
        options={{ title: 'My Reservations' }}
      />
      <Stack.Screen 
        name="TableBooking" 
        component={TableBookingScreen}
        options={{ title: 'Book a Table' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';

const Stack = createNativeStackNavigator();

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator id="HomeStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="SearchHome" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;

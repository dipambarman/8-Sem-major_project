import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchScreen from '../screens/home/SearchScreen';

const Stack = createNativeStackNavigator();

const SearchStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator id="SearchStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchHome" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default SearchStackNavigator;

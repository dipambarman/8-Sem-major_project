import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalletScreen from '../screens/wallet/WalletScreen';
import TopUpScreen from '../screens/wallet/TopUpScreen';
import TransactionHistoryScreen from '../screens/wallet/TransactionHistoryScreen';

const Stack = createNativeStackNavigator();

const WalletStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator id="WalletStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletHome" component={WalletScreen} />
      <Stack.Screen name="TopUp" component={TopUpScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </Stack.Navigator>
  );
};

export default WalletStackNavigator;

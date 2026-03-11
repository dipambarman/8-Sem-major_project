import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CartScreen from '../screens/orders/CartScreen';
import CheckoutScreen from '../screens/orders/CheckoutScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';

const Stack = createNativeStackNavigator();

const CartStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    </Stack.Navigator>
  );
};

export default CartStackNavigator;

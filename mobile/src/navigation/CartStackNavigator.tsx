import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CartScreen from '../screens/orders/CartScreen';
import CheckoutScreen from '../screens/orders/CheckoutScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';

const Stack = createNativeStackNavigator();

const CartStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator id="CartStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartHome" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};

export default CartStackNavigator;

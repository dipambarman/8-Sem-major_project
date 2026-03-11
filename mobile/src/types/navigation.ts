export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  MenuScreen: { vendorId: string };
  SearchScreen: undefined;
  CartScreen: undefined;
  CheckoutScreen: undefined;
  OrderTracking: { orderId: string };
  Menu: undefined;
  OrderHistory: undefined;
  Reservation: undefined;
  ExpressPickup: undefined;
  TopUp: undefined;
  Transactions: undefined;
};

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '../../store/store';
import {
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from '../../store/slices/cartSlice';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface CartScreenProps {
  navigation: any;
}

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ FIX: Add fallback for undefined
  const cart = useSelector((state: RootState) => state.cart);
  const { items = [], total = 0, itemCount = 0 } = cart || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveItem = (itemId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this item from cart?')) {
        dispatch(removeFromCart(itemId));
      }
      return;
    }

    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(itemId)),
        },
      ]
    );
  };

  const handleIncrement = (itemId: string) => {
    dispatch(incrementQuantity(itemId));
  };

  const handleDecrement = (itemId: string) => {
    dispatch(decrementQuantity(itemId));
  };

  const handleClearCart = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove all items?')) {
        dispatch(clearCart());
      }
      return;
    }

    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => dispatch(clearCart()),
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Please add items to cart before checkout');
      } else {
        Alert.alert('Empty Cart', 'Please add items to cart before checkout');
      }
      return;
    }

    setIsProcessing(true);

    // Navigate to checkout screen
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('Checkout', { cartItems: items, total });
    }, 500);
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image
        source={
          item.image
            ? { uri: item.image }
            : require('../../../assets/placeholder-food.png')
        }
        style={styles.itemImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>₹{(item.price || 0).toFixed(0)}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleDecrement(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color={Colors.accent.primary} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleIncrement(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={Colors.accent.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="cart-outline" size={56} color={Colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Add items to your cart to get started
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        activeOpacity={0.85}
      >
        <LinearGradient colors={Colors.gradients.goldCta} style={styles.browseGradient}>
          <Ionicons name="restaurant" size={18} color={Colors.background.primary} />
          <Text style={styles.browseButtonText}>Browse Menu</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
        {items.length === 0 && <View style={{ width: 60 }} />}
      </View>

      {/* Cart Items or Empty State */}
      {items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <View style={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', flex: 1 }]}>
            <FlatList
              data={items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Footer with Total and Checkout */}
          <View style={styles.bottomBarContainer} pointerEvents="box-none">
            <View style={[styles.bottomBar, isTablet && styles.bottomBarTablet]}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total ({itemCount} items)</Text>
                <Text style={styles.totalAmount}>₹{total.toFixed(0)}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  isProcessing && styles.checkoutButtonDisabled,
                ]}
                onPress={handleCheckout}
                disabled={isProcessing}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isProcessing ? ['#374151', '#374151'] : Colors.gradients.goldCta}
                  style={styles.checkoutGradient}
                >
                  {isProcessing ? (
                    <Text style={styles.checkoutButtonText}>Processing...</Text>
                  ) : (
                    <>
                      <Text style={styles.checkoutButtonText}>Checkout</Text>
                      <Ionicons name="arrow-forward" size={18} color={Colors.background.primary} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearButtonText: {
    ...Typography.label,
    color: Colors.status.error,
    fontSize: 14,
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: 100, // Make room for absolute footer
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 38, 64, 0.4)', // subtle glassy background
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.secondary,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.background.tertiary,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  itemName: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  itemPrice: {
    ...Typography.price,
    color: Colors.accent.primary,
    fontSize: 16,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...Typography.label,
    color: Colors.text.primary,
    marginHorizontal: 12,
    minWidth: 18,
    textAlign: 'center',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  browseButton: {
    borderRadius: Radius.button,
    overflow: 'hidden',
  },
  browseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  browseButtonText: {
    ...Typography.button,
    color: Colors.background.primary,
  },
  
  // Bottom Bar
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  bottomBarTablet: {
    maxWidth: 800,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border.primary,
  },
  totalContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  totalLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  totalAmount: {
    ...Typography.h3,
    color: Colors.accent.primary,
  },
  checkoutButton: {
    borderRadius: Radius.button,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  checkoutButtonText: {
    ...Typography.button,
    color: Colors.background.primary,
  },
});

export default CartScreen;

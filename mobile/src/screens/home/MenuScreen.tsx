import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MenuItem from '../../components/orders/MenuItem';
import { MenuItem as MenuItemType } from '../../types/api';
import { RootState } from '../../store/store';
import { addToCart } from '../../store/slices/cartSlice';
import { menuApi } from '../../services/api/menuApi';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const MenuScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: { vendorId?: string } }, 'params'>>();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { vendorId } = route.params || {};
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = useWindowDimensions();
  // Responsive columns: < 768px -> 1 col, 768px-1024px -> 2 cols, > 1024px -> 3 cols
  const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;

  useEffect(() => {
    fetchMenu();
  }, [vendorId]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await menuApi.getMenu(vendorId);
      if (response.success) {
        const items = response.data;
        setMenuItems(items);
        const uniqueCategories = ['All', ...new Set(items.map(item => item.category))] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Fetch menu error:', error);
      Alert.alert('Error', 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenu();
    setRefreshing(false);
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItemType, quantity: number) => {
    if (quantity <= 0) {
      return;
    }
    // Fix: Spread item properties to ensure flat structure (id, name, price, etc.)
    // instead of nested { item: {...}, quantity }
    dispatch(addToCart({ ...item, quantity }));
  };

  const getCartQuantity = (itemId: string) => {
    // Fix: access item.id directly as state is now flat
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderCategoryFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.selectedCategoryButtonText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      <View style={styles.header}>
        <Text style={styles.title}>Our Menu</Text>
        <Text style={styles.subtitle}>Curated dishes for you</Text>
        {totalCartItems > 0 && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart' as never)}
          >
            <LinearGradient colors={Colors.gradients.goldCta} style={styles.cartButtonGradient}>
              <Ionicons name="basket" size={20} color={Colors.background.primary} />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryFilter}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilters}
        style={styles.categoryContainer}
      />

      <FlatList
        key={numColumns} // Force re-render when numColumns changes
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: numColumns > 1 ? `${100 / numColumns}%` : '100%' }}>
            <MenuItem
              item={item}
              onAddToCart={handleAddToCart}
              cartQuantity={getCartQuantity(item.id)}
            />
          </View>
        )}
        contentContainerStyle={[
          { paddingBottom: 100 },
          numColumns > 1 && { paddingHorizontal: Spacing.md }
        ]}
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'flex-start' } : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent.primary}
            colors={[Colors.accent.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>
              {loading ? 'Loading menu...' : 'No items available'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.primary,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  cartButton: {
    position: 'absolute',
    top: 56,
    right: Spacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cartButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoryContainer: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  categoryFilters: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  categoryButtonText: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontSize: 13,
  },
  selectedCategoryButtonText: {
    color: Colors.background.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: 16,
  },
});

export default MenuScreen;

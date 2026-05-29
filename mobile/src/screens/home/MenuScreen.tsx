import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
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

// ─── Database category → Display label mapping ────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All',
  BREAKFAST: 'Breakfast',
  SNACKS: 'Snacks',
  MAIN_COURSE: 'Main Course',
  DESSERTS: 'Desserts',
  BEVERAGES: 'Beverages',
};

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  ALL: { icon: 'grid', color: Colors.accent.primary },
  BREAKFAST: { icon: 'sunny', color: '#F97316' },
  SNACKS: { icon: 'fast-food', color: '#10B981' },
  MAIN_COURSE: { icon: 'restaurant', color: '#8B5CF6' },
  DESSERTS: { icon: 'ice-cream', color: '#EC4899' },
  BEVERAGES: { icon: 'cafe', color: '#F59E0B' },
};

const MenuScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: { vendorId?: string; category?: string } }, 'params'>>();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ─── Receive category param every time screen focuses ──────────
  useFocusEffect(
    useCallback(() => {
      const catParam = route.params?.category;
      if (catParam && catParam !== selectedCategory) {
        const normalised = catParam.toUpperCase();
        if (categories.includes(normalised) || normalised === 'ALL') {
          setSelectedCategory(normalised);
        }
      }
    }, [route.params?.category, categories])
  );

  // ─── Initial data load ─────────────────────────────────────────
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuApi.getMenu(route.params?.vendorId);
      if (response.success) {
        const items: MenuItemType[] = response.data;
        setMenuItems(items);

        // Build category list from actual data
        const uniqueDbCats = [...new Set(items.map((i) => i.category))];
        const sorted = uniqueDbCats.sort();
        setCategories(['ALL', ...sorted]);

        // Apply initial category from nav param (first load only)
        const catParam = route.params?.category;
        if (catParam) {
          const normalised = catParam.toUpperCase();
          if (normalised === 'ALL' || sorted.includes(normalised)) {
            setSelectedCategory(normalised);
          }
        }

        // Fade in content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Fetch menu error:', error);
      Alert.alert('Error', 'Failed to fetch menu. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenu();
    setRefreshing(false);
  };

  // ─── Filtering ─────────────────────────────────────────────────
  const filteredItems =
    selectedCategory === 'ALL'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  // ─── Cart helpers ──────────────────────────────────────────────
  const handleAddToCart = (item: MenuItemType, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'cart/removeFromCart', payload: item.id });
      return;
    }
    dispatch(addToCart({ ...item, quantity }));
  };

  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find((item) => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ─── Category chip renderer ────────────────────────────────────
  const renderCategoryChip = (cat: string) => {
    const isActive = selectedCategory === cat;
    const meta = CATEGORY_ICONS[cat] || { icon: 'ellipse', color: Colors.text.secondary };
    const label = CATEGORY_LABELS[cat] || cat;

    return (
      <TouchableOpacity
        key={cat}
        activeOpacity={0.7}
        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
        onPress={() => setSelectedCategory(cat)}
      >
        <View
          style={[
            styles.categoryIconCircle,
            { backgroundColor: isActive ? meta.color : `${meta.color}20` },
          ]}
        >
          <Ionicons
            name={meta.icon as any}
            size={16}
            color={isActive ? '#fff' : meta.color}
          />
        </View>
        <Text
          style={[
            styles.categoryChipText,
            isActive && { color: Colors.text.primary, fontWeight: '700' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ─── Menu item renderer ────────────────────────────────────────
  const renderMenuItem = ({ item }: { item: MenuItemType }) => (
    <MenuItem
      item={item}
      onAddToCart={handleAddToCart}
      cartQuantity={getCartQuantity(item.id)}
    />
  );

  // ─── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
        <ActivityIndicator size="large" color={Colors.accent.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  // ─── Main render ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* ── Header ─────────────────────────────────────────────── */}
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Our Menu</Text>
            <Text style={styles.subtitle}>
              {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'} available
            </Text>
          </View>
          {totalCartItems > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.cartButton}
              onPress={() => navigation.navigate('Cart' as never)}
            >
              <LinearGradient colors={Colors.gradients.goldCta} style={styles.cartButtonGradient}>
                <Ionicons name="basket" size={20} color={Colors.background.primary} />
              </LinearGradient>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Category chips (scrollable row) ──────────────────── */}
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryChip(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          style={styles.categoryList}
        />
      </LinearGradient>

      {/* ── Menu list ──────────────────────────────────────────── */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMenuItem}
          contentContainerStyle={styles.menuListContent}
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
              <View style={styles.emptyIconCircle}>
                <Ionicons name="restaurant-outline" size={48} color={Colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>No dishes found</Text>
              <Text style={styles.emptyText}>
                Try selecting a different category or pull down to refresh.
              </Text>
            </View>
          }
        />
      </Animated.View>

      {/* ── Floating cart bar ───────────────────────────────────── */}
      {totalCartItems > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <LinearGradient
            colors={Colors.gradients.goldCta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.floatingCartGradient}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.floatingCartCount}>
                <Text style={styles.floatingCartCountText}>{totalCartItems}</Text>
              </View>
              <Text style={styles.floatingCartLabel}>View Cart</Text>
            </View>
            <Text style={styles.floatingCartPrice}>₹{totalCartValue}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── STYLES ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: 14,
  },

  // ── Header ───────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    marginBottom: 14,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontSize: 26,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
  },
  cartButtonGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ── Category chips ───────────────────────────────────────────────
  categoryList: {
    maxHeight: 56,
  },
  categoryRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 8,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent.muted,
    borderColor: Colors.accent.primary,
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontSize: 13,
  },

  // ── Menu list ────────────────────────────────────────────────────
  menuListContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: 100,
  },

  // ── Empty state ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xxl,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Floating cart bar ────────────────────────────────────────────
  floatingCart: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: Spacing.xl,
    right: Spacing.xl,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingCartGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingCartCount: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCartCountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  floatingCartLabel: {
    ...Typography.button,
    color: Colors.background.primary,
    fontSize: 15,
  },
  floatingCartPrice: {
    ...Typography.price,
    color: Colors.background.primary,
    fontSize: 18,
  },
});

export default MenuScreen;

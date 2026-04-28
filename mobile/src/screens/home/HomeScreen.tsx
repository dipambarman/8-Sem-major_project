import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import { addToCart } from '../../store/slices/cartSlice';
import { menuApi } from '../../services/api/menuApi';
import { orderApi } from '../../services/api/orderApi';
import { MenuItem } from '../../types/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid' as const, color: '#007AFF' },
  { id: 'Beverages', label: 'Drinks', icon: 'cafe' as const, color: '#FF6B35' },
  { id: 'Snacks', label: 'Snacks', icon: 'fast-food' as const, color: '#4CAF50' },
  { id: 'Main Course', label: 'Meals', icon: 'restaurant' as const, color: '#9C27B0' },
  { id: 'Desserts', label: 'Desserts', icon: 'ice-cream' as const, color: '#E91E63' },
  { id: 'Breakfast', label: 'Breakfast', icon: 'sunny' as const, color: '#FF9800' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wallet } = useSelector((state: RootState) => state.wallet);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentOrderCount, setRecentOrderCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, orderRes] = await Promise.allSettled([
        menuApi.getMenu(),
        orderApi.getOrders(),
      ]);

      if (menuRes.status === 'fulfilled' && menuRes.value.success) {
        setMenuItems(menuRes.value.data || []);
      }

      if (orderRes.status === 'fulfilled' && orderRes.value.success) {
        setRecentOrderCount(orderRes.value.data?.length || 0);
      }
    } catch (err) {
      console.error('Home fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const trendingItems = menuItems
    .filter((item) => item.isAvailable)
    .slice(0, 8);

  const expressItems = menuItems.filter(
    (item) => item.isExpress && item.isAvailable
  );

  const handleAddToCart = (item: MenuItem) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  // ─── RENDER COMPONENTS ────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'Foodie'} 👋</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => (navigation as any).navigate('Profile', { screen: 'Notifications' })}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
        {totalCartItems > 0 && (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => (navigation as any).navigate('Cart')}
          >
            <Ionicons name="cart" size={24} color="#fff" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <TouchableOpacity
      style={styles.searchBar}
      onPress={() => (navigation as any).navigate('Search')}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={20} color="#999" />
      <Text style={styles.searchPlaceholder}>Search for dishes, drinks...</Text>
    </TouchableOpacity>
  );

  const renderQuickStats = () => (
    <View style={styles.statsRow}>
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => (navigation as any).navigate('Wallet')}
      >
        <LinearGradient colors={['#007AFF', '#0056CC']} style={styles.statGradient}>
          <Ionicons name="wallet" size={22} color="#fff" />
          <Text style={styles.statValue}>₹{wallet?.balance?.toFixed(0) || '0'}</Text>
          <Text style={styles.statLabel}>Wallet</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => (navigation as any).navigate('Cart', { screen: 'OrderHistory' })}
      >
        <LinearGradient colors={['#FF6B35', '#E55A2E']} style={styles.statGradient}>
          <Ionicons name="receipt" size={22} color="#fff" />
          <Text style={styles.statValue}>{recentOrderCount}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => (navigation as any).navigate('Profile', { screen: 'Premium' })}
      >
        <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.statGradient}>
          <Ionicons name="diamond" size={22} color="#fff" />
          <Text style={styles.statValue}>{user?.isPremium ? 'Active' : 'Free'}</Text>
          <Text style={styles.statLabel}>SmartPass</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Explore Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryChip}
            onPress={() => (navigation as any).navigate('Menu', { screen: 'MenuScreen', params: { category: cat.id } })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}15` }]}>
              <Ionicons name={cat.icon} size={24} color={cat.color} />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFoodCard = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.foodCard}
      activeOpacity={0.85}
      onPress={() => (navigation as any).navigate('Menu')}
    >
      <View style={styles.foodImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.foodImage} />
        ) : (
          <LinearGradient colors={['#f0f0f0', '#e0e0e0']} style={styles.foodImagePlaceholder}>
            <Ionicons name="restaurant" size={32} color="#ccc" />
          </LinearGradient>
        )}
        {item.isExpress && (
          <View style={styles.expressBadge}>
            <Ionicons name="flash" size={12} color="#fff" />
            <Text style={styles.expressText}>EXPRESS</Text>
          </View>
        )}
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
        <View style={styles.foodBottom}>
          <Text style={styles.foodPrice}>₹{item.price}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Menu')}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={trendingItems}
        renderItem={renderFoodCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  const renderExpressSection = () => {
    if (expressItems.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Express Picks</Text>
          <Text style={styles.sectionSubtitle}>Ready in under 10 mins</Text>
        </View>
        <FlatList
          data={expressItems.slice(0, 6)}
          renderItem={renderFoodCard}
          keyExtractor={(item) => `express-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  const renderPromoCard = () => (
    <TouchableOpacity
      style={styles.promoCard}
      activeOpacity={0.85}
      onPress={() => (navigation as any).navigate('Profile', { screen: 'Premium' })}
    >
      <LinearGradient
        colors={['#FF6B35', '#FF8C5A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promoGradient}
      >
        <View style={styles.promoContent}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Get SmartPass 🚀</Text>
            <Text style={styles.promoDescription}>
              Skip the queue with Express ordering{'\n'}+ Free delivery on all orders
            </Text>
            <View style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Explore Plans</Text>
            </View>
          </View>
          <Ionicons name="diamond" size={64} color="rgba(255,255,255,0.3)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Menu')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="restaurant" size={24} color="#4CAF50" />
        </View>
        <Text style={styles.quickActionLabel}>Browse{'\n'}Menu</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Cart')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="cart" size={24} color="#1976D2" />
        </View>
        <Text style={styles.quickActionLabel}>View{'\n'}Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Cart', { screen: 'OrderHistory' })}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="time" size={24} color="#FF9800" />
        </View>
        <Text style={styles.quickActionLabel}>Order{'\n'}History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Wallet')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
          <Ionicons name="wallet" size={24} color="#9C27B0" />
        </View>
        <Text style={styles.quickActionLabel}>Top Up{'\n'}Wallet</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── MAIN RENDER ──────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your canteen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderQuickStats()}
        {renderPromoCard()}
        {renderCategories()}
        {renderQuickActions()}
        {renderTrendingSection()}
        {renderExpressSection()}

        {/* Bottom Padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#999',
    flex: 1,
  },

  // Quick Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },

  // Promo
  promoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  promoGradient: {
    padding: 24,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  promoDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    lineHeight: 20,
  },
  promoButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Categories
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    paddingHorizontal: 20,
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryChip: {
    alignItems: 'center',
    width: 72,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Food Cards
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 14,
  },
  foodCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  foodImageContainer: {
    height: 130,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  foodImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expressBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  expressText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  foodCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  foodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  foodPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;

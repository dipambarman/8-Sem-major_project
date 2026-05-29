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
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
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
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import HeroBanner from '../../components/home/HeroBanner';
import LoyaltyCardWidget from '../../components/home/LoyaltyCardWidget';



const CATEGORIES = [
  { id: 'ALL', label: 'All', icon: 'grid' as const, color: Colors.accent.primary },
  { id: 'BEVERAGES', label: 'Drinks', icon: 'cafe' as const, color: '#F59E0B' },
  { id: 'SNACKS', label: 'Snacks', icon: 'fast-food' as const, color: '#10B981' },
  { id: 'MAIN_COURSE', label: 'Meals', icon: 'restaurant' as const, color: '#8B5CF6' },
  { id: 'DESSERTS', label: 'Desserts', icon: 'ice-cream' as const, color: '#EC4899' },
  { id: 'BREAKFAST', label: 'Breakfast', icon: 'sunny' as const, color: '#F97316' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wallet } = useSelector((state: RootState) => state.wallet);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const CARD_WIDTH = isTablet ? 220 : width * 0.42;

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

  const handleBannerNavigate = (route: string) => {
    (navigation as any).navigate(route);
  };

  // Mock total spent (in production, fetch from backend)
  const totalSpent = (user as any)?.totalSpent || recentOrderCount * 250;
  const loyaltyTier = totalSpent >= 25000 ? 'platinum' : totalSpent >= 15000 ? 'gold' : totalSpent >= 5000 ? 'silver' : 'none';

  // ─── RENDER COMPONENTS ────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'Foodie'} 👋</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => (navigation as any).navigate('Profile', { screen: 'Notifications' })}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.text.secondary} />
        </TouchableOpacity>
        {totalCartItems > 0 && (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => (navigation as any).navigate('Cart')}
          >
            <LinearGradient colors={Colors.gradients.goldCta} style={styles.cartBtnGradient}>
              <Ionicons name="cart" size={20} color={Colors.background.primary} />
            </LinearGradient>
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
      onPress={() => (navigation as any).navigate('SearchHome')}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={18} color={Colors.text.tertiary} />
      <Text style={styles.searchPlaceholder}>Search dishes, drinks...</Text>
      <View style={styles.searchFilter}>
        <Ionicons name="options" size={16} color={Colors.accent.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Menu')}
      >
        <LinearGradient colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']} style={styles.quickActionIcon}>
          <Ionicons name="restaurant" size={22} color="#F59E0B" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Profile', { screen: 'Reservation' })}
      >
        <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']} style={styles.quickActionIcon}>
          <Ionicons name="calendar" size={22} color="#8B5CF6" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>Reserve</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Wallet')}
      >
        <LinearGradient colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']} style={styles.quickActionIcon}>
          <Ionicons name="wallet" size={22} color="#10B981" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionBtn}
        onPress={() => (navigation as any).navigate('Cart', { screen: 'OrderHistory' })}
      >
        <LinearGradient colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']} style={styles.quickActionIcon}>
          <Ionicons name="time" size={22} color="#3B82F6" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>Orders</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsRow}>
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => (navigation as any).navigate('Wallet')}
      >
        <LinearGradient colors={['#1E3A5F', '#162D4A']} style={styles.statGradient}>
          <Ionicons name="wallet" size={20} color={Colors.accent.primary} />
          <Text style={styles.statValue}>₹{wallet?.balance?.toFixed(0) || '0'}</Text>
          <Text style={styles.statLabel}>Wallet</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => (navigation as any).navigate('Cart', { screen: 'OrderHistory' })}
      >
        <LinearGradient colors={['#2D1B4E', '#231540']} style={styles.statGradient}>
          <Ionicons name="receipt" size={20} color="#A78BFA" />
          <Text style={styles.statValue}>{recentOrderCount}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => (navigation as any).navigate('Profile', { screen: 'Premium' })}
      >
        <LinearGradient colors={['#3D2E1C', '#2A1F12']} style={styles.statGradient}>
          <Ionicons name="diamond" size={20} color={Colors.accent.primary} />
          <Text style={styles.statValue}>{user?.isPremium ? 'Active' : 'Free'}</Text>
          <Text style={styles.statLabel}>SmartPass</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <View style={[styles.section, isTablet && styles.tabletSection]}>
      <Text style={styles.sectionTitle}>Explore</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoriesScroll, isTablet && { justifyContent: 'center', flex: 1 }]}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryChip}
            onPress={() => (navigation as any).navigate('Menu', { screen: 'MenuScreen', params: { category: cat.id } })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}15` }]}>
              <Ionicons name={cat.icon} size={22} color={cat.color} />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFoodCard = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={[styles.foodCard, { width: CARD_WIDTH }]}
      activeOpacity={0.85}
      onPress={() => (navigation as any).navigate('Menu')}
    >
      <View style={styles.foodImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.foodImage} />
        ) : (
          <LinearGradient colors={[Colors.background.card, Colors.background.tertiary]} style={styles.foodImagePlaceholder}>
            <Ionicons name="restaurant" size={30} color={Colors.text.tertiary} />
          </LinearGradient>
        )}
        {item.isExpress && (
          <View style={styles.expressBadge}>
            <Ionicons name="flash" size={10} color="#fff" />
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
            <LinearGradient colors={Colors.gradients.goldCta} style={styles.addBtnGradient}>
              <Ionicons name="add" size={16} color={Colors.background.primary} />
            </LinearGradient>
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

  const renderDineInCta = () => (
    <TouchableOpacity
      style={styles.dineInCard}
      activeOpacity={0.9}
      onPress={() => (navigation as any).navigate('Profile', { screen: 'TableBooking' })}
    >
      <LinearGradient
        colors={Colors.gradients.dineIn}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dineInGradient}
      >
        <View style={styles.dineInContent}>
          <View style={styles.dineInText}>
            <Text style={styles.dineInTitle}>Dine-In Experience</Text>
            <Text style={styles.dineInSubtitle}>
              Reserve a premium table and enjoy{'\n'}our signature dining ambiance
            </Text>
            <View style={styles.dineInButton}>
              <Text style={styles.dineInButtonText}>Reserve Table</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </View>
          </View>
          <View style={styles.dineInIconBox}>
            <Ionicons name="restaurant" size={56} color="rgba(255,255,255,0.15)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // ─── MAIN RENDER ──────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent.primary} />
        <Text style={styles.loadingText}>Loading your canteen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent.primary}
            colors={[Colors.accent.primary]}
          />
        }
        contentContainerStyle={[styles.scrollContent, isTablet && { alignSelf: 'center', width: '100%', maxWidth: 1024 }]}
      >
        {renderHeader()}
        {renderSearchBar()}

        <View style={isTablet && styles.tabletRow}>
          <View style={isTablet && { flex: 1 }}>
            {/* Loyalty Card Widget */}
            <LoyaltyCardWidget
              totalSpent={totalSpent}
              tier={loyaltyTier as any}
              userName={user?.fullName || 'Member'}
              onPress={() => {
                try {
                  (navigation as any).navigate('Wallet', { screen: 'TopUp' });
                } catch (e) {
                  (navigation as any).navigate('Wallet');
                }
              }}
            />
          </View>
          <View style={isTablet && { flex: 1 }}>
            <HeroBanner onNavigate={handleBannerNavigate} />
          </View>
        </View>

        <View style={isTablet && styles.tabletRow}>
          <View style={isTablet && { flex: 1 }}>
            {renderQuickActions()}
          </View>
          <View style={isTablet && { flex: 1 }}>
            {renderQuickStats()}
          </View>
        </View>

        {renderCategories()}
        {renderTrendingSection()}
        {renderDineInCta()}
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
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  tabletSection: {
    paddingHorizontal: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: 12,
    ...Typography.body,
    color: Colors.text.secondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: 8,
    backgroundColor: Colors.background.primary,
  },
  headerLeft: {},
  greeting: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  userName: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginTop: 2,
    fontSize: 24,
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
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  cartBtn: {
    position: 'relative',
  },
  cartBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
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

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    gap: 10,
  },
  searchPlaceholder: {
    ...Typography.body,
    color: Colors.text.tertiary,
    flex: 1,
  },
  searchFilter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },

  // Quick Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  statGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginTop: 6,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // Categories
  section: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.xl,
    marginBottom: 14,
  },
  sectionSubtitle: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.xl,
  },
  seeAll: {
    ...Typography.label,
    color: Colors.accent.primary,
    fontSize: 13,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.xl,
    gap: 16,
  },
  categoryChip: {
    alignItems: 'center',
    width: 72,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  categoryLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Dine In CTA
  dineInCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dineInGradient: {
    padding: Spacing.xxl,
  },
  dineInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dineInText: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  dineInTitle: {
    ...Typography.h3,
    color: '#fff',
    fontSize: 20,
  },
  dineInSubtitle: {
    ...Typography.bodySm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    lineHeight: 20,
  },
  dineInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    marginTop: 14,
    gap: 6,
  },
  dineInButtonText: {
    ...Typography.label,
    color: '#fff',
    fontSize: 13,
  },
  dineInIconBox: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Food Cards
  horizontalList: {
    paddingLeft: Spacing.xl,
    paddingRight: 8,
    gap: 14,
  },
  foodCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.primary,
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
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  expressText: {
    ...Typography.badge,
    color: '#fff',
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    ...Typography.label,
    color: Colors.text.primary,
    fontSize: 14,
  },
  foodCategory: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 3,
  },
  foodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  foodPrice: {
    ...Typography.price,
    color: Colors.accent.primary,
    fontSize: 16,
  },
  addBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addBtnGradient: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;

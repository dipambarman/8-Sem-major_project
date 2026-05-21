import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch, store } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user, isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  console.log('🔵 ProfileScreen render - isAuthenticated:', isAuthenticated);

  const confirmLogout = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 Logout button pressed - DIRECT LOGOUT (Debug Mode)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Debugging: Bypassing Alert to rule out UI blocking issues on Web
    handleLogout();
  };

  const handleLogout = async () => {
    try {
      console.log('🔴 Starting logout process...');
      console.log('🔴 Current auth state:', isAuthenticated);

      // Dispatch logout action
      // We don't await this blindly - we want to force logout even if it hangs
      dispatch(logoutUser());

      // Force UI update slightly later to ensure Redux picks it up
      setTimeout(() => {
        const state = store.getState();
        if (state.auth.isAuthenticated) {
          console.warn('⚠️ Async logout slow/failed, forcing synchronous logout');
          dispatch({ type: 'auth/forceLogout' });
        }
      }, 500);

      // Manual navigation shouldn't be needed usually, but purely as a safety net:
      // If AppNavigator doesn't react, we might need to force a re-render of layout
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      // Fallback
      dispatch({ type: 'auth/forceLogout' });
    }
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { id: '1', title: 'Edit Profile', icon: 'person-outline', onPress: () => navigation.navigate('EditProfile') },
        { id: '2', title: 'Loyalty Card', icon: 'card-outline', onPress: () => navigation.navigate('Premium'), badge: 'NEW' },
        { id: '3', title: 'SmartPass Premium', icon: 'diamond-outline', onPress: () => navigation.navigate('Premium') },
      ],
    },
    {
      title: 'Activity',
      items: [
        { id: '4', title: 'Order History', icon: 'time-outline', onPress: () => navigation.navigate('Home', { screen: 'OrderHistory' }) },
        { id: '5', title: 'Wallet', icon: 'wallet-outline', onPress: () => navigation.navigate('Wallet') },
        { id: '6', title: 'Reservations', icon: 'calendar-outline', onPress: () => navigation.navigate('Home') },
      ],
    },
    {
      title: 'More',
      items: [
        { id: '7', title: 'Notifications', icon: 'notifications-outline', onPress: () => navigation.navigate('Notifications') },
        { id: '8', title: 'Settings', icon: 'settings-outline', onPress: () => navigation.navigate('Settings') },
        { id: '9', title: 'Help & Support', icon: 'help-circle-outline', onPress: () => navigation.navigate('Support') },
      ],
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
      >
        {/* Header with Avatar */}
        <LinearGradient
          colors={[Colors.background.primary, Colors.background.secondary]}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={Colors.gradients.goldCta} style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color={Colors.background.primary} />
              </LinearGradient>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => console.log('Edit avatar')}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user?.fullName || 'User Name'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>

          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={14} color={Colors.accent.primary} />
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{user?.walletBalance || 0}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.loyaltyPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.accent.primary} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Logout Button */}
      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.status.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Smart Canteen v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.accent.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent.secondary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background.primary,
  },
  name: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  email: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent.muted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    marginTop: 12,
    gap: 6,
  },
  premiumText: {
    ...Typography.bodySm,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    paddingVertical: 22,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: Radius.lg,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
    fontSize: 20,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.primary,
  },
  menuContainer: {
    backgroundColor: Colors.background.card,
    marginTop: 16,
    marginHorizontal: 15,
    borderRadius: Radius.lg,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.text.secondary,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  newBadge: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  newBadgeText: {
    ...Typography.badge,
    color: Colors.background.primary,
  },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    marginBottom: 8,
    gap: 8,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.status.error,
    fontSize: 15,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default ProfileScreen;

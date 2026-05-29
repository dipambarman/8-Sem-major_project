import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationApi, Notification } from '../../services/api/notificationApi';
import { getToken } from '../../utils/storage';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const data = await notificationApi.getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = await getToken();
      if (!token) return;

      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getIconDetails = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS':
        return { name: 'cart-outline' as const, color: '#F59E0B' }; // Amber
      case 'PAYMENT':
        return { name: 'card-outline' as const, color: '#10B981' }; // Success Green
      case 'PROMOTION':
        return { name: 'megaphone-outline' as const, color: '#8B5CF6' }; // Purple
      default:
        return { name: 'notifications-outline' as const, color: Colors.accent.primary }; // Gold
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconDetails = getIconDetails(item.type);
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem, 
          !item.isRead && styles.unreadItem,
          isTablet && styles.tabletItem
        ]}
        activeOpacity={0.8}
        onPress={() => !item.isRead && handleMarkAsRead(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconDetails.color}12` }]}>
          <Ionicons
            name={iconDetails.name}
            size={22}
            color={iconDetails.color}
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.type.replace('_', ' ')}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at{' '}
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      {loading ? (
        <View style={styles.center}>
          <LoadingSpinner message="Fetching your notifications..." />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContent, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-off-outline" size={60} color={Colors.text.tertiary} />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>Any updates or announcements will appear here.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  tabletItem: {
    paddingVertical: 18,
  },
  unreadItem: {
    backgroundColor: Colors.accent.muted,
    borderColor: Colors.accent.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    ...Typography.label,
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.primary,
  },
  message: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 6,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;

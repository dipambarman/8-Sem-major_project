import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reservationApi } from '../../services/api/reservationApi';
import Button from '../../components/common/Button';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  tableNumber?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'active';
  venueArea: string;
  specialRequests?: string;
  reservationTime?: string;
}

const ReservationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationApi.getMyReservations();
      if (response.success) {
        // Map backend data to our interface
        const mapped = (response.data || []).map((res: any) => ({
          id: res.id,
          date: res.reservationTime ? new Date(res.reservationTime).toISOString().split('T')[0] : '',
          time: res.reservationTime ? new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          partySize: res.partySize,
          tableNumber: res.tableNumber,
          status: res.status === 'active' ? 'confirmed' : res.status,
          venueArea: res.venueArea || 'Main Dining',
          specialRequests: res.specialRequests,
        }));
        setReservations(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const cancelReservation = (reservationId: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservationApi.cancel(reservationId);
              setReservations(prev =>
                prev.map(res =>
                  res.id === reservationId ? { ...res, status: 'cancelled' } : res
                )
              );
              Alert.alert('Success', 'Reservation cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: string; label: string }> = {
      pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', icon: 'time', label: 'PENDING' },
      confirmed: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', icon: 'checkmark-circle', label: 'CONFIRMED' },
      cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', icon: 'close-circle', label: 'CANCELLED' },
      completed: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', icon: 'checkmark-done', label: 'COMPLETED' },
    };
    return configs[status] || configs.pending;
  };

  const getAreaIcon = (area: string) => {
    const icons: Record<string, string> = {
      'Main Dining': 'restaurant',
      'Outdoor Seating': 'leaf',
      'Private Room': 'lock-closed',
      'Counter Seating': 'cafe',
      'Rooftop Lounge': 'moon',
      'Garden Terrace': 'flower',
    };
    return icons[area] || 'location';
  };

  const renderReservation = ({ item }: { item: Reservation }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={styles.reservationCard}>
        <View style={styles.reservationHeader}>
          <View style={styles.reservationInfo}>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>
                  {item.date ? new Date(item.date).getDate() : '--'}
                </Text>
                <Text style={styles.dateMonth}>
                  {item.date ? new Date(item.date).toLocaleDateString('en', { month: 'short' }).toUpperCase() : '---'}
                </Text>
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>{item.time || 'TBD'}</Text>
                <Text style={styles.guestText}>{item.partySize} guests</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.reservationDetails}>
          <View style={styles.detailChip}>
            <Ionicons name={getAreaIcon(item.venueArea) as any} size={14} color={Colors.accent.primary} />
            <Text style={styles.detailChipText}>{item.venueArea}</Text>
          </View>

          {item.tableNumber && (
            <View style={styles.detailChip}>
              <Ionicons name="grid-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.detailChipText}>Table {item.tableNumber}</Text>
            </View>
          )}
        </View>

        {item.specialRequests && (
          <View style={styles.specialRow}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.text.tertiary} />
            <Text style={styles.specialText} numberOfLines={2}>{item.specialRequests}</Text>
          </View>
        )}

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelReservation(item.id)}
            >
              <Ionicons name="close" size={16} color={Colors.status.error} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modifyButton}>
              <Ionicons name="create-outline" size={16} color={Colors.accent.primary} />
              <Text style={styles.modifyButtonText}>Modify</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="calendar-outline" size={56} color={Colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Reservations Yet</Text>
      <Text style={styles.emptySubtitle}>
        Book a premium table and enjoy{'\n'}our signature dining experience
      </Text>
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => (navigation as any).navigate('TableBooking')}
      >
        <LinearGradient colors={Colors.gradients.goldCta} style={styles.bookBtnGradient}>
          <Ionicons name="add" size={20} color={Colors.background.primary} />
          <Text style={styles.bookBtnText}>Book a Table</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading reservations..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      <View style={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', flex: 1 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reservations</Text>
            <Text style={styles.subtitle}>Your dining bookings</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => (navigation as any).navigate('TableBooking')}
          >
            <LinearGradient colors={Colors.gradients.goldCta} style={styles.addButtonGradient}>
              <Ionicons name="add" size={22} color={Colors.background.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Dine-In Info Banner */}
        <TouchableOpacity
          style={styles.dineInBanner}
          activeOpacity={0.9}
          onPress={() => (navigation as any).navigate('TableBooking')}
        >
          <LinearGradient
            colors={Colors.gradients.dineIn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dineInGradient}
          >
            <View style={styles.dineInContent}>
              <Ionicons name="restaurant" size={24} color="rgba(255,255,255,0.9)" />
              <View style={styles.dineInTextBox}>
                <Text style={styles.dineInTitle}>Premium Dine-In</Text>
                <Text style={styles.dineInDesc}>Reserve your table for a luxury experience</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          renderItem={renderReservation}
          contentContainerStyle={reservations.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent.primary}
              colors={[Colors.accent.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dine-In Banner
  dineInBanner: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  dineInGradient: {
    padding: Spacing.lg,
  },
  dineInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dineInTextBox: {
    flex: 1,
  },
  dineInTitle: {
    ...Typography.label,
    color: '#fff',
  },
  dineInDesc: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  listContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Reservation Card
  reservationCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reservationInfo: {
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dateBox: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    ...Typography.h3,
    color: Colors.accent.primary,
    fontSize: 20,
    lineHeight: 24,
  },
  dateMonth: {
    ...Typography.badge,
    color: Colors.accent.primary,
    fontSize: 9,
  },
  timeInfo: {},
  timeText: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontSize: 16,
  },
  guestText: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 4,
  },
  statusText: {
    ...Typography.badge,
    fontSize: 9,
  },

  // Details
  reservationDetails: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
    flexWrap: 'wrap',
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    gap: 5,
  },
  detailChipText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '500',
  },

  // Special Requests
  specialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    gap: 6,
  },
  specialText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    flex: 1,
    fontStyle: 'italic',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
    gap: 10,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 4,
  },
  cancelButtonText: {
    ...Typography.label,
    color: Colors.status.error,
    fontSize: 13,
  },
  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent.muted,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    gap: 4,
  },
  modifyButtonText: {
    ...Typography.label,
    color: Colors.accent.primary,
    fontSize: 13,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
    lineHeight: 22,
    marginBottom: 24,
  },
  bookBtn: {
    borderRadius: Radius.button,
    overflow: 'hidden',
  },
  bookBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  bookBtnText: {
    ...Typography.button,
    color: Colors.background.primary,
  },
});

export default ReservationScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert, StatusBar, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '../../store/store';
import { fetchOrders } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import QRScanner from '../../components/common/QRScanner';
import { Order } from '../../types/api';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { orders, isLoading } = useSelector((state: RootState) => state.order);
  const [refreshing, setRefreshing] = useState(false);
  const [qrModal, setQrModal] = useState(false);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchOrders()); setRefreshing(false); };

  const handleScan = (data: string) => {
    setQrModal(false);
    try {
      const result = JSON.parse(data);
      if (result.type === 'order') navigation.navigate('OrderTracking', { orderId: result.value });
      else if (result.type === 'coupon') Alert.alert('Coupon Scanned!', `Code: ${result.value}`);
      else Alert.alert('Unknown QR Code', data);
    } catch { Alert.alert('Scanned', data); }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: string }> = {
      pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: 'time' },
      confirmed: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: 'checkmark-circle' },
      preparing: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: 'restaurant' },
      ready: { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)', icon: 'bag-check' },
      completed: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: 'checkmark-done-circle' },
      cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: 'close-circle' },
    };
    return configs[status] || configs.pending;
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const sc = getStatusConfig(item.status);
    return (
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.orderId}>Order #{String(item.id).slice(-6)}</Text>
            <Text style={s.orderDate}>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Ionicons name={sc.icon as any} size={12} color={sc.color} />
            <Text style={[s.statusText, { color: sc.color }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={s.cardBody}>
          {item.items?.slice(0, 2).map((oi, i) => <Text key={i} style={s.itemText}>{oi.quantity}× {oi.menuItem.name}</Text>)}
          {item.items?.length > 2 && <Text style={s.moreItems}>+{item.items.length - 2} more</Text>}
        </View>
        <View style={s.cardFooter}>
          <View style={s.orderTypeChip}>
            <Ionicons name={item.orderType === 'delivery' ? 'bicycle' : item.orderType === 'pickup' ? 'bag' : 'restaurant'} size={14} color={Colors.text.secondary} />
            <Text style={s.orderTypeText}>{item.orderType.replace('_', ' ')}</Text>
          </View>
          <Text style={s.orderTotal}>₹{item.totalAmount.toFixed(0)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && orders.length === 0) return <View style={s.loading}><LoadingSpinner message="Loading orders..." /></View>;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <View style={[s.header, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}>
        <Text style={s.title}>Order History</Text>
        <TouchableOpacity style={s.scanBtn} onPress={() => setQrModal(true)}>
          <Ionicons name="qr-code" size={20} color={Colors.accent.primary} />
        </TouchableOpacity>
      </View>
      <View style={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', flex: 1 }]}>
      <FlatList data={orders} keyExtractor={i => String(i.id)} renderItem={renderOrder}
        contentContainerStyle={orders.length === 0 ? s.emptyWrap : s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIcon}><Ionicons name="receipt-outline" size={48} color={Colors.text.tertiary} /></View>
            <Text style={s.emptyTitle}>No Orders Yet</Text>
            <Text style={s.emptySub}>Place your first order to see it here</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent.primary} colors={[Colors.accent.primary]} />}
        showsVerticalScrollIndicator={false}
        />
      </View>
      <Modal visible={qrModal} animationType="slide"><QRScanner visible={qrModal} onScan={handleScan} onCancel={() => setQrModal(false)} /></Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  loading: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg },
  title: { ...Typography.h2, color: Colors.text.primary },
  scanBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent.muted, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border.gold },
  list: { padding: Spacing.lg },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  card: { backgroundColor: Colors.background.card, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  orderId: { ...Typography.label, color: Colors.text.primary },
  orderDate: { ...Typography.caption, color: Colors.text.tertiary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, gap: 4 },
  statusText: { ...Typography.badge, fontSize: 9 },
  cardBody: { paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.secondary },
  itemText: { ...Typography.body, color: Colors.text.secondary, marginBottom: 2 },
  moreItems: { ...Typography.caption, color: Colors.text.tertiary, fontStyle: 'italic', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.md },
  orderTypeChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderTypeText: { ...Typography.caption, color: Colors.text.secondary, textTransform: 'capitalize' },
  orderTotal: { ...Typography.price, color: Colors.accent.primary },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.background.tertiary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: 8 },
  emptySub: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center' },
});

export default OrderHistoryScreen;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSocket } from '../../services/socket/socketService';
import { orderApi } from '../../services/api/orderApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Order } from '../../types/api';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

type TrackingScreenRouteProp = RouteProp<
  { params: { orderId: string } },
  'params'
>;

const OrderTrackingScreen: React.FC = () => {
  const route = useRoute<TrackingScreenRouteProp>();
  const { orderId } = route.params;
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchOrderDetails();
    
    const socket = getSocket();
    if (socket) {
      // Join order-specific room for real-time updates
      socket.emit('joinOrderRoom', orderId);
      console.log(`Joined order room: ${orderId}`);
      
      // Listen for connection status
      socket.on('connect', () => {
        setConnectionStatus('connected');
      });

      socket.on('disconnect', () => {
        setConnectionStatus('disconnected');
      });

      socket.on('reconnect', () => {
        setConnectionStatus('connected');
        socket.emit('joinOrderRoom', orderId); // Rejoin room after reconnection
      });
      
      // Listen for real-time order status updates
      socket.on('orderStatusUpdate', (updatedOrder) => {
        console.log('Received order status update:', updatedOrder);
        
        if (updatedOrder.orderId === orderId) {
          setOrder(prev => prev ? { 
            ...prev, 
            status: updatedOrder.status,
            estimatedTime: updatedOrder.estimatedTime || prev.estimatedTime
          } : null);
          
          // Show alert/notification for status changes
          const statusMessages = {
            confirmed: 'Your order has been confirmed!',
            preparing: 'Your order is being prepared',
            ready: 'Your order is ready for pickup!',
            completed: 'Order completed. Thank you!',
            cancelled: 'Your order has been cancelled'
          };
          
          if (statusMessages[updatedOrder.status]) {
            Alert.alert('Order Update', statusMessages[updatedOrder.status]);
          }
        }
      });

      // Listen for estimated time updates
      socket.on('orderTimeUpdate', (timeUpdate) => {
        if (timeUpdate.orderId === orderId) {
          setOrder(prev => prev ? {
            ...prev,
            estimatedTime: timeUpdate.estimatedTime
          } : null);
        }
      });

      // Listen for vendor messages
      socket.on('vendorMessage', (message) => {
        if (message.orderId === orderId) {
          Alert.alert('Message from Vendor', message.content);
        }
      });

      return () => {
        // Clean up socket listeners on component unmount
        socket.emit('leaveOrderRoom', orderId);
        socket.off('connect');
        socket.off('disconnect');
        socket.off('reconnect');
        socket.off('orderStatusUpdate');
        socket.off('orderTimeUpdate');
        socket.off('vendorMessage');
        console.log(`Left order room: ${orderId}`);
      };
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      // Animate page content entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate top progress bar
      Animated.timing(progressWidth, {
        toValue: getProgressPercentage(),
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderApi.getOrderById(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        Alert.alert('Error', 'Failed to load order details');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      Alert.alert('Error', 'Unable to load order details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  };

  const trackingSteps = [
    { key: 'pending', label: 'Order Placed', icon: 'checkmark-circle-outline' as const, description: 'Your order has been received' },
    { key: 'confirmed', label: 'Order Confirmed', icon: 'thumbs-up-outline' as const, description: 'Vendor confirmed your order' },
    { key: 'preparing', label: 'Preparing', icon: 'restaurant-outline' as const, description: 'Your food is being prepared' },
    { key: 'ready', label: 'Ready for Pickup', icon: 'bag-check-outline' as const, description: 'Your order is ready!' },
    { key: 'completed', label: 'Order Completed', icon: 'checkmark-done-circle-outline' as const, description: 'Thank you for your order' },
  ];

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'inactive';
    
    const currentIndex = trackingSteps.findIndex(step => step.key === order.status);
    const stepIndex = trackingSteps.findIndex(step => step.key === stepKey);
    
    if (order.status === 'cancelled') {
      return stepIndex === 0 ? 'active' : 'inactive';
    }
    
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'active';
    return 'inactive';
  };

  const getEstimatedDeliveryTime = () => {
    if (!order || order.status === 'completed' || order.status === 'cancelled') return null;

    if (order.estimatedTime) {
      return `Estimated ready time: ${order.estimatedTime}`;
    }

    const baseTime = {
      pending: 20,
      confirmed: 18,
      preparing: 10,
      ready: 0
    };

    const minutes = baseTime[order.status as keyof typeof baseTime] || 15;
    return minutes > 0 ? `Estimated ${minutes} minutes remaining` : 'Ready now!';
  };

  const getProgressPercentage = () => {
    if (!order) return 0;

    const progressMap = {
      pending: 20,
      confirmed: 40,
      preparing: 60,
      ready: 80,
      completed: 100,
      cancelled: 0
    };

    return progressMap[order.status as keyof typeof progressMap] || 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <LoadingSpinner message="Locating your order..." />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorWrapper}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
        <Ionicons name="alert-circle" size={72} color={Colors.status.error} />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorText}>Unable to locate order ID #{orderId}</Text>
        <TouchableOpacity style={styles.errorBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const animatedWidth = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      
      {/* Custom Navigation Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>Track Order</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Connection Status Banner */}
      <View style={[styles.connectionStatus, 
        connectionStatus === 'connected' && styles.connected,
        connectionStatus === 'disconnected' && styles.disconnected
      ]}>
        <Ionicons 
          name={connectionStatus === 'connected' ? 'wifi' : 'wifi-outline'} 
          size={14} 
          color="#fff" 
        />
        <Text style={styles.connectionText}>
          {connectionStatus === 'connected' ? 'Live order tracking enabled' : 'Reconnecting...'}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.accent.primary}
            colors={[Colors.accent.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Order Brief Info */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.typeBadge}>
                <Ionicons 
                  name={order.orderType === 'delivery' ? 'bicycle' : order.orderType === 'pickup' ? 'bag-handle' : 'restaurant'} 
                  size={14} 
                  color={Colors.accent.primary} 
                />
                <Text style={styles.typeBadgeText}>{order.orderType.toUpperCase()}</Text>
              </View>
            </View>

            {/* Horizontal progress bar */}
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, { width: animatedWidth }]} />
            </View>
            
            {getEstimatedDeliveryTime() && (
              <View style={styles.estimatedTimeContainer}>
                <Ionicons name="time-outline" size={18} color={Colors.accent.primary} />
                <Text style={styles.estimatedTime}>{getEstimatedDeliveryTime()}</Text>
              </View>
            )}
          </View>

          {/* Cancelled State */}
          {order.status === 'cancelled' && (
            <View style={styles.cancelledContainer}>
              <Ionicons name="close-circle-outline" size={56} color={Colors.status.error} />
              <Text style={styles.cancelledTitle}>Order Cancelled</Text>
              <Text style={styles.cancelledMessage}>
                This order has been cancelled by the vendor or system. If this is a mistake, please reach out to customer support.
              </Text>
            </View>
          )}

          {/* Active Status Steps */}
          {order.status !== 'cancelled' && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Order Status</Text>
              
              <View style={styles.trackingSteps}>
                {trackingSteps.map((step, index) => {
                  const status = getStepStatus(step.key);
                  const isActive = status === 'active';
                  const isCompleted = status === 'completed';
                  
                  return (
                    <View key={step.key} style={styles.trackingStep}>
                      <View style={styles.stepIndicator}>
                        <View
                          style={[
                            styles.stepCircle,
                            isCompleted && styles.stepCircleCompleted,
                            isActive && styles.stepCircleActive,
                          ]}
                        >
                          <Ionicons
                            name={step.icon}
                            size={18}
                            color={
                              isCompleted
                                ? Colors.background.primary
                                : isActive
                                ? Colors.accent.primary
                                : Colors.text.tertiary
                            }
                          />
                        </View>
                        {index < trackingSteps.length - 1 && (
                          <View
                            style={[
                              styles.stepConnector,
                              isCompleted && styles.connectorCompleted,
                            ]}
                          />
                        )}
                      </View>
                      
                      <View style={styles.stepContent}>
                        <Text
                          style={[
                            styles.stepLabel,
                            isActive && styles.stepLabelActive,
                            isCompleted && styles.stepLabelCompleted,
                          ]}
                        >
                          {step.label}
                        </Text>
                        <Text style={styles.stepDescription}>
                          {isActive ? 'Processing your order now...' : step.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Order Bill Summary */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Summary Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <View style={styles.badgeRow}>
                <Ionicons 
                  name={order.paymentMethod === 'wallet' ? 'wallet-outline' : 'card-outline'} 
                  size={14} 
                  color={Colors.text.secondary} 
                />
                <Text style={styles.detailValue}>
                  {order.paymentMethod === 'wallet' ? 'Wallet Balance' : 'Card/UPI'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>
                ₹{order.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Ordered Food Items */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Items Ordered ({order.items?.length || 0})</Text>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.menuItem.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  {item.menuItem.description && (
                    <Text style={styles.itemDescription} numberOfLines={1}>{item.menuItem.description}</Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>

          {/* Chef notes / instructions */}
          {order.specialInstructions && (
            <View style={[styles.card, { marginBottom: 40 }]}>
              <Text style={styles.sectionTitle}>Notes to Kitchen</Text>
              <View style={styles.instructionsContainer}>
                <Ionicons name="chatbubble-outline" size={16} color={Colors.accent.primary} />
                <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingWrapper: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorWrapper: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  errorBackBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: Radius.button,
    backgroundColor: Colors.accent.primary,
  },
  errorBackText: {
    ...Typography.button,
    color: Colors.background.primary,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  navigationTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
    backgroundColor: Colors.status.warning,
  },
  connected: {
    backgroundColor: Colors.status.success,
  },
  disconnected: {
    backgroundColor: Colors.status.error,
  },
  connectionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  orderId: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontSize: 20,
  },
  orderDate: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent.muted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  typeBadgeText: {
    ...Typography.badge,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: 3,
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 8,
  },
  estimatedTime: {
    ...Typography.body,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },
  trackingSteps: {
    paddingLeft: Spacing.xs,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border.primary,
    zIndex: 1,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  stepCircleActive: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.accent.primary,
  },
  stepConnector: {
    width: 2,
    height: 38,
    backgroundColor: Colors.border.primary,
    marginTop: -2,
    marginBottom: -2,
  },
  connectorCompleted: {
    backgroundColor: Colors.accent.primary,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  stepLabel: {
    ...Typography.label,
    color: Colors.text.tertiary,
  },
  stepLabelActive: {
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  stepLabelCompleted: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  stepDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  cancelledContainer: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.xxl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  cancelledTitle: {
    ...Typography.h3,
    color: Colors.status.error,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cancelledMessage: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
  },
  detailValue: {
    ...Typography.bodySm,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: Spacing.xl,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  totalLabel: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  totalValue: {
    ...Typography.priceLg,
    color: Colors.accent.primary,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemName: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  itemQuantity: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  itemDescription: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  itemPrice: {
    ...Typography.body,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  instructionsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  instructionsText: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 18,
  },
});

export default OrderTrackingScreen;

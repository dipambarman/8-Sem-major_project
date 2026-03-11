import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSocket } from '../../services/socket/socketService';
import { orderApi } from '../../services/api/orderApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Order } from '../../types/api';

type TrackingScreenRouteProp = RouteProp<
  { params: { orderId: string } },
  'params'
>;

const OrderTrackingScreen: React.FC = () => {
  const route = useRoute<TrackingScreenRouteProp>();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

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
        console.log('Socket connected for order tracking');
      });

      socket.on('disconnect', () => {
        setConnectionStatus('disconnected');
        console.log('Socket disconnected');
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
          
          // Show notification for status changes
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
    { key: 'pending', label: 'Order Placed', icon: 'checkmark-circle', description: 'Your order has been received' },
    { key: 'confirmed', label: 'Order Confirmed', icon: 'thumbs-up', description: 'Vendor confirmed your order' },
    { key: 'preparing', label: 'Preparing', icon: 'restaurant', description: 'Your food is being prepared' },
    { key: 'ready', label: 'Ready for Pickup', icon: 'bag-check', description: 'Your order is ready!' },
    { key: 'completed', label: 'Order Completed', icon: 'checkmark-done', description: 'Thank you for your order' },
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

    const minutes = baseTime[order.status] || 15;
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

    return progressMap[order.status] || 0;
  };

  if (loading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorText}>Unable to find order #{orderId}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Connection Status Indicator */}
      <View style={[styles.connectionStatus, 
        connectionStatus === 'connected' && styles.connected,
        connectionStatus === 'disconnected' && styles.disconnected
      ]}>
        <Ionicons 
          name={connectionStatus === 'connected' ? 'wifi' : 'wifi-outline'} 
          size={16} 
          color="#fff" 
        />
        <Text style={styles.connectionText}>
          {connectionStatus === 'connected' ? 'Live updates enabled' : 'Reconnecting...'}
        </Text>
      </View>

      {/* Order Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <Text style={styles.orderDate}>
          Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
          {new Date(order.createdAt).toLocaleTimeString()}
        </Text>
        
        {getEstimatedDeliveryTime() && (
          <View style={styles.estimatedTimeContainer}>
            <Ionicons name="time" size={16} color="#007AFF" />
            <Text style={styles.estimatedTime}>{getEstimatedDeliveryTime()}</Text>
          </View>
        )}
      </View>

      {/* Order Status Tracking */}
      {order.status !== 'cancelled' && (
        <View style={styles.trackingContainer}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          
          <View style={styles.trackingSteps}>
            {trackingSteps.map((step, index) => {
              const status = getStepStatus(step.key);
              return (
                <View key={step.key} style={styles.trackingStep}>
                  <View style={styles.stepIndicator}>
                    <View
                      style={[
                        styles.stepCircle,
                        status === 'completed' && styles.stepCompleted,
                        status === 'active' && styles.stepActive,
                      ]}
                    >
                      <Ionicons
                        name={step.icon}
                        size={20}
                        color={
                          status === 'completed' || status === 'active' ? '#fff' : '#ccc'
                        }
                      />
                    </View>
                    {index < trackingSteps.length - 1 && (
                      <View
                        style={[
                          styles.stepConnector,
                          status === 'completed' && styles.connectorCompleted,
                        ]}
                      />
                    )}
                  </View>
                  
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        status === 'active' && styles.stepLabelActive,
                        status === 'completed' && styles.stepLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.stepDescription}>
                      {status === 'active' ? 'In progress...' : step.description}
                    </Text>
                    {status === 'completed' && order.status === step.key && (
                      <Text style={styles.stepTime}>
                        {new Date().toLocaleTimeString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Cancelled Order */}
      {order.status === 'cancelled' && (
        <View style={styles.cancelledContainer}>
          <Ionicons name="close-circle" size={64} color="#FF3B30" />
          <Text style={styles.cancelledTitle}>Order Cancelled</Text>
          <Text style={styles.cancelledMessage}>
            This order has been cancelled. If you have any questions, please contact support.
          </Text>
        </View>
      )}

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order Type</Text>
          <View style={styles.orderTypeContainer}>
            <Ionicons 
              name={order.orderType === 'delivery' ? 'bicycle' : order.orderType === 'pickup' ? 'bag' : 'restaurant'} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.detailValue}>
              {order.orderType.replace('_', ' ')}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            <Ionicons 
              name={order.paymentMethod === 'wallet' ? 'wallet' : 'card'} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.detailValue}>
              {order.paymentMethod === 'wallet' ? 'Wallet' : 'Card/UPI'}
            </Text>
          </View>
        </View>
        
        <View style={[styles.detailRow, styles.totalRow]}>
          <Text style={styles.detailLabel}>Total Amount</Text>
          <Text style={[styles.detailValue, styles.totalAmount]}>
            ₹{order.totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.itemsContainer}>
        <Text style={styles.sectionTitle}>Items Ordered ({order.items?.length || 0})</Text>
        {order.items?.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.menuItem.name}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              {item.menuItem.description && (
                <Text style={styles.itemDescription}>{item.menuItem.description}</Text>
              )}
            </View>
            <Text style={styles.itemPrice}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF9500',
  },
  connected: {
    backgroundColor: '#34C759',
  },
  disconnected: {
    backgroundColor: '#FF3B30',
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  estimatedTime: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  trackingContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  trackingSteps: {
    paddingLeft: 8,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: '#34C759',
  },
  stepActive: {
    backgroundColor: '#007AFF',
  },
  stepConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#f0f0f0',
    marginTop: -8,
  },
  connectorCompleted: {
    backgroundColor: '#34C759',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  stepLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  stepLabelCompleted: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  stepTime: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
    fontWeight: '500',
  },
  cancelledContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelledTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  cancelledMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderDetails: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  itemsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default OrderTrackingScreen;

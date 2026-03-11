import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types/api';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onTrack?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, onTrack }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'preparing':
        return '#FF5722';
      case 'ready':
        return '#4CAF50';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'bicycle';
      case 'pickup':
        return 'bag';
      case 'dine_in':
        return 'restaurant';
      default:
        return 'bag';
    }
  };

  const formatOrderType = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'Delivery';
      case 'pickup':
        return 'Pickup';
      case 'dine_in':
        return 'Dine In';
      default:
        return type;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <View style={styles.orderMeta}>
            <Ionicons
              name={getOrderTypeIcon(order.orderType)}
              size={16}
              color="#666"
            />
            <Text style={styles.orderType}>
              {formatOrderType(order.orderType)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.itemCount}>
          {order.items.length} item{order.items.length > 1 ? 's' : ''}
        </Text>
        
        <View style={styles.items}>
          {order.items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemName}>
              {item.quantity}x {item.menuItem.name}
            </Text>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {order.slotTime && (
          <View style={styles.slotInfo}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.slotText}>
              {new Date(order.slotTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.total}>₹{order.totalAmount.toFixed(2)}</Text>
        <Text style={styles.date}>
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
        
        {onTrack && ['confirmed', 'preparing'].includes(order.status) && (
          <TouchableOpacity style={styles.trackButton} onPress={onTrack}>
            <Text style={styles.trackButtonText}>Track</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  items: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  slotText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  trackButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OrderCard;

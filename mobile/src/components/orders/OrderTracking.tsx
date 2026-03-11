import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types/api';

interface OrderTrackingProps {
  order: Order;
  realTimeUpdates?: boolean;
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  order,
  realTimeUpdates = true,
}) => {
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);

  useEffect(() => {
    const steps = generateTrackingSteps(order);
    setTrackingSteps(steps);
  }, [order]);

  const generateTrackingSteps = (order: Order): TrackingStep[] => {
    const baseSteps = [
      {
        id: 'placed',
        title: 'Order Placed',
        description: 'Your order has been received',
        completed: true,
        active: false,
        timestamp: order.createdAt,
      },
      {
        id: 'confirmed',
        title: 'Order Confirmed',
        description: 'Restaurant confirmed your order',
        completed: ['confirmed', 'preparing', 'ready', 'completed'].includes(order.status),
        active: order.status === 'confirmed',
      },
      {
        id: 'preparing',
        title: 'Preparing',
        description: 'Your food is being prepared',
        completed: ['preparing', 'ready', 'completed'].includes(order.status),
        active: order.status === 'preparing',
      },
      {
        id: 'ready',
        title: order.orderType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup',
        description: order.orderType === 'delivery' 
          ? 'Your order is on the way' 
          : 'Your order is ready for pickup',
        completed: ['ready', 'completed'].includes(order.status),
        active: order.status === 'ready',
      },
      {
        id: 'completed',
        title: 'Completed',
        description: order.orderType === 'delivery' 
          ? 'Order delivered successfully' 
          : 'Order picked up successfully',
        completed: order.status === 'completed',
        active: order.status === 'completed',
      },
    ];

    return baseSteps;
  };

  const getEstimatedTime = () => {
    if (order.slotTime) {
      const slotDate = new Date(order.slotTime);
      return `Expected by ${slotDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    const estimatedMinutes = order.orderType === 'delivery' ? 30 : 15;
    const estimatedTime = new Date(Date.now() + estimatedMinutes * 60000);
    return `Estimated ${estimatedTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.estimatedTime}>{getEstimatedTime()}</Text>
      </View>

      <View style={styles.trackingContainer}>
        {trackingSteps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepCircle,
                  step.completed && styles.completedCircle,
                  step.active && styles.activeCircle,
                ]}
              >
                {step.completed ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <View
                    style={[
                      styles.stepDot,
                      step.active && styles.activeDot,
                    ]}
                  />
                )}
              </View>
              
              {index < trackingSteps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    step.completed && styles.completedLine,
                  ]}
                />
              )}
            </View>

            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepTitle,
                  (step.completed || step.active) && styles.activeStepTitle,
                ]}
              >
                {step.title}
              </Text>
              <Text
                style={[
                  styles.stepDescription,
                  (step.completed || step.active) && styles.activeStepDescription,
                ]}
              >
                {step.description}
              </Text>
              {step.timestamp && (
                <Text style={styles.stepTimestamp}>
                  {new Date(step.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {order.orderType === 'pickup' && order.status === 'ready' && (
        <View style={styles.pickupNotice}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.pickupText}>
            Your order is ready! Please come to the pickup counter.
          </Text>
        </View>
      )}

      {order.orderType === 'dine_in' && order.slotTime && (
        <View style={styles.dineInInfo}>
          <Ionicons name="restaurant" size={20} color="#007AFF" />
          <Text style={styles.dineInText}>
            Table reservation at {new Date(order.slotTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  trackingContainer: {
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: '#4CAF50',
  },
  activeCircle: {
    backgroundColor: '#007AFF',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
  },
  completedLine: {
    backgroundColor: '#4CAF50',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  activeStepTitle: {
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  activeStepDescription: {
    color: '#666',
  },
  stepTimestamp: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  pickupNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  pickupText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  dineInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  dineInText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default OrderTracking;

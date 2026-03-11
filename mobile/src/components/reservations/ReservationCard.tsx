import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '../../types/api';

interface ReservationCardProps {
  reservation: Reservation;
  onPress: () => void;
  onCancel?: () => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onPress,
  onCancel,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const isUpcoming = () => {
    const reservationTime = new Date(reservation.reservationTime);
    return reservationTime > new Date() && reservation.status === 'active';
  };

  const isPast = () => {
    const reservationTime = new Date(reservation.reservationTime);
    return reservationTime < new Date();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateText = '';
    if (date.toDateString() === today.toDateString()) {
      dateText = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateText = 'Tomorrow';
    } else {
      dateText = date.toLocaleDateString();
    }
    
    const timeText = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return { dateText, timeText };
  };

  const { dateText, timeText } = formatDateTime(reservation.reservationTime);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.reservationInfo}>
          <Text style={styles.reservationId}>
            Reservation #{reservation.id.slice(-6).toUpperCase()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
            <Text style={styles.statusText}>
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTime}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateText}>{dateText}</Text>
          </View>
          <View style={styles.dateTime}>
            <Ionicons name="time" size={20} color="#007AFF" />
            <Text style={styles.timeText}>{timeText}</Text>
          </View>
        </View>

        <View style={styles.partyInfo}>
          <Ionicons name="people" size={20} color="#666" />
          <Text style={styles.partyText}>
            {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
          </Text>
        </View>

        {isUpcoming() && (
          <View style={styles.upcomingNotice}>
            <Ionicons name="information-circle" size={16} color="#007AFF" />
            <Text style={styles.upcomingText}>
              Please arrive 5 minutes before your reservation time
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.createdDate}>
          Booked on {new Date(reservation.createdAt).toLocaleDateString()}
        </Text>
        
        {isUpcoming() && onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
    marginBottom: 12,
  },
  reservationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reservationId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  dateTimeContainer: {
    marginBottom: 12,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partyText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  upcomingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
  },
  upcomingText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 6,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: 12,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ReservationCard;

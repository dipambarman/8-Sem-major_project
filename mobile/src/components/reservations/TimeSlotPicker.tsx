import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimeSlot {
  time: string;
  available: boolean;
  isPremium?: boolean;
}

interface TimeSlotPickerProps {
  selectedDate: Date;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  isPremiumUser?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  isPremiumUser = false,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate]);

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    // Generate slots from 8 AM to 10 PM
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Skip past times for today
        if (isToday && slotTime <= now) {
          continue;
        }
        
        const timeString = slotTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        // Simulate availability (in real app, this would come from API)
        const available = Math.random() > 0.3;
        const isPremium = Math.random() > 0.7; // Some slots are premium-only
        
        slots.push({
          time: timeString,
          available: available || isPremiumUser, // Premium users can book premium slots
          isPremium,
        });
      }
    }
    
    setTimeSlots(slots);
  };

  const renderTimeSlot = (slot: TimeSlot) => {
    const isSelected = selectedTime === slot.time;
    const canSelect = slot.available;
    
    return (
      <TouchableOpacity
        key={slot.time}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedSlot,
          !canSelect && styles.unavailableSlot,
          slot.isPremium && styles.premiumSlot,
        ]}
        onPress={() => canSelect && onTimeSelect(slot.time)}
        disabled={!canSelect}
      >
        <Text
          style={[
            styles.timeText,
            isSelected && styles.selectedTimeText,
            !canSelect && styles.unavailableTimeText,
          ]}
        >
          {slot.time}
        </Text>
        {slot.isPremium && (
          <Ionicons name="star" size={12} color="#FFD700" />
        )}
      </TouchableOpacity>
    );
  };

  const morningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 17;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Morning (8:00 AM - 12:00 PM)</Text>
        <View style={styles.slotsGrid}>
          {morningSlots.map(renderTimeSlot)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Afternoon (12:00 PM - 5:00 PM)</Text>
        <View style={styles.slotsGrid}>
          {afternoonSlots.map(renderTimeSlot)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evening (5:00 PM - 10:00 PM)</Text>
        <View style={styles.slotsGrid}>
          {eveningSlots.map(renderTimeSlot)}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.availableDot]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.premiumDot]} />
          <Text style={styles.legendText}>Premium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.unavailableDot]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedSlot: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unavailableSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  premiumSlot: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#fff',
  },
  unavailableTimeText: {
    color: '#999',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  availableDot: {
    backgroundColor: '#4CAF50',
  },
  premiumDot: {
    backgroundColor: '#FFD700',
  },
  unavailableDot: {
    backgroundColor: '#999',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default TimeSlotPicker;

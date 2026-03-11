import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/common/Button';

const TableBookingScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM'
  ];

  const diningAreas = [
    { id: 'main', name: 'Main Dining', description: 'Indoor seating with AC' },
    { id: 'outdoor', name: 'Outdoor Seating', description: 'Garden area with natural air' },
    { id: 'private', name: 'Private Room', description: 'Separate room for groups' },
    { id: 'counter', name: 'Counter Seating', description: 'Quick dining at the counter' },
  ];

  const handleBooking = async () => {
    if (!selectedTime || !selectedArea) {
      Alert.alert('Incomplete Details', 'Please select time and dining area');
      return;
    }

    setLoading(true);

    try {
      // Mock API call - replace with actual booking API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Booking Confirmed!',
        `Your table has been reserved for ${partySize} guests on ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Booking Failed', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const PartySizeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Party Size</Text>
      <View style={styles.partySizeContainer}>
        {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.partySizeButton,
              partySize === size && styles.selectedPartySize,
            ]}
            onPress={() => setPartySize(size)}
          >
            <Text
              style={[
                styles.partySizeText,
                partySize === size && styles.selectedPartySizeText,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const TimeSlotSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Time</Text>
      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeSlot,
              selectedTime === time && styles.selectedTimeSlot,
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text
              style={[
                styles.timeSlotText,
                selectedTime === time && styles.selectedTimeSlotText,
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const DiningAreaSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dining Area</Text>
      {diningAreas.map((area) => (
        <TouchableOpacity
          key={area.id}
          style={[
            styles.areaCard,
            selectedArea === area.id && styles.selectedAreaCard,
          ]}
          onPress={() => setSelectedArea(area.id)}
        >
          <View style={styles.areaInfo}>
            <Text style={styles.areaName}>{area.name}</Text>
            <Text style={styles.areaDescription}>{area.description}</Text>
          </View>
          {selectedArea === area.id && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Book a Table</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#007AFF" />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          minimumDate={new Date()}
        />
      )}

      <PartySizeSelector />
      <TimeSlotSelector />
      <DiningAreaSelector />

      {/* Special Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          placeholder="Any special requirements or preferences..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Booking Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date & Time</Text>
          <Text style={styles.summaryValue}>
            {selectedDate.toLocaleDateString()} at {selectedTime || 'Not selected'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Party Size</Text>
          <Text style={styles.summaryValue}>{partySize} guests</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Dining Area</Text>
          <Text style={styles.summaryValue}>
            {selectedArea ? diningAreas.find(a => a.id === selectedArea)?.name : 'Not selected'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Confirm Booking"
          onPress={handleBooking}
          loading={loading}
          disabled={!selectedTime || !selectedArea}
          size="large"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  partySizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  partySizeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPartySize: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  partySizeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedPartySizeText: {
    color: '#fff',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTimeSlot: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedAreaCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  areaDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  summarySection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default TableBookingScreen;

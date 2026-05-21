import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/common/Button';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

const DINING_AREAS = [
  { id: 'main', name: 'Main Dining', description: 'Indoor seating with AC', icon: 'restaurant', capacity: '2-8', color: '#3B82F6' },
  { id: 'outdoor', name: 'Garden Terrace', description: 'Open-air garden ambiance', icon: 'leaf', capacity: '2-6', color: '#10B981' },
  { id: 'private', name: 'Private Room', description: 'Exclusive room for groups', icon: 'lock-closed', capacity: '4-12', color: '#8B5CF6' },
  { id: 'rooftop', name: 'Rooftop Lounge', description: 'Sky-high dining experience', icon: 'moon', capacity: '2-8', color: '#F59E0B' },
  { id: 'counter', name: 'Chef\'s Counter', description: 'Watch the chef in action', icon: 'flame', capacity: '1-4', color: '#EF4444' },
];

const TableBookingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: date, 1: time, 2: area, 3: confirm

  const lunchSlots = ['11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'];
  const dinnerSlots = ['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'];

  const handleBooking = async () => {
    if (!selectedTime || !selectedArea) {
      Alert.alert('Incomplete Details', 'Please select time and dining area');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        '🎉 Reservation Confirmed!',
        `Your table has been reserved for ${partySize} guests on ${selectedDate.toLocaleDateString()} at ${selectedTime} in ${DINING_AREAS.find(a => a.id === selectedArea)?.name}`,
        [
          {
            text: 'View Reservations',
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

  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      {['Date', 'Time', 'Area', 'Confirm'].map((label, i) => (
        <View key={label} style={styles.stepItem}>
          <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
            {i < step ? (
              <Ionicons name="checkmark" size={12} color={Colors.background.primary} />
            ) : (
              <Text style={[styles.stepNumber, i <= step && styles.stepNumberActive]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{label}</Text>
          {i < 3 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );

  const renderPartySizeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Party Size</Text>
      <Text style={styles.sectionHint}>How many guests?</Text>
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

  const renderTimeSlots = (label: string, slots: string[]) => (
    <View style={styles.timeGroup}>
      <Text style={styles.timeGroupLabel}>{label}</Text>
      <View style={styles.timeSlotsContainer}>
        {slots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeSlot,
              selectedTime === time && styles.selectedTimeSlot,
            ]}
            onPress={() => { setSelectedTime(time); setStep(Math.max(step, 2)); }}
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

  const renderDiningAreas = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dining Area</Text>
      <Text style={styles.sectionHint}>Choose your preferred ambiance</Text>
      {DINING_AREAS.map((area) => (
        <TouchableOpacity
          key={area.id}
          style={[
            styles.areaCard,
            selectedArea === area.id && styles.selectedAreaCard,
          ]}
          onPress={() => { setSelectedArea(area.id); setStep(Math.max(step, 3)); }}
          activeOpacity={0.8}
        >
          <View style={[styles.areaIconBox, { backgroundColor: `${area.color}15` }]}>
            <Ionicons name={area.icon as any} size={22} color={area.color} />
          </View>
          <View style={styles.areaInfo}>
            <Text style={[styles.areaName, selectedArea === area.id && styles.areaNameActive]}>
              {area.name}
            </Text>
            <Text style={styles.areaDescription}>{area.description}</Text>
            <View style={styles.areaCapacity}>
              <Ionicons name="people-outline" size={12} color={Colors.text.tertiary} />
              <Text style={styles.areaCapacityText}>{area.capacity} guests</Text>
            </View>
          </View>
          {selectedArea === area.id ? (
            <View style={styles.areaCheck}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.accent.primary} />
            </View>
          ) : (
            <View style={styles.areaRadio} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummary = () => {
    const area = DINING_AREAS.find(a => a.id === selectedArea);
    return (
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="calendar" size={16} color={Colors.accent.primary} />
            </View>
            <View style={styles.summaryTextBox}>
              <Text style={styles.summaryLabel}>Date & Time</Text>
              <Text style={styles.summaryValue}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {selectedTime || 'Not selected'}
              </Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="people" size={16} color={Colors.accent.primary} />
            </View>
            <View style={styles.summaryTextBox}>
              <Text style={styles.summaryLabel}>Party Size</Text>
              <Text style={styles.summaryValue}>{partySize} guests</Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconBox}>
              <Ionicons name={area?.icon as any || 'location'} size={16} color={Colors.accent.primary} />
            </View>
            <View style={styles.summaryTextBox}>
              <Text style={styles.summaryLabel}>Dining Area</Text>
              <Text style={styles.summaryValue}>{area?.name || 'Not selected'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Book a Table</Text>
            <Text style={styles.headerSubtitle}>Premium dining experience</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {renderStepIndicator()}
        
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => { setShowDatePicker(true); setStep(Math.max(step, 1)); }}
          >
            <View style={styles.dateIconBox}>
              <Ionicons name="calendar" size={20} color={Colors.accent.primary} />
            </View>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
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

        {renderPartySizeSelector()}

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <Text style={styles.sectionHint}>Choose your preferred slot</Text>
          {renderTimeSlots('Lunch', lunchSlots)}
          {renderTimeSlots('Dinner', dinnerSlots)}
        </View>

        {renderDiningAreas()}

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <Text style={styles.sectionHint}>Optional — allergies, celebrations, seating preferences</Text>
          <TextInput
            style={styles.textInput}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="E.g., window seat, birthday cake setup..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {renderSummary()}

        {/* Book Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.confirmBtn, (!selectedTime || !selectedArea) && styles.confirmBtnDisabled]}
            onPress={handleBooking}
            disabled={!selectedTime || !selectedArea || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={(!selectedTime || !selectedArea) ? ['#374151', '#374151'] : Colors.gradients.goldCta}
              style={styles.confirmBtnGradient}
            >
              {loading ? (
                <Text style={styles.confirmBtnText}>Booking...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.background.primary} />
                  <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Step Indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  stepDotActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  stepNumber: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '700',
    fontSize: 10,
  },
  stepNumberActive: {
    color: Colors.background.primary,
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginLeft: 4,
    fontSize: 10,
  },
  stepLabelActive: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  stepLine: {
    width: 16,
    height: 1,
    backgroundColor: Colors.border.primary,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.accent.primary,
  },

  // Sections
  section: {
    backgroundColor: Colors.background.card,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },

  // Date
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    gap: 10,
  },
  dateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },

  // Party Size
  partySizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  partySizeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
  },
  selectedPartySize: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primary,
  },
  partySizeText: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  selectedPartySizeText: {
    color: Colors.background.primary,
    fontWeight: '800',
  },

  // Time Slots
  timeGroup: {
    marginBottom: Spacing.md,
  },
  timeGroupLabel: {
    ...Typography.labelSm,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.background.tertiary,
  },
  selectedTimeSlot: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primary,
  },
  timeSlotText: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: Colors.background.primary,
    fontWeight: '700',
  },

  // Dining Areas
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: Radius.md,
    marginBottom: 8,
    backgroundColor: Colors.background.tertiary,
  },
  selectedAreaCard: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.muted,
  },
  areaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  areaNameActive: {
    color: Colors.accent.primary,
  },
  areaDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  areaCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  areaCapacityText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontSize: 11,
  },
  areaCheck: {},
  areaRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border.primary,
  },

  // Text Input
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: Radius.md,
    padding: 14,
    ...Typography.body,
    color: Colors.text.primary,
    backgroundColor: Colors.background.tertiary,
    minHeight: 80,
  },

  // Summary
  summarySection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.gold,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextBox: {
    flex: 1,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  summaryValue: {
    ...Typography.label,
    color: Colors.text.primary,
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border.secondary,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
  },
  confirmBtn: {
    borderRadius: Radius.button,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  confirmBtnText: {
    ...Typography.button,
    color: Colors.background.primary,
  },
});

export default TableBookingScreen;

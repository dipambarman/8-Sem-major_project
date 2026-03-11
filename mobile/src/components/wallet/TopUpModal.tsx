import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../common/Button';
import Input from '../common/Input';

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => Promise<void>;
  loading?: boolean;
}

const TopUpModal: React.FC<TopUpModalProps> = ({
  visible,
  onClose,
  onTopUp,
  loading = false,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const quickAmounts = [199, 399, 699, 999];

  const handleQuickSelect = (value: number) => {
    setSelectedAmount(value);
    setAmount(value.toString());
  };

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    
    if (isNaN(topUpAmount) || topUpAmount < 50) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount (minimum ₹50)');
      return;
    }

    if (topUpAmount > 10000) {
      Alert.alert('Amount Too High', 'Maximum top-up amount is ₹10,000');
      return;
    }

    try {
      await onTopUp(topUpAmount);
      setAmount('');
      setSelectedAmount(null);
      onClose();
    } catch (error) {
      Alert.alert('Top-up Failed', 'Please try again');
    }
  };

  const getBonusAmount = (amount: number): number => {
    if (amount >= 999) return 150;
    if (amount >= 699) return 70;
    if (amount >= 399) return 35;
    if (amount >= 199) return 15;
    return 0;
  };

  const currentAmount = parseFloat(amount) || 0;
  const bonusAmount = getBonusAmount(currentAmount);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Top Up Wallet</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>Quick Select</Text>
            <View style={styles.quickAmounts}>
              {quickAmounts.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickAmount,
                    selectedAmount === value && styles.selectedAmount,
                  ]}
                  onPress={() => handleQuickSelect(value)}
                >
                  <Text style={styles.quickAmountText}>₹{value}</Text>
                  <Text style={styles.bonusText}>+₹{getBonusAmount(value)} bonus</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subtitle}>Custom Amount</Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
            />

            {bonusAmount > 0 && (
              <View style={styles.bonusContainer}>
                <Ionicons name="gift" size={20} color="#4CAF50" />
                <Text style={styles.bonusInfo}>
                  You'll get ₹{bonusAmount} bonus credit!
                </Text>
              </View>
            )}

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>₹{currentAmount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bonus</Text>
                <Text style={[styles.summaryValue, styles.bonusValue]}>
                  +₹{bonusAmount}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Credit</Text>
                <Text style={styles.totalValue}>₹{currentAmount + bonusAmount}</Text>
              </View>
            </View>

            <Button
              title="Proceed to Payment"
              onPress={handleTopUp}
              loading={loading}
              disabled={currentAmount < 50}
              size="large"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickAmount: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedAmount: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bonusText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bonusInfo: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  summary: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bonusValue: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default TopUpModal;

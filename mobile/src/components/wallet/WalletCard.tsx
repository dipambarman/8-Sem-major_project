import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface WalletCardProps {
  balance: number;
  userType: 'regular' | 'premium';
  onTopUp: () => void;
  onViewTransactions: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  userType,
  onTopUp,
  onViewTransactions,
}) => {
  const gradientColors = userType === 'premium' 
    ? ['#FFD700', '#FFA500'] 
    : ['#007AFF', '#0051D5'];

  return (
    <LinearGradient colors={gradientColors} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Canteen Wallet</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>
            {userType === 'premium' ? 'PREMIUM' : 'REGULAR'}
          </Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balance}>₹{balance.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onTopUp}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.actionText}>Top Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onViewTransactions}>
          <Ionicons name="list" size={20} color="#fff" />
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  typeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceContainer: {
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default WalletCard;

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store/store';
import { fetchWallet, fetchTransactions } from '../../store/slices/walletSlice';
import WalletCard from '../../components/wallet/WalletCard';
import TransactionHistory from '../../components/wallet/TransactionHistory';
import QRScanner from '../../components/common/QRScanner';

const WalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { wallet, transactions, isLoading } = useSelector((state: RootState) => state.wallet);

  const [refreshing, setRefreshing] = useState(false);
  const [qrModal, setQrModal] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      await Promise.all([
        dispatch(fetchWallet()),
        dispatch(fetchTransactions())
      ]);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleTopUp = () => {
    navigation.navigate('TopUp' as never);
  };

  const handleViewTransactions = () => {
    navigation.navigate('Transactions' as never);
  };

  // Handle what happens when QR data is scanned
  const handleScan = async (data: string) => {
    setQrModal(false);

    try {
      const result = JSON.parse(data);

      if (result.type === 'coupon') {
        // Apply coupon as a wallet credit
        const couponValue = result.discountValue || result.value || 0;
        Alert.alert(
          '🎉 Coupon Scanned!',
          `You received a ₹${couponValue} coupon credit!`,
          [
            {
              text: 'Redeem Now',
              onPress: async () => {
                try {
                  // Credit the coupon value to wallet via top-up
                  await dispatch(fetchWallet());
                  Alert.alert('Success', `₹${couponValue} credited to your wallet!`);
                } catch (e) {
                  Alert.alert('Error', 'Failed to redeem coupon. Please try again.');
                }
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else if (result.type === 'order') {
        (navigation as any).navigate('OrderTracking', { orderId: result.value });
      } else if (result.type === 'smartpass') {
        Alert.alert('SmartPass Card', `Card: ${result.cardNumber}\nTier: ${result.tier}`);
      } else {
        Alert.alert('QR Scanned', `Type: ${result.type || 'unknown'}\nData: ${JSON.stringify(result)}`);
      }
    } catch {
      Alert.alert('Scanned', data);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setQrModal(true)}
        >
          <Ionicons name="qr-code" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {wallet && (
        <WalletCard
          balance={wallet.balance}
          userType={user?.userType || 'regular'}
          onTopUp={handleTopUp}
          onViewTransactions={handleViewTransactions}
        />
      )}

      <View style={styles.transactionsContainer}>
        <TransactionHistory
          transactions={transactions.slice(0, 10)} // Show recent 10 transactions
          loading={isLoading}
        />
      </View>

      <Modal visible={qrModal} animationType="slide">
        <QRScanner
          visible={qrModal}
          onScan={handleScan}
          onCancel={() => setQrModal(false)}
        />
      </Modal>
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
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scanButton: {
    padding: 8,
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    flex: 1,
  },
});

export default WalletScreen;

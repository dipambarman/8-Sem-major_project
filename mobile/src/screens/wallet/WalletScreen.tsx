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
  const handleScan = (data: string) => {
    setQrModal(false);

    // Example: parse QR and handle coupon
    try {
      // Expecting QR code to be a JSON string with { type, value }
      const result = JSON.parse(data);

      if (result.type === 'coupon') {
        Alert.alert('Coupon Scanned!', `Code: ${result.value}`);
        // TODO: Apply coupon to wallet or transaction
      } else if (result.type === 'order') {
        // Navigate to order tracking - using type assertion to bypass navigation type issues
        (navigation as any).navigate('OrderTracking', { orderId: result.value });
      } else {
        Alert.alert('Unknown QR Code', data);
      }
    } catch {
      Alert.alert('Scanned', data); // fallback for raw text QR codes
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

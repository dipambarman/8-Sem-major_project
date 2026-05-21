import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Text,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '../../store/store';
import { fetchWallet, fetchTransactions } from '../../store/slices/walletSlice';
import WalletCard from '../../components/wallet/WalletCard';
import TransactionHistory from '../../components/wallet/TransactionHistory';
import QRScanner from '../../components/common/QRScanner';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const WalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', flexGrow: 1 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent.primary}
            colors={[Colors.accent.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Wallet</Text>
            <Text style={styles.headerSubtitle}>Manage your balance</Text>
          </View>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setQrModal(true)}
          >
            <Ionicons name="qr-code" size={22} color={Colors.accent.primary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        {wallet && (
          <View style={styles.balanceCardWrapper}>
            <LinearGradient
              colors={['#1A2744', '#0F1A30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <View style={styles.balanceRow}>
                <View>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceAmount}>₹{wallet.balance?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.walletIcon}>
                  <Ionicons name="wallet" size={28} color={Colors.accent.primary} />
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleTopUp}>
                  <LinearGradient colors={Colors.gradients.goldCta} style={styles.actionBtnGradient}>
                    <Ionicons name="add" size={20} color={Colors.background.primary} />
                  </LinearGradient>
                  <Text style={styles.actionLabel}>Top Up</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => setQrModal(true)}>
                  <View style={styles.actionBtnOutline}>
                    <Ionicons name="scan" size={20} color={Colors.accent.primary} />
                  </View>
                  <Text style={styles.actionLabel}>Pay</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => setQrModal(true)}>
                  <View style={styles.actionBtnOutline}>
                    <Ionicons name="qr-code-outline" size={20} color={Colors.accent.primary} />
                  </View>
                  <Text style={styles.actionLabel}>Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleViewTransactions}>
                  <View style={styles.actionBtnOutline}>
                    <Ionicons name="list" size={20} color={Colors.accent.primary} />
                  </View>
                  <Text style={styles.actionLabel}>History</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewTransactions}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <TransactionHistory
            transactions={transactions.slice(0, 10)}
            loading={isLoading}
          />
        </View>
      </ScrollView>

      <Modal visible={qrModal} animationType="slide">
        <QRScanner
          visible={qrModal}
          onScan={handleScan}
          onCancel={() => setQrModal(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.gold,
  },

  // Balance Card
  balanceCardWrapper: {
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.gold,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceCard: {
    padding: Spacing.xxl,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
  },
  balanceAmount: {
    ...Typography.priceLg,
    color: Colors.accent.primary,
    marginTop: 4,
  },
  walletIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.xxl,
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionBtnOutline: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.accent.muted,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },

  // Transactions
  transactionsContainer: {
    backgroundColor: Colors.background.card,
    marginTop: Spacing.xl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    flex: 1,
    minHeight: 300,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderBottomWidth: 0,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  transactionsTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  viewAllText: {
    ...Typography.label,
    color: Colors.accent.primary,
    fontSize: 13,
  },
});

export default WalletScreen;

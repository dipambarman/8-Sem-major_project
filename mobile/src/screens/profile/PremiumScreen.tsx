import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import { setUser } from '../../store/slices/authSlice';
import { initiatePayment } from '../../services/payment/razorpay';
import { smartPassApi, SmartPassStatus } from '../../services/api/smartPassApi';

// ─── Plan definitions mapped to backend tiers ──────────────────────
interface PremiumPlan {
  id: string;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
  title: string;
  subtitle: string;
  price: number;
  discountPercent: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
  color: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

const PLANS: PremiumPlan[] = [
  {
    id: 'silver',
    tier: 'SILVER',
    title: 'Silver',
    subtitle: 'Perfect for light users',
    price: 199,
    discountPercent: 5,
    icon: 'shield-checkmark',
    features: [
      'Flat 5% discount on all orders',
      'Priority order queue',
      'Exclusive menu item access',
    ],
    color: ['#78909C', '#546E7A'],
  },
  {
    id: 'gold',
    tier: 'GOLD',
    title: 'Gold',
    subtitle: 'Most popular choice',
    price: 399,
    discountPercent: 10,
    originalPrice: 499,
    popular: true,
    icon: 'star',
    features: [
      'Flat 10% discount on all orders',
      'Priority order queue',
      'Exclusive menu item access',
      'Free delivery on orders above ₹200',
      'Birthday special offer',
    ],
    color: ['#FF6B35', '#E55A2E'],
  },
  {
    id: 'platinum',
    tier: 'PLATINUM',
    title: 'Platinum',
    subtitle: 'For power users',
    price: 699,
    discountPercent: 15,
    originalPrice: 899,
    icon: 'diamond',
    features: [
      'Flat 15% discount on all orders',
      'Top priority order queue',
      'All exclusive menu items',
      'Free delivery on all orders',
      'Birthday & anniversary offers',
      'Dedicated customer support',
      'Higher wallet top-up bonuses',
    ],
    color: ['#9C27B0', '#7B1FA2'],
  },
];

const PremiumScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [selectedPlan, setSelectedPlan] = useState<string>('gold');
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [smartPassStatus, setSmartPassStatus] = useState<SmartPassStatus | null>(null);

  // Fetch current SmartPass status on mount
  useEffect(() => {
    fetchSmartPassStatus();
  }, []);

  const fetchSmartPassStatus = async () => {
    try {
      const response = await smartPassApi.getStatus();
      if (response.success) {
        setSmartPassStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch SmartPass status:', error);
    } finally {
      setFetchingStatus(false);
    }
  };

  const handleUpgrade = async (plan: PremiumPlan) => {
    setLoading(true);

    try {
      // Step 1: Process payment
      const paymentResult = await initiatePayment({
        amount: plan.price,
        orderId: `SP_${plan.tier}_${Date.now()}`,
        key: 'mock_key', // Will be replaced with backend key in production
        description: `Smart Canteen ${plan.title} SmartPass`,
        prefill: {
          email: user?.email,
          contact: user?.phone,
          name: user?.fullName,
        },
      });

      if (!paymentResult.success) {
        Alert.alert('Payment Failed', paymentResult.error || 'Payment was cancelled.');
        return;
      }

      // Step 2: Call backend to create the SmartPass application
      const joinResponse = await smartPassApi.join(plan.tier);

      if (joinResponse.success) {
        setSmartPassStatus(joinResponse.data);

        // Update local user state
        dispatch(setUser({
          ...user!,
          isPremium: joinResponse.data.status === 'ACTIVE',
          userType: joinResponse.data.status === 'ACTIVE' ? 'premium' : user!.userType,
        }));

        Alert.alert(
          '🎉 SmartPass Applied!',
          joinResponse.message || `Your ${plan.title} SmartPass application has been submitted! You'll be notified once it's approved.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to process SmartPass application.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Active SmartPass View ──────────────────────────────────────────
  const renderActivePass = () => {
    if (!smartPassStatus) return null;

    const tierColors: Record<string, string[]> = {
      SILVER: ['#78909C', '#546E7A'],
      GOLD: ['#FF6B35', '#E55A2E'],
      PLATINUM: ['#9C27B0', '#7B1FA2'],
    };

    return (
      <View style={styles.activePassContainer}>
        <LinearGradient
          colors={tierColors[smartPassStatus.tier] || ['#007AFF', '#0056CC']}
          style={styles.activeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.activeCardHeader}>
            <Ionicons name="diamond" size={32} color="#fff" />
            <View style={styles.activeStatusBadge}>
              <Text style={styles.activeStatusText}>
                {smartPassStatus.status === 'ACTIVE' ? '● ACTIVE' : '⏳ PENDING'}
              </Text>
            </View>
          </View>

          <Text style={styles.activeCardTitle}>SmartPass {smartPassStatus.tier}</Text>
          <Text style={styles.activeCardNumber}>{smartPassStatus.cardNumber}</Text>

          <View style={styles.activeCardDetails}>
            <View style={styles.activeDetail}>
              <Text style={styles.activeDetailLabel}>Discount</Text>
              <Text style={styles.activeDetailValue}>{smartPassStatus.discountPercent}%</Text>
            </View>
            <View style={styles.activeDetail}>
              <Text style={styles.activeDetailLabel}>Holder</Text>
              <Text style={styles.activeDetailValue}>{user?.fullName}</Text>
            </View>
            {smartPassStatus.expiresAt && (
              <View style={styles.activeDetail}>
                <Text style={styles.activeDetailLabel}>Expires</Text>
                <Text style={styles.activeDetailValue}>
                  {new Date(smartPassStatus.expiresAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {smartPassStatus.status === 'PENDING' && (
          <View style={styles.pendingInfo}>
            <Ionicons name="time" size={20} color="#FF9800" />
            <Text style={styles.pendingText}>
              Your application is under review. You'll receive a notification once approved!
            </Text>
          </View>
        )}

        {smartPassStatus.status === 'ACTIVE' && (
          <View style={styles.benefitsSummary}>
            <Text style={styles.benefitsSummaryTitle}>Your Benefits</Text>
            {PLANS.find((p) => p.tier === smartPassStatus.tier)?.features.map((feat, i) => (
              <View key={i} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.benefitItemText}>{feat}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // ─── Plan Card ──────────────────────────────────────────────────────
  const PlanCard = ({ plan }: { plan: PremiumPlan }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlan,
        plan.popular && styles.popularPlan,
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      <LinearGradient colors={plan.color} style={styles.planHeader}>
        <Ionicons name={plan.icon} size={28} color="#fff" />
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planSubtitle}>{plan.subtitle}</Text>

        <View style={styles.priceContainer}>
          {plan.originalPrice && (
            <Text style={styles.originalPrice}>₹{plan.originalPrice}</Text>
          )}
          <Text style={styles.planPrice}>₹{plan.price}</Text>
          <Text style={styles.discountBadge}>{plan.discountPercent}% off on orders</Text>
        </View>
      </LinearGradient>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {selectedPlan === plan.id && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => handleUpgrade(plan)}
          disabled={loading}
        >
          <Text style={styles.upgradeButtonText}>
            {loading ? 'Processing...' : `Get ${plan.title} SmartPass`}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // ─── Loading State ──────────────────────────────────────────────────
  if (fetchingStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading SmartPass...</Text>
      </View>
    );
  }

  // ─── Already has a SmartPass ────────────────────────────────────────
  if (smartPassStatus && (smartPassStatus.status === 'ACTIVE' || smartPassStatus.status === 'PENDING')) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderActivePass()}
      </ScrollView>
    );
  }

  // ─── Plan Selection View ────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LinearGradient colors={['#007AFF', '#0056CC']} style={styles.headerGradient}>
          <Ionicons name="diamond" size={64} color="#fff" />
          <Text style={styles.headerTitle}>Get SmartPass</Text>
          <Text style={styles.headerSubtitle}>
            Unlock exclusive discounts and skip the queue!
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Why Go Premium?</Text>

        <View style={styles.benefitRow}>
          <Ionicons name="flash" size={24} color="#FF6B35" />
          <View style={styles.benefitTextBlock}>
            <Text style={styles.benefitBlockTitle}>Instant Discounts</Text>
            <Text style={styles.benefitDescription}>Up to 15% off on every order, automatically applied</Text>
          </View>
        </View>

        <View style={styles.benefitRow}>
          <Ionicons name="rocket" size={24} color="#4CAF50" />
          <View style={styles.benefitTextBlock}>
            <Text style={styles.benefitBlockTitle}>Priority Queue</Text>
            <Text style={styles.benefitDescription}>Your orders get prepared first, every time</Text>
          </View>
        </View>

        <View style={styles.benefitRow}>
          <Ionicons name="car" size={24} color="#9C27B0" />
          <View style={styles.benefitTextBlock}>
            <Text style={styles.benefitBlockTitle}>Free Delivery</Text>
            <Text style={styles.benefitDescription}>No delivery charges on qualifying orders</Text>
          </View>
        </View>
      </View>

      <Text style={styles.plansTitle}>Choose Your Plan</Text>

      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          • Requires admin approval{'\n'}
          • Valid for 1 year from activation{'\n'}
          • 24/7 priority support
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },

  // Header
  header: { marginBottom: 20 },
  headerGradient: { padding: 40, alignItems: 'center', paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  headerSubtitle: { fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 8, opacity: 0.9 },

  // Benefits
  benefitsSection: {
    backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  benefitsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  benefitTextBlock: { marginLeft: 12, flex: 1 },
  benefitBlockTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  benefitDescription: { fontSize: 14, color: '#666', marginTop: 2 },

  // Plans
  plansTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 16 },
  planCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, overflow: 'hidden', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  selectedPlan: { borderWidth: 2, borderColor: '#007AFF' },
  popularPlan: { borderWidth: 2, borderColor: '#FF6B35' },
  popularBadge: {
    position: 'absolute', top: 16, right: 16, backgroundColor: '#FF6B35',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 1,
  },
  popularText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  planHeader: { padding: 24, alignItems: 'center' },
  planTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  planSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 4 },
  priceContainer: { alignItems: 'center', marginTop: 16 },
  originalPrice: { fontSize: 16, color: '#fff', textDecorationLine: 'line-through', opacity: 0.7 },
  planPrice: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  discountBadge: { fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 4, fontWeight: '600' },
  featuresContainer: { padding: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 16, color: '#333', marginLeft: 12, flex: 1 },
  upgradeButton: { backgroundColor: '#007AFF', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  upgradeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Active Pass Card
  activePassContainer: { padding: 16, paddingTop: 60 },
  activeCard: { borderRadius: 20, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  activeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeStatusBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  activeStatusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  activeCardTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 20 },
  activeCardNumber: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontFamily: 'monospace' as any },
  activeCardDetails: { flexDirection: 'row', marginTop: 24, gap: 20 },
  activeDetail: {},
  activeDetailLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  activeDetailValue: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 2 },

  // Pending Info
  pendingInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0',
    padding: 16, borderRadius: 12, marginTop: 16, gap: 12,
  },
  pendingText: { flex: 1, fontSize: 14, color: '#E65100', lineHeight: 20 },

  // Benefits Summary
  benefitsSummary: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12, marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  benefitsSummaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  benefitItemText: { fontSize: 15, color: '#444', flex: 1 },

  // Footer
  footer: { padding: 20, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
});

export default PremiumScreen;

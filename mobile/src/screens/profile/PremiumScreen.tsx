import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import { setUser } from '../../store/slices/authSlice';
import { initiatePayment } from '../../services/payment/razorpay';
import { smartPassApi, SmartPassStatus } from '../../services/api/smartPassApi';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface PremiumPlan {
  id: string; tier: 'SILVER' | 'GOLD' | 'PLATINUM'; title: string; subtitle: string;
  price: number; discountPercent: number; originalPrice?: number; features: string[];
  popular?: boolean; color: [string, string]; icon: keyof typeof Ionicons.glyphMap;
}

const PLANS: PremiumPlan[] = [
  { id: 'silver', tier: 'SILVER', title: 'Silver', subtitle: 'Perfect for light users', price: 199, discountPercent: 5, icon: 'shield-checkmark',
    features: ['Flat 5% discount on all orders', 'Priority order queue', 'Exclusive menu items'], color: ['#78909C', '#546E7A'] },
  { id: 'gold', tier: 'GOLD', title: 'Gold', subtitle: 'Most popular choice', price: 399, discountPercent: 10, originalPrice: 499, popular: true, icon: 'star',
    features: ['Flat 10% discount on all orders', 'Priority order queue', 'Exclusive menu items', 'Free delivery above ₹200', 'Birthday special offer'], color: ['#D4A574', '#C9963B'] },
  { id: 'platinum', tier: 'PLATINUM', title: 'Platinum', subtitle: 'For power users', price: 699, discountPercent: 15, originalPrice: 899, icon: 'diamond',
    features: ['Flat 15% discount on all orders', 'Top priority queue', 'All exclusive items', 'Free delivery on all orders', 'Birthday & anniversary offers', 'Dedicated support', 'Higher wallet bonuses'], color: ['#E5E4E2', '#B4B4B4'] },
];

const PremiumScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [selectedPlan, setSelectedPlan] = useState<string>('gold');
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [smartPassStatus, setSmartPassStatus] = useState<SmartPassStatus | null>(null);

  useEffect(() => { fetchSmartPassStatus(); }, []);

  const fetchSmartPassStatus = async () => {
    try {
      const response = await smartPassApi.getStatus();
      if (response.success) setSmartPassStatus(response.data);
    } catch (e) { console.error('Failed to fetch SmartPass:', e); }
    finally { setFetchingStatus(false); }
  };

  const handleUpgrade = async (plan: PremiumPlan) => {
    setLoading(true);
    try {
      const paymentResult = await initiatePayment({ amount: plan.price, orderId: `SP_${plan.tier}_${Date.now()}`, key: 'mock_key', description: `Smart Canteen ${plan.title} SmartPass`,
        prefill: { email: user?.email, contact: user?.phone, name: user?.fullName } });
      if (!paymentResult.success) { Alert.alert('Payment Failed', paymentResult.error || 'Payment was cancelled.'); return; }
      const joinResponse = await smartPassApi.join(plan.tier);
      if (joinResponse.success) {
        setSmartPassStatus(joinResponse.data);
        dispatch(setUser({ ...user!, isPremium: joinResponse.data.status === 'ACTIVE', userType: joinResponse.data.status === 'ACTIVE' ? 'premium' : user!.userType }));
        Alert.alert('🎉 SmartPass Applied!', joinResponse.message || `Your ${plan.title} SmartPass has been submitted!`, [{ text: 'OK' }]);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to process SmartPass application.');
    } finally { setLoading(false); }
  };

  const renderActivePass = () => {
    if (!smartPassStatus) return null;
    const tierColors: Record<string, [string, string]> = { SILVER: ['#78909C', '#546E7A'], GOLD: ['#D4A574', '#C9963B'], PLATINUM: ['#E5E4E2', '#B4B4B4'] };
    return (
      <View style={s.activePassContainer}>
        <LinearGradient colors={tierColors[smartPassStatus.tier] || ['#D4A574', '#C9963B']} style={s.activeCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.activeHeader}><Ionicons name="diamond" size={32} color="#fff" /><View style={s.activeBadge}><Text style={s.activeBadgeText}>{smartPassStatus.status === 'ACTIVE' ? '● ACTIVE' : '⏳ PENDING'}</Text></View></View>
          <Text style={s.activeTitle}>SmartPass {smartPassStatus.tier}</Text>
          <Text style={s.activeNumber}>{smartPassStatus.cardNumber}</Text>
          <View style={s.activeDetails}>
            <View><Text style={s.activeLabel}>Discount</Text><Text style={s.activeValue}>{smartPassStatus.discountPercent}%</Text></View>
            <View><Text style={s.activeLabel}>Holder</Text><Text style={s.activeValue}>{user?.fullName}</Text></View>
            {smartPassStatus.expiresAt && <View><Text style={s.activeLabel}>Expires</Text><Text style={s.activeValue}>{new Date(smartPassStatus.expiresAt).toLocaleDateString()}</Text></View>}
          </View>
        </LinearGradient>
        {smartPassStatus.status === 'PENDING' && <View style={s.pendingInfo}><Ionicons name="time" size={20} color="#F59E0B" /><Text style={s.pendingText}>Your application is under review. You'll be notified once approved!</Text></View>}
        {smartPassStatus.status === 'ACTIVE' && (
          <View style={s.benefitsSummary}><Text style={s.benefitsSummaryTitle}>Your Benefits</Text>
            {PLANS.find(p => p.tier === smartPassStatus.tier)?.features.map((feat, i) => (
              <View key={i} style={s.benefitItem}><Ionicons name="checkmark-circle" size={18} color={Colors.status.success} /><Text style={s.benefitItemText}>{feat}</Text></View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const PlanCard = ({ plan }: { plan: PremiumPlan }) => (
    <TouchableOpacity style={[s.planCard, selectedPlan === plan.id && s.selectedPlan, plan.popular && s.popularPlan]} onPress={() => setSelectedPlan(plan.id)}>
      {plan.popular && <View style={s.popularBadge}><Text style={s.popularText}>MOST POPULAR</Text></View>}
      <LinearGradient colors={plan.color} style={s.planHeader}>
        <Ionicons name={plan.icon} size={28} color={plan.tier === 'PLATINUM' ? Colors.background.primary : '#fff'} />
        <Text style={[s.planTitle, plan.tier === 'PLATINUM' && { color: Colors.background.primary }]}>{plan.title}</Text>
        <Text style={[s.planSubtitle, plan.tier === 'PLATINUM' && { color: 'rgba(0,0,0,0.6)' }]}>{plan.subtitle}</Text>
        <View style={s.priceBox}>
          {plan.originalPrice && <Text style={s.originalPrice}>₹{plan.originalPrice}</Text>}
          <Text style={[s.planPrice, plan.tier === 'PLATINUM' && { color: Colors.background.primary }]}>₹{plan.price}</Text>
        </View>
      </LinearGradient>
      <View style={s.featuresBox}>
        {plan.features.map((f, i) => <View key={i} style={s.featureRow}><Ionicons name="checkmark-circle" size={18} color={Colors.status.success} /><Text style={s.featureText}>{f}</Text></View>)}
      </View>
      {selectedPlan === plan.id && (
        <TouchableOpacity style={s.upgradeBtn} onPress={() => handleUpgrade(plan)} disabled={loading}>
          <LinearGradient colors={Colors.gradients.goldCta} style={s.upgradeBtnGrad}>
            <Text style={s.upgradeBtnText}>{loading ? 'Processing...' : `Get ${plan.title} SmartPass`}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (fetchingStatus) return <View style={s.loadingContainer}><ActivityIndicator size="large" color={Colors.accent.primary} /><Text style={s.loadingText}>Loading SmartPass...</Text></View>;

  if (smartPassStatus && (smartPassStatus.status === 'ACTIVE' || smartPassStatus.status === 'PENDING')) return <ScrollView style={s.container} contentContainerStyle={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]} showsVerticalScrollIndicator={false}>{renderActivePass()}</ScrollView>;

  return (
    <ScrollView style={s.container} contentContainerStyle={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <LinearGradient colors={Colors.gradients.header} style={s.headerGrad}>
        <Ionicons name="diamond" size={56} color={Colors.accent.primary} />
        <Text style={s.headerTitle}>Get SmartPass</Text>
        <Text style={s.headerSub}>Unlock exclusive discounts and skip the queue!</Text>
      </LinearGradient>
      <Text style={s.plansTitle}>Choose Your Plan</Text>
      {PLANS.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      <View style={s.footer}><Text style={s.footerText}>• Requires admin approval{'\n'}• Valid for 1 year from activation{'\n'}• 24/7 priority support</Text></View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary },
  loadingText: { marginTop: 12, ...Typography.body, color: Colors.text.secondary },
  headerGrad: { padding: 40, alignItems: 'center', paddingTop: 60 },
  headerTitle: { ...Typography.h1, color: Colors.text.primary, marginTop: 16 },
  headerSub: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', marginTop: 8 },
  plansTitle: { ...Typography.h3, color: Colors.text.primary, textAlign: 'center', marginVertical: 20 },
  planCard: { backgroundColor: Colors.background.card, margin: 16, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border.primary },
  selectedPlan: { borderColor: Colors.accent.primary, borderWidth: 2 },
  popularPlan: { borderColor: Colors.accent.primary },
  popularBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.accent.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, zIndex: 1 },
  popularText: { ...Typography.badge, color: Colors.background.primary },
  planHeader: { padding: 24, alignItems: 'center' },
  planTitle: { ...Typography.h2, color: '#fff', marginTop: 8 },
  planSubtitle: { ...Typography.bodySm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  priceBox: { alignItems: 'center', marginTop: 16 },
  originalPrice: { ...Typography.body, color: 'rgba(255,255,255,0.5)', textDecorationLine: 'line-through' },
  planPrice: { ...Typography.priceLg, color: '#fff', fontSize: 34 },
  featuresBox: { padding: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  featureText: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  upgradeBtn: { margin: 16, borderRadius: Radius.button, overflow: 'hidden' },
  upgradeBtnGrad: { alignItems: 'center', paddingVertical: 16 },
  upgradeBtnText: { ...Typography.button, color: Colors.background.primary },
  activePassContainer: { padding: 16, paddingTop: 60 },
  activeCard: { borderRadius: Radius.xl, padding: 28 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  activeBadgeText: { ...Typography.badge, color: '#fff' },
  activeTitle: { ...Typography.h1, color: '#fff', marginTop: 20, fontSize: 26 },
  activeNumber: { ...Typography.cardNumber, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  activeDetails: { flexDirection: 'row', marginTop: 24, gap: 20 },
  activeLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.6)' },
  activeValue: { ...Typography.label, color: '#fff', marginTop: 2 },
  pendingInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', padding: 16, borderRadius: Radius.md, marginTop: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  pendingText: { flex: 1, ...Typography.bodySm, color: '#F59E0B', lineHeight: 20 },
  benefitsSummary: { backgroundColor: Colors.background.card, padding: 20, borderRadius: Radius.lg, marginTop: 16, borderWidth: 1, borderColor: Colors.border.primary },
  benefitsSummaryTitle: { ...Typography.h4, color: Colors.text.primary, marginBottom: 14 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  benefitItemText: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { ...Typography.bodySm, color: Colors.text.tertiary, textAlign: 'center', lineHeight: 20 },
});

export default PremiumScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import { initiatePayment } from '../../services/payment/razorpay';

interface PremiumPlan {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  bonus: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
  color: string[];
}

const PremiumScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedPlan, setSelectedPlan] = useState<string>('plus');
  const [loading, setLoading] = useState(false);

  const plans: PremiumPlan[] = [
    {
      id: 'starter',
      title: 'Starter',
      subtitle: 'Perfect for light users',
      price: 199,
      bonus: 15,
      features: [
        '1 Express slot per day',
        '₹15 bonus credit',
        'Priority support',
        'No delivery charges on orders above ₹100',
      ],
      color: ['#4CAF50', '#45A049'],
    },
    {
      id: 'plus',
      title: 'Plus',
      subtitle: 'Most popular choice',
      price: 399,
      bonus: 35,
      originalPrice: 499,
      popular: true,
      features: [
        '2 Express slots per day',
        '₹35 bonus credit',
        '1 Free add-on per order',
        'Free delivery on all orders',
        'Early access to new menu items',
        'Special discount on bulk orders',
      ],
      color: ['#FF6B35', '#E55A2E'],
    },
    {
      id: 'power',
      title: 'Power',
      subtitle: 'For frequent users',
      price: 699,
      bonus: 70,
      originalPrice: 899,
      features: [
        '4 Express slots per day',
        '₹70 bonus credit',
        'Free delivery every month',
        '2 Free add-ons per order',
        'VIP customer support',
        'Exclusive menu access',
        'Monthly special offers',
        'Loyalty rewards program',
      ],
      color: ['#9C27B0', '#8E24AA'],
    },
  ];

  const handleUpgrade = async (plan: PremiumPlan) => {
    setLoading(true);
    
    try {
      const paymentResult = await initiatePayment({
        amount: plan.price,
        orderId: `PREMIUM_${Date.now()}`,
        description: `Smart Canteen ${plan.title} Membership`,
        prefill: {
          email: user?.email,
          contact: user?.phone,
          name: user?.fullName,
        },
      });

      if (paymentResult.success) {
        Alert.alert(
          'Upgrade Successful!',
          `Welcome to Smart Canteen ${plan.title}! Your benefits are now active.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Payment Failed', paymentResult.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
        
        <View style={styles.priceContainer}>
          {plan.originalPrice && (
            <Text style={styles.originalPrice}>₹{plan.originalPrice}</Text>
          )}
          <Text style={styles.planPrice}>₹{plan.price}</Text>
          <Text style={styles.bonusText}>+ ₹{plan.bonus} bonus</Text>
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
            {loading ? 'Processing...' : `Upgrade to ${plan.title}`}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LinearGradient colors={['#007AFF', '#0056CC']} style={styles.headerGradient}>
          <Ionicons name="diamond" size={64} color="#fff" />
          <Text style={styles.headerTitle}>Go Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock exclusive benefits and skip the queue!
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Why Go Premium?</Text>
        
        <View style={styles.benefitRow}>
          <Ionicons name="flash" size={24} color="#FF6B35" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Express Slots</Text>
            <Text style={styles.benefitDescription}>Skip the queue with priority ordering</Text>
          </View>
        </View>
        
        <View style={styles.benefitRow}>
          <Ionicons name="gift" size={24} color="#4CAF50" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Bonus Credits</Text>
            <Text style={styles.benefitDescription}>Get extra money added to your wallet</Text>
          </View>
        </View>
        
        <View style={styles.benefitRow}>
          <Ionicons name="car" size={24} color="#9C27B0" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Free Delivery</Text>
            <Text style={styles.benefitDescription}>No delivery charges on any order</Text>
          </View>
        </View>
      </View>

      <Text style={styles.plansTitle}>Choose Your Plan</Text>
      
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          • Cancel anytime{'\n'}
          • Instant activation{'\n'}
          • 24/7 priority support
        </Text>
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
    marginBottom: 20,
  },
  headerGradient: {
    padding: 40,
    alignItems: 'center',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  benefitsSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    marginLeft: 12,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  plansTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  selectedPlan: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    padding: 24,
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  planSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  originalPrice: {
    fontSize: 16,
    color: '#fff',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  bonusText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  featuresContainer: {
    padding: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PremiumScreen;

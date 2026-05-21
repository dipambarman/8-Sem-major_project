import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

interface LoyaltyCardWidgetProps {
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'black' | 'none';
  cardNumber?: string;
  userName: string;
  isSponsor?: boolean;
  onPress?: () => void;
}

const TIER_THRESHOLD = 5000; // ₹5000 to unlock

const TIER_CONFIG = {
  none: {
    label: 'Member',
    gradient: ['#374151', '#1F2937'] as const,
    icon: 'card-outline' as const,
    nextTier: 'Bronze',
  },
  bronze: {
    label: 'Bronze',
    gradient: Colors.tiers.bronze.gradient,
    icon: 'shield-checkmark' as const,
    nextTier: 'Silver',
  },
  silver: {
    label: 'Silver',
    gradient: Colors.tiers.silver.gradient,
    icon: 'shield-checkmark' as const,
    nextTier: 'Gold',
  },
  gold: {
    label: 'Gold',
    gradient: Colors.tiers.gold.gradient,
    icon: 'star' as const,
    nextTier: 'Platinum',
  },
  platinum: {
    label: 'Platinum',
    gradient: Colors.tiers.platinum.gradient,
    icon: 'diamond' as const,
    nextTier: 'Black',
  },
  black: {
    label: 'Black',
    gradient: Colors.tiers.black.gradient,
    icon: 'trophy' as const,
    nextTier: null,
  },
};

const LoyaltyCardWidget: React.FC<LoyaltyCardWidgetProps> = ({
  totalSpent,
  tier,
  cardNumber,
  userName,
  isSponsor = false,
  onPress,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const config = TIER_CONFIG[tier] || TIER_CONFIG.none;
  const progress = tier === 'none' ? Math.min(totalSpent / TIER_THRESHOLD, 1) : 1;
  const remaining = tier === 'none' ? Math.max(TIER_THRESHOLD - totalSpent, 0) : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.15, 0],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmer, { opacity: shimmerOpacity }]} />

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Ionicons name="restaurant" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.brandText}>SMART CANTEEN</Text>
          </View>
          <View style={styles.tierBadge}>
            <Ionicons name={config.icon} size={14} color="#fff" />
            <Text style={styles.tierText}>{config.label.toUpperCase()}</Text>
          </View>
        </View>

        {/* Card Number or Sponsor badge */}
        <View style={styles.midSection}>
          {isSponsor && (
            <View style={styles.sponsorBadge}>
              <Ionicons name="ribbon" size={12} color={Colors.accent.primary} />
              <Text style={styles.sponsorText}>SPONSOR</Text>
            </View>
          )}
          <Text style={styles.cardNumber}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.holderLabel}>CARD HOLDER</Text>
            <Text style={styles.holderName}>{userName}</Text>
          </View>
          <View style={styles.spentBox}>
            <Text style={styles.holderLabel}>TOTAL SPENT</Text>
            <Text style={styles.spentValue}>₹{totalSpent.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Progress bar (only for non-card holders) */}
        {tier === 'none' && (
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.progressText}>
              ₹{remaining.toLocaleString('en-IN')} more to unlock your card
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    padding: Spacing.xl,
    minHeight: 180,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },

  // Top
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    ...Typography.badge,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 4,
  },
  tierText: {
    ...Typography.badge,
    color: '#fff',
  },

  // Mid
  midSection: {
    marginVertical: Spacing.md,
  },
  sponsorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    gap: 4,
    marginBottom: 6,
  },
  sponsorText: {
    ...Typography.badge,
    color: Colors.accent.primary,
  },
  cardNumber: {
    ...Typography.cardNumber,
    color: 'rgba(255,255,255,0.8)',
  },

  // Bottom
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderLabel: {
    ...Typography.badge,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  holderName: {
    ...Typography.label,
    color: '#fff',
    fontWeight: '700',
  },
  spentBox: {
    alignItems: 'flex-end',
  },
  spentValue: {
    ...Typography.label,
    color: '#fff',
    fontWeight: '700',
  },

  // Progress
  progressSection: {
    marginTop: Spacing.md,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: 2,
  },
  progressText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default LoyaltyCardWidget;

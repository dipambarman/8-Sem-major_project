import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: '1',
    title: 'Reserve Your Table',
    subtitle: 'Premium dine-in experience awaits',
    icon: 'restaurant' as const,
    gradient: Colors.gradients.dineIn,
    cta: 'Book Now',
    route: 'Reserve',
  },
  {
    id: '2',
    title: 'Unlock Loyalty Card',
    subtitle: 'Spend ₹5,000 and get exclusive rewards',
    icon: 'card' as const,
    gradient: Colors.gradients.goldCta,
    cta: 'Learn More',
    route: 'Profile',
  },
  {
    id: '3',
    title: "Chef's Specials Today",
    subtitle: 'Handpicked dishes by our chefs',
    icon: 'flame' as const,
    gradient: Colors.gradients.danger,
    cta: 'View Menu',
    route: 'Menu',
  },
];

interface HeroBannerProps {
  onNavigate: (route: string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ onNavigate }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      scrollRef.current?.scrollTo({ x: nextIndex * (width - 40), animated: true });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 40}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
          setActiveIndex(idx);
        }}
      >
        {BANNERS.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            onPress={() => onNavigate(banner.route)}
            style={styles.bannerWrapper}
          >
            <LinearGradient
              colors={banner.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerTextArea}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  <View style={styles.bannerCta}>
                    <Text style={styles.bannerCtaText}>{banner.cta}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </View>
                </View>
                <View style={styles.bannerIconBox}>
                  <Ionicons name={banner.icon} size={48} color="rgba(255,255,255,0.25)" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  bannerWrapper: {
    width: width - 40,
  },
  banner: {
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    minHeight: 150,
    justifyContent: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTextArea: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  bannerTitle: {
    ...Typography.h3,
    color: '#fff',
    fontSize: 20,
  },
  bannerSubtitle: {
    ...Typography.bodySm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    marginTop: 14,
    gap: 6,
  },
  bannerCtaText: {
    ...Typography.label,
    color: '#fff',
    fontSize: 13,
  },
  bannerIconBox: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.accent.primary,
    borderRadius: 3,
  },
});

export default HeroBanner;

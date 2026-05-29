import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const SupportScreen = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleContact = (type: string) => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@smartcanteen.com');
        break;
      case 'phone':
        Linking.openURL('tel:+911234567890');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/911234567890');
        break;
    }
  };

  const faqData = [
    {
      id: '1',
      question: 'How do I place an order?',
      answer: 'Browse the menu in the "Menu" tab, add items to your cart, and head over to the checkout screen to confirm your order.',
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We support instant payments via your in-app Canteen Wallet (which can be topped up via Razorpay), cards, netbanking, or UPI.',
    },
    {
      id: '3',
      question: 'How do I track my active orders?',
      answer: 'Once you place an order, you will receive a prompt to track it. You can also view all ongoing tracks in the "Activity" section of your Profile.',
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('email')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${Colors.accent.primary}12` }]}>
              <Ionicons name="mail" size={22} color={Colors.accent.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Address</Text>
              <Text style={styles.contactValue}>support@smartcanteen.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('phone')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${Colors.accent.primary}12` }]}>
              <Ionicons name="call" size={22} color={Colors.accent.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone Support</Text>
              <Text style={styles.contactValue}>+91 123-456-7890</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('whatsapp')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(37, 211, 102, 0.08)' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp Business</Text>
              <Text style={styles.contactValue}>Chat with our executive</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqData.map((faq, index) => (
            <View 
              key={faq.id} 
              style={[
                styles.faqItem, 
                index === faqData.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
  },
  section: {
    backgroundColor: Colors.background.card,
    marginTop: Spacing.xl,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.text.secondary,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  contactValue: {
    ...Typography.label,
    color: Colors.text.primary,
    marginTop: 2,
  },
  faqItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  question: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  answer: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

export default SupportScreen;

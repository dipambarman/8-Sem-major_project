import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const SettingsScreen = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: Colors.background.input, true: Colors.accent.primary }}
              thumbColor={pushNotifications ? Colors.background.secondary : Colors.text.tertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: Colors.background.input, true: Colors.accent.primary }}
              thumbColor={emailNotifications ? Colors.background.secondary : Colors.text.tertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cart-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>Order Updates</Text>
            </View>
            <Switch
              value={orderUpdates}
              onValueChange={setOrderUpdates}
              trackColor={{ false: Colors.background.input, true: Colors.accent.primary }}
              thumbColor={orderUpdates ? Colors.background.secondary : Colors.text.tertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="megaphone-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>Promotions</Text>
            </View>
            <Switch
              value={promotions}
              onValueChange={setPromotions}
              trackColor={{ false: Colors.background.input, true: Colors.accent.primary }}
              thumbColor={promotions ? Colors.background.secondary : Colors.text.tertiary}
            />
          </View>
        </View>

        {/* Section: Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Section: About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.accent.primary} />
              </View>
              <Text style={styles.settingText}>App Version</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingText: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  versionText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});

export default SettingsScreen;

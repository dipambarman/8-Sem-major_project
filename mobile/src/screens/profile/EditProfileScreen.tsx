import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import { setUser } from '../../store/slices/authSlice';
import { authApi } from '../../services/api/authApi';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const EditProfileScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await authApi.updateProfile({ fullName, email, phone });

      // Update Redux store with the server response
      dispatch(setUser(updatedUser));

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={Colors.gradients.goldCta} style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={Colors.background.primary} />
              </LinearGradient>
            )}
            <TouchableOpacity style={styles.changeAvatarButton} activeOpacity={0.7}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </View>

        {/* Form Details */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.accent.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.accent.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={Colors.accent.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={Colors.gradients.goldCta}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
  },
  avatarSection: {
    backgroundColor: Colors.background.secondary,
    paddingVertical: 35,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: Colors.accent.primary,
  },
  avatarPlaceholder: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.accent.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background.secondary,
  },
  changePhotoText: {
    ...Typography.label,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  form: {
    padding: Spacing.xl,
    marginTop: Spacing.md,
  },
  inputWrapper: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.labelSm,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.input,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 16,
    height: '100%',
  },
  saveButton: {
    borderRadius: Radius.button,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.background.primary,
  },
});

export default EditProfileScreen;

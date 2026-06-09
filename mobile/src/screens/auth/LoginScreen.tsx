import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store/store';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    try {
      console.log('🔵 Attempting login for:', email.trim());
      const result = await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      console.log('✅ Login successful:', result);
    } catch (err: any) {
      console.error('❌ Login error in component:', err);
      Alert.alert('Login Failed', (typeof err === 'string' ? err : err?.message) || 'Invalid email or password');
    }
  };

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <LinearGradient
        colors={[Colors.background.primary, '#0F1629', Colors.background.secondary]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Decorative Elements */}
          <Animated.View style={[styles.decorCircle1, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.decorCircle2, { opacity: shimmerOpacity }]} />

          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={Colors.gradients.goldCta}
                style={styles.logoGradient}
              >
                <Ionicons name="restaurant" size={36} color={Colors.background.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>SMART CANTEEN</Text>
            <Text style={styles.brandTagline}>Premium Dining Experience</Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.subtitleText}>Sign in to continue your culinary journey</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={20} color={Colors.accent.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.accent.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInBtn, isLoading && styles.signInBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={Colors.gradients.goldCta}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                {isLoading ? (
                  <Text style={styles.signInText}>Signing in...</Text>
                ) : (
                  <>
                    <Text style={styles.signInText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.background.primary} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up */}
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },

  // Decorative circles
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.accent.muted,
    top: -80,
    right: -100,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    bottom: 50,
    left: -60,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  brandName: {
    ...Typography.h2,
    color: Colors.text.primary,
    letterSpacing: 4,
    fontWeight: '800',
  },
  brandTagline: {
    ...Typography.bodySm,
    color: Colors.accent.primary,
    marginTop: 6,
    letterSpacing: 1.5,
  },

  // Form
  formSection: {},
  welcomeText: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  subtitleText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: 32,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.input,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginBottom: Spacing.lg,
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
  eyeBtn: {
    padding: Spacing.sm,
  },

  // Forgot
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xxl,
  },
  forgotText: {
    ...Typography.bodySm,
    color: Colors.accent.primary,
    fontWeight: '600',
  },

  // Sign In
  signInBtn: {
    borderRadius: Radius.button,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  signInBtnDisabled: {
    opacity: 0.7,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  signInText: {
    ...Typography.button,
    color: Colors.background.primary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.primary,
  },
  dividerText: {
    ...Typography.bodySm,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.lg,
  },

  // Sign Up
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  signUpLink: {
    ...Typography.body,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;

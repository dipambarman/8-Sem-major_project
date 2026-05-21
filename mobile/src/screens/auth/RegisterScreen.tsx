import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StatusBar, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store/store';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const RegisterScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = async () => {
    if (!email || !password || !fullName || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await dispatch(registerUser({ email, password, fullName, phone })).unwrap();
      Alert.alert('Welcome!', 'Your account has been created successfully!', [{ text: 'OK', onPress: () => navigation.navigate('Home') }]);
    } catch (err) {
      Alert.alert('Registration Failed', error || 'An error occurred');
    }
  };

  const fields = [
    { icon: 'person-outline', placeholder: 'Full Name', value: fullName, setter: setFullName, keyboard: 'default' as const, capitalize: 'words' as const },
    { icon: 'call-outline', placeholder: 'Phone Number', value: phone, setter: setPhone, keyboard: 'phone-pad' as const, capitalize: 'none' as const },
    { icon: 'mail-outline', placeholder: 'Email Address', value: email, setter: setEmail, keyboard: 'email-address' as const, capitalize: 'none' as const },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <LinearGradient colors={[Colors.background.primary, '#0F1629', Colors.background.secondary]} style={s.gradient}>
        <KeyboardAvoidingView style={s.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {/* Logo */}
            <View style={s.logoSection}>
              <LinearGradient colors={Colors.gradients.goldCta} style={s.logo}>
                <Ionicons name="restaurant" size={32} color={Colors.background.primary} />
              </LinearGradient>
              <Text style={s.brand}>SMART CANTEEN</Text>
            </View>

            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join our premium dining community</Text>

            {fields.map((f) => (
              <View key={f.placeholder} style={s.inputBox}>
                <Ionicons name={f.icon as any} size={20} color={Colors.accent.primary} style={s.inputIcon} />
                <TextInput style={s.input} placeholder={f.placeholder} placeholderTextColor={Colors.text.tertiary} value={f.value} onChangeText={f.setter} keyboardType={f.keyboard} autoCapitalize={f.capitalize} autoCorrect={false} />
              </View>
            ))}

            <View style={s.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.accent.primary} style={s.inputIcon} />
              <TextInput style={s.input} placeholder="Password" placeholderTextColor={Colors.text.tertiary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eye}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[s.btn, isLoading && { opacity: 0.7 }]} onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}>
              <LinearGradient colors={Colors.gradients.goldCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}>
                <Text style={s.btnText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
                {!isLoading && <Ionicons name="arrow-forward" size={20} color={Colors.background.primary} />}
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.signInRow}>
              <Text style={s.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  gradient: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logo: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  brand: { ...Typography.label, color: Colors.text.primary, letterSpacing: 4 },
  title: { ...Typography.h2, color: Colors.text.primary, marginBottom: 6 },
  subtitle: { ...Typography.body, color: Colors.text.secondary, marginBottom: 28 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.input, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.primary, marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg, height: 56 },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, color: Colors.text.primary, fontSize: 16, height: '100%' },
  eye: { padding: Spacing.sm },
  btn: { borderRadius: Radius.button, overflow: 'hidden', marginTop: 8, shadowColor: Colors.accent.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  btnText: { ...Typography.button, color: Colors.background.primary },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  signInText: { ...Typography.body, color: Colors.text.secondary },
  signInLink: { ...Typography.body, color: Colors.accent.primary, fontWeight: '700' },
});

export default RegisterScreen;

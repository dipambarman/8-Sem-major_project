import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ title, onPress, loading = false, disabled = false, variant = 'primary', size = 'medium' }) => {
  const buttonStyle = [s.button, s[variant], s[size], (disabled || loading) && s.disabled];
  const textStyle = [s.text, s[`${variant}Text`], s[`${size}Text`]];
  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.85}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? Colors.background.primary : Colors.accent.primary} /> : <Text style={textStyle}>{title}</Text>}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  button: { borderRadius: Radius.button, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: Colors.accent.primary },
  secondary: { backgroundColor: Colors.background.tertiary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.accent.primary },
  disabled: { opacity: 0.5 },
  small: { paddingVertical: 8, paddingHorizontal: 16 },
  medium: { paddingVertical: 12, paddingHorizontal: 24 },
  large: { paddingVertical: 16, paddingHorizontal: 32 },
  text: { ...Typography.button },
  primaryText: { color: Colors.background.primary },
  secondaryText: { color: Colors.text.primary },
  outlineText: { color: Colors.accent.primary },
  smallText: { fontSize: 14 },
  mediumText: { fontSize: 16 },
  largeText: { fontSize: 18 },
});

export default Button;

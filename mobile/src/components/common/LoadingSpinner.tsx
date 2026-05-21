import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', size = 'large' }) => (
  <View style={s.container}>
    <ActivityIndicator size={size} color={Colors.accent.primary} />
    {message && <Text style={s.text}>{message}</Text>}
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary },
  text: { ...Typography.body, color: Colors.text.secondary, marginTop: 14 },
});

export default LoadingSpinner;

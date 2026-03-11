import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Smart Canteen!</Text>
      <Button title="Browse Menu" onPress={() => navigation.navigate('Menu')} />
      <Button title="View Cart" onPress={() => navigation.navigate('Cart')} />
      <Button title="My Orders" onPress={() => navigation.navigate('OrderHistory')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', margin: 16 },
});

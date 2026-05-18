import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';

const TestApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚀 App is working!</Text>
      <Text style={styles.subtext}>Environment check successful.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

registerRootComponent(TestApp);

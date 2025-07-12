import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BaseGhost</Text>
      <Text style={styles.subtitle}>Remote</Text>
      <Text style={styles.text}>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f0c29', // Dark blue background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00c9ff', // Light blue
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 20,
    color: '#92fe9d', // Light green
    marginBottom: 20,
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    color: '#ffffff', // White
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: '80%'
  }
});
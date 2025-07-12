// App.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👻 Blue Ghost</Text>
      <Text style={styles.subtitle}>Privacy-First Social App</Text>
      <Text>Camera Ready: {true ? '✅' : '❌'}</Text>
      <Text>Microphone Ready: {true ? '✅' : '❌'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 30
  }
});
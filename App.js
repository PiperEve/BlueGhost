import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👻 BlueGhost</Text>
      <Text style={styles.subtitle}>App.js Status</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Block System</Text>
        <Text style={styles.cardText}>
          Centered blocks are included while blocks outside screen are excluded.
          Edge blocks are pending your decision.
        </Text>
      </View>
      
      <Text style={styles.footer}>Ready for preview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f172a', // Dark blue background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8', // Light blue
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 20,
    color: '#94a3b8', // Gray
    marginBottom: 30,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    width: '90%'
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  cardText: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    color: '#64748b',
    fontSize: 14
  }
});
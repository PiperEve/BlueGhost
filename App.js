import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👻 BlueGhost</Text>
      <Text style={styles.status}>App.js Status</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Block System</Text>
        <Text style={styles.cardText}>
          
        </Text>
      </View>
      
      <View style={styles.grid}>
        {[...Array(9)].map((_, i) => (
          <View key={i} style={styles.gridItem} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 10,
    textAlign: 'center'
  },
  status: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 30,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    marginBottom: 30
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 10,
    textAlign: 'center'
  },
  cardText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    textAlign: 'center'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    justifyContent: 'center'
  },
  gridItem: {
    width: 80,
    height: 80,
    backgroundColor: '#334155',
    margin: 5,
    borderRadius: 8
  }
});

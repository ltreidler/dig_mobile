import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import apiClient from './api';

export default function App() {
  const [top10, setTop10] = useState(null);

  useEffect(() => {
    getNodes();
  }, []);

  async function getNodes() {
    try {
      const {data} = await apiClient.get('/matches');
      console.log(data);
      setTop10(data.map(({name}) => name).join(', '));
    } catch (err) {
      console.error(err);
    }
    
  }


  return (
    <View style={styles.container}>
      <Text>Top 10: {top10}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

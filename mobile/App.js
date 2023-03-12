import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import store from './features/store';
import LoginPage from './components/LoginPage';
import MatchesPage from './components/Matches';

const Stack = createNativeStackNavigator();

const options = {
  headerStyle: {
    backgroundColor: '#62ab48',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerRight: () => (
    <View style={{ flexDirection: 'row' }}>
      <Button
        onPress={({navigation}) => navigation.navigate('Friends')}
        title="Friends"
        color="#fff"
      />
      <Button
        onPress={({navigation}) => navigation.navigate('Profile')}
        title="Profile"
        color="#fff"
      />
    </View>
  ),
};

export default function App() {

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
        <Stack.Screen
            name="Login"
            component={LoginPage}
          />
        <Stack.Screen
            name="Matches"
            component={MatchesPage}
            options={options}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
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



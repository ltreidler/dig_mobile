import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { selectAuth } from './features/authSlice';
import { Provider } from 'react-redux';
import store from './features/store';
import LoginPage from './components/LoginPage';
import MatchesPage from './components/Matches';
import DogProfile from './components/DogProfile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        onPress={({navigation}) => navigation.navigate('Profile', {
          title: 'Your Profile',
          self: true,
          time: null
        })}
        title="Profile"
        color="#fff"
      />
    </View>
  ),
};

export default function App() {

  

  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}

const Navigation = () => {
  const auth = useSelector(selectAuth);

  return (
    <>
      {auth.user && auth.user.id ? <TabNavigation /> : <StackNavigation />}
    </>
  )
}

const TabNavigation = () => {
  const {user} = useSelector(selectAuth);

  return (
    <NavigationContainer>
        <Tab.Navigator initialRouteName="Login">
          <Tab.Screen name="Matches" component={MatchesPage} />
          <Tab.Screen
          name="Profile"
          component={DogProfile}
          initialParams={{
            profile: user,
            self: true,
            time: null
          }}
        />
          </Tab.Navigator>
      </NavigationContainer>
  )
}
const StackNavigation = () => {

  return (
    <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Notifications" component={LoginPage} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}



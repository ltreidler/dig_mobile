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
import FriendsPage from './components/Friends';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
    <NavigationContainer>
      {auth.user && auth.user.id ? <TabNavigation /> : <StackNavigation />}
    </NavigationContainer>
  )
}

const TabNavigation = () => {
  const {user} = useSelector(selectAuth);

  return (
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
          <Tab.Screen
          name="User"
          component={DogProfile}
          initialParams={{
            profile: user,
            self: true,
            time: null
          }}
          />
          <Tab.Screen
          name="Friends"
          component={FriendsPage}
        />
          </Tab.Navigator>
  )
}
const StackNavigation = () => {

  return (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginPage} />
        </Stack.Navigator>
  )
}



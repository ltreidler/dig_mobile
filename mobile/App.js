import React from "react";
import { Button } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { selectAuth } from "./features/authSlice";
import { Provider } from "react-redux";
import store from "./features/store";
import {
  DogProfile,
  FriendsPage,
  LoginPage,
  MatchesPage,
} from "./components/index";

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
      {auth.user && auth.user.id ? <TabNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
};

const TabNavigation = () => {
  const { user } = useSelector(selectAuth);

  return (
    <Tab.Navigator initialRouteName="Login">
      <Tab.Screen name="Matches" component={MatchesPage} />
      <Tab.Screen
        name="Profile"
        component={DogProfile}
        initialParams={{
          profile: user,
          self: true,
          time: null,
        }}
        options={{ title: "My Profile" }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsNavigation}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const AuthNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginPage} />
    </Stack.Navigator>
  );
};

const FriendsNavigation = () => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AllFriends"
        component={FriendsPage}
        options={{ title: "Your friends" }}
      />
      <Stack.Screen
        name="FriendsProfile"
        component={DogProfile}
        options={{
          title: "Your friend",
          headerLeft: () => (
            <Button
              type="clear"
              icon={{
                name: "arrow-back",
                size: 24,
              }}
              title="See friends"
              onPress={() => navigation.navigate("AllFriends")}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

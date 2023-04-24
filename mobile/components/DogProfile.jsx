import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

//Single dog's profile (includes user and friends)
//takes in and displays user's data
const DogProfile = ({ route }) => {
  let { profile, self, message } = route.params;

  const { image, username, name, breed, age, size, energy } = profile;

  return (
    <View style={styles.container}>
      {self && <Text style={styles.username}>Hi, {name}!</Text>}
      {message && <Text style={styles.username}>{message}</Text>}
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name}>Username: {username}</Text>
      <Text style={styles.breed}>Breed: {breed}</Text>
      <Text style={styles.age}>Age: {age}</Text>
      <Text style={styles.size}>Size: {size}</Text>
      <Text style={styles.size}>Energy: {energy}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 275,
    height: 275,
    borderRadius: 100,
    marginBottom: 10,
    marginTop: 20,
  },
  username: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 5,
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
  },
  breed: {
    fontSize: 25,
    marginBottom: 5,
  },
  age: {
    fontSize: 25,
    marginBottom: 5,
  },
  size: {
    fontSize: 25,
    marginBottom: 5,
  },
  friendshipStatus: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default DogProfile;

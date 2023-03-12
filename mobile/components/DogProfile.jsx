import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const DogProfile = ({ route, navigation }) => {

  const {profile, self, time} = route.params;

  const {image, username, name, breed, age, size} = profile;

  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.breed}>{breed}</Text>
      <Text style={styles.age}>{age} years old</Text>
      <Text style={styles.size}>{size}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  breed: {
    fontSize: 16,
    marginBottom: 5,
  },
  age: {
    fontSize: 16,
    marginBottom: 5,
  },
  size: {
    fontSize: 16,
    marginBottom: 5,
  },
  friendshipStatus: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default DogProfile;
import React, { useState, useEffect } from "react";
import { FlatList, TouchableOpacity, View, StyleSheet, Text, ActivityIndicator, Image, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends, selectFriends } from "../features/friendsSlice";
import { selectAuth } from "../features/authSlice";

const FriendsPage = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [friends, setFriends] = useState([]);
  const [lastPage, setLastPage] = useState(false);

  const {user} = useSelector(selectAuth);
  const dispatch = useDispatch();
  const { friends: friendsData } = useSelector(selectFriends);
  

  //initially, get the state
  useEffect(() => {
    if(!user.id) return;
    else {
        const {id} = user;
        dispatch(fetchFriends({id, page}));
    }
  }, [user])

  //when new friend data is fetched
  useEffect(() => {
    if(friendsData && friendsData.length) {
        setLoading(false);
        setFriends([...friends, ...friendsData]);
        if(friendsData.length < 10) setLastPage(true);
    }
  }, [friendsData])

  const handleEndReached = () => {
    if(lastPage) return;
    else if (!loading && user && user.id) {
      setLoading(true);
      dispatch(fetchFriends({id: user.id, page: page + 1}));
      setPage(page + 1);
    }
  };

  const renderFooter = () => {
    if(lastPage) return (
            <Text style={styles.text}>End reached</Text>)

    return loading ? <ActivityIndicator size="large" color="#000" /> : null;
  };

  const seeProfile = (friend) => {
    navigation.navigate('User', {
      profile: friend,
      self: false,
      message: 'Hi, friend!'
    });
  }


  const renderFriend = (friend) => {
    const { image, name, breed, age, energy, id} = friend;

    return (
      <View style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          <Text>Breed: {breed}</Text>
          <Text>Age: {age}</Text>
          <Text>Energy: {energy}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => seeProfile(friend)} style={[styles.button, styles.likeButton]}>
            <Text style={styles.buttonText}>See profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView>
      {friends && friends.length ? <FlatList
        data={friends}
        keyExtractor={(f,i) => `${f.id}-${i}`}
        renderItem={({item}) => renderFriend(item)}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      /> : <Text>You don't have any friends yet :/{JSON.stringify(friendsData)}</Text>}
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 10,
      elevation: 3,
      overflow: 'hidden',
      marginVertical: 10,
    },
    image: {
      height: 300,
      width: '100%',
    },
    details: {
      padding: 10,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
    },
    button: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 10,
      borderRadius: 5,
      width: 120,
      alignItems: 'center',
    },
    likeButton: {
      backgroundColor: '#FFA500'
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default FriendsPage;

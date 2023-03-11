import React, { useState, useEffect } from "react";
import { FlatList, SafeAreaView, TouchableOpacity, View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches, selectMatches } from "../features/matchesSlice";
import { selectAuth } from "../features/authSlice";

const MatchesPage = () => {

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [lastPage, setLastPage] = useState(false);

  const {user} = useSelector(selectAuth);
  const dispatch = useDispatch();
  const { matches: newMatches} = useSelector(selectMatches);
  

  //initially, get the state
  useEffect(() => {
    if(!user.id) return;
    else dispatch(fetchMatches({page, id: user.id}));
  }, [dispatch, user])

  //when new match data is fetched
  useEffect(() => {
    if(newMatches && newMatches.length) {
        setLoading(false);
        setMatches([...matches, ...newMatches]);
        if(newMatches.length < 10) setLastPage(true);
    }
  }, [newMatches])

  const handleEndReached = () => {
    if(lastPage) return;
    else if (!loading) {
      setLoading(true);
      dispatch(fetchMatches({page: page + 1, id: user.id}));
      setPage(page + 1);
    }
  };

  const renderFooter = () => {
    if(lastPage) return (
            <Text style={styles.text}>End reached</Text>)

    return loading ? <ActivityIndicator size="large" color="#000" /> : null;
  };

  const onLike = () => {
    console.log('Like!');
  }

  const onDislike = () => {
    console.log('Dislike!');
  }

  const renderMatch = ({ image, name, breed, age, energy, size, sex}) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          <Text>{breed}</Text>
          <Text>{age}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onDislike} style={styles.button}>
            <Text style={styles.buttonText}>Dislike</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLike} style={[styles.button, styles.likeButton]}>
            <Text style={styles.buttonText}>Like</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
      <FlatList
        data={matches}
        keyExtractor={(match,i) => `${match.id}-${i}`}
        renderItem={({item}) => renderMatch(item)}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
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
      backgroundColor: '#ff7979',
      borderColor: '#ff7979',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default MatchesPage;

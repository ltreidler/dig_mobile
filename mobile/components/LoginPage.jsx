import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, TextInput, StyleSheet, Button, Text} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync, selectAuth } from '../features/authSlice';

const LoginPage = ({navigation}) => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const dispatch = useDispatch();
    const auth = useSelector(selectAuth);

    useEffect(() => {
        if(auth.user.id) {
            console.log(auth.user);
            navigation.navigate('Matches');
        }
        else if (loading && auth.error) {
            setError('An error occured. Please try again');
            setLoading(false);
            setUsername('');
            setPassword('');
        }
    }, [auth])

    function validLogin() {
        if(username.length > 5 && password.length > 5) return true;
        return false;
    }

    function handleLogin() {
        if(validLogin()) {
            dispatch(loginAsync({username, password}));
            setLoading(true);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.inputContainer}>
          <Text style={styles.title}>Welcome to Dig!</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button title="Login" onPress={handleLogin} disabled={!validLogin() || loading}/>
          </View>
        </SafeAreaView>
      );

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 80
    },
    inputContainer: {
      width: '80%',
    },
    input: {
      borderBottomWidth: 1,
      borderColor: 'gray',
      marginBottom: 20,
      fontSize: 18,
      paddingVertical: 5,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
        fontWeight: 'bold',
      }
  });

export default LoginPage;
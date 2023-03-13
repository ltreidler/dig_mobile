import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import matchesReducer from './matchesSlice';
import authReducer from './authSlice';
import friendsReducer from './friendsSlice';

const store = configureStore({
  reducer: { 
    auth: authReducer,
    matches: matchesReducer,
    friends: friendsReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
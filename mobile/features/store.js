import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import matchesReducer from './matchesSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: { 
    auth: authReducer,
    matches: matchesReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
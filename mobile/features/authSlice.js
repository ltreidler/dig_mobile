import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api";
import axios from "axios";

/*
  THUNKS
*/
export const loginAsync = createAsyncThunk('auth/login', async ({username, password}) => {
  try {
    if(!password || !username) throw new Error('Invalid login info');
    const {data} = await apiClient.put('/auth/login', {username, password});

    return {user: data, error: null};

  } catch (err) {

    console.error(err);
    return {user: {}, error: err.message};
  }

});


/*
  SLICE
*/
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: {},
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      return action.payload;
    })
  },
});

/*
  REDUCER
*/
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;

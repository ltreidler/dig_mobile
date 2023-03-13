import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api";

/*
  THUNKS
*/
export const fetchFriends = createAsyncThunk('friends/fetch', async ({id, page}) => {
  try {
    if(!id) throw new Error('User id required');
    const {data} = await apiClient.get(`/matches/friends?id=${id}&page=${page}`)

    return {friends: data, error: null};
  } catch (err) {
    console.error(err);
  }

});


/*
  SLICE
*/
export const friendsSlice = createSlice({
  name: "friends",
  initialState: {
    friends: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFriends.fulfilled, (state, action) => {
      return action.payload;
    })
  },
});

/*
  REDUCER
*/
export const selectFriends = (state) => state.friends;

export default friendsSlice.reducer;

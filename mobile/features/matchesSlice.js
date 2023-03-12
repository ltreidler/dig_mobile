import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api";

/*
  THUNKS
*/
export const fetchMatches = createAsyncThunk('matches/fetch', async ({page,id}) => {
  try {
    if(!id) throw new Error('User id required');

    const {data} = await apiClient.get(`/matches?id=${id}`)

    return {matches: data, error: null};
  } catch (err) {
    console.error(err);
  }

});

export const dislike = createAsyncThunk('matches/dislike', async ({id, matchId}) => {
  try {
    if(!id || !matchId) throw new Error('User id and match id required');
    console.log('dislike!');

    const res = await apiClient.post(`/matches/dislike`, {id, matchId});

    console.log(res, res.status);
    if(res.status === 201) return matchId;

  } catch (err) {
    console.error(err);
  }

});

export const like = createAsyncThunk('matches/like', async ({id, matchId}) => {
  try {
    console.log('like!');
    if(!id || !matchId) throw new Error('User id and match id required');
    console.log('like!');

    const res = await apiClient.post(`/matches/like`, {id, matchId});

    if(res.status === 201) return matchId;

  } catch (err) {
    console.error(err);
  }

});


/*
  SLICE
*/
export const matchesSlice = createSlice({
  name: "matches",
  initialState: {
    matches: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMatches.fulfilled, (state, action) => {
      return action.payload;
    })
    .addCase(dislike.fulfilled, (state, action) => {
      state.matches = state.matches.filter(({id}) => id !== action.payload);
    })
    .addCase(like.fulfilled, (state, action) => {
      state.matches = state.matches.filter(({id}) => id !== action.payload);
    })
  },
});

/*
  REDUCER
*/
export const selectMatches = (state) => state.matches;

export default matchesSlice.reducer;

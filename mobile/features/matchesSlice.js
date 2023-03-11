import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api";

/*
  THUNKS
*/
export const fetchMatches = createAsyncThunk('matches/fetch', async (page, {getState}) => {
  try {
    const {id} = getState(state => state.user);
    if(!id) throw new Error('No user information');

    const {data} = apiClient.get(`/matches?page=${page}`, {
        headers: {
          authorization: id,
        }
      })

    return {matches: data, error: null};
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
  },
});

/*
  REDUCER
*/
export const selectMatches = (state) => state.matches;

export default matchesSlice.reducer;

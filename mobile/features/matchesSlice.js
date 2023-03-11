import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api";

/*
  THUNKS
*/
export const fetchMatches = createAsyncThunk('matches/fetch', async ({page,id}) => {
  try {
    if(!id) throw new Error('User id required');

    const {data} = await apiClient.get(`/matches?page=${page}&id=${id}`)

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

import { createSlice } from "@reduxjs/toolkit";

const initialState = { currentTheme: "DEFAULT" };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.currentTheme = action.payload;
    },
  },
  extraReducers: {},
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;

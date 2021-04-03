import { configureStore } from "@reduxjs/toolkit"

import themeReducer from "./slice/theme"
import userReducer from "./slice/user"

const preloadedState = {}

const store = configureStore({
  reducer : {
    theme    : themeReducer,
    user     : userReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  preloadedState,
})

export default store

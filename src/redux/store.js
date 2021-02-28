import { configureStore } from "@reduxjs/toolkit"

import themeReducer from "./slice/theme"
import userReducer from "./slice/user"
import musiciansReducer from "./slice/all-users"

const preloadedState = {}

const store = configureStore({
  reducer : {
    theme    : themeReducer,
    user     : userReducer,
    musicians: musiciansReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  preloadedState,
})

export default store

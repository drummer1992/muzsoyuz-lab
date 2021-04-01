import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { MuzSoyuzRequest } from "../../api/muzsoyuz-api"

const AUTH_TOKEN_KEY = "Authorization"

const initialState = {
  profile: null,
  token  : window.localStorage.getItem(AUTH_TOKEN_KEY),
  status : "idle",
  error  : null,
}

export const login = createAsyncThunk("post/login", async (data) => {
  const response = await MuzSoyuzRequest.login(data.email, data.password)

  window.localStorage.setItem(AUTH_TOKEN_KEY, response.token)

  return response
})

export const fetchProfile = createAsyncThunk("get/profile", () => {
  return MuzSoyuzRequest.getUserProfile()
    .setToken(window.localStorage.getItem(AUTH_TOKEN_KEY))
})

const userSlice = createSlice({
  name         : "user",
  initialState,
  reducers     : {},
  extraReducers: {
    [login.pending]         : state => {
      state.status = "loading"
    },
    [login.fulfilled]       : (state, action) => {
      state.token = action.payload.token
      state.profile = action.payload.profile
      state.status = "succeeded"
      state.error = null
    },
    [login.rejected]        : (state, action) => {
      state.token = null
      state.profile = null
      state.status = "failed"
      state.error = action.error && action.error.message
    },
    [fetchProfile.pending]  : state => {
      state.profile = {
        status: 'loading',
      }
    },
    [fetchProfile.fulfilled]: (state, action) => {
      state.profile = {
        status: "succeeded",
        error : null,
        ...action.payload,
      }
    },
    [fetchProfile.rejected] : (state, action) => {
      state.profile = {
        status: "failed",
        error : action.error && action.error.message
      }
    },
  },
})

export default userSlice.reducer

export const selectUser = (state) => state.user

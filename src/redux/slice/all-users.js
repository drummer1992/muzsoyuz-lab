import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { MuzSoyuzRequest } from "../../api/muzsoyuz-api"

const initialState = {
  data  : null,
  status: "idle",
  error : null,
}

export const findChatUsers = createAsyncThunk("get/chatUsers", async ({ token }) => {
  return MuzSoyuzRequest.getChatUsers()
    .setToken(token)
})

const musiciansSlice = createSlice({
  name         : "musicians",
  initialState,
  reducers     : {},
  extraReducers: {
    [findChatUsers.pending]  : (state, action) => {
      state.status = "loading"
    },
    [findChatUsers.fulfilled]: (state, action) => {
      state.data = action.payload
      state.status = "succeeded"
      state.error = null
    },
    [findChatUsers.rejected] : (state, action) => {
      state.data = null
      state.status = "failed"
      state.error = action.error && action.error.message
    },
  },
})

export default musiciansSlice.reducer

export const selectMusicians = (state) => state.musicians

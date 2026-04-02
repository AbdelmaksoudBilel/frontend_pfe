import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../../services/chatService";

export const fetchConversations = createAsyncThunk("chat/fetchConversations", async (_, { rejectWithValue }) => {
  try { return await chatService.getConversations(); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const sendMessage = createAsyncThunk("chat/sendMessage", async ({ convId, message }, { rejectWithValue }) => {
  try { return await chatService.sendMessage(convId, message); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchMessages = createAsyncThunk("chat/fetchMessages", async (convId, { rejectWithValue }) => {
  try { return await chatService.getMessages(convId); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const chatSlice = createSlice({
  name: "chat",
  initialState: { conversations: [], activeConv: null, messages: [], sending: false, loading: false, error: null },
  reducers: {
    setActiveConversation: (state, action) => { state.activeConv = action.payload; state.messages = []; },
    addLocalMessage:       (state, action) => { state.messages.push(action.payload); },
    clearMessages:         (state)         => { state.messages = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => { state.conversations = action.payload; })
      .addCase(fetchMessages.pending,        (state)         => { state.loading = true; })
      .addCase(fetchMessages.fulfilled,      (state, action) => { state.loading = false; state.messages = action.payload; })
      .addCase(sendMessage.pending,          (state)         => { state.sending = true; })
      .addCase(sendMessage.fulfilled,        (state, action) => {
        state.sending = false;
        if (action.payload?.response) state.messages.push(action.payload.response);
      })
      .addCase(sendMessage.rejected,         (state, action) => { state.sending = false; state.error = action.payload; });
  },
});
export const { setActiveConversation, addLocalMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
export const selectConversations = (state) => state.chat.conversations;
export const selectMessages      = (state) => state.chat.messages;
export const selectSending       = (state) => state.chat.sending;
export const selectActiveConv    = (state) => state.chat.activeConv;

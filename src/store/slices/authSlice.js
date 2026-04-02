import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try { return await authService.login(credentials); }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Erreur de connexion"); }
});
export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try { return await authService.register(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Erreur d'inscription"); }
});
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:            authService.getUser(),
    token:           authService.getToken(),
    loading:         false,
    error:           null,
    isAuthenticated: !!authService.getToken(),
  },
  reducers: {
    clearError: (state)         => { state.error = null; },
    setUser:    (state, action) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,      (state)         => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled,    (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; state.isAuthenticated = true; })
      .addCase(loginUser.rejected,     (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending,   (state)         => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state)         => { state.loading = false; })
      .addCase(registerUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logoutUser.fulfilled,   (state)         => { state.user = null; state.token = null; state.isAuthenticated = false; });
  },
});
export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
export const selectAuth            = (state) => state.auth;
export const selectUser            = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading     = (state) => state.auth.loading;
export const selectAuthError       = (state) => state.auth.error;

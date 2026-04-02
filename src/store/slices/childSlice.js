import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import childService from "../../services/childService";

export const fetchChildren = createAsyncThunk("child/fetchAll", async (_, { rejectWithValue }) => {
  try { return await childService.getAll(); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const createChild = createAsyncThunk("child/create", async (data, { rejectWithValue }) => {
  try { return await childService.create(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const updateChild = createAsyncThunk("child/update", async ({ id, data }, { rejectWithValue }) => {
  try { return await childService.update(id, data); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const childSlice = createSlice({
  name: "child",
  initialState: { list: [], selected: null, loading: false, error: null },
  reducers: {
    selectChild:     (state, action) => { state.selected = action.payload; },
    clearChildError: (state)         => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildren.pending,   (state)         => { state.loading = true; })
      .addCase(fetchChildren.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchChildren.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createChild.fulfilled,   (state, action) => { state.list.push(action.payload); })
      .addCase(updateChild.fulfilled,   (state, action) => {
        const idx = state.list.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected?._id === action.payload._id) state.selected = action.payload;
      });
  },
});
export const { selectChild, clearChildError } = childSlice.actions;
export default childSlice.reducer;
export const selectChildren      = (state) => state.child.list;
export const selectSelectedChild = (state) => state.child.selected;
export const selectChildLoading  = (state) => state.child.loading;

import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: true, lang: "fr", snackbar: null },
  reducers: {
    toggleSidebar: (state)         => { state.sidebarOpen = !state.sidebarOpen; },
    setLang:       (state, action) => { state.lang = action.payload; },
    setSnackbar:   (state, action) => { state.snackbar = action.payload; },
    clearSnackbar: (state)         => { state.snackbar = null; },
  },
});
export const { toggleSidebar, setLang, setSnackbar, clearSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectLang        = (state) => state.ui.lang;
export const selectSnackbar    = (state) => state.ui.snackbar;

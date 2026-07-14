import { createSlice } from '@reduxjs/toolkit';

const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState = {
  theme: prefersDark ? 'dark' : 'light',
  shortcutsOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    setShortcutsOpen(state, action) {
      state.shortcutsOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, setShortcutsOpen } = uiSlice.actions;
export default uiSlice.reducer;

export const selectTheme = (state) => state.ui.theme;
export const selectShortcutsOpen = (state) => state.ui.shortcutsOpen;

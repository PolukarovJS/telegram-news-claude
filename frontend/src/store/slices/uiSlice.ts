import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState } from '../../types';

const initialState: UiState = {
  theme: 'light', // По умолчанию светлая тема
  modal: {
    isOpen: false,
    type: null,
    message: '',
  },
  sidebar: {
    isOpen: false,
  },
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
    openModal(state, action: PayloadAction<{ type: 'confirm' | 'error'; message: string }>) {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        message: action.payload.message,
      };
    },
    closeModal(state) {
      state.modal = {
        isOpen: false,
        type: null,
        message: '',
      };
    },
    toggleSidebar(state) {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebar(state, action: PayloadAction<boolean>) {
      state.sidebar.isOpen = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, openModal, closeModal, toggleSidebar, setSidebar, setLoading } =
  uiSlice.actions;

export default uiSlice.reducer;
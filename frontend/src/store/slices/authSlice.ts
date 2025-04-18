// src/store/slices/authSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../types';

// Интерфейс ответа сервера
interface AuthResponse {
  is_authorized: boolean;
  session_key: string | null;
  message: string;
}

// Интерфейс состояния авторизации
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionKey: string | null;
  error: string | null;
}

// Начальное состояние
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  sessionKey: null,
  error: null,
};

// Асинхронное действие для проверки авторизации
export const fetchAuth = createAsyncThunk<
  AuthResponse | null,
  void,
  { state: RootState; rejectValue: string }
>(
  'auth/fetchAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/auth/check', {
        method: 'GET',
        credentials: 'include', // Для отправки cookies, если используются
      });
      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }
      const data: AuthResponse | null = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Создание слайса
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state, action: { payload: { sessionKey: string } }) {
      state.isAuthenticated = true;
      state.sessionKey = action.payload.sessionKey;
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.sessionKey = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.is_authorized) {
          state.isAuthenticated = true;
          state.sessionKey = action.payload.session_key;
        } else {
          state.isAuthenticated = false;
          state.sessionKey = null;
        }
      })
      .addCase(fetchAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Authentication failed';
        state.isAuthenticated = false;
        state.sessionKey = null;
      });
  },
});

// Экспорт действий
export const { setAuthenticated, clearAuth } = authSlice.actions;

// Экспорт редуктора
export default authSlice.reducer;
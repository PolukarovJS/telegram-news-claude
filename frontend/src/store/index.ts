// src/store/index.ts

import { configureStore, Store, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { RootState } from '../types';

import authReducer from './slices/authSlice';
import channelsReducer from './slices/channelsSlice';
import messagesReducer from './slices/messagesSlice';
import commentsReducer from './slices/commentsSlice';
import notificationsReducer from './slices/notificationsSlice';
import uiReducer from './slices/uiSlice';
import webSocketMiddleware from './middleware/webSocketMiddleware';

// Создание хранилища с явной типизацией
const store: Store<RootState> = configureStore({
  reducer: {
    auth: authReducer,
    channels: channelsReducer,
    messages: messagesReducer,
    comments: commentsReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(webSocketMiddleware),
});

// Экспорт типов
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type { RootState };

export default store;

// Типизированный useDispatch
export const useAppDispatch: () => ThunkDispatch<RootState, unknown, Action> = useDispatch;

// Типизированный useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
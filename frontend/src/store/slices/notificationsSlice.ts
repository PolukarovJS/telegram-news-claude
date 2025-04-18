// store/slices/notificationsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload); // Добавляем уведомление в начало списка
      
      // Ограничиваем количество хранимых уведомлений
      if (state.items.length > 100) {
        state.items = state.items.slice(0, 100);
      }
      
      // Увеличиваем счетчик непрочитанных
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.items.forEach(item => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    }
  }
});

export const { 
  addNotification, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
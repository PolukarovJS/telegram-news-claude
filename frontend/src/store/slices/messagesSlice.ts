// store/slices/messagesSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Message, MessageFilter } from '../../types';
import * as telegramApi from '../../api/telegramApi';

interface MessagesState {
  items: Message[];
  currentChannelId: string | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: MessagesState = {
  items: [],
  currentChannelId: null,
  isLoading: false,
  error: null,
  hasMore: true
};

// Асинхронные действия
export const fetchChannelMessages = createAsyncThunk(
  'messages/fetchChannelMessages',
  async ({ channelId, limit = 50, offsetId = 0 }: { channelId: string, limit?: number, offsetId?: number }, { rejectWithValue }) => {
    try {
      const messages = await telegramApi.getChannelMessages(channelId, limit, offsetId);
      return { messages, channelId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения сообщений');
    }
  }
);

export const searchMessages = createAsyncThunk(
  'messages/searchMessages',
  async (filter: MessageFilter, { rejectWithValue }) => {
    try {
      const messages = await telegramApi.searchMessages(filter);
      return { messages, filter };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка поиска сообщений');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      // Проверяем, существует ли уже сообщение с таким ID
      const exists = state.items.some(item => item.message_id === action.payload.message_id);
      
      if (!exists) {
        // Добавляем новое сообщение в начало списка
        state.items.unshift(action.payload);
      }
    },
    
    updateMessage: (state, action: PayloadAction<Partial<Message> & { message_id: string }>) => {
      const index = state.items.findIndex(item => item.message_id === action.payload.message_id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    
    clearMessages: (state) => {
      state.items = [];
      state.currentChannelId = null;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchChannelMessages
      .addCase(fetchChannelMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChannelMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const { messages, channelId } = action.payload;
        
        // Если это первый запрос или новый канал
        if (state.currentChannelId !== channelId) {
          state.items = messages;
          state.currentChannelId = channelId;
        } else {
          // Добавляем новые сообщения и удаляем дубликаты
          const existingIds = new Set(state.items.map(msg => msg.message_id));
          const newMessages = messages.filter(msg => !existingIds.has(msg.message_id));
          
          state.items = [...state.items, ...newMessages];
        }
        
        // Проверяем, есть ли еще сообщения
        state.hasMore = messages.length > 0;
      })
      .addCase(fetchChannelMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка получения сообщений';
      })
      
      // Обработка searchMessages
      .addCase(searchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.messages;
        state.currentChannelId = null; // Сбрасываем текущий канал при поиске
        state.hasMore = action.payload.messages.length > 0;
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка поиска сообщений';
      });
  }
});

export const { addMessage, updateMessage, clearMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
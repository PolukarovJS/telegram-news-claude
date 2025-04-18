import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Channel } from '../../types';

// Интерфейс состояния для channels
interface ChannelsState {
  items: Channel[];
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: ChannelsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Асинхронное действие для получения каналов
export const fetchChannels = createAsyncThunk<
  Channel[],
  void,
  { rejectValue: string }
>(
  'channels/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/channels');
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      const data: Channel[] = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Создание слайса
const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    addChannel(state, action: { payload: Channel }) {
      state.items.push(action.payload);
    },
    updateChannel(state, action: { payload: Channel }) {
      const index = state.items.findIndex(
        (channel) => channel.channel_id === action.payload.channel_id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

// Экспорт действий
export const { addChannel, updateChannel } = channelsSlice.actions;

// Экспорт редуктора
export default channelsSlice.reducer;
// store/slices/commentsSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Comment, CommentFilter } from '../../types';
import * as telegramApi from '../../api/telegramApi';

interface CommentsState {
  items: Comment[];
  currentMessageId: string | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: CommentsState = {
  items: [],
  currentMessageId: null,
  isLoading: false,
  error: null,
  hasMore: true
};

// Асинхронные действия
export const fetchMessageComments = createAsyncThunk(
  'comments/fetchMessageComments',
  async ({ channelId, messageId, limit = 100 }: { channelId: string, messageId: string, limit?: number }, { rejectWithValue }) => {
    try {
      const comments = await telegramApi.getMessageComments(channelId, messageId, limit);
      return { comments, messageId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения комментариев');
    }
  }
);

export const searchComments = createAsyncThunk(
  'comments/searchComments',
  async (filter: CommentFilter, { rejectWithValue }) => {
    try {
      const comments = await telegramApi.searchComments(filter);
      return { comments, filter };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка поиска комментариев');
    }
  }
);

export const updateCommentMetadata = createAsyncThunk(
  'comments/updateMetadata',
  async ({ commentId, metadata }: { commentId: string, metadata: any }, { rejectWithValue }) => {
    try {
      const updatedComment = await telegramApi.updateCommentMetadata(commentId, metadata);
      return updatedComment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка обновления метаданных комментария');
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<Comment>) => {
      // Проверяем, существует ли уже комментарий с таким ID
      const exists = state.items.some(item => item.comment_id === action.payload.comment_id);
      
      if (!exists) {
        state.items.push(action.payload);
        
        // Сортируем комментарии по дате
        state.items.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      }
    },
    
    updateComment: (state, action: PayloadAction<Partial<Comment> & { comment_id: string }>) => {
      const index = state.items.findIndex(item => item.comment_id === action.payload.comment_id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    
    clearComments: (state) => {
      state.items = [];
      state.currentMessageId = null;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchMessageComments
      .addCase(fetchMessageComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessageComments.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const { comments, messageId } = action.payload;
        
        // Если это первый запрос или новое сообщение
        if (state.currentMessageId !== messageId) {
          state.items = comments;
          state.currentMessageId = messageId;
        } else {
          // Добавляем новые комментарии и удаляем дубликаты
          const existingIds = new Set(state.items.map(comment => comment.comment_id));
          const newComments = comments.filter(comment => !existingIds.has(comment.comment_id));
          
          state.items = [...state.items, ...newComments];
          
          // Сортируем комментарии по дате
          state.items.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
        }
        
        // Проверяем, есть ли еще комментарии
        state.hasMore = comments.length > 0;
      })
      .addCase(fetchMessageComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка получения комментариев';
      })
      
      // Обработка searchComments
      .addCase(searchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.comments;
        state.currentMessageId = null; // Сбрасываем текущее сообщение при поиске
        state.hasMore = action.payload.comments.length > 0;
      })
      .addCase(searchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка поиска комментариев';
      })
      
      // Обработка updateCommentMetadata
      .addCase(updateCommentMetadata.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.comment_id === action.payload.comment_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { addComment, updateComment, clearComments } = commentsSlice.actions;

export default commentsSlice.reducer;
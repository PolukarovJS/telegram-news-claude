// src/types/index.ts

// Типы каналов
export interface Channel {
  channel_id: string;
  title: string;
  username?: string;
  description?: string;
  subscribers_count?: number;
  category?: string;
  is_monitored: boolean;
}

// Типы сообщений (новостей)
export interface Message {
  message_id: string;
  channel_id: string;
  date: string;
  text: string;
  media: string[];
  views?: number;
  forwards?: number;
  comments_count?: number;
  last_comment_date?: string;
}

// Типы комментариев
export interface Reaction {
  type: string;
  count: number;
}

export interface CommentMetadata {
  sentiment?: 'positive' | 'negative' | 'neutral';
  user_tags?: string[];
  is_bookmarked?: boolean;
}

export interface Comment {
  comment_id: string;
  message_id: string;
  channel_id: string;
  user_id: string;
  reply_to_comment_id?: string;
  text: string;
  date: string;
  reactions: Reaction[];
  media: string[];
  is_edited: boolean;
  metadata: CommentMetadata;
}

// Типы пользователей
export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  auto_download: boolean;
  monitored_channels: string[];
}

export interface UserSubscription {
  plan: string;
  expires: string;
}

export interface UserStats {
  saved_comments: number;
  tagged_comments: number;
  last_login: string;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  settings: UserSettings;
  subscription?: UserSubscription;
  stats: UserStats;
}

// Типы для аутентификации
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionKey: string | null;
  error: string | null;
}

// Типы для запросов API
export interface AuthRequest {
  phone: string;
  code?: string;
  password?: string;
  session_key?: string;
}

export interface AuthResponse {
  session_key: string;
  message: string;
}

export interface ErrorResponse {
  detail: string;
}

// Типы для фильтрации и поиска
export interface MessageFilter {
  query?: string;
  channels?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface CommentFilter {
  query?: string;
  channels?: string[];
  messages?: string[];
  dateFrom?: string;
  dateTo?: string;
  sentiment?: string;
  userTags?: string[];
}

// Типы для экспорта
export type ExportFormat = 'csv' | 'json' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  channelIds?: string[];
  messageIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  sentiment?: string;
  userTags?: string[];
}

// Типы для WebSocket
export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  error?: string;
}

// Типы для анализа
export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

// Типы для уведомлений
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

// Типы для UI состояния
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentView: 'channels' | 'messages' | 'comments' | 'analytics' | 'settings';
}

// Типы для состояния хранилища Redux
export interface RootState {
  auth: AuthState;
  channels: {
    items: Channel[];
    isLoading: boolean;
    error: string | null;
  };
  messages: {
    items: Message[];
    currentChannelId: string | null;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
  };
  comments: {
    items: Comment[];
    currentMessageId: string | null;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
  };
  notifications: {
    items: Notification[];
    unreadCount: number;
  };
  ui: UIState;
}

// Типы для действий Redux
export interface Action<T = any> {
  type: string;
  payload?: T;
}

// Типы для асинхронных действий
export interface AsyncAction<T = any, E = string> extends Action<T> {
  error?: boolean;
  meta?: any;
}
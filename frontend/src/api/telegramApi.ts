import axios from 'axios';
import { Channel, Message, Comment } from '../types';

const API_BASE_URL = 'http://localhost:8000';

let sessionKey: string | null = null;

// Сохраняем ключ сессии в localStorage
export const saveSessionKey = (key: string) => {
  sessionKey = key;
  localStorage.setItem('telegram_session_key', key);
};

// Получаем ключ сессии из localStorage
export const getSessionKey = (): string | null => {
  if (!sessionKey) {
    sessionKey = localStorage.getItem('telegram_session_key');
  }
  return sessionKey;
};

// Очищаем ключ сессии
export const clearSessionKey = () => {
  sessionKey = null;
  localStorage.removeItem('telegram_session_key');
};

// Аутентификация в Telegram
export const sendAuthCode = async (phone: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/send_code`, { phone });
    if (response.data.session_key) {
      saveSessionKey(response.data.session_key);
    }
    return response.data;
  } catch (error) {
    console.error('Error sending auth code:', error);
    throw error;
  }
};

export const signIn = async (phone: string, code: string, password?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/sign_in`, {
      phone,
      code,
      password,
      session_key: getSessionKey(),
    });
    return response.data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {
      session_key: getSessionKey(),
    });
    clearSessionKey();
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Работа с каналами
export const searchChannels = async (query: string, limit: number = 10): Promise<Channel[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/channels/search`, {
      params: {
        query,
        limit,
        session_key: getSessionKey(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching channels:', error);
    throw error;
  }
};

export const getChannelInfo = async (channelUsername: string): Promise<Channel> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/channels/${channelUsername}`, {
      params: {
        session_key: getSessionKey(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting channel info:', error);
    throw error;
  }
};

export const updateMonitoringStatus = async (channelId: string, isMonitored: boolean): Promise<void> => {
  try {
    await axios.patch(`${API_BASE_URL}/channels/${channelId}/monitoring`, {
      is_monitored: isMonitored,
      session_key: getSessionKey(),
    });
  } catch (error) {
    console.error('Error updating monitoring status:', error);
    throw error;
  }
};

export const getMonitoredChannels = async (): Promise<Channel[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/channels/monitored`, {
      params: {
        session_key: getSessionKey(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting monitored channels:', error);
    throw error;
  }
};

// Работа с сообщениями
export const getChannelMessages = async (
  channelId: string,
  limit: number = 50,
  offsetId: number = 0
): Promise<Message[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/channels/${channelId}/messages`, {
      params: {
        limit,
        offset_id: offsetId,
        session_key: getSessionKey(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting channel messages:', error);
    throw error;
  }
};

export const getMessageById = async (channelId: string, messageId: string): Promise<Message> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/channels/${channelId}/messages/${messageId}`, {
      params: {
        session_key: getSessionKey(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting message by ID:', error);
    throw error;
  }
};

export const searchMessages = async (
  query: string,
  channels?: string[],
  dateFrom?: string,
  dateTo?: string,
  limit: number = 50
): Promise<Message[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/messages/search`, {
      params: {
        query,
        channels: channels?.join(','),
        date_from: dateFrom,
        date_to: dateTo,
        limit,
        session_key: getSessionKey(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

// Работа с комментариями
export const getMessageComments = async (
  channelId: string,
  messageId: string,
  limit: number = 100
): Promise<Comment[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/channels/${channelId}/messages/${messageId}/comments`,
      {
        params: {
          limit,
          session_key: getSessionKey(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting message comments:', error);
    throw error;
  }
};

export const getCommentById = async (
  channelId: string,
  messageId: string,
  commentId: string
): Promise<Comment> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/channels/${channelId}/messages/${messageId}/comments/${commentId}`,
      {
        params: {
          session_key: getSessionKey(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting comment by ID:', error);
    throw error;
  }
};

export const searchComments = async (
  query: string,
  channels?: string[],
  dateFrom?: string,
  dateTo?: string,
  sentiment?: string,
  userTags?: string[],
  limit: number = 100
): Promise<Comment[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/comments/search`, {
      params: {
        query,
        channels: channels?.join(','),
        date_from: dateFrom,
        date_to: dateTo,
        sentiment,
        user_tags: userTags?.join(','),
        limit,
        session_key: getSessionKey(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching comments:', error);
    throw error;
  }
};

export const updateCommentMetadata = async (
  commentId: string,
  metadata: {
    sentiment?: string;
    user_tags?: string[];
    is_bookmarked?: boolean;
  }
): Promise<Comment> => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/comments/${commentId}/metadata`, {
      metadata,
      session_key: getSessionKey(),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating comment metadata:', error);
    throw error;
  }
};

// Экспорт данных
export const exportMessages = async (
  format: 'csv' | 'json' | 'xlsx',
  channelIds: string[],
  dateFrom?: string,
  dateTo?: string
): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export/messages`, {
      params: {
        format,
        channel_ids: channelIds.join(','),
        date_from: dateFrom,
        date_to: dateTo,
        session_key: getSessionKey(),
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting messages:', error);
    throw error;
  }
};

export const exportComments = async (
  format: 'csv' | 'json' | 'xlsx',
  channelIds?: string[],
  messageIds?: string[],
  dateFrom?: string,
  dateTo?: string,
  sentiment?: string,
  userTags?: string[]
): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export/comments`, {
      params: {
        format,
        channel_ids: channelIds?.join(','),
        message_ids: messageIds?.join(','),
        date_from: dateFrom,
        date_to: dateTo,
        sentiment,
        user_tags: userTags?.join(','),
        session_key: getSessionKey(),
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting comments:', error);
    throw error;
  }
};

// WebSocket для получения обновлений в реальном времени
let websocket: WebSocket | null = null;
const listeners: { [key: string]: ((data: any) => void)[] } = {};

export const connectWebSocket = () => {
  const key = getSessionKey();
  if (!key) {
    console.error('No session key available for WebSocket connection');
    return;
  }

  websocket = new WebSocket(`ws://localhost:8000/ws/${key}`);

  websocket.onopen = () => {
    console.log('WebSocket connection established');
    // Отправляем сообщение о начале мониторинга
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'start_monitoring',
        channels: [] // Здесь можно передать список каналов для мониторинга
      }));
    }
  };

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const eventType = data.type;

      if (listeners[eventType]) {
        listeners[eventType].forEach((callback) => callback(data));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  websocket.onclose = () => {
    console.log('WebSocket connection closed');
    // Повторное подключение через 5 секунд
    setTimeout(connectWebSocket, 5000);
  };

  return websocket;
};

export const addWebSocketListener = (eventType: string, callback: (data: any) => void) => {
  if (!listeners[eventType]) {
    listeners[eventType] = [];
  }
  listeners[eventType].push(callback);
};

export const removeWebSocketListener = (eventType: string, callback: (data: any) => void) => {
  if (listeners[eventType]) {
    listeners[eventType] = listeners[eventType].filter((cb) => cb !== callback);
  }
};

export const disconnectWebSocket = () => {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
};

export const startMonitoring = (channelIds: string[]) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      type: 'start_monitoring',
      channels: channelIds
    }));
  } else {
    console.error('WebSocket is not connected');
  }
};

export const stopMonitoring = (channelIds: string[]) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      type: 'stop_monitoring',
      channels: channelIds
    }));
  } else {
    console.error('WebSocket is not connected');
  }
};

// Анализ комментариев
export const analyzeSentiment = async (text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze/sentiment`, {
      text,
      session_key: getSessionKey(),
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

export const extractKeywords = async (text: string, limit: number = 5): Promise<string[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze/keywords`, {
      text,
      limit,
      session_key: getSessionKey(),
    });
    return response.data.keywords;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw error;
  }
};

// Пользовательские настройки
export const updateSettings = async (settings: {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  auto_download?: boolean;
  monitored_channels?: string[];
}): Promise<void> => {
  try {
    await axios.patch(`${API_BASE_URL}/user/settings`, {
      settings,
      session_key: getSessionKey(),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const getSettings = async (): Promise<{
  theme: 'light' | 'dark';
  notifications: boolean;
  auto_download: boolean;
  monitored_channels: string[];
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/settings`, {
      params: {
        session_key: getSessionKey(),
      },
    });
    return response.data.settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

export function checkAuthStatus() {
  throw new Error('Function not implemented.');
}

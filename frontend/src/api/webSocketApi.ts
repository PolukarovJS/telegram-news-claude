import { WebSocketMessage } from '../types';
import store from '../store';
import { addNotification } from '../store/slices/notificationsSlice';
import { addMessage } from '../store/slices/messagesSlice';
import { addComment } from '../store/slices/commentsSlice';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/api/v1/ws';

let websocket: WebSocket | null = null;
const listeners: { [key: string]: ((data: any) => void)[] } = {};

// Повторное подключение
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 секунды

export const connectWebSocket = (sessionKey: string): WebSocket | null => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    return websocket;
  }

  const wsUrl = `${WS_BASE_URL}/${sessionKey}`;
  
  try {
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0; // Сбрасываем счетчик попыток
      
      // Диспатчим уведомление о подключении
      store.dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: 'Соединение с сервером установлено',
        timestamp: new Date().toISOString(),
        read: false
      }));
    };
    
    websocket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        // Обрабатываем разные типы сообщений
        handleWebSocketMessage(message);
        
        // Вызываем слушателей для этого типа сообщений
        if (listeners[message.type]) {
          listeners[message.type].forEach(callback => callback(message));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      
      // Диспатчим уведомление об ошибке
      store.dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Ошибка соединения с сервером',
        timestamp: new Date().toISOString(),
        read: false
      }));
    };
    
    websocket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
      
      // Пытаемся переподключиться, если соединение было разорвано неожиданно
      if (event.code !== 1000) {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(() => connectWebSocket(sessionKey), RECONNECT_DELAY);
          
          // Диспатчим уведомление о попытке переподключения
          store.dispatch(addNotification({
            id: Date.now().toString(),
            type: 'warning',
            message: `Соединение разорвано. Попытка переподключения ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`,
            timestamp: new Date().toISOString(),
            read: false
          }));
        } else {
          // Диспатчим уведомление о невозможности переподключения
          store.dispatch(addNotification({
            id: Date.now().toString(),
            type: 'error',
            message: 'Не удалось переподключиться к серверу',
            timestamp: new Date().toISOString(),
            read: false
          }));
        }
      }
    };
    
    return websocket;
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
    return null;
  }
};

export const disconnectWebSocket = (): void => {
  if (websocket) {
    websocket.close(1000, 'User logged out');
    websocket = null;
  }
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  // Очищаем слушателей
  for (const type in listeners) {
    listeners[type] = [];
  }
};

export const sendWebSocketMessage = (message: any): boolean => {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected');
    return false;
  }
  
  try {
    websocket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
};

export const addWebSocketListener = (eventType: string, callback: (data: any) => void): void => {
  if (!listeners[eventType]) {
    listeners[eventType] = [];
  }
  listeners[eventType].push(callback);
};

export const removeWebSocketListener = (eventType: string, callback: (data: any) => void): void => {
  if (listeners[eventType]) {
    listeners[eventType] = listeners[eventType].filter(cb => cb !== callback);
  }
};

// Функция для запуска мониторинга каналов
export const startMonitoringChannels = (channelIds: string[]): boolean => {
  return sendWebSocketMessage({
    type: 'start_monitoring',
    channels: channelIds,
    timestamp: new Date().toISOString()
  });
};

// Функция для остановки мониторинга каналов
export const stopMonitoringChannels = (channelIds: string[]): boolean => {
  return sendWebSocketMessage({
    type: 'stop_monitoring',
    channels: channelIds,
    timestamp: new Date().toISOString()
  });
};

// Обработчик сообщений WebSocket
const handleWebSocketMessage = (message: WebSocketMessage): void => {
  switch (message.type) {
    case 'new_message':
      // Обработка нового сообщения
      if (message.data) {
        store.dispatch(addMessage(message.data));
        
        // Уведомление о новом сообщении
        store.dispatch(addNotification({
          id: Date.now().toString(),
          type: 'info',
          message: `Новое сообщение в канале ${message.data.channel_id}`,
          timestamp: new Date().toISOString(),
          read: false
        }));
      }
      break;
      
    case 'new_comment':
      // Обработка нового комментария
      if (message.data) {
        store.dispatch(addComment(message.data));
      }
      break;
      
    case 'message_edited':
      // Обработка редактирования сообщения
      // Реализация
      break;
      
    case 'error':
      // Обработка ошибки
      store.dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: message.error || 'Неизвестная ошибка',
        timestamp: message.timestamp || new Date().toISOString(),
        read: false
      }));
      break;
      
    case 'monitoring_started':
    case 'monitoring_stopped':
      // Обработка уведомлений о мониторинге
      store.dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: message.type === 'monitoring_started' 
          ? 'Мониторинг каналов запущен' 
          : 'Мониторинг каналов остановлен',
        timestamp: message.timestamp || new Date().toISOString(),
        read: false
      }));
      break;
    default:
      // console.log('Unhandled WebSocket message type:', message.type);
      console.log('Unhandled WebSocket message type: defaultMessage.type' );
  }
};
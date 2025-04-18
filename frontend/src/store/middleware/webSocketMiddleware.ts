import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  sendWebSocketMessage 
} from '../../api/webSocketApi';
import { addNotification } from '../slices/notificationsSlice';
import { addMessage } from '../slices/messagesSlice';
import { addComment } from '../slices/commentsSlice';
import { RootState, AppDispatch } from '..';

// Типы действий для WebSocket
export const WS_CONNECT = 'ws/connect';
export const WS_DISCONNECT = 'ws/disconnect';
export const WS_SEND_MESSAGE = 'ws/sendMessage';
export const WS_START_MONITORING = 'ws/startMonitoring';
export const WS_STOP_MONITORING = 'ws/stopMonitoring';

// Типы для WebSocket-действий
interface WsConnectAction {
  type: typeof WS_CONNECT;
  payload: string; // sessionKey
}

interface WsDisconnectAction {
  type: typeof WS_DISCONNECT;
}

interface WsSendMessageAction {
  type: typeof WS_SEND_MESSAGE;
  payload: any; // Можно заменить на WebSocketMessage
}

interface WsStartMonitoringAction {
  type: typeof WS_START_MONITORING;
  payload: { channelIds: string[] };
}

interface WsStopMonitoringAction {
  type: typeof WS_STOP_MONITORING;
  payload: { channelIds: string[] };
}

type WebSocketAction =
  | WsConnectAction
  | WsDisconnectAction
  | WsSendMessageAction
  | WsStartMonitoringAction
  | WsStopMonitoringAction;

// Создание middleware для WebSocket
const webSocketMiddleware: Middleware<{}, RootState, AppDispatch> = 
  (storeApi: MiddlewareAPI<AppDispatch, RootState>) => 
  (next: (action: unknown) => unknown) => 
  (action: unknown): unknown => {
    const { dispatch, getState } = storeApi;

    // Приведение action к WebSocketAction для известных типов
    const wsAction = action as WebSocketAction;

    switch (wsAction.type) {
      case WS_CONNECT:
        connectWebSocket(wsAction.payload);
        break;
        
      case WS_DISCONNECT:
        disconnectWebSocket();
        break;
        
      case WS_SEND_MESSAGE:
        sendWebSocketMessage(wsAction.payload);
        break;
        
      case WS_START_MONITORING:
        sendWebSocketMessage({
          type: 'start_monitoring',
          channels: wsAction.payload.channelIds,
          timestamp: new Date().toISOString(),
        });
        break;
        
      case WS_STOP_MONITORING:
        sendWebSocketMessage({
          type: 'stop_monitoring',
          channels: wsAction.payload.channelIds,
          timestamp: new Date().toISOString(),
        });
        break;
    }
    
    return next(action);
  };

// Действия для инициирования WebSocket
export const wsConnect = (sessionKey: string): WsConnectAction => ({
  type: WS_CONNECT,
  payload: sessionKey,
});

export const wsDisconnect = (): WsDisconnectAction => ({
  type: WS_DISCONNECT,
});

export const wsSendMessage = (message: any): WsSendMessageAction => ({
  type: WS_SEND_MESSAGE,
  payload: message,
});

export const wsStartMonitoring = (channelIds: string[]): WsStartMonitoringAction => ({
  type: WS_START_MONITORING,
  payload: { channelIds },
});

export const wsStopMonitoring = (channelIds: string[]): WsStopMonitoringAction => ({
  type: WS_STOP_MONITORING,
  payload: { channelIds },
});

export default webSocketMiddleware;
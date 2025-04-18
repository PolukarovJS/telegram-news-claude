import logging
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query, Path
from typing import Dict, Any, List, Callable
from datetime import datetime

from services.telegram_service import TelegramService

router = APIRouter()
logger = logging.getLogger(__name__)

# Получаем глобальный экземпляр Telegram-сервиса
from dependencies import telegram_service

# Хранилище активных WebSocket соединений
active_connections: Dict[str, WebSocket] = {}

async def process_websocket_message(data: Dict[str, Any], session_key: str):
    """Обработка сообщений от клиента через WebSocket."""
    message_type = data.get("type")
    
    if message_type == "start_monitoring":
        channel_ids = data.get("channels", [])
        
        # Функция обратного вызова для отправки событий клиенту
        async def send_event(event_data: Dict[str, Any]):
            if session_key in active_connections:
                await active_connections[session_key].send_text(json.dumps(event_data))
        
        # Запускаем мониторинг каналов
        await telegram_service.start_channel_monitoring(
            session_key, channel_ids, send_event
        )
        
        # Отправляем подтверждение
        await active_connections[session_key].send_text(json.dumps({
            "type": "monitoring_started",
            "channels": channel_ids,
            "timestamp": datetime.now().isoformat()
        }))
    
    elif message_type == "stop_monitoring":
        channel_ids = data.get("channels", [])
        
        # Останавливаем мониторинг каналов
        # В реальном приложении здесь будет логика остановки мониторинга
        
        # Отправляем подтверждение
        await active_connections[session_key].send_text(json.dumps({
            "type": "monitoring_stopped",
            "channels": channel_ids,
            "timestamp": datetime.now().isoformat()
        }))
    
    else:
        # Неизвестный тип сообщения
        await active_connections[session_key].send_text(json.dumps({
            "type": "error",
            "message": f"Неизвестный тип сообщения: {message_type}",
            "timestamp": datetime.now().isoformat()
        }))

@router.websocket("/{session_key}")
async def websocket_endpoint(websocket: WebSocket, session_key: str):
    """Эндпоинт для WebSocket соединения."""
    await websocket.accept()
    
    # Проверяем сессию
    if not telegram_service.is_authorized(session_key):
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Неавторизованная сессия",
            "timestamp": datetime.now().isoformat()
        }))
        await websocket.close()
        return
    
    # Сохраняем соединение
    active_connections[session_key] = websocket
    
    try:
        # Отправляем подтверждение соединения
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "Соединение установлено успешно",
            "timestamp": datetime.now().isoformat()
        }))
        
        # Обрабатываем сообщения от клиента
        while True:
            data = await websocket.receive_text()
            
            try:
                # Разбор JSON
                message = json.loads(data)
                
                # Обработка сообщения
                await process_websocket_message(message, session_key)
                
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Некорректный формат данных",
                    "timestamp": datetime.now().isoformat()
                }))
    
    except WebSocketDisconnect:
        # Клиент отключился
        if session_key in active_connections:
            del active_connections[session_key]
        logger.info(f"Клиент отключился: {session_key}")
    
    except Exception as e:
        # Обработка других исключений
        logger.error(f"Ошибка WebSocket соединения: {str(e)}")
        if session_key in active_connections:
            del active_connections[session_key]
        await websocket.close()
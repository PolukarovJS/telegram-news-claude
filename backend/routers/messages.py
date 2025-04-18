import logging
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from typing import Dict, Any, List, Optional
from datetime import datetime

from models.message import MessageInfo, MessageSearch, MessageList
from services.telegram_service import TelegramService

router = APIRouter()
logger = logging.getLogger(__name__)

# Получаем глобальный экземпляр Telegram-сервиса
from dependencies import telegram_service

@router.get("/channels/{channel_id}/messages", response_model=List[MessageInfo])
async def get_channel_messages(
    channel_id: str = Path(..., description="ID канала"),
    session_key: str = Query(..., description="Ключ сессии"),
    limit: int = Query(50, ge=1, le=100, description="Максимальное количество сообщений"),
    offset_id: int = Query(0, ge=0, description="ID сообщения, с которого начинать")
):
    """Получение сообщений канала."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        messages = await telegram_service.get_channel_messages(
            session_key, channel_id, limit, offset_id
        )
        return messages
    except Exception as e:
        logger.error(f"Ошибка получения сообщений канала: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения сообщений канала: {str(e)}")

@router.get("/channels/{channel_id}/messages/{message_id}", response_model=MessageInfo)
async def get_message_by_id(
    channel_id: str = Path(..., description="ID канала"),
    message_id: str = Path(..., description="ID сообщения"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Получение сообщения по ID."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # Получаем все сообщения и ищем нужное
        messages = await telegram_service.get_channel_messages(
            session_key, channel_id, limit=100
        )
        
        for message in messages:
            if message["message_id"] == message_id:
                return message
        
        raise HTTPException(status_code=404, detail="Сообщение не найдено")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения сообщения: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения сообщения: {str(e)}")

@router.get("/search", response_model=MessageList)
async def search_messages(
    query: Optional[str] = Query(None, description="Поисковый запрос"),
    channels: Optional[str] = Query(None, description="Список ID каналов через запятую"),
    date_from: Optional[datetime] = Query(None, description="Начальная дата"),
    date_to: Optional[datetime] = Query(None, description="Конечная дата"),
    limit: int = Query(50, ge=1, le=100, description="Максимальное количество результатов"),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Поиск сообщений по параметрам."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # Преобразуем параметры
        channel_list = channels.split(',') if channels else None
        
        # Пример реализации поиска сообщений
        # В реальном приложении здесь будет более сложная логика
        messages = []
        
        # Для демонстрации возвращаем пустой список
        return MessageList(
            messages=messages,
            total=len(messages)
        )
    except Exception as e:
        logger.error(f"Ошибка поиска сообщений: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка поиска сообщений: {str(e)}")
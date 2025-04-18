import logging
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from typing import Dict, Any, List, Optional
from datetime import datetime

from models.comment import CommentInfo, CommentSearch, CommentList, CommentMetadataUpdate
from services.telegram_service import TelegramService

router = APIRouter()
logger = logging.getLogger(__name__)

# Получаем глобальный экземпляр Telegram-сервиса
from dependencies import telegram_service

@router.get("/channels/{channel_id}/messages/{message_id}/comments", response_model=List[CommentInfo])
async def get_message_comments(
    channel_id: str = Path(..., description="ID канала"),
    message_id: str = Path(..., description="ID сообщения"),
    session_key: str = Query(..., description="Ключ сессии"),
    limit: int = Query(100, ge=1, le=500, description="Максимальное количество комментариев")
):
    """Получение комментариев к сообщению."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        comments = await telegram_service.get_message_comments(
            session_key, channel_id, message_id, limit
        )
        return comments
    except Exception as e:
        logger.error(f"Ошибка получения комментариев: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения комментариев: {str(e)}")

@router.get("/search", response_model=CommentList)
async def search_comments(
    query: Optional[str] = Query(None, description="Поисковый запрос"),
    channels: Optional[str] = Query(None, description="Список ID каналов через запятую"),
    messages: Optional[str] = Query(None, description="Список ID сообщений через запятую"),
    date_from: Optional[datetime] = Query(None, description="Начальная дата"),
    date_to: Optional[datetime] = Query(None, description="Конечная дата"),
    sentiment: Optional[str] = Query(None, description="Тональность комментария"),
    user_tags: Optional[str] = Query(None, description="Список тегов через запятую"),
    limit: int = Query(100, ge=1, le=500, description="Максимальное количество результатов"),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Поиск комментариев по параметрам."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # Преобразуем параметры
        channel_list = channels.split(',') if channels else None
        message_list = messages.split(',') if messages else None
        tag_list = user_tags.split(',') if user_tags else None
        
        # Пример реализации поиска комментариев
        # В реальном приложении здесь будет более сложная логика
        comments = []
        
        # Для демонстрации возвращаем пустой список
        return CommentList(
            comments=comments,
            total=len(comments)
        )
    except Exception as e:
        logger.error(f"Ошибка поиска комментариев: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка поиска комментариев: {str(e)}")

@router.patch("/{comment_id}/metadata", response_model=CommentInfo)
async def update_comment_metadata(
    comment_id: str = Path(..., description="ID комментария"),
    update: CommentMetadataUpdate = Body(..., description="Данные для обновления метаданных"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Обновление метаданных комментария."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # Пример реализации обновления метаданных
        # В реальном приложении здесь будет более сложная логика
        
        # Заглушка для примера
        return {
            "comment_id": comment_id,
            "message_id": "m123456",
            "channel_id": "ch789",
            "user_id": "u456",
            "text": "Пример комментария",
            "date": datetime.now().isoformat(),
            "reactions": [],
            "media": [],
            "is_edited": False,
            "metadata": {
                "sentiment": update.sentiment or "neutral",
                "user_tags": update.user_tags or [],
                "is_bookmarked": update.is_bookmarked or False
            }
        }
    except Exception as e:
        logger.error(f"Ошибка обновления метаданных комментария: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления метаданных комментария: {str(e)}")
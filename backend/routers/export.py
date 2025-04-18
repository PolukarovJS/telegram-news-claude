import logging
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

from models.export import ExportFormat, MessageExportOptions, CommentExportOptions
from services.export_service import ExportService
from services.telegram_service import TelegramService

router = APIRouter()
logger = logging.getLogger(__name__)

# Инициализируем сервис экспорта
export_service = ExportService()

# Получаем глобальный экземпляр Telegram-сервиса
from dependencies import telegram_service

@router.get("/messages")
async def export_messages(
    format: str = Query(..., description="Формат экспорта (csv, json, xlsx)"),
    channel_ids: str = Query(..., description="Список ID каналов через запятую"),
    date_from: Optional[datetime] = Query(None, description="Начальная дата"),
    date_to: Optional[datetime] = Query(None, description="Конечная дата"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Экспорт сообщений в выбранном формате."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # Преобразуем параметры
        channel_list = channel_ids.split(',')
        
        # Получаем сообщения для экспорта
        # В реальном приложении здесь будет логика получения сообщений из базы данных
        messages = []
        
        # Экспортируем в выбранном формате
        if format.lower() == 'csv':
            content = export_service.export_messages_to_csv(messages)
            media_type = "text/csv"
            filename = f"messages_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        elif format.lower() == 'json':
            content = export_service.export_messages_to_json(messages)
            media_type = "application/json"
            filename = f"messages_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        elif format.lower() == 'xlsx':
            content = export_service.export_messages_to_xlsx(messages)
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            filename = f"messages_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        else:
            raise HTTPException(status_code=400, detail="Неподдерживаемый формат экспорта")
        
        # Возвращаем файл
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        logger.error(f"Ошибка экспорта сообщений: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка экспорта сообщений: {str(e)}")

@router.get("/comments")
async def export_comments(
    format: str = Query(..., description="Формат экспорта (csv, json, xlsx)"),
    channel_ids: Optional[str] = Query(None, description="Список ID каналов через запятую"),
    message_ids: Optional[str] = Query(None, description="Список ID сообщений через запятую"),
    date_from: Optional[datetime] = Query(None, description="Начальная дата"),
    date_to: Optional[datetime] = Query(None, description="Конечная дата"),
    sentiment: Optional[str] = Query(None, description="Тональность комментария"),
    user_tags: Optional[str] = Query(None, description="Список тегов через запятую"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Экспорт комментариев в выбранном формате."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # Преобразуем параметры
        channel_list = channel_ids.split(',') if channel_ids else None
        message_list = message_ids.split(',') if message_ids else None
        tag_list = user_tags.split(',') if user_tags else None
        
        # Получаем комментарии для экспорта
        # В реальном приложении здесь будет логика получения комментариев из базы данных
        comments = []
        
        # Экспортируем в выбранном формате
        if format.lower() == 'csv':
            content = export_service.export_comments_to_csv(comments)
            media_type = "text/csv"
            filename = f"comments_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        elif format.lower() == 'json':
            content = export_service.export_comments_to_json(comments)
            media_type = "application/json"
            filename = f"comments_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        elif format.lower() == 'xlsx':
            content = export_service.export_comments_to_xlsx(comments)
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            filename = f"comments_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        else:
            raise HTTPException(status_code=400, detail="Неподдерживаемый формат экспорта")
        
        # Возвращаем файл
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        logger.error(f"Ошибка экспорта комментариев: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка экспорта комментариев: {str(e)}")
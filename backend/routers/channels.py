import logging
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from typing import Dict, Any, List, Optional

from models.channel import ChannelInfo, ChannelUpdate, MonitoringUpdate, ChannelList
from services.telegram_service import TelegramService

router = APIRouter()
logger = logging.getLogger(__name__)

# Получаем глобальный экземпляр Telegram-сервиса
from main import telegram_service

@router.get("/search", response_model=List[ChannelInfo])
async def search_channels(
    query: str = Query(..., description="Поисковый запрос"),
    session_key: str = Query(..., description="Ключ сессии"),
    limit: int = Query(10, ge=1, le=100, description="Максимальное количество результатов")
):
    """Поиск каналов по запросу."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        channels = await telegram_service.search_channels(session_key, query, limit)
        return channels
    except Exception as e:
        logger.error(f"Ошибка поиска каналов: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка поиска каналов: {str(e)}")

@router.get("/{channel_username}", response_model=ChannelInfo)
async def get_channel_info(
    channel_username: str = Path(..., description="Юзернейм канала"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Получение информации о канале по его юзернейму."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        channel_info = await telegram_service.get_channel_info(session_key, channel_username)
        
        if not channel_info:
            raise HTTPException(status_code=404, detail="Канал не найден")
        
        return channel_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения информации о канале: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения информации о канале: {str(e)}")

@router.patch("/{channel_id}/monitoring")
async def update_monitoring_status(
    channel_id: str = Path(..., description="ID канала"),
    update: MonitoringUpdate = Body(..., description="Данные для обновления"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Обновление статуса мониторинга канала."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    # В реальном приложении здесь будет логика обновления статуса мониторинга
    # и запуск/остановка мониторинга канала
    
    return {
        "channel_id": channel_id,
        "is_monitored": update.is_monitored
    }

@router.get("/monitored", response_model=List[ChannelInfo])
async def get_monitored_channels(
    session_key: str = Query(..., description="Ключ сессии")
):
    """Получение списка отслеживаемых каналов."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    # В реальном приложении здесь будет логика получения списка отслеживаемых каналов
    # из базы данных или другого хранилища
    
    return []

@router.post("/monitor")
async def start_monitoring_channels(
    channel_ids: List[str] = Body(..., description="Список ID каналов"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Запуск мониторинга указанных каналов."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    # Здесь будет логика запуска мониторинга каналов
    # Это заглушка для примера
    
    return {
        "status": "started",
        "channels": channel_ids
    }

@router.post("/stop-monitor")
async def stop_monitoring_channels(
    channel_ids: List[str] = Body(..., description="Список ID каналов"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Остановка мониторинга указанных каналов."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    # Здесь будет логика остановки мониторинга каналов
    # Это заглушка для примера
    
    return {
        "status": "stopped",
        "channels": channel_ids
    }
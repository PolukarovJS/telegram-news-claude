import logging
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import Dict, Any, List

from models.user import UserInfo, UserSettings, UserSettingsUpdate
from services.telegram_service import TelegramService

router = APIRouter()
logger = logging.getLogger(__name__)

# Получаем глобальный экземпляр Telegram-сервиса
from dependencies import telegram_service

@router.get("/settings")
async def get_user_settings(
    session_key: str = Query(..., description="Ключ сессии")
):
    """Получение настроек пользователя."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # В реальном приложении здесь будет логика получения настроек из базы данных
        # Это заглушка для примера
        return {
            "settings": {
                "theme": "light",
                "notifications": True,
                "auto_download": False,
                "monitored_channels": []
            }
        }
    except Exception as e:
        logger.error(f"Ошибка получения настроек пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения настроек пользователя: {str(e)}")

@router.patch("/settings")
async def update_user_settings(
    update: UserSettingsUpdate = Body(..., description="Данные для обновления настроек"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Обновление настроек пользователя."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # В реальном приложении здесь будет логика обновления настроек в базе данных
        # Это заглушка для примера
        
        # Получаем текущие настройки
        current_settings = {
            "theme": "light",
            "notifications": True,
            "auto_download": False,
            "monitored_channels": []
        }
        
        # Обновляем настройки
        if update.theme is not None:
            current_settings["theme"] = update.theme
        if update.notifications is not None:
            current_settings["notifications"] = update.notifications
        if update.auto_download is not None:
            current_settings["auto_download"] = update.auto_download
        if update.monitored_channels is not None:
            current_settings["monitored_channels"] = update.monitored_channels
        
        return {
            "settings": current_settings
        }
    except Exception as e:
        logger.error(f"Ошибка обновления настроек пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления настроек пользователя: {str(e)}")

@router.get("/profile")
async def get_user_profile(
    session_key: str = Query(..., description="Ключ сессии")
):
    """Получение профиля пользователя."""
    if not telegram_service.is_authorized(session_key):
        raise HTTPException(status_code=401, detail="Требуется авторизация в Telegram")
    
    try:
        # В реальном приложении здесь будет логика получения профиля из Telegram
        # и базы данных приложения
        # Это заглушка для примера
        
        client = telegram_service.get_client(session_key)
        if not client:
            raise HTTPException(status_code=401, detail="Клиент не найден")
        
        # Получаем информацию о текущем пользователе Telegram
        try:
            me = await client.get_me()
            return {
                "user_id": f"u{me.id}",
                "username": me.username,
                "first_name": me.first_name,
                "last_name": me.last_name,
                "phone": me.phone
            }
        except Exception as e:
            logger.error(f"Ошибка получения информации о пользователе: {str(e)}")
            return {
                "user_id": "unknown",
                "username": "unknown",
                "first_name": "Unknown",
                "last_name": "User",
                "phone": "None"
            }
    except Exception as e:
        logger.error(f"Ошибка получения профиля пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения профиля пользователя: {str(e)}")
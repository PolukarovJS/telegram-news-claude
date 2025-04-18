import logging
from fastapi import APIRouter, HTTPException, Depends, Body, Query
from typing import Dict, Any

from models.auth import TelegramAuth, SessionInfo
from services.telegram_service import TelegramService
from config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Получаем глобальный экземпляр Telegram-сервиса
# В реальном проекте лучше использовать dependency injection
from dependencies import telegram_service

@router.post("/send_code", response_model=SessionInfo)
async def send_code(auth: TelegramAuth):
    """Отправляет код подтверждения на указанный номер телефона."""
    if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
        raise HTTPException(status_code=500, detail="API_ID или API_HASH не настроены")
    
    try:
        session_key, _ = await telegram_service.create_client(auth.phone)
        return SessionInfo(
            session_key=session_key,
            message="Код подтверждения отправлен"
        )
    except Exception as e:
        logger.error(f"Ошибка отправки кода: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Ошибка отправки кода: {str(e)}")

@router.post("/sign_in", response_model=SessionInfo)
async def sign_in(auth: TelegramAuth):
    """Выполняет вход в аккаунт с помощью кода подтверждения и опционального пароля."""
    if not auth.session_key:
        raise HTTPException(status_code=400, detail="Требуется ключ сессии")
    
    if not auth.code:
        raise HTTPException(status_code=400, detail="Требуется код подтверждения")
    
    try:
        result = await telegram_service.sign_in(auth.session_key, auth.code, auth.password)
        
        if result:
            return SessionInfo(
                session_key=auth.session_key,
                message="Успешная авторизация"
            )
        else:
            raise HTTPException(status_code=400, detail="Ошибка авторизации")
    except Exception as e:
        logger.error(f"Ошибка авторизации: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Ошибка авторизации: {str(e)}")

@router.post("/logout")
async def logout(auth: TelegramAuth):
    """Выполняет выход из аккаунта и удаляет сессию."""
    if not auth.session_key:
        raise HTTPException(status_code=400, detail="Требуется ключ сессии")
    
    try:
        result = await telegram_service.logout(auth.session_key)
        
        if result:
            return {"message": "Выход выполнен успешно"}
        else:
            raise HTTPException(status_code=400, detail="Ошибка при выходе")
    except Exception as e:
        logger.error(f"Ошибка при выходе: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Ошибка при выходе: {str(e)}")

@router.get("/status")
async def check_auth_status(session_key: str = Query(..., description="Ключ сессии")):
    """Проверяет статус авторизации для указанной сессии."""
    is_auth = telegram_service.is_authorized(session_key)
    
    return {
        "session_key": session_key,
        "is_authorized": is_auth
    }
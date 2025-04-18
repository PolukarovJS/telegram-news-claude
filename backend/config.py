import os
from typing import List
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

class Settings:
    """Настройки приложения."""
    
    def __init__(self):
        # Настройки приложения
        self.APP_NAME: str = "Telegram News API"
        self.DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
        self.API_PREFIX: str = "/api/v1"
        
        # Настройки Telegram API
        self.TELEGRAM_API_ID: str = os.getenv("TELEGRAM_API_ID", "")
        self.TELEGRAM_API_HASH: str = os.getenv("TELEGRAM_API_HASH", "")
        
        # Настройки сервера
        self.HOST: str = os.getenv("HOST", "0.0.0.0")
        self.PORT: int = int(os.getenv("PORT", "8000"))
        
        # Настройки CORS
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
        self.CORS_ORIGINS: List[str] = cors_origins.split(",")
        
        # Настройки сессий
        self.SESSION_DIR: str = "sessions"
        self.SESSION_EXPIRATION_DAYS: int = 30
        
        # Настройки логирования
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
        
        # Настройки кеширования
        self.CACHE_TTL: int = 300  # 5 минут

# Создаем глобальный экземпляр настроек
settings = Settings()

# Создаем директории, если они не существуют
os.makedirs(settings.SESSION_DIR, exist_ok=True)
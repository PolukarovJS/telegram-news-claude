import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from routers import auth, channels, messages, comments, analysis, export, user, websocket

from services.telegram_service import TelegramService

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Инициализация глобального экземпляра Telegram-сервиса
from dependencies import telegram_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Код, выполняемый при запуске приложения
    logger.info("Инициализация приложения Telegram News API")
    
    yield
    
    # Код, выполняемый при остановке приложения
    logger.info("Завершение работы приложения")
    # Закрываем все активные клиенты Telegram
    await telegram_service.close_all_clients()

# Создание экземпляра FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="API для мониторинга новостных каналов в Telegram",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров
app.include_router(auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Аутентификация"])
app.include_router(channels.router, prefix=f"{settings.API_PREFIX}/channels", tags=["Каналы"])
app.include_router(messages.router, prefix=f"{settings.API_PREFIX}/messages", tags=["Сообщения"])
app.include_router(comments.router, prefix=f"{settings.API_PREFIX}/comments", tags=["Комментарии"])
app.include_router(analysis.router, prefix=f"{settings.API_PREFIX}/analysis", tags=["Анализ"])
app.include_router(export.router, prefix=f"{settings.API_PREFIX}/export", tags=["Экспорт"])
app.include_router(user.router, prefix=f"{settings.API_PREFIX}/user", tags=["Пользователь"])
app.include_router(websocket.router, prefix=f"{settings.API_PREFIX}/ws", tags=["WebSocket"])

@app.get("/", tags=["Статус"])
async def root():
    """Корневой endpoint для проверки статуса API."""
    return {"status": "online", "app_name": settings.APP_NAME}

@app.get("/health", tags=["Статус"])
async def health_check():
    """Endpoint для проверки работоспособности API."""
    return {"status": "healthy"}

# Запуск приложения при прямом вызове файла
if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Запуск сервера на {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
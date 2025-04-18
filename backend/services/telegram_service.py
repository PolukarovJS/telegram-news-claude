import os
import logging
import asyncio
import json
import uuid
from typing import Dict, List, Optional, Any, Callable, Tuple
from datetime import datetime, timedelta
from telethon import TelegramClient, events
from telethon.errors import SessionPasswordNeededError, FloodWaitError, PhoneNumberInvalidError
from telethon.tl.types import Channel, Message, User, PeerChannel, Dialog
from telethon.tl.functions.channels import GetFullChannelRequest, GetChannelsRequest
from telethon.tl.functions.messages import GetDiscussionMessageRequest, GetRepliesRequest
from telethon.tl.functions.users import GetFullUserRequest

from config import settings

logger = logging.getLogger(__name__)

class TelegramService:
    """Сервис для работы с Telegram API через Telethon."""
    
    def __init__(self):
        """Инициализация сервиса."""
        self.active_clients: Dict[str, TelegramClient] = {}
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.websocket_connections: Dict[str, Any] = {}
        self.channel_watchers: Dict[str, Dict[str, Any]] = {}
        
        # Создаем директорию для сессий, если она не существует
        os.makedirs(settings.SESSION_DIR, exist_ok=True)
        
        logger.info("Инициализирован сервис Telegram")
    
    async def create_client(self, phone: str) -> Tuple[str, TelegramClient]:
        """Создает нового клиента Telegram и отправляет код.
        
        Args:
            phone: Номер телефона для аутентификации
            
        Returns:
            Tuple[str, TelegramClient]: Ключ сессии и экземпляр клиента
        
        Raises:
            PhoneNumberInvalidError: Если номер телефона недействителен
            FloodWaitError: Если слишком много запросов к API
        """
        session_key = str(uuid.uuid4())
        session_path = os.path.join(settings.SESSION_DIR, f"{session_key}.session")
        
        # Инициализируем клиент
        client = TelegramClient(
            session_path,
            api_id=int(settings.TELEGRAM_API_ID),
            api_hash=settings.TELEGRAM_API_HASH
        )
        
        try:
            await client.connect()
            
            # Сохраняем информацию о сессии
            self.active_clients[session_key] = client
            self.active_sessions[session_key] = {
                "phone": phone,
                "created_at": datetime.now(),
                "expires_at": datetime.now() + timedelta(days=settings.SESSION_EXPIRATION_DAYS),
                "is_authorized": False
            }
            
            # Отправляем код авторизации
            await client.send_code_request(phone)
            
            return session_key, client
            
        except (PhoneNumberInvalidError, FloodWaitError) as e:
            # В случае ошибки закрываем клиент и пробрасываем исключение
            await client.disconnect()
            if os.path.exists(session_path):
                os.remove(session_path)
            raise e
    
    async def sign_in(self, session_key: str, code: str, password: Optional[str] = None) -> bool:
        """Авторизация в Telegram с кодом и опциональным паролем.
        
        Args:
            session_key: Ключ сессии
            code: Код авторизации
            password: Пароль двухфакторной аутентификации (опционально)
            
        Returns:
            bool: True, если авторизация успешна
            
        Raises:
            ValueError: Если сессия недействительна
            SessionPasswordNeededError: Если требуется пароль
        """
        if session_key not in self.active_clients:
            raise ValueError("Недействительная сессия")
        
        client = self.active_clients[session_key]
        
        try:
            # Пытаемся войти с кодом
            await client.sign_in(self.active_sessions[session_key]["phone"], code)
            self.active_sessions[session_key]["is_authorized"] = True
            return True
            
        except SessionPasswordNeededError:
            # Если требуется пароль, и он предоставлен
            if password:
                await client.sign_in(password=password)
                self.active_sessions[session_key]["is_authorized"] = True
                return True
            else:
                # Если пароль требуется, но не предоставлен
                raise SessionPasswordNeededError()
    
    async def logout(self, session_key: str) -> bool:
        """Выход из аккаунта Telegram.
        
        Args:
            session_key: Ключ сессии
            
        Returns:
            bool: True, если выход успешен
        """
        if session_key not in self.active_clients:
            return False
        
        client = self.active_clients[session_key]
        session_path = os.path.join(settings.SESSION_DIR, f"{session_key}.session")
        
        try:
            # Останавливаем все активные наблюдатели за каналами
            if session_key in self.channel_watchers:
                for channel_id, watcher in self.channel_watchers[session_key].items():
                    if watcher.get("task") and not watcher["task"].done():
                        watcher["task"].cancel()
            
            # Выполняем выход
            await client.log_out()
            
            # Удаляем сессию
            if os.path.exists(session_path):
                os.remove(session_path)
            
            # Удаляем клиент из активных
            del self.active_clients[session_key]
            if session_key in self.active_sessions:
                del self.active_sessions[session_key]
            if session_key in self.channel_watchers:
                del self.channel_watchers[session_key]
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при выходе из аккаунта: {str(e)}")
            return False
    
    async def close_all_clients(self):
        """Закрывает все активные клиенты при завершении работы приложения."""
        for session_key, client in list(self.active_clients.items()):
            try:
                # Останавливаем все наблюдатели
                if session_key in self.channel_watchers:
                    for channel_id, watcher in self.channel_watchers[session_key].items():
                        if watcher.get("task") and not watcher["task"].done():
                            watcher["task"].cancel()
                
                # Закрываем соединение
                await client.disconnect()
                logger.info(f"Клиент {session_key} успешно закрыт")
                
            except Exception as e:
                logger.error(f"Ошибка при закрытии клиента {session_key}: {str(e)}")
    
    def get_client(self, session_key: str) -> Optional[TelegramClient]:
        """Получает клиент по ключу сессии.
        
        Args:
            session_key: Ключ сессии
            
        Returns:
            Optional[TelegramClient]: Клиент или None, если сессия не найдена
        """
        return self.active_clients.get(session_key)
    
    def is_authorized(self, session_key: str) -> bool:
        """Проверяет, авторизован ли клиент.
        
        Args:
            session_key: Ключ сессии
            
        Returns:
            bool: True, если клиент авторизован
        """
        if session_key not in self.active_sessions:
            return False
        return self.active_sessions[session_key].get("is_authorized", False)
    
    async def search_channels(self, session_key: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Поиск каналов по запросу.
        
        Args:
            session_key: Ключ сессии
            query: Поисковый запрос
            limit: Максимальное количество результатов
            
        Returns:
            List[Dict[str, Any]]: Список найденных каналов
        """
        client = self.get_client(session_key)
        if not client:
            return []
        
        results = []
        
        try:
            # Получаем все диалоги (медленно, но надежно)
            dialogs = await client.get_dialogs(limit=100)
            
            # Фильтруем только каналы по запросу
            for dialog in dialogs:
                entity = dialog.entity
                if isinstance(entity, Channel) and query.lower() in dialog.title.lower():
                    # Получаем дополнительную информацию о канале
                    try:
                        full_channel = await client(GetFullChannelRequest(entity))
                        participants_count = full_channel.full_chat.participants_count
                    except Exception:
                        participants_count = None
                    
                    # Формируем данные канала
                    channel_data = {
                        "channel_id": str(entity.id),
                        "title": entity.title,
                        "username": getattr(entity, "username", None),
                        "description": getattr(entity, "about", None),
                        "subscribers_count": participants_count,
                        "category": "news",  # По умолчанию все каналы в категории "news"
                        "is_monitored": False
                    }
                    
                    results.append(channel_data)
                    
                    # Ограничиваем количество результатов
                    if len(results) >= limit:
                        break
            
            return results
            
        except Exception as e:
            logger.error(f"Ошибка при поиске каналов: {str(e)}")
            return []
    
    async def get_channel_info(self, session_key: str, channel_username: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о канале по его юзернейму.
        
        Args:
            session_key: Ключ сессии
            channel_username: Юзернейм канала
            
        Returns:
            Optional[Dict[str, Any]]: Информация о канале или None
        """
        client = self.get_client(session_key)
        if not client:
            return None
        
        try:
            # Получаем сущность канала
            entity = await client.get_entity(channel_username)
            
            if isinstance(entity, Channel):
                # Получаем полную информацию о канале
                full_channel = await client(GetFullChannelRequest(entity))
                
                # Формируем данные канала
                channel_data = {
                    "channel_id": str(entity.id),
                    "title": entity.title,
                    "username": getattr(entity, "username", None),
                    "description": getattr(entity, "about", None),
                    "subscribers_count": full_channel.full_chat.participants_count,
                    "category": "news",  # По умолчанию
                    "is_monitored": False
                }
                
                return channel_data
            
            return None
            
        except Exception as e:
            logger.error(f"Ошибка при получении информации о канале: {str(e)}")
            return None
    
    async def get_channel_messages(
        self, 
        session_key: str, 
        channel_id: str, 
        limit: int = 50, 
        offset_id: int = 0
    ) -> List[Dict[str, Any]]:
        """Получает сообщения канала.
        
        Args:
            session_key: Ключ сессии
            channel_id: ID канала
            limit: Максимальное количество сообщений
            offset_id: ID сообщения, с которого начинать
            
        Returns:
            List[Dict[str, Any]]: Список сообщений
        """
        client = self.get_client(session_key)
        if not client:
            return []
        
        try:
            # Преобразуем строковый ID в число
            channel_id_int = int(channel_id)
            
            # Получаем сущность канала
            channel = await client.get_entity(channel_id_int)
            
            # Получаем сообщения
            messages = await client.get_messages(
                channel,
                limit=limit,
                offset_id=offset_id
            )
            
            results = []
            for msg in messages:
                if not msg:
                    continue
                
                # Обрабатываем медиа
                media_urls = []
                if msg.media:
                    # В реальном приложении здесь будет логика сохранения и получения медиа
                    media_urls.append(f"media_placeholder_{msg.id}")
                
                # Формируем данные сообщения
                message_data = {
                    "message_id": f"m{msg.id}",
                    "channel_id": channel_id,
                    "date": msg.date.isoformat(),
                    "text": msg.text or "",
                    "media": media_urls,
                    "views": getattr(msg, "views", None),
                    "forwards": getattr(msg, "forwards", None),
                    "comments_count": 0,  # Будет заполнено отдельным запросом
                    "last_comment_date": None
                }
                
                # Пытаемся получить количество комментариев
                try:
                    replies = await client(GetRepliesRequest(
                        peer=channel,
                        msg_id=msg.id,
                        offset_id=0,
                        offset_date=None,
                        add_offset=0,
                        limit=1,
                        max_id=0,
                        min_id=0,
                        hash=0
                    ))
                    
                    message_data["comments_count"] = replies.count
                    
                    if replies.messages and replies.messages[0].date:
                        message_data["last_comment_date"] = replies.messages[0].date.isoformat()
                except Exception:
                    # Игнорируем ошибки, если комментарии недоступны
                    pass
                
                results.append(message_data)
            
            return results
            
        except Exception as e:
            logger.error(f"Ошибка при получении сообщений канала: {str(e)}")
            return []
    
    async def get_message_comments(
        self, 
        session_key: str, 
        channel_id: str, 
        message_id: str, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Получает комментарии к сообщению.
        
        Args:
            session_key: Ключ сессии
            channel_id: ID канала
            message_id: ID сообщения
            limit: Максимальное количество комментариев
            
        Returns:
            List[Dict[str, Any]]: Список комментариев
        """
        client = self.get_client(session_key)
        if not client:
            return []
        
        try:
            # Извлекаем числовой ID из строки формата "m12345"
            msg_id = int(message_id.replace("m", ""))
            channel_id_int = int(channel_id)
            
            # Получаем сущность канала
            channel = await client.get_entity(channel_id_int)
            
            # Получаем обсуждение
            discussion = None
            try:
                discussion = await client(GetDiscussionMessageRequest(
                    peer=channel,
                    msg_id=msg_id
                ))
            except Exception as e:
                logger.warning(f"Не удалось получить обсуждение: {str(e)}")
            
            comments = []
            
            # Если получили обсуждение
            if discussion and discussion.messages:
                discussion_peer = discussion.messages[0].peer_id
                
                # Получаем комментарии из обсуждения
                replies = await client.get_messages(
                    discussion_peer,
                    limit=limit
                )
                
                comments = replies
            else:
                # Если обсуждение не найдено, пробуем получить ответы напрямую
                comments = await client.get_messages(
                    channel,
                    reply_to=msg_id,
                    limit=limit
                )
            
            results = []
            for comment in comments:
                if not comment:
                    continue
                
                # Обрабатываем медиа
                media_urls = []
                if comment.media:
                    # В реальном приложении здесь будет логика сохранения и получения медиа
                    media_urls.append(f"media_placeholder_{comment.id}")
                
                # Получаем информацию о авторе комментария
                user_id = "anonymous"
                if comment.from_id:
                    try:
                        author = await client.get_entity(comment.from_id)
                        user_id = f"u{author.id}"
                    except:
                        pass
                
                # Обрабатываем реакции
                reactions = []
                if hasattr(comment, "reactions") and comment.reactions:
                    for reaction in comment.reactions.results:
                        reactions.append({
                            "type": reaction.reaction.emoticon,
                            "count": reaction.count
                        })
                
                # Формируем данные комментария
                comment_data = {
                    "comment_id": f"c{comment.id}",
                    "message_id": message_id,
                    "channel_id": channel_id,
                    "user_id": user_id,
                    "reply_to_comment_id": f"c{comment.reply_to_msg_id}" if comment.reply_to_msg_id else None,
                    "text": comment.text or "",
                    "date": comment.date.isoformat(),
                    "reactions": reactions,
                    "media": media_urls,
                    "is_edited": bool(comment.edit_date),
                    "metadata": {
                        "sentiment": "neutral",  # По умолчанию
                        "user_tags": [],
                        "is_bookmarked": False
                    }
                }
                
                results.append(comment_data)
            
            return results
            
        except Exception as e:
            logger.error(f"Ошибка при получении комментариев: {str(e)}")
            return []
    
    async def start_channel_monitoring(
        self, 
        session_key: str, 
        channel_ids: List[str], 
        callback: Callable[[Dict[str, Any]], None]
    ) -> Dict[str, bool]:
        """Запускает мониторинг каналов.
        
        Args:
            session_key: Ключ сессии
            channel_ids: Список ID каналов для мониторинга
            callback: Функция обратного вызова для обработки новых сообщений
            
        Returns:
            Dict[str, bool]: Статус запуска мониторинга для каждого канала
        """
        client = self.get_client(session_key)
        if not client:
            return {channel_id: False for channel_id in channel_ids}
        
        # Инициализируем словарь наблюдателей для сессии
        if session_key not in self.channel_watchers:
            self.channel_watchers[session_key] = {}
        
        results = {}
        
        for channel_id in channel_ids:
            try:
                # Проверяем, не запущен ли уже мониторинг
                if channel_id in self.channel_watchers[session_key]:
                    watcher = self.channel_watchers[session_key][channel_id]
                    if watcher.get("task") and not watcher["task"].done():
                        # Мониторинг уже запущен
                        results[channel_id] = True
                        continue
                
                # Получаем сущность канала
                channel_id_int = int(channel_id)
                channel = await client.get_entity(channel_id_int)
                
                # Создаем обработчик новых сообщений
                @client.on(events.NewMessage(chats=[channel_id_int]))
                async def new_message_handler(event):
                    try:
                        message = event.message
                        
                        # Обрабатываем медиа
                        media_urls = []
                        if message.media:
                            media_urls.append(f"media_placeholder_{message.id}")
                        
                        # Формируем данные сообщения
                        message_data = {
                            "type": "new_message",
                            "data": {
                                "message_id": f"m{message.id}",
                                "channel_id": channel_id,
                                "date": message.date.isoformat(),
                                "text": message.text or "",
                                "media": media_urls,
                                "views": getattr(message, "views", 0),
                                "forwards": getattr(message, "forwards", 0),
                                "comments_count": 0,
                                "last_comment_date": None
                            }
                        }
                        
                        # Вызываем функцию обратного вызова
                        callback(message_data)
                    except Exception as e:
                        logger.error(f"Ошибка обработки нового сообщения: {str(e)}")
                
                # Создаем задачу мониторинга
                async def monitor_task():
                    try:
                        # Мониторинг запущен, ждем завершения
                        while True:
                            await asyncio.sleep(60)
                    except asyncio.CancelledError:
                        # Задача отменена
                        client.remove_event_handler(new_message_handler)
                        logger.info(f"Мониторинг канала {channel_id} остановлен")
                
                # Запускаем задачу
                task = asyncio.create_task(monitor_task())
                
                # Сохраняем информацию о наблюдателе
                self.channel_watchers[session_key][channel_id] = {
                    "task": task,
                    "handler": new_message_handler,
                    "started_at": datetime.now()
                }
                
                results[channel_id] = True
                
            except Exception as e:
                logger.error(f"Ошибка при запуске мониторинга канала {channel_id}: {str(e)}")
                results[channel_id] = False
        
        return results
    
    async def stop_channel_monitoring(
        self, 
        session_key: str, 
        channel_ids: List[str]
    ) -> Dict[str, bool]:
        """Останавливает мониторинг каналов.
        
        Args:
            session_key: Ключ сессии
            channel_ids: Список ID каналов для остановки мониторинга
            
        Returns:
            Dict[str, bool]: Статус остановки мониторинга для каждого канала
        """
        if session_key not in self.channel_watchers:
            return {channel_id: False for channel_id in channel_ids}
        
        results = {}
        
        for channel_id in channel_ids:
            try:
                if channel_id not in self.channel_watchers[session_key]:
                    results[channel_id] = False
                    continue
                
                watcher = self.channel_watchers[session_key][channel_id]
                
                # Отменяем задачу мониторинга
                if watcher.get("task") and not watcher["task"].done():
                    watcher["task"].cancel()
                
                # Удаляем обработчик событий
                if watcher.get("handler"):
                    client = self.get_client(session_key)
                    if client:
                        client.remove_event_handler(watcher["handler"])
                
                # Удаляем информацию о наблюдателе
                del self.channel_watchers[session_key][channel_id]
                
                results[channel_id] = True
                
            except Exception as e:
                logger.error(f"Ошибка при остановке мониторинга канала {channel_id}: {str(e)}")
                results[channel_id] = False
        
        return results
    
    def register_websocket_connection(self, session_key: str, websocket: Any) -> bool:
        """Регистрирует WebSocket соединение для сессии.
        
        Args:
            session_key: Ключ сессии
            websocket: Объект WebSocket соединения
            
        Returns:
            bool: True, если регистрация успешна
        """
        if session_key not in self.active_sessions:
            return False
        
        self.websocket_connections[session_key] = websocket
        return True
    
    def remove_websocket_connection(self, session_key: str) -> bool:
        """Удаляет WebSocket соединение для сессии.
        
        Args:
            session_key: Ключ сессии
            
        Returns:
            bool: True, если удаление успешно
        """
        if session_key not in self.websocket_connections:
            return False
        
        del self.websocket_connections[session_key]
        return True
    
    async def send_websocket_message(self, session_key: str, message: Dict[str, Any]) -> bool:
        """Отправляет сообщение через WebSocket.
        
        Args:
            session_key: Ключ сессии
            message: Сообщение для отправки
            
        Returns:
            bool: True, если отправка успешна
        """
        if session_key not in self.websocket_connections:
            return False
        
        try:
            websocket = self.websocket_connections[session_key]
            await websocket.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Ошибка отправки WebSocket сообщения: {str(e)}")
            return False
    
    async def get_user_info(self, session_key: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о текущем пользователе.
        
        Args:
            session_key: Ключ сессии
            
        Returns:
            Optional[Dict[str, Any]]: Информация о пользователе или None
        """
        client = self.get_client(session_key)
        if not client:
            return None
        
        try:
            # Получаем информацию о текущем пользователе
            me = await client.get_me()
            
            user_data = {
                "user_id": f"u{me.id}",
                "username": me.username,
                "first_name": me.first_name,
                "last_name": me.last_name,
                "phone": me.phone,
                "is_bot": me.bot,
                "photo_url": None  # Telethon не предоставляет URL фото напрямую
            }
            
            return user_data
            
        except Exception as e:
            logger.error(f"Ошибка при получении информации о пользователе: {str(e)}")
            return None
    
    async def get_message_by_id(
        self, 
        session_key: str, 
        channel_id: str, 
        message_id: str
    ) -> Optional[Dict[str, Any]]:
        """Получает информацию о сообщении по ID.
        
        Args:
            session_key: Ключ сессии
            channel_id: ID канала
            message_id: ID сообщения
            
        Returns:
            Optional[Dict[str, Any]]: Информация о сообщении или None
        """
        client = self.get_client(session_key)
        if not client:
            return None
        
        try:
            # Извлекаем числовой ID из строки формата "m12345"
            msg_id = int(message_id.replace("m", ""))
            channel_id_int = int(channel_id)
            
            # Получаем сущность канала
            channel = await client.get_entity(channel_id_int)
            
            # Получаем сообщение
            message = await client.get_messages(
                channel,
                ids=msg_id
            )
            
            if not message:
                return None
            
            # Обрабатываем медиа
            media_urls = []
            if message.media:
                # В реальном приложении здесь будет логика сохранения и получения медиа
                media_urls.append(f"media_placeholder_{message.id}")
            
            # Формируем данные сообщения
            message_data = {
                "message_id": f"m{message.id}",
                "channel_id": channel_id,
                "date": message.date.isoformat(),
                "text": message.text or "",
                "media": media_urls,
                "views": getattr(message, "views", None),
                "forwards": getattr(message, "forwards", None),
                "comments_count": 0,  # Будет заполнено отдельным запросом
                "last_comment_date": None
            }
            
            # Пытаемся получить количество комментариев
            try:
                replies = await client(GetRepliesRequest(
                    peer=channel,
                    msg_id=message.id,
                    offset_id=0,
                    offset_date=None,
                    add_offset=0,
                    limit=1,
                    max_id=0,
                    min_id=0,
                    hash=0
                ))
                
                message_data["comments_count"] = replies.count
                
                if replies.messages and replies.messages[0].date:
                    message_data["last_comment_date"] = replies.messages[0].date.isoformat()
            except Exception:
                # Игнорируем ошибки, если комментарии недоступны
                pass
            
            return message_data
            
        except Exception as e:
            logger.error(f"Ошибка при получении сообщения: {str(e)}")
            return None
    
    async def search_messages(
        self, 
        session_key: str, 
        query: Optional[str] = None,
        channel_ids: Optional[List[str]] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Поиск сообщений по параметрам.
        
        Args:
            session_key: Ключ сессии
            query: Поисковый запрос
            channel_ids: Список ID каналов
            date_from: Начальная дата
            date_to: Конечная дата
            limit: Максимальное количество результатов
            offset: Смещение для пагинации
            
        Returns:
            List[Dict[str, Any]]: Список найденных сообщений
        """
        client = self.get_client(session_key)
        if not client:
            return []
        
        results = []
        
        # Если не указаны каналы и запрос, возвращаем пустой список
        if not channel_ids and not query:
            return []
        
        try:
            # Обрабатываем каждый канал отдельно
            for channel_id in channel_ids or []:
                try:
                    # Преобразуем строковый ID в число
                    channel_id_int = int(channel_id)
                    
                    # Получаем сущность канала
                    channel = await client.get_entity(channel_id_int)
                    
                    # Формируем параметры поиска
                    search_params = {
                        "entity": channel,
                        "limit": limit,
                        "offset_id": 0,
                        "reverse": True  # Сначала новые сообщения
                    }
                    
                    # Добавляем поисковый запрос, если указан
                    if query:
                        search_params["search"] = query
                    
                    # Фильтруем по дате
                    if date_from or date_to:
                        # Telethon не поддерживает фильтрацию по дате в API,
                        # поэтому мы получаем сообщения и фильтруем их вручную
                        messages = await client.get_messages(**search_params)
                        
                        filtered_messages = []
                        for msg in messages:
                            # Проверяем дату сообщения
                            if date_from and msg.date < date_from:
                                continue
                            if date_to and msg.date > date_to:
                                continue
                            
                            filtered_messages.append(msg)
                        
                        messages = filtered_messages
                    else:
                        # Если нет фильтрации по дате, просто получаем сообщения
                        messages = await client.get_messages(**search_params)
                    
                    # Применяем смещение
                    messages = messages[offset:offset+limit]
                    
                    # Обрабатываем полученные сообщения
                    for msg in messages:
                        if not msg:
                            continue
                        
                        # Обрабатываем медиа
                        media_urls = []
                        if msg.media:
                            media_urls.append(f"media_placeholder_{msg.id}")
                        
                        # Формируем данные сообщения
                        message_data = {
                            "message_id": f"m{msg.id}",
                            "channel_id": channel_id,
                            "date": msg.date.isoformat(),
                            "text": msg.text or "",
                            "media": media_urls,
                            "views": getattr(msg, "views", None),
                            "forwards": getattr(msg, "forwards", None),
                            "comments_count": 0,
                            "last_comment_date": None
                        }
                        
                        results.append(message_data)
                        
                        # Ограничиваем количество результатов
                        if len(results) >= limit:
                            break
                
                except Exception as e:
                    logger.error(f"Ошибка при поиске сообщений в канале {channel_id}: {str(e)}")
                    continue
                
                # Ограничиваем количество результатов
                if len(results) >= limit:
                    break
            
            return results
            
        except Exception as e:
            logger.error(f"Ошибка при поиске сообщений: {str(e)}")
            return []
    
    async def search_comments(
        self,
        session_key: str,
        query: Optional[str] = None,
        channel_ids: Optional[List[str]] = None,
        message_ids: Optional[List[str]] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        sentiment: Optional[str] = None,
        user_tags: Optional[List[str]] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Поиск комментариев по параметрам.
        
        Args:
            session_key: Ключ сессии
            query: Поисковый запрос
            channel_ids: Список ID каналов
            message_ids: Список ID сообщений
            date_from: Начальная дата
            date_to: Конечная дата
            sentiment: Тональность комментария
            user_tags: Список тегов пользователя
            limit: Максимальное количество результатов
            offset: Смещение для пагинации
            
        Returns:
            List[Dict[str, Any]]: Список найденных комментариев
        """
        client = self.get_client(session_key)
        if not client:
            return []
        
        results = []
        
        # Если не указаны каналы, сообщения и запрос, возвращаем пустой список
        if not channel_ids and not message_ids and not query:
            return []
        
        try:
            # Если указаны конкретные сообщения, ищем комментарии к ним
            if message_ids:
                for message_id in message_ids:
                    # Находим канал сообщения, если не указан явно
                    message_channel_id = None
                    if channel_ids and len(channel_ids) == 1:
                        message_channel_id = channel_ids[0]
                    else:
                        # В реальном приложении здесь будет логика поиска канала сообщения
                        continue
                        
                    if not message_channel_id:
                        continue
                        
                    # Получаем комментарии к сообщению
                    comments = await self.get_message_comments(
                        session_key, message_channel_id, message_id, limit=limit
                    )
                    
                    # Фильтруем по запросу
                    if query:
                        comments = [
                            comment for comment in comments
                            if query.lower() in comment.get("text", "").lower()
                        ]
                    
                    # Фильтруем по дате
                    if date_from or date_to:
                        filtered_comments = []
                        for comment in comments:
                            comment_date = datetime.fromisoformat(comment.get("date", ""))
                            if date_from and comment_date < date_from:
                                continue
                            if date_to and comment_date > date_to:
                                continue
                            filtered_comments.append(comment)
                        comments = filtered_comments
                    
                    # Фильтруем по тональности
                    if sentiment:
                        comments = [
                            comment for comment in comments
                            if comment.get("metadata", {}).get("sentiment") == sentiment
                        ]
                    
                    # Фильтруем по тегам пользователя
                    if user_tags:
                        filtered_comments = []
                        for comment in comments:
                            comment_tags = comment.get("metadata", {}).get("user_tags", [])
                            if any(tag in comment_tags for tag in user_tags):
                                filtered_comments.append(comment)
                        comments = filtered_comments
                    
                    # Добавляем результаты
                    results.extend(comments)
                    
                    # Ограничиваем количество результатов
                    if len(results) >= limit:
                        results = results[:limit]
                        break
            
            # Если указаны каналы, ищем комментарии в них
            elif channel_ids:
                for channel_id in channel_ids:
                    # Получаем сообщения канала
                    messages = await self.get_channel_messages(
                        session_key, channel_id, limit=20, offset_id=0
                    )
                    
                    # Для каждого сообщения получаем комментарии
                    for message in messages:
                        message_id = message.get("message_id")
                        if not message_id:
                            continue
                        
                        # Получаем комментарии к сообщению
                        comments = await self.get_message_comments(
                            session_key, channel_id, message_id, limit=limit
                        )
                        
                        # Применяем те же фильтры, что и выше
                        if query:
                            comments = [
                                comment for comment in comments
                                if query.lower() in comment.get("text", "").lower()
                            ]
                        
                        if date_from or date_to:
                            filtered_comments = []
                            for comment in comments:
                                comment_date = datetime.fromisoformat(comment.get("date", ""))
                                if date_from and comment_date < date_from:
                                    continue
                                if date_to and comment_date > date_to:
                                    continue
                                filtered_comments.append(comment)
                            comments = filtered_comments
                        
                        if sentiment:
                            comments = [
                                comment for comment in comments
                                if comment.get("metadata", {}).get("sentiment") == sentiment
                            ]
                        
                        if user_tags:
                            filtered_comments = []
                            for comment in comments:
                                comment_tags = comment.get("metadata", {}).get("user_tags", [])
                                if any(tag in comment_tags for tag in user_tags):
                                    filtered_comments.append(comment)
                            comments = filtered_comments
                        
                        # Добавляем результаты
                        results.extend(comments)
                        
                        # Ограничиваем количество результатов
                        if len(results) >= limit:
                            results = results[:limit]
                            break
                    
                    # Ограничиваем количество результатов
                    if len(results) >= limit:
                        results = results[:limit]
                        break
            
            # Применяем смещение
            if offset > 0:
                results = results[offset:offset+limit]
            else:
                results = results[:limit]
            
            return results
            
        except Exception as e:
            logger.error(f"Ошибка при поиске комментариев: {str(e)}")
            return []
    
    async def update_comment_metadata(
        self,
        session_key: str,
        comment_id: str,
        metadata: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Обновляет метаданные комментария.
        
        Args:
            session_key: Ключ сессии
            comment_id: ID комментария
            metadata: Обновляемые метаданные
            
        Returns:
            Optional[Dict[str, Any]]: Обновленный комментарий или None
        """
        # В реальном приложении здесь будет обновление метаданных в базе данных
        # Так как у нас нет базы данных, здесь будет заглушка
        
        client = self.get_client(session_key)
        if not client:
            return None
        
        try:
            # Извлекаем числовой ID из строки формата "c12345"
            comment_id_int = int(comment_id.replace("c", ""))
            
            # В реальном приложении мы бы получили комментарий из базы данных и обновили его
            # Здесь мы просто возвращаем примерный объект с обновленными метаданными
            
            return {
                "comment_id": comment_id,
                "message_id": "m0",  # Заглушка
                "channel_id": "0",  # Заглушка
                "user_id": "u0",  # Заглушка
                "text": "Текст комментария",  # Заглушка
                "date": datetime.now().isoformat(),
                "reactions": [],
                "media": [],
                "is_edited": False,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Ошибка при обновлении метаданных комментария: {str(e)}")
            return None
    
    async def export_messages(
        self,
        session_key: str,
        channel_ids: List[str],
        format: str = "json",
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Optional[bytes]:
        """Экспортирует сообщения в выбранном формате.
        
        Args:
            session_key: Ключ сессии
            channel_ids: Список ID каналов
            format: Формат экспорта (json, csv, xlsx)
            date_from: Начальная дата
            date_to: Конечная дата
            
        Returns:
            Optional[bytes]: Данные в выбранном формате или None
        """
        # Получаем сообщения для экспорта
        messages = []
        for channel_id in channel_ids:
            channel_messages = await self.get_channel_messages(
                session_key, channel_id, limit=100, offset_id=0
            )
            messages.extend(channel_messages)
        
        # Фильтруем по дате
        if date_from or date_to:
            filtered_messages = []
            for message in messages:
                message_date = datetime.fromisoformat(message.get("date", ""))
                if date_from and message_date < date_from:
                    continue
                if date_to and message_date > date_to:
                    continue
                filtered_messages.append(message)
            messages = filtered_messages
        
        # Если сообщений нет, возвращаем None
        if not messages:
            return None
        
        # Экспортируем в выбранном формате
        if format == "json":
            # Экспорт в JSON
            return json.dumps(messages, ensure_ascii=False, indent=2).encode('utf-8')
        elif format == "csv":
            # Экспорт в CSV
            csv_data = "message_id,channel_id,date,text,views,forwards,comments_count\n"
            for message in messages:
                csv_data += f"{message.get('message_id', '')},{message.get('channel_id', '')},{message.get('date', '')},\"{message.get('text', '').replace('\"', '\"\"')}\",{message.get('views', 0)},{message.get('forwards', 0)},{message.get('comments_count', 0)}\n"
            return csv_data.encode('utf-8')
        else:
            # Неподдерживаемый формат
            return None
    
    async def export_comments(
        self,
        session_key: str,
        format: str = "json",
        channel_ids: Optional[List[str]] = None,
        message_ids: Optional[List[str]] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        sentiment: Optional[str] = None,
        user_tags: Optional[List[str]] = None
    ) -> Optional[bytes]:
        """Экспортирует комментарии в выбранном формате.
        
        Args:
            session_key: Ключ сессии
            format: Формат экспорта (json, csv, xlsx)
            channel_ids: Список ID каналов
            message_ids: Список ID сообщений
            date_from: Начальная дата
            date_to: Конечная дата
            sentiment: Тональность комментария
            user_tags: Список тегов пользователя
            
        Returns:
            Optional[bytes]: Данные в выбранном формате или None
        """
        # Получаем комментарии для экспорта
        comments = await self.search_comments(
            session_key=session_key,
            channel_ids=channel_ids,
            message_ids=message_ids,
            date_from=date_from,
            date_to=date_to,
            sentiment=sentiment,
            user_tags=user_tags,
            limit=1000  # Экспортируем больше комментариев
        )
        
        # Если комментариев нет, возвращаем None
        if not comments:
            return None
        
        # Экспортируем в выбранном формате
        if format == "json":
            # Экспорт в JSON
            return json.dumps(comments, ensure_ascii=False, indent=2).encode('utf-8')
        elif format == "csv":
            # Экспорт в CSV
            csv_data = "comment_id,message_id,channel_id,user_id,text,date,is_edited,sentiment\n"
            for comment in comments:
                csv_data += f"{comment.get('comment_id', '')},{comment.get('message_id', '')},{comment.get('channel_id', '')},{comment.get('user_id', '')},\"{comment.get('text', '').replace('\"', '\"\"')}\",{comment.get('date', '')},{comment.get('is_edited', False)},{comment.get('metadata', {}).get('sentiment', 'neutral')}\n"
            return csv_data.encode('utf-8')
        else:
            # Неподдерживаемый формат
            return None
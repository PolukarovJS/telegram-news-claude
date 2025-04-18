import logging
import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class DataService:
    """Сервис для работы с данными."""
    
    def __init__(self, data_dir: str = "data"):
        """Инициализация сервиса.
        
        Args:
            data_dir: Директория для хранения данных
        """
        self.data_dir = data_dir
        
        # Создаем директорию, если она не существует
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "channels"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "messages"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "comments"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "users"), exist_ok=True)
        
        logger.info("Инициализирован сервис данных")
    
    # Методы для работы с каналами
    
    def save_channel(self, channel_data: Dict[str, Any]) -> bool:
        """Сохраняет информацию о канале.
        
        Args:
            channel_data: Данные канала
            
        Returns:
            bool: True, если сохранение успешно
        """
        channel_id = channel_data.get("channel_id")
        if not channel_id:
            logger.error("Отсутствует channel_id в данных канала")
            return False
        
        file_path = os.path.join(self.data_dir, "channels", f"{channel_id}.json")
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(channel_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            logger.error(f"Ошибка при сохранении канала {channel_id}: {str(e)}")
            return False
    
    def get_channel(self, channel_id: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о канале.
        
        Args:
            channel_id: ID канала
            
        Returns:
            Optional[Dict[str, Any]]: Данные канала или None
        """
        file_path = os.path.join(self.data_dir, "channels", f"{channel_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Ошибка при чтении канала {channel_id}: {str(e)}")
            return None
    
    def get_all_channels(self) -> List[Dict[str, Any]]:
        """Получает информацию о всех каналах.
        
        Returns:
            List[Dict[str, Any]]: Список данных каналов
        """
        channels_dir = os.path.join(self.data_dir, "channels")
        channels = []
        
        for filename in os.listdir(channels_dir):
            if filename.endswith(".json"):
                try:
                    file_path = os.path.join(channels_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        channel_data = json.load(f)
                        channels.append(channel_data)
                except Exception as e:
                    logger.error(f"Ошибка при чтении канала {filename}: {str(e)}")
        
        return channels
    
    def get_monitored_channels(self) -> List[Dict[str, Any]]:
        """Получает информацию о отслеживаемых каналах.
        
        Returns:
            List[Dict[str, Any]]: Список данных отслеживаемых каналов
        """
        channels = self.get_all_channels()
        return [channel for channel in channels if channel.get("is_monitored", False)]
    
    def delete_channel(self, channel_id: str) -> bool:
        """Удаляет информацию о канале.
        
        Args:
            channel_id: ID канала
            
        Returns:
            bool: True, если удаление успешно
        """
        file_path = os.path.join(self.data_dir, "channels", f"{channel_id}.json")
        
        if not os.path.exists(file_path):
            return False
        
        try:
            os.remove(file_path)
            return True
        except Exception as e:
            logger.error(f"Ошибка при удалении канала {channel_id}: {str(e)}")
            return False
    
    # Методы для работы с сообщениями
    
    def save_message(self, message_data: Dict[str, Any]) -> bool:
        """Сохраняет информацию о сообщении.
        
        Args:
            message_data: Данные сообщения
            
        Returns:
            bool: True, если сохранение успешно
        """
        message_id = message_data.get("message_id")
        if not message_id:
            logger.error("Отсутствует message_id в данных сообщения")
            return False
        
        file_path = os.path.join(self.data_dir, "messages", f"{message_id}.json")
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(message_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            logger.error(f"Ошибка при сохранении сообщения {message_id}: {str(e)}")
            return False
    
    def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о сообщении.
        
        Args:
            message_id: ID сообщения
            
        Returns:
            Optional[Dict[str, Any]]: Данные сообщения или None
        """
        file_path = os.path.join(self.data_dir, "messages", f"{message_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Ошибка при чтении сообщения {message_id}: {str(e)}")
            return None
    
    def get_channel_messages(self, channel_id: str) -> List[Dict[str, Any]]:
        """Получает сообщения канала.
        
        Args:
            channel_id: ID канала
            
        Returns:
            List[Dict[str, Any]]: Список сообщений канала
        """
        messages_dir = os.path.join(self.data_dir, "messages")
        messages = []
        
        for filename in os.listdir(messages_dir):
            if filename.endswith(".json"):
                try:
                    file_path = os.path.join(messages_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        message_data = json.load(f)
                        if message_data.get("channel_id") == channel_id:
                            messages.append(message_data)
                except Exception as e:
                    logger.error(f"Ошибка при чтении сообщения {filename}: {str(e)}")
        
        return sorted(messages, key=lambda x: x.get("date", ""), reverse=True)
    
    def search_messages(self, query: Optional[str] = None, channel_ids: Optional[List[str]] = None, 
                       date_from: Optional[str] = None, date_to: Optional[str] = None) -> List[Dict[str, Any]]:
        """Поиск сообщений по параметрам.
        
        Args:
            query: Поисковый запрос
            channel_ids: Список ID каналов
            date_from: Начальная дата
            date_to: Конечная дата
            
        Returns:
            List[Dict[str, Any]]: Список найденных сообщений
        """
        messages_dir = os.path.join(self.data_dir, "messages")
        results = []
        
        for filename in os.listdir(messages_dir):
            if filename.endswith(".json"):
                try:
                    file_path = os.path.join(messages_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        message_data = json.load(f)
                        
                        # Фильтрация по каналам
                        if channel_ids and message_data.get("channel_id") not in channel_ids:
                            continue
                        
                        # Фильтрация по тексту
                        if query and query.lower() not in message_data.get("text", "").lower():
                            continue
                        
                        # Фильтрация по датам
                        message_date = message_data.get("date", "")
                        if date_from and message_date < date_from:
                            continue
                        if date_to and message_date > date_to:
                            continue
                        
                        results.append(message_data)
                except Exception as e:
                    logger.error(f"Ошибка при чтении сообщения {filename}: {str(e)}")
        
        return sorted(results, key=lambda x: x.get("date", ""), reverse=True)
    
    def delete_message(self, message_id: str) -> bool:
        """Удаляет информацию о сообщении.
        
        Args:
            message_id: ID сообщения
            
        Returns:
            bool: True, если удаление успешно
        """
        file_path = os.path.join(self.data_dir, "messages", f"{message_id}.json")
        
        if not os.path.exists(file_path):
            return False
        
        try:
            os.remove(file_path)
            return True
        except Exception as e:
            logger.error(f"Ошибка при удалении сообщения {message_id}: {str(e)}")
            return False
    
    # Методы для работы с комментариями
    
    def save_comment(self, comment_data: Dict[str, Any]) -> bool:
        """Сохраняет информацию о комментарии.
        
        Args:
            comment_data: Данные комментария
            
        Returns:
            bool: True, если сохранение успешно
        """
        comment_id = comment_data.get("comment_id")
        if not comment_id:
            logger.error("Отсутствует comment_id в данных комментария")
            return False
        
        file_path = os.path.join(self.data_dir, "comments", f"{comment_id}.json")
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(comment_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            logger.error(f"Ошибка при сохранении комментария {comment_id}: {str(e)}")
            return False
    
    def get_comment(self, comment_id: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о комментарии.
        
        Args:
            comment_id: ID комментария
            
        Returns:
            Optional[Dict[str, Any]]: Данные комментария или None
        """
        file_path = os.path.join(self.data_dir, "comments", f"{comment_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Ошибка при чтении комментария {comment_id}: {str(e)}")
            return None
    
    def get_message_comments(self, message_id: str) -> List[Dict[str, Any]]:
        """Получает комментарии сообщения.
        
        Args:
            message_id: ID сообщения
            
        Returns:
            List[Dict[str, Any]]: Список комментариев сообщения
        """
        comments_dir = os.path.join(self.data_dir, "comments")
        comments = []
        
        for filename in os.listdir(comments_dir):
            if filename.endswith(".json"):
                try:
                    file_path = os.path.join(comments_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        comment_data = json.load(f)
                        if comment_data.get("message_id") == message_id:
                            comments.append(comment_data)
                except Exception as e:
                    logger.error(f"Ошибка при чтении комментария {filename}: {str(e)}")
        
        return sorted(comments, key=lambda x: x.get("date", ""))
    
    def search_comments(self, query: Optional[str] = None, channel_ids: Optional[List[str]] = None,
                       message_ids: Optional[List[str]] = None, date_from: Optional[str] = None,
                       date_to: Optional[str] = None, sentiment: Optional[str] = None,
                       user_tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Поиск комментариев по параметрам.
        
        Args:
            query: Поисковый запрос
            channel_ids: Список ID каналов
            message_ids: Список ID сообщений
            date_from: Начальная дата
            date_to: Конечная дата
            sentiment: Тональность комментария
            user_tags: Список тегов
            
        Returns:
            List[Dict[str, Any]]: Список найденных комментариев
        """
        comments_dir = os.path.join(self.data_dir, "comments")
        results = []
        
        for filename in os.listdir(comments_dir):
            if filename.endswith(".json"):
                try:
                    file_path = os.path.join(comments_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        comment_data = json.load(f)
                        
                        # Фильтрация по каналам
                        if channel_ids and comment_data.get("channel_id") not in channel_ids:
                            continue
                        
                        # Фильтрация по сообщениям
                        if message_ids and comment_data.get("message_id") not in message_ids:
                            continue
                        
                        # Фильтрация по тексту
                        if query and query.lower() not in comment_data.get("text", "").lower():
                            continue
                        
                        # Фильтрация по датам
                        comment_date = comment_data.get("date", "")
                        if date_from and comment_date < date_from:
                            continue
                        if date_to and comment_date > date_to:
                            continue
                        
                        # Фильтрация по тональности
                        if sentiment and comment_data.get("metadata", {}).get("sentiment") != sentiment:
                            continue
                        
                        # Фильтрация по тегам
                        if user_tags:
                            comment_tags = comment_data.get("metadata", {}).get("user_tags", [])
                            if not any(tag in comment_tags for tag in user_tags):
                                continue
                        
                        results.append(comment_data)
                except Exception as e:
                    logger.error(f"Ошибка при чтении комментария {filename}: {str(e)}")
        
        return sorted(results, key=lambda x: x.get("date", ""))
    
    def update_comment_metadata(self, comment_id: str, metadata: Dict[str, Any]) -> bool:
        """Обновляет метаданные комментария.
        
        Args:
            comment_id: ID комментария
            metadata: Новые метаданные
            
        Returns:
            bool: True, если обновление успешно
        """
        comment_data = self.get_comment(comment_id)
        if not comment_data:
            return False
        
        # Обновляем метаданные
        current_metadata = comment_data.get("metadata", {})
        current_metadata.update(metadata)
        comment_data["metadata"] = current_metadata
        
        return self.save_comment(comment_data)
    
    def delete_comment(self, comment_id: str) -> bool:
        """Удаляет информацию о комментарии.
        
        Args:
            comment_id: ID комментария
            
        Returns:
            bool: True, если удаление успешно
        """
        file_path = os.path.join(self.data_dir, "comments", f"{comment_id}.json")
        
        if not os.path.exists(file_path):
            return False
        
        try:
            os.remove(file_path)
            return True
        except Exception as e:
            logger.error(f"Ошибка при удалении комментария {comment_id}: {str(e)}")
            return False
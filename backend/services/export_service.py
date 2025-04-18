import logging
import json
import csv
import os
import pandas as pd
from typing import List, Dict, Any, Optional
from io import StringIO, BytesIO
from datetime import datetime

logger = logging.getLogger(__name__)

class ExportService:
    """Сервис для экспорта данных."""
    
    def __init__(self, export_dir: str = "exports"):
        """Инициализация сервиса.
        
        Args:
            export_dir: Директория для хранения экспортированных данных
        """
        self.export_dir = export_dir
        
        # Создаем директорию, если она не существует
        os.makedirs(self.export_dir, exist_ok=True)
        
        logger.info("Инициализирован сервис экспорта")
    
    def export_messages_to_csv(self, messages: List[Dict[str, Any]]) -> bytes:
        """Экспортирует сообщения в формат CSV.
        
        Args:
            messages: Список сообщений
            
        Returns:
            bytes: Данные в формате CSV
        """
        if not messages:
            return b"message_id,channel_id,date,text,views,forwards,comments_count\n"
        
        # Преобразуем в DataFrame
        df = pd.DataFrame(messages)
        
        # Выбираем нужные столбцы
        columns = ["message_id", "channel_id", "date", "text", "views", "forwards", "comments_count"]
        df = df[columns]
        
        # Экспортируем в CSV
        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        
        return csv_buffer.getvalue().encode('utf-8')
    
    def export_messages_to_json(self, messages: List[Dict[str, Any]]) -> bytes:
        """Экспортирует сообщения в формат JSON.
        
        Args:
            messages: Список сообщений
            
        Returns:
            bytes: Данные в формате JSON
        """
        return json.dumps(messages, ensure_ascii=False, indent=2).encode('utf-8')
    
    def export_messages_to_xlsx(self, messages: List[Dict[str, Any]]) -> bytes:
        """Экспортирует сообщения в формат XLSX.
        
        Args:
            messages: Список сообщений
            
        Returns:
            bytes: Данные в формате XLSX
        """
        if not messages:
            df = pd.DataFrame(columns=["message_id", "channel_id", "date", "text", "views", "forwards", "comments_count"])
        else:
            # Преобразуем в DataFrame
            df = pd.DataFrame(messages)
            
            # Выбираем нужные столбцы
            columns = ["message_id", "channel_id", "date", "text", "views", "forwards", "comments_count"]
            for col in columns:
                if col not in df.columns:
                    df[col] = None
            df = df[columns]
        
        # Экспортируем в XLSX
        xlsx_buffer = BytesIO()
        df.to_excel(xlsx_buffer, index=False)
        xlsx_buffer.seek(0)
        
        return xlsx_buffer.getvalue()
    
    def export_comments_to_csv(self, comments: List[Dict[str, Any]]) -> bytes:
        """Экспортирует комментарии в формат CSV.
        
        Args:
            comments: Список комментариев
            
        Returns:
            bytes: Данные в формате CSV
        """
        if not comments:
            return b"comment_id,message_id,channel_id,user_id,text,date,is_edited,sentiment\n"
        
        # Подготавливаем данные
        prepared_comments = []
        for comment in comments:
            prepared_comment = {
                "comment_id": comment.get("comment_id", ""),
                "message_id": comment.get("message_id", ""),
                "channel_id": comment.get("channel_id", ""),
                "user_id": comment.get("user_id", ""),
                "text": comment.get("text", ""),
                "date": comment.get("date", ""),
                "is_edited": comment.get("is_edited", False),
                "sentiment": comment.get("metadata", {}).get("sentiment", "neutral")
            }
            prepared_comments.append(prepared_comment)
        
        # Преобразуем в DataFrame
        df = pd.DataFrame(prepared_comments)
        
        # Экспортируем в CSV
        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        
        return csv_buffer.getvalue().encode('utf-8')
    
    def export_comments_to_json(self, comments: List[Dict[str, Any]]) -> bytes:
        """Экспортирует комментарии в формат JSON.
        
        Args:
            comments: Список комментариев
            
        Returns:
            bytes: Данные в формате JSON
        """
        return json.dumps(comments, ensure_ascii=False, indent=2).encode('utf-8')
    
    def export_comments_to_xlsx(self, comments: List[Dict[str, Any]]) -> bytes:
        """Экспортирует комментарии в формат XLSX.
        
        Args:
            comments: Список комментариев
            
        Returns:
            bytes: Данные в формате XLSX
        """
        if not comments:
            df = pd.DataFrame(columns=["comment_id", "message_id", "channel_id", "user_id", "text", "date", "is_edited", "sentiment"])
        else:
            # Подготавливаем данные
            prepared_comments = []
            for comment in comments:
                prepared_comment = {
                    "comment_id": comment.get("comment_id", ""),
                    "message_id": comment.get("message_id", ""),
                    "channel_id": comment.get("channel_id", ""),
                    "user_id": comment.get("user_id", ""),
                    "text": comment.get("text", ""),
                    "date": comment.get("date", ""),
                    "is_edited": comment.get("is_edited", False),
                    "sentiment": comment.get("metadata", {}).get("sentiment", "neutral")
                }
                prepared_comments.append(prepared_comment)
            
            # Преобразуем в DataFrame
            df = pd.DataFrame(prepared_comments)
        
        # Экспортируем в XLSX
        xlsx_buffer = BytesIO()
        df.to_excel(xlsx_buffer, index=False)
        xlsx_buffer.seek(0)
        
        return xlsx_buffer.getvalue()
    
    def export_channels_to_csv(self, channels: List[Dict[str, Any]]) -> bytes:
        """Экспортирует каналы в формат CSV.
        
        Args:
            channels: Список каналов
            
        Returns:
            bytes: Данные в формате CSV
        """
        if not channels:
            return b"channel_id,title,username,description,subscribers_count,category,is_monitored\n"
        
        # Преобразуем в DataFrame
        df = pd.DataFrame(channels)
        
        # Выбираем нужные столбцы
        columns = ["channel_id", "title", "username", "description", "subscribers_count", "category", "is_monitored"]
        for col in columns:
            if col not in df.columns:
                df[col] = None
        df = df[columns]
        
        # Экспортируем в CSV
        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        
        return csv_buffer.getvalue().encode('utf-8')
    
    def export_channels_to_json(self, channels: List[Dict[str, Any]]) -> bytes:
        """Экспортирует каналы в формат JSON.
        
        Args:
            channels: Список каналов
            
        Returns:
            bytes: Данные в формате JSON
        """
        return json.dumps(channels, ensure_ascii=False, indent=2).encode('utf-8')
    
    def export_channels_to_xlsx(self, channels: List[Dict[str, Any]]) -> bytes:
        """Экспортирует каналы в формат XLSX.
        
        Args:
            channels: Список каналов
            
        Returns:
            bytes: Данные в формате XLSX
        """
        if not channels:
            df = pd.DataFrame(columns=["channel_id", "title", "username", "description", "subscribers_count", "category", "is_monitored"])
        else:
            # Преобразуем в DataFrame
            df = pd.DataFrame(channels)
            
            # Выбираем нужные столбцы
            columns = ["channel_id", "title", "username", "description", "subscribers_count", "category", "is_monitored"]
            for col in columns:
                if col not in df.columns:
                    df[col] = None
            df = df[columns]
        
        # Экспортируем в XLSX
        xlsx_buffer = BytesIO()
        df.to_excel(xlsx_buffer, index=False)
        xlsx_buffer.seek(0)
        
        return xlsx_buffer.getvalue()
    
    def save_export_file(self, data: bytes, filename: str) -> str:
        """Сохраняет данные экспорта в файл.
        
        Args:
            data: Данные экспорта
            filename: Имя файла
            
        Returns:
            str: Путь к сохраненному файлу
        """
        filepath = os.path.join(self.export_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(data)
        
        return filepath
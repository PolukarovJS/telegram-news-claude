from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class ExportFormat(str, Enum):
    """Доступные форматы экспорта."""
    CSV = "csv"
    JSON = "json"
    XLSX = "xlsx"

class MessageExportOptions(BaseModel):
    """Параметры экспорта сообщений."""
    format: ExportFormat
    channel_ids: List[str]
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class CommentExportOptions(BaseModel):
    """Параметры экспорта комментариев."""
    format: ExportFormat
    channel_ids: Optional[List[str]] = None
    message_ids: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sentiment: Optional[str] = None
    user_tags: Optional[List[str]] = None
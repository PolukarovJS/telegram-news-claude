from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class MessageInfo(BaseModel):
    """Модель для информации о сообщении."""
    message_id: str
    channel_id: str
    date: str
    text: str
    media: List[str] = []
    views: Optional[int] = None
    forwards: Optional[int] = None
    comments_count: Optional[int] = None
    last_comment_date: Optional[str] = None

class MessageSearch(BaseModel):
    """Модель для поиска сообщений."""
    query: Optional[str] = None
    channels: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = Field(50, ge=1, le=100)
    offset: int = Field(0, ge=0)

class MessageList(BaseModel):
    """Модель для списка сообщений."""
    messages: List[MessageInfo]
    total: int
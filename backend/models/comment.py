from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Reaction(BaseModel):
    """Модель для реакции на комментарий."""
    type: str
    count: int

class CommentMetadata(BaseModel):
    """Модель для метаданных комментария."""
    sentiment: Optional[str] = "neutral"
    user_tags: List[str] = []
    is_bookmarked: bool = False

class CommentInfo(BaseModel):
    """Модель для информации о комментарии."""
    comment_id: str
    message_id: str
    channel_id: str
    user_id: str
    reply_to_comment_id: Optional[str] = None
    text: str
    date: str
    reactions: List[Reaction] = []
    media: List[str] = []
    is_edited: bool = False
    metadata: CommentMetadata = CommentMetadata()

class CommentSearch(BaseModel):
    """Модель для поиска комментариев."""
    query: Optional[str] = None
    channels: Optional[List[str]] = None
    messages: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sentiment: Optional[str] = None
    user_tags: Optional[List[str]] = None
    limit: int = Field(100, ge=1, le=500)
    offset: int = Field(0, ge=0)

class CommentList(BaseModel):
    """Модель для списка комментариев."""
    comments: List[CommentInfo]
    total: int

class CommentMetadataUpdate(BaseModel):
    """Модель для обновления метаданных комментария."""
    sentiment: Optional[str] = None
    user_tags: Optional[List[str]] = None
    is_bookmarked: Optional[bool] = None
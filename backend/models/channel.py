from pydantic import BaseModel, Field
from typing import Optional, List

class ChannelInfo(BaseModel):
    """Модель для информации о канале."""
    channel_id: str
    title: str
    username: Optional[str] = None
    description: Optional[str] = None
    subscribers_count: Optional[int] = None
    category: Optional[str] = "news"
    is_monitored: bool = False

class ChannelUpdate(BaseModel):
    """Модель для обновления информации о канале."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_monitored: Optional[bool] = None

class ChannelSearch(BaseModel):
    """Модель для поиска каналов."""
    query: str
    limit: int = Field(10, ge=1, le=100)

class MonitoringUpdate(BaseModel):
    """Модель для обновления статуса мониторинга канала."""
    is_monitored: bool

class ChannelList(BaseModel):
    """Модель для списка каналов."""
    channels: List[ChannelInfo]
    total: int
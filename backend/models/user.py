from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

class UserSettings(BaseModel):
    """Модель для настроек пользователя."""
    theme: str = "light"
    notifications: bool = True
    auto_download: bool = False
    monitored_channels: List[str] = []

class UserSubscription(BaseModel):
    """Модель для информации о подписке пользователя."""
    plan: str
    expires: datetime

class UserStats(BaseModel):
    """Модель для статистики пользователя."""
    saved_comments: int = 0
    tagged_comments: int = 0
    last_login: datetime = datetime.now()

class UserInfo(BaseModel):
    """Модель для информации о пользователе."""
    user_id: str
    email: EmailStr
    name: str
    settings: UserSettings = UserSettings()
    subscription: Optional[UserSubscription] = None
    stats: UserStats = UserStats()

class UserSettingsUpdate(BaseModel):
    """Модель для обновления настроек пользователя."""
    theme: Optional[str] = None
    notifications: Optional[bool] = None
    auto_download: Optional[bool] = None
    monitored_channels: Optional[List[str]] = None
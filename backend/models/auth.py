from pydantic import BaseModel, validator
from typing import Optional

class TelegramAuth(BaseModel):
    """Модель для аутентификации в Telegram."""
    phone: str
    password: Optional[str] = None
    code: Optional[str] = None
    session_key: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, value):
        """Валидация номера телефона."""
        # Удаляем все символы, кроме цифр и +
        cleaned_phone = ''.join(filter(lambda x: x.isdigit() or x == '+', value))
        
        # Телефон должен начинаться с +
        if not cleaned_phone.startswith('+'):
            cleaned_phone = '+' + cleaned_phone
        
        # Проверяем минимальную длину
        if len(cleaned_phone) < 10:
            raise ValueError("Некорректный номер телефона")
        
        return cleaned_phone

class SessionInfo(BaseModel):
    """Информация о сессии."""
    session_key: str
    message: str
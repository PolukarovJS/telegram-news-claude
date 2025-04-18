from pydantic import BaseModel, Field
from typing import List, Optional

class SentimentAnalysisRequest(BaseModel):
    """Запрос на анализ тональности текста."""
    text: str

class SentimentAnalysisResponse(BaseModel):
    """Результат анализа тональности текста."""
    sentiment: str  # positive, negative, neutral
    score: float

class KeywordExtractionRequest(BaseModel):
    """Запрос на извлечение ключевых слов из текста."""
    text: str
    limit: int = 5

class KeywordExtractionResponse(BaseModel):
    """Результат извлечения ключевых слов из текста."""
    keywords: List[str]
import logging
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import Dict, Any, List

from models.analysis import SentimentAnalysisRequest, SentimentAnalysisResponse, KeywordExtractionRequest, KeywordExtractionResponse
from services.analysis_service import AnalysisService

router = APIRouter()
logger = logging.getLogger(__name__)

# Инициализируем сервис анализа
analysis_service = AnalysisService()

@router.post("/sentiment", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(
    request: SentimentAnalysisRequest,
    session_key: str = Query(..., description="Ключ сессии")
):
    """Анализ тональности текста."""
    try:
        sentiment, score = analysis_service.analyze_sentiment(request.text)
        return SentimentAnalysisResponse(
            sentiment=sentiment,
            score=score
        )
    except Exception as e:
        logger.error(f"Ошибка анализа тональности: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка анализа тональности: {str(e)}")

@router.post("/keywords", response_model=KeywordExtractionResponse)
async def extract_keywords(
    request: KeywordExtractionRequest,
    session_key: str = Query(..., description="Ключ сессии")
):
    """Извлечение ключевых слов из текста."""
    try:
        keywords = analysis_service.extract_keywords(request.text, request.limit)
        return KeywordExtractionResponse(
            keywords=keywords
        )
    except Exception as e:
        logger.error(f"Ошибка извлечения ключевых слов: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка извлечения ключевых слов: {str(e)}")

@router.post("/summarize")
async def summarize_text(
    text: str = Body(..., description="Текст для резюмирования"),
    sentences: int = Query(3, ge=1, le=10, description="Количество предложений"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Создание краткого резюме текста."""
    try:
        summary = analysis_service.summarize_text(text, sentences)
        return {
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Ошибка создания резюме: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка создания резюме: {str(e)}")

@router.post("/categorize")
async def categorize_text(
    text: str = Body(..., description="Текст для категоризации"),
    session_key: str = Query(..., description="Ключ сессии")
):
    """Определение категории текста."""
    try:
        category = analysis_service.categorize_text(text)
        return {
            "category": category
        }
    except Exception as e:
        logger.error(f"Ошибка определения категории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка определения категории: {str(e)}")
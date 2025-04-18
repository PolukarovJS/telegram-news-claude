import logging
import re
import nltk
from typing import List, Dict, Tuple
from textblob import TextBlob
from collections import Counter

# Скачиваем необходимые ресурсы для NLTK
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

logger = logging.getLogger(__name__)

class AnalysisService:
    """Сервис для анализа текста."""
    
    def __init__(self):
        """Инициализация сервиса."""
        self.stopwords = set(nltk.corpus.stopwords.words('english') + 
                         nltk.corpus.stopwords.words('russian'))
        logger.info("Инициализирован сервис анализа")
    
    def analyze_sentiment(self, text: str) -> Tuple[str, float]:
        """Анализирует тональность текста.
        
        Args:
            text: Текст для анализа
            
        Returns:
            Tuple[str, float]: Тональность (positive, negative, neutral) и оценка
        """
        if not text.strip():
            return "neutral", 0.0
        
        try:
            # Анализ тональности с помощью TextBlob
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            # Классификация тональности
            if polarity > 0.1:
                sentiment = "positive"
            elif polarity < -0.1:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            return sentiment, polarity
        except Exception as e:
            logger.error(f"Ошибка при анализе тональности: {str(e)}")
            return "neutral", 0.0
    
    def extract_keywords(self, text: str, limit: int = 5) -> List[str]:
        """Извлекает ключевые слова из текста.
        
        Args:
            text: Текст для анализа
            limit: Максимальное количество ключевых слов
            
        Returns:
            List[str]: Список ключевых слов
        """
        if not text.strip():
            return []
        
        try:
            # Токенизация и очистка текста
            words = nltk.word_tokenize(text.lower())
            
            # Удаление пунктуации и стоп-слов
            words = [word for word in words 
                    if word.isalpha() and word not in self.stopwords and len(word) > 2]
            
            # Подсчет частоты слов
            word_freq = Counter(words)
            
            # Выбор самых частых слов
            keywords = [word for word, count in word_freq.most_common(limit)]
            
            return keywords
        except Exception as e:
            logger.error(f"Ошибка при извлечении ключевых слов: {str(e)}")
            return []
    
    def categorize_text(self, text: str) -> str:
        """Определяет категорию текста.
        
        Args:
            text: Текст для анализа
            
        Returns:
            str: Категория текста
        """
        # В реальном приложении здесь будет более сложная логика классификации
        text = text.lower()
        
        categories = {
            "politics": ["политика", "выборы", "президент", "парламент", "правительство"],
            "economics": ["экономика", "финансы", "рынок", "бюджет", "инфляция"],
            "sports": ["спорт", "футбол", "хоккей", "матч", "чемпионат"],
            "technology": ["технологии", "инновации", "компьютер", "интернет", "цифровые"],
            "culture": ["культура", "искусство", "музыка", "кино", "литература"],
            "science": ["наука", "исследование", "открытие", "ученые", "эксперимент"]
        }
        
        scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in text)
            scores[category] = score
        
        # Выбираем категорию с наивысшим счетом
        if all(score == 0 for score in scores.values()):
            return "other"
        
        return max(scores.items(), key=lambda x: x[1])[0]
    
    def summarize_text(self, text: str, sentences: int = 3) -> str:
        """Создает краткое резюме текста.
        
        Args:
            text: Текст для анализа
            sentences: Количество предложений в резюме
            
        Returns:
            str: Резюме текста
        """
        if not text.strip():
            return ""
        
        try:
            # Разбиваем текст на предложения
            sentence_list = nltk.sent_tokenize(text)
            
            # Если предложений меньше, чем запрошено, возвращаем весь текст
            if len(sentence_list) <= sentences:
                return text
            
            # Нормализуем частоту слов
            word_frequencies = {}
            for word in nltk.word_tokenize(text.lower()):
                if word.isalpha() and word not in self.stopwords:
                    if word not in word_frequencies:
                        word_frequencies[word] = 1
                    else:
                        word_frequencies[word] += 1
            
            # Нормализуем частоты
            max_frequency = max(word_frequencies.values()) if word_frequencies else 1
            for word in word_frequencies:
                word_frequencies[word] = word_frequencies[word] / max_frequency
            
            # Вычисляем оценки для каждого предложения
            sentence_scores = {}
            for i, sentence in enumerate(sentence_list):
                for word in nltk.word_tokenize(sentence.lower()):
                    if word in word_frequencies:
                        if i not in sentence_scores:
                            sentence_scores[i] = word_frequencies[word]
                        else:
                            sentence_scores[i] += word_frequencies[word]
            
            # Выбираем предложения с наивысшими оценками
            summary_indices = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:sentences]
            summary_indices.sort()  # Сортируем по порядку в исходном тексте
            
            # Формируем резюме
            summary = ' '.join([sentence_list[i] for i in summary_indices])
            
            return summary
        except Exception as e:
            logger.error(f"Ошибка при создании резюме: {str(e)}")
            return text.split('.')[0] + '.' if '.' in text else text  # Возвращаем первое предложение
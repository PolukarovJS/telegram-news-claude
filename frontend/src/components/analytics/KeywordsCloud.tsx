// src/components/analytics/KeywordsCloud.tsx
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Comment } from '../../types';

const CloudContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 200px;
`;

const Keyword = styled.div<{ size: number; color: string }>`
  font-size: ${props => props.size}px;
  color: ${props => props.color};
  padding: 5px 10px;
  margin: 5px;
  border-radius: 3px;
  transition: transform 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
    background-color: ${props => props.theme.colors.backgroundLight};
  }
`;

interface KeywordsCloudProps {
  comments: Comment[];
}

const KeywordsCloud: React.FC<KeywordsCloudProps> = ({ comments }) => {
  const keywords = useMemo(() => {
    // Сбор всех слов из комментариев
    const words: Record<string, number> = {};
    const stopWords = new Set(['и', 'в', 'на', 'с', 'по', 'из', 'к', 'а', 'но', 'за', 'что', 'как', 'это', 'так', 'его', 'ее']);
    
    comments.forEach(comment => {
      const text = comment.text.toLowerCase();
      // Разбиваем текст на слова
      const wordsInComment = text.split(/\s+/).filter(word => 
        word.length > 3 && !stopWords.has(word) && !/^\d+$/.test(word)
      );
      
      // Считаем частоту каждого слова
      wordsInComment.forEach(word => {
        words[word] = (words[word] || 0) + 1;
      });
    });
    
    // Преобразуем в массив и сортируем по частоте
    const sortedWords = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30) // Берем только 30 самых частых слов
      .map(([word, count]) => ({
        text: word,
        value: count
      }));
    
    return sortedWords;
  }, [comments]);
  
  // Функция для определения размера шрифта в зависимости от частоты слова
  const getSize = (value: number) => {
    const maxValue = Math.max(...keywords.map(k => k.value));
    const minSize = 14;
    const maxSize = 28;
    
    return minSize + ((value / maxValue) * (maxSize - minSize));
  };
  
  // Функция для определения цвета в зависимости от частоты слова
  const getColor = (value: number) => {
    const maxValue = Math.max(...keywords.map(k => k.value));
    const intensity = Math.floor((value / maxValue) * 100);
    
    return `hsl(210, ${intensity}%, 50%)`;
  };
  
  return (
    <CloudContainer>
      {keywords.map((keyword, index) => (
        <Keyword 
          key={index}
          size={getSize(keyword.value)}
          color={getColor(keyword.value)}
        >
          {keyword.text}
        </Keyword>
      ))}
      
      {keywords.length === 0 && (
        <div>Недостаточно данных для анализа</div>
      )}
    </CloudContainer>
  );
};

export default KeywordsCloud;
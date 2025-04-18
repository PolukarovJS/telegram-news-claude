// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../store';
import { Comment } from '../types';
import * as telegramApi from '../api/telegramApi';
import SentimentChart from '../components/analytics/SentimentChart';
import KeywordsCloud from '../components/analytics/KeywordsCloud';
import CommentStats from '../components/analytics/CommentStats';
import ChannelComparison from '../components/analytics/ChannelComparison';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const AnalyticsCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 15px 0;
  color: ${props => props.theme.colors.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
`;

const AnalyticsPage: React.FC = () => {
  const { items: channels } = useSelector((state: RootState) => state.channels);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Загружаем комментарии для анализа
  useEffect(() => {
    const fetchComments = async () => {
      if (channels.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Получаем комментарии из мониторируемых каналов
        const monitoredChannelIds = channels
          .filter(channel => channel.is_monitored)
          .map(channel => channel.channel_id);
        
        if (monitoredChannelIds.length === 0) {
          setComments([]);
          setIsLoading(false);
          return;
        }
        
        // Поиск комментариев по каналам
        const filter = {
          channels: monitoredChannelIds,
          limit: 1000 // Получаем большое количество комментариев для анализа
        };
        
        const result = await telegramApi.searchComments(filter);
        setComments(result);
      } catch (err: any) {
        setError(err.message || 'Ошибка получения данных для анализа');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [channels]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <EmptyState>Ошибка: {error}</EmptyState>;
  }
  
  if (comments.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Аналитика</Title>
        </Header>
        <EmptyState>
          Нет данных для анализа. Добавьте каналы для мониторинга и дождитесь появления комментариев.
        </EmptyState>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>Аналитика</Title>
      </Header>
      
      <AnalyticsGrid>
        <AnalyticsCard>
          <CardTitle>Распределение тональности комментариев</CardTitle>
          <SentimentChart comments={comments} />
        </AnalyticsCard>
        
        <AnalyticsCard>
          <CardTitle>Облако ключевых слов</CardTitle>
          <KeywordsCloud comments={comments} />
        </AnalyticsCard>
        
        <AnalyticsCard>
          <CardTitle>Статистика комментариев</CardTitle>
          <CommentStats comments={comments} />
        </AnalyticsCard>
        
        <AnalyticsCard>
          <CardTitle>Сравнение каналов</CardTitle>
          <ChannelComparison comments={comments} channels={channels} />
        </AnalyticsCard>
      </AnalyticsGrid>
    </Container>
  );
};

export default AnalyticsPage;
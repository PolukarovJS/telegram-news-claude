// src/components/analytics/CommentStats.tsx
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Comment } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.div`
  font-weight: 500;
`;

const StatValue = styled.div`
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 20px;
`;

interface CommentStatsProps {
  comments: Comment[];
}

const CommentStats: React.FC<CommentStatsProps> = ({ comments }) => {
  const stats = useMemo(() => {
    // Время комментариев по часам
    const commentsByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      commentsByHour[i] = 0;
    }
    
    // Статистика по авторам
    const commentsByAuthor: Record<string, number> = {};
    
    // Статистика по длине комментариев
    let totalLength = 0;
    
    // Количество комментариев с реакциями
    let commentsWithReactions = 0;
    
    comments.forEach(comment => {
      // Группировка по часам
      const date = new Date(comment.date);
      const hour = date.getHours();
      commentsByHour[hour]++;
      
      // Группировка по авторам
      commentsByAuthor[comment.user_id] = (commentsByAuthor[comment.user_id] || 0) + 1;
      
      // Длина комментариев
      totalLength += comment.text.length;
      
      // Комментарии с реакциями
      if (comment.reactions && comment.reactions.length > 0) {
        commentsWithReactions++;
      }
    });
    
    // Преобразуем для графика
    const hourlyData = Object.entries(commentsByHour).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count
    }));
    
    // Сортируем авторов по количеству комментариев
    const topAuthors = Object.entries(commentsByAuthor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      totalComments: comments.length,
      uniqueAuthors: Object.keys(commentsByAuthor).length,
      averageLength: comments.length ? Math.round(totalLength / comments.length) : 0,
      commentsWithReactions,
      reactionPercentage: comments.length ? Math.round((commentsWithReactions / comments.length) * 100) : 0,
      hourlyData,
      topAuthors
    };
  }, [comments]);
  
  return (
    <StatsContainer>
      <StatItem>
        <StatLabel>Всего комментариев</StatLabel>
        <StatValue>{stats.totalComments}</StatValue>
      </StatItem>
      <StatItem>
        <StatLabel>Уникальных авторов</StatLabel>
        <StatValue>{stats.uniqueAuthors}</StatValue>
      </StatItem>
      <StatItem>
        <StatLabel>Средняя длина комментария</StatLabel>
        <StatValue>{stats.averageLength} символов</StatValue>
      </StatItem>
      <StatItem>
        <StatLabel>Комментарии с реакциями</StatLabel>
        <StatValue>{stats.reactionPercentage}%</StatValue>
      </StatItem>
      
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats.hourlyData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} комментариев`, 'Количество']}
              labelFormatter={(label) => `Время: ${label}`}
            />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </StatsContainer>
  );
};

export default CommentStats;
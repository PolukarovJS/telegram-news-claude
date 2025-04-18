// src/components/analytics/ChannelComparison.tsx
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Comment, Channel } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComparisonContainer = styled.div`
  height: 400px;
`;

interface ChannelComparisonProps {
  comments: Comment[];
  channels: Channel[];
}

const ChannelComparison: React.FC<ChannelComparisonProps> = ({ 
  comments, 
  channels 
}) => {
  const data = useMemo(() => {
    // Создаем карту каналов для быстрого доступа
    const channelMap = new Map<string, Channel>();
    channels.forEach(channel => {
      channelMap.set(channel.channel_id, channel);
    });
    
    // Группируем комментарии по каналам
    const commentsByChannel: Record<string, {
      total: number;
      positive: number;
      negative: number;
      neutral: number;
    }> = {};
    
    comments.forEach(comment => {
      const { channel_id, metadata } = comment;
      const sentiment = metadata.sentiment || 'neutral';
      
      if (!commentsByChannel[channel_id]) {
        commentsByChannel[channel_id] = {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0
        };
      }
      
      commentsByChannel[channel_id].total++;
      commentsByChannel[channel_id][sentiment as 'positive' | 'negative' | 'neutral']++;
    });
    
    // Преобразуем данные для графика
    return Object.entries(commentsByChannel)
      .map(([channel_id, stats]) => {
        const channel = channelMap.get(channel_id);
        return {
          name: channel ? channel.title : channel_id,
          Позитивные: stats.positive,
          Негативные: stats.negative,
          Нейтральные: stats.neutral,
          Всего: stats.total
        };
      })
      .sort((a, b) => b.Всего - a.Всего)
      .slice(0, 5); // Ограничиваем до 5 каналов для наглядности
  }, [comments, channels]);
  
  return (
    <ComparisonContainer>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Позитивные" stackId="a" fill="#4CAF50" />
            <Bar dataKey="Негативные" stackId="a" fill="#F44336" />
            <Bar dataKey="Нейтральные" stackId="a" fill="#9E9E9E" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div>Недостаточно данных для сравнения каналов</div>
      )}
    </ComparisonContainer>
  );
};

export default ChannelComparison;
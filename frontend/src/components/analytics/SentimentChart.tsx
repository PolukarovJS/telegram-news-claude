// src/components/analytics/SentimentChart.tsx
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Comment } from '../../types';

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

interface SentimentChartProps {
  comments: Comment[];
}

const COLORS = {
  positive: '#4CAF50', // зеленый
  negative: '#F44336', // красный
  neutral: '#9E9E9E'   // серый
};

const SentimentChart: React.FC<SentimentChartProps> = ({ comments }) => {
  const data = useMemo(() => {
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    comments.forEach(comment => {
      const sentiment = comment.metadata.sentiment || 'neutral';
      sentimentCounts[sentiment as keyof typeof sentimentCounts]++;
    });
    
    return [
      { name: 'Позитивные', value: sentimentCounts.positive, color: COLORS.positive },
      { name: 'Негативные', value: sentimentCounts.negative, color: COLORS.negative },
      { name: 'Нейтральные', value: sentimentCounts.neutral, color: COLORS.neutral }
    ];
  }, [comments]);
  
  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} комментариев`, 'Количество']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SentimentChart;
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { RootState, AppDispatch } from '../store';
import { fetchMonitoredChannels } from '../store/slices/channelsSlice';
import { Channel } from '../types';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: ${props => props.theme.colors.text};
`;

const Subtitle = styled.h2`
  margin-top: 30px;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.text};
  font-size: 22px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h3`
  margin: 0 0 10px 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 16px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
`;

const ChannelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ChannelCard = styled(Link)`
  display: block;
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: ${props => props.theme.colors.text};
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ChannelTitle = styled.h3`
  margin: 0 0 10px 0;
  color: ${props => props.theme.colors.primary};
  font-size: 18px;
`;

const ChannelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const ChannelDescription = styled.p`
  color: ${props => props.theme.colors.text};
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const QuickStartSection = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const QuickStartTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${props => props.theme.colors.primary};
`;

const StepList = styled.ol`
  padding-left: 20px;
  margin-bottom: 20px;
`;

const Step = styled.li`
  margin-bottom: 12px;
  line-height: 1.5;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: channels, isLoading } = useSelector(
    (state: RootState) => state.channels
  );
  
  const monitoredChannels = channels.filter(channel => channel.is_monitored);
  
  useEffect(() => {
    dispatch(fetchMonitoredChannels());
  }, [dispatch]);
  
  // Заглушка для статистики (в реальном приложении будет из Redux)
  const stats = {
    monitoredChannels: monitoredChannels.length,
    savedMessages: 150,
    savedComments: 2478,
    taggedComments: 42
  };
  
  // Если пользователь еще не мониторит каналы, показываем инструкцию
  const showQuickStart = monitoredChannels.length === 0;
  
  return (
    <Container>
      <Title>Панель управления</Title>
      
      <StatsContainer>
        <StatCard>
          <StatTitle>Отслеживаемые каналы</StatTitle>
          <StatValue>{stats.monitoredChannels}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Сохраненные сообщения</StatTitle>
          <StatValue>{stats.savedMessages}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Сохраненные комментарии</StatTitle>
          <StatValue>{stats.savedComments}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Отмеченные комментарии</StatTitle>
          <StatValue>{stats.taggedComments}</StatValue>
        </StatCard>
      </StatsContainer>
      
      {showQuickStart ? (
        <QuickStartSection>
          <QuickStartTitle>Начало работы</QuickStartTitle>
          <StepList>
            <Step>
              Перейдите на страницу "Каналы" и найдите интересующие вас Telegram каналы
            </Step>
            <Step>
              Включите мониторинг для выбранных каналов, чтобы начать отслеживать новые сообщения и комментарии
            </Step>
            <Step>
              Используйте страницу "Аналитика" для анализа собранных комментариев
            </Step>
            <Step>
              Настройте параметры экспорта данных в разделе "Настройки"
            </Step>
          </StepList>
          <ActionButton to="/channels">
            Начать мониторинг каналов
          </ActionButton>
        </QuickStartSection>
      ) : (
        <>
          <Subtitle>Отслеживаемые каналы</Subtitle>
          <ChannelsGrid>
            {isLoading ? (
              <div>Загрузка...</div>
            ) : (
              monitoredChannels.map(channel => (
                <ChannelCard key={channel.channel_id} to={`/channels/${channel.channel_id}/messages`}>
                  <ChannelTitle>{channel.title}</ChannelTitle>
                  <ChannelDescription>
                    {channel.description || 'Описание отсутствует'}
                  </ChannelDescription>
                  <ChannelInfo>
                    <span>
                      {channel.username || '@' + channel.channel_id}
                    </span>
                    <span>
                      {channel.subscribers_count ? `${channel.subscribers_count} подписчиков` : ''}
                    </span>
                  </ChannelInfo>
                </ChannelCard>
              ))
            )}
          </ChannelsGrid>
          
          <ActionButton to="/channels">
            Управление каналами
          </ActionButton>
        </>
      )}
    </Container>
  );
};

export default HomePage;
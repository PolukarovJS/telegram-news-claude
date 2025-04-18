import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState, AppDispatch } from '../store';
import { 
  searchChannels, 
  fetchMonitoredChannels, 
  updateMonitoringStatus 
} from '../store/slices/channelsSlice';
import { Channel } from '../types';
import { startMonitoringChannels, stopMonitoringChannels } from '../api/webSocketApi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: ${props => props.theme.colors.text};
`;

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-right: none;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchButton = styled.button`
  padding: 12px 20px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const ChannelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ChannelCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  margin: 0 0 15px 0;
  font-size: 14px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const ChannelActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const ViewButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

const MonitorToggle = styled.button<{ isMonitored: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.isMonitored ? props.theme.colors.success : props.theme.colors.background};
  color: ${props => props.isMonitored ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.isMonitored ? props.theme.colors.success : props.theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isMonitored ? props.theme.colors.successDark : props.theme.colors.backgroundLight};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.colors.error};
  background-color: ${props => props.theme.colors.errorLight};
  border-radius: 4px;
  margin-bottom: 20px;
`;

const ChannelsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: channels, isLoading, error } = useSelector(
    (state: RootState) => state.channels
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'monitored'>('all');
  
  // Загружаем отслеживаемые каналы при монтировании
  useEffect(() => {
    dispatch(fetchMonitoredChannels());
  }, [dispatch]);
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchChannels(searchQuery));
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const toggleMonitoring = (channel: Channel) => {
    const newStatus = !channel.is_monitored;
    
    // Обновляем статус мониторинга
    dispatch(updateMonitoringStatus({ channelId: channel.channel_id, isMonitored: newStatus }));
    
    // Запускаем/останавливаем мониторинг через WebSocket
    if (newStatus) {
      startMonitoringChannels([channel.channel_id]);
    } else {
      stopMonitoringChannels([channel.channel_id]);
    }
  };
  
  // Фильтруем каналы в зависимости от активной вкладки
  const filteredChannels = activeTab === 'monitored'
    ? channels.filter(channel => channel.is_monitored)
    : channels;
  
  return (
    <Container>
      <Title>Управление каналами</Title>
      
      <SearchContainer>
        <SearchInput 
          type="text"
          placeholder="Введите название или ID канала"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton 
          onClick={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
        >
          {isLoading ? 'Поиск...' : 'Поиск'}
        </SearchButton>
      </SearchContainer>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          Все каналы
        </Tab>
        <Tab 
          active={activeTab === 'monitored'} 
          onClick={() => setActiveTab('monitored')}
        >
          Отслеживаемые
        </Tab>
      </TabsContainer>
      
      {error && (
        <ErrorState>{error}</ErrorState>
      )}
      
      {isLoading ? (
        <LoadingState>Загрузка каналов...</LoadingState>
      ) : filteredChannels.length === 0 ? (
        <EmptyState>
          {activeTab === 'all'
            ? 'Воспользуйтесь поиском, чтобы найти интересующие вас каналы'
            : 'У вас пока нет отслеживаемых каналов'
          }
        </EmptyState>
      ) : (
        <ChannelsGrid>
          {filteredChannels.map(channel => (
            <ChannelCard key={channel.channel_id}>
              <ChannelTitle>{channel.title}</ChannelTitle>
              <ChannelInfo>
                <span>{channel.username || '@' + channel.channel_id}</span>
                <span>
                  {channel.subscribers_count 
                    ? `${channel.subscribers_count} подписчиков` 
                    : ''}
                </span>
              </ChannelInfo>
              <ChannelDescription>
                {channel.description || 'Описание отсутствует'}
              </ChannelDescription>
              <ChannelActions>
                <ViewButton onClick={() => window.open(`https://t.me/${channel.username || channel.channel_id}`, '_blank')}>
                  Открыть в Telegram
                </ViewButton>
                <MonitorToggle 
                  isMonitored={channel.is_monitored}
                  onClick={() => toggleMonitoring(channel)}
                >
                  {channel.is_monitored ? 'Отслеживается' : 'Отслеживать'}
                </MonitorToggle>
              </ChannelActions>
            </ChannelCard>
          ))}
        </ChannelsGrid>
      )}
    </Container>
  );
};

export default ChannelsPage;
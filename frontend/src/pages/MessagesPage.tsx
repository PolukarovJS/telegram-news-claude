// src/pages/MessagesPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState, AppDispatch } from '../store';
import { fetchChannelMessages, clearMessages } from '../store/slices/messagesSlice';
import MessageList from '../components/messages/MessageList';
import MessageSearch from '../components/messages/MessageSearch';
import MessageFilters from '../components/messages/MessageFilters';
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

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const FiltersContainer = styled.div`
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  padding: 20px;
  background-color: ${props => props.theme.colors.errorLight};
  border-radius: 8px;
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
`;

const MessagesPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: messages, isLoading, error, hasMore } = useSelector(
    (state: RootState) => state.messages
  );
  
  const { items: channels } = useSelector(
    (state: RootState) => state.channels
  );
  
  const [searchMode, setSearchMode] = useState(false);
  
  // Получаем информацию о текущем канале
  const currentChannel = channels.find(channel => channel.channel_id === channelId);
  
  // Загружаем сообщения канала при монтировании или изменении ID канала
  useEffect(() => {
    if (channelId) {
      dispatch(clearMessages());
      dispatch(fetchChannelMessages({ channelId }));
    }
    
    // Сбрасываем поиск
    setSearchMode(false);
  }, [dispatch, channelId]);
  
  // Функция для загрузки дополнительных сообщений
  const loadMoreMessages = () => {
    if (channelId && hasMore && !isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageId = parseInt(lastMessage.message_id.replace('m', ''));
      
      dispatch(fetchChannelMessages({ 
        channelId, 
        offsetId: lastMessageId 
      }));
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>
          {searchMode 
            ? 'Поиск сообщений' 
            : currentChannel 
              ? `Сообщения канала "${currentChannel.title}"` 
              : 'Сообщения'
          }
        </Title>
      </Header>
      
      <SearchContainer>
        <MessageSearch onSearch={() => setSearchMode(true)} />
      </SearchContainer>
      
      {searchMode && (
        <FiltersContainer>
          <MessageFilters />
        </FiltersContainer>
      )}
      
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      
      {isLoading && messages.length === 0 ? (
        <LoadingSpinner />
      ) : messages.length === 0 ? (
        <EmptyState>
          {searchMode 
            ? 'По вашему запросу ничего не найдено' 
            : 'В этом канале нет сообщений'
          }
        </EmptyState>
      ) : (
        <MessageList 
          messages={messages} 
          onLoadMore={loadMoreMessages} 
          hasMore={hasMore}
          isLoading={isLoading}
        />
      )}
    </Container>
  );
};

export default MessagesPage;
// src/pages/CommentPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState, AppDispatch } from '../store';
import { fetchMessageComments, clearComments } from '../store/slices/commentsSlice';
import { Message } from '../types';
import CommentList from '../components/comments/CommentList';
import CommentSearch from '../components/comments/CommentSearch';
import CommentFilters from '../components/comments/CommentFilters';
import MessageViewer from '../components/messages/MessageViewer';
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

const MessageContainer = styled.div`
  margin-bottom: 30px;
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

const CommentPage: React.FC = () => {
  const { channelId, messageId } = useParams<{ channelId: string; messageId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: comments, isLoading, error, hasMore } = useSelector(
    (state: RootState) => state.comments
  );
  
  const { items: messages } = useSelector(
    (state: RootState) => state.messages
  );
  
  const [searchMode, setSearchMode] = useState(false);
  
  // Получаем информацию о текущем сообщении
  const currentMessage = messages.find(message => message.message_id === messageId) || null;
  
  // Загружаем комментарии сообщения при монтировании или изменении ID сообщения
  useEffect(() => {
    if (channelId && messageId) {
      dispatch(clearComments());
      dispatch(fetchMessageComments({ channelId, messageId }));
    }
    
    // Сбрасываем поиск
    setSearchMode(false);
  }, [dispatch, channelId, messageId]);
  
  // Функция для загрузки дополнительных комментариев
  const loadMoreComments = () => {
    if (channelId && messageId && hasMore && !isLoading) {
      // В этом примере мы не реализуем пагинацию для комментариев,
      // так как предполагается, что все комментарии загружаются сразу
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>
          {searchMode 
            ? 'Поиск комментариев' 
            : 'Комментарии'
          }
        </Title>
      </Header>
      
      {currentMessage && !searchMode && (
        <MessageContainer>
          <MessageViewer message={currentMessage} />
        </MessageContainer>
      )}
      
      <SearchContainer>
        <CommentSearch onSearch={() => setSearchMode(true)} />
      </SearchContainer>
      
      {searchMode && (
        <FiltersContainer>
          <CommentFilters />
        </FiltersContainer>
      )}
      
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      
      {isLoading && comments.length === 0 ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <EmptyState>
          {searchMode 
            ? 'По вашему запросу ничего не найдено' 
            : 'У этого сообщения нет комментариев'
          }
        </EmptyState>
      ) : (
        <CommentList 
          comments={comments} 
          onLoadMore={loadMoreComments} 
          hasMore={hasMore}
          isLoading={isLoading}
        />
      )}
    </Container>
  );
};

export default CommentPage;
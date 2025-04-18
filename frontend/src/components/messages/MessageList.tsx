// src/components/messages/MessageList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Message } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: ${props => props.theme.colors.primary};
`;

const MessageDate = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 12px;
`;

const MessageText = styled.div`
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MessageFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const MessageStats = styled.div`
  display: flex;
  gap: 16px;
`;

const ViewComments = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadMoreButton = styled.button`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundLight};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

interface MessageListProps {
  messages: Message[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onLoadMore, 
  hasMore,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <MessageListContainer>
      {messages.map(message => (
        <MessageCard key={message.message_id}>
          <MessageDate>{formatDate(message.date)}</MessageDate>
          <MessageText>{message.text}</MessageText>
          <MessageFooter>
            <MessageStats>
              <span>👁️ {message.views || 0}</span>
              <span>🔄 {message.forwards || 0}</span>
              <span>💬 {message.comments_count || 0}</span>
            </MessageStats>
            {(message.comments_count && message.comments_count > 0) && (
              <ViewComments to={`/channels/${message.channel_id}/messages/${message.message_id}/comments`}>
                Просмотреть комментарии
              </ViewComments>
            )}
          </MessageFooter>
        </MessageCard>
      ))}
      
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      )}
      
      {hasMore && !isLoading && (
        <LoadMoreButton onClick={onLoadMore}>
          Загрузить еще
        </LoadMoreButton>
      )}
    </MessageListContainer>
  );
};

export default MessageList;
// src/components/messages/MessageViewer.tsx
import React from 'react';
import styled from 'styled-components';
import { Message } from '../../types';

const MessageContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MessageDate = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const MessageContent = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const MessageMedia = styled.div`
  margin-bottom: 16px;
`;

const MediaItem = styled.div`
  background-color: ${props => props.theme.colors.backgroundLight};
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const MessageFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.colors.border};
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const MessageStats = styled.div`
  display: flex;
  gap: 16px;
`;

interface MessageViewerProps {
  message: Message;
}

const MessageViewer: React.FC<MessageViewerProps> = ({ message }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <MessageContainer>
      <MessageHeader>
        <MessageDate>{formatDate(message.date)}</MessageDate>
      </MessageHeader>
      
      <MessageContent>{message.text}</MessageContent>
      
      {message.media && message.media.length > 0 && (
        <MessageMedia>
          {message.media.map((media, index) => (
            <MediaItem key={index}>
              Медиафайл: {media}
            </MediaItem>
          ))}
        </MessageMedia>
      )}
      
      <MessageFooter>
        <MessageStats>
          <span>👁️ {message.views || 0} просмотров</span>
          <span>🔄 {message.forwards || 0} репостов</span>
          <span>💬 {message.comments_count || 0} комментариев</span>
        </MessageStats>
      </MessageFooter>
    </MessageContainer>
  );
};

export default MessageViewer;
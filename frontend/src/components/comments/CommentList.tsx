// src/components/comments/CommentList.tsx
import React from 'react';
import styled from 'styled-components';
import { Comment } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const CommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentCard = styled.div<{ isReply: boolean }>`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: ${props => props.isReply ? '30px' : '0'};
  border-left: ${props => props.isReply ? `3px solid ${props.theme.colors.primary}` : 'none'};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div`
  font-weight: 500;
`;

const CommentDate = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const CommentText = styled.div`
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CommentFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReactionsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Reaction = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.primary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 4px;
`;

const Sentiment = styled.span<{ sentiment: string }>`
  display: inline-block;
  background-color: ${props => {
    switch (props.sentiment) {
      case 'positive':
        return props.theme.colors.successLight;
      case 'negative':
        return props.theme.colors.errorLight;
      default:
        return props.theme.colors.backgroundLight;
    }
  }};
  color: ${props => {
    switch (props.sentiment) {
      case 'positive':
        return props.theme.colors.success;
      case 'negative':
        return props.theme.colors.error;
      default:
        return props.theme.colors.textSecondary;
    }
  }};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
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

interface CommentListProps {
  comments: Comment[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  onLoadMore, 
  hasMore,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Создаем карту комментариев по ID для быстрого поиска
  const commentMap = new Map<string, Comment>();
  comments.forEach(comment => {
    commentMap.set(comment.comment_id, comment);
  });
  
  return (
    <CommentListContainer>
      {comments.map(comment => {
        // Определяем, является ли комментарий ответом на другой комментарий
        const isReply = !!comment.reply_to_comment_id;
        
        return (
          <CommentCard 
            key={comment.comment_id} 
            isReply={isReply}
          >
            <CommentHeader>
              <CommentAuthor>{comment.user_id}</CommentAuthor>
              <CommentDate>{formatDate(comment.date)}</CommentDate>
            </CommentHeader>
            <CommentText>{comment.text}</CommentText>
            <CommentFooter>
              <ReactionsContainer>
                {comment.reactions.map((reaction, index) => (
                  <Reaction key={index}>
                    <span>{reaction.type}</span>
                    <span>{reaction.count}</span>
                  </Reaction>
                ))}
              </ReactionsContainer>
              <div>
                {comment.metadata.user_tags && comment.metadata.user_tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
                {comment.metadata.sentiment && (
                  <Sentiment sentiment={comment.metadata.sentiment}>
                    {comment.metadata.sentiment}
                  </Sentiment>
                )}
              </div>
            </CommentFooter>
          </CommentCard>
        );
      })}
      
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
    </CommentListContainer>
  );
};

export default CommentList;
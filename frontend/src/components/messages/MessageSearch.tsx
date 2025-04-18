// src/components/messages/MessageSearch.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { AppDispatch } from '../../store';
import { searchMessages } from '../../store/slices/messagesSlice';
import { MessageFilter } from '../../types';

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 16px;
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
  padding: 10px 16px;
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

interface MessageSearchProps {
  onSearch: () => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ onSearch }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    const filter: MessageFilter = {
      query: query.trim()
    };
    
    dispatch(searchMessages(filter))
      .finally(() => {
        setIsSearching(false);
        onSearch();
      });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Поиск сообщений..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <SearchButton
        onClick={handleSearch}
        disabled={!query.trim() || isSearching}
      >
        {isSearching ? 'Поиск...' : 'Поиск'}
      </SearchButton>
    </SearchContainer>
  );
};

export default MessageSearch;
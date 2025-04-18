// src/components/comments/CommentFilters.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { AppDispatch, RootState } from '../../store';
import { searchComments } from '../../store/slices/commentsSlice';
import { CommentFilter } from '../../types';

const FiltersContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FiltersTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: ${props => props.theme.colors.text};
`;

const FilterGroup = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const DateContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const DateInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TagInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const CommentFilters: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: channels } = useSelector((state: RootState) => state.channels);
  
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState('');
  const [tags, setTags] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  
  const handleApplyFilters = () => {
    setIsApplying(true);
    
    const filter: CommentFilter = {};
    
    if (selectedChannels.length > 0) {
      filter.channels = selectedChannels;
    }
    
    if (sentiment) {
      filter.sentiment = sentiment;
    }
    
    if (tags) {
      filter.userTags = tags.split(',').map(tag => tag.trim());
    }
    
    if (dateFrom) {
      filter.dateFrom = dateFrom;
    }
    
    if (dateTo) {
      filter.dateTo = dateTo;
    }
    
    dispatch(searchComments(filter))
      .finally(() => setIsApplying(false));
  };
  
  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const values: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    
    setSelectedChannels(values);
  };
  
  return (
    <FiltersContainer>
      <FiltersTitle>Фильтры</FiltersTitle>
      
      <FilterGroup>
        <FilterLabel htmlFor="channels">Каналы</FilterLabel>
        <FilterSelect 
          id="channels" 
          multiple 
          value={selectedChannels}
          onChange={handleChannelChange}
        >
          {channels.map(channel => (
            <option key={channel.channel_id} value={channel.channel_id}>
              {channel.title}
            </option>
          ))}
        </FilterSelect>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel htmlFor="sentiment">Тональность</FilterLabel>
        <FilterSelect
          id="sentiment"
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
        >
          <option value="">Все</option>
          <option value="positive">Позитивная</option>
          <option value="negative">Негативная</option>
          <option value="neutral">Нейтральная</option>
        </FilterSelect>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel htmlFor="tags">Теги (через запятую)</FilterLabel>
        <TagInput
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="важное, интересное, ..."
        />
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel>Период</FilterLabel>
        <DateContainer>
          <div>
            <FilterLabel htmlFor="dateFrom">С</FilterLabel>
            <DateInput
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <FilterLabel htmlFor="dateTo">По</FilterLabel>
            <DateInput
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </DateContainer>
      </FilterGroup>
      
      <ApplyButton
        onClick={handleApplyFilters}
        disabled={isApplying}
      >
        {isApplying ? 'Применение...' : 'Применить фильтры'}
      </ApplyButton>
    </FiltersContainer>
  );
};

export default CommentFilters;
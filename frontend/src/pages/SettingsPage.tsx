// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState, AppDispatch } from '../store';
import { UserSettings } from '../types';
import { toggleTheme } from '../store/slices/uiSlice';
import * as telegramApi from '../api/telegramApi';
import ThemeToggle from '../components/settings/ThemeToggle';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  max-width: 800px;
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

const Section = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 15px 0;
  color: ${props => props.theme.colors.primary};
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-weight: 500;
`;

const SettingDescription = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  margin-top: 4px;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.theme.colors.disabled};
    transition: .4s;
    border-radius: 34px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: ${props => props.theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success};
  margin-top: 10px;
`;

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.ui.theme);
  
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    notifications: true,
    auto_download: false,
    monitored_channels: []
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Загружаем настройки пользователя
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await telegramApi.getSettings();
        setSettings(response);
      } catch (err: any) {
        setError(err.message || 'Ошибка получения настроек');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Обновляем локальное состояние при изменении темы в Redux
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  }, [theme]);
  
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };
  
  const handleToggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };
  
  const handleToggleAutoDownload = () => {
    setSettings(prev => ({
      ...prev,
      auto_download: !prev.auto_download
    }));
  };
  
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await telegramApi.updateSettings(settings);
      setSuccess('Настройки успешно сохранены');
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения настроек');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !settings) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <Header>
        <Title>Настройки</Title>
      </Header>
      
      <Section>
        <SectionTitle>Внешний вид</SectionTitle>
        
        <SettingRow>
          <div>
            <SettingLabel>Тема</SettingLabel>
            <SettingDescription>Выберите светлую или темную тему</SettingDescription>
          </div>
          <ThemeToggle isDark={theme === 'dark'} onChange={handleToggleTheme} />
        </SettingRow>
      </Section>
      
      <Section>
        <SectionTitle>Уведомления</SectionTitle>
        
        <SettingRow>
          <div>
            <SettingLabel>Показывать уведомления</SettingLabel>
            <SettingDescription>Получать уведомления о новых сообщениях</SettingDescription>
          </div>
          <Toggle>
            <input 
              type="checkbox" 
              checked={settings.notifications} 
              onChange={handleToggleNotifications} 
            />
            <span></span>
          </Toggle>
        </SettingRow>
      </Section>
      
      <Section>
        <SectionTitle>Загрузки</SectionTitle>
        
        <SettingRow>
          <div>
            <SettingLabel>Автоматическая загрузка медиа</SettingLabel>
            <SettingDescription>Автоматически загружать изображения и видео</SettingDescription>
          </div>
          <Toggle>
            <input 
              type="checkbox" 
              checked={settings.auto_download} 
              onChange={handleToggleAutoDownload} 
            />
            <span></span>
          </Toggle>
        </SettingRow>
      </Section>
      
      <Button 
        onClick={handleSaveSettings}
        disabled={isLoading}
      >
        {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
      </Button>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Container>
  );
};

export default SettingsPage;
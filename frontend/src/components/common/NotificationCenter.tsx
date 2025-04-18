import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { RootState, AppDispatch } from '../../store';
import { markNotificationAsRead, clearAllNotifications } from '../../store/slices/notificationsSlice';
import { Notification } from '../../types';

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 350px;
  max-height: 500px;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationItem = styled.div<{ type: string; read: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => {
    if (props.read) return props.theme.colors.background;
    
    switch (props.type) {
      case 'error':
        return props.theme.colors.errorLight;
      case 'warning':
        return props.theme.colors.warningLight;
      case 'success':
        return props.theme.colors.successLight;
      default:
        return props.theme.colors.infoLight;
    }
  }};
  cursor: pointer;
  
  &:hover {
    filter: brightness(0.95);
  }
  
  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const NotificationMessage = styled.p`
  margin: 0 0 4px 0;
  font-size: 14px;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyNotification = styled.div`
  padding: 16px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 999;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${props => props.theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
`;

const NotificationCenter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notifications.items);
  const [isVisible, setIsVisible] = useState(false);
  
  // Автоматически скрываем центр уведомлений при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isVisible && 
        !target.closest('#notification-center') && 
        !target.closest('#toggle-notification')) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);
  
  const handleToggle = () => {
    setIsVisible(!isVisible);
  };
  
  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };
  
  const handleNotificationClick = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };
  
  // Форматирование времени
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Количество непрочитанных уведомлений
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <>
      <ToggleButton 
        id="toggle-notification"
        onClick={handleToggle}
      >
        📩
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </ToggleButton>
      
      {isVisible && (
        <NotificationContainer id="notification-center">
          <NotificationHeader>
            <NotificationTitle>Уведомления</NotificationTitle>
            {notifications.length > 0 && (
              <ClearButton onClick={handleClearAll}>Очистить все</ClearButton>
            )}
          </NotificationHeader>
          
          {notifications.length === 0 ? (
            <EmptyNotification>Нет уведомлений</EmptyNotification>
          ) : (
            notifications.map(notification => (
              <NotificationItem 
                key={notification.id}
                type={notification.type}
                read={notification.read}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <NotificationMessage>{notification.message}</NotificationMessage>
                <NotificationTime>{formatTime(notification.timestamp)}</NotificationTime>
              </NotificationItem>
            ))
          )}
        </NotificationContainer>
      )}
    </>
  );
};

export default NotificationCenter;
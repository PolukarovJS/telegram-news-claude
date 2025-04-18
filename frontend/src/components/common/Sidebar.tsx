import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const SidebarContainer = styled.nav`
  padding: 20px 0;
`;

const NavItem = styled(NavLink)`
  display: block;
  padding: 12px 20px;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  border-left: 3px solid transparent;
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundLight};
  }
  
  &.active {
    background-color: ${props => props.theme.colors.backgroundLight};
    border-left-color: ${props => props.theme.colors.primary};
    font-weight: 500;
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  padding: 16px 20px 8px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ChannelList = styled.div`
  margin-top: 10px;
`;

const ChannelItem = styled(NavLink)`
  display: block;
  padding: 8px 20px 8px 30px;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundLight};
  }
  
  &.active {
    background-color: ${props => props.theme.colors.backgroundLight};
    font-weight: 500;
  }
`;

const Badge = styled.span`
  display: inline-block;
  background-color: ${props => props.theme.colors.accent};
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 12px;
  margin-left: 8px;
`;

const Sidebar: React.FC = () => {
  // Получаем список каналов из хранилища Redux
  const channels = useSelector((state: RootState) => state.channels.items);
  
  // Получаем статистику мониторинга
  const monitoredChannels = channels.filter(c => c.is_monitored);
  
  return (
    <SidebarContainer>
      <NavItem to="/" end>Главная</NavItem>
      <NavItem to="/channels">Каналы</NavItem>
      
      {monitoredChannels.length > 0 && (
        <>
          <SectionTitle>Мониторинг</SectionTitle>
          <ChannelList>
            {monitoredChannels.map(channel => (
              <ChannelItem 
                key={channel.channel_id} 
                to={`/channels/${channel.channel_id}/messages`}
              >
                {channel.title}
              </ChannelItem>
            ))}
          </ChannelList>
        </>
      )}
      
      <SectionTitle>Инструменты</SectionTitle>
      <NavItem to="/analytics">Аналитика</NavItem>
      <NavItem to="/settings">Настройки</NavItem>
    </SidebarContainer>
  );
};

export default Sidebar;
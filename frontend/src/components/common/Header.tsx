import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/uiSlice';
import { RootState, AppDispatch } from '../../store';
import ThemeToggle from '../settings/ThemeToggle';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textLight};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.textLight};
  text-decoration: none;
  
  &:hover {
    text-decoration: none;
    color: ${props => props.theme.colors.textLight};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const UserInfo = styled.div`
  margin-right: 20px;
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.accent};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-weight: bold;
`;

const LogoutButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${props => props.theme.colors.textLight};
  cursor: pointer;
  margin-left: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useSelector((state: RootState) => state.ui.theme);
  
  // Здесь можно добавить получение информации о пользователе
  const username = "Пользователь"; // Заглушка
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };
  
  return (
    <HeaderContainer>
      <Logo to="/">Telegram News</Logo>
      
      <RightSection>
        <UserInfo>
          <Avatar>
            {username.charAt(0).toUpperCase()}
          </Avatar>
          <span>{username}</span>
        </UserInfo>
        
        <ThemeToggle 
          isDark={theme === 'dark'} 
          onChange={handleThemeToggle} 
        />
        
        <LogoutButton onClick={handleLogout}>
          Выйти
        </LogoutButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
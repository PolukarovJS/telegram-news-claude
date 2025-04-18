// src/pages/LoginPage.tsx
import React from 'react';
import styled from 'styled-components';
import LoginForm from '../components/auth/LoginForm';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.backgroundLight};
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 30px;
`;

const Description = styled.p`
  text-align: center;
  max-width: 500px;
  margin: 0 auto 40px;
  color: ${props => props.theme.colors.textSecondary};
`;

const LoginPage: React.FC = () => {
  return (
    <PageContainer>
      <Logo>Telegram News</Logo>
      <Description>
        Онлайн мониторинг новостных каналов в Telegram. Сохраняйте новости и комментарии для последующей офлайн обработки.
      </Description>
      <LoginForm />
    </PageContainer>
  );
};

export default LoginPage;
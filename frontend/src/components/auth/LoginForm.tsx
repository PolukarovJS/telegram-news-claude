import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../../store';
import { sendAuthCode, signIn, resetAuthError } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: ${props => props.theme.colors.primary};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  
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
  padding: 10px;
  background-color: ${props => props.theme.colors.errorLight};
  border-radius: 4px;
  text-align: center;
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { isLoading, error, sessionKey, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  
  // Если авторизация успешна, перенаправляем на главную страницу
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Сбрасываем ошибку при изменении шага
  useEffect(() => {
    if (error) {
      dispatch(resetAuthError());
    }
  }, [step, dispatch, error]);
  
  // Переходим к шагу ввода кода после успешной отправки кода
  useEffect(() => {
    if (sessionKey && step === 'phone') {
      setStep('code');
    }
  }, [sessionKey, step]);
  
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendAuthCode(phone));
  };
  
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(signIn({ phone, code }));
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(signIn({ phone, code, password }));
  };
  
  const handleBack = () => {
    if (step === 'code') {
      setStep('phone');
    } else if (step === 'password') {
      setStep('code');
    }
  };
  
  // Проверка ошибки, требующей пароль 2FA
  useEffect(() => {
    if (error && error.includes('двухфакторной аутентификации')) {
      setStep('password');
    }
  }, [error]);
  
  return (
    <Container>
      <Title>Вход в Telegram News</Title>
      
      {step === 'phone' && (
        <Form onSubmit={handlePhoneSubmit}>
          <FormGroup>
            <Label htmlFor="phone">Номер телефона</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+71234567890"
              required
              disabled={isLoading}
            />
          </FormGroup>
          <Button type="submit" disabled={isLoading || !phone}>
            {isLoading ? 'Отправка...' : 'Отправить код'}
          </Button>
          <InfoText>
            Введите номер телефона, привязанный к вашему аккаунту Telegram
          </InfoText>
        </Form>
      )}
      
      {step === 'code' && (
        <Form onSubmit={handleCodeSubmit}>
          <FormGroup>
            <Label htmlFor="code">Код подтверждения</Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="12345"
              required
              disabled={isLoading}
              autoFocus
            />
          </FormGroup>
          <Button type="submit" disabled={isLoading || !code}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
          <Button 
            type="button" 
            onClick={handleBack}
            disabled={isLoading}
            style={{ backgroundColor: 'transparent', color: '#333', marginTop: '5px' }}
          >
            Назад
          </Button>
          <InfoText>
            Введите код, который был отправлен в Telegram
          </InfoText>
        </Form>
      )}
      
      {step === 'password' && (
        <Form onSubmit={handlePasswordSubmit}>
          <FormGroup>
            <Label htmlFor="password">Пароль двухфакторной аутентификации</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              disabled={isLoading}
              autoFocus
            />
          </FormGroup>
          <Button type="submit" disabled={isLoading || !password}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
          <Button 
            type="button" 
            onClick={handleBack}
            disabled={isLoading}
            style={{ backgroundColor: 'transparent', color: '#333', marginTop: '5px' }}
          >
            Назад
          </Button>
          <InfoText>
            Введите пароль двухфакторной аутентификации, установленный в настройках Telegram
          </InfoText>
        </Form>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

export default LoginForm;
// src/App.tsx

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from './store';
import { fetchAuth } from './store/slices/authSlice';
import { AppDispatch } from './store'; // Убедитесь, что импортируете этот тип
import { connectWebSocket } from './api/webSocketApi';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChannelsPage from './pages/ChannelsPage';
import MessagesPage from './pages/MessagesPage';
import CommentPage from './pages/CommentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

import Layout from './components/common/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Используйте типизированный dispatch
  const { isAuthenticated, sessionKey } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Проверяем авторизацию при загрузке приложения
    dispatch(fetchAuth());
  }, [dispatch]);

  // Подключаемся к WebSocket, если авторизованы
  useEffect(() => {
    if (isAuthenticated && sessionKey) {
      connectWebSocket(sessionKey);
    }
  }, [isAuthenticated, sessionKey]);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <LoginPage />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<HomePage />} />
        <Route path="channels" element={<ChannelsPage />} />
        <Route path="channels/:channelId/messages" element={<MessagesPage />} />
        <Route path="channels/:channelId/messages/:messageId/comments" element={<CommentPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
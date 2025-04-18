// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * Компонент для защиты маршрутов, требующих аутентификации.
 * Перенаправляет на страницу входа, если пользователь не авторизован.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  // Если идет процесс проверки аутентификации, можно показать загрузчик
  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Если пользователь авторизован, рендерим дочерние компоненты
  return <>{children}</>;
};

export default ProtectedRoute;
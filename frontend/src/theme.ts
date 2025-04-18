import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  colors: {
    background: '#ffffff',
    primary: '#007bff',
    primaryDark: '#0056b3',
    border: '#ced4da',
    disabled: '#6c757d',
    error: '#dc3545',
    errorLight: '#f8d7da',
    textSecondary: '#6c757d',
    text: '#6c757d',
  },
};

export const darkTheme: DefaultTheme = {
  colors: {
    background: '#1a1a1a',
    primary: '#66b3ff',
    primaryDark: '#3385ff',
    border: '#444444',
    disabled: '#888888',
    error: '#ff4d4d',
    errorLight: '#662222',
    textSecondary: '#aaaaaa',
    text: '#aaaaaa',
  },
};
export const lightTheme = {
    colors: {
      primary: '#2196F3',
      primaryLight: '#BBDEFB',
      primaryDark: '#1976D2',
      
      secondary: '#FF9800',
      secondaryLight: '#FFE0B2',
      secondaryDark: '#F57C00',
      
      accent: '#9C27B0',
      
      success: '#4CAF50',
      successLight: '#E8F5E9',
      successDark: '#388E3C',
      
      error: '#F44336',
      errorLight: '#FFEBEE',
      errorDark: '#D32F2F',
      
      warning: '#FFC107',
      warningLight: '#FFF8E1',
      warningDark: '#FFA000',
      
      info: '#2196F3',
      infoLight: '#E3F2FD',
      infoDark: '#1976D2',
      
      text: '#212121',
      textSecondary: '#757575',
      textLight: '#FFFFFF',
      
      background: '#FFFFFF',
      backgroundLight: '#F5F5F5',
      
      border: '#E0E0E0',
      divider: '#EEEEEE',
      
      disabled: '#BDBDBD',
      
      codeBackground: '#F5F5F5',
    },
    
    fonts: {
      body: '"Roboto", sans-serif',
      heading: '"Roboto", sans-serif',
      monospace: '"Roboto Mono", monospace',
    },
    
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '30px',
    },
    
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1920px',
    },
    
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
    },
    
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    },
    
    transitions: {
      short: '0.2s ease-in-out',
      medium: '0.3s ease-in-out',
      long: '0.5s ease-in-out',
    },
    
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '16px',
      full: '9999px',
    },
  };
  
  export const darkTheme = {
    colors: {
      primary: '#90CAF9',
      primaryLight: '#1E88E5',
      primaryDark: '#0D47A1',
      
      secondary: '#FFCC80',
      secondaryLight: '#FF9800',
      secondaryDark: '#E65100',
      
      accent: '#CE93D8',
      
      success: '#81C784',
      successLight: '#2E7D32',
      successDark: '#1B5E20',
      
      error: '#E57373',
      errorLight: '#C62828',
      errorDark: '#B71C1C',
      
      warning: '#FFD54F',
      warningLight: '#F9A825',
      warningDark: '#F57F17',
      
      info: '#64B5F6',
      infoLight: '#1976D2',
      infoDark: '#0D47A1',
      
      text: '#FAFAFA',
      textSecondary: '#BDBDBD',
      textLight: '#FFFFFF',
      
      background: '#212121',
      backgroundLight: '#303030',
      
      border: '#424242',
      divider: '#424242',
      
      disabled: '#757575',
      
      codeBackground: '#2D2D2D',
    },
    
    fonts: {
      body: '"Roboto", sans-serif',
      heading: '"Roboto", sans-serif',
      monospace: '"Roboto Mono", monospace',
    },
    
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '30px',
    },
    
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1920px',
    },
    
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
    },
    
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.48)',
      md: '0 3px 6px rgba(0,0,0,0.32), 0 3px 6px rgba(0,0,0,0.46)',
      lg: '0 10px 20px rgba(0,0,0,0.38), 0 6px 6px rgba(0,0,0,0.46)',
      xl: '0 14px 28px rgba(0,0,0,0.50), 0 10px 10px rgba(0,0,0,0.44)',
    },
    
    transitions: {
      short: '0.2s ease-in-out',
      medium: '0.3s ease-in-out',
      long: '0.5s ease-in-out',
    },
    
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '16px',
      full: '9999px',
    },
  };
  
  export type Theme = typeof lightTheme;
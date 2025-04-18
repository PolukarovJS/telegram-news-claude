import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      text: Interpolation<FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, never>>;
      background: string;
      primary: string;
      primaryDark: string;
      border: string;
      disabled: string;
      error: string;
      errorLight: string;
      textSecondary: string;
    };
  }
}
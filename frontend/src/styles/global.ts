import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.colors.backgroundLight};
    color: ${props => props.theme.colors.text};
    font-size: 16px;
    line-height: 1.5;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  button {
    font-family: inherit;
  }
  
  input, textarea, select {
    font-family: inherit;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
    line-height: 1.2;
  }
  
  h1 {
    font-size: 28px;
  }
  
  h2 {
    font-size: 24px;
  }
  
  h3 {
    font-size: 20px;
  }
  
  h4 {
    font-size: 18px;
  }
  
  h5 {
    font-size: 16px;
  }
  
  h6 {
    font-size: 14px;
  }
  
  img {
    max-width: 100%;
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
    background-color: ${props => props.theme.colors.codeBackground};
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.9em;
  }
  
  pre {
    background-color: ${props => props.theme.colors.codeBackground};
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
    font-size: 0.9em;
  }
`;
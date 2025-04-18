// src/components/settings/ThemeToggle.tsx
import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${props => props.theme.colors.primary};
  }
  
  &:checked + span:before {
    transform: translateX(30px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.disabled};
  transition: .4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const ThemeIcon = styled.div<{ isDark: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  
  ${props => props.isDark ? `
    right: 10px;
  ` : `
    left: 10px;
  `}
`;

interface ThemeToggleProps {
  isDark: boolean;
  onChange: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onChange }) => {
  return (
    <ToggleContainer>
      <ToggleInput
        type="checkbox"
        checked={isDark}
        onChange={onChange}
      />
      <ToggleSlider>
        <ThemeIcon isDark={false}>☀️</ThemeIcon>
        <ThemeIcon isDark={true}>🌙</ThemeIcon>
      </ToggleSlider>
    </ToggleContainer>
  );
};

export default ThemeToggle;
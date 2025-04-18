import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import NotificationCenter from './NotificationCenter';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.backgroundLight};
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
`;

const SidebarContainer = styled.div`
  width: 250px;
  background-color: ${props => props.theme.colors.background};
  border-right: 1px solid ${props => props.theme.colors.border};
  overflow-y: auto;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Layout: React.FC = () => {
  return (
    <LayoutContainer>
      <Header />
      <MainContainer>
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>
        <ContentContainer>
          <Outlet />
        </ContentContainer>
      </MainContainer>
      <Footer />
      <NotificationCenter />
    </LayoutContainer>
  );
};

export default Layout;
// src/components/layout/Layout.js
import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/global.css';

const Layout = ({ children, showNavigation = true, showHeader = true }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="container">
        {showHeader && <Header />}
        {showNavigation && isAuthenticated && <Navigation />}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
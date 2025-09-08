// src/app.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import Landing from './pages/Landing';
import MainApp from './pages/MainApp';
import './styles/global.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading your account..." />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route wrapper (redirect to app if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading..." />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/app" replace /> : children;
};

// App Content component
const AppContent = () => {
  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <div className="container">
                <header className="app-header">
                  <h1 className="header-title">Recovery Housing Connect</h1>
                  <p className="header-subtitle">Building Supportive Communities Through Meaningful Connections</p>
                </header>
                <Landing />
              </div>
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes - MainApp handles all authenticated user flows */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy route redirects for any old bookmarks */}
        <Route path="/onboarding" element={<Navigate to="/app" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile/basic" replace />} />
        <Route path="/matching-profile" element={<Navigate to="/app/profile/matching" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Main App component
const RecoveryHousingApp = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default RecoveryHousingApp;
// src/App.js - UPDATED VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import Landing from './pages/Landing';
import MainApp from './pages/MainApp';
import './styles/global.css';

// ✅ IMPROVED: Protected Route with better error handling
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, error, clearError } = useAuth();
  
  // ✅ ADDED: Handle loading states with timeout protection
  if (loading) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading your account..." />
              
              {/* ✅ ADDED: Show error if loading is taking too long */}
              {error && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  color: '#856404',
                  textAlign: 'center',
                  maxWidth: '400px'
                }}>
                  <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>
                    ⚠️ Loading Issue
                  </p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                    {error.message || 'There was a problem loading your account.'}
                  </p>
                  <button
                    onClick={() => {
                      clearError();
                      window.location.reload();
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#856404',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// ✅ IMPROVED: Public Route with better loading handling
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, error } = useAuth();
  
  if (loading) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading..." />
              
              {/* ✅ ADDED: Show simplified error for public routes */}
              {error && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  color: '#6c757d',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  Having trouble connecting. Please refresh if this continues.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/app" replace /> : children;
};

// ✅ IMPROVED: App Content with error boundary
const AppContent = () => {
  const { error, clearError } = useAuth();

  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      {/* ✅ ADDED: Global error display */}
      {error && error.message && !error.message.includes('timed out') && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 16px',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#721c24',
          fontSize: '0.9rem',
          maxWidth: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>Connection Issue</strong>
              <br />
              <small>{error.message}</small>
            </div>
            <button
              onClick={clearError}
              style={{
                marginLeft: '8px',
                background: 'transparent',
                border: 'none',
                color: '#721c24',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
                padding: '0'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

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

// ✅ IMPROVED: Main App component with error boundary
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
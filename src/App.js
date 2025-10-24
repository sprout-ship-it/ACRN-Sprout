// src/App.js - UPDATED: Sprout branding
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Landing from './pages/Landing';
import MainApp from './pages/MainApp';
import './styles/main.css';

// Protected Route with better loading and error handling
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, error, clearError } = useAuth();
  
  if (loading) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading your account..." />
              
              {/* Show retry option if loading takes too long */}
              {error && (
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '12px',
                  color: '#856404',
                  textAlign: 'center',
                  maxWidth: '400px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️</div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                    Connection Issue
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {error.message || 'Having trouble loading your account. This might be due to a slow connection.'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        clearError();
                        window.location.reload();
                      }}
                      style={{
                        padding: '10px 20px',
                        background: '#856404',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        clearError();
                        window.location.href = '/';
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        color: '#856404',
                        border: '1px solid #856404',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Start Over
                    </button>
                  </div>
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

// Public Route with simple loading handling
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, error } = useAuth();
  
  if (loading) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading..." />
              
              {/* Minimal error message for public routes */}
              {error && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  color: '#6c757d',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  maxWidth: '300px'
                }}>
                  <div style={{ marginBottom: '8px' }}>⚠️</div>
                  Connection issue. Please refresh if this continues.
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

// App Content with global error handling
const AppContent = () => {
  const { error, clearError } = useAuth();

  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      {/* Global error notification */}
      {error && error.message && !error.message.includes('timed out') && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '16px 20px',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24',
          fontSize: '0.9rem',
          maxWidth: '350px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                ⚠️ Connection Issue
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.3 }}>
                {error.message}
              </div>
            </div>
            <button
              onClick={clearError}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#721c24',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '0',
                fontWeight: 'bold'
              }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Routes>
        {/* ✅ UPDATED: Public Routes with Sprout branding */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <div className="container">
                <header className="app-header">
                  <h1 className="header-title">Sprout</h1>
                  <p className="header-subtitle">Connect • Thrive • Grow</p>
                </header>
                <Landing />
              </div>
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy route redirects */}
        <Route path="/onboarding" element={<Navigate to="/app" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile/basic" replace />} />
        <Route path="/matching-profile" element={<Navigate to="/app/profile/matching" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
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
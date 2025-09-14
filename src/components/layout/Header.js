// src/components/layout/Header.js - COMPLETE UPDATED VERSION
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import '../../styles/global.css';

const Header = () => {
  const { isAuthenticated, profile, signOut, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Improved logout with visual feedback and timeout handling
  const handleLogout = async () => {
    console.log('🚪 Header: Logout initiated')
    
    if (isLoggingOut) {
      console.log('⚠️ Header: Logout already in progress')
      return
    }

    setIsLoggingOut(true)

    try {
      const { error } = await signOut()
      
      if (error) {
        console.error('❌ Header: Logout error:', error.message)
        alert(`Logout issue: ${error.message}`)
      } else {
        console.log('✅ Header: Logout completed successfully')
      }
    } catch (err) {
      console.error('💥 Header: Logout failed:', err.message)
      alert('Logout failed. The page will refresh to clear your session.')
      // Force refresh as fallback
      window.location.href = '/'
    } finally {
      // Note: We don't reset isLoggingOut because the component will unmount
      // when the user is logged out
    }
  }

  return (
    <header className="app-header">
      {/* User greeting */}
      {isAuthenticated && profile?.first_name && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '0.9rem',
          opacity: '0.9',
          color: 'white'
        }}>
          Welcome, {profile.first_name}!
          {profile.loading_error && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#ffeb3b', 
              marginTop: '4px' 
            }}>
              ⚠️ Profile data incomplete
            </div>
          )}
        </div>
      )}
      
      {/* Main header content */}
      <h1 className="header-title">Recovery Housing Connect</h1>
      <p className="header-subtitle">Building Supportive Communities Through Meaningful Connections</p>
      
      {/* Logout button */}
      {isAuthenticated && (
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut || loading}
            style={{
              padding: '8px 16px',
              background: isLoggingOut ? '#666' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: isLoggingOut || loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: isLoggingOut || loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              position: 'relative',
              minWidth: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isLoggingOut ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Logging out...</span>
              </>
            ) : (
              'Logout'
            )}
          </button>
        </div>
      )}
      
      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .logout-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </header>
  )
}

export default Header
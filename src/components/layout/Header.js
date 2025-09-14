// src/components/layout/Header.js - UPDATED VERSION
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import '../../styles/global.css';

const Header = () => {
  const { isAuthenticated, profile, signOut, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

  // ✅ IMPROVED: Better logout handling with loading state and error handling
  const handleLogout = async () => {
    console.log('🚪 Header: Logout button clicked')
    
    if (isLoggingOut) {
      console.log('⚠️ Header: Logout already in progress, ignoring click')
      return
    }

    setIsLoggingOut(true)
    setLogoutError(null)

    try {
      console.log('🚪 Header: Calling signOut...')
      const { error } = await signOut()
      
      if (error) {
        console.error('❌ Header: Logout error:', error)
        setLogoutError(error.message)
        setIsLoggingOut(false)
        
        // Show user-friendly error message
        if (error.message.includes('timed out')) {
          alert('Logout is taking longer than expected, but you have been logged out locally.')
        } else {
          alert(`Error signing out: ${error.message}. Please try again.`)
        }
      } else {
        console.log('✅ Header: Logout successful')
        // Note: We don't need to set isLoggingOut to false here because
        // the component will unmount when user is logged out
      }
    } catch (err) {
      console.error('💥 Header: Logout failed:', err)
      setLogoutError(err.message)
      setIsLoggingOut(false)
      alert('Logout failed. Please try refreshing the page.')
    }
  }

  return (
    <header className="app-header">
      {isAuthenticated && profile?.first_name && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '0.9rem',
          opacity: '0.9'
        }}>
          Welcome, {profile.first_name}!
          {profile.loading_error && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#ff6b6b', 
              marginTop: '4px' 
            }}>
              ⚠️ Profile data incomplete
            </div>
          )}
        </div>
      )}
      
      <h1 className="header-title">Recovery Housing Connect</h1>
      <p className="header-subtitle">Building Supportive Communities Through Meaningful Connections</p>
      
      {isAuthenticated && (
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          {/* ✅ IMPROVED: Better logout button with loading state */}
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut || loading}
            style={{
              opacity: isLoggingOut ? 0.6 : 1,
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            {isLoggingOut ? (
              <>
                <span style={{ opacity: 0.7 }}>Logging out...</span>
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </>
            ) : (
              'Logout'
            )}
          </button>
          
          {/* ✅ ADDED: Show logout error if it occurs */}
          {logoutError && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '4px',
              padding: '4px 8px',
              background: '#ff6b6b',
              color: 'white',
              fontSize: '0.8rem',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              zIndex: 1000
            }}>
              {logoutError}
            </div>
          )}
        </div>
      )}
      
      {/* ✅ ADDED: Add spinner animation styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </header>
  )
}

export default Header
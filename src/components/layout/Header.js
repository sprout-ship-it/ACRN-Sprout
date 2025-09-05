// src/components/layout/Header.js
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/global.css';

const Header = () => {
  const { isAuthenticated, profile, signOut } = useAuth()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Error signing out:', error)
      alert('Error signing out. Please try again.')
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
        </div>
      )}
      
      <h1 className="header-title">Recovery Housing Connect</h1>
      <p className="header-subtitle">Building Supportive Communities Through Meaningful Connections</p>
      
      {isAuthenticated && (
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      )}
    </header>
  )
}

export default Header
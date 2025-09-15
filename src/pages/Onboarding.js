// src/pages/Onboarding.js - LEGACY FALLBACK COMPONENT
// This component handles old bookmarks/links to the previous onboarding flow
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import '../styles/global.css'

const Onboarding = () => {
  const { isAuthenticated, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔄 Legacy Onboarding.js accessed - redirecting to new flow')
    
    if (!isAuthenticated) {
      // User not authenticated, redirect to landing
      console.log('👤 User not authenticated, redirecting to landing page')
      navigate('/', { replace: true })
    } else {
      // User is authenticated, redirect to main app (new simplified flow)
      console.log('👤 User authenticated, redirecting to main app dashboard')
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Show loading state while redirect happens
  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="container">
        <header className="app-header">
          <h1 className="header-title">Recovery Housing Connect</h1>
          <p className="header-subtitle">Updating Your Experience...</p>
        </header>
        
        <div className="content">
          <div className="card text-center">
            <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🔄</div>
            <h3 className="card-title">Experience Updated!</h3>
            <p className="card-text" style={{ marginBottom: '30px' }}>
              We've streamlined the setup process to get you connected faster.
              <br />
              Redirecting you to the new experience...
            </p>
            
            <LoadingSpinner size="large" />
            
            <div className="mt-4">
              <p className="text-gray-600" style={{ fontSize: '0.9rem' }}>
                If you're not redirected automatically, 
                <button 
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => navigate('/app', { replace: true })}
                >
                  click here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
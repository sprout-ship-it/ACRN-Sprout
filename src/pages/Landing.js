// src/pages/Landing.js
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/forms/LoginForm'
import RegisterForm from '../components/forms/RegisterForms'
import '../styles/global.css';

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const { isAuthenticated } = useAuth()

  // If user is already authenticated, they shouldn't see landing page
  // This will be handled by routing in App.js, but good to have as backup
  if (isAuthenticated) {
    return null;
  }

  // Show login form
  if (showLogin) {
    return (
      <LoginForm onBackToLanding={() => setShowLogin(false)} />
    )
  }

  // Show register form
  if (showRegister) {
    return (
      <RegisterForm onBackToLanding={() => setShowRegister(false)} />
    )
  }

  // Show main landing page
  return (
    <div className="content">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to Recovery Housing Connect</h1>
        <p className="welcome-text">
          Our platform brings together individuals in recovery seeking compatible roommates, 
          recovery-friendly landlords, and dedicated peer support specialists.
          <br /><br />
          <strong>Here's how it works:</strong>
          <br />
          First, we match you with compatible roommates based on recovery goals, lifestyle preferences, 
          and personal compatibility. Once matched, you'll search for local housing together based on 
          your shared criteria. Finally, we connect your matched pair with local peer support specialists 
          who align with your unique recovery preferences.
          <br /><br />
          Join our community today and find the supportive housing environment you deserve.
        </p>
      </div>
      
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Existing Users</h3>
          <p className="card-text">
            Sign in to your account to access your dashboard and continue your housing journey.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowLogin(true)}
          >
            Sign In
          </button>
        </div>
        
        <div className="card">
          <h3 className="card-title">New Users</h3>
          <p className="card-text">
            Create your account and join our supportive recovery housing community.
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

export default Landing
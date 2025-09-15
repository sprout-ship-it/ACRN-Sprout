// src/pages/Landing.js
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/forms/RegisterForms'
import '../styles/global.css';

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [preSelectedRole, setPreSelectedRole] = useState(null)
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
      <RegisterForm 
        onBackToLanding={() => {
          setShowRegister(false)
          setPreSelectedRole(null)
        }}
        preSelectedRole={preSelectedRole}
      />
    )
  }

  const handleRoleClick = (roleId) => {
    setPreSelectedRole(roleId)
    setShowRegister(true)
  }

  // Show main landing page
  return (
    <div className="content">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to Recovery Housing Connect</h1>
        <p className="welcome-text">
          Our comprehensive platform connects the entire recovery housing ecosystem: 
          individuals in recovery seeking compatible roommates, recovery-friendly landlords, 
          dedicated peer support specialists, and employers committed to second-chance hiring.
        </p>
      </div>

      {/* ✅ MOVED: Sign In/Register cards moved up */}
      <div className="grid-2 mb-5">
        <div className="card">
          <h3 className="card-title">Existing Users</h3>
          <p className="card-text">
            Sign in to your account to access your dashboard and continue your recovery housing journey.
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
            Create your account and join our supportive recovery community. Select your role below to get started.
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
      </div>

      {/* ✅ UPDATED: Enhanced role cards with better styling and click functionality */}
      <div className="card mb-5">
        <h3 className="card-title">Who Can Join Our Platform?</h3>
        <p className="card-text text-center mb-4">
          <strong>Click on your role below to create an account and get started!</strong>
        </p>
        <div className="grid-auto">
          <div 
            className="role-card role-card-housing-seeker" 
            onClick={() => handleRoleClick('applicant')}
          >
            <div className="role-icon">🏠</div>
            <h4 className="role-title">Housing Seekers</h4>
            <p className="role-description">
              Individuals in recovery looking for compatible roommates and supportive housing environments.
            </p>
            <div className="role-click-hint">Click to register →</div>
          </div>
          
          <div 
            className="role-card role-card-peer-support" 
            onClick={() => handleRoleClick('peer')}
          >
            <div className="role-icon">🤝</div>
            <h4 className="role-title">Peer Support Specialists</h4>
            <p className="role-description">
              Licensed professionals offering guidance and support throughout the recovery journey.
            </p>
            <div className="role-click-hint">Click to register →</div>
          </div>
          
          <div 
            className="role-card role-card-property-owner" 
            onClick={() => handleRoleClick('landlord')}
          >
            <div className="role-icon">🏢</div>
            <h4 className="role-title">Property Owners</h4>
            <p className="role-description">
              Landlords committed to providing recovery-friendly housing options and supportive rental policies.
            </p>
            <div className="role-click-hint">Click to register →</div>
          </div>
          
          <div 
            className="role-card role-card-employer" 
            onClick={() => handleRoleClick('employer')}
          >
            <div className="role-icon">💼</div>
            <h4 className="role-title">Recovery-Friendly Employers</h4>
            <p className="role-description">
              Companies offering second-chance employment and creating inclusive workplaces for individuals in recovery.
            </p>
            <div className="role-click-hint">Click to register →</div>
          </div>
        </div>
      </div>

      {/* ✅ REPOSITIONED: How it works section moved down */}
      <div className="card mb-5">
        <h3 className="card-title">Here's How It Works:</h3>
        <p className="card-text">
          First, we match you with compatible roommates based on recovery goals, lifestyle preferences, 
          and personal compatibility. Once matched, you'll search for local housing together based on 
          your shared criteria. We also connect your matched pair with local peer support specialists 
          who align with your unique recovery preferences. Finally, discover employment opportunities 
          with employers who understand and support the recovery journey.
          <br /><br />
          Join our community today and find the supportive housing and employment environment you deserve.
        </p>
      </div>

      {/* ✅ Platform benefits section */}
      <div className="card mt-5">
        <h3 className="card-title">Why Choose Recovery Housing Connect?</h3>
        <div className="grid-2">
          <div>
            <h4 style={{ color: 'var(--secondary-teal)', marginBottom: '15px' }}>🎯 Comprehensive Matching</h4>
            <p className="card-text">
              Our advanced algorithm considers recovery stage, lifestyle preferences, and personal compatibility 
              to create meaningful connections across housing, employment, and support services.
            </p>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--secondary-teal)', marginBottom: '15px' }}>🔒 Safe & Supportive</h4>
            <p className="card-text">
              All community members are committed to supporting recovery journeys in a stigma-free, 
              understanding environment designed for long-term success.
            </p>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--secondary-teal)', marginBottom: '15px' }}>🌐 Complete Ecosystem</h4>
            <p className="card-text">
              From housing and roommates to employment and peer support - everything you need 
              for a successful recovery journey in one integrated platform.
            </p>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--secondary-teal)', marginBottom: '15px' }}>💡 Evidence-Based</h4>
            <p className="card-text">
              Built with input from recovery professionals, our platform incorporates best practices 
              for sustainable recovery and community building.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
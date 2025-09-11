// src/pages/Landing.js
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';
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
          Our comprehensive platform connects the entire recovery housing ecosystem: 
          individuals in recovery seeking compatible roommates, recovery-friendly landlords, 
          dedicated peer support specialists, and employers committed to second-chance hiring.
          <br /><br />
          <strong>Here's how it works:</strong>
          <br />
          First, we match you with compatible roommates based on recovery goals, lifestyle preferences, 
          and personal compatibility. Once matched, you'll search for local housing together based on 
          your shared criteria. We also connect your matched pair with local peer support specialists 
          who align with your unique recovery preferences. Finally, discover employment opportunities 
          with employers who understand and support the recovery journey.
          <br /><br />
          Join our community today and find the supportive housing and employment environment you deserve.
        </p>
      </div>

      {/* ✅ NEW: Role-specific information cards */}
      <div className="card mb-5">
        <h3 className="card-title">Who Can Join Our Platform?</h3>
        <div className="grid-auto">
          <div className="card" style={{ background: 'var(--bg-light-purple)', border: '2px solid var(--primary-purple)' }}>
            <div className="text-center mb-2" style={{ fontSize: '2rem' }}>🏠</div>
            <h4 className="card-title" style={{ color: 'var(--primary-purple)' }}>Housing Seekers</h4>
            <p className="card-text">
              Individuals in recovery looking for compatible roommates and supportive housing environments.
            </p>
          </div>
          
          <div className="card" style={{ background: 'var(--bg-light-cream)', border: '2px solid var(--secondary-teal)' }}>
            <div className="text-center mb-2" style={{ fontSize: '2rem' }}>🤝</div>
            <h4 className="card-title" style={{ color: 'var(--secondary-teal)' }}>Peer Support Specialists</h4>
            <p className="card-text">
              Licensed professionals offering guidance and support throughout the recovery journey.
            </p>
          </div>
          
          <div className="card" style={{ background: 'var(--bg-light-cream)', border: '2px solid var(--secondary-purple)' }}>
            <div className="text-center mb-2" style={{ fontSize: '2rem' }}>🏢</div>
            <h4 className="card-title" style={{ color: 'var(--secondary-purple)' }}>Property Owners</h4>
            <p className="card-text">
              Landlords committed to providing recovery-friendly housing options and supportive rental policies.
            </p>
          </div>
          
          <div className="card" style={{ background: 'var(--bg-light-cream)', border: '2px solid var(--coral)' }}>
            <div className="text-center mb-2" style={{ fontSize: '2rem' }}>💼</div>
            <h4 className="card-title" style={{ color: 'var(--coral)' }}>Recovery-Friendly Employers</h4>
            <p className="card-text">
              Companies offering second-chance employment and creating inclusive workplaces for individuals in recovery.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid-2">
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
            Create your account and join our supportive recovery community as a housing seeker, 
            peer support specialist, property owner, or recovery-friendly employer.
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
      </div>

      {/* ✅ NEW: Platform benefits section */}
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
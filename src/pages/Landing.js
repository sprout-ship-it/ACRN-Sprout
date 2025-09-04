// src/pages/Landing.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './global.css'

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const LoginForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }

      setLoading(true)
      setError('')

      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        setError(signInError.message || 'Failed to sign in')
        setLoading(false)
        return
      }

      // Successful login - AuthContext will handle redirect
      navigate('/app')
    }

    return (
      <div className="card">
        <h2 className="form-title">Sign In</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-600)',
                fontSize: '0.9rem'
              }}
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <button 
          className={`btn btn-primary ${loading ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <button 
          className="btn btn-outline mt-3"
          onClick={() => setShowLogin(false)}
          disabled={loading}
        >
          Back to Home
        </button>
      </div>
    )
  }

  const RegisterForm = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [selectedRoles, setSelectedRoles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const roles = [
      { id: 'applicant', label: 'Applicant', description: 'Seeking housing and roommates' },
      { id: 'peer', label: 'Peer Support', description: 'Providing peer support services' },
      { id: 'landlord', label: 'Landlord', description: 'Offering recovery-friendly housing' }
    ]

    const toggleRole = (roleId) => {
      setSelectedRoles(prev => 
        prev.includes(roleId) 
          ? prev.filter(r => r !== roleId)
          : [...prev, roleId]
      )
    }

    const handleSubmit = async () => {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError('Please fill in all fields')
        return
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      
      if (selectedRoles.length === 0) {
        setError('Please select at least one role')
        return
      }

      setLoading(true)
      setError('')

      const userData = {
        firstName,
        lastName,
        roles: selectedRoles
      }

      const { data, error: signUpError } = await signUp(email, password, userData)

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account')
        setLoading(false)
        return
      }

      // Successful registration - redirect to onboarding
      navigate('/onboarding')
    }

    return (
      <div className="card">
        <h2 className="form-title">Create Account</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">First Name</label>
            <input
              className="input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="label">Last Name</label>
            <input
              className="input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">Confirm Password</label>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">Select Your Role(s)</label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px' 
          }}>
            {roles.map(role => (
              <div
                key={role.id}
                className={`checkbox-item ${selectedRoles.includes(role.id) ? 'selected' : ''}`}
                onClick={() => !loading && toggleRole(role.id)}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary-purple)' }}>
                    {role.label}
                  </h4>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className={`btn btn-primary ${loading ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <button 
          className="btn btn-outline mt-3"
          onClick={() => setShowRegister(false)}
          disabled={loading}
        >
          Back to Home
        </button>
      </div>
    )
  }

  // Show login form
  if (showLogin) {
    return (
      <div className="content">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <LoginForm />
        </div>
      </div>
    )
  }

  // Show register form
  if (showRegister) {
    return (
      <div className="content">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <RegisterForm />
        </div>
      </div>
    )
  }

  // Show landing page
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
          <p className="card-text">Sign in to your account to access your dashboard and continue your housing journey.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowLogin(true)}
          >
            Sign In
          </button>
        </div>
        
        <div className="card">
          <h3 className="card-title">New Users</h3>
          <p className="card-text">Create your account and join our supportive recovery housing community.</p>
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
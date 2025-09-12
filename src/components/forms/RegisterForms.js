// src/components/forms/RegisterForms.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const RegisterForm = ({ onBackToLanding, preSelectedRole }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // ✅ UPDATED: Added employer role option with role IDs matching landing page
  const roles = [
    { 
      id: 'applicant', 
      label: 'Housing Seekers', 
      description: 'Seeking housing and compatible roommates',
      className: 'role-card-housing-seeker'
    },
    { 
      id: 'peer', 
      label: 'Peer Support Specialists', 
      description: 'Providing peer support services',
      className: 'role-card-peer-support'
    },
    { 
      id: 'landlord', 
      label: 'Property Owners', 
      description: 'Offering recovery-friendly housing',
      className: 'role-card-property-owner'
    },
    { 
      id: 'employer', 
      label: 'Recovery-Friendly Employers', 
      description: 'Offering second-chance employment opportunities',
      className: 'role-card-employer'
    }
  ];

  // ✅ NEW: Handle pre-selected role from landing page
  useEffect(() => {
    if (preSelectedRole && !selectedRoles.includes(preSelectedRole)) {
      setSelectedRoles([preSelectedRole]);
    }
  }, [preSelectedRole]);

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
    setLocalError('');
  };

  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return false;
    }
    
    if (selectedRoles.length === 0) {
      setLocalError('Please select at least one role');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLocalError('');
    clearError();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      firstName,
      lastName,
      roles: selectedRoles
    };

    console.log('🔄 RegisterForm submitting:', { email, userData });

    const { success: signUpSuccess, error: signUpError } = await signUp(email, password, userData);
    
    if (signUpSuccess) {
      console.log('✅ Registration successful - redirecting to simplified onboarding flow');
      setSuccess(true);
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedRoles([]);
      
      // ✅ FIXED: Navigate to /app which will trigger the simplified onboarding flow in MainApp
      setTimeout(() => {
        navigate('/app');
      }, 2000);
    } else {
      console.error('❌ Registration failed:', signUpError);
    }
  };

  const currentError = localError || error;

  if (success) {
    return (
      <div className="content">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card">
            <div className="alert alert-success">
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--success-text)' }}>Welcome to Recovery Housing Connect! 🎉</h3>
              <p style={{ margin: '0' }}>
                Account created successfully! Please check your email to verify your account if prompted.
              </p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="text-gray-600 mt-3">
                Taking you to your personalized dashboard...
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginTop: '10px' }}>
                You'll be guided through setting up your profile based on your selected role(s).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h2 className="form-title">Create Account</h2>
          
          {currentError && (
            <div className="alert alert-error">
              {currentError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
                  required
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
                  required
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
                required
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
                  required
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
            
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="label">Select Your Role(s)</label>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '15px' }}>
                Choose the role(s) that best describe how you'll use the platform. You can select multiple roles:
              </p>
              {preSelectedRole && (
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--secondary-teal)', 
                  marginBottom: '15px',
                  fontWeight: 600
                }}>
                  ✓ Pre-selected based on your choice from the homepage
                </p>
              )}
              <div className="grid-auto">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className={`role-card ${role.className} ${selectedRoles.includes(role.id) ? 'selected' : ''}`}
                    onClick={() => !loading && toggleRole(role.id)}
                    style={{
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      position: 'relative'
                    }}
                  >
                    <h4 className="role-title">{role.label}</h4>
                    <p className="role-description">{role.description}</p>
                    {selectedRoles.includes(role.id) && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'var(--secondary-teal)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* ✅ CRITICAL: Side-by-side button layout using button-grid */}
            <div className="button-grid">
              {onBackToLanding && (
                <button 
                  className="btn btn-outline"
                  onClick={onBackToLanding}
                  disabled={loading}
                  type="button"
                >
                  Back to Home
                </button>
              )}
              <button 
                type="submit"
                className={`btn btn-primary ${loading ? 'disabled' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex-center">
                    <LoadingSpinner size="small" />
                    <span style={{ marginLeft: '8px' }}>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
// src/components/auth/RegisterForm.js - FIXED userData structure
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import landingStyles from '../../pages/Landing.module.css';
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

  // ✅ FIXED: Corrected role IDs to match schema constraints
  const roles = [
    { 
      id: 'applicant', 
      label: 'Housing Seekers', 
      description: 'Seeking housing and compatible roommates',
      className: 'role-card-housing-seeker'
    },
    { 
      id: 'peer-support',  // ✅ FIXED: Changed from 'peer' to 'peer-support'
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

  // Handle pre-selected role from landing page
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

    // ✅ FIXED: Structure userData to match trigger expectations (snake_case)
    const userData = {
      first_name: firstName,    // ✅ FIXED: snake_case to match trigger
      last_name: lastName,      // ✅ FIXED: snake_case to match trigger
      role: selectedRoles[0],   // Pass first role to trigger (single string)
      all_roles: selectedRoles  // Include all roles for potential future use
    };

    console.log('🔄 RegisterForm submitting:', { email, userData });

    const result = await signUp(email, password, userData);
    
    if (result && result.data && !result.error) {
      console.log('✅ Registration successful - redirecting to simplified onboarding flow');
      setSuccess(true);
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedRoles([]);
      
      // Navigate to /app which will trigger the simplified onboarding flow in MainApp
      setTimeout(() => {
        navigate('/app');
      }, 2000);
    } else {
      console.error('❌ Registration failed:', result?.error);
      // Error will be set in the AuthContext, so it will be displayed via the error state
    }
  };

  const currentError = localError || error?.message;

  if (success) {
    return (
      <div className="content">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card">
            <div className="alert alert-success">
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--success-text)' }}>Welcome to Recovery Housing Connect!</h3>
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
        
        {/* ✅ UPDATED: Use Landing page styling with enhanced selected state */}
        <div className={landingStyles.roleGrid}>
          {roles.map(role => {
            const isSelected = selectedRoles.includes(role.id);
            
            // Get the appropriate role card class
            let roleCardClass = landingStyles.roleCard;
            if (role.id === 'applicant') roleCardClass += ` ${landingStyles.roleCardHousingSeeker}`;
            if (role.id === 'peer-support') roleCardClass += ` ${landingStyles.roleCardPeerSupport}`;
            if (role.id === 'landlord') roleCardClass += ` ${landingStyles.roleCardPropertyOwner}`;
            if (role.id === 'employer') roleCardClass += ` ${landingStyles.roleCardEmployer}`;
            
            // Enhanced styling for selected state
            const selectedStyle = isSelected ? {
              transform: 'translateY(-6px)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
              borderWidth: '3px',
              ...(role.id === 'applicant' && {
                borderColor: 'var(--primary-purple)',
                background: 'linear-gradient(135deg, rgba(160, 32, 240, 0.25) 0%, rgba(160, 32, 240, 0.1) 100%)'
              }),
              ...(role.id === 'peer-support' && {
                borderColor: 'var(--secondary-teal)',
                background: 'linear-gradient(135deg, rgba(32, 178, 170, 0.25) 0%, rgba(32, 178, 170, 0.1) 100%)'
              }),
              ...(role.id === 'landlord' && {
                borderColor: 'var(--gold-dark)',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.1) 100%)'
              }),
              ...(role.id === 'employer' && {
                borderColor: 'var(--coral)',
                background: 'linear-gradient(135deg, rgba(255, 111, 97, 0.25) 0%, rgba(255, 111, 97, 0.1) 100%)'
              })
            } : {};
            
            return (
              <div
                key={role.id}
                className={roleCardClass}
                onClick={() => !loading && toggleRole(role.id)}
                style={{
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  ...selectedStyle
                }}
              >
                {/* Role Icon */}
                <div className={landingStyles.roleIcon}>
                  {role.id === 'applicant' && '🏠'}
                  {role.id === 'peer-support' && '🤝'}
                  {role.id === 'landlord' && '🏢'}
                  {role.id === 'employer' && '💼'}
                </div>
                
                {/* Role Title */}
                <h4 className={landingStyles.roleTitle}>{role.label}</h4>
                
                {/* Role Description */}
                <p className={landingStyles.roleDescription}>{role.description}</p>
                
                {/* Click Hint */}
                <div className={landingStyles.roleClickHint}>
                  {isSelected ? 'Selected ✓' : 'Click to select →'}
                </div>
                
                {/* Selection Checkmark */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'var(--secondary-teal)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(32, 178, 170, 0.4)',
                    animation: 'pulse 0.5s ease-in-out'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
            
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
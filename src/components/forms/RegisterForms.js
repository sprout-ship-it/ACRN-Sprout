// src/components/forms/RegisterForms.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const RegisterForm = ({ onBackToLanding }) => {
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

  const roles = [
    { id: 'applicant', label: 'Applicant', description: 'Seeking housing and roommates' },
    { id: 'peer', label: 'Peer Support', description: 'Providing peer support services' },
    { id: 'landlord', label: 'Landlord', description: 'Offering recovery-friendly housing' }
  ];

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
      console.log('✅ Registration successful');
      setSuccess(true);
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedRoles([]);
      
      // Navigate to onboarding after brief success display
      setTimeout(() => {
        navigate('/onboarding');
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
              Account created successfully! Please check your email to verify your account.
            </div>
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="text-gray-600 mt-3">
                Redirecting to profile setup...
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
              <div className="grid-auto">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className={`checkbox-item ${selectedRoles.includes(role.id) ? 'selected' : ''}`}
                    onClick={() => !loading && toggleRole(role.id)}
                    style={{
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div>
                      <h4 className="card-title">{role.label}</h4>
                      <p className="card-text">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              type="submit"
              className={`btn btn-primary ${loading ? 'disabled' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {onBackToLanding && (
            <button 
              className="btn btn-outline mt-3"
              onClick={onBackToLanding}
              disabled={loading}
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
// src/components/forms/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const LoginForm = ({ onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    clearError();
    
    const { success } = await signIn(email, password);
    
    if (success) {
      // Navigation will be handled by MainApp component
      // based on authentication state
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="content">
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="card">
          <h2 className="form-title">Sign In</h2>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
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
              type="submit"
              className={`btn btn-primary ${loading ? 'disabled' : ''}`}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <div className="flex-center">
                  <LoadingSpinner size="small" />
                  <span style={{ marginLeft: '8px' }}>Signing In...</span>
                </div>
              ) : (
                'Sign In'
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

export default LoginForm;
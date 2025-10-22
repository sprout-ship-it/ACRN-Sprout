// src/components/auth/LoginForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import '../../styles/global.css';


const LoginForm = ({ onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error, clearError, isAuthenticated } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    clearError();
    
    const { success } = await signIn(email, password);
    
    if (success) {
    navigate('/app');
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
                    fontSize: '0.9rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-light-cream)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            {/* ✅ FIXED: Improved button layout with horizontal spread */}
            <div className="form-actions-horizontal">
              {onBackToLanding && (
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={onBackToLanding}
                  disabled={loading}
                >
                  Back to Home
                </button>
              )}
              
              <button 
                type="submit"
                className="btn btn-primary"
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
            </div>
          </form>

          {/* ✅ NEW: Additional helpful actions */}
          <div className="form-footer">
            <div className="text-center">
              <p className="text-gray-600">
                Forgot your password?{' '}
                <button
                  type="button"
                  className="text-link"
                  onClick={() => alert('Password reset feature coming soon. Please contact support for assistance.')}
                  disabled={loading}
                >
                  Reset Password
                </button>
              </p>
              <p className="text-gray-600 mt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-link"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Sign Up Here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Help section */}
        <div className="card mt-4" style={{ background: 'var(--bg-light-cream)' }}>
          <div className="text-center">
            <h4 className="card-title">Need Help?</h4>
            <p className="text-gray-600">
              If you're having trouble signing in, please contact our support team for assistance.
            </p>
            <div className="mt-3">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => window.open('mailto:support@recoveryhousingconnect.com', '_blank')}
                disabled={loading}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ FIXED: Enhanced CSS for proper button layout and improved styling
const loginFormStyles = `
.form-actions-horizontal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.form-actions-horizontal .btn {
  flex: 1;
  max-width: 200px;
}

.form-actions-horizontal .btn:only-child {
  margin-left: auto;
  margin-right: 0;
  flex: none;
}

.form-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-beige);
}

.text-link {
  background: none;
  border: none;
  color: var(--primary-purple);
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  transition: color 0.2s ease;
}

.text-link:hover {
  color: var(--secondary-purple);
  text-decoration: none;
}

.text-link:disabled {
  color: var(--gray-400);
  cursor: not-allowed;
  text-decoration: none;
}

.password-toggle:hover {
  background-color: var(--bg-light-cream) !important;
}

.password-toggle:focus {
  outline: 2px solid var(--primary-purple);
  outline-offset: 2px;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Loading spinner for small size */
.loading-spinner.small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-actions-horizontal {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .form-actions-horizontal .btn {
    width: 100%;
    max-width: none;
  }
  
  .form-actions-horizontal .btn:only-child {
    margin-left: 0;
  }
}

/* Small mobile screens */
@media (max-width: 480px) {
  .content > div {
    margin: 0 1rem;
  }
  
  .card {
    padding: 1.5rem 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}

/* Improved focus states for accessibility */
.input:focus {
  outline: 2px solid var(--primary-purple);
  outline-offset: 2px;
  border-color: var(--primary-purple);
}

.btn:focus {
  outline: 2px solid var(--primary-purple);
  outline-offset: 2px;
}

/* Enhanced button states */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Improved alert styling */
.alert {
  margin-bottom: 1.5rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}

/* Form spacing improvements */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-beige);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  border-color: var(--primary-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input::placeholder {
  color: var(--gray-500);
}
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('login-form-styles');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.id = 'login-form-styles';
    styleElement.textContent = loginFormStyles;
    document.head.appendChild(styleElement);
  }
}

export default LoginForm;
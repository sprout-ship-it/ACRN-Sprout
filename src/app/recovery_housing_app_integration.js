import React, { useState, useEffect } from 'react';
import '../../styles/global.css';

// ==================== MOCK COMPONENTS ====================

// Simplified component placeholders for demonstration
const BasicProfileFormMini = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    dateOfBirth: '',
    phone: '',
    gender: '',
    sex: ''
  });

  const handleSubmit = () => {
    onSave && onSave(formData);
  };

  return (
    <div className="card">
      <h3 className="card-title">Complete Your Basic Profile</h3>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">First Name</label>
          <input
            className="input"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="label">Last Name</label>
          <input
            className="input"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="label">Date of Birth</label>
        <input
          className="input"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
        />
      </div>
      
      <div className="form-group">
        <label className="label">Phone Number</label>
        <input
          className="input"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="(555) 123-4567"
        />
      </div>
      
      <div className="grid-2 mt-4">
        {onCancel && (
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="btn btn-primary" onClick={handleSubmit}>
          Save Profile
        </button>
      </div>
    </div>
  );
};

const MatchingProfileFormMini = ({ user, userRole, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    preferredLocation: '',
    recoveryStage: '',
    aboutMe: '',
    lookingFor: ''
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = () => {
    onSave && onSave(formData);
  };

  return (
    <div className="card">
      <h3 className="card-title">
        {userRole === 'peer' ? 'Peer Support Profile' : 'Roommate Matching Profile'}
      </h3>
      
      {step === 1 && (
        <>
          <div className="form-group">
            <label className="label">Preferred Location</label>
            <input
              className="input"
              type="text"
              value={formData.preferredLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredLocation: e.target.value }))}
              placeholder="City, State"
            />
          </div>
          
          <div className="form-group">
            <label className="label">Recovery Stage</label>
            <select
              className="input"
              value={formData.recoveryStage}
              onChange={(e) => setFormData(prev => ({ ...prev, recoveryStage: e.target.value }))}
            >
              <option value="">Select recovery stage</option>
              <option value="early">Early recovery (0-90 days)</option>
              <option value="stable">Stable recovery (3 months - 1 year)</option>
              <option value="maintained">Maintained recovery (1+ years)</option>
              <option value="long-term">Long-term recovery (5+ years)</option>
            </select>
          </div>
          
          <button className="btn btn-primary" onClick={handleNext}>
            Next Step
          </button>
        </>
      )}
      
      {step === 2 && (
        <>
          <div className="form-group">
            <label className="label">Tell us about yourself</label>
            <textarea
              className="input"
              value={formData.aboutMe}
              onChange={(e) => setFormData(prev => ({ ...prev, aboutMe: e.target.value }))}
              placeholder="Share your personality, interests, recovery journey..."
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
          </div>
          
          <div className="grid-2">
            <button className="btn btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              Next Step
            </button>
          </div>
        </>
      )}
      
      {step === 3 && (
        <>
          <div className="form-group">
            <label className="label">What are you looking for?</label>
            <textarea
              className="input"
              value={formData.lookingFor}
              onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
              placeholder="Describe your ideal roommate and living situation..."
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
          </div>
          
          <div className="grid-2">
            <button className="btn btn-outline" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Save Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================

const CompleteRecoveryHousingApp = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState({
    basicProfile: false,
    matchingProfile: false,
    activeMatching: false,
    hasMatches: false
  });

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { id: 'edit-profile', label: 'Edit Profile', icon: '👤' },
      { id: 'view-match-requests', label: 'Match Requests', icon: '🤝' }
    ];

    if (user.roles.includes('applicant') || user.roles.includes('peer')) {
      baseItems.push(
        { id: 'add-matching-profile', label: 'Matching Profile', icon: '📝' },
        { id: 'find-matches', label: 'Find Matches', icon: '🔍' }
      );
    }

    if (user.roles.includes('landlord')) {
      baseItems.push({ id: 'manage-properties', label: 'Properties', icon: '🏢' });
    }

    if (userProgress.hasMatches) {
      baseItems.push({ id: 'match-dashboard', label: 'Match Dashboard', icon: '🎯' });
    }

    return baseItems;
  };

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
    
    // Simulate checking user progress
    setTimeout(() => {
      setUserProgress({
        basicProfile: Math.random() > 0.5,
        matchingProfile: Math.random() > 0.5,
        activeMatching: Math.random() > 0.5,
        hasMatches: Math.random() > 0.3
      });
    }, 500);
  };

  // Handle registration
  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentView('onboarding');
    setUserProgress({
      basicProfile: false,
      matchingProfile: false,
      activeMatching: false,
      hasMatches: false
    });
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setUserProgress({
      basicProfile: false,
      matchingProfile: false,
      activeMatching: false,
      hasMatches: false
    });
  };

  // Handle profile completion
  const handleBasicProfileSave = (profileData) => {
    setUserProgress(prev => ({ ...prev, basicProfile: true }));
    setCurrentView('matching-profile-setup');
  };

  const handleMatchingProfileSave = (profileData) => {
    setUserProgress(prev => ({ ...prev, matchingProfile: true, activeMatching: true }));
    setCurrentView('dashboard');
    alert('Profile saved! You can now start finding matches.');
  };

  // Get progress step number
  const getCurrentStep = () => {
    if (!userProgress.basicProfile) return 1;
    if (!userProgress.matchingProfile) return 2;
    if (!userProgress.activeMatching) return 3;
    if (!userProgress.hasMatches) return 3;
    return 4;
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    const currentStep = getCurrentStep();
    const steps = [
      { number: 1, label: 'Basic Profile', completed: userProgress.basicProfile },
      { number: 2, label: 'Matching Profile', completed: userProgress.matchingProfile },
      { number: 3, label: 'Find Matches', completed: userProgress.activeMatching },
      { number: 4, label: 'Connect & Housing', completed: userProgress.hasMatches }
    ];

    return (
      <div className="progress-indicator">
        <div className="progress-title">Your Recovery Housing Journey</div>
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={step.number} className="progress-step">
              {index < steps.length - 1 && (
                <div className={`step-connector ${step.completed ? 'step-connector-active' : ''}`} />
              )}
              <div className={`step-number ${
                currentStep === step.number ? 'step-number-active' : 
                step.completed ? 'step-number-completed' : 'step-number-inactive'
              }`}>
                {step.completed ? '✓' : step.number}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render main content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'landing':
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
              </p>
            </div>
            
            <div className="grid-2">
              <div className="card">
                <h3 className="card-title">Existing Users</h3>
                <p className="card-text">Sign in to your account to access your dashboard and continue your housing journey.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentView('login')}
                >
                  Sign In
                </button>
              </div>
              
              <div className="card">
                <h3 className="card-title">New Users</h3>
                <p className="card-text">Create your account and join our supportive recovery housing community.</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentView('register')}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        );

      case 'login':
        return <LoginForm onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;

      case 'register':
        return <RegisterForm onRegister={handleRegister} onBack={() => setCurrentView('landing')} />;

      case 'onboarding':
        return (
          <div className="content">
            {renderProgressIndicator()}
            <BasicProfileFormMini 
              user={user} 
              onSave={handleBasicProfileSave}
              onCancel={() => setCurrentView('dashboard')}
            />
          </div>
        );

      case 'matching-profile-setup':
        return (
          <div className="content">
            {renderProgressIndicator()}
            <MatchingProfileFormMini 
              user={user}
              userRole={user?.roles[0] || 'applicant'}
              onSave={handleMatchingProfileSave}
              onCancel={() => setCurrentView('dashboard')}
            />
          </div>
        );

      case 'dashboard':
        return <Dashboard user={user} userProgress={userProgress} />;

      default:
        return (
          <div className="content">
            <div className="empty-state">
              <div className="empty-state-icon">🚧</div>
              <h3 className="empty-state-title">Feature Coming Soon</h3>
              <p>We're working hard to bring you this feature. Stay tuned!</p>
              <button
                className="btn btn-outline mt-3"
                onClick={() => setCurrentView('dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="container">
        {/* Header */}
        <header className="app-header">
          <h1 className="header-title">Recovery Housing Connect</h1>
          <p className="header-subtitle">Building Supportive Communities Through Meaningful Connections</p>
          
          {user && (
            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </header>
        
        {/* Navigation */}
        {user && (
          <nav className="navigation">
            <ul className="nav-list">
              {getNavigationItems().map(item => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-button ${currentView === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentView(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span> {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        
        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
};

// ==================== SUPPORTING COMPONENTS ====================

const LoginForm = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    onLogin({ 
      email, 
      roles: ['applicant'], 
      firstName: 'Demo', 
      lastName: 'User',
      uuid: crypto.randomUUID()
    });
  };

  return (
    <div className="content">
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="card">
          <h2 className="form-title">Sign In</h2>
          
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={handleSubmit}>
            Sign In
          </button>
          
          <button className="btn btn-outline mt-3" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = ({ onRegister, onBack }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

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
  };

  const handleSubmit = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (selectedRoles.length === 0) {
      alert('Please select at least one role');
      return;
    }
    
    onRegister({ 
      firstName, 
      lastName, 
      email, 
      roles: selectedRoles,
      uuid: crypto.randomUUID()
    });
  };

  return (
    <div className="content">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h2 className="form-title">Create Account</h2>
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="label">First Name</label>
              <input
                className="input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
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
            />
          </div>
          
          <div className="form-group">
            <label className="label">Select Your Role(s)</label>
            <div className="grid-auto">
              {roles.map(role => (
                <div
                  key={role.id}
                  className={`checkbox-item ${selectedRoles.includes(role.id) ? 'selected' : ''}`}
                  onClick={() => toggleRole(role.id)}
                >
                  <div>
                    <h4 className="card-title">{role.label}</h4>
                    <p className="card-text">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={handleSubmit}>
            Create Account
          </button>
          
          <button className="btn btn-outline mt-3" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, userProgress }) => {
  const getDashboardCards = () => {
    const cards = [];
    
    // Progress-based suggestions
    if (!userProgress.basicProfile) {
      cards.push({
        id: 'complete-profile',
        label: 'Complete Basic Profile',
        description: 'Finish setting up your profile to get started',
        color: 'var(--coral)',
        priority: true
      });
    }
    
    if (!userProgress.matchingProfile && userProgress.basicProfile) {
      cards.push({
        id: 'setup-matching',
        label: 'Setup Matching Profile',
        description: 'Configure your preferences to find compatible matches',
        color: 'var(--gold)',
        priority: true
      });
    }
    
    // Standard cards
    cards.push(
      { id: 'edit-profile', label: 'Edit Profile', description: 'Update your basic information', color: 'var(--primary-purple)' },
      { id: 'view-match-requests', label: 'View Match Requests', description: 'See pending and completed matches', color: 'var(--secondary-teal)' }
    );
    
    if (user.roles.includes('applicant') || user.roles.includes('peer')) {
      cards.push(
        { id: 'find-matches', label: 'Find Matches', description: 'Discover compatible roommates', color: 'var(--secondary-teal)' }
      );
    }
    
    if (user.roles.includes('landlord')) {
      cards.push(
        { id: 'manage-properties', label: 'Manage Properties', description: 'Add and manage your rental properties', color: 'var(--secondary-purple)' }
      );
    }
    
    if (userProgress.hasMatches) {
      cards.push(
        { id: 'match-dashboard', label: 'Match Dashboard', description: 'Access housing search and peer support', color: 'var(--gold)' }
      );
    }
    
    return cards;
  };

  return (
    <div className="content">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {user.firstName}!</h1>
        <p className="welcome-text">
          Your roles: {user.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
        </p>
      </div>
      
      <div className="dashboard-grid">
        {getDashboardCards().map(card => (
          <div
            key={card.id}
            className="dashboard-card"
            style={{ borderColor: card.color }}
            onClick={() => alert(`Navigate to ${card.label}`)}
          >
            {card.priority && (
              <div className="badge badge-warning mb-2">
                Recommended
              </div>
            )}
            <h3 className="card-title" style={{ color: card.color }}>
              {card.label}
            </h3>
            <p className="card-text">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompleteRecoveryHousingApp;
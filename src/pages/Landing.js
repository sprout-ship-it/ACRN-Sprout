// src/pages/Landing.js - UPDATED WITH CSS MODULES
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import styles from './Landing.module.css';

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
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome to Recovery Housing Connect</h1>
        <p className={styles.welcomeText}>
          Our comprehensive platform connects the entire recovery housing ecosystem: 
          individuals in recovery seeking compatible roommates, recovery-friendly landlords, 
          dedicated peer support specialists, and employers committed to second-chance hiring.
        </p>
      </div>

      {/* Sign In/Register cards */}
      <div className={styles.authGrid}>
        <div className={styles.authCard}>
          <h3 className={styles.authCardTitle}>Existing Users</h3>
          <p className={styles.authCardText}>
            Sign in to your account to access your dashboard and continue your recovery housing journey.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowLogin(true)}
          >
            Sign In
          </button>
        </div>
        
        <div className={styles.authCard}>
          <h3 className={styles.authCardTitle}>New Users</h3>
          <p className={styles.authCardText}>
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

      {/* Role selection section */}
      <div className={styles.roleSelectionCard}>
        <h3 className={styles.roleSelectionTitle}>Who Can Join Our Platform?</h3>
        <p className={`${styles.roleSelectionSubtitle} text-center mb-4`}>
          <strong>Click on your role below to create an account and get started!</strong>
        </p>
        <div className={styles.roleGrid}>
          <div 
            className={`${styles.roleCard} ${styles.roleCardHousingSeeker}`} 
            onClick={() => handleRoleClick('applicant')}
          >
            <div className={styles.roleIcon}>🏠</div>
            <h4 className={styles.roleTitle}>Housing Seekers</h4>
            <p className={styles.roleDescription}>
              Individuals in recovery looking for compatible roommates and supportive housing environments.
            </p>
            <div className={styles.roleClickHint}>Click to register →</div>
          </div>
          
          <div 
            className={`${styles.roleCard} ${styles.roleCardPeerSupport}`} 
            onClick={() => handleRoleClick('peer')}
          >
            <div className={styles.roleIcon}>🤝</div>
            <h4 className={styles.roleTitle}>Peer Support Specialists</h4>
            <p className={styles.roleDescription}>
              Licensed professionals offering guidance and support throughout the recovery journey.
            </p>
            <div className={styles.roleClickHint}>Click to register →</div>
          </div>
          
          <div 
            className={`${styles.roleCard} ${styles.roleCardPropertyOwner}`} 
            onClick={() => handleRoleClick('landlord')}
          >
            <div className={styles.roleIcon}>🏢</div>
            <h4 className={styles.roleTitle}>Property Owners</h4>
            <p className={styles.roleDescription}>
              Landlords committed to providing recovery-friendly housing options and supportive rental policies.
            </p>
            <div className={styles.roleClickHint}>Click to register →</div>
          </div>
          
          <div 
            className={`${styles.roleCard} ${styles.roleCardEmployer}`} 
            onClick={() => handleRoleClick('employer')}
          >
            <div className={styles.roleIcon}>💼</div>
            <h4 className={styles.roleTitle}>Recovery-Friendly Employers</h4>
            <p className={styles.roleDescription}>
              Companies offering second-chance employment and creating inclusive workplaces for individuals in recovery.
            </p>
            <div className={styles.roleClickHint}>Click to register →</div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoCardTitle}>Here's How It Works:</h3>
        <p className={styles.howItWorksText}>
          First, we match you with compatible roommates based on recovery goals, lifestyle preferences, 
          and personal compatibility. Once matched, you'll search for local housing together based on 
          your shared criteria. We also connect your matched pair with local peer support specialists 
          who align with your unique recovery preferences. Finally, discover employment opportunities 
          with employers who understand and support the recovery journey.
          <br /><br />
          Join our community today and find the supportive housing and employment environment you deserve.
        </p>
      </div>

      {/* Platform benefits section */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoCardTitle}>Why Choose Recovery Housing Connect?</h3>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>
            <h4 className={styles.benefitTitle}>🎯 Comprehensive Matching</h4>
            <p className={styles.benefitDescription}>
              Our advanced algorithm considers recovery stage, lifestyle preferences, and personal compatibility 
              to create meaningful connections across housing, employment, and support services.
            </p>
          </div>
          
          <div className={styles.benefitItem}>
            <h4 className={styles.benefitTitle}>🔒 Safe & Supportive</h4>
            <p className={styles.benefitDescription}>
              All community members are committed to supporting recovery journeys in a stigma-free, 
              understanding environment designed for long-term success.
            </p>
          </div>
          
          <div className={styles.benefitItem}>
            <h4 className={styles.benefitTitle}>🌐 Complete Ecosystem</h4>
            <p className={styles.benefitDescription}>
              From housing and roommates to employment and peer support - everything you need 
              for a successful recovery journey in one integrated platform.
            </p>
          </div>
          
          <div className={styles.benefitItem}>
            <h4 className={styles.benefitTitle}>💡 Evidence-Based</h4>
            <p className={styles.benefitDescription}>
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
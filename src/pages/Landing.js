// src/pages/Landing.js - STREAMLINED: Ecosystem-focused messaging
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
      {/* ✅ STREAMLINED: Hero section reduced from 60 to 40 words */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome to Sprout</h1>
        <p className={styles.welcomeText}>
          The complete recovery ecosystem platform. We connect individuals in recovery with 
          compatible roommates, recovery-friendly housing and employment, and experienced 
          peer support - all in one integrated platform.
        </p>
      </div>

      {/* Sign In/Register cards */}
      <div className={styles.authGrid}>
        <div className={styles.authCard}>
          <h3 className={styles.authCardTitle}>Existing Users</h3>
          <p className={styles.authCardText}>
            Sign in to access your dashboard and continue building connections.
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
            Join the recovery ecosystem. Select your role below to get started.
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
      </div>

      {/* ✅ REFRAMED: Role cards with value propositions */}
      <div className={styles.roleSelectionCard}>
        <h3 className={styles.roleSelectionTitle}>Join the Recovery Ecosystem</h3>
        <p className={`${styles.roleSelectionSubtitle} text-center mb-4`}>
          <strong>Click your role below to create an account and get started</strong>
        </p>
        <div className={styles.roleGrid}>
          <div 
            className={`${styles.roleCard} ${styles.roleCardHousingSeeker}`} 
            onClick={() => handleRoleClick('applicant')}
          >
            <div className={styles.roleIcon}>🏠</div>
            <h4 className={styles.roleTitle}>Housing Seekers</h4>
            <p className={styles.roleDescription}>
              Find compatible roommates, access recovery-friendly housing, connect with 
              peer support, and discover employment opportunities.
            </p>
            <div className={styles.roleClickHint}>Click to register →</div>
          </div>
          
          <div 
            className={`${styles.roleCard} ${styles.roleCardPeerSupport}`} 
            onClick={() => handleRoleClick('peer-support')}
          >
            <div className={styles.roleIcon}>🤝</div>
            <h4 className={styles.roleTitle}>Peer Support Specialists</h4>
            <p className={styles.roleDescription}>
              Connect with clients seeking support. Build your independent practice or 
              supplement existing work with flexible, a la carte services.
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
              Connect with motivated, pre-screened tenants. Fill vacancies faster while 
              building community goodwill through recovery-friendly practices.
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
              Access motivated candidates committed to positive change. Build your team 
              while demonstrating corporate responsibility and community investment.
            </p>
            <div className={styles.roleClickHint}>Click to register →</div>
          </div>
        </div>
      </div>

      {/* ✅ STREAMLINED: How it works - ecosystem model, reduced from 100 to 50 words */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoCardTitle}>The Recovery Ecosystem</h3>
        <p className={styles.howItWorksText}>
          Housing seekers find compatible roommates and search for properties together. 
          Property owners connect with pre-qualified tenant pairs. Peer support specialists 
          offer services to individuals navigating their recovery journey. Employers discover 
          motivated candidates ready to contribute. <strong>Everyone benefits when the full 
          ecosystem thrives.</strong>
        </p>
      </div>

      {/* ✅ CONSOLIDATED: Benefits reduced from 4 cards to 3, each ~40% shorter */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoCardTitle}>Why Choose Sprout?</h3>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>
            <h4 className={styles.benefitTitle}>🎯 Built for Recovery</h4>
            <p className={styles.benefitDescription}>
              Purpose-built platform addressing housing, employment, and support - not 
              generic services retrofitted for recovery communities.
            </p>
          </div>
          
          <div className={styles.benefitItem}>
            <h4 className={styles.benefitTitle}>🔒 Quality Connections</h4>
            <p className={styles.benefitDescription}>
              Pre-screened users, compatibility matching, and verified recovery-friendly 
              commitments create trust across the ecosystem.
            </p>
          </div>
          
          <div className={styles.benefitItem}>
            <h4 className={styles.benefitTitle}>🌐 Complete Ecosystem</h4>
            <p className={styles.benefitDescription}>
              When individuals thrive, everyone benefits: property owners get quality tenants, 
              employers find motivated team members, specialists build their practice.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ PARTNERSHIP: ACORN footer */}
      <div className={styles.partnershipFooter}>
        <p className={styles.partnershipText}>
          In partnership with <strong>Allied Comprehensive Recovery Network (ACORN)</strong>
        </p>
      </div>
    </div>
  )
}

export default Landing
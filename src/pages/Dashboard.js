// src/pages/Dashboard.js - UPDATED WITH CSS MODULES
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { db } from '../utils/supabase'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { profile, hasRole, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profileStats, setProfileStats] = useState({
    completionPercentage: 0,
    loading: true
  })
  const [profileError, setProfileError] = useState(null)

  // Calculate profile completeness
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    
    const calculateProfileStats = async () => {
      if (isMounted) {
        setProfileError(null)
      }

      if (authLoading || !user) {
        if (isMounted) {
          setProfileStats({ completionPercentage: 0, loading: true })
        }
        return
      }

      if (!profile) {
        timeoutId = setTimeout(() => {
          if (isMounted && !profile) {
            console.warn('Dashboard: Profile still not loaded after timeout, showing fallback')
            setProfileStats({ completionPercentage: 0, loading: false })
            setProfileError('Profile information is taking longer than expected to load.')
          }
        }, 5000)
        
        if (isMounted) {
          setProfileStats({ completionPercentage: 0, loading: true })
        }
        return
      }

      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (!profile.roles?.length) {
        if (isMounted) {
          setProfileStats({ completionPercentage: 0, loading: false })
        }
        return
      }

      try {
        let completionPercentage = 0

        if (hasRole('applicant')) {
          try {
            const { data: applicantProfile } = await db.applicantForms.getByUserId(user.id)
            
            if (applicantProfile && isMounted) {
              let completedFields = 0
              const totalFields = 8
              
              if (applicantProfile.date_of_birth) completedFields++
              if (applicantProfile.phone) completedFields++
              if (applicantProfile.about_me) completedFields++
              if (applicantProfile.looking_for) completedFields++
              if (applicantProfile.recovery_stage) completedFields++
              if (applicantProfile.budget_max) completedFields++
              if (applicantProfile.preferred_city && applicantProfile.preferred_state) completedFields++
              if (applicantProfile.interests?.length > 0) completedFields++
              
              completionPercentage = Math.round((completedFields / totalFields) * 100)
            }
          } catch (error) {
            console.warn('Error loading applicant profile:', error)
          }
        }
        
        else if (hasRole('peer')) {
          try {
            const { data: peerProfile } = await db.peerSupportProfiles.getByUserId(user.id)
            
            if (peerProfile && isMounted) {
              let completedFields = 0
              const totalFields = 6
              
              if (peerProfile.age) completedFields++
              if (peerProfile.phone) completedFields++
              if (peerProfile.bio) completedFields++
              if (peerProfile.specialties?.length > 0) completedFields++
              if (peerProfile.time_in_recovery) completedFields++
              if (peerProfile.supported_recovery_methods?.length > 0) completedFields++
              
              completionPercentage = Math.round((completedFields / totalFields) * 100)
            }
          } catch (error) {
            console.warn('Error loading peer profile:', error)
          }
        }
        
        else if (hasRole('landlord')) {
          completionPercentage = profile?.phone ? 100 : 80
        }

        else if (hasRole('employer')) {
          try {
            const { data: employerProfiles } = await db.employerProfiles.getByUserId(user.id)
            
            if (employerProfiles && employerProfiles.length > 0 && isMounted) {
              const employerProfile = employerProfiles[0]
              let completedFields = 0
              const totalFields = 8
              
              if (employerProfile.company_name) completedFields++
              if (employerProfile.industry) completedFields++
              if (employerProfile.description) completedFields++
              if (employerProfile.recovery_friendly_features?.length > 0) completedFields++
              if (employerProfile.job_types_available?.length > 0) completedFields++
              if (employerProfile.benefits_offered?.length > 0) completedFields++
              if (employerProfile.hiring_practices) completedFields++
              if (employerProfile.profile_completed) completedFields++
              
              completionPercentage = Math.round((completedFields / totalFields) * 100)
            } else {
              completionPercentage = profile?.phone ? 20 : 0
            }
          } catch (error) {
            console.warn('Error loading employer profile:', error)
            completionPercentage = profile?.phone ? 20 : 0
          }
        }

        if (isMounted) {
          setProfileStats({
            completionPercentage,
            loading: false
          })
        }

      } catch (error) {
        console.error('Error calculating profile stats:', error)
        if (isMounted) {
          setProfileStats({ completionPercentage: 0, loading: false })
          setProfileError('Unable to load profile information. Please refresh the page.')
        }
      }
    }

    calculateProfileStats()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user, profile, hasRole, authLoading])

  // Dashboard cards - these are the detailed cards with descriptions
  const getDashboardCards = () => {
    const cards = []
    
    if (!user || !hasRole || typeof hasRole !== 'function') {
      return cards
    }
    
    // Role-specific dashboard cards with CSS module classes
    if (hasRole('applicant')) {
      cards.push(
        { 
          id: 'find-matches', 
          label: 'Find Roommates', 
          description: 'Discover compatible roommates based on your preferences', 
          className: styles.roleCardHousingSeeker,
          path: '/app/find-matches',
          icon: '🔍'
        },
        { 
          id: 'find-peer-support', 
          label: 'Find Peer Support', 
          description: 'Connect with experienced peer support specialists', 
          className: styles.roleCardPeerSupport,
          path: '/app/find-peer-support',
          icon: '👥'
        },
        { 
          id: 'find-employers', 
          label: 'Find Employment', 
          description: 'Discover recovery-friendly job opportunities', 
          className: styles.roleCardEmployer,
          path: '/app/find-employers',
          icon: '💼'
        },
        { 
          id: 'browse-properties', 
          label: 'Browse Housing', 
          description: 'Search for recovery-friendly housing options', 
          className: styles.roleCardPropertyOwner,
          path: '/app/property-search',
          icon: '🏠'
        }
      )
    }
    
    if (hasRole('peer')) {
      cards.push(
        { 
          id: 'peer-dashboard', 
          label: 'Peer Support Dashboard', 
          description: 'Manage your peer support services and clients', 
          className: styles.roleCardPeerSupport,
          path: '/app/peer-dashboard',
          icon: '👥'
        }
      )
    }
    
    if (hasRole('landlord')) {
      cards.push(
        { 
          id: 'manage-properties', 
          label: 'Manage Properties', 
          description: 'Add, edit, and manage your rental properties', 
          className: styles.roleCardPropertyOwner,
          path: '/app/properties',
          icon: '🏢'
        }
      )
    }

    if (hasRole('employer')) {
      cards.push(
        { 
          id: 'manage-employers', 
          label: 'Manage Company Profiles', 
          description: 'Add, edit, and manage your employer profiles', 
          className: styles.roleCardEmployer,
          path: '/app/employers',
          icon: '🏢'
        }
      )
    }
    
    // Universal cards with CSS module classes
    cards.push(
      { 
        id: 'connections', 
        label: 'Connections', 
        description: 'View and manage your match requests and connection status', 
        className: styles.roleCardConnections,
        path: '/app/connections',
        icon: '🤝'
      },
      { 
        id: 'communications', 
        label: 'Communications', 
        description: 'Secure communication hub for your active connections', 
        className: styles.roleCardPeerSupport,
        path: '/app/communications',
        icon: '💬'
      }
    )
    
    return cards
  }

  const handleCardClick = (card) => {
    console.log('🔄 Dashboard card clicked:', card.label, 'Path:', card.path)
    if (card.path) {
      navigate(card.path)
    }
  }

  const getRoleSpecificWelcome = () => {
    if (authLoading || !user) {
      return (
        <div className={styles.welcomeSection}>
          <div className={styles.alertInfo}>
            <div style={{ textAlign: 'center' }}>
              <strong>Loading your dashboard...</strong>
            </div>
          </div>
        </div>
      )
    }

    if (!profile && profileStats.loading) {
      return (
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Welcome back!
          </h1>
          <div className={styles.alertInfo}>
            <div style={{ textAlign: 'center' }}>
              <strong>Loading your profile...</strong>
            </div>
          </div>
        </div>
      )
    }

    if (!profile && !profileStats.loading) {
      return (
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Welcome back!
          </h1>
          {profileError && (
            <div className={styles.alertWarning}>
              <div style={{ textAlign: 'center' }}>
                <strong>⚠️ {profileError}</strong>
                <br />
                <small>You can still access most features below.</small>
              </div>
            </div>
          )}
        </div>
      )
    }

    const roleLabels = profile?.roles?.map(role => {
      switch(role) {
        case 'applicant': return 'Housing Seeker'
        case 'peer': return 'Peer Specialist'
        case 'landlord': return 'Property Owner'
        case 'employer': return 'Recovery-Friendly Employer'
        default: return role.charAt(0).toUpperCase() + role.slice(1)
      }
    }).join(' & ')

    return (
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {profile?.first_name || 'User'}!
        </h1>
        <p className={styles.welcomeText}>
          <strong>Your Role{profile?.roles?.length > 1 ? 's' : ''}:</strong> {roleLabels}
        </p>
        
        {profileError && (
          <div className={styles.alertWarning}>
            <div style={{ textAlign: 'center' }}>
              <strong>⚠️ {profileError}</strong>
            </div>
          </div>
        )}
        
        {!profileStats.loading && !profileError && profileStats.completionPercentage < 100 && (
          <div className={styles.alertInfo}>
            <div style={{ textAlign: 'center' }}>
              <strong>Profile Completion: {profileStats.completionPercentage}%</strong>
              {profileStats.completionPercentage < 100 && (
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                  Complete your profile to unlock all features
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>      
      {getRoleSpecificWelcome()}
      
      {/* Dashboard Cards - Using CSS modules */}
      <div className="card">
        <h3 className="card-title">Your Dashboard</h3>
        <div className="grid-auto">
          {getDashboardCards().map(card => (
            <div
              key={card.id}
              className={`${styles.roleCard} ${card.className}`}
              onClick={() => handleCardClick(card)}
              style={{
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div className="text-center mb-3" style={{ fontSize: '3rem', lineHeight: 1 }}>
                {card.icon}
              </div>
              <h4 className={styles.roleTitle}>
                {card.label}
              </h4>
              <p className={styles.roleDescription}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Multi-Role Access Summary */}
      {profile?.roles?.length > 1 && (
        <div className={`card ${styles.multiRoleSection}`}>
          <h3 className="card-title">Your Multi-Role Access</h3>
          <p className="card-text" style={{ textAlign: 'center', marginBottom: '20px' }}>
            You have access to multiple platform features based on your roles.
          </p>
          <div className={styles.multiRoleGrid}>
            {profile.roles.map(role => (
              <div key={role} className={styles.roleAccessCard}>
                <div className={styles.roleAccessTitle}>
                  {role.charAt(0).toUpperCase() + role.slice(1)} Access:
                </div>
                <div className={styles.roleAccessDescription}>
                  {role === 'applicant' && 'Find roommates, browse properties, connect with peer support, find employment'}
                  {role === 'peer' && 'Offer peer support, manage clients, provide services'}
                  {role === 'landlord' && 'List properties, review applications, manage rentals'}
                  {role === 'employer' && 'Post jobs, review applications, manage company profiles'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
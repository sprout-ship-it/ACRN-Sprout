// src/pages/Dashboard.js - FIXED: Updated imports and service usage
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// ✅ FIXED: Import db object and supabase client, remove individual function imports
import { supabase, db } from '../utils/supabase'

// ✅ UPDATED: Import matching profiles service function (keep this one)
import { getMatchingProfile } from '../utils/database/matchingProfilesService'

// ✅ REMOVED: Individual peer support and employer service imports
// ✅ ADDED: Will use db.peerSupportProfiles and db.employerProfiles instead

import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { profile, hasRole, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profileStats, setProfileStats] = useState({
    completionPercentage: 0,
    loading: true
  })
  const [profileError, setProfileError] = useState(null)

  // ✅ SCHEMA COMPLIANT: Calculate profile completeness using correct services and IDs
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

      // ✅ UPDATED: Check for profile (registrant_profiles record) not just user
      if (!profile?.id) {
        timeoutId = setTimeout(() => {
          if (isMounted && !profile?.id) {
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
            // ✅ FIXED: Pass supabase client as second parameter
            const result = await getMatchingProfile(profile.id, supabase)
            
            if (result.success && result.data && isMounted) {
              const applicantProfile = result.data
              let completedFields = 0
              const totalFields = 10 // Updated for comprehensive profile
              
              // ✅ SCHEMA COMPLIANT: Use exact schema field names
              if (applicantProfile.date_of_birth) completedFields++
              if (applicantProfile.primary_phone) completedFields++
              if (applicantProfile.about_me) completedFields++
              if (applicantProfile.looking_for) completedFields++
              if (applicantProfile.recovery_stage) completedFields++
              if (applicantProfile.budget_min && applicantProfile.budget_max) completedFields++
              if (applicantProfile.primary_city && applicantProfile.primary_state) completedFields++
              if (applicantProfile.interests?.length > 0) completedFields++
              if (applicantProfile.recovery_methods?.length > 0) completedFields++
              if (applicantProfile.spiritual_affiliation) completedFields++
              
              completionPercentage = Math.round((completedFields / totalFields) * 100)
              
              // Use the calculated completion_percentage if available
              if (applicantProfile.completion_percentage !== null && applicantProfile.completion_percentage !== undefined) {
                completionPercentage = applicantProfile.completion_percentage
              }
            }
          } catch (error) {
            console.warn('Error loading applicant profile:', error)
          }
        }
        
        // ✅ FIXED: Use db object for peer support service
        else if (hasRole('peer-support')) {
          try {
            const result = await db.peerSupportProfiles.getByUserId(profile.id)
            
            if (result.success && result.data && isMounted) {
              const peerProfile = result.data
              let completedFields = 0
              const totalFields = 8 // Updated for comprehensive profile
              
              // ✅ SCHEMA COMPLIANT: Use exact schema field names
              if (peerProfile.primary_phone) completedFields++
              if (peerProfile.bio) completedFields++
              if (peerProfile.professional_title) completedFields++
              if (peerProfile.specialties?.length > 0) completedFields++
              if (peerProfile.time_in_recovery) completedFields++
              if (peerProfile.supported_recovery_methods?.length > 0) completedFields++
              if (peerProfile.service_city && peerProfile.service_state) completedFields++
              if (peerProfile.profile_completed) completedFields++
              
              completionPercentage = Math.round((completedFields / totalFields) * 100)
            }
          } catch (error) {
            console.warn('Error loading peer profile:', error)
          }
        }
        
        else if (hasRole('landlord')) {
          // ✅ SCHEMA COMPLIANT: Landlords use registrant_profiles basic info
          completionPercentage = (profile?.first_name && profile?.last_name && profile?.email) ? 100 : 80
        }

        else if (hasRole('employer')) {
          try {
            // ✅ FIXED: Use db object for employer service (when available)
            // For now, fallback to basic profile completion
            completionPercentage = (profile?.first_name && profile?.last_name) ? 20 : 0
            
            // TODO: Implement when db.employerProfiles is available
            // const result = await db.employerProfiles.getByUserId(profile.id)
            // if (result.success && result.data && result.data.length > 0 && isMounted) {
            //   const employerProfile = result.data[0]
            //   // Calculate employer profile completion...
            // }
          } catch (error) {
            console.warn('Error loading employer profile:', error)
            completionPercentage = (profile?.first_name && profile?.last_name) ? 20 : 0
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

  // Rest of the component remains the same...
  const getDashboardCards = () => {
    const cards = []
    
    if (!user || !hasRole || typeof hasRole !== 'function') {
      return cards
    }
    
    // Role-specific dashboard cards
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
    
    if (hasRole('peer-support')) {
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
    
    // Universal cards
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
    console.log('Dashboard card clicked:', card.label, 'Path:', card.path)
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
        case 'peer-support': return 'Peer Specialist'
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
                  {role === 'applicant' && 'Housing Seeker'}
                  {role === 'peer-support' && 'Peer Specialist'}
                  {role === 'landlord' && 'Property Owner'}
                  {role === 'employer' && 'Employer'}
                  {' Access:'}
                </div>
                <div className={styles.roleAccessDescription}>
                  {role === 'applicant' && 'Find roommates, browse properties, connect with peer support, find employment'}
                  {role === 'peer-support' && 'Offer peer support, manage clients, provide services'}
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
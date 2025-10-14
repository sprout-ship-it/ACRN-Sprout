// src/pages/Dashboard.js - RESTRUCTURED: Search cards for applicants only, aligned naming
import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  
  // ✅ FIXED: Add refs to prevent infinite re-renders
  const isCalculatingRef = useRef(false)
  const hasCalculatedRef = useRef(false)
  const isMountedRef = useRef(true)
  const lastProfileIdRef = useRef(null)
  const lastRolesRef = useRef(null)
  
  // ✅ FIXED: Enhanced state with better error tracking
  const [profileStats, setProfileStats] = useState({
    completionPercentage: 0,
    loading: true,
    error: null,
    serviceErrors: {}, // Track specific service errors
    lastCalculated: null
  })
  const [profileError, setProfileError] = useState(null)

  // ✅ FIXED: Service availability check with detailed logging
  const checkServiceAvailability = useCallback(() => {
    const services = {
      peerSupport: {
        available: !!(db && db.peerSupportProfiles && typeof db.peerSupportProfiles.getByUserId === 'function'),
        service: db?.peerSupportProfiles
      },
      matching: {
        available: typeof getMatchingProfile === 'function',
        service: getMatchingProfile
      },
      supabase: {
        available: !!supabase,
        service: supabase
      }
    }
    
    console.log('📊 Dashboard: Service availability check:', {
      peerSupport: services.peerSupport.available,
      matching: services.matching.available,
      supabase: services.supabase.available
    })
    
    return services
  }, [])

  // ✅ SCHEMA COMPLIANT: Calculate profile completeness using correct services and IDs
  const calculateProfileStats = useCallback(async () => {
    // ✅ FIXED: Prevent multiple simultaneous calculations
    if (isCalculatingRef.current || !isMountedRef.current) {
      console.log('📊 Dashboard: Calculation already in progress or component unmounted')
      return
    }

    // ✅ FIXED: Check if we need to recalculate (profile changed)
    const profileChanged = lastProfileIdRef.current !== profile?.id
    const rolesChanged = JSON.stringify(lastRolesRef.current) !== JSON.stringify(profile?.roles)
    
    if (hasCalculatedRef.current && !profileChanged && !rolesChanged) {
      console.log('📊 Dashboard: Stats already calculated and no changes detected')
      return
    }

    // ✅ FIXED: Clear any existing errors when starting fresh calculation
    if (isMountedRef.current) {
      setProfileError(null)
      setProfileStats(prev => ({ ...prev, error: null, serviceErrors: {} }))
    }

    if (authLoading || !user) {
      if (isMountedRef.current) {
        setProfileStats({ 
          completionPercentage: 0, 
          loading: true, 
          error: null,
          serviceErrors: {},
          lastCalculated: null
        })
      }
      return
    }

    // ✅ UPDATED: Check for profile (registrant_profiles record) not just user
    if (!profile?.id) {
      // ✅ FIXED: Set timeout with cleanup to handle delayed profile loading
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current && !profile?.id) {
          console.warn('📊 Dashboard: Profile still not loaded after timeout, showing fallback')
          setProfileStats({ 
            completionPercentage: 0, 
            loading: false, 
            error: null,
            serviceErrors: {},
            lastCalculated: Date.now()
          })
          setProfileError('Profile information is taking longer than expected to load.')
          hasCalculatedRef.current = true
        }
      }, 5000)
      
      if (isMountedRef.current) {
        setProfileStats({ 
          completionPercentage: 0, 
          loading: true, 
          error: null,
          serviceErrors: {},
          lastCalculated: null
        })
      }
      
      // Cleanup timeout when profile loads or component unmounts
      return () => clearTimeout(timeoutId)
    }

    if (!profile.roles?.length) {
      if (isMountedRef.current) {
        setProfileStats({ 
          completionPercentage: 0, 
          loading: false, 
          error: null,
          serviceErrors: {},
          lastCalculated: Date.now()
        })
        hasCalculatedRef.current = true
      }
      return
    }

    // ✅ FIXED: Set calculation flags and update refs
    isCalculatingRef.current = true
    lastProfileIdRef.current = profile.id
    lastRolesRef.current = [...profile.roles]

    try {
      console.log('📊 Dashboard: Calculating profile stats for:', profile.id, 'roles:', profile.roles)
      
      // ✅ FIXED: Check service availability before proceeding
      const services = checkServiceAvailability()
      let completionPercentage = 0
      const serviceErrors = {}

      if (hasRole('applicant')) {
        try {
          if (!services.matching.available) {
            throw new Error('Matching profile service not available')
          }

          // ✅ FIXED: Pass supabase client as second parameter
          const result = await getMatchingProfile(profile.id, supabase)
          
          if (result.success && result.data && isMountedRef.current) {
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
            
            console.log('📊 Dashboard: Applicant profile completion:', completionPercentage + '%')
          }
        } catch (error) {
          console.warn('📊 Dashboard: Error loading applicant profile:', error)
          serviceErrors.applicant = error.message
        }
      }
      
      // ✅ FIXED: Enhanced peer support calculation with service checks
      else if (hasRole('peer-support')) {
        try {
          if (!services.peerSupport.available) {
            throw new Error('Peer support service not available')
          }

          const result = await db.peerSupportProfiles.getByUserId(profile.id)
          
          if (result.success && result.data && isMountedRef.current) {
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
            
            console.log('📊 Dashboard: Peer support profile completion:', completionPercentage + '%')
          } else if (result.error) {
            // ✅ FIXED: Handle specific error types
            if (result.error.code === 'NOT_FOUND' || result.error.message?.includes('No peer support profile found')) {
              console.log('📊 Dashboard: No peer support profile found (normal for new users)')
              completionPercentage = 0
            } else if (result.error.message?.includes('not available')) {
              throw new Error('Peer support service temporarily unavailable')
            } else {
              throw new Error(result.error.message || 'Failed to load peer support profile')
            }
          }
        } catch (error) {
          console.warn('📊 Dashboard: Error loading peer profile:', error)
          serviceErrors.peerSupport = error.message
          
          // ✅ FIXED: Set reasonable fallback for service errors
          if (error.message?.includes('not available')) {
            completionPercentage = 0 // Can't determine completion without service
          }
        }
      }
      
      else if (hasRole('landlord')) {
        // ✅ SCHEMA COMPLIANT: Landlords use registrant_profiles basic info
        completionPercentage = (profile?.first_name && profile?.last_name && profile?.email) ? 100 : 80
        console.log('📊 Dashboard: Landlord profile completion:', completionPercentage + '%')
      }

      else if (hasRole('employer')) {
        try {
          // ✅ FIXED: Use basic profile completion for now, with future employer service support
          completionPercentage = (profile?.first_name && profile?.last_name) ? 20 : 0
          
          // TODO: Implement when db.employerProfiles is available
          // const result = await db.employerProfiles.getByUserId(profile.id)
          // if (result.success && result.data && result.data.length > 0 && isMountedRef.current) {
          //   const employerProfile = result.data[0]
          //   // Calculate employer profile completion...
          // }
          
          console.log('📊 Dashboard: Employer profile completion:', completionPercentage + '%')
        } catch (error) {
          console.warn('📊 Dashboard: Error loading employer profile:', error)
          serviceErrors.employer = error.message
          completionPercentage = (profile?.first_name && profile?.last_name) ? 20 : 0
        }
      }

      // ✅ FIXED: Update state only if component is still mounted
      if (isMountedRef.current) {
        setProfileStats({
          completionPercentage,
          loading: false,
          error: Object.keys(serviceErrors).length > 0 ? 'Some services are temporarily unavailable' : null,
          serviceErrors,
          lastCalculated: Date.now()
        })
        
        hasCalculatedRef.current = true
      }

      console.log('📊 Dashboard: Profile stats calculation complete:', {
        profileId: profile.id,
        roles: profile.roles,
        completion: completionPercentage,
        serviceErrors: Object.keys(serviceErrors)
      })

    } catch (error) {
      console.error('📊 Dashboard: Error calculating profile stats:', error)
      if (isMountedRef.current) {
        setProfileStats({ 
          completionPercentage: 0, 
          loading: false, 
          error: 'Unable to load profile information. Please refresh the page.',
          serviceErrors: { general: error.message },
          lastCalculated: Date.now()
        })
        setProfileError('Unable to load profile information. Please refresh the page.')
        hasCalculatedRef.current = true
      }
    } finally {
      isCalculatingRef.current = false
    }
  }, [user, profile, hasRole, authLoading, checkServiceAvailability])

  // ✅ FIXED: Effect with better dependency management and cleanup
  useEffect(() => {
    calculateProfileStats()
  }, [calculateProfileStats])

  // ✅ FIXED: Component cleanup
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      isCalculatingRef.current = false
    }
  }, [])

  // ✅ FIXED: Function to retry stats calculation
  const retryStatsCalculation = useCallback(() => {
    console.log('📊 Dashboard: Retrying stats calculation')
    hasCalculatedRef.current = false
    setProfileStats(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      serviceErrors: {} 
    }))
    setProfileError(null)
    calculateProfileStats()
  }, [calculateProfileStats])

  // ✅ RESTRUCTURED: Dashboard cards with search functions for applicants only
const getDashboardCards = () => {
  const cards = []
  
  if (!user || !hasRole || typeof hasRole !== 'function') {
    return cards
  }
  
  // ✅ APPLICANT-ONLY: Search/discovery functions as dashboard cards
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
        label: 'Find Support', 
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
        label: 'Find Housing', 
        description: 'Search for recovery-friendly housing options', 
        className: styles.roleCardPropertyOwner,
        path: '/app/property-search',
        icon: '🏠'
      }
    )
  }
  
  // ✅ ROLE-SPECIFIC: Primary management functions (aligned with navigation)
  if (hasRole('peer-support')) {
    cards.push(
      { 
        id: 'peer-dashboard', 
        label: 'Support Hub',
        description: 'Manage your peer support services and clients', 
        className: styles.roleCardPeerSupport,
        path: '/app/peer-dashboard',
        icon: '📊'
      }
    )
  }
  
  if (hasRole('landlord')) {
    cards.push(
      { 
        id: 'manage-properties', 
        label: 'My Properties',
        description: 'Add, edit, and manage your rental properties', 
        className: styles.roleCardPropertyOwner,
        path: '/app/properties',
        icon: '🏢'
      }
    )
  }

  // ✅ NEW: Employer dashboard card
  if (hasRole('employer')) {
    cards.push(
      { 
        id: 'employer-dashboard', 
        label: 'Employer Dashboard',
        description: 'Manage your company profiles and hiring status', 
        className: styles.roleCardEmployer,
        path: '/app/employer-dashboard',
        icon: '💼'
      }
    )
  }
  
  return cards
}

  const handleCardClick = (card) => {
    console.log('Dashboard card clicked:', card.label, 'Path:', card.path)
    if (card.path) {
      navigate(card.path)
    }
  }

  // ✅ FIXED: Enhanced welcome section with service error handling
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
                <br />
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={retryStatsCalculation}
                >
                  Retry Loading
                </button>
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
        
        {/* ✅ FIXED: Enhanced error display with service-specific information */}
        {(profileError || profileStats.error) && (
          <div className={styles.alertWarning}>
            <div style={{ textAlign: 'center' }}>
              <strong>⚠️ {profileError || profileStats.error}</strong>
              {Object.keys(profileStats.serviceErrors).length > 0 && (
                <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                  <small>
                    Affected services: {Object.keys(profileStats.serviceErrors).join(', ')}
                  </small>
                </div>
              )}
              <br />
              <button 
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={retryStatsCalculation}
              >
                Retry Loading
              </button>
            </div>
          </div>
        )}
        
        {!profileStats.loading && !profileError && !profileStats.error && profileStats.completionPercentage < 100 && (
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

        {/* ✅ ADDED: Show completion even with service errors */}
        {profileStats.error && profileStats.completionPercentage > 0 && (
          <div className={styles.alertInfo}>
            <div style={{ textAlign: 'center' }}>
              <strong>Profile Completion: {profileStats.completionPercentage}%</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>
                (Estimated - some services temporarily unavailable)
              </p>
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
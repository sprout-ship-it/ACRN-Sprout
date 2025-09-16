// src/pages/Dashboard.js - Updated with consolidated navigation in specified order
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { db } from '../utils/supabase'
import '../styles/global.css';

const Dashboard = () => {
  const { profile, hasRole, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profileStats, setProfileStats] = useState({
    completionPercentage: 0,
    loading: true
  })
  const [activeNavTab, setActiveNavTab] = useState('dashboard')
  const [profileError, setProfileError] = useState(null)

  // Calculate profile completeness for display only
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmounting
    
    const calculateProfileStats = async () => {
      // Reset error state
      if (isMounted) {
        setProfileError(null)
      }

      // Wait for auth to finish loading and ensure we have basic user data
      if (authLoading || !user) {
        if (isMounted) {
          setProfileStats({ completionPercentage: 0, loading: true })
        }
        return
      }

      // If profile is still loading or null after auth is complete, show loading state
      if (!profile) {
        if (isMounted) {
          setProfileStats({ completionPercentage: 0, loading: true })
        }
        return
      }

      // If profile exists but has no roles, set completion to 0
      if (!profile.roles?.length) {
        if (isMounted) {
          setProfileStats({ completionPercentage: 0, loading: false })
        }
        return
      }

      try {
        let completionPercentage = 0

        // Check role-specific profile completion with better error handling
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
            // Continue with default completion percentage
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
            // Continue with default completion percentage
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

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false
    }
  }, [user, profile, hasRole, authLoading]) // Added authLoading to dependencies

  // Updated dashboard cards - removed Profile and Settings cards
  const getDashboardCards = () => {
    const cards = []
    
    // Only show role-specific cards if hasRole is available and user is loaded
    if (!user || !hasRole || typeof hasRole !== 'function') {
      return cards
    }
    
    // Role-specific primary actions
    if (hasRole('applicant')) {
      cards.push(
        { 
          id: 'find-matches', 
          label: 'Find Roommates', 
          description: 'Discover compatible roommates based on your preferences', 
          className: 'role-card-housing-seeker', // Changed to purple
          path: '/app/find-matches',
          icon: '🔍'
        },
        { 
          id: 'find-peer-support', 
          label: 'Find Peer Support', 
          description: 'Connect with experienced peer support specialists', 
          className: 'role-card-peer-support',
          path: '/app/find-peer-support',
          icon: '👥' // Changed from 🤝 to 👥
        },
        { 
          id: 'find-employers', 
          label: 'Find Employment', 
          description: 'Discover recovery-friendly job opportunities', 
          className: 'role-card-employer',
          path: '/app/find-employers',
          icon: '💼'
        },
        { 
          id: 'browse-properties', 
          label: 'Browse Housing', 
          description: 'Search for recovery-friendly housing options', 
          className: 'role-card-property-owner',
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
          className: 'role-card-peer-support',
          path: '/app/peer-dashboard',
          icon: '👥' // Changed from 🤝 to 👥
        }
      )
    }
    
    if (hasRole('landlord')) {
      cards.push(
        { 
          id: 'manage-properties', 
          label: 'Manage Properties', 
          description: 'Add, edit, and manage your rental properties', 
          className: 'role-card-property-owner',
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
          className: 'role-card-employer',
          path: '/app/employers',
          icon: '🏢'
        }
      )
    }
    
    // Connections card with new styling - black border, grey background (always show if user exists)
    cards.push(
      { 
        id: 'match-requests', 
        label: 'Connections', 
        description: 'View and manage all your connection requests', 
        className: 'role-card-connections', // New class for black border + grey background
        path: '/app/match-requests',
        icon: '🤝'
      }
    )
    
    return cards
  }

  // Consolidated navigation tabs in specified order
  const getNavigationTabs = () => {
    const allTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/app', showAlways: true },
      { id: 'match-requests', label: 'Connections', icon: '🤝', path: '/app/match-requests', showAlways: true },
      { id: 'find-matches', label: 'Find Roommates', icon: '🔍', path: '/app/find-matches', roles: ['applicant'] },
      { id: 'find-peer-support', label: 'Find Support', icon: '👥', path: '/app/find-peer-support', roles: ['applicant'] },
      { id: 'property-search', label: 'Find Housing', icon: '🏠', path: '/app/property-search', roles: ['applicant'] },
      { id: 'find-employers', label: 'Find Employment', icon: '💼', path: '/app/find-employers', roles: ['applicant'] },
      { id: 'messages', label: 'Messages', icon: '💬', path: '/app/messages', showAlways: true },
      { id: 'profile', label: 'My Profile', icon: '👤', path: '/app/profile', showAlways: true },
      { id: 'settings', label: 'Settings', icon: '⚙️', path: '/app/settings', showAlways: true }
    ]

    // Filter tabs based on user roles and showAlways flag
    // Use defensive programming to handle cases where hasRole might not be available yet
    const visibleTabs = allTabs.filter(tab => {
      if (tab.showAlways) return true
      if (tab.roles && typeof hasRole === 'function') {
        return tab.roles.some(role => hasRole(role))
      }
      return false
    })

    // Add role-specific tabs that aren't in the main list (only if hasRole is available)
    if (typeof hasRole === 'function') {
      if (hasRole('peer')) {
        // Insert peer dashboard after find employment but before messages
        const peerTab = { id: 'peer-dashboard', label: 'Peer Dashboard', icon: '👥', path: '/app/peer-dashboard' }
        const messagesIndex = visibleTabs.findIndex(tab => tab.id === 'messages')
        if (messagesIndex > -1) {
          visibleTabs.splice(messagesIndex, 0, peerTab)
        } else {
          visibleTabs.push(peerTab)
        }
      }
      
      if (hasRole('landlord')) {
        // Insert properties after find employment but before messages
        const propertiesTab = { id: 'properties', label: 'My Properties', icon: '🏢', path: '/app/properties' }
        const messagesIndex = visibleTabs.findIndex(tab => tab.id === 'messages')
        if (messagesIndex > -1) {
          visibleTabs.splice(messagesIndex, 0, propertiesTab)
        } else {
          visibleTabs.push(propertiesTab)
        }
      }
      
      if (hasRole('employer')) {
        // Insert employers after find employment but before messages
        const employersTab = { id: 'employers', label: 'My Companies', icon: '🏢', path: '/app/employers' }
        const messagesIndex = visibleTabs.findIndex(tab => tab.id === 'messages')
        if (messagesIndex > -1) {
          visibleTabs.splice(messagesIndex, 0, employersTab)
        } else {
          visibleTabs.push(employersTab)
        }
      }
    }
    
    return visibleTabs
  }

  const handleCardClick = (card) => {
    console.log('🔄 Dashboard card clicked:', card.label, 'Path:', card.path)
    if (card.path) {
      navigate(card.path)
    }
  }

  const handleTabClick = (tab) => {
    setActiveNavTab(tab.id)
    navigate(tab.path)
  }

  // Streamlined welcome message without progress bar
  const getRoleSpecificWelcome = () => {
    // Show loading state if auth is still loading
    if (authLoading || !user) {
      return (
        <div className="welcome-section">
          <div className="alert alert-info">
            <div style={{ textAlign: 'center' }}>
              <strong>Loading your dashboard...</strong>
            </div>
          </div>
        </div>
      )
    }

    // Show minimal welcome if profile hasn't loaded yet
    if (!profile) {
      return (
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back!
          </h1>
          <div className="alert alert-info">
            <div style={{ textAlign: 'center' }}>
              <strong>Loading your profile...</strong>
            </div>
          </div>
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
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome back, {profile?.first_name || 'User'}!
        </h1>
        <p className="welcome-text">
          <strong>Your Role{profile?.roles?.length > 1 ? 's' : ''}:</strong> {roleLabels}
        </p>
        
        {/* Show error if profile stats failed to load */}
        {profileError && (
          <div className="alert alert-warning">
            <div style={{ textAlign: 'center' }}>
              <strong>⚠️ {profileError}</strong>
            </div>
          </div>
        )}
        
        {/* Simple completion status without progress bar */}
        {!profileStats.loading && !profileError && profileStats.completionPercentage < 100 && (
          <div className="alert alert-info">
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
      {/* Consolidated Navigation Tabs in Specified Order */}
      <div className="dashboard-nav mb-5">
        <div className="navigation">
          <ul className="nav-list">
            {getNavigationTabs().map(tab => (
              <li key={tab.id} className="nav-item">
                <button
                  className={`nav-button ${activeNavTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {getRoleSpecificWelcome()}
      
      {/* Main Dashboard Cards with Updated Styling */}
      <div className="card">
        <h3 className="card-title">Your Dashboard</h3>
        <div className="grid-auto">
          {getDashboardCards().map(card => (
            <div
              key={card.id}
              className={`role-card ${card.className}`}
              onClick={() => handleCardClick(card)}
              style={{
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div className="text-center mb-3" style={{ fontSize: '3rem', lineHeight: 1 }}>
                {card.icon}
              </div>
              <h4 className="role-title">
                {card.label}
              </h4>
              <p className="role-description">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Multi-Role Access Summary - only show when profile is fully loaded */}
      {profile?.roles?.length > 1 && (
        <div className="card mt-5">
          <h3 className="card-title">Your Multi-Role Access</h3>
          <p className="card-text" style={{ textAlign: 'center', marginBottom: '20px' }}>
            You have access to multiple platform features based on your roles.
          </p>
          <div className="grid-auto">
            {profile.roles.map(role => (
              <div key={role} className="alert alert-success">
                <strong>{role.charAt(0).toUpperCase() + role.slice(1)} Access:</strong>
                <br />
                {role === 'applicant' && 'Find roommates, browse properties, connect with peer support, find employment'}
                {role === 'peer' && 'Offer peer support, manage clients, provide services'}
                {role === 'landlord' && 'List properties, review applications, manage rentals'}
                {role === 'employer' && 'Post jobs, review applications, manage company profiles'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Styles */}
      <style jsx>{`
        .dashboard-nav {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: 1.5rem;
        }
        
        .dashboard-nav .nav-list {
          display: flex;
          overflow-x: auto;
          padding: 0.5rem;
          scrollbar-width: thin;
        }
        
        .dashboard-nav .nav-item {
          flex: 0 0 auto;
          white-space: nowrap;
        }
        
        .dashboard-nav .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--gray-700);
          transition: all 0.2s ease;
        }
        
        .dashboard-nav .nav-button:hover {
          background: var(--bg-light-cream);
        }
        
        .dashboard-nav .nav-button.active {
          background: var(--primary-purple);
          color: white;
        }
        
        .dashboard-nav .nav-icon {
          font-size: 1.25rem;
        }
        
        @media (max-width: 768px) {
          .dashboard-nav .nav-list {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .dashboard-nav .nav-list::-webkit-scrollbar {
            display: none;
          }
          
          .dashboard-nav .nav-button {
            padding: 0.75rem 0.75rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
// src/pages/Dashboard.js - Integrated with grid navigation + role-specific dashboard cards
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { db } from '../utils/supabase'
import '../styles/global.css';

const Dashboard = () => {
  const { profile, hasRole, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileStats, setProfileStats] = useState({
    completionPercentage: 0,
    loading: true
  })
  const [profileError, setProfileError] = useState(null)
  const [activeNavTab, setActiveNavTab] = useState('dashboard')

  // Set active tab based on current route
  useEffect(() => {
    const path = location.pathname
    if (path === '/app' || path === '/app/') {
      setActiveNavTab('dashboard')
    } else if (path.includes('/match-requests')) {
      setActiveNavTab('match-requests')
    } else if (path.includes('/find-matches')) {
      setActiveNavTab('find-matches')
    } else if (path.includes('/find-peer-support')) {
      setActiveNavTab('find-peer-support')
    } else if (path.includes('/property-search')) {
      setActiveNavTab('property-search')
    } else if (path.includes('/find-employers')) {
      setActiveNavTab('find-employers')
    } else if (path.includes('/messages')) {
      setActiveNavTab('messages')
    } else if (path.includes('/profile')) {
      setActiveNavTab('profile')
    } else if (path.includes('/settings')) {
      setActiveNavTab('settings')
    } else if (path.includes('/peer-dashboard')) {
      setActiveNavTab('peer-dashboard')
    } else if (path.includes('/properties')) {
      setActiveNavTab('properties')
    } else if (path.includes('/employers')) {
      setActiveNavTab('employers')
    }
  }, [location.pathname])

  // Get navigation items for grid
  const getNavigationItems = () => {
    const allItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/app', showAlways: true },
      { id: 'match-requests', label: 'Connections', icon: '🤝', path: '/app/match-requests', showAlways: true, className: 'nav-connections' },
      { id: 'find-matches', label: 'Find Roommates', icon: '🔍', path: '/app/find-matches', roles: ['applicant'], className: 'nav-housing-seeker' },
      { id: 'find-peer-support', label: 'Find Support', icon: '👥', path: '/app/find-peer-support', roles: ['applicant'], className: 'nav-peer-support' },
      { id: 'property-search', label: 'Find Housing', icon: '🏠', path: '/app/property-search', roles: ['applicant'], className: 'nav-property-owner' },
      { id: 'find-employers', label: 'Find Employment', icon: '💼', path: '/app/find-employers', roles: ['applicant'], className: 'nav-employer' },
      { id: 'messages', label: 'Messages', icon: '💬', path: '/app/messages', showAlways: true },
      { id: 'profile', label: 'My Profile', icon: '👤', path: '/app/profile', showAlways: true },
      { id: 'settings', label: 'Settings', icon: '⚙️', path: '/app/settings', showAlways: true }
    ]

    // Filter items based on user roles
    const visibleItems = allItems.filter(item => {
      if (item.showAlways) return true
      if (item.roles && typeof hasRole === 'function') {
        return item.roles.some(role => hasRole(role))
      }
      return false
    })

    // Add role-specific items that aren't in the main list
    if (typeof hasRole === 'function') {
      if (hasRole('peer')) {
        const peerItem = { id: 'peer-dashboard', label: 'Peer Dashboard', icon: '👥', path: '/app/peer-dashboard', className: 'nav-peer-support' }
        const messagesIndex = visibleItems.findIndex(item => item.id === 'messages')
        if (messagesIndex > -1) {
          visibleItems.splice(messagesIndex, 0, peerItem)
        } else {
          visibleItems.push(peerItem)
        }
      }
      
      if (hasRole('landlord')) {
        const propertiesItem = { id: 'properties', label: 'My Properties', icon: '🏢', path: '/app/properties', className: 'nav-property-owner' }
        const messagesIndex = visibleItems.findIndex(item => item.id === 'messages')
        if (messagesIndex > -1) {
          visibleItems.splice(messagesIndex, 0, propertiesItem)
        } else {
          visibleItems.push(propertiesItem)
        }
      }
      
      if (hasRole('employer')) {
        const employersItem = { id: 'employers', label: 'My Companies', icon: '🏢', path: '/app/employers', className: 'nav-employer' }
        const messagesIndex = visibleItems.findIndex(item => item.id === 'messages')
        if (messagesIndex > -1) {
          visibleItems.splice(messagesIndex, 0, employersItem)
        } else {
          visibleItems.push(employersItem)
        }
      }
    }
    
    return visibleItems
  }

  // Calculate profile completeness (same as before)
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

  // Dashboard cards - these are the detailed cards with descriptions (DIFFERENT from navigation)
  const getDashboardCards = () => {
    const cards = []
    
    if (!user || !hasRole || typeof hasRole !== 'function') {
      return cards
    }
    
    // Role-specific dashboard cards with your desired styling
    if (hasRole('applicant')) {
      cards.push(
        { 
          id: 'find-matches', 
          label: 'Find Roommates', 
          description: 'Discover compatible roommates based on your preferences', 
          className: 'role-card-housing-seeker', // Purple
          path: '/app/find-matches',
          icon: '🔍'
        },
        { 
          id: 'find-peer-support', 
          label: 'Find Peer Support', 
          description: 'Connect with experienced peer support specialists', 
          className: 'role-card-peer-support', // Blue
          path: '/app/find-peer-support',
          icon: '👥'
        },
        { 
          id: 'find-employers', 
          label: 'Find Employment', 
          description: 'Discover recovery-friendly job opportunities', 
          className: 'role-card-employer', // Red
          path: '/app/find-employers',
          icon: '💼'
        },
        { 
          id: 'browse-properties', 
          label: 'Browse Housing', 
          description: 'Search for recovery-friendly housing options', 
          className: 'role-card-property-owner', // Yellow
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
          className: 'role-card-peer-support', // Blue
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
          className: 'role-card-property-owner', // Yellow
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
          className: 'role-card-employer', // Red
          path: '/app/employers',
          icon: '🏢'
        }
      )
    }
    
    // Connections card - Black styling
    cards.push(
      { 
        id: 'match-requests', 
        label: 'Connections', 
        description: 'View and manage all your connection requests', 
        className: 'role-card-connections', // Black
        path: '/app/match-requests',
        icon: '🤝'
      }
    )
    
    return cards
  }

  const handleNavClick = (item) => {
    setActiveNavTab(item.id)
    navigate(item.path)
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
        <div className="welcome-section">
          <div className="alert alert-info">
            <div style={{ textAlign: 'center' }}>
              <strong>Loading your dashboard...</strong>
            </div>
          </div>
        </div>
      )
    }

    if (!profile && profileStats.loading) {
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

    if (!profile && !profileStats.loading) {
      return (
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back!
          </h1>
          {profileError && (
            <div className="alert alert-warning">
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
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome back, {profile?.first_name || 'User'}!
        </h1>
        <p className="welcome-text">
          <strong>Your Role{profile?.roles?.length > 1 ? 's' : ''}:</strong> {roleLabels}
        </p>
        
        {profileError && (
          <div className="alert alert-warning">
            <div style={{ textAlign: 'center' }}>
              <strong>⚠️ {profileError}</strong>
            </div>
          </div>
        )}
        
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
      {/* Grid Navigation - Replaces the horizontal scrolling navigation */}
      <nav className="dashboard-grid-nav">
        {getNavigationItems().map(item => (
          <button
            key={item.id}
            className={`nav-grid-item ${item.className || ''} ${activeNavTab === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {getRoleSpecificWelcome()}
      
      {/* Dashboard Cards - These remain as detailed content cards */}
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
      
      {/* Multi-Role Access Summary */}
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

      {/* Grid Navigation Styles */}
      <style jsx>{`
        .dashboard-grid-nav {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
          background: white;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .nav-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          border-radius: 8px;
          border: 2px solid transparent;
          background: #f9fafb;
          color: #6b7280;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .nav-grid-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .nav-grid-item.active {
          color: white;
          border-color: currentColor;
        }

        .nav-grid-item .nav-icon {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .nav-grid-item .nav-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          line-height: 1.2;
        }

        /* Role-specific navigation colors */
        .nav-housing-seeker:hover,
        .nav-housing-seeker.active {
          background: #8b5cf6; /* Purple */
        }

        .nav-peer-support:hover,
        .nav-peer-support.active {
          background: #3b82f6; /* Blue */
        }

        .nav-employer:hover,
        .nav-employer.active {
          background: #ef4444; /* Red */
        }

        .nav-property-owner:hover,
        .nav-property-owner.active {
          background: #f59e0b; /* Yellow/Orange */
        }

        .nav-connections:hover,
        .nav-connections.active {
          background: #374151; /* Dark gray/black */
        }

        /* Default hover for items without specific colors */
        .nav-grid-item:not(.nav-housing-seeker):not(.nav-peer-support):not(.nav-employer):not(.nav-property-owner):not(.nav-connections):hover,
        .nav-grid-item:not(.nav-housing-seeker):not(.nav-peer-support):not(.nav-employer):not(.nav-property-owner):not(.nav-connections).active {
          background: #6366f1; /* Default purple */
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .nav-grid-item .nav-label {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
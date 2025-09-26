// src/components/layout/Navigation.js - SCHEMA-ALIGNED NAVIGATION
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/global.css';

const Navigation = () => {
  const { profile, hasRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Get navigation items based on user roles - FIXED ROLE REFERENCES
  const getNavigationItems = () => {
    const baseItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: '🏠',
        path: '/app'
      }
    ]

    // Role-specific profile management with CORRECT schema role names
    if (hasRole('applicant')) {
      baseItems.push({
        id: 'applicant-profile',
        label: 'My Profile',
        icon: '👤', 
        path: '/app/profile/matching',
        description: 'Complete applicant profile with matching preferences'
      })
    }

    if (hasRole('landlord')) {
      baseItems.push({
        id: 'landlord-profile',
        label: 'My Profile', 
        icon: '👤',
        path: '/app/profile/landlord',
        description: 'Manage your landlord profile and property information'
      })
    }

    // ✅ FIXED: Use 'peer-support' role name from schema
    if (hasRole('peer-support')) {
      baseItems.push({
        id: 'peer-profile',
        label: 'My Profile',
        icon: '👤',
        path: '/app/profile/peer-support', 
        description: 'Manage your peer support specialist profile'
      })
    }

    if (hasRole('employer')) {
      baseItems.push({
        id: 'employer-profile',
        label: 'My Profile',
        icon: '👤',
        path: '/app/employers',
        description: 'Manage your employer profile and company information'
      })
    }

    // ✅ FIXED: Connections only for non-peer-support users
    if (!hasRole('peer-support')) {
      baseItems.push(
        { 
          id: 'connections', 
          label: 'Connections', 
          icon: '🤝',
          path: '/app/connections',
          description: 'View and manage your match requests and connection status',
          className: 'nav-connections'
        }
      )
    }

    // Role-specific feature navigation with schema-aligned paths
    if (hasRole('applicant')) {
      baseItems.push(
        { 
          id: 'find-matches', 
          label: 'Find Roommates', 
          icon: '🔍',
          path: '/app/find-matches',
          description: 'Discover compatible roommates using our matching algorithm',
          className: 'nav-housing-seeker'
        },
        { 
          id: 'browse-housing', 
          label: 'Find Housing', 
          icon: '🏘️',
          path: '/app/property-search',
          description: 'Search for recovery-friendly housing properties',
          className: 'nav-property-owner'
        },
        { 
          id: 'find-peer-support', 
          label: 'Find Support', 
          icon: '👥',
          path: '/app/find-peer-support',
          description: 'Connect with certified peer support specialists',
          className: 'nav-peer-support'
        },
        { 
          id: 'find-employers', 
          label: 'Find Employment', 
          icon: '💼',
          path: '/app/find-employers',
          description: 'Discover recovery-friendly job opportunities',
          className: 'nav-employer'
        }
      )
    }

    if (hasRole('landlord')) {
      baseItems.push(
        { 
          id: 'properties', 
          label: 'My Properties', 
          icon: '🏢',
          path: '/app/properties',
          description: 'Manage your rental properties and housing listings',
          className: 'nav-property-owner'
        },
        { 
          id: 'tenant-requests', 
          label: 'Tenant Requests', 
          icon: '📋',
          path: '/app/tenant-requests',
          description: 'Review tenant applications and housing match requests',
          className: 'nav-property-owner'
        }
      )
    }

    // ✅ FIXED: Peer support navigation with correct role name
    if (hasRole('peer-support')) {
      baseItems.push(
        { 
          id: 'peer-dashboard', 
          label: 'Support Hub', 
          icon: '📊',
          path: '/app/peer-dashboard',
          description: 'Comprehensive peer support client management and match dashboard',
          className: 'nav-peer-support'
        }
      )
    }

    if (hasRole('employer')) {
      baseItems.push(
        { 
          id: 'employer-management', 
          label: 'Manage Profile', 
          icon: '🏢',
          path: '/app/employer-management',
          description: 'Manage your employer profile and job opportunities',
          className: 'nav-employer'
        },
        { 
          id: 'job-candidates', 
          label: 'Job Candidates', 
          icon: '👥',
          path: '/app/job-candidates',
          description: 'Review employment applications and candidate matches',
          className: 'nav-employer'
        }
      )
    }

    // Universal tools - aligned with schema-based communication system
    baseItems.push(
      { 
        id: 'communications', 
        label: 'Messages', 
        icon: '💬',
        path: '/app/communications',
        description: 'Secure messaging with your connections and match requests'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: '⚙️',
        path: '/app/settings',
        description: 'Account preferences, privacy settings, and profile management'
      }
    )

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const handleNavigation = (path) => {
    console.log('🧭 Navigation: Navigating to:', path)
    navigate(path)
  }

  // Better active state detection for nested routes
  const isActive = (path) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/'
    }
    
    // Handle profile routes more intelligently
    if (path.includes('/profile/')) {
      return location.pathname.startsWith(path)
    }
    
    return location.pathname.startsWith(path)
  }

  // ✅ FIXED: Helper to get user's role-specific greeting with correct role names
  const getRoleGreeting = () => {
    if (!profile) return ''
    
    const roles = profile.roles || []
    if (roles.includes('applicant')) return '🏠 Housing Seeker'
    if (roles.includes('landlord')) return '🏢 Property Owner' 
    if (roles.includes('peer-support')) return '🤝 Peer Support Specialist' // Fixed role name
    if (roles.includes('employer')) return '💼 Recovery-Friendly Employer'
    return '👋 Community Member'
  }

  // ✅ NEW: Helper to get completion status for profiles
  const getProfileCompletionStatus = () => {
    if (!profile) return null
    
    // This would integrate with your profile completion logic
    // For now, just show a general tip
    return {
      isComplete: false, // This would be calculated based on actual profile data
      message: 'Complete your profile to unlock all features'
    }
  }

  const completionStatus = getProfileCompletionStatus()

  return (
    <>
      {/* Role indicator for better user context */}
      {profile && (
        <div style={{ 
          padding: '10px 20px', 
          background: 'rgba(160, 32, 240, 0.05)',
          borderBottom: '1px solid var(--border-beige)',
          fontSize: '0.9rem',
          color: 'var(--gray-700)',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          {getRoleGreeting()}
          {profile.roles && profile.roles.length > 1 && (
            <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '8px' }}>
              (+{profile.roles.length - 1} more role{profile.roles.length > 2 ? 's' : ''})
            </span>
          )}
        </div>
      )}

      {/* Grid Navigation */}
      <nav className="dashboard-grid-nav">
        {navigationItems.map(item => {
          const isCurrentlyActive = isActive(item.path)
          
          return (
            <button
              key={item.id}
              className={`nav-grid-item ${item.className || ''} ${isCurrentlyActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={item.description || item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Profile completion indicator */}
      {profile && completionStatus && !completionStatus.isComplete && (
        <div style={{
          padding: '10px 20px',
          background: 'var(--bg-light-cream)',
          fontSize: '0.8rem',
          color: 'var(--gray-600)',
          textAlign: 'center',
          marginTop: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-beige)'
        }}>
          💡 {completionStatus.message}
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
          text-decoration: none;
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

        /* Role-specific navigation colors - aligned with schema roles */
        .nav-housing-seeker:hover,
        .nav-housing-seeker.active {
          background: #8b5cf6; /* Purple for applicants */
        }

        .nav-peer-support:hover,
        .nav-peer-support.active {
          background: #3b82f6; /* Blue for peer support */
        }

        .nav-employer:hover,
        .nav-employer.active {
          background: #ef4444; /* Red for employers */
        }

        .nav-property-owner:hover,
        .nav-property-owner.active {
          background: #f59e0b; /* Orange for landlords */
        }

        .nav-connections:hover,
        .nav-connections.active {
          background: #374151; /* Dark gray for connections */
        }

        /* Default hover for items without specific colors */
        .nav-grid-item:not(.nav-housing-seeker):not(.nav-peer-support):not(.nav-employer):not(.nav-property-owner):not(.nav-connections):hover,
        .nav-grid-item:not(.nav-housing-seeker):not(.nav-peer-support):not(.nav-employer):not(.nav-property-owner):not(.nav-connections).active {
          background: #6366f1; /* Default indigo */
        }

        /* Mobile responsive grid adjustments */
        @media (max-width: 768px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            padding: 8px;
          }
          
          .nav-grid-item {
            padding: 10px 6px;
          }
          
          .nav-grid-item .nav-label {
            font-size: 0.7rem;
          }
          
          .nav-grid-item .nav-icon {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .nav-grid-item .nav-label {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </>
  )
}

export default Navigation
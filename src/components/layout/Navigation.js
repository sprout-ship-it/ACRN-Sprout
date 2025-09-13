// src/components/layout/Navigation.js - FIXED ROUTES
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/global.css';

const Navigation = () => {
  const { profile, hasRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Get navigation items based on user roles - FIXED ROUTE PATHS
  const getNavigationItems = () => {
    const baseItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: '🏠',
        path: '/app'
      }
    ]

    // ✅ FIXED: Role-specific profile management with CORRECT paths
    if (hasRole('applicant')) {
      baseItems.push({
        id: 'applicant-profile',
        label: 'My Profile',
        icon: '👤', 
        path: '/app/profile/matching', // ✅ FIXED: was /comprehensive, now matches MainApp route
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

    if (hasRole('peer')) {
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
        path: '/app/employers', // For employers, profile is managed through employer management
        description: 'Manage your employer profile and company information'
      })
    }

    // Universal navigation items
    baseItems.push(
      { 
        id: 'connections', 
        label: 'Connections', 
        icon: '🤝',
        path: '/app/match-requests',
        description: 'View and manage all your connections and requests'
      }
    )

    // ✅ FIXED: Role-specific feature navigation with CORRECT paths
    if (hasRole('applicant')) {
      baseItems.push(
        { 
          id: 'find-matches', 
          label: 'Find Matches', 
          icon: '🔍',
          path: '/app/find-matches',
          description: 'Discover compatible roommates'
        },
        { 
          id: 'browse-housing', 
          label: 'Browse Housing', 
          icon: '🏘️',
          path: '/app/property-search', // ✅ FIXED: was /properties, now correct for applicants
          description: 'Search for recovery-friendly housing'
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
          description: 'Manage your rental properties'
        },
        { 
          id: 'tenants', 
          label: 'Tenant Requests', 
          icon: '📋',
          path: '/app/tenants',
          description: 'Review tenant applications and requests'
        }
      )
    }

    if (hasRole('peer')) {
      baseItems.push(
        { 
          id: 'peer-dashboard', 
          label: 'Client Dashboard', 
          icon: '📊',
          path: '/app/peer-dashboard',
          description: 'Manage peer support services and clients'
        },
        { 
          id: 'my-clients', 
          label: 'My Clients', 
          icon: '👥',
          path: '/app/clients',
          description: 'View and manage client relationships'
        }
      )
    }

    if (hasRole('employer')) {
      baseItems.push(
        { 
          id: 'employer-management', 
          label: 'Manage Companies', 
          icon: '🏢',
          path: '/app/employers',
          description: 'Manage your company profiles'
        },
        { 
          id: 'candidates', 
          label: 'Candidates', 
          icon: '👥',
          path: '/app/candidates',
          description: 'Review job applications and candidates'
        }
      )
    }

    // ✅ CONDITIONAL: Advanced features (only show if user has progressed enough)
    const shouldShowAdvancedFeatures = profile && (
      hasRole('applicant') || hasRole('peer') || hasRole('landlord')
    )

    if (shouldShowAdvancedFeatures) {
      // ✅ REMOVED: Match Dashboard temporarily until route is implemented
      // We'll re-add this when the route exists in MainApp.js
      /*
      baseItems.push({ 
        id: 'match-dashboard', 
        label: 'Match Dashboard', 
        icon: '🎯',
        path: '/app/match-dashboard',
        description: 'Coordinate housing search with matched roommate'
      })
      */
    }

    // Universal tools
    baseItems.push(
      { 
        id: 'messages', 
        label: 'Messages', 
        icon: '💬',
        path: '/app/messages',
        description: 'Communicate with matches and contacts'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: '⚙️',
        path: '/app/settings',
        description: 'Manage account preferences and privacy'
      }
    )

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const handleNavigation = (path) => {
    console.log('🧭 Navigation: Navigating to:', path)
    navigate(path)
  }

  // ✅ IMPROVED: Better active state detection for nested routes
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

  // ✅ ADDED: Helper to get user's role-specific greeting
  const getRoleGreeting = () => {
    if (!profile) return ''
    
    const roles = profile.roles || []
    if (roles.includes('applicant')) return '🏠 Housing Seeker'
    if (roles.includes('landlord')) return '🏢 Property Owner' 
    if (roles.includes('peer')) return '🤝 Peer Specialist'
    if (roles.includes('employer')) return '💼 Recovery-Friendly Employer'
    return '👋 Community Member'
  }

  return (
    <nav className="navigation">
      {/* ✅ ADDED: Role indicator for better user context */}
      {profile && (
        <div style={{ 
          padding: '10px 20px', 
          background: 'rgba(160, 32, 240, 0.05)',
          borderBottom: '1px solid var(--border-beige)',
          fontSize: '0.9rem',
          color: 'var(--gray-700)',
          textAlign: 'center'
        }}>
          {getRoleGreeting()}
        </div>
      )}

      <ul className="nav-list">
        {navigationItems.map(item => {
          const isCurrentlyActive = isActive(item.path)
          
          return (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-button ${isCurrentlyActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={item.description || item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* ✅ ADDED: Quick progress indicator for incomplete profiles */}
      {profile && (
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border-beige)',
          background: 'var(--bg-light-cream)',
          fontSize: '0.8rem',
          color: 'var(--gray-600)',
          textAlign: 'center'
        }}>
          💡 Tip: Complete your profile to unlock all features
        </div>
      )}
    </nav>
  )
}

export default Navigation
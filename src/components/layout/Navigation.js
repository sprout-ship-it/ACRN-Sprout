// src/components/layout/Navigation.js - UPDATED WITH GRID LAYOUT
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
        path: '/app/employers',
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
        description: 'View and manage all your connections and requests',
        className: 'nav-connections'
      }
    )

    // ✅ FIXED: Role-specific feature navigation with CORRECT paths
    if (hasRole('applicant')) {
      baseItems.push(
        { 
          id: 'find-matches', 
          label: 'Find Roommates', 
          icon: '🔍',
          path: '/app/find-matches',
          description: 'Discover compatible roommates',
          className: 'nav-housing-seeker'
        },
        { 
          id: 'browse-housing', 
          label: 'Find Housing', 
          icon: '🏘️',
          path: '/app/property-search',
          description: 'Search for recovery-friendly housing',
          className: 'nav-property-owner'
        },
        { 
          id: 'find-peer-support', 
          label: 'Find Support', 
          icon: '👥',
          path: '/app/find-peer-support',
          description: 'Connect with peer support specialists',
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
          description: 'Manage your rental properties',
          className: 'nav-property-owner'
        },
        { 
          id: 'tenants', 
          label: 'Tenant Requests', 
          icon: '📋',
          path: '/app/tenants',
          description: 'Review tenant applications and requests',
          className: 'nav-property-owner'
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
          description: 'Manage peer support services and clients',
          className: 'nav-peer-support'
        },
        { 
          id: 'my-clients', 
          label: 'My Clients', 
          icon: '👥',
          path: '/app/clients',
          description: 'View and manage client relationships',
          className: 'nav-peer-support'
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
          description: 'Manage your company profiles',
          className: 'nav-employer'
        },
        { 
          id: 'candidates', 
          label: 'Candidates', 
          icon: '👥',
          path: '/app/candidates',
          description: 'Review job applications and candidates',
          className: 'nav-employer'
        }
      )
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
    <>
      {/* ✅ ADDED: Role indicator for better user context */}
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

      {/* ✅ ADDED: Quick progress indicator for incomplete profiles */}
      {profile && (
        <div style={{
          padding: '10px 20px',
          background: 'var(--bg-light-cream)',
          fontSize: '0.8rem',
          color: 'var(--gray-600)',
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          💡 Tip: Complete your profile to unlock all features
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
    </>
  )
}

export default Navigation
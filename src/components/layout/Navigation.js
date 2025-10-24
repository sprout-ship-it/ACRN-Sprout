// src/components/layout/Navigation.js - ENHANCED: Multi-role support with balanced navigation
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getCompletionStatus, getStatusIcon } from '../../utils/roleUtils'
import '../../styles/global.css';

const Navigation = ({ profileCompletionStatus = {} }) => {
  const { profile, hasRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // ✅ ENHANCED: Get navigation items with status badges and role-specific styling
  const getNavigationItems = () => {
    const baseItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: '📊',
        path: '/app'
      }
    ]

    // ✅ Role-specific profile management with STATUS BADGES and ROLE COLORS
    if (hasRole('applicant')) {
      const percentage = profileCompletionStatus['applicant'] || 0;
      const status = getCompletionStatus(percentage);
      const statusBadge = getStatusIcon(status);
      
      baseItems.push({
        id: 'applicant-profile',
        label: 'Applicant Profile',
        icon: '👤', 
        path: '/app/profile/matching',
        description: 'Manage your housing seeker profile and matching preferences',
        statusBadge,
        statusPercentage: percentage,
        className: 'nav-applicant'
      })
    }

    if (hasRole('peer-support')) {
      const percentage = profileCompletionStatus['peer-support'] || 0;
      const status = getCompletionStatus(percentage);
      const statusBadge = getStatusIcon(status);
      
      baseItems.push({
        id: 'peer-profile',
        label: 'Peer Support Profile',
        icon: '👤',
        path: '/app/profile/peer-support', 
        description: 'Manage your peer support specialist profile and services',
        statusBadge,
        statusPercentage: percentage,
        className: 'nav-peer-support'
      })
    }

    if (hasRole('landlord')) {
      const percentage = profileCompletionStatus['landlord'] || 0;
      const status = getCompletionStatus(percentage);
      const statusBadge = getStatusIcon(status);
      
      baseItems.push({
        id: 'landlord-profile',
        label: 'Landlord Profile',
        icon: '👤',
        path: '/app/profile/landlord',
        description: 'Manage your property owner profile and business information',
        statusBadge,
        statusPercentage: percentage,
        className: 'nav-property-owner'
      })
    }

    if (hasRole('employer')) {
      const percentage = profileCompletionStatus['employer'] || 0;
      const status = getCompletionStatus(percentage);
      const statusBadge = getStatusIcon(status);
      
      baseItems.push({
        id: 'employer-profile',
        label: 'Employer Profile',
        icon: '👤',
        path: '/app/employer-dashboard',
        description: 'Manage your company profiles and employer information',
        statusBadge,
        statusPercentage: percentage,
        className: 'nav-employer'
      })
    }

    // ✅ APPLICANT: Management functions (saved/favorites)
    if (hasRole('applicant')) {
      baseItems.push(
        { 
          id: 'saved-properties', 
          label: 'Saved Properties', 
          icon: '⭐',
          path: '/app/saved-properties',
          description: 'View and manage your favorited housing properties',
          className: 'nav-property-owner'
        },
        { 
          id: 'saved-employers', 
          label: 'Saved Employers', 
          icon: '💼',
          path: '/app/saved-employers',
          description: 'View and manage your favorited recovery-friendly employers',
          className: 'nav-employer'
        }
      )
    }

    // ✅ LANDLORD: Property management
    if (hasRole('landlord')) {
      baseItems.push(
        { 
          id: 'properties', 
          label: 'My Properties',
          icon: '🏢',
          path: '/app/properties',
          description: 'Manage your rental properties and housing listings',
          className: 'nav-property-owner'
        }
      )
    }

    // ✅ PEER SUPPORT: Peer dashboard
    if (hasRole('peer-support')) {
      baseItems.push(
        { 
          id: 'peer-dashboard', 
          label: 'Peer Dashboard',
          icon: '🤝',
          path: '/app/peer-dashboard',
          description: 'Comprehensive peer support client management dashboard',
          className: 'nav-peer-support'
        }
      )
    }

    // ✅ EMPLOYER: Company management
    if (hasRole('employer')) {
      baseItems.push(
        { 
          id: 'employer-management', 
          label: 'Manage Companies',
          icon: '🏪',
          path: '/app/employers',
          description: 'Manage your company profiles and job opportunities',
          className: 'nav-employer'
        }
      )
    }

    // ✅ UNIVERSAL: Settings
    baseItems.push(
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
    
    if (path.includes('/profile/')) {
      return location.pathname.startsWith(path)
    }
    
    return location.pathname.startsWith(path)
  }

  // ✅ ENHANCED: Helper to get user's role-specific greeting with multi-role support
  const getRoleGreeting = () => {
    if (!profile) return ''
    
    const roles = profile.roles || []
    
    if (roles.length === 0) return '👋 Community Member'
    
    if (roles.length === 1) {
      if (roles.includes('applicant')) return '🏠 Housing Seeker'
      if (roles.includes('landlord')) return '🏢 Property Owner' 
      if (roles.includes('peer-support')) return '🤝 Peer Support Specialist'
      if (roles.includes('employer')) return '💼 Recovery-Friendly Employer'
    }
    
    // Multi-role user
    const roleLabels = {
      'applicant': '🏠',
      'peer-support': '🤝',
      'landlord': '🏢',
      'employer': '💼'
    };
    
    const icons = roles.map(r => roleLabels[r] || '').join(' ');
    return `${icons} Multi-Role User`;
  }

  return (
    <>
      {/* ✅ ENHANCED: Role indicator with multi-role awareness */}
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
              ({profile.roles.length} roles - switch on dashboard)
            </span>
          )}
        </div>
      )}

      {/* ✅ ENHANCED: Grid Navigation with Status Badges and Balanced Layout */}
      <nav className="dashboard-grid-nav">
        {navigationItems.map(item => {
          const isCurrentlyActive = isActive(item.path)
          const hasStatusBadge = item.statusBadge !== undefined
          
          return (
            <button
              key={item.id}
              className={`nav-grid-item ${item.className || ''} ${isCurrentlyActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={`${item.description || item.label}${hasStatusBadge ? ` - ${item.statusPercentage}% complete` : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              
              {/* ✅ NEW: Status Badge */}
              {hasStatusBadge && (
                <span 
                  className="nav-status-badge"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    fontSize: '0.9rem',
                    lineHeight: 1
                  }}
                >
                  {item.statusBadge}
                </span>
              )}
              
              {isCurrentlyActive && <span className="nav-active-indicator"></span>}
            </button>
          )
        })}
      </nav>

      {/* ✅ ENHANCED: Grid Navigation Styles with Status Badge Support and Balanced Layout */}
      <style jsx>{`
        .dashboard-grid-nav {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 100%;
        }

        /* Better symmetry for common configurations */
        @media (min-width: 769px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (min-width: 1200px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .nav-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 10px;
          border-radius: 8px;
          border: 2px solid transparent;
          background: #f9fafb;
          color: #6b7280;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          min-height: 90px;
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
          font-size: 1.8rem;
          margin-bottom: 6px;
        }

        .nav-grid-item .nav-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          line-height: 1.2;
        }

        .nav-status-badge {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .nav-active-indicator {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: currentColor;
          border-radius: 2px;
        }

        /* Role-specific navigation colors */
        .nav-applicant:hover,
        .nav-applicant.active {
          background: #10b981;
        }

        .nav-peer-support:hover,
        .nav-peer-support.active {
          background: #3b82f6;
        }

        .nav-employer:hover,
        .nav-employer.active {
          background: #ef4444;
        }

        .nav-property-owner:hover,
        .nav-property-owner.active {
          background: #f59e0b;
        }

        /* Default hover for items without specific colors */
        .nav-grid-item:not(.nav-applicant):not(.nav-peer-support):not(.nav-employer):not(.nav-property-owner):hover,
        .nav-grid-item:not(.nav-applicant):not(.nav-peer-support):not(.nav-employer):not(.nav-property-owner).active {
          background: #6366f1;
        }

        /* Mobile responsive grid adjustments */
        @media (max-width: 768px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px;
            padding: 10px;
          }
          
          .nav-grid-item {
            padding: 10px 6px;
            min-height: 80px;
          }
          
          .nav-grid-item .nav-label {
            font-size: 0.7rem;
          }
          
          .nav-grid-item .nav-icon {
            font-size: 1.5rem;
          }

          .nav-status-badge {
            font-size: 0.8rem !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-grid-nav {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .nav-grid-item .nav-label {
            font-size: 0.65rem;
          }

          .nav-grid-item .nav-icon {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  )
}

export default Navigation
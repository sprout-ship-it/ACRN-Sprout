// src/components/layout/Navigation.js
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/global.css';

const Navigation = () => {
  const { profile, hasRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Get navigation items based on user roles
  const getNavigationItems = () => {
    const baseItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: '🏠',
        path: '/app'
      },
      { 
        id: 'profile', 
        label: 'Edit Profile', 
        icon: '👤',
        path: '/app/profile/basic' // ✅ Fixed: Changed to match actual route
      },
      { 
        id: 'match-requests', 
        label: 'Match Requests', 
        icon: '🤝',
        path: '/app/match-requests'
      }
    ]

    // Add role-specific navigation items
    if (hasRole('applicant') || hasRole('peer')) {
      baseItems.push(
        { 
          id: 'matching-profile', 
          label: 'Matching Profile', 
          icon: '📝',
          path: '/app/profile/matching' // ✅ Fixed: Changed to match actual route
        },
        { 
          id: 'find-matches', 
          label: 'Find Matches', 
          icon: '🔍',
          path: '/app/find-matches'
        }
      )
    }

    if (hasRole('landlord')) {
      baseItems.push({ 
        id: 'properties', 
        label: 'Properties', 
        icon: '🏢',
        path: '/app/properties'
      })
    }

    if (hasRole('peer')) {
  baseItems.push(
    { 
      id: 'peer-profile', 
      label: 'Peer Profile', 
      icon: '🤝',
      path: '/app/profile/peer-support'
    }
  )
}
    // Add match dashboard if user has active matches
    // This would be determined by actual user progress/match status
    baseItems.push({ 
      id: 'match-dashboard', 
      label: 'Match Dashboard', 
      icon: '🎯',
      path: '/app/match-dashboard'
    })

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const handleNavigation = (path) => {
    console.log('🧭 Navigation: Navigating to:', path) // ✅ Added debugging
    navigate(path)
  }

  const isActive = (path) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="navigation">
      <ul className="nav-list">
        {navigationItems.map(item => (
          <li key={item.id} className="nav-item">
            <button
              className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
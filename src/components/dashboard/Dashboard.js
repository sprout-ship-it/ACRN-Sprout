// src/components/dashboard/Dashboard.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/global.css';

const Dashboard = () => {
  const { profile, hasRole } = useAuth()
  console.log('🎯 Dashboard profile data:', { profile, hasProfile: !!profile, profileRoles: profile?.roles })
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState('dashboard')

  // Dashboard cards based on user roles
  const getDashboardCards = () => {
    const cards = []
    
    // Universal cards for all roles
    cards.push(
      { 
        id: 'edit-profile', 
        label: 'Edit Profile', 
        description: 'Update your basic information', 
        color: 'var(--primary-purple)',
        path: '/app/profile/basic' // ✅ Fixed: Added /app prefix
      },
      { 
        id: 'view-match-requests', 
        label: 'View Match Requests', 
        description: 'See pending and completed matches', 
        color: 'var(--secondary-teal)',
        path: '/app/match-requests' // ✅ Fixed: Added /app prefix
      }
    )
    
    // Role-specific cards
    if (hasRole('applicant')) {
      cards.push(
        { 
          id: 'add-matching-profile', 
          label: 'Add/Edit Matching Profile', 
          description: 'Set your preferences and compatibility criteria', 
          color: 'var(--coral)',
          path: '/app/profile/matching' // ✅ Fixed: Added /app prefix
        },
        { 
          id: 'find-matches', 
          label: 'Find Matches', 
          description: 'Discover compatible roommates', 
          color: 'var(--secondary-teal)',
          path: '/app/find-matches' // ✅ Fixed: Added /app prefix
        },
        { 
          id: 'my-matches', 
          label: 'My Matches', 
          description: 'View your current matches', 
          color: 'var(--gold)',
          path: '/app/match-requests' // ✅ Fixed: Changed to existing route
        },
        { 
          id: 'properties', 
          label: 'Browse Properties', 
          description: 'Search for recovery-friendly housing', 
          color: 'var(--secondary-purple)',
          path: '/app/properties' // ✅ Fixed: Added /app prefix
        }
      )
    }
    
    if (hasRole('landlord')) {
      cards.push(
        { 
          id: 'manage-properties', 
          label: 'Manage Properties', 
          description: 'Add and manage your rental properties', 
          color: 'var(--secondary-purple)',
          path: '/app/properties' // ✅ Fixed: Added /app prefix
        },
        { 
          id: 'tenant-requests', 
          label: 'Tenant Requests', 
          description: 'Review applications and requests', 
          color: 'var(--coral)',
          path: '/app/tenants' // ✅ Fixed: Added /app prefix
        }
      )
    }
    
      if (hasRole('peer')) {
        cards.push(
          { 
            id: 'peer-profile', 
            label: 'Peer Support Profile', 
            description: 'Set up and manage your peer support services profile', 
            color: 'var(--secondary-teal)',
            path: '/app/profile/peer-support'
          },
          { 
            id: 'peer-dashboard', 
            label: 'Peer Support Dashboard', 
            description: 'Manage your peer support services', 
            color: 'var(--secondary-teal)',
            path: '/app/peer-dashboard'
          },
          { 
            id: 'my-clients', 
            label: 'My Clients', 
            description: 'View and manage client relationships', 
            color: 'var(--gold)',
            path: '/app/clients'
          }
        )
      }
    
    // Common tools
    cards.push(
      { 
        id: 'messages', 
        label: 'Messages', 
        description: 'Communicate with matches and contacts', 
        color: 'var(--primary-purple)',
        path: '/app/messages' // ✅ Fixed: Added /app prefix
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        description: 'Manage your account preferences', 
        color: 'var(--gray-600)',
        path: '/app/settings' // ✅ Fixed: Added /app prefix
      }
    )
    
    return cards
  }

  const handleCardClick = (card) => {
    console.log('🔄 Button clicked:', card.label, 'Path:', card.path)
    
    if (card.path) {
      console.log('🧭 Navigating to:', card.path)
      navigate(card.path)
    } else {
      console.log('🔄 Setting view to:', card.id)
      setCurrentView(card.id)
    }
  }

  return (
    <div>
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome back, {profile?.first_name || 'User'}!
        </h1>
        <p className="welcome-text">
          Your roles: {profile?.roles?.map(role => 
            role.charAt(0).toUpperCase() + role.slice(1)
          ).join(', ')}
        </p>
      </div>
      
      <div className="dashboard-grid">
        {getDashboardCards().map(card => (
          <div
            key={card.id}
            className="dashboard-card"
            style={{ borderColor: card.color }}
            onClick={() => handleCardClick(card)}
          >
            <h3 style={{ color: card.color, margin: '0 0 10px 0' }}>
              {card.label}
            </h3>
            <p style={{ margin: '0', color: 'var(--gray-600)' }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>
      
      {currentView !== 'dashboard' && (
        <div className="text-center mt-5">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentView('dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
// src/components/dashboard/Dashboard.js - Updated with Employer Support
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../utils/supabase'
import '../../styles/global.css';

const Dashboard = () => {
  const { profile, hasRole, user } = useAuth()
  const navigate = useNavigate()
  const [profileStats, setProfileStats] = useState({
    completionPercentage: 0,
    nextSteps: [],
    loading: true
  })

  // ✅ PHASE 4: Calculate profile completeness and next steps for simplified flow
  useEffect(() => {
    const calculateProfileStats = async () => {
      if (!user || !profile?.roles?.length) {
        setProfileStats({ completionPercentage: 0, nextSteps: [], loading: false })
        return
      }

      try {
        let completionPercentage = 0
        const nextSteps = []

        // Check role-specific profile completion
        if (hasRole('applicant')) {
          const { data: applicantProfile } = await db.applicantForms.getByUserId(user.id)
          
          if (applicantProfile) {
            // Calculate completion based on comprehensive profile fields
            let completedFields = 0
            const totalFields = 8 // Key fields for applicant completion
            
            if (applicantProfile.date_of_birth) completedFields++
            if (applicantProfile.phone) completedFields++
            if (applicantProfile.about_me) completedFields++
            if (applicantProfile.looking_for) completedFields++
            if (applicantProfile.recovery_stage) completedFields++
            if (applicantProfile.budget_max) completedFields++
            if (applicantProfile.preferred_location) completedFields++
            if (applicantProfile.interests?.length > 0) completedFields++
            
            completionPercentage = Math.round((completedFields / totalFields) * 100)
            
            // Generate next steps for applicants
            if (!applicantProfile.profile_completed) {
              nextSteps.push({
                title: 'Complete Your Matching Profile',
                description: 'Finish setting up your comprehensive profile to start finding matches',
                action: 'complete-profile',
                path: '/app/profile/matching',
                priority: 'high',
                icon: '📝'
              })
            } else {
              nextSteps.push({
                title: 'Find Your Perfect Roommate',
                description: 'Browse compatible matches and send connection requests',
                action: 'find-matches',
                path: '/app/find-matches',
                priority: 'medium',
                icon: '🔍'
              })
              
              nextSteps.push({
                title: 'Connect with Peer Support',
                description: 'Find experienced peer support specialists to guide your recovery journey',
                action: 'find-peer-support',
                path: '/app/find-peer-support',
                priority: 'medium',
                icon: '🤝'
              })

              // ✅ NEW: Add employer finder recommendation
              nextSteps.push({
                title: 'Find Recovery-Friendly Employment',
                description: 'Discover employers committed to supporting individuals in recovery',
                action: 'find-employers',
                path: '/app/find-employers',
                priority: 'medium',
                icon: '💼'
              })
            }
          } else {
            nextSteps.push({
              title: 'Set Up Your Profile',
              description: 'Create your comprehensive matching profile to get started',
              action: 'setup-profile',
              path: '/app/profile/matching',
              priority: 'high',
              icon: '🆕'
            })
          }
        }
        
        else if (hasRole('peer')) {
          const { data: peerProfile } = await db.peerSupportProfiles.getByUserId(user.id)
          
          if (peerProfile) {
            // Calculate completion for peer specialists
            let completedFields = 0
            const totalFields = 6
            
            if (peerProfile.age) completedFields++
            if (peerProfile.phone) completedFields++
            if (peerProfile.bio) completedFields++
            if (peerProfile.specialties?.length > 0) completedFields++
            if (peerProfile.time_in_recovery) completedFields++
            if (peerProfile.supported_recovery_methods?.length > 0) completedFields++
            
            completionPercentage = Math.round((completedFields / totalFields) * 100)
            
            if (!peerProfile.profile_completed) {
              nextSteps.push({
                title: 'Complete Your Peer Support Profile',
                description: 'Finish your professional profile to help others find you',
                action: 'complete-peer-profile',
                path: '/app/profile/peer-support',
                priority: 'high',
                icon: '🤝'
              })
            } else {
              nextSteps.push({
                title: 'Manage Your Services',
                description: 'Review client requests and manage your peer support services',
                action: 'peer-dashboard',
                path: '/app/peer-dashboard',
                priority: 'medium',
                icon: '👥'
              })
            }
          } else {
            nextSteps.push({
              title: 'Create Your Peer Support Profile',
              description: 'Set up your professional profile to offer peer support services',
              action: 'setup-peer-profile',
              path: '/app/profile/peer-support',
              priority: 'high',
              icon: '🆕'
            })
          }
        }
        
        else if (hasRole('landlord')) {
          // Landlords start with basic setup completed
          completionPercentage = profile?.phone ? 100 : 80
          
          const { data: properties } = await db.properties.getByLandlordId(user.id)
          
          if (!properties || properties.length === 0) {
            nextSteps.push({
              title: 'Add Your First Property',
              description: 'List a recovery-friendly property to start connecting with tenants',
              action: 'add-property',
              path: '/app/properties',
              priority: 'high',
              icon: '🏠'
            })
          } else {
            nextSteps.push({
              title: 'Manage Your Properties',
              description: 'Update listings and review tenant applications',
              action: 'manage-properties',
              path: '/app/properties',
              priority: 'medium',
              icon: '🏢'
            })
          }
        }

        // ✅ NEW: Add employer role support
        else if (hasRole('employer')) {
          // Check for employer profiles
          const { data: employerProfiles } = await db.employerProfiles.getByUserId(user.id)
          
          if (!employerProfiles || employerProfiles.length === 0) {
            completionPercentage = profile?.phone ? 20 : 0
            nextSteps.push({
              title: 'Create Your Employer Profile',
              description: 'Set up your company profile to attract recovery-focused talent',
              action: 'create-employer-profile',
              path: '/app/employers',
              priority: 'high',
              icon: '🏢'
            })
          } else {
            // Calculate completion based on employer profile fields
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
            
            if (!employerProfile.profile_completed) {
              nextSteps.push({
                title: 'Complete Your Employer Profile',
                description: 'Finish your company profile to attract the best candidates',
                action: 'complete-employer-profile',
                path: '/app/employers',
                priority: 'high',
                icon: '🏢'
              })
            } else {
              nextSteps.push({
                title: 'Manage Job Postings',
                description: 'Update your current openings and review applications',
                action: 'manage-employers',
                path: '/app/employers',
                priority: 'medium',
                icon: '💼'
              })
              
              if (employerProfile.is_actively_hiring) {
                nextSteps.push({
                  title: 'Review Applications',
                  description: 'Check for new job applicants and connection requests',
                  action: 'review-applications',
                  path: '/app/match-requests',
                  priority: 'medium',
                  icon: '📋'
                })
              }
            }
          }
        }

        // Universal next steps for all roles
        nextSteps.push({
          title: 'Review Match Requests',
          description: 'Check for new connection requests and messages',
          action: 'match-requests',
          path: '/app/match-requests',
          priority: 'low',
          icon: '📩'
        })

        setProfileStats({
          completionPercentage,
          nextSteps,
          loading: false
        })

      } catch (error) {
        console.error('Error calculating profile stats:', error)
        setProfileStats({ completionPercentage: 0, nextSteps: [], loading: false })
      }
    }

    calculateProfileStats()
  }, [user, profile, hasRole])

  // ✅ PHASE 4: Updated dashboard cards for simplified flow
  const getDashboardCards = () => {
    const cards = []
    
    // Role-specific primary actions
    if (hasRole('applicant')) {
      cards.push(
        { 
          id: 'matching-profile', 
          label: 'My Matching Profile', 
          description: 'View and update your comprehensive roommate matching profile', 
          color: 'var(--primary-purple)',
          path: '/app/profile/matching',
          icon: '👤'
        },
        { 
          id: 'find-matches', 
          label: 'Find Roommates', 
          description: 'Discover compatible roommates based on your preferences', 
          color: 'var(--secondary-teal)',
          path: '/app/find-matches',
          icon: '🔍'
        },
        { 
          id: 'find-peer-support', 
          label: 'Find Peer Support', 
          description: 'Connect with experienced peer support specialists for guidance', 
          color: 'var(--gold)',
          path: '/app/find-peer-support',
          icon: '🤝'
        },
        // ✅ NEW: Added employer finder card for applicants
        { 
          id: 'find-employers', 
          label: 'Find Employment', 
          description: 'Discover recovery-friendly employers and job opportunities', 
          color: 'var(--coral)',
          path: '/app/find-employers',
          icon: '💼'
        },
        { 
          id: 'browse-properties', 
          label: 'Browse Properties', 
          description: 'Search for recovery-friendly housing options', 
          color: 'var(--secondary-purple)',
          path: '/app/property-search',
          icon: '🏠'
        }
      )
    }
    
    if (hasRole('peer')) {
      cards.push(
        { 
          id: 'peer-profile', 
          label: 'My Peer Support Profile', 
          description: 'Manage your professional peer support services profile', 
          color: 'var(--secondary-teal)',
          path: '/app/profile/peer-support',
          icon: '🤝'
        },
        { 
          id: 'peer-dashboard', 
          label: 'Peer Support Dashboard', 
          description: 'Manage your peer support services and clients', 
          color: 'var(--secondary-teal)',
          path: '/app/peer-dashboard',
          icon: '👥'
        },
        { 
          id: 'client-requests', 
          label: 'Client Requests', 
          description: 'Review and manage peer support requests', 
          color: 'var(--gold)',
          path: '/app/clients',
          icon: '📋'
        }
      )
    }
    
    if (hasRole('landlord')) {
      cards.push(
        { 
          id: 'manage-properties', 
          label: 'Manage Properties', 
          description: 'Add, edit, and manage your rental properties', 
          color: 'var(--secondary-purple)',
          path: '/app/properties',
          icon: '🏢'
        },
        { 
          id: 'tenant-applications', 
          label: 'Tenant Applications', 
          description: 'Review applications and tenant requests', 
          color: 'var(--coral)',
          path: '/app/tenants',
          icon: '📄'
        }
      )
    }

    // ✅ NEW: Add employer-specific cards
    if (hasRole('employer')) {
      cards.push(
        { 
          id: 'manage-employers', 
          label: 'Manage Company Profiles', 
          description: 'Add, edit, and manage your employer profiles', 
          color: 'var(--coral)',
          path: '/app/employers',
          icon: '🏢'
        },
        { 
          id: 'job-applications', 
          label: 'Job Applications', 
          description: 'Review applications and candidate requests', 
          color: 'var(--gold)',
          path: '/app/candidates',
          icon: '📋'
        },
        { 
          id: 'post-jobs', 
          label: 'Post New Jobs', 
          description: 'Create and manage job postings for recovery-focused candidates', 
          color: 'var(--secondary-teal)',
          path: '/app/employers',
          icon: '💼'
        }
      )
    }
    
    // Universal cards for all users
    cards.push(
      { 
        id: 'match-requests', 
        label: 'Match Requests', 
        description: 'View and manage your connection requests', 
        color: 'var(--primary-purple)',
        path: '/app/match-requests',
        icon: '🤝'
      },
      { 
        id: 'messages', 
        label: 'Messages', 
        description: 'Communicate with your connections', 
        color: 'var(--secondary-teal)',
        path: '/app/messages',
        icon: '💬'
      },
      { 
        id: 'account-settings', 
        label: 'Account Settings', 
        description: 'Manage your account preferences and privacy', 
        color: 'var(--gray-600)',
        path: '/app/settings',
        icon: '⚙️'
      }
    )
    
    return cards
  }

  const handleCardClick = (card) => {
    console.log('🔄 Dashboard card clicked:', card.label, 'Path:', card.path)
    if (card.path) {
      navigate(card.path)
    }
  }

  const handleNextStepClick = (step) => {
    console.log('🎯 Next step clicked:', step.title, 'Path:', step.path)
    if (step.path) {
      navigate(step.path)
    }
  }

  // ✅ PHASE 4: Render role-specific welcome message
  const getRoleSpecificWelcome = () => {
    const roleLabels = profile?.roles?.map(role => {
      switch(role) {
        case 'applicant': return 'Housing Seeker'
        case 'peer': return 'Peer Specialist'
        case 'landlord': return 'Property Owner'
        case 'employer': return 'Recovery-Friendly Employer' // ✅ NEW
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
        
        {/* Profile Completion Status */}
        {!profileStats.loading && (
          <div className="alert alert-info">
            <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Profile Completion: <strong>{profileStats.completionPercentage}%</strong></span>
              {profileStats.completionPercentage < 100 && (
                <span className="text-sm">Complete your profile to unlock all features</span>
              )}
            </div>
            <div className="progress-bar mt-2">
              <div 
                className="progress-fill"
                style={{ width: `${profileStats.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {getRoleSpecificWelcome()}
      
      {/* Next Steps Section */}
      {!profileStats.loading && profileStats.nextSteps.length > 0 && (
        <div className="card mb-5">
          <h3 className="card-title">Recommended Next Steps</h3>
          <div className="grid-auto">
            {profileStats.nextSteps.map((step, index) => (
              <div
                key={index}
                className={`dashboard-card ${step.priority === 'high' ? 'high-priority' : ''}`}
                style={{ borderColor: step.priority === 'high' ? 'var(--coral)' : 'var(--border-beige)' }}
                onClick={() => handleNextStepClick(step)}
              >
                {step.priority === 'high' && (
                  <div className="badge badge-warning mb-2">
                    Recommended
                  </div>
                )}
                <div className="text-center mb-2" style={{ fontSize: '2rem' }}>
                  {step.icon}
                </div>
                <h4 className="card-title" style={{ color: step.priority === 'high' ? 'var(--coral)' : 'var(--primary-purple)' }}>
                  {step.title}
                </h4>
                <p className="card-text">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Dashboard Cards */}
      <div className="dashboard-grid">
        {getDashboardCards().map(card => (
          <div
            key={card.id}
            className="dashboard-card"
            style={{ borderColor: card.color }}
            onClick={() => handleCardClick(card)}
          >
            <div className="text-center mb-2" style={{ fontSize: '2rem' }}>
              {card.icon}
            </div>
            <h3 className="card-title" style={{ color: card.color }}>
              {card.label}
            </h3>
            <p className="card-text">{card.description}</p>
          </div>
        ))}
      </div>
      
      {/* Quick Stats for Multiple Roles */}
      {profile?.roles?.length > 1 && (
        <div className="card mt-5">
          <h3 className="card-title">Your Multi-Role Access</h3>
          <p className="card-text">
            You have access to multiple platform features based on your roles. Use the navigation above to switch between different functionalities.
          </p>
          <div className="grid-auto">
            {profile.roles.map(role => (
              <div key={role} className="alert alert-success">
                <strong>{role.charAt(0).toUpperCase() + role.slice(1)} Access:</strong>
                {role === 'applicant' && ' Find roommates, browse properties, manage matches, connect with peer support, find employment'}
                {role === 'peer' && ' Offer peer support, manage clients, provide services'}
                {role === 'landlord' && ' List properties, review applications, manage rentals'}
                {role === 'employer' && ' Post jobs, review applications, manage company profiles, hire recovery-focused talent'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ✅ PHASE 4: Add CSS for high priority cards
const additionalStyles = `
.dashboard-card.high-priority {
  background: linear-gradient(135deg, #fff9f9 0%, #fff 100%);
  box-shadow: 0 4px 20px rgba(255, 111, 97, 0.15);
}

.dashboard-card.high-priority:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 111, 97, 0.25);
}
`

// Inject additional styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = additionalStyles
  document.head.appendChild(styleElement)
}

export default Dashboard
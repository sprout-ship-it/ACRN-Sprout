// src/pages/MainApp.js
import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/supabase'

// Layout
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'

// Common Components
import LoadingSpinner from '../components/common/LoadingSpinner'

// Form Components
import BasicProfileForm from '../components/forms/BasicProfileForm'
import EnhancedMatchingProfileForm from '../components/forms/EnhancedMatchingProfileForm'
import PeerSupportProfileForm from '../components/forms/PeerSupportProfileForm'

// Dashboard Components  
import Dashboard from '../components/dashboard/Dashboard'
import MatchFinder from '../components/dashboard/MatchFinder'
import MatchRequests from '../components/dashboard/MatchRequests'
import PropertyManagement from '../components/dashboard/PropertyManagement'
// ✅ NEW: Import the PeerSupportFinder component
import PeerSupportFinder from '../components/dashboard/PeerSupportFinder'

// ✅ NEW: Import the real PropertySearch component
import PropertySearch from '../components/PropertySearch'

import '../styles/global.css';

// Placeholder components for features not yet implemented
const PeerSupportDashboard = () => (
  <div className="card">
    <h1 className="card-title">Peer Support Dashboard</h1>
    <p className="card-text mb-4">
      Manage your peer support services and client relationships.
    </p>
    <div className="alert alert-info">
      <p>Peer support specialist features coming soon...</p>
    </div>
  </div>
)

const Messages = () => (
  <div className="card">
    <h1 className="card-title">Messages</h1>
    <p className="card-text mb-4">
      Communicate with your matches, landlords, and peer support specialists.
    </p>
    <div className="alert alert-info">
      <p>Messaging system coming soon...</p>
    </div>
  </div>
)

const Settings = () => (
  <div className="card">
    <h1 className="card-title">Account Settings</h1>
    <p className="card-text mb-4">
      Manage your account preferences and privacy settings.
    </p>
    <div className="alert alert-info">
      <p>Settings page coming soon...</p>
    </div>
  </div>
)

const MainApp = () => {
  console.log('🏠 MainApp rendering with simplified onboarding flow, current URL:', window.location.pathname);
  const { user, profile, isAuthenticated, hasRole } = useAuth()
  const navigate = useNavigate()
  
  // ✅ PHASE 4: Simplified profile setup tracking - no more separate basic profile step
  const [profileSetup, setProfileSetup] = useState({
    hasComprehensiveProfile: false, // Single check for role-specific comprehensive form
    loading: true
  })

  // ✅ PHASE 4: Check if user has completed their role-specific comprehensive profile
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user || !profile?.roles?.length) {
        setProfileSetup({ hasComprehensiveProfile: false, loading: false })
        return
      }

      try {
        console.log('🔍 Checking profile completion for roles:', profile.roles)
        
        let hasCompleteProfile = false

        // Check based on user's primary role
        if (hasRole('applicant')) {
          console.log('👤 Checking applicant comprehensive profile...')
          const { data: applicantProfile } = await db.applicantForms.getByUserId(user.id)
          
          // ✅ PHASE 4: Check for comprehensive profile completion (demographic + preferences)
          hasCompleteProfile = !!(
            applicantProfile?.date_of_birth && 
            applicantProfile?.phone && 
            applicantProfile?.about_me && 
            applicantProfile?.looking_for &&
            applicantProfile?.profile_completed
          )
          
          console.log('👤 Applicant profile check:', { 
            hasProfile: !!applicantProfile,
            hasDemographics: !!(applicantProfile?.date_of_birth && applicantProfile?.phone),
            hasContent: !!(applicantProfile?.about_me && applicantProfile?.looking_for),
            isCompleted: !!applicantProfile?.profile_completed,
            overallComplete: hasCompleteProfile
          })
        }
        
        else if (hasRole('peer')) {
          console.log('🤝 Checking peer support comprehensive profile...')
          const { data: peerProfile } = await db.peerSupportProfiles.getByUserId(user.id)
          
          // ✅ FIXED: Check for comprehensive peer profile completion using actual schema fields
          hasCompleteProfile = !!(
            peerProfile?.phone && 
            peerProfile?.bio && 
            peerProfile?.specialties &&
            peerProfile?.specialties?.length > 0  // Check that specialties array has items
          )
          
          console.log('🤝 Peer profile check:', { 
            hasProfile: !!peerProfile,
            hasPhone: !!peerProfile?.phone,
            hasBio: !!peerProfile?.bio,
            hasSpecialties: !!(peerProfile?.specialties && peerProfile?.specialties?.length > 0),
            overallComplete: hasCompleteProfile
          })
        }
        
        else if (hasRole('landlord')) {
          console.log('🏢 Checking landlord profile...')
          // ✅ PHASE 4: Landlords don't need additional profile setup beyond registration
          // They should have phone in their registrant_profiles from registration
          hasCompleteProfile = !!profile?.phone
          
          console.log('🏢 Landlord profile check:', { 
            hasPhone: !!profile?.phone,
            overallComplete: hasCompleteProfile
          })
        }

        setProfileSetup({
          hasComprehensiveProfile: hasCompleteProfile,
          loading: false
        })

        console.log('✅ Profile completion check complete:', {
          userRoles: profile.roles,
          hasComprehensiveProfile: hasCompleteProfile
        })

      } catch (error) {
        console.error('❌ Error checking profile completion:', error)
        setProfileSetup({ hasComprehensiveProfile: false, loading: false })
      }
    }

    if (isAuthenticated && profile?.roles?.length) {
      checkProfileCompletion()
    } else {
      setProfileSetup({ hasComprehensiveProfile: false, loading: false })
    }
  }, [user, profile, hasRole, isAuthenticated])

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to landing')
    return <Navigate to="/" replace />
  }

  // Loading state while checking profile
  if (profileSetup.loading) {
    console.log('⏳ Profile setup loading...')
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <Header />
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading your dashboard..." />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ PHASE 4: Direct users to appropriate comprehensive form if not completed
  if (!profileSetup.hasComprehensiveProfile) {
    console.log('📝 User needs to complete comprehensive profile')
    
    // For APPLICANTS - show comprehensive matching profile form with demographics
    if (hasRole('applicant')) {
      console.log('👤 Redirecting applicant to comprehensive matching profile form')
      return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
          <div className="container">
            <Header />
            <div className="content">
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="alert alert-info mb-4">
                  <h4>Complete Your Profile</h4>
                  <p>Please complete your comprehensive profile to access the full platform and start finding compatible roommates.</p>
                </div>
                <EnhancedMatchingProfileForm 
                  onComplete={() => setProfileSetup(prev => ({ ...prev, hasComprehensiveProfile: true }))}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // For PEER SPECIALISTS - show comprehensive peer support form with demographics
    else if (hasRole('peer')) {
      console.log('🤝 Redirecting peer specialist to comprehensive peer support form')
      return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
          <div className="container">
            <Header />
            <div className="content">
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="alert alert-info mb-4">
                  <h4>Complete Your Peer Support Profile</h4>
                  <p>Please complete your comprehensive peer support profile to help others find the right support services.</p>
                </div>
                <PeerSupportProfileForm 
                  onComplete={() => setProfileSetup(prev => ({ ...prev, hasComprehensiveProfile: true }))}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // For LANDLORDS - they should already have phone from registration, so go to dashboard
    else if (hasRole('landlord')) {
      console.log('🏢 Landlord missing phone, updating profile setup')
      setProfileSetup(prev => ({ ...prev, hasComprehensiveProfile: true }))
      return null // Will re-render with updated state
    }
    
    // Fallback for unknown roles
    else {
      console.log('❓ Unknown role, redirecting to dashboard')
      setProfileSetup(prev => ({ ...prev, hasComprehensiveProfile: true }))
      return null // Will re-render with updated state
    }
  }

  console.log('✅ User has comprehensive profile, rendering main app routes')
  
  // ✅ PHASE 4: Main app routes with simplified navigation
  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="container">
        <Header />
        <Navigation />
        <div className="content">
          <Routes>
            {/* Dashboard Routes */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Applicant Routes */}
            {hasRole('applicant') && (
              <>
                <Route path="/profile/matching" element={
                  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <EnhancedMatchingProfileForm 
                      editMode={true}
                      onComplete={() => navigate('/app')}
                      onCancel={() => navigate('/app')}
                    />
                  </div>
                } />
                
                <Route path="/find-matches" element={<MatchFinder />} />
                {/* ✅ NEW: Added peer support finder route for applicants */}
                <Route path="/find-peer-support" element={<PeerSupportFinder />} />
                <Route path="/match-requests" element={<MatchRequests />} />
                {/* ✅ UPDATED: Changed from placeholder to new route */}
                <Route path="/property-search" element={<PropertySearch />} />
              </>
            )}

            {/* Peer Support Routes */}
            {hasRole('peer') && (
              <>
                <Route path="/profile/peer-support" element={
                  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <PeerSupportProfileForm 
                      editMode={true}
                      onComplete={() => navigate('/app')}
                      onCancel={() => navigate('/app')}
                    />
                  </div>
                } />
                
                <Route path="/peer-dashboard" element={<PeerSupportDashboard />} />
                <Route path="/clients" element={<MatchRequests />} />
              </>
            )}
            
            {/* Landlord Routes */}
            {hasRole('landlord') && (
              <>
                {/* ✅ UNCHANGED: Landlords still use PropertyManagement for /properties */}
                <Route path="/properties" element={<PropertyManagement />} />
                <Route path="/tenants" element={<MatchRequests />} />
              </>
            )}

            {/* ✅ NEW: Universal PropertySearch route accessible to all roles */}
            <Route path="/property-search" element={<PropertySearch />} />

            {/* Common Routes for All Users */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/match-requests" element={<MatchRequests />} />
            
            {/* ✅ PHASE 4: Updated basic profile route - now just shows/updates phone */}
            <Route path="/profile/basic" element={
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card">
                  <h2 className="form-title">Basic Account Information</h2>
                  <div className="alert alert-info mb-4">
                    <p>Your comprehensive profile information is managed in your role-specific profile sections.</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Name</label>
                    <input
                      className="input"
                      type="text"
                      value={`${profile?.first_name || ''} ${profile?.last_name || ''}`}
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Email</label>
                    <input
                      className="input"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Roles</label>
                    <input
                      className="input"
                      type="text"
                      value={profile?.roles?.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ') || ''}
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Phone</label>
                    <input
                      className="input"
                      type="tel"
                      value={profile?.phone || 'Not provided'}
                      disabled
                    />
                    <div className="text-gray-500 mt-1">
                      To update your phone number and other details, use your role-specific profile sections.
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/app')}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            } />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default MainApp
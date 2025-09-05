// src/pages/MainApp.js
import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../utils/supabase'

// Layout
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'

// Common Components
import LoadingSpinner from '../components/common/LoadingSpinner'

// Form Components
import BasicProfileForm from '../components/forms/BasicProfileForm'
import MatchingProfileForm from '../components/forms/MatchingProfileForm'

// Dashboard Components  
import Dashboard from '../components/dashboard/Dashboard'
import MatchFinder from '../components/dashboard/MatchFinder'
import MatchRequests from '../components/dashboard/MatchRequests'
import PropertyManagement from '../components/dashboard/PropertyManagement'

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

const PropertySearch = () => (
  <div className="card">
    <h1 className="card-title">Property Search</h1>
    <p className="card-text mb-4">
      Search for recovery-friendly housing options in your area.
    </p>
    <div className="alert alert-info">
      <p>Property search features coming soon...</p>
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
  console.log('🏠 MainApp rendering, current URL:', window.location.pathname);
  const { user, profile, isAuthenticated, hasRole } = useAuth()
  const navigate = useNavigate()
  
  const [profileSetup, setProfileSetup] = useState({
    basicProfile: false,
    matchingProfile: false,
    loading: true
  })

  // Check profile completion status
  useEffect(() => {
    const checkProfileSetup = async () => {
      if (!user) return

      try {
        // Check basic profile
        const { data: basicProfile } = await db.basicProfiles.getByUserId(user.id)
        
        // Check matching profile (for applicants only)
        let matchingProfile = null
        if (hasRole('applicant')) {
          const { data } = await db.matchingProfiles.getByUserId(user.id)
          matchingProfile = data
        }

        setProfileSetup({
          basicProfile: !!basicProfile,
          matchingProfile: !hasRole('applicant') || !!matchingProfile,
          loading: false
        })
      } catch (error) {
        console.error('Error checking profile setup:', error)
        setProfileSetup(prev => ({ ...prev, loading: false }))
      }
    }

    if (isAuthenticated && profile) {
      checkProfileSetup()
    }
  }, [user, profile, hasRole, isAuthenticated])

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Loading state
  if (profileSetup.loading) {
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

  // Profile setup flow for new users
  if (!profileSetup.basicProfile) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <Header />
          <div className="content">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <BasicProfileForm 
                onComplete={() => setProfileSetup(prev => ({ ...prev, basicProfile: true }))}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasRole('applicant') && !profileSetup.matchingProfile) {
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <Header />
          <div className="content">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <MatchingProfileForm 
                onComplete={() => setProfileSetup(prev => ({ ...prev, matchingProfile: true }))}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
  console.log('🛣️ MainApp about to render routes, profileSetup:', profileSetup);
  // Main app routes
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
                <Route path="/find-matches" element={<MatchFinder />} />
                <Route path="/match-requests" element={<MatchRequests />} />
                <Route path="/properties" element={<PropertySearch />} />
              </>
            )}
            
            {/* Landlord Routes */}
            {hasRole('landlord') && (
              <>
                <Route path="/properties" element={<PropertyManagement />} />
                <Route path="/tenants" element={<MatchRequests />} />
              </>
            )}
            
            {/* Peer Support Routes */}
            {hasRole('peer') && (
              <>
                <Route path="/peer-dashboard" element={<PeerSupportDashboard />} />
                <Route path="/clients" element={<MatchRequests />} />
              </>
            )}
            
            {/* Common Routes */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Profile Management Routes */}
            <Route path="/profile/basic" element={
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <BasicProfileForm 
                  editMode={true}
                  onComplete={() => navigate('/')}
                  onCancel={() => navigate('/')}
                />
              </div>
            } />
            
            {hasRole('applicant') && (
              <Route path="/profile/matching" element={
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <MatchingProfileForm 
                    editMode={true}
                    onComplete={() => navigate('/')}
                    onCancel={() => navigate('/')}
                  />
                </div>
              } />
            )}
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default MainApp
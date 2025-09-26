// src/pages/MainApp.js - UPDATED: Fixed profile completion checks for new schema
import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import { db } from '../utils/supabase'

// Layout
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'

// Common Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Settings from '../components/ui/Settings';

// Form Components
import EnhancedMatchingProfileForm from '../components/features/matching/EnhancedMatchingProfileForm'
import PeerSupportProfileForm from '../components/features/peer-support/PeerSupportProfileForm'

// Dashboard Components  
import Dashboard from './Dashboard'
import RoommateDiscovery from '../components/features/matching/RoommateDiscovery'
import MatchRequests from '../components/features/matching/MatchRequests'
import PropertyManagement from '../components/features/property/PropertyManagement'
import PeerSupportFinder from '../components/features/peer-support/PeerSupportFinder'
import EmployerManagement from '../components/features/employer/EmployerManagement'
import EmployerFinder from '../components/features/employer/EmployerFinder'
import ConnectionHub from '../components/features/connections/ConnectionHub'
import PeerSupportHub from '../components/features/peer-support/PeerSupportHub'

// Search Components
import PropertySearch from '../components/features/property/PropertySearch';

// Candidate Management placeholder
const CandidateManagement = () => (
  <div className="card">
    <h1 className="card-title">Candidate Management</h1>
    <p className="card-text mb-4">
      Review job applications and manage candidates for your open positions.
    </p>
    <div className="alert alert-info">
      <p>Candidate management features coming soon...</p>
    </div>
  </div>
)

const MainApp = () => {
  console.log('🏠 MainApp rendering with employer support, current URL:', window.location.pathname);
  const { user, profile, isAuthenticated, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const profileJustCompleted = queryParams.get('profileComplete') === 'true';
  
  // Profile setup tracking
  const [profileSetup, setProfileSetup] = useState({
    hasComprehensiveProfile: false,
    loading: true
  })

  // ✅ UPDATED: Check if user has completed their role-specific comprehensive profile
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
          
          // ✅ UPDATED: Use matchingProfiles service with proper error handling
          const result = await db.matchingProfiles.getByUserId(user.id)
          
          if (result.success && result.data) {
            const applicantProfile = result.data;
            
            // ✅ UPDATED: Check for comprehensive profile completion using correct schema fields
            hasCompleteProfile = !!(
              applicantProfile?.primary_city && 
              applicantProfile?.primary_state && 
              applicantProfile?.budget_min && 
              applicantProfile?.budget_max &&
              applicantProfile?.recovery_stage &&
              applicantProfile?.about_me && 
              applicantProfile?.looking_for &&
              applicantProfile?.profile_completed
            )
            
            console.log('👤 Applicant profile check:', { 
              hasProfile: !!applicantProfile,
              hasLocation: !!(applicantProfile?.primary_city && applicantProfile?.primary_state),
              hasBudget: !!(applicantProfile?.budget_min && applicantProfile?.budget_max),
              hasRecoveryInfo: !!applicantProfile?.recovery_stage,
              hasContent: !!(applicantProfile?.about_me && applicantProfile?.looking_for),
              isCompleted: !!applicantProfile?.profile_completed,
              completionPercentage: applicantProfile?.completion_percentage || 0,
              overallComplete: hasCompleteProfile
            })
          } else {
            console.log('👤 No applicant profile found or error:', result.error);
            hasCompleteProfile = false;
          }
        }
        
        else if (hasRole('peer')) {
          console.log('🤝 Checking peer support comprehensive profile...')
          const result = await db.peerSupportProfiles.getByUserId(user.id)
          
          // ✅ UPDATED: Handle service response format consistently
          const peerProfile = result?.success ? result.data : result?.data || result;
          
          hasCompleteProfile = !!(
            peerProfile?.phone && 
            peerProfile?.bio && 
            peerProfile?.specialties &&
            peerProfile?.specialties?.length > 0
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
          
          // ✅ UPDATED: For landlords, check if they have basic contact info
          // They might also have a matching profile for personal info
          let landlordComplete = !!profile?.phone;
          
          if (!landlordComplete) {
            // Check if they have personal info in matching profile
            const result = await db.matchingProfiles.getByUserId(user.id);
            if (result.success && result.data) {
              landlordComplete = !!result.data.primary_phone;
            }
          }
          
          hasCompleteProfile = landlordComplete;
          
          console.log('🏢 Landlord profile check:', { 
            hasProfilePhone: !!profile?.phone,
            hasMatchingPhone: !!(await db.matchingProfiles.getByUserId(user.id)).data?.primary_phone,
            overallComplete: hasCompleteProfile
          })
        }

        else if (hasRole('employer')) {
          console.log('💼 Checking employer comprehensive profile...')
          const result = await db.employerProfiles.getByUserId(user.id)
          
          // ✅ UPDATED: Handle employer profiles response format
          const employerProfiles = result?.success ? result.data : 
                                  Array.isArray(result?.data) ? result.data :
                                  result?.data ? [result.data] : 
                                  Array.isArray(result) ? result : [];
          
          if (employerProfiles && employerProfiles.length > 0) {
            const employerProfile = employerProfiles[0]
            hasCompleteProfile = !!(
              employerProfile?.company_name && 
              employerProfile?.industry && 
              employerProfile?.description && 
              employerProfile?.recovery_friendly_features?.length > 0 &&
              employerProfile?.profile_completed
            )
            
            console.log('💼 Employer profile check:', { 
              hasProfile: !!employerProfile,
              hasBasicInfo: !!(employerProfile?.company_name && employerProfile?.industry),
              hasDescription: !!employerProfile?.description,
              hasRecoveryFeatures: !!(employerProfile?.recovery_friendly_features?.length > 0),
              isCompleted: !!employerProfile?.profile_completed,
              overallComplete: hasCompleteProfile
            })
          } else {
            console.log('💼 No employer profile found')
            hasCompleteProfile = false
          }
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

  // Direct users to appropriate comprehensive form if not completed
  if (!profileSetup.hasComprehensiveProfile && !profileJustCompleted) {
    console.log('📝 User needs to complete comprehensive profile');
    
    // For APPLICANTS - show comprehensive matching profile form with demographics
    if (hasRole('applicant')) {
      console.log('👤 Redirecting applicant to comprehensive matching profile form');
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
    
    // For EMPLOYERS - redirect to employer management to create profile
    else if (hasRole('employer')) {
      console.log('💼 Redirecting employer to create employer profile')
      return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
          <div className="container">
            <Header />
            <div className="content">
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="alert alert-info mb-4">
                  <h4>Create Your Employer Profile</h4>
                  <p>Please create your company profile to start connecting with recovery-focused talent and posting job opportunities.</p>
                </div>
                <EmployerManagement />
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // For LANDLORDS - they should already have phone from registration, so go to dashboard
    else if (hasRole('landlord')) {
      console.log('🏢 Landlord missing contact info, updating profile setup')
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
                <Route path="/profile/matching" element={
                  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <EnhancedMatchingProfileForm 
                      editMode={true}
                      onComplete={() => navigate('/app')}
                      onCancel={() => navigate('/app')}
                    />
                  </div>
                } />
                
                <Route path="/find-matches" element={<RoommateDiscovery />} />
                <Route path="/find-peer-support" element={<PeerSupportFinder />} />
                <Route path="/find-employers" element={<EmployerFinder />} />
                <Route path="/match-requests" element={<MatchRequests />} />
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
                
                <Route path="/peer-dashboard" element={<PeerSupportHub />} />
                <Route path="/clients" element={<MatchRequests />} />
              </>
            )}
            
            {/* Landlord Routes */}
            {hasRole('landlord') && (
              <>
                <Route path="/properties" element={<PropertyManagement />} />
                <Route path="/tenants" element={<MatchRequests />} />
              </>
            )}

            {/* Employer Routes */}
            {hasRole('employer') && (
              <>
                <Route path="/employers" element={<EmployerManagement />} />
                <Route path="/candidates" element={<CandidateManagement />} />
                <Route path="/job-applications" element={<MatchRequests />} />
              </>
            )}

            {/* Universal Routes */}
            <Route path="/property-search" element={<PropertySearch />} />
            <Route path="/connections" element={<MatchRequests />} />
            <Route path="/communications" element={<ConnectionHub />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/match-requests" element={<MatchRequests />} />
            
            {/* Redirect old routes */}
            <Route path="/messages" element={<Navigate to="/app/communications" replace />} />
            
            {/* ✅ UPDATED: Basic profile route with new schema field names */}
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
                      value={profile?.roles?.map(role => {
                        switch(role) {
                          case 'applicant': return 'Housing Seeker'
                          case 'peer': return 'Peer Specialist'
                          case 'landlord': return 'Property Owner'
                          case 'employer': return 'Recovery-Friendly Employer'
                          default: return role.charAt(0).toUpperCase() + role.slice(1)
                        }
                      }).join(', ') || ''}
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
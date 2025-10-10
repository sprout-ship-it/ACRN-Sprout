// src/pages/MainApp.js - FIXED PEER SUPPORT TO USE STANDALONE FUNCTION + SAVED EMPLOYERS
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';

// ✅ FIXED: Import db object and supabase client, remove individual function imports
import { supabase, db } from '../utils/supabase';
import { getMatchingProfile } from '../utils/database/matchingProfilesService';
import { getEmployerProfilesByUserId } from '../utils/database/employerService';

// ✅ FIXED: Import the standalone peer support function
import { getPeerSupportProfile } from '../utils/database/peerSupportService';

// Layout
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'

// Common Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Settings from '../components/ui/Settings';

// Form Components
import EnhancedMatchingProfileForm from '../components/features/matching/EnhancedMatchingProfileForm'
import PeerSupportProfileForm from '../components/features/peer-support/PeerSupportProfileForm'
import LandlordProfileForm from '../components/features/property/LandlordProfileForm'

// Dashboard Components  
import Dashboard from './Dashboard'
import RoommateDiscovery from '../components/features/matching/RoommateDiscovery'
import MatchRequests from '../components/features/matching/MatchRequests'
import PropertyManagement from '../components/features/property/PropertyManagement'
import PeerSupportFinder from '../components/features/peer-support/PeerSupportFinder'
import EmployerManagement from '../components/features/employer/EmployerManagement'
import EmployerFinder from '../components/features/employer/EmployerFinder'
import SavedEmployers from '../components/features/employer/SavedEmployers'
import ConnectionHub from '../components/features/connections/ConnectionHub'
import PeerSupportDashboard from '../components/features/peer-support/PeerSupportDashboard'
import PeerSupportModal from '../components/features/peer-support/PeerSupportModal'

// Search Components
import PropertySearch from '../components/features/property/PropertySearch';
import SavedProperties from '../components/features/property/SavedProperties';

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
  console.log('MainApp rendering with consistent service patterns, current URL:', window.location.pathname);
  const { user, profile, isAuthenticated, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation();
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // ✅ NEW: Debug what's changing between renders
  const debugInfo = {
    userId: user?.id,
    profileId: profile?.id,
    roles: profile?.roles,
    isAuthenticated,
    pathname: location.pathname,
    timestamp: Date.now()
  };
  console.log('🔍 MainApp render debug:', debugInfo);
  
  // ✅ FIXED: Stable query params check
  const profileJustCompleted = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('profileComplete') === 'true';
  }, [location.search]);
  
  // ✅ FIXED: Add stable refs to prevent infinite re-renders
  const isCheckingProfileRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProfileCheckRef = useRef(null);
  const formDecisionMadeRef = useRef(false); // ✅ KEY: Lock form decision once made
  
  // ✅ FIXED: Memoize profile key to prevent unnecessary re-checks
  const profileKey = useMemo(() => {
    if (!profile?.id || !profile?.roles?.length) return null;
    return `${profile.id}-${profile.roles.sort().join(',')}`;
  }, [profile?.id, profile?.roles]);
  
  // ✅ CLEAN: Simple profile setup state - NO formShown tracking
  const [profileSetup, setProfileSetup] = useState(() => ({
    hasComprehensiveProfile: false,
    loading: true,
    error: null,
    lastChecked: null,
    profileKey: null,
    checkInProgress: false
  }));

  // ✅ FIXED: Landlord profile check with stable callback
  const checkLandlordProfile = useCallback(async (profileId) => {
    try {
      const { data, error } = await supabase
        .from('landlord_profiles')
        .select('id, profile_completed, primary_phone, business_type')
        .eq('user_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (data) {
        const isComplete = !!(
          data.primary_phone && 
          data.business_type && 
          data.profile_completed
        );
        
        console.log('Landlord profile check:', { 
          hasProfile: !!data,
          hasPhone: !!data.primary_phone,
          hasBusinessType: !!data.business_type,
          isCompleted: !!data.profile_completed,
          overallComplete: isComplete
        });
        
        return isComplete;
      } else {
        console.log('No landlord profile found');
        return false;
      }
    } catch (error) {
      console.error('Error checking landlord profile:', error);
      return false;
    }
  }, []); // No dependencies - supabase client is stable

  // ✅ FIXED: Stable profile completion check using standalone functions
  const checkProfileCompletion = useCallback(async (currentProfileKey) => {
    try {
      // ✅ CRITICAL FIX: Prevent multiple simultaneous checks
      if (isCheckingProfileRef.current || !isMountedRef.current) {
        console.log('🔧 Profile check already in progress or component unmounted');
        return;
      }

      // ✅ CRITICAL FIX: Don't re-check if we already have a definitive result for this profile
      if (lastProfileCheckRef.current === currentProfileKey && profileSetup.lastChecked) {
        const timeSinceLastCheck = Date.now() - profileSetup.lastChecked;
        if (timeSinceLastCheck < 5000) { // Don't re-check within 5 seconds
          console.log('🔧 Profile already checked recently, skipping:', currentProfileKey);
          return;
        }
      }

      // ✅ CRITICAL FIX: If we're showing the form and haven't completed it, don't re-check
      if (!profileSetup.hasComprehensiveProfile && 
          profileSetup.profileKey === currentProfileKey && 
          !profileSetup.loading &&
          !profileSetup.checkInProgress) {
        console.log('🔧 Profile form is being shown, not re-checking to prevent loop');
        return;
      }

      // ✅ FIXED: Validate required data
      if (!user || !profile?.id || !profile?.roles?.length) {
        console.log('Missing user, profile, or roles:', { user: !!user, profile: !!profile, roles: profile?.roles })
        if (isMountedRef.current) {
          setProfileSetup(prev => ({
            ...prev,
            hasComprehensiveProfile: false, 
            loading: false, 
            error: null,
            lastChecked: Date.now(),
            profileKey: currentProfileKey,
            checkInProgress: false
          }));
          lastProfileCheckRef.current = currentProfileKey;
        }
        return;
      }

      // ✅ FIXED: Set checking flags BEFORE any async operations
      isCheckingProfileRef.current = true;
      lastProfileCheckRef.current = currentProfileKey;

      // ✅ FIXED: Update state to show check in progress
      if (isMountedRef.current) {
        setProfileSetup(prev => ({
          ...prev,
          checkInProgress: true,
          error: null
        }));
      }

      try {
        console.log('Checking profile completion for profile.id:', profile.id, 'roles:', profile.roles);
        
        let hasCompleteProfile = false;
        let profileError = null;

        // Check based on user's primary role
        if (hasRole('applicant')) {
          console.log('Checking applicant comprehensive profile...');
          
          try {
            const result = await getMatchingProfile(profile.id, supabase);
            
            if (result.success && result.data) {
              const applicantProfile = result.data;
              
              hasCompleteProfile = !!(
                applicantProfile?.primary_city && 
                applicantProfile?.primary_state && 
                applicantProfile?.budget_min && 
                applicantProfile?.budget_max &&
                applicantProfile?.recovery_stage &&
                applicantProfile?.about_me && 
                applicantProfile?.looking_for &&
                applicantProfile?.profile_completed
              );
              
              console.log('Applicant profile check complete:', hasCompleteProfile);
            } else {
              console.log('No applicant profile found or error:', result.error);
              hasCompleteProfile = false;
            }
          } catch (error) {
            console.error('Error checking applicant profile:', error);
            profileError = 'Failed to check applicant profile';
            hasCompleteProfile = false;
          }
        }
        
        // ✅ FIXED: Peer support check using standalone function
        else if (hasRole('peer-support')) {
          console.log('Checking peer support comprehensive profile using standalone function...');
          
          try {
            // ✅ FIXED: Use the standalone function like applicant does
            const result = await getPeerSupportProfile(profile.id, supabase);
            
            if (result.success && result.data) {
              const peerProfile = result.data;
              
              hasCompleteProfile = !!(
                peerProfile?.primary_phone && 
                peerProfile?.bio && 
                peerProfile?.specialties &&
                peerProfile?.specialties?.length > 0 &&
                peerProfile?.profile_completed
              );
              
              console.log('✅ Peer profile check complete using standalone function:', hasCompleteProfile, {
                hasPhone: !!peerProfile?.primary_phone,
                hasBio: !!peerProfile?.bio,
                hasSpecialties: !!(peerProfile?.specialties?.length > 0),
                isCompleted: !!peerProfile?.profile_completed
              });
            } else if (result.error) {
              // ✅ FIXED: Handle specific error types without causing loops
              if (result.code === 'NOT_FOUND' || result.error?.includes('No peer support profile found')) {
                console.log('ℹ️ No peer support profile found (normal for new users)');
                hasCompleteProfile = false;
                profileError = null; // Don't treat "not found" as an error
              } else {
                console.error('❌ Unexpected peer support profile error:', result.error);
                profileError = 'Failed to check peer support profile';
                hasCompleteProfile = false;
              }
            }
          } catch (error) {
            console.error('❌ Error checking peer support profile:', error);
            profileError = 'Failed to check peer support profile';
            hasCompleteProfile = false;
          }
        }
        
        else if (hasRole('landlord')) {
          console.log('Checking landlord profile...');
          
          try {
            hasCompleteProfile = await checkLandlordProfile(profile.id);
          } catch (error) {
            console.error('Error checking landlord profile:', error);
            profileError = 'Failed to check landlord profile';
            hasCompleteProfile = false;
          }
        }

        else if (hasRole('employer')) {
          console.log('Checking employer comprehensive profile...');
          
          try {
            const result = await getEmployerProfilesByUserId(profile.id);
            
            if (result.success && result.data && result.data.length > 0) {
              const employerProfile = result.data[0];
              
              // ✅ UPDATED: Check based on new schema fields and requirements
              hasCompleteProfile = !!(
                employerProfile?.company_name && 
                employerProfile?.industry && 
                employerProfile?.business_type && 
                employerProfile?.city && 
                employerProfile?.state && 
                employerProfile?.zip_code && 
                employerProfile?.phone && 
                employerProfile?.description &&
                employerProfile?.description.length >= 50 // Require substantial description
              );
              
              console.log('✅ Employer profile check complete using new schema:', hasCompleteProfile, {
                hasCompanyName: !!employerProfile?.company_name,
                hasIndustry: !!employerProfile?.industry,
                hasBusinessType: !!employerProfile?.business_type,
                hasLocation: !!(employerProfile?.city && employerProfile?.state && employerProfile?.zip_code),
                hasPhone: !!employerProfile?.phone,
                hasDescription: !!employerProfile?.description,
                descriptionLength: employerProfile?.description?.length || 0,
                isActive: !!employerProfile?.is_active
              });
              
            } else if (result.error) {
              // ✅ FIXED: Handle specific error types without causing loops
              if (result.error?.code === 'NOT_FOUND' || result.error?.message?.includes('No employer profiles found')) {
                console.log('ℹ️ No employer profile found (normal for new users)');
                hasCompleteProfile = false;
                profileError = null; // Don't treat "not found" as an error
              } else {
                console.error('❌ Unexpected employer profile error:', result.error);
                profileError = 'Failed to check employer profile';
                hasCompleteProfile = false;
              }
            } else {
              console.log('ℹ️ No employer profile found');
              hasCompleteProfile = false;
            }
          } catch (error) {
            console.error('❌ Error checking employer profile:', error);
            profileError = 'Failed to check employer profile';
            hasCompleteProfile = false;
          }
        }

        // ✅ CRITICAL FIX: Only update state if component is still mounted AND values actually changed
        if (isMountedRef.current) {
          const newState = {
            hasComprehensiveProfile: hasCompleteProfile,
            loading: false,
            error: profileError,
            lastChecked: Date.now(),
            profileKey: currentProfileKey,
            checkInProgress: false
          };

          // ✅ CRITICAL FIX: Only update if values actually changed
          setProfileSetup(prev => {
            const hasChanged = (
              prev.hasComprehensiveProfile !== newState.hasComprehensiveProfile ||
              prev.error !== newState.error ||
              prev.profileKey !== newState.profileKey ||
              prev.checkInProgress !== newState.checkInProgress
            );

            if (hasChanged) {
              console.log('📝 Updating profile setup state:', {
                from: {
                  hasProfile: prev.hasComprehensiveProfile,
                  error: prev.error,
                  profileKey: prev.profileKey
                },
                to: {
                  hasProfile: newState.hasComprehensiveProfile,
                  error: newState.error,
                  profileKey: newState.profileKey
                }
              });
              // ✅ CRITICAL FIX: Reset decision lock if profile status changed
              if (prev.hasComprehensiveProfile !== newState.hasComprehensiveProfile) {
                formDecisionMadeRef.current = false;
              }
              return newState;
            } else {
              console.log('📝 Profile setup state unchanged, skipping update');
              return { ...prev, checkInProgress: false, lastChecked: Date.now() };
            }
          });
        }

        console.log('✅ Profile completion check complete:', {
          profileKey: currentProfileKey,
          hasComprehensiveProfile: hasCompleteProfile,
          error: profileError
        });

      } catch (error) {
        console.error('💥 Error checking profile completion:', error);
        if (isMountedRef.current) {
          setProfileSetup(prev => ({ 
            ...prev,
            hasComprehensiveProfile: false, 
            loading: false, 
            error: 'Failed to check profile status',
            lastChecked: Date.now(),
            profileKey: currentProfileKey,
            checkInProgress: false
          }));
        }
      } finally {
        isCheckingProfileRef.current = false;
      }
    } catch (outerError) {
      console.error('💥 Outer error in profile completion check:', outerError);
      isCheckingProfileRef.current = false;
    }
  }, [user, profile, hasRole, checkLandlordProfile]);
  
  // ✅ CRITICAL FIX: Very restrictive effect - only trigger when absolutely necessary
  useEffect(() => {
    // ✅ CRITICAL: If we already decided to show form, don't re-check
    if (formDecisionMadeRef.current) {
      console.log('🔒 Form decision already locked, skipping re-check');
      return;
    }

    // ✅ NEW: Don't do anything if we're already showing the form to a user who needs to complete profile
    if (!profileSetup.hasComprehensiveProfile && 
        profileSetup.profileKey === profileKey && 
        !profileSetup.loading && 
        !profileSetup.checkInProgress &&
        profileSetup.lastChecked) {
      console.log('🔍 Form already determined to be needed, skipping re-check');
      return;
    }

    // Only check if we have a valid profile key and we're not already in the middle of a check
    if (isAuthenticated && profileKey && !profileSetup.checkInProgress) {
      const shouldCheck = (
        // First time checking for this profile
        profileSetup.profileKey !== profileKey ||
        // Or we're still in initial loading state
        (profileSetup.loading && !profileSetup.lastChecked)
      );

      if (shouldCheck) {
        console.log('🔍 Triggering profile completion check for:', profileKey);
        checkProfileCompletion(profileKey);
      } else {
        console.log('🔍 Skipping profile check - already done for this profile');
      }
    } else if (isAuthenticated && !profileKey) {
      // User is authenticated but no valid profile data yet
      console.log('👤 User authenticated but waiting for profile data');
      if (isMountedRef.current && !profileSetup.checkInProgress) {
        setProfileSetup(prev => ({ 
          ...prev,
          hasComprehensiveProfile: false, 
          loading: true, 
          error: null,
          lastChecked: null,
          profileKey: null
        }));
        formDecisionMadeRef.current = false;
      }
    } else if (!isAuthenticated) {
      // Not authenticated
      if (isMountedRef.current && !profileSetup.checkInProgress) {
        setProfileSetup(prev => ({ 
          ...prev,
          hasComprehensiveProfile: false, 
          loading: false, 
          error: null,
          lastChecked: Date.now(),
          profileKey: null
        }));
        formDecisionMadeRef.current = false;
      }
    }
  }, [isAuthenticated, profileKey]); // ✅ REMOVED checkProfileCompletion from dependencies

  // ✅ FIXED: Component cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      isCheckingProfileRef.current = false;
      formDecisionMadeRef.current = false;
    };
  }, []);

  // ✅ FIXED: Stable profile setup completion handler
  const handleProfileSetupComplete = useCallback(() => {
    console.log('✅ Profile setup completed, updating state and resetting locks');
    if (isMountedRef.current) {
      setProfileSetup(prev => ({ 
        ...prev, 
        hasComprehensiveProfile: true,
        error: null,
        lastChecked: Date.now(),
        checkInProgress: false
      }));
      // ✅ CRITICAL FIX: Reset decision locks when profile is completed
      formDecisionMadeRef.current = false;
      lastProfileCheckRef.current = null;
    }
  }, []);

  // ✅ BULLETPROOF: Absolutely locked form decision - no dependencies once locked
  const shouldShowProfileForm = useMemo(() => {
    // ✅ CRITICAL FIX: Once decision is made, return true immediately - no other checks
    if (formDecisionMadeRef.current) {
      return true; // Absolutely locked - no console.log to avoid triggering anything
    }

    if (!isAuthenticated) return false;
    if (profileSetup.loading || profileSetup.checkInProgress) return false;
    if (profileJustCompleted) return false;
    if (profileSetup.hasComprehensiveProfile) return false;
    
    // Must have checked profile and determined it needs completion
    const shouldShow = !profileSetup.hasComprehensiveProfile && profileSetup.lastChecked && !profileSetup.loading;
    
    // ✅ CRITICAL FIX: Lock the decision once we decide to show the form (REF ONLY - NO STATE UPDATE)
    if (shouldShow && !formDecisionMadeRef.current) {
      console.log('🔒 Locking form decision - will show profile form');
      formDecisionMadeRef.current = true;
    }
    
    return shouldShow;
  }, [
    // ✅ BULLETPROOF: Minimal dependencies - form decision ref not included
    isAuthenticated, 
    profileSetup.loading, 
    profileSetup.checkInProgress, 
    profileSetup.hasComprehensiveProfile, 
    profileSetup.lastChecked,
    profileJustCompleted
  ]);

  // ✅ BULLETPROOF: Stable role detection with minimal dependencies
  const primaryRole = useMemo(() => {
    if (!hasRole || typeof hasRole !== 'function') return null;
    
    // Check roles in order of priority
    const roles = profile?.roles;
    if (!roles || !Array.isArray(roles)) return null;
    
    // Return first matching role to avoid re-computation
    if (roles.includes('applicant')) return 'applicant';
    if (roles.includes('peer-support')) return 'peer-support';
    if (roles.includes('employer')) return 'employer';
    if (roles.includes('landlord')) return 'landlord';
    return null;
  }, [profile?.roles]); // Only depend on roles array, not hasRole function

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to landing');
    return <Navigate to="/" replace />
  }

  // ✅ FIXED: Loading state with better messaging
  if (profileSetup.loading || profileSetup.checkInProgress) {
    console.log('Profile setup loading...');
    return (
      <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <Header />
          <div className="content">
            <div className="flex-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner message="Loading your dashboard..." />
              {profileSetup.error && (
                <div className="alert alert-warning mt-3" style={{ maxWidth: '500px' }}>
                  <p><strong>Notice:</strong> {profileSetup.error}</p>
                  <p><small>You can still access most features below.</small></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ BULLETPROOF: Completely locked form display - no re-evaluation once decided
  if (shouldShowProfileForm) {
    // Form display is locked - proceed to render
    
    // ✅ FIXED: Render error alert component
    const ErrorAlert = () => {
      if (profileSetup.error) {
        return (
          <div className="alert alert-warning mb-4">
            <h4>Service Notice</h4>
            <p>{profileSetup.error}</p>
            <p><small>You can still complete your profile, but some features may be limited until services are restored.</small></p>
          </div>
        );
      }
      return null;
    };
    
    // ✅ CLEAN: Use switch statement with memoized role
    switch (primaryRole) {
      case 'applicant':
        return (
          <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
            <div className="container">
              <Header />
              <div className="content">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <ErrorAlert />
                  <div className="alert alert-info mb-4">
                    <h4>Complete Your Profile</h4>
                    <p>Please complete your comprehensive profile to access the full platform and start finding compatible roommates.</p>
                  </div>
                  <EnhancedMatchingProfileForm 
                    onComplete={handleProfileSetupComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'peer-support':
        return (
          <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
            <div className="container">
              <Header />
              <div className="content">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <ErrorAlert />
                  <div className="alert alert-info mb-4">
                    <h4>Complete Your Peer Support Profile</h4>
                    <p>Please complete your comprehensive peer support profile to help others find the right support services.</p>
                  </div>
                  <PeerSupportProfileForm 
                    onComplete={handleProfileSetupComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'employer':
        return (
          <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
            <div className="container">
              <Header />
              <div className="content">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <ErrorAlert />
                  <div className="alert alert-info mb-4">
                    <h4>Create Your Employer Profile</h4>
                    <p>Please create your company profile to start connecting with recovery-focused talent and posting job opportunities.</p>
                  </div>
                  <EmployerManagement />
                </div>
              </div>
            </div>
          </div>
        );

      case 'landlord':
        return (
          <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
            <div className="container">
              <Header />
              <div className="content">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <ErrorAlert />
                  <div className="alert alert-info mb-4">
                    <h4>Complete Your Landlord Profile</h4>
                    <p>Please complete your landlord profile to start listing properties and connecting with potential tenants.</p>
                  </div>
                  <LandlordProfileForm 
                    onComplete={handleProfileSetupComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        if (isMountedRef.current) {
          setProfileSetup(prev => ({ ...prev, hasComprehensiveProfile: true }));
        }
        return null; // Will re-render with updated state
    }
  }

  // User has comprehensive profile, render main app routes
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
                <Route path="/saved-employers" element={<SavedEmployers />} />
                <Route path="/match-requests" element={<MatchRequests />} />
                <Route path="/property-search" element={<PropertySearch />} />
                <Route path="/saved-properties" element={<SavedProperties />} />
              </>
            )}

            {/* Peer Support Routes */}
            {hasRole('peer-support') && (
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
                
                <Route path="/peer-dashboard" element={
  <>
    <PeerSupportDashboard 
      onClientSelect={(client) => {
        setSelectedClient(client);
        setModalOpen(true);
      }}
    />
    {modalOpen && selectedClient && (
      <PeerSupportModal 
        client={selectedClient}
        onClose={() => {
          setModalOpen(false);
          setSelectedClient(null);
        }}
        onClientUpdate={() => {
          // Optional: trigger data refresh
        }}
      />
    )}
  </>
} />
                <Route path="/clients" element={<MatchRequests />} />
              </>
            )}
            
            {/* Landlord Routes */}
            {hasRole('landlord') && (
              <>
                <Route path="/profile/landlord" element={
                  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <LandlordProfileForm 
                      editMode={true}
                      onComplete={handleProfileSetupComplete}
                      onCancel={() => navigate('/app')}
                    />
                  </div>
                } />
                
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
            
            {/* Basic profile route */}
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
                          case 'peer-support': return 'Peer Specialist'
                          case 'landlord': return 'Property Owner'
                          case 'employer': return 'Recovery-Friendly Employer'
                          default: return role.charAt(0).toUpperCase() + role.slice(1)
                        }
                      }).join(', ') || ''}
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Account Status</label>
                    <input
                      className="input"
                      type="text"
                      value={profile?.is_active ? 'Active' : 'Inactive'}
                      disabled
                    />
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
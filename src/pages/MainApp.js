// src/pages/MainApp.js - SIMPLIFIED: No profile blocking, immediate dashboard access
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';

import { supabase, db } from '../utils/supabase';
import { getMatchingProfile } from '../utils/database/matchingProfilesService';
import { getEmployerProfilesByUserId } from '../utils/database/employerService';
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
import EmployerDashboard from '../components/features/employer/EmployerDashboard';

// Search Components
import PropertySearch from '../components/features/property/PropertySearch';
import SavedProperties from '../components/features/property/SavedProperties';

// ✅ SIMPLIFIED: Connection Hub Status Component - Just a visual prompt
const ConnectionHubStatus = ({ onNavigateToHub }) => {
  const { profile } = useAuth();
  
  const hasRoles = profile?.roles && profile.roles.length > 0;
  
  if (!hasRoles) {
    return null;
  }

  return (
    <div 
      className="connection-hub-status"
      onClick={onNavigateToHub}
    >
      <div className="connection-hub-content">
        <div className="connection-hub-icon">🤝</div>
        
        <div className="connection-hub-info">
          <div className="connection-hub-title">Connection Hub</div>
          <div className="connection-hub-subtitle">
            Manage your connections, requests, and communications
          </div>
        </div>

        <div className="connection-hub-action">
          <button className="connection-hub-button">
            Open Hub →
          </button>
        </div>
      </div>

      <style jsx>{`
        .connection-hub-status {
          background: #374151;
          border-radius: 12px;
          padding: 16px 24px;
          margin: 16px auto;
          width: 50%;
          max-width: 600px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
          position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .connection-hub-status:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border-color: rgba(255,255,255,0.1);
          background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
        }

        .connection-hub-content {
          display: flex;
          align-items: center;
          gap: 16px;
          color: white;
        }

        .connection-hub-icon {
          font-size: 2rem;
          position: relative;
          flex-shrink: 0;
        }

        .connection-hub-info {
          flex: 1;
          min-width: 0;
        }

        .connection-hub-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .connection-hub-subtitle {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .connection-hub-action {
          flex-shrink: 0;
        }

        .connection-hub-button {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .connection-hub-button:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
        }

        @media (max-width: 768px) {
          .connection-hub-status {
            padding: 12px 16px;
            margin: 12px auto;
            width: 90%;
          }

          .connection-hub-content {
            gap: 12px;
          }

          .connection-hub-icon {
            font-size: 1.5rem;
          }

          .connection-hub-title {
            font-size: 1rem;
          }

          .connection-hub-subtitle {
            font-size: 0.8rem;
          }

          .connection-hub-button {
            padding: 6px 12px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

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
  console.log('🚀 MainApp: Simplified multi-role version loading...');
  
  const { user, profile, isAuthenticated, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation();
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // ✅ SIMPLIFIED: Profile completion tracking for display only (NOT blocking)
  const [profileCompletion, setProfileCompletion] = useState({
    loading: true,
    completionData: {} // Format: { applicant: 100, 'peer-support': 0, landlord: 50, employer: 0 }
  });

  // ✅ NEW: Check if we should show the Connection Hub
  const shouldShowConnectionHub = useMemo(() => {
    if (!isAuthenticated || !profile?.id) return false;
    if (profileCompletion.loading) return false;
    
    // Don't show on profile setup screens
    const isProfileSetupRoute = location.pathname.includes('/profile/');
    if (isProfileSetupRoute) return false;
    
    // Show on dashboard and main routes
    return location.pathname === '/app' || location.pathname === '/app/';
  }, [isAuthenticated, profile?.id, profileCompletion.loading, location.pathname]);

  // ✅ SIMPLIFIED: Calculate completion for display purposes only
  const calculateProfileCompletion = useCallback(async () => {
    if (!profile?.id || !profile?.roles) {
      setProfileCompletion({ loading: false, completionData: {} });
      return;
    }

    console.log('📊 MainApp: Calculating profile completion for display:', profile.roles);

    try {
      const completionData = {};

      // Check each role's profile completion
      for (const role of profile.roles) {
        try {
          let percentage = 0;

          if (role === 'applicant') {
            const result = await getMatchingProfile(profile.id, supabase);
            if (result.success && result.data) {
              percentage = result.data.completion_percentage || 0;
            }
          } 
          else if (role === 'peer-support') {
            const result = await getPeerSupportProfile(profile.id, supabase);
            if (result.success && result.data) {
              percentage = result.data.profile_completed ? 100 : 50;
            }
          } 
          else if (role === 'landlord') {
            const { data, error } = await supabase
              .from('landlord_profiles')
              .select('profile_completed, primary_phone, business_type')
              .eq('user_id', profile.id)
              .single();

            if (data && !error) {
              percentage = data.profile_completed ? 100 : 50;
            }
          }
          else if (role === 'employer') {
            const result = await getEmployerProfilesByUserId(profile.id);
            if (result.success && result.data && result.data.length > 0) {
              percentage = 100; // Has at least one company profile
            }
          }

          completionData[role] = percentage;
          console.log(`  ${role}: ${percentage}%`);

        } catch (roleError) {
          console.warn(`  ${role}: Error checking profile:`, roleError);
          completionData[role] = 0;
        }
      }

      setProfileCompletion({ loading: false, completionData });
      console.log('✅ MainApp: Profile completion calculated:', completionData);

    } catch (error) {
      console.error('💥 MainApp: Error calculating profile completion:', error);
      setProfileCompletion({ loading: false, completionData: {} });
    }
  }, [profile?.id, profile?.roles]);

  // ✅ Calculate completion on mount and when profile changes
  useEffect(() => {
    if (isAuthenticated && profile?.id) {
      calculateProfileCompletion();
    }
  }, [isAuthenticated, profile?.id, calculateProfileCompletion]);

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    console.log('🔐 MainApp: User not authenticated, redirecting to landing');
    return <Navigate to="/" replace />
  }

  // ✅ SIMPLIFIED: Loading state
  if (profileCompletion.loading) {
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

  // ✅ SIMPLIFIED: Always render dashboard - no profile blocking!
  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="container">
        <Header />
        <Navigation profileCompletionStatus={profileCompletion.completionData} />
        
        {/* ✅ Connection Hub Status - Only on dashboard */}
        {shouldShowConnectionHub && (
          <ConnectionHubStatus 
            onNavigateToHub={() => navigate('/app/communications')}
          />
        )}
        
        <div className="content">
          <Routes>
            {/* Dashboard Routes */}
            <Route path="/" element={
              <Dashboard profileCompletionData={profileCompletion.completionData} />
            } />
            
            {/* Applicant Routes */}
            {hasRole('applicant') && (
              <>
                <Route path="/profile/matching" element={
                  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <EnhancedMatchingProfileForm 
                      editMode={true}
                      onComplete={() => {
                        calculateProfileCompletion(); // Refresh completion
                        navigate('/app');
                      }}
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
                      onComplete={() => {
                        calculateProfileCompletion(); // Refresh completion
                        navigate('/app');
                      }}
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
          // ✅ FIXED: Force component remount to refresh data
          const currentClient = selectedClient;
          setModalOpen(false);
          setSelectedClient(null);
          
          setTimeout(() => {
            setSelectedClient(currentClient);
            setModalOpen(true);
          }, 100);
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
                      onComplete={() => {
                        calculateProfileCompletion(); // Refresh completion
                        navigate('/app');
                      }}
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
                <Route path="/employer-dashboard" element={<EmployerDashboard />} />
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
// src/pages/Dashboard.js - ENHANCED: Multi-role support with RoleSelector
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// ✅ NEW: Import RoleSelector and utilities
import RoleSelector from '../components/ui/RoleSelector'
import { 
  calculateAllRolesCompletion,
  getInitialSelectedRole,
  saveSelectedRole,
  getCompletionStatus,
  getStatusIcon,
  getStatusLabel
} from '../utils/roleUtils'

import styles from './Dashboard.module.css'

const Dashboard = ({ profileCompletionData = {} }) => {
  const { profile, hasRole, user } = useAuth()
  const navigate = useNavigate()
  
  // ✅ NEW: Selected role state with localStorage persistence
  const [selectedRole, setSelectedRole] = useState(() => {
    if (!profile?.id || !profile?.roles) return null;
    return getInitialSelectedRole(profile.id, profile.roles, profileCompletionData);
  });

  // ✅ NEW: Calculate completion status for all roles
  const completionStatus = useMemo(() => {
    if (!profile?.roles || !profileCompletionData) return {};
    
    const status = {};
    profile.roles.forEach(role => {
      const percentage = profileCompletionData[role] || 0;
      status[role] = getCompletionStatus(percentage);
    });
    
    return status;
  }, [profile?.roles, profileCompletionData]);

  // ✅ NEW: Update selected role when profile loads
  useEffect(() => {
    if (profile?.id && profile?.roles && !selectedRole) {
      const initial = getInitialSelectedRole(profile.id, profile.roles, profileCompletionData);
      setSelectedRole(initial);
    }
  }, [profile?.id, profile?.roles, profileCompletionData, selectedRole]);

  // ✅ NEW: Handle role change from RoleSelector
  const handleRoleChange = useCallback((newRole) => {
    console.log('📊 Dashboard: Role changed to:', newRole);
    setSelectedRole(newRole);
    
    // Save to localStorage
    if (profile?.id) {
      saveSelectedRole(profile.id, newRole);
    }
  }, [profile?.id]);

  // ✅ ENHANCED: Get dashboard cards filtered by selected role with status
  const getDashboardCards = useCallback(() => {
    const cards = [];
    
    if (!user || !hasRole || typeof hasRole !== 'function' || !selectedRole) {
      return cards;
    }

    const roleStatus = completionStatus[selectedRole] || 'not-started';
    const isComplete = roleStatus === 'complete';
    
    // ✅ APPLICANT CARDS
    if (selectedRole === 'applicant' && hasRole('applicant')) {
      cards.push(
        { 
          id: 'find-matches', 
          label: 'Find Roommates', 
          description: 'Discover compatible roommates based on your preferences', 
          className: styles.roleCardHousingSeeker,
          path: '/app/find-matches',
          icon: '🔍',
          requiresProfile: true,
          status: roleStatus
        },
        { 
          id: 'find-peer-support', 
          label: 'Find Support', 
          description: 'Connect with experienced peer support specialists', 
          className: styles.roleCardPeerSupport,
          path: '/app/find-peer-support',
          icon: '👥',
          requiresProfile: false,
          status: 'complete' // Always accessible
        },
        { 
          id: 'find-employers', 
          label: 'Find Employment', 
          description: 'Discover recovery-friendly job opportunities', 
          className: styles.roleCardEmployer,
          path: '/app/find-employers',
          icon: '💼',
          requiresProfile: false,
          status: 'complete' // Always accessible
        },
        { 
          id: 'browse-properties', 
          label: 'Find Housing', 
          description: 'Search for recovery-friendly housing options', 
          className: styles.roleCardPropertyOwner,
          path: '/app/property-search',
          icon: '🏠',
          requiresProfile: false,
          status: 'complete' // Always accessible
        }
      );
    }
    
    // ✅ PEER SUPPORT CARDS
    if (selectedRole === 'peer-support' && hasRole('peer-support')) {
      cards.push(
        { 
          id: 'peer-dashboard', 
          label: 'Support Hub',
          description: 'Manage your peer support services and clients', 
          className: styles.roleCardPeerSupport,
          path: '/app/peer-dashboard',
          icon: '📊',
          requiresProfile: true,
          status: roleStatus
        }
      );
    }
    
// ✅ LANDLORD CARDS
if (selectedRole === 'landlord' && hasRole('landlord')) {
  cards.push(
    { 
      id: 'manage-properties', 
      label: 'My Properties',
      description: 'Add, edit, and manage your rental properties', 
      className: styles.roleCardPropertyOwner,
      path: '/app/properties',
      icon: '🏢',
      requiresProfile: false,  // Changed: Profile is now optional (just contact info)
      status: 'complete'        // Changed: Always accessible
    }
  );
}

// ✅ EMPLOYER CARDS
if (selectedRole === 'employer' && hasRole('employer')) {
  cards.push(
    { 
      id: 'employer-dashboard', 
      label: 'Employer Dashboard',
      description: 'Manage your company profiles and hiring status', 
      className: styles.roleCardEmployer,
      path: '/app/employer-dashboard',
      icon: '💼',
      requiresProfile: false,  // Changed: No separate profile, goes straight to companies
      status: 'complete'        // Changed: Always accessible
    }
  );
}
    
    return cards;
  }, [user, hasRole, selectedRole, completionStatus]);

  // ✅ ENHANCED: Handle card click with profile completion guard
  const handleCardClick = useCallback((card) => {
    console.log('📊 Dashboard: Card clicked:', card.label, 'Status:', card.status);
    
    // Check if card requires profile completion
    if (card.requiresProfile && card.status !== 'complete') {
      // Redirect to profile form for the selected role
      const profilePaths = {
        'applicant': '/app/profile/matching',
        'peer-support': '/app/profile/peer-support',
        'landlord': '/app/profile/landlord',
        'employer': '/app/employer-dashboard'
      };
      
      const profilePath = profilePaths[selectedRole];
      if (profilePath) {
        console.log('⚠️ Dashboard: Profile incomplete, redirecting to:', profilePath);
        navigate(profilePath);
        return;
      }
    }
    
    // Card is accessible, navigate normally
    if (card.path) {
      navigate(card.path);
    }
  }, [selectedRole, navigate]);

  // ✅ ENHANCED: Welcome section with RoleSelector
  const getRoleSpecificWelcome = () => {
    if (!user || !profile) {
      return (
        <div className={styles.welcomeSection}>
          <div className={styles.alertInfo}>
            <div style={{ textAlign: 'center' }}>
              <strong>Loading your dashboard...</strong>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {profile?.first_name || 'User'}!
        </h1>
        
        {/* ✅ NEW: RoleSelector Component */}
        {profile?.roles && profile.roles.length > 0 && (
          <RoleSelector
            userId={profile.id}
            userRoles={profile.roles}
            completionStatus={completionStatus}
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
          />
        )}
      </div>
    );
  };

  const dashboardCards = getDashboardCards();

  return (
    <div>      
      {getRoleSpecificWelcome()}
      
      {/* ✅ ENHANCED: Dashboard Cards with Status Overlays */}
      <div className="card">
        <h3 className="card-title">
          {selectedRole ? `Your ${selectedRole === 'applicant' ? 'Applicant' : selectedRole === 'peer-support' ? 'Peer Support' : selectedRole === 'landlord' ? 'Property Owner' : 'Employer'} Dashboard` : 'Your Dashboard'}
        </h3>
        
        {dashboardCards.length === 0 ? (
          <div className={styles.alertInfo}>
            <p style={{ textAlign: 'center', margin: 0 }}>
              Select a role above to view your dashboard features
            </p>
          </div>
        ) : (
          <div className="grid-auto">
            {dashboardCards.map(card => {
              const statusIcon = getStatusIcon(card.status);
              const statusLabel = getStatusLabel(card.status);
              const isAccessible = !card.requiresProfile || card.status === 'complete';
              
              return (
                <div
                  key={card.id}
                  className={`${styles.roleCard} ${card.className}`}
                  onClick={() => handleCardClick(card)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    opacity: isAccessible ? 1 : 0.85
                  }}
                >
                  {/* Status Badge */}
                  {card.requiresProfile && (
                    <div 
                      className={styles.statusBadge}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '1.5rem',
                        zIndex: 10
                      }}
                      title={statusLabel}
                    >
                      {statusIcon}
                    </div>
                  )}
                  
                  <div className="text-center mb-3" style={{ fontSize: '3rem', lineHeight: 1 }}>
                    {card.icon}
                  </div>
                  
                  <h4 className={styles.roleTitle}>
                    {card.label}
                  </h4>
                  
                  <p className={styles.roleDescription}>{card.description}</p>
                  
                  {/* Status Message */}
                  {card.requiresProfile && card.status !== 'complete' && (
                    <div 
                      className={styles.statusMessage}
                      style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: card.status === 'incomplete' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: card.status === 'incomplete' ? '#f59e0b' : '#6b7280',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      {card.status === 'not-started' ? '🔒 Complete profile to unlock' : '⚠️ Finish your profile to unlock'}
                    </div>
                  )}
                  
                  {/* Ready Badge */}
                  {(!card.requiresProfile || card.status === 'complete') && (
                    <div 
                      style={{
                        marginTop: '12px',
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#10b981',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      ✅ Ready to use
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* ✅ ENHANCED: Multi-Role Section with Completion Info */}
      {profile?.roles?.length > 1 && (
        <div className={`card ${styles.multiRoleSection}`}>
          <h3 className="card-title">Your Multi-Role Access</h3>
          <p className="card-text" style={{ textAlign: 'center', marginBottom: '20px' }}>
            You have access to {profile.roles.length} platform roles. Use the role selector above to switch between them.
          </p>
          <div className={styles.multiRoleGrid}>
            {profile.roles.map(role => {
              const status = completionStatus[role] || 'not-started';
              const statusIcon = getStatusIcon(status);
              const percentage = profileCompletionData[role] || 0;
              
              return (
                <div key={role} className={styles.roleAccessCard}>
                  <div className={styles.roleAccessHeader}>
                    <div className={styles.roleAccessTitle}>
                      {role === 'applicant' && '🏠 Applicant'}
                      {role === 'peer-support' && '🤝 Peer Support'}
                      {role === 'landlord' && '🏢 Property Owner'}
                      {role === 'employer' && '💼 Employer'}
                    </div>
                    <div className={styles.roleAccessStatus} title={getStatusLabel(status)}>
                      {statusIcon}
                    </div>
                  </div>
                  
                  <div className={styles.roleAccessProgress}>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          background: status === 'complete' ? '#10b981' : status === 'incomplete' ? '#f59e0b' : '#6b7280'
                        }}
                      />
                    </div>
                    <span className="progress-text">{percentage}% complete</span>
                  </div>
                  
                  <div className={styles.roleAccessDescription}>
                    {role === 'applicant' && 'Find roommates, browse properties, connect with peer support, find employment'}
                    {role === 'peer-support' && 'Offer peer support, manage clients, provide services'}
                    {role === 'landlord' && 'List properties, review applications, manage rentals'}
                    {role === 'employer' && 'Post jobs, review applications, manage company profiles'}
                  </div>
                  
                  {status !== 'complete' && (
                    <button
                      className="btn btn-sm btn-outline mt-2"
                      onClick={() => {
                        const profilePaths = {
                          'applicant': '/app/profile/matching',
                          'peer-support': '/app/profile/peer-support',
                          'landlord': '/app/profile/landlord',
                          'employer': '/app/employer-dashboard'
                        };
                        navigate(profilePaths[role]);
                      }}
                      style={{ width: '100%' }}
                    >
                      {status === 'not-started' ? 'Start Profile' : 'Complete Profile'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* ✅ Profile Completion Tip */}
      {selectedRole && completionStatus[selectedRole] !== 'complete' && (
        <div className="card">
          <div className={styles.alertInfo}>
            <strong>💡 Tip:</strong> Complete your {selectedRole === 'applicant' ? 'Applicant' : selectedRole === 'peer-support' ? 'Peer Support' : selectedRole === 'landlord' ? 'Property Owner' : 'Employer'} profile to unlock all features and improve your matches.
            <button
              className="btn btn-primary btn-sm ml-3"
              onClick={() => {
                const profilePaths = {
                  'applicant': '/app/profile/matching',
                  'peer-support': '/app/profile/peer-support',
                  'landlord': '/app/profile/landlord',
                  'employer': '/app/employer-dashboard'
                };
                navigate(profilePaths[selectedRole]);
              }}
            >
              Complete Profile →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
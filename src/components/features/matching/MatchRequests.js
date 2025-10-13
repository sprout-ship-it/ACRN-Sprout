// src/components/features/matching/MatchRequests.js - FIXED ID MAPPING
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';

// Custom hooks
import { useRoleProfiles } from '../../../hooks/useRoleProfiles';
import { useMatchRequests } from '../../../hooks/useMatchRequests';
import { useMatchActions } from '../../../hooks/useMatchActions';

// Utilities
import roleUtils from '../../../utils/roleUtils';

// Components
import LoadingSpinner from '../../ui/LoadingSpinner';
import TabNavigation from './components/TabNavigation';
import RequestList from './components/RequestList';
import ContactModal from './components/modals/ContactModal';
import RejectModal from './components/modals/RejectModal';
import MatchDetailsModal from './components/MatchDetailsModal';

// Styles
import '../../../styles/main.css';
import styles from './MatchRequests.module.css';

const MatchRequests = () => {
  const { user, profile, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('active-connections');
  
  // Custom hooks handle all the complexity
  const { profileIds, loading: profilesLoading } = useRoleProfiles(profile, hasRole);
  const { categorizedRequests, loading: requestsLoading, reloadRequests } = useMatchRequests(profileIds);
  const { handleApprove, handleReject, handleCancel, handleUnmatch, handleReconnect, actionLoading } = useMatchActions(reloadRequests);
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [detailedMatchData, setDetailedMatchData] = useState(null);
  const [loadingMatchDetails, setLoadingMatchDetails] = useState(false);

  const loading = profilesLoading || requestsLoading;

  /**
   * Load detailed match information for potential matches
   */
  const loadFullMatchDetails = async (request) => {
    setLoadingMatchDetails(true);
    
    try {
      console.log('🔍 Loading full match details for request:', request.id);
      
      // Only support roommate requests for now (applicant-to-applicant)
      if (request.request_type === 'roommate' || 
          (request.requester_type === 'applicant' && request.recipient_type === 'applicant')) {
        
        const { data: requesterProfile, error: requesterError } = await supabase
          .from('applicant_matching_profiles')
          .select(`
            *,
            registrant_profiles(*)
          `)
          .eq('id', request.requester_id)
          .single();
        
        if (requesterError) throw requesterError;
        
        // Format the match data for the modal
        const matchData = {
          user_id: requesterProfile.user_id,
          id: requesterProfile.id,
          first_name: requesterProfile.registrant_profiles?.first_name || 'Unknown',
          last_name: requesterProfile.registrant_profiles?.last_name || '',
          email: requesterProfile.registrant_profiles?.email,
          
          // Copy all profile fields
          ...requesterProfile,
          
          // Ensure critical fields
          primary_city: requesterProfile.primary_city,
          primary_state: requesterProfile.primary_state,
          primary_location: requesterProfile.primary_location || 
            (requesterProfile.primary_city && requesterProfile.primary_state ? 
             `${requesterProfile.primary_city}, ${requesterProfile.primary_state}` : null),
          
          // Add display flags
          greenFlags: generateGreenFlags(requesterProfile),
          redFlags: [],
          
          // Modal flags
          isRequestReceived: true,
          originalRequest: request
        };
        
        setDetailedMatchData(matchData);
        setShowMatchDetails(true);
        
      } else {
        throw new Error('Detailed view for this connection type is not yet implemented');
      }
      
    } catch (error) {
      console.error('💥 Error loading match details:', error);
      alert('Failed to load detailed match information. Please try again.');
    } finally {
      setLoadingMatchDetails(false);
    }
  };

  /**
   * Generate green flags for display
   */
  const generateGreenFlags = (profile) => {
    const flags = [];
    
    if (profile.recovery_stage) {
      flags.push(`Currently in ${profile.recovery_stage.replace(/-/g, ' ')} recovery`);
    }
    
    if (profile.substance_free_home_required) {
      flags.push('Committed to substance-free living');
    }
    
    if (profile.recovery_methods && profile.recovery_methods.length > 0) {
      flags.push(`Active in recovery with ${profile.recovery_methods.length} method${profile.recovery_methods.length > 1 ? 's' : ''}`);
    }
    
    if (profile.about_me && profile.about_me.length > 100) {
      flags.push('Detailed profile with thoughtful communication');
    }
    
    if (profile.interests && profile.interests.length > 3) {
      flags.push('Many interests and hobbies');
    }
    
    if (profile.spiritual_affiliation && profile.spiritual_affiliation !== 'none') {
      flags.push('Has spiritual/religious practices');
    }
    
    if (profile.work_schedule) {
      flags.push('Stable work/life schedule');
    }
    
    return flags;
  };

  /**
   * Load contact information for active connections
   */
  const handleViewContactInfo = async (request) => {
    try {
      // Determine which profile is the "other" person
      const isRequester = roleUtils.isUserRequester(request, profileIds);
      const otherUserType = isRequester ? request.recipient_type : request.requester_type;
      const otherUserId = isRequester ? request.recipient_id : request.requester_id;
      
      console.log('🔍 Fetching contact info for:', otherUserType, otherUserId);
      
      let contactInfo = {
        connectionType: roleUtils.getConnectionType(request)
      };

      // Query the appropriate profile table based on user type
      if (otherUserType === 'applicant') {
        const { data: applicantProfile, error } = await supabase
          .from('applicant_matching_profiles')
          .select(`
            *,
            registrant_profiles(*)
          `)
          .eq('id', otherUserId)
          .single();
        
        if (error) throw error;
        
        const registrant = applicantProfile.registrant_profiles;
        contactInfo = {
          ...contactInfo,
          name: roleUtils.formatDisplayName({ registrant_profiles: registrant }),
          email: registrant.email || 'Not provided',
          phone: applicantProfile.primary_phone || 'Not provided'
        };
        
        if (applicantProfile.emergency_contact_name) {
          contactInfo.emergencyContact = {
            name: applicantProfile.emergency_contact_name,
            phone: applicantProfile.emergency_contact_phone
          };
        }
        
      } else if (otherUserType === 'peer-support') {
        const { data: peerProfile, error } = await supabase
          .from('peer_support_profiles')
          .select(`
            *,
            registrant_profiles(*)
          `)
          .eq('id', otherUserId)
          .single();
        
        if (error) throw error;
        
        const registrant = peerProfile.registrant_profiles;
        contactInfo = {
          ...contactInfo,
          name: roleUtils.formatDisplayName({ registrant_profiles: registrant }),
          email: registrant.email || 'Not provided',
          phone: peerProfile.primary_phone || 'Not provided',
          professionalTitle: peerProfile.professional_title,
          experience: peerProfile.years_experience
        };
        
      } else if (otherUserType === 'landlord') {
        const { data: landlordProfile, error } = await supabase
          .from('landlord_profiles')
          .select(`
            *,
            registrant_profiles(*)
          `)
          .eq('id', otherUserId)
          .single();
        
        if (error) throw error;
        
        const registrant = landlordProfile.registrant_profiles;
        contactInfo = {
          ...contactInfo,
          name: roleUtils.formatDisplayName({ registrant_profiles: registrant }),
          email: landlordProfile.contact_email || registrant.email || 'Not provided',
          phone: landlordProfile.primary_phone || 'Not provided',
          contactPerson: landlordProfile.contact_person
        };
        
      } else if (otherUserType === 'employer') {
        const { data: employerProfile, error } = await supabase
          .from('employer_profiles')
          .select(`
            *,
            registrant_profiles(*)
          `)
          .eq('id', otherUserId)
          .single();
        
        if (error) throw error;
        
        const registrant = employerProfile.registrant_profiles;
        contactInfo = {
          ...contactInfo,
          name: roleUtils.formatDisplayName({ registrant_profiles: registrant }),
          email: employerProfile.contact_email || registrant.email || 'Not provided',
          phone: employerProfile.primary_phone || 'Not provided',
          contactPerson: employerProfile.contact_person,
          companyType: employerProfile.business_type,
          industry: employerProfile.industry,
          companyName: employerProfile.company_name
        };
      }
      
      console.log('✅ Contact info prepared:', contactInfo);
      setContactInfo(contactInfo);
      setShowContactModal(true);
      
    } catch (error) {
      console.error('💥 Error viewing contact info:', error);
      alert(`Error: ${error.message || 'Could not load contact information. Please try again.'}`);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="content">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <LoadingSpinner message="Loading your connections..." />
        </div>
      </div>
    );
  }

  // Check user permissions
  if (!hasRole('applicant') && !hasRole('peer-support') && !hasRole('landlord') && !hasRole('employer')) {
    return (
      <div className="content">
        <div className="alert alert-info">
          <p>Connections are available for all platform users.</p>
        </div>
      </div>
    );
  }

  // Get role-specific labels and counts
  const primaryRole = roleUtils.getPrimaryRole(profile?.roles);
  const tabLabels = roleUtils.getTabLabels(primaryRole);
  const tabCounts = {
    activeConnections: categorizedRequests.active.length,
    awaitingResponse: categorizedRequests.received.length,
    sentRequests: categorizedRequests.sent.length,
    connectionHistory: categorizedRequests.history.length
  };

  // Get filtered requests for current tab
  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'active-connections': return categorizedRequests.active;
      case 'awaiting-response': return categorizedRequests.received;
      case 'sent-requests': return categorizedRequests.sent;
      case 'connection-history': return categorizedRequests.history;
      default: return [];
    }
  };

// ✅ UPDATED: Helper to determine match type from request
  const getMatchType = (request) => {
    // request_type is already set correctly in the database
    return request.request_type; // 'peer-support', 'roommate', 'housing', or 'employment'
  };

  // ✅ UPDATED: Define action handlers with matchType parameter
  const actions = {
    onApprove: async (request) => {
      const matchType = getMatchType(request);
      console.log('🔄 Approving request:', { id: request.id, matchType });
      
      const result = await handleApprove(request.id, matchType);
      if (result.success) {
        alert('Connection approved successfully!');
      } else {
        alert(`Failed to approve: ${result.error}`);
      }
    },
    
    onReject: (request) => {
      setSelectedRequest(request);
      setShowRejectModal(true);
    },
    
    onCancel: async (request) => {
      const matchType = getMatchType(request);
      
      if (window.confirm('Are you sure you want to cancel this request?')) {
        const result = await handleCancel(request.id, matchType);
        if (result.success) {
          alert('Request cancelled successfully.');
        } else {
          alert(`Failed to cancel: ${result.error}`);
        }
      }
    },
    
    onUnmatch: async (request) => {
      const matchType = getMatchType(request);
      
      if (window.confirm('Are you sure you want to end this connection? This action cannot be undone.')) {
        const result = await handleUnmatch(request.id, matchType);
        if (result.success) {
          alert('Connection ended successfully.');
        } else {
          alert(`Failed to end connection: ${result.error}`);
        }
      }
    },
    
    onReconnect: async (formerMatch) => {
      const matchType = getMatchType(formerMatch);
      console.log('🔄 Reconnecting:', { matchType, profileIds });
      
      const result = await handleReconnect(formerMatch, matchType, profileIds);
      if (result.success) {
        alert('Reconnection request sent successfully!');
      } else {
        alert(`Failed to send request: ${result.error}`);
      }
    },
    
    onViewContact: handleViewContactInfo,
    
    onViewDetails: loadFullMatchDetails
  };

  // ✅ UPDATED: Handle rejection modal submission with matchType
  const handleRejectSubmit = async (reason) => {
    if (!reason?.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    const matchType = getMatchType(selectedRequest);
    const result = await handleReject(selectedRequest.id, matchType);
    
    if (result.success) {
      setShowRejectModal(false);
      setSelectedRequest(null);
      alert('Connection request rejected.');
    } else {
      alert(`Failed to reject: ${result.error}`);
    }
  };

  return (
    <>
      <div className="content">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="welcome-title">Connections</h1>
          <p className="welcome-text">
            Manage your connection requests and active connections
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
          tabLabels={tabLabels}
        />
        
        {/* Request List */}
        <RequestList
          requests={getFilteredRequests()}
          actions={actions}
          variant={activeTab}
          profileIds={profileIds}
          actionLoading={actionLoading}
        />
      </div>
      
      {/* Contact Information Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactInfo={contactInfo}
      />
      
      {/* Rejection Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRejectSubmit}
        loading={actionLoading}
      />
      
      {/* Match Details Modal */}
      {showMatchDetails && detailedMatchData && (
        <MatchDetailsModal
          match={detailedMatchData}
          onClose={() => {
            setShowMatchDetails(false);
            setDetailedMatchData(null);
          }}
          onRequestMatch={() => {}}
          customActions={{
            acceptLabel: "Accept Connection",
            declineLabel: "Decline Connection",
            onAccept: () => {
              setShowMatchDetails(false);
              setDetailedMatchData(null);
              actions.onApprove(detailedMatchData.originalRequest.id);
            },
            onDecline: () => {
              setShowMatchDetails(false);
              setDetailedMatchData(null);
              actions.onReject(detailedMatchData.originalRequest);
            }
          }}
          isRequestSent={false}
          isAlreadyMatched={false}
          isRequestReceived={true}
          usePortal={true}
        />
      )}
    </>
  );
};

export default MatchRequests;
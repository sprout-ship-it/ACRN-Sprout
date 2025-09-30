// src/components/features/matching/MatchRequests.js - SCHEMA ALIGNED
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import MatchCard from './components/MatchCard';
import MatchDetailsModal from './components/MatchDetailsModal';

// Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './MatchRequests.module.css';

const MatchRequests = () => {
  const { user, profile, hasRole } = useAuth();
  
  // Start with Active Connections as default tab
  const [userRegistrantId, setUserRegistrantId] = useState(null);
  const [activeTab, setActiveTab] = useState('active-connections');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [detailedMatchData, setDetailedMatchData] = useState(null);
  const [loadingMatchDetails, setLoadingMatchDetails] = useState(false);
  
  // Track sent reconnection requests for UI feedback
  const [sentReconnectionRequests, setSentReconnectionRequests] = useState(new Set());
  const [requestSendingStates, setRequestSendingStates] = useState(new Set());
  
  /**
   * Get registrant profile ID from auth user ID (for queries)
   */
  useEffect(() => {
    const loadUserRegistrantId = async () => {
      if (user?.id) {
        try {
          const id = await getRegistrantProfileId(user.id);
          setUserRegistrantId(id);
        } catch (err) {
          console.error('Error loading registrant ID:', err);
        }
      }
    };
    loadUserRegistrantId();
  }, [user?.id]);
  
  const getRegistrantProfileId = async (authUserId) => {
    const { data, error } = await supabase
      .from('registrant_profiles')
      .select('id')
      .eq('user_id', authUserId)
      .single();
    
    if (error) throw new Error(`Profile not found: ${error.message}`);
    return data.id;
  };

const loadFullMatchDetails = async (request) => {
  setLoadingMatchDetails(true);
  
  try {
    console.log('🔍 Loading full match details for request:', request.id);
    
    // Determine if this is a roommate request (applicant-to-applicant)
    if (request.request_type === 'roommate' || 
        (request.requester_type === 'applicant' && request.recipient_type === 'applicant')) {
      
      // Get the requester's full applicant profile with all data
      const { data: requesterProfile, error: requesterError } = await supabase
        .from('applicant_matching_profiles')
        .select(`
          *,
          registrant_profiles(*)
        `)
        .eq('id', request.requester_id)
        .single();
      
      if (requesterError) throw requesterError;
      
      console.log('✅ Loaded requester profile:', requesterProfile);
      
      // Format the match data for the modal
      const matchData = {
        // Basic identification
        user_id: requesterProfile.user_id,
        id: requesterProfile.id,
        first_name: requesterProfile.registrant_profiles?.first_name || 'Unknown',
        last_name: requesterProfile.registrant_profiles?.last_name || '',
        email: requesterProfile.registrant_profiles?.email,
        
        // Copy ALL profile fields so the modal has complete data
        ...requesterProfile,
        
        // Override/ensure critical fields are set
        primary_city: requesterProfile.primary_city,
        primary_state: requesterProfile.primary_state,
        primary_location: requesterProfile.primary_location || 
          (requesterProfile.primary_city && requesterProfile.primary_state ? 
           `${requesterProfile.primary_city}, ${requesterProfile.primary_state}` : null),
        
        // ✅ NO COMPATIBILITY SCORE - avoid conflicts with original request
        // compatibility_score: undefined, // Don't set this
        
        // Add some basic flags for display (optional)
        greenFlags: generateGreenFlags(requesterProfile),
        redFlags: [], // Keep empty for now
        
        // Special flags for the modal
        isRequestReceived: true,
        originalRequest: request
      };
      
      setDetailedMatchData(matchData);
      setShowMatchDetails(true);
      
      console.log('✅ Loaded detailed match data (no score conflicts)');
      
    } else {
      // Handle other request types (employment, peer-support, housing)
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
 * ✅ Generate basic green flags for display (no score needed)
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
   * ✅ FIXED: Load match requests with manual profile enrichment
   */
  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get current user's registrant profile ID
      const userRegistrantId = await getRegistrantProfileId(user.id);
      
      // Get user's applicant profile ID (since match_requests uses applicant_matching_profiles.id)
      const { data: userApplicant } = await supabase
        .from('applicant_matching_profiles')
        .select('id, user_id')
        .eq('user_id', userRegistrantId)
        .single();
      
      if (!userApplicant) {
        console.log('No applicant profile found');
        setRequests([]);
        return;
      }
      
      const userApplicantId = userApplicant.id;
      
      // Load match requests WITHOUT automatic JOINs (they don't work with polymorphic relationships)
      const { data: rawRequests, error } = await supabase
        .from('match_requests')
        .select('*')
        .or(`requester_id.eq.${userApplicantId},recipient_id.eq.${userApplicantId}`);
      
      if (error) throw error;
      
      if (!rawRequests || rawRequests.length === 0) {
        setRequests([]);
        return;
      }
      
      console.log(`📋 Loaded ${rawRequests.length} raw match requests`);
      
      // Manually enrich each request with profile data
      const enrichedRequests = await Promise.all(
        rawRequests.map(async (request) => {
          try {
            // For roommate/applicant requests, get applicant profiles
            if (request.requester_type === 'applicant') {
              const { data: requesterApplicant } = await supabase
                .from('applicant_matching_profiles')
                .select('id, user_id, registrant_profiles(first_name, last_name, email)')
                .eq('id', request.requester_id)
                .single();
              
              const { data: recipientApplicant } = await supabase
                .from('applicant_matching_profiles')
                .select('id, user_id, registrant_profiles(first_name, last_name, email)')
                .eq('id', request.recipient_id)
                .single();
              
              return {
                ...request,
                requester_profile: {
                  id: requesterApplicant?.id,
                  user_id: requesterApplicant?.user_id,
                  first_name: requesterApplicant?.registrant_profiles?.first_name,
                  last_name: requesterApplicant?.registrant_profiles?.last_name,
                  email: requesterApplicant?.registrant_profiles?.email
                },
                recipient_profile: {
                  id: recipientApplicant?.id,
                  user_id: recipientApplicant?.user_id,
                  first_name: recipientApplicant?.registrant_profiles?.first_name,
                  last_name: recipientApplicant?.registrant_profiles?.last_name,
                  email: recipientApplicant?.registrant_profiles?.email
                }
              };
            }
            
            // Add handling for other types (landlord, employer, peer-support) if needed
            return request;
            
          } catch (err) {
            console.error('Error enriching request:', err);
            return request; // Return without enrichment if there's an error
          }
        })
      );
      
      setRequests(enrichedRequests);
      console.log('✅ Loaded match requests with enriched profile data:', enrichedRequests);
      
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load match requests
  useEffect(() => {
    loadRequests();
  }, [user]);
  
  /**
   * ✅ FIXED: Filter requests using enriched profile data instead of raw IDs
   */
  const getFilteredRequests = () => {
    if (!user || !userRegistrantId || requests.length === 0) return [];
    
    switch (activeTab) {
      case 'active-connections':
        return requests.filter(r => r.status === 'accepted' || r.status === 'matched');
      case 'awaiting-response':
        return requests.filter(r => 
          r.status === 'pending' && 
          r.recipient_profile?.user_id === userRegistrantId
        );
      case 'sent-requests':
        return requests.filter(r => 
          r.status === 'pending' && 
          r.requester_profile?.user_id === userRegistrantId
        );
      case 'connection-history':
        return requests.filter(r => ['rejected', 'withdrawn', 'cancelled'].includes(r.status));
      default:
        return requests;
    }
  };
  
  /**
   * ✅ FIXED: Get tab counts using enriched profile data
   */
  const getTabCounts = () => {
    if (!user || !userRegistrantId || requests.length === 0) {
      return {
        activeConnections: 0,
        awaitingResponse: 0,
        sentRequests: 0,
        connectionHistory: 0
      };
    }
    
    return {
      activeConnections: requests.filter(r => r.status === 'accepted' || r.status === 'matched').length,
      awaitingResponse: requests.filter(r => 
        r.status === 'pending' && 
        r.recipient_profile?.user_id === userRegistrantId
      ).length,
      sentRequests: requests.filter(r => 
        r.status === 'pending' && 
        r.requester_profile?.user_id === userRegistrantId
      ).length,
      connectionHistory: requests.filter(r => ['rejected', 'withdrawn', 'cancelled'].includes(r.status)).length
    };
  };
  
  // Get connection type display name
  const getConnectionType = (request) => {
    const typeMap = {
      'housing': 'Housing',
      'employment': 'Employment',
      'peer-support': 'Peer Support',
      'roommate': 'Roommate'
    };
    return typeMap[request.request_type] || 'Connection';
  };

  // Get connection type icon
  const getConnectionIcon = (request) => {
    const iconMap = {
      'housing': '🏠',
      'employment': '💼',
      'peer-support': '🤝',
      'roommate': '👥'
    };
    return iconMap[request.request_type] || '🔗';
  };

  /**
   * ✅ SCHEMA ALIGNED: Organize active matches by type using correct field names
   */
  const getActiveMatchesByType = async () => {
    try {
      const userRegistrantId = await getRegistrantProfileId(user.id);
      const activeMatches = requests.filter(r => (r.status === 'accepted' || r.status === 'matched'));
      
      const organized = {
        housing: [],
        employment: [],
        'peer-support': [],
        roommate: []
      };

      activeMatches.forEach(request => {
        const type = request.request_type || 'roommate';
        if (organized[type]) {
          organized[type].push(request);
        }
      });

      return organized;
    } catch (error) {
      console.error('Error organizing matches:', error);
      return { housing: [], employment: [], 'peer-support': [], roommate: [] };
    }
  };
  
/**
 * ✅ ENHANCED: Handle approval with better debugging
 */
const handleApprove = async (requestId) => {
  setActionLoading(true);
  
  try {
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    console.log('📋 Approving connection request:', {
      requestId,
      requester: request.requester_id,
      recipient: request.recipient_id,
      requestType: request.request_type
    });

    // ✅ For roommate requests, create match group (simplified approach)
    if (request.request_type === 'roommate' || request.request_type === 'peer-support') {
      console.log('🏠 Creating match group for connection...');

      const matchGroupData = await determineMatchGroupStructure(request);
      console.log('📋 Match group data to create:', matchGroupData);

      // Create the match group
      const { data: matchGroup, error: groupError } = await supabase
        .from('match_groups')
        .insert(matchGroupData)
        .select();

      if (groupError) {
        console.error('💥 Match group creation error:', groupError);
        throw groupError;
      }

      console.log('✅ Match group created:', matchGroup);
    }

    // Update match request to accepted status
    const { error: matchedError } = await supabase
      .from('match_requests')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (matchedError) {
      console.error('💥 Match request update error:', matchedError);
      throw matchedError;
    }

    console.log('✅ Connection request approved with match group');

    // Update local state
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'accepted',
        responded_at: new Date().toISOString()
      } : req
    ));
    
    // Close modal if open
    setShowMatchDetails(false);
    setDetailedMatchData(null);
    
    alert('Connection approved successfully!');
    
  } catch (error) {
    console.error('💥 Error approving request:', error);
    alert(`Failed to approve request: ${error.message}`);
  } finally {
    setActionLoading(false);
  }
};

const determineMatchGroupStructure = async (request) => {
  try {
    console.log('🏗️ Creating match group structure for request:', request.request_type);
    
    const baseData = {
      status: 'forming',
      created_at: new Date().toISOString()
    };

    // ✅ SIMPLIFIED: For roommate requests, we know both are applicants
    // No need to look up registrant_profiles - just use the applicant IDs directly
    if (request.request_type === 'roommate' || request.requester_type === 'applicant') {
      console.log('🏠 Creating roommate match group');
      return {
        ...baseData,
        applicant_1_id: request.requester_id, // These are already applicant_matching_profiles.id
        applicant_2_id: request.recipient_id  // These are already applicant_matching_profiles.id
      };
    }

    // ✅ For other types, handle based on request type without complex role lookup
    if (request.request_type === 'peer-support') {
      console.log('🤝 Creating peer support match group');
      // Assume requester is applicant, recipient is peer support
      return {
        ...baseData,
        applicant_1_id: request.requester_id,
        peer_support_id: request.recipient_id
      };
    }

    if (request.request_type === 'housing') {
      console.log('🏡 Creating housing match group');
      // Use property_id if available
      if (request.property_id) {
        return {
          ...baseData,
          applicant_1_id: request.requester_id,
          property_id: request.property_id
        };
      }
    }

    // Default fallback for roommate setup
    console.log('🔄 Using default roommate structure');
    return {
      ...baseData,
      applicant_1_id: request.requester_id,
      applicant_2_id: request.recipient_id
    };

  } catch (error) {
    console.error('Error determining match group structure:', error);
    // Safe fallback
    return {
      status: 'forming',
      applicant_1_id: request.requester_id,
      applicant_2_id: request.recipient_id,
      created_at: new Date().toISOString()
    };
  }
};

  /**
   * ✅ SCHEMA ALIGNED: Handle reconnection request using correct field names
   */
  const handleRequestReconnection = async (formerMatch) => {
    try {
      const userRegistrantId = await getRegistrantProfileId(user.id);
      
      // Get the other user's registrant profile ID
      const otherRegistrantId = formerMatch.requester_id === userRegistrantId ? 
        formerMatch.recipient_id : formerMatch.requester_id;
      
      setRequestSendingStates(prev => new Set([...prev, otherRegistrantId]));
      
      // ✅ SCHEMA ALIGNED: Create reconnection request with schema field names
      const requestData = {
        requester_type: 'applicant',
        requester_id: userRegistrantId,
        recipient_type: 'applicant',
        recipient_id: otherRegistrantId,
        request_type: formerMatch.request_type,
        message: `I'd like to reconnect with you as a ${getConnectionType(formerMatch)}.`,
        status: 'pending'
      };
      
      console.log('📩 Sending reconnection request:', requestData);
      
      const { data, error } = await supabase
        .from('match_requests')
        .insert(requestData)
        .select();
      
      if (error) throw error;
      
      console.log('✅ Reconnection request sent:', data);
      
      setSentReconnectionRequests(prev => new Set([...prev, otherRegistrantId]));
      
      // Reload requests
      loadRequests();
      
      alert('Reconnection request sent successfully!');
      
    } catch (err) {
      console.error('💥 Error sending reconnection request:', err);
      alert('Failed to send request. Please try again.');
    } finally {
      // Remove from sending state
      setRequestSendingStates(prev => {
        const newSet = new Set(prev);
        const userRegistrantId = getRegistrantProfileId(user.id);
        const otherRegistrantId = formerMatch.requester_id === userRegistrantId ? 
          formerMatch.recipient_id : formerMatch.requester_id;
        newSet.delete(otherRegistrantId);
        return newSet;
      });
    }
  };

  // Handle reject request
  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setShowContactModal(false);
    setContactInfo(null);
  };
  
  /**
   * ✅ SCHEMA ALIGNED: Submit rejection using schema field names
   */
  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    setActionLoading(true);
    
    try {
      const updates = {
        status: 'rejected',
        responded_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('match_requests')
        .update(updates)
        .eq('id', selectedRequest.id);
      
      if (error) throw error;

      setRequests(prev => prev.map(request => 
        request.id === selectedRequest.id ? { ...request, ...updates } : request
      ));
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      setShowContactModal(false);
      setContactInfo(null);
      
      alert('Connection request rejected.');
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * ✅ SCHEMA ALIGNED: Handle cancel sent request using schema field names
   */
  const handleCancelSentRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('match_requests')
        .update({
          status: 'withdrawn',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;

      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      alert('Request cancelled successfully.');
      
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  /**
   * ✅ SCHEMA ALIGNED: Handle unmatch using schema relationships
   */
  const handleUnmatch = async (requestId) => {
    if (!window.confirm('Are you sure you want to end this connection? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      const userRegistrantId = await getRegistrantProfileId(user.id);

      // End any associated match groups (except for employment)
      if (request.request_type !== 'employment') {
        // Find and end associated match groups
        const { data: matchGroups, error: groupQueryError } = await supabase
          .from('match_groups')
          .select('id')
          .or(`applicant_1_id.eq.${request.requester_id},applicant_2_id.eq.${request.requester_id},applicant_1_id.eq.${request.recipient_id},applicant_2_id.eq.${request.recipient_id}`)
          .eq('status', 'forming');
        
        if (!groupQueryError && matchGroups?.length > 0) {
          await supabase
            .from('match_groups')
            .update({
              status: 'disbanded',
              updated_at: new Date().toISOString()
            })
            .in('id', matchGroups.map(g => g.id));
        }
      }

      const updates = {
        status: 'withdrawn',
        responded_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('match_requests')
        .update(updates)
        .eq('id', requestId);
      
      if (updateError) throw updateError;

      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, ...updates } : req
      ));
      
      alert('Connection ended successfully.');
      
    } catch (error) {
      console.error('💥 Error ending connection:', error);
      alert(`Failed to end connection: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * ✅ SCHEMA ALIGNED: Enhanced contact info retrieval using schema relationships
   */
// REPLACE the handleViewContactInfo function with this corrected version:

/**
 * ✅ FIXED: Enhanced contact info retrieval using correct ID relationships
 */
const handleViewContactInfo = async (request) => {
  try {
    const userRegistrantId = await getRegistrantProfileId(user.id);
    
    // ✅ FIXED: Determine which applicant profile ID we need to look up
    // request.requester_id and request.recipient_id are applicant_matching_profiles.id values
    let otherApplicantId;
    
    // Get current user's applicant profile ID for comparison
    const { data: currentUserApplicant } = await supabase
      .from('applicant_matching_profiles')
      .select('id')
      .eq('user_id', userRegistrantId)
      .single();
    
    if (currentUserApplicant) {
      // Determine which applicant profile is the "other" person
      otherApplicantId = request.requester_id === currentUserApplicant.id ? 
        request.recipient_id : request.requester_id;
    } else {
      // Fallback: assume current user is recipient
      otherApplicantId = request.requester_id;
    }
    
    console.log('🔍 Fetching contact info for applicant profile:', otherApplicantId);
    
    // ✅ FIXED: Query applicant profile with registrant profile JOIN
    const { data: applicantWithRegistrant, error: profileError } = await supabase
      .from('applicant_matching_profiles')
      .select(`
        *,
        registrant_profiles(*)
      `)
      .eq('id', otherApplicantId)
      .single();
    
    if (profileError || !applicantWithRegistrant) {
      console.error('Profile query error:', profileError);
      throw new Error('Could not load user profile');
    }
    
    const otherProfile = applicantWithRegistrant.registrant_profiles;
    const applicantData = applicantWithRegistrant;
    
    console.log('✅ Successfully loaded contact profile');
    
    // Initialize contact info with basic profile data
    let contactInfo = {
      name: `${otherProfile.first_name || 'User'} ${otherProfile.last_name || ''}`.trim(),
      email: otherProfile.email || 'Not provided',
      phone: applicantData.primary_phone || 'Not provided', // ✅ Get phone from applicant profile
      connectionType: getConnectionType(request)
    };
    
    // ✅ Add emergency contact if available
    if (applicantData.emergency_contact_name) {
      contactInfo.emergencyContact = {
        name: applicantData.emergency_contact_name,
        phone: applicantData.emergency_contact_phone
      };
    }
    
    // ✅ For different connection types, add specific info
    const userRoles = otherProfile.roles || [];
    
    if (request.request_type === 'employment' && userRoles.includes('employer')) {
      try {
        const { data: employerProfile } = await supabase
          .from('employer_profiles')
          .select('primary_phone, contact_email, contact_person, business_type, industry')
          .eq('user_id', otherProfile.id) // ✅ Use registrant profile ID here
          .single();
          
        if (employerProfile) {
          contactInfo.phone = employerProfile.primary_phone || contactInfo.phone;
          contactInfo.email = employerProfile.contact_email || contactInfo.email;
          contactInfo.contactPerson = employerProfile.contact_person;
          contactInfo.companyType = employerProfile.business_type;
          contactInfo.industry = employerProfile.industry;
        }
      } catch (err) {
        console.warn('Could not load employer profile:', err);
      }
    }
    
    if (request.request_type === 'peer-support' && userRoles.includes('peer-support')) {
      try {
        const { data: peerProfile } = await supabase
          .from('peer_support_profiles')
          .select('primary_phone, professional_title, years_experience')
          .eq('user_id', otherProfile.id) // ✅ Use registrant profile ID here
          .single();
          
        if (peerProfile) {
          contactInfo.phone = peerProfile.primary_phone || contactInfo.phone;
          contactInfo.professionalTitle = peerProfile.professional_title;
          contactInfo.experience = peerProfile.years_experience;
        }
      } catch (err) {
        console.warn('Could not load peer profile:', err);
      }
    }
    
    if (request.request_type === 'housing' && userRoles.includes('landlord')) {
      try {
        const { data: landlordProfile } = await supabase
          .from('landlord_profiles')
          .select('primary_phone, contact_email, contact_person')
          .eq('user_id', otherProfile.id) // ✅ Use registrant profile ID here
          .single();
          
        if (landlordProfile) {
          contactInfo.phone = landlordProfile.primary_phone || contactInfo.phone;
          contactInfo.email = landlordProfile.contact_email || contactInfo.email;
          contactInfo.contactPerson = landlordProfile.contact_person;
        }
      } catch (err) {
        console.warn('Could not load landlord profile:', err);
      }
    }
    
    console.log('✅ Contact info prepared:', contactInfo);
    setContactInfo(contactInfo);
    setShowContactModal(true);
    
  } catch (error) {
    console.error('💥 Error viewing contact info:', error);
    alert(`Error: ${error.message || 'Could not load contact information. Please try again.'}`);
  }
};
    
  // Render status badge
  const renderStatusBadge = (status) => {
    const statusClass = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-error',
      matched: 'badge-success',
      withdrawn: 'badge',
      cancelled: 'badge'
    }[status] || 'badge';
    
    return (
      <span className={`badge ${statusClass}`}>
        {status === 'accepted' ? 'Active' : status === 'pending' ? 'Pending' : status}
      </span>
    );
  };
    
  /**
   * ✅ SCHEMA ALIGNED: Render action buttons using correct user identification
   */
  const renderActionButtons = (request) => {
    if (!userRegistrantId) return null;
    
    const isReceived = request.recipient_profile?.user_id === userRegistrantId;
    const isSent = request.requester_profile?.user_id === userRegistrantId;
    const { status } = request;
    
    if (status === 'pending' && isReceived) {
      return (
        <div className="grid-2">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleApprove(request.id)}
            disabled={actionLoading}
          >
            Accept
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleReject(request)}
            disabled={actionLoading}
          >
            Decline
          </button>
        </div>
      );
    }
    
    if (status === 'pending' && isSent) {
      return (
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleCancelSentRequest(request.id)}
            disabled={actionLoading}
          >
            Cancel Request
          </button>
        </div>
      );
    }
    
    if (status === 'accepted') {
      return (
        <div className="grid-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleViewContactInfo(request)}
          >
            View Contact Info
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleUnmatch(request.id)}
            disabled={actionLoading}
          >
            End Connection
          </button>
        </div>
      );
    }
    
    if (status === 'withdrawn') {
      const otherUserId = request.requester_profile?.user_id === userRegistrantId ? 
        request.recipient_profile?.user_id : request.requester_profile?.user_id;
      
      const isRequestSent = sentReconnectionRequests.has(otherUserId);
      const isSending = requestSendingStates.has(otherUserId);
      
      return (
        <div>
          <button
            className={`btn btn-sm ${isRequestSent ? styles.btnSuccess : 'btn-outline'}`}
            onClick={() => handleRequestReconnection(request)}
            disabled={actionLoading || isRequestSent || isSending}
          >
            {isSending ? 'Sending...' : isRequestSent ? 'Request Sent' : 'Request Reconnection'}
          </button>
          {isRequestSent && (
            <div className={`text-sm mt-1 ${styles.textSuccess}`}>
              Reconnection request sent successfully!
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Get card className with status styling
  const getCardClassName = (request) => {
    if (request.status !== 'withdrawn') return 'card mb-4';
    
    // Check if reconnection request was sent
    const isRequestSent = sentReconnectionRequests.has(
      request.requester_profile?.id || request.recipient_profile?.id
    );
    
    return `card mb-4 ${isRequestSent ? styles.cardRequestSent : ''}`;
  };

  /**
   * ✅ ENHANCED: Render pending requests with "View Potential Match Details" button
   */
  const renderPendingRequests = (isSentRequests = false) => {
    const filteredRequests = getFilteredRequests();
    
    if (filteredRequests.length === 0) {
      const emptyMessage = isSentRequests 
        ? "You haven't sent any pending requests."
        : "You don't have any requests awaiting your response.";
      
      const emptyIcon = isSentRequests ? '📤' : '📥';
      const emptyTitle = isSentRequests ? 'No Sent Requests' : 'No Requests Awaiting Response';

      return (
        <div className="empty-state">
          <div className="empty-state-icon">{emptyIcon}</div>
          <h3 className="empty-state-title">{emptyTitle}</h3>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className={styles.requestsList}>
        {filteredRequests.map(request => (
          <div key={request.id} className={getCardClassName(request)}>
            <div className="card-header">
              <div>
                <div className="card-title">
                  {getConnectionIcon(request)} {request.requester_profile?.first_name || request.recipient_profile?.first_name || 'Unknown User'}
                </div>
                <div className="card-subtitle">
                  {getConnectionType(request)} • {isSentRequests ? 'Sent' : 'Request from'} on{' '}
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
              {renderStatusBadge(request.status)}
            </div>
            
            <div>
              <div className="grid-auto mb-4">
                <div>
                  <span className="label">Connection Type</span>
                  <span className="text-gray-800">
                    {getConnectionType(request)}
                  </span>
                </div>
                
                <div>
                  <span className="label">Status</span>
                  <span className="text-gray-800">
                    Pending {isSentRequests ? 'their approval' : 'your approval'}
                  </span>
                </div>
              </div>
              
              {request.message && (
                <div className="mb-4">
                  <div className="label mb-2">{isSentRequests ? 'Your Message' : 'Their Message'}</div>
                  <div className="alert alert-info">
                    {request.message}
                  </div>
                </div>
              )}
              
              {/* ✅ ENHANCED: Action buttons with detailed view option */}
              {!isSentRequests && request.status === 'pending' && (
                <div className="grid-3">
                  {/* ✅ NEW: View Potential Match Details button */}
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => loadFullMatchDetails(request)}
                    disabled={loadingMatchDetails}
                  >
                    {loadingMatchDetails ? 'Loading...' : 'View Match Details'}
                  </button>
                  
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading}
                  >
                    Accept
                  </button>
                  
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleReject(request)}
                    disabled={actionLoading}
                  >
                    Decline
                  </button>
                </div>
              )}
              
              {/* Original action buttons for sent requests */}
              {isSentRequests && request.status === 'pending' && (
                <div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleCancelSentRequest(request.id)}
                    disabled={actionLoading}
                  >
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render Active Matches organized by type
   */
  const renderActiveMatches = () => {
    const filteredRequests = getFilteredRequests();
    
    if (filteredRequests.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">🤝</div>
          <h3 className="empty-state-title">No Active Connections</h3>
          <p>You don't have any active connections yet. Start by finding roommates, peer support, housing, or employment opportunities.</p>
        </div>
      );
    }

    return (
      <div className={styles.connectionsByType}>
        {filteredRequests.map(request => (
          <div key={request.id} className={getCardClassName(request)}>
            <div className="card-header">
              <div>
                <div className="card-title">
                  {getConnectionIcon(request)} {request.requester_profile?.first_name || request.recipient_profile?.first_name || 'Unknown User'}
                </div>
                <div className="card-subtitle">
                  Connected on {new Date(request.responded_at || request.created_at).toLocaleDateString()}
                </div>
              </div>
              {renderStatusBadge(request.status)}
            </div>
            
            <div>
              <div className="grid-auto mb-4">
                <div>
                  <span className="label">Connection Type</span>
                  <span className="text-gray-800">
                    {getConnectionType(request)}
                  </span>
                </div>
                
                <div>
                  <span className="label">Status</span>
                  <span className="text-gray-800">
                    Active Connection
                  </span>
                </div>
              </div>
              
              {request.message && (
                <div className="mb-4">
                  <div className="label mb-2">Original Message</div>
                  <div className="alert alert-info">
                    {request.message}
                  </div>
                </div>
              )}
              
              {renderActionButtons(request)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="content">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <LoadingSpinner message="Loading your connections..." />
        </div>
      </div>
    );
  }

  if (!hasRole('applicant') && !hasRole('peer-support') && !hasRole('landlord') && !hasRole('employer')) {
    return (
      <div className="content">
        <div className="alert alert-info">
          <p>Connections are available for all platform users.</p>
        </div>
      </div>
    );
  }

  const filteredRequests = getFilteredRequests();
  const tabCounts = getTabCounts();
  
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
        <div className="navigation mb-5">
          <ul className="nav-list">
            <li className="nav-item">
              <button
                className={`nav-button ${activeTab === 'active-connections' ? 'active' : ''}`}
                onClick={() => setActiveTab('active-connections')}
              >
                <span className="nav-icon">⚡</span>
                Active Connections ({tabCounts.activeConnections})
              </button>
            </li>
            
            <li className="nav-item">
              <button
                className={`nav-button ${activeTab === 'awaiting-response' ? 'active' : ''}`}
                onClick={() => setActiveTab('awaiting-response')}
              >
                <span className="nav-icon">📥</span>
                Requests Awaiting Response ({tabCounts.awaitingResponse})
              </button>
            </li>
            
            <li className="nav-item">
              <button
                className={`nav-button ${activeTab === 'sent-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('sent-requests')}
              >
                <span className="nav-icon">📤</span>
                Sent Requests ({tabCounts.sentRequests})
              </button>
            </li>
            
            <li className="nav-item">
              <button
                className={`nav-button ${activeTab === 'connection-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('connection-history')}
              >
                <span className="nav-icon">📋</span>
                History ({tabCounts.connectionHistory})
              </button>
            </li>
          </ul>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'active-connections' && renderActiveMatches()}
        {activeTab === 'awaiting-response' && renderPendingRequests(false)}
        {activeTab === 'sent-requests' && renderPendingRequests(true)}
        {activeTab === 'connection-history' && (
          filteredRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3 className="empty-state-title">No Connection History</h3>
              <p>Your past connections and rejected requests will appear here.</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <div key={request.id} className={getCardClassName(request)}>
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      {request.requester_profile?.first_name || request.recipient_profile?.first_name || 'Unknown User'}
                    </div>
                    <div className="card-subtitle">
                      {getConnectionType(request)} on{' '}
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {renderStatusBadge(request.status)}
                </div>
                
                <div>
                  <div className="grid-auto mb-4">
                    <div>
                      <span className="label">Connection Type</span>
                      <span className="text-gray-800">
                        {getConnectionType(request)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="label">Status</span>
                      <span className="text-gray-800">
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {request.message && (
                    <div className="mb-4">
                      <div className="label mb-2">Message</div>
                      <div className="alert alert-info">
                        {request.message}
                      </div>
                    </div>
                  )}
                  
                  {renderActionButtons(request)}
                </div>
              </div>
            ))
          )
        )}
      </div>
      
      {/* ✅ NEW: Match Details Modal */}
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
              handleApprove(detailedMatchData.originalRequest.id);
            },
            onDecline: () => {
              setShowMatchDetails(false);
              setDetailedMatchData(null);
              handleReject(detailedMatchData.originalRequest);
            }
          }}
          isRequestSent={false}
          isAlreadyMatched={false}
          isRequestReceived={true}
          usePortal={true}
        />
      )}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Decline Connection Request</h3>
              <button
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please provide a brief reason for declining this connection request:
            </p>
            
            <textarea
              className="input mb-4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Different preferences, timing not right, etc."
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
            
            <div className="grid-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={submitRejection}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Declining...' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {showContactModal && contactInfo && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">📞 Contact Information</h3>
              <button
                className="modal-close"
                onClick={() => setShowContactModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {contactInfo.connectionType === 'Employment' ? '💼' : '👤'}
              </div>
              <h4 style={{ color: 'var(--primary-purple)', marginBottom: '0.5rem' }}>
                {contactInfo.name}
                {contactInfo.companyType && ` (${contactInfo.companyType})`}
              </h4>
              <p className="text-gray-600" style={{ margin: 0 }}>
                Your {contactInfo.connectionType} contact
              </p>
            </div>
            
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>📧</div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactLabel}>Email</div>
                  <div className={styles.contactValue}>
                    {contactInfo.email}
                  </div>
                  {contactInfo.email !== 'Not provided' && (
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className={styles.contactLink}
                    >
                      Send Email →
                    </a>
                  )}
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>📱</div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactLabel}>Phone</div>
                  <div className={styles.contactValue}>
                    {contactInfo.phone}
                  </div>
                  {contactInfo.phone !== 'Not provided' && (
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className={styles.contactLink}
                    >
                      Call Now →
                    </a>
                  )}
                </div>
              </div>

              {contactInfo.professionalTitle && (
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>🎓</div>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactLabel}>Professional Title</div>
                    <div className={styles.contactValue}>
                      {contactInfo.professionalTitle}
                    </div>
                  </div>
                </div>
              )}

              {contactInfo.contactPerson && (
                <div className="alert alert-info mt-3">
                  <strong>Contact Person:</strong> {contactInfo.contactPerson}
                </div>
              )}
            </div>
            
            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              <strong>💡 Next Steps:</strong> Reach out to {contactInfo.name} to coordinate your {contactInfo.connectionType}. 
              Remember to be respectful and professional in all communications.
            </div>
            
            <div className="text-center">
              <button
                className="btn btn-primary"
                onClick={() => setShowContactModal(false)}
                style={{ minWidth: '150px' }}
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchRequests;
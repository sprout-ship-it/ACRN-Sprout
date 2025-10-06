// src/hooks/useMatchActions.js - WITH DEBUG FUNCTION
import { useState } from 'react';
import { supabase } from '../utils/supabase';
import createMatchRequestsService from '../utils/database/matchRequestsService';

const matchRequestsService = createMatchRequestsService(supabase);

// ✅ ADD DEBUG FUNCTION HERE (after imports, before other functions)
const debugRLSPolicy = async () => {
  try {
    console.log('🔍 Debugging RLS Policy from authenticated context...');
    
    // 1. Check current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 Current auth user:', user?.id);
    
    // 2. Check what peer support profiles the policy finds for current user
    const { data: peerProfilesQuery, error: queryError } = await supabase
      .from('peer_support_profiles')
      .select(`
        id,
        user_id,
        registrant_profiles!inner(
          id,
          user_id
        )
      `)
      .eq('registrant_profiles.user_id', user?.id);
    
    console.log('🔍 Peer support profiles for current user:', peerProfilesQuery);
    console.log('🔍 Query error:', queryError);
    
    // 3. Test if we can query the specific peer support profile
    const testPeerSupportId = '980a59be-6999-4052-a83f-2fd78aaece39';
    const { data: specificPeer, error: specificError } = await supabase
      .from('peer_support_profiles')
      .select(`
        id,
        user_id,
        registrant_profiles!inner(
          id,
          user_id
        )
      `)
      .eq('id', testPeerSupportId)
      .single();
    
    console.log('🔍 Specific peer support profile:', specificPeer);
    console.log('🔍 Does it belong to current user?', specificPeer?.registrant_profiles?.user_id === user?.id);
    
    // 4. Test the applicant profile
    const testApplicantId = 'ec99777e-2760-4c41-9075-4a80b9d691fe';
    const { data: applicantProfile, error: applicantError } = await supabase
      .from('applicant_matching_profiles')
      .select('id, user_id')
      .eq('id', testApplicantId)
      .single();
    
    console.log('🔍 Applicant profile:', applicantProfile);
    
  } catch (err) {
    console.error('💥 Debug error:', err);
  }
};

/**
 * Determine match group structure based on request type and participants
 */
const determineMatchGroupStructure = async (request) => {
  try {
    console.log('🏗️ Creating match group structure for request:', request.request_type);
    
    const baseData = {
      status: 'forming',
      created_at: new Date().toISOString()
    };

    // ✅ FIXED: Handle each request type separately
    if (request.request_type === 'roommate') {
      console.log('🏠 Creating roommate match group');
      return {
        ...baseData,
        applicant_1_id: request.requester_id,
        applicant_2_id: request.recipient_id
      };
    }

    // ✅ FIXED: Handle peer support separately  
    if (request.request_type === 'peer-support') {
      console.log('🤝 Creating peer support match group');
      
      let applicantId, peerSupportId;
      
      if (request.requester_type === 'applicant') {
        applicantId = request.requester_id;
        peerSupportId = request.recipient_id;
      } else {
        applicantId = request.recipient_id; 
        peerSupportId = request.requester_id;
      }
      
      return {
        ...baseData,
        applicant_1_id: applicantId,
        peer_support_id: peerSupportId
      };
    }

    if (request.request_type === 'housing') {
      console.log('🏡 Creating housing match group');
      if (request.property_id) {
        return {
          ...baseData,
          applicant_1_id: request.requester_id,
          property_id: request.property_id
        };
      }
    }

    // Default fallback
    console.log('🔄 Using default structure');
    return {
      ...baseData,
      applicant_1_id: request.requester_id,
      applicant_2_id: request.recipient_id
    };

  } catch (error) {
    console.error('Error determining match group structure:', error);
    return {
      status: 'forming',
      applicant_1_id: request.requester_id,
      applicant_2_id: request.recipient_id,
      created_at: new Date().toISOString()
    };
  }
};

export const useMatchActions = (reloadRequests) => {
  const [actionLoading, setActionLoading] = useState(false);

const handleApprove = async (requestId, profileIds = null) => {
  setActionLoading(true);
  try {
    // ✅ STEP 1: Get the full request details first
    const { data: request, error: requestError } = await supabase
      .from('match_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (requestError || !request) {
      throw new Error('Request not found');
    }

    console.log('📋 Approving connection request:', {
      requestId,
      requester: request.requester_id,
      recipient: request.recipient_id,
      requestType: request.request_type,
      profileIds: profileIds
    });

    // ✅ STEP 2: Create match group for certain request types
    if (request.request_type === 'roommate' || request.request_type === 'peer-support') {
      console.log('🏠 Creating match group for connection...');

      const matchGroupData = await determineMatchGroupStructure(request);
      console.log('📋 Match group data to create:', matchGroupData);

      const { data: matchGroup, error: groupError } = await supabase
        .from('match_groups')
        .insert(matchGroupData)
        .select();

      if (groupError) {
        console.error('💥 Match group creation error:', groupError);
        throw groupError;
      }

      console.log('✅ Match group created:', matchGroup);

      // ✅ STEP 3: Create peer_support_matches entry with ONLY ESSENTIAL COLUMNS
      if (request.request_type === 'peer-support') {
        console.log('🤝 Creating peer_support_matches entry with essential columns only...');
        
        // ✅ ADD DEBUG FUNCTION CALL HERE (right before the peer_support_matches insert)
        await debugRLSPolicy();
        
        // ✅ FIXED: Use correct role-specific profile IDs for foreign keys
        let applicantMatchingProfileId, peerSupportProfileId;
        
        if (request.requester_type === 'applicant') {
          // Requester is applicant, recipient is peer support
          applicantMatchingProfileId = request.requester_id; // Should be applicant_matching_profiles.id
          peerSupportProfileId = profileIds?.peerSupport || request.recipient_id; // Use correct peer_support_profiles.id
        } else {
          // Requester is peer support, recipient is applicant  
          applicantMatchingProfileId = request.recipient_id; // Should be applicant_matching_profiles.id
          peerSupportProfileId = profileIds?.peerSupport || request.requester_id; // Use correct peer_support_profiles.id
        }

        // Validate we have the required IDs
        if (!applicantMatchingProfileId) {
          throw new Error('Applicant matching profile ID not found for peer support match');
        }
        
        if (!peerSupportProfileId) {
          throw new Error('Peer support profile ID not found. Ensure current user has peer support role.');
        }

        console.log('🔍 Creating peer_support_matches with essential columns:', {
          applicant_id: applicantMatchingProfileId,     // FK to applicant_matching_profiles.id
          peer_support_id: peerSupportProfileId,       // FK to peer_support_profiles.id
          status: 'active'
        });

        // ✅ FINAL: Only use columns that exist after cleanup
        const { data: peerMatch, error: peerError } = await supabase
          .from('peer_support_matches')
          .insert({
            applicant_id: applicantMatchingProfileId,    // ✅ Required FK to applicant_matching_profiles.id
            peer_support_id: peerSupportProfileId,      // ✅ Required FK to peer_support_profiles.id
            status: 'active'                             // ✅ Status field
            // ✅ id, created_at, updated_at will be auto-generated by database
          })
          .select();

        if (peerError) {
          console.error('💥 Could not create peer_support_matches entry:', peerError);
          console.log('🔍 Error details:', {
            code: peerError.code,
            message: peerError.message,
            details: peerError.details,
            hint: peerError.hint
          });
          
          // Don't throw here - let the match group creation succeed even if peer support match fails
          console.warn('⚠️ Continuing without peer_support_matches entry');
        } else {
          console.log('✅ Created peer_support_matches entry:', peerMatch);
        }
      }
    }

    // ✅ STEP 4: Update match request to accepted status
    const result = await matchRequestsService.accept(requestId);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to approve request');
    }

    console.log('✅ Connection request approved with downstream records');
    await reloadRequests();
    return { success: true };
    
  } catch (error) {
    console.error('💥 Error approving request:', error);
    return { success: false, error: error.message };
  } finally {
    setActionLoading(false);
  }
};

  const handleReject = async (requestId, reason) => {
    setActionLoading(true);
    try {
      const result = await matchRequestsService.reject(requestId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reject request');
      }

      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    setActionLoading(true);
    try {
      const result = await matchRequestsService.withdraw(requestId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to cancel request');
      }

      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('Error cancelling request:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnmatch = async (requestId) => {
    setActionLoading(true);
    try {
      // End match groups if needed (could be moved to service)
      
      const result = await matchRequestsService.withdraw(requestId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to end connection');
      }

      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('Error ending connection:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ FIXED: Updated handleReconnect to use correct profile IDs
  const handleReconnect = async (formerMatch, userProfileIds) => {
    setActionLoading(true);
    try {
      // Determine current user's role and ID in this former match using correct profile IDs
      const isRequester = (
        (formerMatch.requester_type === 'applicant' && formerMatch.requester_id === userProfileIds.applicant) ||
        (formerMatch.requester_type === 'peer-support' && formerMatch.requester_id === userProfileIds.peerSupport) ||
        (formerMatch.requester_type === 'landlord' && formerMatch.requester_id === userProfileIds.landlord) ||
        (formerMatch.requester_type === 'employer' && formerMatch.requester_id === userProfileIds.employer)
      );

      let currentUserType, currentUserId, otherUserType, otherUserId;
      
      if (isRequester) {
        currentUserType = formerMatch.requester_type;
        currentUserId = formerMatch.requester_id;
        otherUserType = formerMatch.recipient_type;
        otherUserId = formerMatch.recipient_id;
      } else {
        currentUserType = formerMatch.recipient_type;
        currentUserId = formerMatch.recipient_id;
        otherUserType = formerMatch.requester_type;
        otherUserId = formerMatch.requester_id;
      }

      // ✅ FIXED: Ensure we use the correct role-specific profile ID
      if (currentUserType === 'peer-support' && userProfileIds.peerSupport) {
        currentUserId = userProfileIds.peerSupport;
      } else if (currentUserType === 'applicant' && userProfileIds.applicant) {
        currentUserId = userProfileIds.applicant;
      }

      const requestData = {
        requester_type: currentUserType,
        requester_id: currentUserId,
        recipient_type: otherUserType,
        recipient_id: otherUserId,
        request_type: formerMatch.request_type,
        message: `I'd like to reconnect with you.`,
        status: 'pending'
      };

      console.log('🔄 Sending reconnection request with data:', requestData);

      const result = await matchRequestsService.create(requestData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to send reconnection request');
      }

      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('Error sending reconnection request:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    handleApprove,
    handleReject,
    handleCancel,
    handleUnmatch,
    handleReconnect,
    actionLoading
  };
};
// src/hooks/useMatchActions.js
import { useState } from 'react';
import { supabase } from '../utils/supabase';
import createMatchRequestsService from '../utils/database/matchRequestsService';

const matchRequestsService = createMatchRequestsService(supabase);

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

    // ✅ FIXED: For roommate requests, we know both are applicants
    if (request.request_type === 'roommate' || request.requester_type === 'applicant') {
      console.log('🏠 Creating roommate match group');
      return {
        ...baseData,
        applicant_1_id: request.requester_id,
        applicant_2_id: request.recipient_id
      };
    }

    // ✅ FIXED: For peer support requests, determine correct direction
    if (request.request_type === 'peer-support') {
      console.log('🤝 Creating peer support match group');
      
      let applicantId, peerSupportId;
      
      // Correctly determine who is who based on actual types
      if (request.requester_type === 'applicant') {
        applicantId = request.requester_id;
        peerSupportId = request.recipient_id;
      } else {
        // Peer specialist initiated the request
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

const handleApprove = async (requestId) => {
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
      requestType: request.request_type
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

      // ✅ STEP 3: Create peer_support_matches entry for PSS service
      if (request.request_type === 'peer-support') {
        console.log('🤝 Creating peer_support_matches entry...');
        
        let applicantId, peerSupportId;
        
        // Use same logic as match group creation
        if (request.requester_type === 'applicant') {
          applicantId = request.requester_id;
          peerSupportId = request.recipient_id;
        } else {
          applicantId = request.recipient_id; 
          peerSupportId = request.requester_id;
        }
        
        const { data: peerMatch, error: peerError } = await supabase
          .from('peer_support_matches')
          .insert({
            applicant_id: applicantId,
            peer_support_id: peerSupportId,
            status: 'mutual',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();

        if (peerError) {
          console.warn('⚠️ Could not create peer_support_matches entry:', peerError);
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

  const handleReconnect = async (formerMatch, userProfileIds) => {
    setActionLoading(true);
    try {
      // Determine current user's role and ID in this former match
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

      const requestData = {
        requester_type: currentUserType,
        requester_id: currentUserId,
        recipient_type: otherUserType,
        recipient_id: otherUserId,
        request_type: formerMatch.request_type,
        message: `I'd like to reconnect with you.`,
        status: 'pending'
      };

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

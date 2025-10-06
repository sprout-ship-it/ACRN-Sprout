// src/hooks/useMatchActions.js - TRY WITH NULLABLE FIELDS POPULATED
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

// ✅ FIXED: Updated function signature to accept profileIds for correct ID mapping
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

      // ✅ STEP 3: Create peer_support_matches entry with ALL FIELDS (nullable values)
      if (request.request_type === 'peer-support') {
        console.log('🤝 Creating peer_support_matches entry with all fields populated...');
        
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

        console.log('🔍 Creating peer_support_matches with all fields:', {
          applicant_id: applicantMatchingProfileId,     // FK to applicant_matching_profiles.id
          peer_support_id: peerSupportProfileId,       // FK to peer_support_profiles.id
          originalRequestId: requestId
        });

        // ✅ TRY WITH ALL FIELDS: Include nullable fields with default values
        const peerSupportMatchData = {
          applicant_id: applicantMatchingProfileId,           // ✅ Required FK
          peer_support_id: peerSupportProfileId,             // ✅ Required FK
          status: 'active',                                   // ✅ Status
          match_score: 85,                                    // ✅ Default score
          compatibility_factors: {                            // ✅ JSON object with metadata
            request_message: request.message || '',
            request_type: request.request_type,
            match_source: 'match_request',
            original_request_id: requestId,
            created_from_approval: true
          },
          notes: `Created from approved match request ${requestId}`, // ✅ Notes
          session_count: 0,                                   // ✅ Default session count
          last_session_date: null,                            // ✅ No sessions yet
          next_session_scheduled: null,                       // ✅ No next session yet
          created_at: new Date().toISOString(),               // ✅ Timestamp
          updated_at: new Date().toISOString()                // ✅ Timestamp
        };

        console.log('📋 Full peer support match data:', peerSupportMatchData);

        const { data: peerMatch, error: peerError } = await supabase
          .from('peer_support_matches')
          .insert(peerSupportMatchData)
          .select();

        if (peerError) {
          console.error('💥 Could not create peer_support_matches entry:', peerError);
          console.log('🔍 Error details:', {
            code: peerError.code,
            message: peerError.message,
            details: peerError.details,
            hint: peerError.hint
          });
          
          // If specific column error, try with minimal fields
          if (peerError.code === 'PGRST204' || peerError.message?.includes('column')) {
            console.log('🔄 Trying with minimal fields due to column error...');
            
            const minimalData = {
              applicant_id: applicantMatchingProfileId,
              peer_support_id: peerSupportProfileId,
              status: 'active'
            };
            
            const { data: minimalMatch, error: minimalError } = await supabase
              .from('peer_support_matches')
              .insert(minimalData)
              .select();
              
            if (minimalError) {
              console.error('💥 Even minimal fields failed:', minimalError);
              console.warn('⚠️ Continuing without peer_support_matches entry');
            } else {
              console.log('✅ Created peer_support_matches with minimal fields:', minimalMatch);
            }
          } else {
            // Don't throw here - let the match group creation succeed even if peer support match fails
            console.warn('⚠️ Continuing without peer_support_matches entry');
          }
        } else {
          console.log('✅ Created peer_support_matches entry with all fields:', peerMatch);
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
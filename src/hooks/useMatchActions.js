// src/hooks/useMatchActions.js - UPDATED: Group expansion approval logic
import { useState } from 'react';
import { supabase } from '../utils/supabase';
import createMatchGroupsService from '../utils/database/matchGroupsService';

/**
 * Hook for handling connection actions across all match types
 * Now includes logic for group expansion approvals
 */
export const useMatchActions = (reloadRequests) => {
  const [actionLoading, setActionLoading] = useState(false);

  const matchGroupsService = createMatchGroupsService(supabase);

  /**
   * Determine which table and columns to use based on match type
   */
  const getTableConfig = (matchType) => {
    switch (matchType) {
      case 'peer-support':
        return {
          table: 'peer_support_matches',
          activeStatus: 'active',
          inactiveStatus: 'inactive',
          requestedStatus: 'requested'
        };
      case 'roommate':
      case 'housing':
        return {
          table: 'match_groups',
          activeStatus: 'active',
          inactiveStatus: 'inactive',
          requestedStatus: 'requested'
        };
      case 'employment':
        return {
          table: 'employment_matches',
          activeStatus: 'active',
          inactiveStatus: 'inactive',
          requestedStatus: 'requested'
        };
      default:
        throw new Error(`Unknown match type: ${matchType}`);
    }
  };

  /**
   * Approve a connection request
   * @param {string} requestId - The ID of the request to approve
   * @param {string} matchType - Type: 'peer-support', 'roommate', 'housing', 'employment'
   * @param {string} currentUserId - Current user's applicant profile ID (needed for group logic)
   */
  const handleApprove = async (requestId, matchType, currentUserId) => {
    setActionLoading(true);
    try {
      console.log('✅ Approving connection:', { requestId, matchType, currentUserId });

      const config = getTableConfig(matchType);

      // Special logic for roommate groups
      if (matchType === 'roommate') {
        // Get the match group to check if this is a group expansion approval
        const groupResult = await matchGroupsService.getById(requestId);
        
        if (!groupResult.success) {
          throw new Error(groupResult.error?.message || 'Failed to load group details');
        }

        const group = groupResult.data;
        const pendingMembers = group.pending_member_ids || [];
        const confirmedMembers = group.roommate_ids || [];
        const confirmations = group.member_confirmations || {};

        // Check if current user is a pending invitee
        if (pendingMembers.includes(currentUserId)) {
          console.log('🎯 Current user is accepting invitation to join group');
          
          const result = await matchGroupsService.acceptGroupInvitation(requestId, currentUserId);
          
          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to accept invitation');
          }

          console.log('✅ Invitation accepted successfully');
          await reloadRequests();
          return { success: true };
        }

        // Check if this is an existing member approving a pending member
        if (confirmedMembers.includes(currentUserId) && pendingMembers.length > 0) {
          console.log('🎯 Existing member approving pending member(s)');
          
          // Find which pending member(s) need this user's approval
          let approvalMade = false;
          
          for (const pendingId of pendingMembers) {
            const confirmation = confirmations[pendingId];
            if (confirmation && confirmation.needs_approval_from.includes(currentUserId)) {
              console.log(`✅ Approving pending member: ${pendingId}`);
              
              const result = await matchGroupsService.approvePendingMember(
                requestId, 
                currentUserId, 
                pendingId
              );
              
              if (!result.success) {
                throw new Error(result.error?.message || 'Failed to approve member');
              }
              
              approvalMade = true;
              break; // Approve one at a time for UI clarity
            }
          }

          if (!approvalMade) {
            console.log('ℹ️ No pending approvals found for current user');
          }

          console.log('✅ Member approval processed successfully');
          await reloadRequests();
          return { success: true };
        }

        // Standard 2-person initial approval (status: requested → active)
        if (group.status === 'requested' && confirmedMembers.length === 2) {
          console.log('🎯 Approving initial 2-person roommate request');
          
          const { data: updated, error: updateError } = await supabase
            .from(config.table)
            .update({ 
              status: config.activeStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

          if (updateError) {
            throw new Error(updateError.message || 'Failed to approve request');
          }

          console.log('✅ Initial request approved successfully');
          await reloadRequests();
          return { success: true };
        }

        // Fallback: just update status
        console.log('⚠️ Fallback: updating status to active');
      }

      // Standard approval for non-roommate types or fallback
      const { data: updated, error: updateError } = await supabase
        .from(config.table)
        .update({ 
          status: config.activeStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message || 'Failed to approve request');
      }

      if (!updated) {
        throw new Error('No response received from approval');
      }

      console.log('✅ Connection approved successfully:', updated);
      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('💥 Error approving request:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Reject a connection request
   * @param {string} requestId - The ID of the request to reject
   * @param {string} matchType - Type: 'peer-support', 'roommate', 'housing', 'employment'
   */
  const handleReject = async (requestId, matchType) => {
    setActionLoading(true);
    try {
      console.log('❌ Rejecting connection:', { requestId, matchType });

      const config = getTableConfig(matchType);

      // Update the status to inactive
      const { data: updated, error: updateError } = await supabase
        .from(config.table)
        .update({ 
          status: config.inactiveStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message || 'Failed to reject request');
      }

      console.log('✅ Connection rejected successfully');
      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('💥 Error rejecting request:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Cancel a pending request (withdraw)
   * @param {string} requestId - The ID of the request to cancel
   * @param {string} matchType - Type: 'peer-support', 'roommate', 'housing', 'employment'
   */
  const handleCancel = async (requestId, matchType) => {
    setActionLoading(true);
    try {
      console.log('🔙 Canceling connection request:', { requestId, matchType });

      const config = getTableConfig(matchType);

      // Update the status to inactive (withdrawn)
      const { data: updated, error: updateError } = await supabase
        .from(config.table)
        .update({ 
          status: config.inactiveStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message || 'Failed to cancel request');
      }

      console.log('✅ Request cancelled successfully');
      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('💥 Error cancelling request:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * End an active connection (unmatch)
   * @param {string} requestId - The ID of the connection to end
   * @param {string} matchType - Type: 'peer-support', 'roommate', 'housing', 'employment'
   */
  const handleUnmatch = async (requestId, matchType) => {
    setActionLoading(true);
    try {
      console.log('🔚 Ending connection:', { requestId, matchType });

      const config = getTableConfig(matchType);

      // Update the status to inactive
      const { data: updated, error: updateError } = await supabase
        .from(config.table)
        .update({ 
          status: config.inactiveStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message || 'Failed to end connection');
      }

      console.log('✅ Connection ended successfully');
      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('💥 Error ending connection:', error);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Send a reconnection request to a former match
   * @param {object} formerMatch - The former match object
   * @param {string} matchType - Type: 'peer-support', 'roommate', 'housing', 'employment'
   * @param {object} userProfileIds - Current user's profile IDs for different roles
   */
  const handleReconnect = async (formerMatch, matchType, userProfileIds) => {
    setActionLoading(true);
    try {
      console.log('🔄 Sending reconnection request:', { formerMatch, matchType, userProfileIds });

      const config = getTableConfig(matchType);

      // Build new request data based on match type
      let requestData = {
        status: config.requestedStatus,
        message: `I'd like to reconnect with you.`,
        requested_by_id: null, // Will be set based on type
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add type-specific fields
      if (matchType === 'peer-support') {
        // Determine who is the applicant and who is the peer support
        const isApplicant = formerMatch.applicant_id === userProfileIds.applicant;
        
        requestData.applicant_id = isApplicant ? userProfileIds.applicant : formerMatch.applicant_id;
        requestData.peer_support_id = isApplicant ? formerMatch.peer_support_id : userProfileIds.peerSupport;
        requestData.requested_by_id = userProfileIds.applicant; // Applicant always initiates

      } else if (matchType === 'roommate') {
        // ✅ UPDATED: Check for existing active group before creating new one
        const existingGroupResult = await matchGroupsService.findActiveGroupForUser(userProfileIds.applicant);
        
        if (existingGroupResult.success && existingGroupResult.data) {
          // User is already in a group - invite the former match to join
          console.log('🏠 User is in an existing group, inviting former match to join');
          
          const groupId = existingGroupResult.data.id;
          const inviteResult = await matchGroupsService.inviteMemberToGroup(
            groupId,
            userProfileIds.applicant,
            formerMatch.applicant_id
          );
          
          if (!inviteResult.success) {
            throw new Error(inviteResult.error?.message || 'Failed to invite to existing group');
          }
          
          console.log('✅ Former match invited to existing group successfully');
          await reloadRequests();
          return { success: true };
        }

        // No existing group - create new roommate match
        requestData.roommate_ids = [userProfileIds.applicant, formerMatch.applicant_id];
        requestData.requested_by_id = userProfileIds.applicant;

      } else if (matchType === 'housing') {
        // Housing reconnection
        requestData.property_id = formerMatch.property_id;
        requestData.roommate_ids = [userProfileIds.applicant];
        requestData.requested_by_id = userProfileIds.applicant;

      } else if (matchType === 'employment') {
        // Employment reconnection
        const isApplicant = formerMatch.applicant_id === userProfileIds.applicant;
        
        requestData.applicant_id = isApplicant ? userProfileIds.applicant : formerMatch.applicant_id;
        requestData.employer_id = isApplicant ? formerMatch.employer_id : userProfileIds.employer;
        requestData.requested_by_id = userProfileIds.applicant; // Applicant always initiates
      }

      console.log('📤 Creating reconnection request:', requestData);

      const { data: newRequest, error: insertError } = await supabase
        .from(config.table)
        .insert(requestData)
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message || 'Failed to send reconnection request');
      }

      console.log('✅ Reconnection request sent successfully:', newRequest);
      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('💥 Error sending reconnection request:', error);
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
// src/hooks/useMatchActions.js
import { useState } from 'react';
import { supabase } from '../utils/supabase';
import createMatchRequestsService from '../utils/database/matchRequestsService';

const matchRequestsService = createMatchRequestsService(supabase);

export const useMatchActions = (reloadRequests) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      const result = await matchRequestsService.accept(requestId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to approve request');
      }

      // Handle match group creation if needed
      // (This logic could be moved to a separate service)
      
      await reloadRequests();
      return { success: true };
      
    } catch (error) {
      console.error('Error approving request:', error);
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

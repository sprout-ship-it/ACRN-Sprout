// src/hooks/useSupabase.js
import { useState, useCallback } from 'react';
import { db } from '../utils/supabase';
import { useAuth } from './useAuth';

/**
 * Custom hook for Supabase database operations with error handling and loading states
 */
export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Generic operation wrapper with error handling
  const executeOperation = useCallback(async (operation, options = {}) => {
    const { 
      setLoadingState = true, 
      clearErrorOnStart = true,
      successMessage = null 
    } = options;
    
    if (setLoadingState) setLoading(true);
    if (clearErrorOnStart) setError(null);
    
    try {
      const result = await operation();
      
      if (result.error) {
        throw new Error(result.error.message || 'Database operation failed');
      }
      
      if (successMessage) {
        console.log(successMessage);
      }
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Database operation failed:', err);
      return { success: false, error: errorMessage };
    } finally {
      if (setLoadingState) setLoading(false);
    }
  }, []);

  // Clear error manually
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    executeOperation
  };
};

/**
 * Hook for profile operations
 */
export const useProfileOperations = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createProfile = useCallback(async (profileData) => {
    return executeOperation(
      () => db.profiles.create({ ...profileData, id: user.id }),
      { successMessage: 'Profile created successfully' }
    );
  }, [executeOperation, user]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    return executeOperation(
      () => db.profiles.update(user.id, updates),
      { successMessage: 'Profile updated successfully' }
    );
  }, [executeOperation, user]);

  const getProfile = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.profiles.getById(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  return {
    createProfile,
    updateProfile,
    getProfile
  };
};

/**
 * Hook for basic profile operations
 */
export const useBasicProfile = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createBasicProfile = useCallback(async (profileData) => {
    return executeOperation(
      () => db.basicProfiles.create({ ...profileData, user_id: user.id }),
      { successMessage: 'Basic profile created successfully' }
    );
  }, [executeOperation, user]);

  const updateBasicProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    return executeOperation(
      () => db.basicProfiles.update(user.id, updates),
      { successMessage: 'Basic profile updated successfully' }
    );
  }, [executeOperation, user]);

  const getBasicProfile = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.basicProfiles.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  return {
    createBasicProfile,
    updateBasicProfile,
    getBasicProfile
  };
};

/**
 * Hook for matching profile operations
 */
export const useMatchingProfile = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createMatchingProfile = useCallback(async (profileData) => {
    return executeOperation(
      () => db.matchingProfiles.create({ ...profileData, user_id: user.id }),
      { successMessage: 'Matching profile created successfully' }
    );
  }, [executeOperation, user]);

  const updateMatchingProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    return executeOperation(
      () => db.matchingProfiles.update(user.id, updates),
      { successMessage: 'Matching profile updated successfully' }
    );
  }, [executeOperation, user]);

  const getMatchingProfile = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.matchingProfiles.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const getActiveProfiles = useCallback(async () => {
    return executeOperation(
      () => db.matchingProfiles.getActiveProfiles(user?.id),
      { successMessage: 'Active profiles loaded' }
    );
  }, [executeOperation, user]);

  return {
    createMatchingProfile,
    updateMatchingProfile,
    getMatchingProfile,
    getActiveProfiles
  };
};

/**
 * Hook for match request operations
 */
export const useMatchRequests = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createMatchRequest = useCallback(async (targetId, message = '', matchScore = null) => {
    const requestData = {
      requester_id: user.id,
      target_id: targetId,
      message,
      match_score: matchScore,
      status: 'pending'
    };
    
    return executeOperation(
      () => db.matchRequests.create(requestData),
      { successMessage: 'Match request sent successfully' }
    );
  }, [executeOperation, user]);

  const updateMatchRequest = useCallback(async (requestId, updates) => {
    return executeOperation(
      () => db.matchRequests.update(requestId, updates),
      { successMessage: 'Match request updated successfully' }
    );
  }, [executeOperation]);

  const getMatchRequests = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.matchRequests.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const approveMatchRequest = useCallback(async (requestId) => {
    return updateMatchRequest(requestId, {
      status: 'approved',
      target_approved: true
    });
  }, [updateMatchRequest]);

  const rejectMatchRequest = useCallback(async (requestId, reason = '') => {
    return updateMatchRequest(requestId, {
      status: 'rejected',
      rejection_reason: reason
    });
  }, [updateMatchRequest]);

  const unmatchRequest = useCallback(async (requestId, reason = '') => {
    return updateMatchRequest(requestId, {
      status: 'unmatched',
      unmatched_at: new Date().toISOString(),
      unmatched_by: user.id,
      unmatched_reason: reason
    });
  }, [updateMatchRequest, user]);

  return {
    createMatchRequest,
    updateMatchRequest,
    getMatchRequests,
    approveMatchRequest,
    rejectMatchRequest,
    unmatchRequest
  };
};

/**
 * Hook for property operations
 */
export const useProperties = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createProperty = useCallback(async (propertyData) => {
    return executeOperation(
      () => db.properties.create({ ...propertyData, landlord_id: user.id }),
      { successMessage: 'Property created successfully' }
    );
  }, [executeOperation, user]);

  const updateProperty = useCallback(async (propertyId, updates) => {
    return executeOperation(
      () => db.properties.update(propertyId, updates),
      { successMessage: 'Property updated successfully' }
    );
  }, [executeOperation]);

  const deleteProperty = useCallback(async (propertyId) => {
    return executeOperation(
      () => db.properties.delete(propertyId),
      { successMessage: 'Property deleted successfully' }
    );
  }, [executeOperation]);

  const getPropertiesByLandlord = useCallback(async (landlordId = user?.id) => {
    if (!landlordId) throw new Error('Landlord ID required');
    
    return executeOperation(
      () => db.properties.getByLandlordId(landlordId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const getAvailableProperties = useCallback(async (filters = {}) => {
    return executeOperation(
      () => db.properties.getAvailable(filters),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  return {
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByLandlord,
    getAvailableProperties
  };
};

/**
 * Hook for peer support operations
 */
export const usePeerSupport = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createPeerProfile = useCallback(async (profileData) => {
    return executeOperation(
      () => db.peerSupport.create({ ...profileData, user_id: user.id }),
      { successMessage: 'Peer support profile created successfully' }
    );
  }, [executeOperation, user]);

  const updatePeerProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    return executeOperation(
      () => db.peerSupport.update(user.id, updates),
      { successMessage: 'Peer support profile updated successfully' }
    );
  }, [executeOperation, user]);

  const getPeerProfile = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.peerSupport.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const getAvailablePeerSupport = useCallback(async (filters = {}) => {
    return executeOperation(
      () => db.peerSupport.getAvailable(filters),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  return {
    createPeerProfile,
    updatePeerProfile,
    getPeerProfile,
    getAvailablePeerSupport
  };
};

/**
 * Hook for batch operations and complex queries
 */
export const useBatchOperations = () => {
  const { executeOperation } = useSupabase();

  const batchUpdate = useCallback(async (operations) => {
    return executeOperation(async () => {
      const results = await Promise.allSettled(operations);
      
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      if (failed.length > 0) {
        console.warn(`${failed.length} operations failed:`, failed);
      }
      
      return {
        data: {
          successful: successful.length,
          failed: failed.length,
          results: successful.map(r => r.value)
        }
      };
    }, { successMessage: `Batch operation completed: ${operations.length} operations` });
  }, [executeOperation]);

  return {
    batchUpdate
  };
};

export default useSupabase;
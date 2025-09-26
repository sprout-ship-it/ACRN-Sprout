// src/hooks/useSupabase.js - PHASE 3 CORRECTED VERSION
import { useState, useCallback } from 'react';
import { supabase, db } from '../utils/supabase';
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
      
      if (result && !result.success && result.error) {
        throw new Error(result.error.message || 'Database operation failed');
      }
      
      if (successMessage) {
        console.log(successMessage);
      }
      
      return { success: true, data: result.data || result };
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
 * Hook for registrant profile operations
 */
export const useProfileOperations = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createProfile = useCallback(async (profileData) => {
    return executeOperation(
      () => db.profiles.create({ ...profileData, user_id: user.id }),
      { successMessage: 'Profile created successfully' }
    );
  }, [executeOperation, user]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    return executeOperation(
      () => db.profiles.updateByUserId(user.id, updates),
      { successMessage: 'Profile updated successfully' }
    );
  }, [executeOperation, user]);

  const getProfile = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.profiles.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const refreshProfile = useCallback(async () => {
    if (!user) throw new Error('No authenticated user');
    return getProfile(user.id);
  }, [getProfile, user]);

  return {
    createProfile,
    updateProfile,
    getProfile,
    refreshProfile
  };
};

/**
 * Hook for matching profile operations
 * ✅ FIXED: Now uses db.matchingProfiles instead of applicantForms
 */
export const useMatchingProfile = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createMatchingProfile = useCallback(async (profileData) => {
    console.log('Creating matching profile with data:', profileData);
    
    return executeOperation(
      () => db.matchingProfiles.create({ ...profileData, user_id: user.id }),
      { successMessage: 'Matching profile created successfully' }
    );
  }, [executeOperation, user]);

  const updateMatchingProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    console.log('Updating matching profile with data:', updates);
    
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

  const upsertMatchingProfile = useCallback(async (profileData) => {
    return executeOperation(
      () => db.matchingProfiles.upsert({ ...profileData, user_id: user.id }),
      { successMessage: 'Matching profile saved successfully' }
    );
  }, [executeOperation, user]);

  return {
    createMatchingProfile,
    updateMatchingProfile,
    getMatchingProfile,
    getActiveProfiles,
    upsertMatchingProfile
  };
};

/**
 * Hook for match request operations
 */
export const useMatchRequests = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createMatchRequest = useCallback(async (requestData) => {
    return executeOperation(
      () => db.matchRequests.create({
        ...requestData,
        requester_id: user.id
      }),
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

  const getSentRequests = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.matchRequests.getSentRequests(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const getReceivedRequests = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.matchRequests.getReceivedRequests(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const approveMatchRequest = useCallback(async (requestId) => {
    return executeOperation(
      () => db.matchRequests.approve(requestId, user.id),
      { successMessage: 'Match request approved' }
    );
  }, [executeOperation, user]);

  const rejectMatchRequest = useCallback(async (requestId, reason = '') => {
    return executeOperation(
      () => db.matchRequests.reject(requestId, user.id, reason),
      { successMessage: 'Match request rejected' }
    );
  }, [executeOperation, user]);

  const cancelMatchRequest = useCallback(async (requestId) => {
    return executeOperation(
      () => db.matchRequests.cancel(requestId, user.id),
      { successMessage: 'Match request cancelled' }
    );
  }, [executeOperation, user]);

  return {
    createMatchRequest,
    updateMatchRequest,
    getMatchRequests,
    getSentRequests,
    getReceivedRequests,
    approveMatchRequest,
    rejectMatchRequest,
    cancelMatchRequest
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

  const getPropertyById = useCallback(async (propertyId) => {
    return executeOperation(
      () => db.properties.getById(propertyId),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  return {
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByLandlord,
    getAvailableProperties,
    getPropertyById
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
      () => db.peerSupportProfiles.create({ ...profileData, user_id: user.id }),
      { successMessage: 'Peer support profile created successfully' }
    );
  }, [executeOperation, user]);

  const updatePeerProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    return executeOperation(
      () => db.peerSupportProfiles.update(user.id, updates),
      { successMessage: 'Peer support profile updated successfully' }
    );
  }, [executeOperation, user]);

  const getPeerProfile = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.peerSupportProfiles.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const getAvailablePeerSupport = useCallback(async (filters = {}) => {
    return executeOperation(
      () => db.peerSupportProfiles.getAvailable(filters),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  const searchPeerSupport = useCallback(async (searchTerm, filters = {}) => {
    return executeOperation(
      () => db.peerSupportProfiles.search(searchTerm, filters),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  return {
    createPeerProfile,
    updatePeerProfile,
    getPeerProfile,
    getAvailablePeerSupport,
    searchPeerSupport
  };
};

/**
 * Hook for employer operations
 */
export const useEmployer = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const createEmployerProfile = useCallback(async (profileData) => {
    return executeOperation(
      () => db.employerProfiles.create({ ...profileData, user_id: user.id }),
      { successMessage: 'Employer profile created successfully' }
    );
  }, [executeOperation, user]);

  const updateEmployerProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    
    return executeOperation(
      () => db.employerProfiles.update(user.id, updates),
      { successMessage: 'Employer profile updated successfully' }
    );
  }, [executeOperation, user]);

  const getEmployerProfile = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.employerProfiles.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const getAvailableEmployers = useCallback(async (filters = {}) => {
    return executeOperation(
      () => db.employerProfiles.getAvailable(filters),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  const searchEmployers = useCallback(async (searchTerm, filters = {}) => {
    return executeOperation(
      () => db.employerProfiles.search(searchTerm, filters),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  return {
    createEmployerProfile,
    updateEmployerProfile,
    getEmployerProfile,
    getAvailableEmployers,
    searchEmployers
  };
};

/**
 * Hook for employer favorites operations
 */
export const useEmployerFavorites = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const getFavorites = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.employerFavorites.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const addFavorite = useCallback(async (employerUserId) => {
    return executeOperation(
      () => db.employerFavorites.add(user.id, employerUserId),
      { successMessage: 'Employer favorited successfully' }
    );
  }, [executeOperation, user]);

  const removeFavorite = useCallback(async (employerUserId) => {
    return executeOperation(
      () => db.employerFavorites.remove(user.id, employerUserId),
      { successMessage: 'Employer removed from favorites' }
    );
  }, [executeOperation, user]);

  const toggleFavorite = useCallback(async (employerUserId) => {
    return executeOperation(
      () => db.employerFavorites.toggle(user.id, employerUserId),
      { successMessage: 'Favorite status updated' }
    );
  }, [executeOperation, user]);

  const isFavorited = useCallback(async (employerUserId) => {
    return executeOperation(
      () => db.employerFavorites.isFavorited(user.id, employerUserId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  return {
    getFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited
  };
};

/**
 * Hook for match groups operations
 */
export const useMatchGroups = () => {
  const { executeOperation } = useSupabase();
  const { user } = useAuth();

  const getMatchGroups = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.matchGroups.getByUserId(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  const getMatchGroup = useCallback(async (groupId) => {
    return executeOperation(
      () => db.matchGroups.getById(groupId),
      { setLoadingState: false }
    );
  }, [executeOperation]);

  const createMatchGroup = useCallback(async (groupData) => {
    return executeOperation(
      () => db.matchGroups.create(groupData),
      { successMessage: 'Match group created successfully' }
    );
  }, [executeOperation]);

  const updateMatchGroup = useCallback(async (groupId, updates) => {
    return executeOperation(
      () => db.matchGroups.update(groupId, updates),
      { successMessage: 'Match group updated successfully' }
    );
  }, [executeOperation]);

  const endMatchGroup = useCallback(async (groupId, reason = null) => {
    return executeOperation(
      () => db.matchGroups.endGroup(groupId, user.id, reason),
      { successMessage: 'Match group ended successfully' }
    );
  }, [executeOperation, user]);

  const getConnectionSummary = useCallback(async (userId = user?.id) => {
    if (!userId) throw new Error('User ID required');
    
    return executeOperation(
      () => db.matchGroups.getConnectionSummary(userId),
      { setLoadingState: false }
    );
  }, [executeOperation, user]);

  return {
    getMatchGroups,
    getMatchGroup,
    createMatchGroup,
    updateMatchGroup,
    endMatchGroup,
    getConnectionSummary
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
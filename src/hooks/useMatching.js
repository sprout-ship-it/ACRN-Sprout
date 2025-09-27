// src/hooks/useMatching.js - SCHEMA COMPLIANT VERSION

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { schemaCompliantMatchingService } from '../utils/matching/matchingService';
import { calculateDetailedCompatibility } from '../utils/matching/algorithm';
import { generateDetailedFlags, getCompatibilitySummary } from '../utils/matching/compatibility';

/**
 * SCHEMA COMPLIANT: React hook for matching functionality
 * 
 * Integrates with schemaCompliantMatchingService for all data operations
 * Provides React-specific state management and lifecycle integration
 * Uses exact database table names from schema.sql
 * 
 * Architecture Flow:
 * auth.users.id → registrant_profiles.user_id → registrant_profiles.id → applicant_matching_profiles.user_id
 */
export const useMatching = () => {
  const { user, profile } = useAuth(); // profile = registrant_profiles record
  const [userProfile, setUserProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFilters, setLastFilters] = useState({});
  
  // Track initialization to prevent duplicate calls
  const initializationRef = useRef({ isInitializing: false, isInitialized: false });

  /**
   * SCHEMA COMPLIANT: Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * SCHEMA COMPLIANT: Load user's matching profile
   * Uses registrant_profiles.id (not auth.users.id)
   */
  
const loadUserProfile = useCallback(async () => {
  if (!profile?.id) {
    console.log('⚠️ useMatching: No registrant profile found:', { 
      profile, 
      user: user?.id,
      profileId: profile?.id,
      userIsAuthenticated: !!user
    })
    setError('No registrant profile found. Please complete account setup.');
    return null;
  }

  try {
    setError(null);
    console.log('🔍 useMatching: Loading with registrant_profile.id:', profile.id)
    console.log('🔍 Loading schema-compliant user matching profile...');
      
      // SCHEMA COMPLIANT: Pass registrant_profiles.id to matching service
      const userMatchingProfile = await schemaCompliantMatchingService.loadUserProfile(profile.id);
      
      console.log('✅ User matching profile loaded:', {
        user_id: userMatchingProfile?.user_id,
        completion: userMatchingProfile?.completion_percentage,
        location: userMatchingProfile?.primary_location
      });
      
      setUserProfile(userMatchingProfile);
      return userMatchingProfile;
      
    } catch (err) {
      console.error('💥 Error loading user profile:', err);
      setError(err.message || 'Failed to load your matching profile');
      return null;
    }
  }, [profile?.id]);

  /**
   * SCHEMA COMPLIANT: Find matches using the updated matching service
   */
  const findMatches = useCallback(async (filters = {}) => {
    if (!profile?.id) {
      setError('No registrant profile available for matching');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Finding schema-compliant matches with filters:', filters);
      
      // SCHEMA COMPLIANT: Use registrant_profiles.id for matching
      const result = await schemaCompliantMatchingService.findMatches(profile.id, filters);
      
      const matches = result.matches || [];
      const userProfile = result.userProfile;
      
      console.log(`✅ Found ${matches.length} schema-compliant matches`);
      
      // Update state
      setMatches(matches);
      if (userProfile && !userMatchingProfile) {
        setUserProfile(userProfile);
      }
      setLastFilters(filters);
      
      return matches;
      
    } catch (err) {
      console.error('💥 Error finding matches:', err);
      setError(err.message || 'Failed to find matches');
      return [];
    } finally {
      setLoading(false);
    }
  }, [profile?.id, userProfile]);

  /**
   * SCHEMA COMPLIANT: Send match request
   */
  const sendMatchRequest = useCallback(async (targetMatch, customMessage = '') => {
    if (!profile?.id || !targetMatch?.user_id) {
      throw new Error('Invalid profile or target match');
    }

    try {
      setError(null);
      console.log(`📤 Sending schema-compliant match request to:`, targetMatch.first_name);
      
      // SCHEMA COMPLIANT: Use registrant_profiles.id
      const result = await schemaCompliantMatchingService.sendMatchRequest(profile.id, {
        ...targetMatch,
        customMessage
      });
      
      if (result.success) {
        console.log('✅ Match request sent successfully');
        
        // Refresh matches to update UI state
        await findMatches(lastFilters);
        
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Failed to send match request');
      }
      
    } catch (err) {
      console.error('💥 Error sending match request:', err);
      setError(err.message || 'Failed to send match request');
      return { success: false, error: err.message };
    }
  }, [profile?.id, findMatches, lastFilters]);

  /**
   * SCHEMA COMPLIANT: Load user's match requests and connections
   */
  const loadMatchRequests = useCallback(async () => {
    if (!profile?.id) return [];

    try {
      setError(null);
      console.log('📋 Loading schema-compliant match requests...');
      
      // The matching service loads sent requests as part of exclusion logic
      // For UI purposes, we can call findMatches to get current state
      // Or implement a specific method in the service if needed
      
      // For now, this is handled by the matching service internally
      // We could add a specific method if the UI needs direct access
      
      return [];
      
    } catch (err) {
      console.error('💥 Error loading match requests:', err);
      setError(err.message || 'Failed to load match requests');
      return [];
    }
  }, [profile?.id]);

  /**
   * SCHEMA COMPLIANT: Get matching statistics
   */
  const loadStatistics = useCallback(async () => {
    if (!profile?.id) return null;

    try {
      setError(null);
      console.log('📊 Loading matching statistics...');
      
      const stats = await schemaCompliantMatchingService.getMatchingStatistics(profile.id);
      
      console.log('✅ Statistics loaded:', stats);
      setStatistics(stats);
      return stats;
      
    } catch (err) {
      console.error('💥 Error loading statistics:', err);
      setError(err.message || 'Failed to load statistics');
      return null;
    }
  }, [profile?.id]);

  /**
   * SCHEMA COMPLIANT: Calculate compatibility between any two profiles
   * This is useful for UI components that need to show compatibility
   */
  const calculateCompatibility = useCallback((profile1, profile2) => {
    if (!profile1 || !profile2) {
      console.warn('⚠️ Missing profile data for compatibility calculation');
      return null;
    }

    try {
      // Use the algorithm directly for custom calculations
      const compatibility = calculateDetailedCompatibility(profile1, profile2);
      const flags = generateDetailedFlags(profile1, profile2, compatibility.score_breakdown);
      const summary = getCompatibilitySummary(profile1, profile2);

      return {
        score: compatibility.compatibility_score,
        breakdown: compatibility.score_breakdown,
        priorityBreakdown: compatibility.priority_breakdown,
        greenFlags: flags.green || [],
        redFlags: flags.red || [],
        yellowFlags: flags.yellow || [],
        summary,
        compatibility
      };

    } catch (err) {
      console.error('💥 Error calculating compatibility:', err);
      return null;
    }
  }, []);

  /**
   * SCHEMA COMPLIANT: Update user's matching profile
   */
  const updateUserProfile = useCallback(async (profileData) => {
    if (!profile?.id) {
      throw new Error('No registrant profile available');
    }

    try {
      setError(null);
      console.log('📝 Updating user matching profile...');
      
      const result = await schemaCompliantMatchingService.updateUserProfile(profile.id, profileData);
      
      if (result.success) {
        console.log('✅ Profile updated successfully');
        
        // Reload the user profile to get updated data
        await loadUserProfile();
        
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
      
    } catch (err) {
      console.error('💥 Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
    }
  }, [profile?.id, loadUserProfile]);

  /**
   * SCHEMA COMPLIANT: Initialize the matching system
   */
  const initialize = useCallback(async () => {
    // Prevent duplicate initialization
    if (initializationRef.current.isInitializing || initializationRef.current.isInitialized) {
      return initializationRef.current.isInitialized;
    }

    if (!profile?.id) {
      console.log('⚠️ No registrant profile available for matching initialization');
      return false;
    }

    initializationRef.current.isInitializing = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing schema-compliant matching system...');
      
      // Load user profile first
      const userMatchingProfile = await loadUserProfile();
      
      if (userMatchingProfile) {
        // Load statistics in background (don't block on this)
        loadStatistics().catch(err => {
          console.warn('Statistics loading failed:', err);
        });

        console.log('✅ Schema-compliant matching system initialized');
        initializationRef.current.isInitialized = true;
        return true;
      } else {
        console.log('❌ Matching system initialization failed - no profile');
        return false;
      }

    } catch (err) {
      console.error('💥 Error initializing matching system:', err);
      setError(err.message || 'Failed to initialize matching system');
      return false;
    } finally {
      initializationRef.current.isInitializing = false;
      setLoading(false);
    }
  }, [profile?.id, loadUserProfile, loadStatistics]);

  /**
   * Reset initialization state when user changes
   */
  useEffect(() => {
    initializationRef.current = { isInitializing: false, isInitialized: false };
  }, [profile?.id]);

  /**
   * Auto-initialize when registrant profile is available
   */
  useEffect(() => {
    if (profile?.id && !initializationRef.current.isInitialized && !initializationRef.current.isInitializing) {
      initialize();
    } else if (!profile?.id) {
      // Clear data when no profile
      setUserProfile(null);
      setMatches([]);
      setMatchRequests([]);
      setStatistics(null);
      setError(null);
      initializationRef.current = { isInitializing: false, isInitialized: false };
    }
  }, [profile?.id, initialize]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    initializationRef.current.isInitialized = false;
    return await initialize();
  }, [initialize]);

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  const clearCache = useCallback(() => {
    schemaCompliantMatchingService.clearCache();
    console.log('🗑️ Matching cache cleared');
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return schemaCompliantMatchingService.getCacheStats();
  }, []);

  return {
    // SCHEMA COMPLIANT STATE
    userProfile,           // From applicant_matching_profiles table
    matches,               // Computed matches with compatibility scores  
    matchRequests,         // Match requests (handled internally by service)
    statistics,            // Matching statistics and insights
    loading,               // Loading state for UI
    error,                 // Error messages for UI
    lastFilters,           // Last applied filters

    // CORE MATCHING FUNCTIONS
    findMatches,           // Find and rank compatible matches
    sendMatchRequest,      // Send connection request to another user
    calculateCompatibility, // Calculate compatibility between profiles
    
    // PROFILE MANAGEMENT
    loadUserProfile,       // Load current user's matching profile
    updateUserProfile,     // Update current user's matching profile
    
    // DATA MANAGEMENT  
    loadMatchRequests,     // Load user's connection requests
    loadStatistics,        // Load matching statistics
    
    // SYSTEM CONTROL
    initialize,            // Initialize matching system
    refresh,               // Refresh all data
    clearError,            // Clear error state
    clearCache,            // Clear service cache
    getCacheStats,         // Get cache performance stats

    // COMPUTED PROPERTIES
    isInitialized: initializationRef.current.isInitialized,
    hasMatches: matches.length > 0,
    hasProfile: userProfile !== null,
    profileCompletion: userProfile?.completion_percentage || 0,
    matchCount: matches.length,
    algorithmVersion: '2.0_schema_compliant'
  };
};

/**
 * SCHEMA COMPLIANT: Simplified hook for just compatibility calculations
 * Useful for components that only need to calculate compatibility scores
 */
export const useCompatibilityCalculation = () => {
  const calculateProfileCompatibility = useCallback((profile1, profile2) => {
    if (!profile1 || !profile2) {
      return null;
    }

    try {
      const compatibility = calculateDetailedCompatibility(profile1, profile2);
      const flags = generateDetailedFlags(profile1, profile2, compatibility.score_breakdown);
      const summary = getCompatibilitySummary(profile1, profile2);

      return {
        score: compatibility.compatibility_score,
        breakdown: compatibility.score_breakdown,
        priorityBreakdown: compatibility.priority_breakdown,
        greenFlags: flags.green || [],
        redFlags: flags.red || [],
        yellowFlags: flags.yellow || [],
        summary,
        raw: compatibility,
        algorithmVersion: '2.0_schema_compliant'
      };
    } catch (err) {
      console.error('💥 Compatibility calculation error:', err);
      return null;
    }
  }, []);

  return { 
    calculateProfileCompatibility,
    algorithmVersion: '2.0_schema_compliant'
  };
};

/**
 * SCHEMA COMPLIANT: Hook for matching statistics only
 * Useful for dashboard components that only need stats
 */
export const useMatchingStatistics = () => {
  const { profile } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStatistics = useCallback(async () => {
    if (!profile?.id) {
      setError('No registrant profile available');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const stats = await schemaCompliantMatchingService.getMatchingStatistics(profile.id);
      setStatistics(stats);
      return stats;
    } catch (err) {
      console.error('💥 Error loading statistics:', err);
      setError(err.message || 'Failed to load statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      loadStatistics();
    }
  }, [profile?.id, loadStatistics]);

  return {
    statistics,
    loading,
    error,
    refresh: loadStatistics,
    algorithmVersion: '2.0_schema_compliant'
  };
};

export default useMatching;
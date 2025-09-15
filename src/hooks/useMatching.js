// src/hooks/useMatching.js

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMatchingProfile, useMatchRequests } from './useSupabase';
import { 
  transformProfileForAlgorithm, 
  transformProfilesForAlgorithm,
  filterMatchableProfiles,
  validateProfileForMatching,
  calculateLocationCompatibility
} from '../utils/matching/dataTransform';
import { calculateDetailedCompatibility } from '../utils/matching/algorithm';
import { generateDetailedFlags, getCompatibilitySummary } from '../utils/matching/compatibility';

/**
 * Enhanced matching hook that provides complete matching functionality
 * Handles data fetching, transformation, compatibility calculation, and match requests
 */
export const useMatching = () => {
  const { user } = useAuth();
  const { getMatchingProfile, getActiveProfiles } = useMatchingProfile();
  const { createMatchRequest, getMatchRequests } = useMatchRequests();
  
  const [userProfile, setUserProfile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced location compatibility that can use external services
  const enhancedLocationCompatibility = useCallback((profile1, profile2) => {
    // First try the basic location compatibility
    let score = calculateLocationCompatibility(profile1, profile2);
    
    // If there's a global ZIP code compatibility function available, use it
    if (typeof window !== 'undefined' && window.calculateZipCodeCompatibility) {
      try {
        const zipScore = window.calculateZipCodeCompatibility(profile1, profile2);
        score = Math.max(score, zipScore); // Use the better score
      } catch (err) {
        console.warn('ZIP code compatibility calculation failed:', err);
      }
    }
    
    return score;
  }, []);

  /**
   * Load current user's matching profile
   */
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) {
      setError('No authenticated user found');
      return null;
    }

    try {
      setError(null);
      console.log('🔍 Loading user matching profile...');
      
      const result = await getMatchingProfile(user.id);
      
      if (result.success && result.data) {
        const transformedProfile = transformProfileForAlgorithm(result.data);
        
        // Validate the profile
        const validation = validateProfileForMatching(transformedProfile);
        
        if (!validation.isValid) {
          console.warn('❌ User profile validation failed:', validation);
          setError(`Profile incomplete: ${validation.missing.join(', ')}`);
          return null;
        }

        console.log('✅ User profile loaded and validated');
        setUserProfile(transformedProfile);
        return transformedProfile;
        
      } else {
        const errorMsg = 'Please complete your matching profile first';
        setError(errorMsg);
        console.warn('❌ No matching profile found for user');
        return null;
      }
    } catch (err) {
      console.error('💥 Error loading user profile:', err);
      setError('Failed to load your profile');
      return null;
    }
  }, [user, getMatchingProfile]);

  /**
   * Load all active candidate profiles
   */
  const loadCandidates = useCallback(async () => {
    try {
      setError(null);
      console.log('🔍 Loading candidate profiles...');
      
      const result = await getActiveProfiles();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load profiles');
      }

      const rawCandidates = result.data || [];
      console.log(`📊 Found ${rawCandidates.length} raw profiles`);

      // Transform all profiles
      const transformedCandidates = transformProfilesForAlgorithm(rawCandidates);
      console.log(`🔄 Transformed ${transformedCandidates.length} profiles`);

      // Filter for matchable profiles
      const matchableCandidates = filterMatchableProfiles(transformedCandidates, {
        requireCompleted: true,
        requireActive: true,
        minValidationScore: 60
      });

      console.log(`✅ Found ${matchableCandidates.length} matchable candidates`);
      setCandidates(matchableCandidates);
      return matchableCandidates;

    } catch (err) {
      console.error('💥 Error loading candidates:', err);
      setError(err.message || 'Failed to load candidate profiles');
      return [];
    }
  }, [getActiveProfiles]);

  /**
   * Calculate detailed compatibility between user and a candidate
   */
  const calculateCompatibility = useCallback((candidate) => {
    if (!userProfile || !candidate) {
      console.warn('⚠️ Missing profile data for compatibility calculation');
      return null;
    }

    try {
      // Create enhanced profiles with location compatibility
      const enhancedUserProfile = {
        ...userProfile,
        calculateLocationCompatibility: enhancedLocationCompatibility
      };

      const enhancedCandidate = {
        ...candidate,
        calculateLocationCompatibility: enhancedLocationCompatibility
      };

      // Calculate detailed compatibility
      const compatibility = calculateDetailedCompatibility(enhancedUserProfile, enhancedCandidate);
      
      // Generate flags
      const flags = generateDetailedFlags(enhancedUserProfile, enhancedCandidate, compatibility.score_breakdown);
      
      // Get comprehensive summary
      const summary = getCompatibilitySummary(enhancedUserProfile, enhancedCandidate);

      return {
        matchScore: compatibility.compatibility_score,
        breakdown: compatibility.score_breakdown,
        greenFlags: flags.green || [],
        redFlags: flags.red || [],
        summary,
        compatibility,
        calculated_at: new Date().toISOString()
      };

    } catch (err) {
      console.error('💥 Error calculating compatibility:', err);
      return null;
    }
  }, [userProfile, enhancedLocationCompatibility]);

  /**
   * Find and rank matches based on compatibility
   */
  const findMatches = useCallback(async (filters = {}) => {
    const {
      minScore = 40,
      maxResults = 20,
      recoveryStage = null,
      ageRange = null,
      locationPreference = null
    } = filters;

    setLoading(true);
    setError(null);

    try {
      // Ensure we have user profile and candidates
      let currentUserProfile = userProfile;
      let currentCandidates = candidates;

      if (!currentUserProfile) {
        console.log('🔄 Loading user profile...');
        currentUserProfile = await loadUserProfile();
        if (!currentUserProfile) {
          throw new Error('Unable to load user profile');
        }
      }

      if (currentCandidates.length === 0) {
        console.log('🔄 Loading candidates...');
        currentCandidates = await loadCandidates();
      }

      console.log(`🎯 Finding matches from ${currentCandidates.length} candidates`);

      // Apply filters
      let filteredCandidates = currentCandidates;

      if (recoveryStage) {
        filteredCandidates = filteredCandidates.filter(c => 
          c.recovery_stage === recoveryStage
        );
      }

      if (ageRange) {
        const [minAge, maxAge] = ageRange.split('-').map(Number);
        filteredCandidates = filteredCandidates.filter(c => 
          c.age && c.age >= minAge && (maxAge ? c.age <= maxAge : true)
        );
      }

      if (locationPreference) {
        filteredCandidates = filteredCandidates.filter(c => 
          c.location && c.location.toLowerCase().includes(locationPreference.toLowerCase())
        );
      }

      console.log(`🔍 ${filteredCandidates.length} candidates after filtering`);

      // Calculate compatibility for each candidate
      const matchesWithScores = filteredCandidates
        .map(candidate => {
          const compatibilityData = calculateCompatibility(candidate);
          
          if (!compatibilityData) {
            console.warn(`⚠️ Failed to calculate compatibility for candidate ${candidate.user_id}`);
            return null;
          }

          return {
            ...candidate,
            ...compatibilityData
          };
        })
        .filter(match => match !== null);

      // Filter by minimum score and sort
      const qualifiedMatches = matchesWithScores
        .filter(match => match.matchScore >= minScore)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxResults);

      console.log(`✅ Found ${qualifiedMatches.length} qualified matches`);
      setMatches(qualifiedMatches);
      return qualifiedMatches;

    } catch (err) {
      console.error('💥 Error finding matches:', err);
      setError(err.message || 'Failed to find matches');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userProfile, candidates, loadUserProfile, loadCandidates, calculateCompatibility]);

  /**
   * Send a match request
   */
  const sendMatchRequest = useCallback(async (targetProfile, message = '') => {
    if (!user?.id || !targetProfile?.user_id) {
      throw new Error('Invalid user or target profile');
    }

    try {
      setError(null);
      console.log(`📤 Sending match request to ${targetProfile.user_id}`);

      // Calculate compatibility score for the request
      const compatibilityData = calculateCompatibility(targetProfile);
      const matchScore = compatibilityData?.matchScore || null;

      const result = await createMatchRequest(
        targetProfile.user_id,
        message,
        matchScore
      );

      if (result.success) {
        console.log('✅ Match request sent successfully');
        
        // Refresh match requests
        await loadMatchRequests();
        
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Failed to send match request');
      }

    } catch (err) {
      console.error('💥 Error sending match request:', err);
      setError(err.message || 'Failed to send match request');
      return { success: false, error: err.message };
    }
  }, [user, calculateCompatibility, createMatchRequest]);

  /**
   * Load user's match requests (sent and received)
   */
  const loadMatchRequests = useCallback(async () => {
    if (!user?.id) return [];

    try {
      setError(null);
      console.log('📋 Loading match requests...');

      const result = await getMatchRequests(user.id);

      if (result.success) {
        const requests = result.data || [];
        console.log(`📋 Loaded ${requests.length} match requests`);
        setMatchRequests(requests);
        return requests;
      } else {
        throw new Error(result.error || 'Failed to load match requests');
      }

    } catch (err) {
      console.error('💥 Error loading match requests:', err);
      setError(err.message || 'Failed to load match requests');
      return [];
    }
  }, [user, getMatchRequests]);

  /**
   * Get compatibility between any two profiles
   */
  const getProfileCompatibility = useCallback((profile1, profile2) => {
    if (!profile1 || !profile2) {
      return null;
    }

    // Transform profiles if they're raw database records
    const transformedProfile1 = profile1.user_id ? profile1 : transformProfileForAlgorithm(profile1);
    const transformedProfile2 = profile2.user_id ? profile2 : transformProfileForAlgorithm(profile2);

    try {
      const compatibility = calculateDetailedCompatibility(transformedProfile1, transformedProfile2);
      const flags = generateDetailedFlags(transformedProfile1, transformedProfile2, compatibility.score_breakdown);
      
      return {
        score: compatibility.compatibility_score,
        breakdown: compatibility.score_breakdown,
        greenFlags: flags.green || [],
        redFlags: flags.red || [],
        compatibility
      };
    } catch (err) {
      console.error('💥 Error calculating profile compatibility:', err);
      return null;
    }
  }, []);

  /**
   * Initialize the matching system
   */
  const initialize = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user available for matching initialization');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing matching system...');
      
      // Load user profile and candidates in parallel
      const [userProfileResult, candidatesResult] = await Promise.all([
        loadUserProfile(),
        loadCandidates()
      ]);

      const success = userProfileResult !== null && candidatesResult.length >= 0;
      
      if (success) {
        console.log('✅ Matching system initialized successfully');
        // Load match requests
        await loadMatchRequests();
      } else {
        console.log('❌ Matching system initialization failed');
      }

      return success;

    } catch (err) {
      console.error('💥 Error initializing matching system:', err);
      setError(err.message || 'Failed to initialize matching system');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadUserProfile, loadCandidates, loadMatchRequests]);

  // Auto-initialize when user changes
  useEffect(() => {
    if (user?.id) {
      initialize();
    } else {
      // Clear data when user logs out
      setUserProfile(null);
      setCandidates([]);
      setMatches([]);
      setMatchRequests([]);
      setError(null);
    }
  }, [user?.id]); // Only depend on user ID to avoid infinite loops

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    return await initialize();
  }, [initialize]);

  return {
    // State
    userProfile,
    candidates,
    matches,
    matchRequests,
    loading,
    error,

    // Core functions
    findMatches,
    sendMatchRequest,
    calculateCompatibility,
    getProfileCompatibility,

    // Data loading
    loadUserProfile,
    loadCandidates,
    loadMatchRequests,

    // Utility
    initialize,
    refresh,
    clearError,

    // Computed values
    isInitialized: userProfile !== null,
    hasMatches: matches.length > 0,
    candidateCount: candidates.length,
    pendingRequestCount: matchRequests.filter(r => r.status === 'pending').length
  };
};

/**
 * Simplified hook for just getting compatibility between two profiles
 */
export const useCompatibilityCalculation = () => {
  const calculateProfileCompatibility = useCallback((profile1, profile2) => {
    try {
      // Transform if needed
      const transformed1 = profile1.user_id ? profile1 : transformProfileForAlgorithm(profile1);
      const transformed2 = profile2.user_id ? profile2 : transformProfileForAlgorithm(profile2);

      if (!transformed1 || !transformed2) {
        return null;
      }

      const compatibility = calculateDetailedCompatibility(transformed1, transformed2);
      const flags = generateDetailedFlags(transformed1, transformed2, compatibility.score_breakdown);
      const summary = getCompatibilitySummary(transformed1, transformed2);

      return {
        score: compatibility.compatibility_score,
        breakdown: compatibility.score_breakdown,
        greenFlags: flags.green || [],
        redFlags: flags.red || [],
        summary,
        raw: compatibility
      };
    } catch (err) {
      console.error('💥 Compatibility calculation error:', err);
      return null;
    }
  }, []);

  return { calculateProfileCompatibility };
};

export default useMatching;
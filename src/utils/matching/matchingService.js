// src/utils/matching/matchingService.js

import { db } from '../supabase';
// Remove this line: import { useMatchingProfile } from '../../hooks/useSupabase';
import { calculateDetailedCompatibility } from './algorithm';
import { transformProfileForAlgorithm } from './dataTransform';
import { generateDetailedFlags } from './compatibility';
import { 
  COMPATIBILITY_WEIGHTS,
  MATCHING_THRESHOLDS,
  DEFAULT_FILTERS,
  meetsMinimumThreshold 
} from './config';

class MatchingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Get cache key for a user's matches
   */
  getCacheKey(userId, filters) {
    return `matches_${userId}_${JSON.stringify(filters)}`;
  }

  /**
   * Check if cached results are still valid
   */
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  /**
   * Transform database record to algorithm-compatible format
   */

  /**
   * Generate display-friendly compatibility information
   */
  generateDisplayInfo(userProfile, candidateProfile) {
    const compatibility = calculateDetailedCompatibility(userProfile, candidateProfile);
    const flags = generateDetailedFlags(userProfile, candidateProfile, compatibility.score_breakdown);
    
    return {
      matchScore: compatibility.compatibility_score,
      breakdown: compatibility.score_breakdown,
      greenFlags: flags.green || [],
      redFlags: flags.red || [],
      compatibility
    };
  }

/**
 * Load user's own matching profile
 */
async loadUserProfile(userId) {
  try {
    console.log('🔍 Loading user matching profile...');
    const result = await db.applicantForms.getByUserId(userId);
    
    // ✅ ADD DEBUGGING:
    console.log('🔍 Database result:', result);
    console.log('🔍 Result.data:', result.data);
    console.log('🔍 Has data check:', !result.hasError && result.hasData && result.data);
    
    if (!result.hasError && result.hasData && result.data) {
      const transformedProfile = transformProfileForAlgorithm(result.data);
      console.log('✅ User profile loaded:', transformedProfile);
      return transformedProfile;
    } else {
      throw new Error('Please complete your matching profile first');
    }
  } catch (err) {
    console.error('💥 Error loading user profile:', err);
    throw err;
  }
}

  /**
   * Load exclusions (users already connected or with pending requests)
   */
  async loadExcludedUsers(userId) {
    try {
      console.log('🚫 Loading excluded users...');
      
      const [requestsResult, groupsResult] = await Promise.all([
        db.matchRequests.getByUserId(userId),
        db.matchGroups ? db.matchGroups.getByUserId(userId) : { data: [] }
      ]);

      const excludedUserIds = new Set();

      // Exclude from match requests
      if (!requestsResult.hasError && requestsResult.hasData && requestsResult.data) {
        requestsResult.data.forEach(request => {
          if (request.request_type === 'roommate' || !request.request_type) {
            const otherUserId = request.requester_id === userId ? request.target_id : request.requester_id;
            
            if (['matched', 'approved'].includes(request.status)) {
              excludedUserIds.add(otherUserId);
              console.log(`🚫 Excluding user ${otherUserId} - active roommate connection (${request.status})`);
            }
          }
        });
      }

      // Exclude from active match groups
      if (groupsResult.data && Array.isArray(groupsResult.data)) {
        groupsResult.data.forEach(group => {
          if (['active', 'forming'].includes(group.status)) {
            [group.applicant_1_id, group.applicant_2_id, group.peer_support_id, group.landlord_id]
              .filter(id => id && id !== userId)
              .forEach(id => {
                excludedUserIds.add(id);
                console.log(`🚫 Excluding user ${id} - active match group member`);
              });
          }
        });
      }

      console.log(`🚫 Total excluded users: ${excludedUserIds.size}`);
      return excludedUserIds;

    } catch (err) {
      console.error('💥 Error loading excluded users:', err);
      return new Set(); // Return empty set on error
    }
  }

  /**
   * Load sent requests for UI feedback
   */
  async loadSentRequests(userId) {
    try {
      const result = await db.matchRequests.getByUserId(userId);
      
      if (!result.hasError && result.hasData && result.data) {
        const sentRequestIds = new Set(
          result.data
            .filter(req => 
              req.requester_id === userId && 
              (req.request_type === 'roommate' || !req.request_type) &&
              req.status === 'pending'
            )
            .map(req => req.target_id)
        );
        console.log(`📤 Found ${sentRequestIds.size} pending roommate requests sent`);
        return sentRequestIds;
      }
      return new Set();
    } catch (err) {
      console.error('💥 Error loading sent requests:', err);
      return new Set();
    }
  }

  /**
   * Find compatible matches for a user
   */
  async findMatches(userId, filters = {}) {
    try {
      const finalFilters = { ...DEFAULT_FILTERS, ...filters };
      const cacheKey = this.getCacheKey(userId, finalFilters);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        console.log('📦 Returning cached matches');
        return cached.data;
      }

      console.log('🔍 Finding fresh matches...');

      // Load user profile and exclusions in parallel
      const [userProfile, excludedUsers, sentRequests] = await Promise.all([
        this.loadUserProfile(userId),
        this.loadExcludedUsers(userId),
        this.loadSentRequests(userId)
      ]);

      // Get active profiles from database
      const result = await db.applicantForms.getActiveProfiles();

      if (result.hasError || !result.hasData) {
        throw new Error(result.error || 'Failed to load profiles');
      }

      let candidates = result.data || [];
      console.log(`📊 Found ${candidates.length} active profiles`);

      if (candidates.length === 0) {
        return {
          matches: [],
          userProfile,
          excludedCount: excludedUsers.size,
          sentRequestsCount: sentRequests.size
        };
      }

      // Transform candidates to algorithm format
      candidates = candidates
        .map(candidate => transformProfileForAlgorithm(candidate))
        .filter(candidate => candidate && candidate.profile_completed);

      console.log(`🔄 Transformed ${candidates.length} completed profiles`);

      // Apply exclusion filters
      if (finalFilters.hideAlreadyMatched) {
        const beforeExclusion = candidates.length;
        candidates = candidates.filter(candidate => {
          const isExcluded = excludedUsers.has(candidate.user_id);
          if (isExcluded) {
            console.log(`🚫 Hiding ${candidate.first_name} - already matched/connected`);
          }
          return !isExcluded;
        });
        console.log(`🚫 Excluded already matched: ${beforeExclusion} -> ${candidates.length}`);
      }

      if (finalFilters.hideRequestsSent) {
        const beforeExclusion = candidates.length;
        candidates = candidates.filter(candidate => {
          const isRequestSent = sentRequests.has(candidate.user_id);
          if (isRequestSent) {
            console.log(`📤 Hiding ${candidate.first_name} - request already sent`);
          }
          return !isRequestSent;
        });
        console.log(`📤 Excluded sent requests: ${beforeExclusion} -> ${candidates.length}`);
      }

      // Apply additional filters
      candidates = this.applyFilters(candidates, finalFilters);

      // Calculate compatibility scores
      const matchesWithScores = candidates.map(candidate => {
        const displayInfo = this.generateDisplayInfo(userProfile, candidate);
        
        return {
          ...candidate,
          ...displayInfo,
          isAlreadyMatched: excludedUsers.has(candidate.user_id),
          isRequestSent: sentRequests.has(candidate.user_id)
        };
      });

      // Filter by minimum score and sort
      const qualifiedMatches = matchesWithScores
        .filter(match => match.matchScore >= finalFilters.minScore)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, finalFilters.maxResults);

      console.log(`✅ Found ${qualifiedMatches.length} qualified matches`);

      const result_data = {
        matches: qualifiedMatches,
        userProfile,
        excludedCount: excludedUsers.size,
        sentRequestsCount: sentRequests.size
      };

      // Cache the results
      this.cache.set(cacheKey, {
        data: result_data,
        timestamp: Date.now()
      });

      return result_data;

    } catch (err) {
      console.error('💥 Error finding matches:', err);
      throw err;
    }
  }

  /**
   * Apply additional filters to candidates
   */
  applyFilters(candidates, filters) {
    let filtered = candidates;

    if (filters.recoveryStage) {
      filtered = filtered.filter(c => c.recovery_stage === filters.recoveryStage);
    }

    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
      filtered = filtered.filter(c => 
        c.age && c.age >= minAge && (maxAge ? c.age <= maxAge : true)
      );
    }

    if (filters.location && filters.location.trim()) {
      const searchLocation = filters.location.trim().toLowerCase();
      filtered = filtered.filter(c => 
        c.location && c.location.toLowerCase().includes(searchLocation)
      );
    }

    return filtered;
  }

  /**
   * Send a match request
   */
  async sendMatchRequest(currentUserId, targetMatch) {
    try {
      console.log('🤝 Sending roommate match request to:', targetMatch.first_name);
      
      const requestData = {
        requester_id: currentUserId,
        target_id: targetMatch.user_id,
        request_type: 'roommate',
        match_score: targetMatch.matchScore,
        message: `Hi ${targetMatch.first_name}! I think we could be great roommates based on our ${targetMatch.matchScore}% compatibility. Would you like to connect?`,
        status: 'pending'
      };
      
      const result = await db.matchRequests.create(requestData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send match request');
      }
      
      console.log('✅ Roommate match request sent successfully:', result.data);
      
      // Invalidate cache since sent requests have changed
      this.invalidateUserCache(currentUserId);
      
      return { success: true, data: result.data };
      
    } catch (err) {
      console.error('💥 Error sending match request:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Invalidate cached results for a user
   */
  invalidateUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`matches_${userId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for user ${userId}`);
  }

  /**
   * Clear all cached results
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cleared all matching cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (this.isCacheValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheTimeoutMinutes: this.cacheTimeout / (60 * 1000)
    };
  }
}

// Export singleton instance
export const matchingService = new MatchingService();

// Export individual methods for easier testing
export const {
  findMatches,
  sendMatchRequest,
  loadUserProfile,
  loadExcludedUsers,
  loadSentRequests,
  clearCache,
  getCacheStats
} = matchingService;

export default matchingService;
// src/utils/matching/matchingService.js
import { db } from '../supabase';
import { useMatchingProfile } from '../../hooks/useSupabase';
import { 
  calculateDetailedCompatibility,
  transformProfileForAlgorithm 
} from './dataTransform';
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
  transformProfileForAlgorithm(dbProfile) {
    if (!dbProfile) return null;

    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return {
      // Basic identifiers
      id: dbProfile.id,
      user_id: dbProfile.user_id,
      
      // Personal details
      age: calculateAge(dbProfile.date_of_birth),
      gender: dbProfile.gender,
      
      // Location - use preferred_city and preferred_state, or city as fallback
      location: (dbProfile.preferred_city && dbProfile.preferred_state) 
        ? `${dbProfile.preferred_city}, ${dbProfile.preferred_state}`
        : dbProfile.preferred_city || dbProfile.preferred_state || dbProfile.city || 'Not specified',
      
      // Budget
      budget_max: dbProfile.budget_max,
      price_range: {
        min: dbProfile.price_range_min || 0,
        max: dbProfile.price_range_max || dbProfile.budget_max || 5000
      },
      
      // Recovery info
      recovery_stage: dbProfile.recovery_stage,
      recovery_methods: dbProfile.recovery_methods || [],
      program_type: dbProfile.program_type || [],
      primary_issues: dbProfile.primary_issues || [],
      sobriety_date: dbProfile.sobriety_date,
      
      // Lifestyle
      cleanliness_level: dbProfile.cleanliness_level || 3,
      noise_level: dbProfile.noise_level || 3,
      social_level: dbProfile.social_level || 3,
      work_schedule: dbProfile.work_schedule,
      bedtime_preference: dbProfile.bedtime_preference,
      
      // Preferences
      preferred_roommate_gender: dbProfile.preferred_roommate_gender,
      gender_preference: dbProfile.gender_preference,
      smoking_status: dbProfile.smoking_status,
      smoking_preference: dbProfile.smoking_preference,
      
      // Housing
      housing_type: dbProfile.housing_type || [],
      housing_subsidy: dbProfile.housing_subsidy || [],
      
      // Social preferences
      pets_owned: dbProfile.pets_owned,
      pets_comfortable: dbProfile.pets_comfortable,
      overnight_guests_ok: dbProfile.overnight_guests_ok,
      shared_groceries: dbProfile.shared_groceries,
      guests_policy: dbProfile.guests_policy,
      
      // Personal
      interests: dbProfile.interests || [],
      spiritual_affiliation: dbProfile.spiritual_affiliation,
      about_me: dbProfile.about_me,
      looking_for: dbProfile.looking_for,
      
      // Profile metadata
      is_active: dbProfile.is_active,
      profile_completed: dbProfile.profile_completed,
      
      // Include registrant_profiles data if available
      first_name: dbProfile.registrant_profiles?.first_name || 'Anonymous',
      email: dbProfile.registrant_profiles?.email
    };
  }

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
      const { getMatchingProfile } = useMatchingProfile();
      const result = await getMatchingProfile(userId);
      
      if (result.success && result.data) {
        const transformedProfile = this.transformProfileForAlgorithm(result.data);
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
      if (requestsResult.success !== false && requestsResult.data) {
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
      
      if (result.success !== false && result.data) {
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
      const { getActiveProfiles } = useMatchingProfile();
      const result = await getActiveProfiles();
      
      if (!result.success) {
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
        .map(candidate => this.transformProfileForAlgorithm(candidate))
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
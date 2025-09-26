// src/utils/matching/config.js - PHASE 4 CORRECTED VERSION

/**
 * Matching Algorithm Configuration
 * Aligned with actual database schema and Phase 1-3 architecture
 * ✅ UPDATED: Uses correct field names and values from schema
 */

import { 
  RECOVERY_STAGES, 
  SPIRITUAL_AFFILIATIONS, 
  USER_ROLES,
  MATCHING
} from '../constants';

// ===== CORE COMPATIBILITY WEIGHTS =====
// ✅ UPDATED: Using MATCHING constants from constants.js for consistency
export const COMPATIBILITY_WEIGHTS = {
  // Core factors (70% total) - Deal breakers and primary compatibility
  location: MATCHING.WEIGHTS.CORE * 0.25,        // 17.5% - primary_city/primary_state
  budget: MATCHING.WEIGHTS.CORE * 0.25,          // 17.5% - budget_min/budget_max alignment
  recovery: MATCHING.WEIGHTS.CORE * 0.25,        // 17.5% - recovery_stage + recovery_methods
  lifestyle: MATCHING.WEIGHTS.CORE * 0.25,       // 17.5% - social_level + cleanliness_level + noise_tolerance
  
  // High factors (25% total) - Important compatibility
  gender: MATCHING.WEIGHTS.HIGH * 0.4,           // 10% - preferred_roommate_gender
  spiritual: MATCHING.WEIGHTS.HIGH * 0.3,        // 7.5% - spiritual_affiliation
  schedule: MATCHING.WEIGHTS.HIGH * 0.2,         // 5% - work_schedule compatibility
  housing_safety: MATCHING.WEIGHTS.HIGH * 0.1,   // 2.5% - smoking + pets
  
  // Medium factors (4% total) - Nice to have compatibility
  interests: MATCHING.WEIGHTS.MEDIUM * 0.5,      // 2% - interests overlap
  timing: MATCHING.WEIGHTS.MEDIUM * 0.3,         // 1.2% - move_in_date alignment
  goals: MATCHING.WEIGHTS.MEDIUM * 0.2,          // 0.8% - goals alignment
  
  // Low factors (1% total) - Bonus compatibility
  personality: MATCHING.WEIGHTS.LOW              // 1% - personality fit
};

// ===== MATCHING THRESHOLDS =====
// ✅ UPDATED: Using MATCHING constants for consistency
export const MATCHING_THRESHOLDS = {
  // Overall compatibility requirements
  MIN_OVERALL_SCORE: MATCHING.THRESHOLDS.MINIMUM,     // 50% minimum
  GOOD_MATCH_SCORE: MATCHING.THRESHOLDS.MODERATE,     // 70% for good match
  EXCELLENT_MATCH_SCORE: MATCHING.THRESHOLDS.GOOD,    // 80% for excellent match
  
  // Deal breaker thresholds (hard filters)
  DEAL_BREAKERS: {
    substance_free_mismatch: 0,        // Must respect substance-free requirements
    gender_preference_mismatch: 0,     // Must respect gender preferences
    budget_completely_incompatible: 0, // Budgets must have some overlap
    location_too_far: 0               // Must be in compatible locations
  },
  
  // Core factor minimums
  CORE_MINIMUMS: {
    location: 40,                     // 40% minimum location compatibility
    budget: 45,                       // 45% minimum budget compatibility
    recovery: 50,                     // 50% minimum recovery compatibility
    lifestyle: 35                     // 35% minimum lifestyle compatibility
  },
  
  // Recommended minimums for quality matches
  RECOMMENDED_MINIMUMS: {
    gender: 80,                       // Gender preferences should be respected
    spiritual: 60,                    // Spiritual compatibility helpful
    schedule: 40,                     // Some schedule flexibility possible
    housing_safety: 50               // Safety factors important
  }
};

// ===== SCORING CONFIGURATION =====
export const SCORING_CONFIG = {
  // ✅ UPDATED: Lifestyle scales (1-5 from schema)
  LIFESTYLE_SCALES: {
    PERFECT_MATCH: 100,               // Same level (e.g., both 3)
    ONE_LEVEL_DIFF: 75,              // One level apart (e.g., 3 vs 4)
    TWO_LEVEL_DIFF: 50,              // Two levels apart (e.g., 3 vs 5)
    THREE_LEVEL_DIFF: 25,            // Three levels apart (e.g., 2 vs 5)
    FOUR_LEVEL_DIFF: 0               // Maximum difference (e.g., 1 vs 5)
  },

  // ✅ UPDATED: Recovery compatibility using actual schema values
  RECOVERY: {
    STAGE_COMPATIBILITY: {
      SAME_STAGE: 100,                // Same recovery_stage
      ADJACENT_STAGES: 80,            // Compatible stages (early -> stable)
      DISTANT_STAGES: 50,             // Distant but workable
      INCOMPATIBLE_STAGES: 25         // Very different stages
    },
    METHODS_OVERLAP: {
      HIGH_OVERLAP: 100,              // 75%+ recovery_methods in common
      MODERATE_OVERLAP: 80,           // 50-74% methods in common
      SOME_OVERLAP: 60,               // 25-49% methods in common
      LOW_OVERLAP: 40,                // 1-24% methods in common
      NO_OVERLAP: 20                  // No methods in common but not disqualifying
    },
    ISSUES_COMPATIBILITY: {
      SHARED_PRIMARY_ISSUES: 100,     // Same primary_issues
      COMPATIBLE_ISSUES: 80,          // Different but supportive
      NEUTRAL_ISSUES: 60,             // No conflict
      CONFLICTING_ISSUES: 30          // Potentially problematic
    }
  },

  // ✅ UPDATED: Budget compatibility using schema fields
  BUDGET: {
    OVERLAP_SCORING: {
      LARGE_OVERLAP: 100,             // Budgets overlap significantly
      MODERATE_OVERLAP: 80,           // Some budget overlap
      SMALL_OVERLAP: 60,              // Minimal overlap
      ADJACENT_NO_OVERLAP: 40,        // Close but no overlap
      NO_OVERLAP: 0                   // No budget compatibility
    },
    MAX_ACCEPTABLE_GAP: 300,          // $300 max gap for good compatibility
    PENALTY_PER_100: 5               // 5 point penalty per $100 gap
  },

  // ✅ UPDATED: Location compatibility using schema fields
  LOCATION: {
    SAME_CITY_STATE: 100,            // Same primary_city and primary_state
    SAME_CITY: 100,                  // Same primary_city
    NEARBY_CITIES: 80,               // Same state, nearby cities
    SAME_STATE: 60,                  // Same primary_state, different cities
    NEARBY_STATES: 40,               // Adjacent states
    DIFFERENT_REGIONS: 20            // Different regions
  },

  // ✅ UPDATED: Gender preference compatibility
  GENDER_PREFERENCES: {
    MUTUAL_MATCH: 100,               // Both users' preferred_roommate_gender satisfied
    ONE_WAY_MATCH: 50,               // Only one preference satisfied
    NO_MATCH: 0,                     // Neither preference satisfied
    INCLUSIVE_BONUS: 10              // Bonus for gender_inclusive users
  },

  // Schedule compatibility
  SCHEDULE: {
    COMPATIBLE_SCHEDULES: {
      SAME_SCHEDULE: 100,
      COMPLEMENTARY: 80,             // Different but compatible
      FLEXIBLE: 70,                  // Some flexibility possible
      CONFLICTING: 30                // Likely scheduling conflicts
    }
  },

  // ✅ UPDATED: Spiritual compatibility using correct affiliations
  SPIRITUAL: {
    EXACT_MATCH: 100,                // Same spiritual_affiliation
    COMPATIBLE_GROUPS: 85,           // Compatible spiritual groups
    NEUTRAL_COMPATIBILITY: 70,       // No conflict
    SOME_TENSION: 50,                // Some potential issues
    MAJOR_INCOMPATIBILITY: 25        // Likely conflicts
  },

  // Age compatibility (calculated from date_of_birth)
  AGE: {
    SAME_AGE: 100,
    WITHIN_2_YEARS: 95,
    WITHIN_5_YEARS: 85,
    WITHIN_10_YEARS: 70,
    WITHIN_15_YEARS: 55,
    OVER_15_YEARS: 40
  },

  // Smoking compatibility
  SMOKING: {
    BOTH_NON_SMOKERS: 100,
    COMPATIBLE_SMOKING: 80,          // Both smoke or both don't mind
    NEUTRAL: 60,                     // One smokes outside only
    INCOMPATIBLE: 20                 // Non-smoker with indoor smoker
  },

  // Pet compatibility
  PETS: {
    BOTH_HAVE_PETS: 100,
    BOTH_PET_FREE: 100,
    ONE_HAS_COMPATIBLE: 80,          // One has pets, other is comfortable
    ONE_HAS_NEUTRAL: 60,             // One has pets, other is neutral
    INCOMPATIBLE: 0                  // Pet allergies or strong preferences
  }
};

// ===== DEAL BREAKER CONFIGURATION =====
// ✅ UPDATED: Based on actual schema fields
export const DEAL_BREAKER_CONFIG = {
  // Hard exclusions (completely prevent matching)
  ABSOLUTE_DEAL_BREAKERS: [
    {
      field: 'substance_free_home_required',
      check: (user, candidate) => {
        return user.substance_free_home_required && !candidate.substance_free_home_required;
      }
    },
    {
      field: 'preferred_roommate_gender',
      check: (user, candidate) => {
        // Check if gender preferences are incompatible
        if (user.preferred_roommate_gender === 'any' || candidate.preferred_roommate_gender === 'any') {
          return false; // 'any' is compatible with everything
        }
        // More complex gender compatibility logic would go here
        return false; // Simplified for now
      }
    }
  ],

  // Strong preferences (major impact on scoring)
  STRONG_PREFERENCES: [
    'deal_breaker_pets',
    'deal_breaker_smoking',
    'deal_breaker_financial_issues'
  ],

  // Moderate preferences (moderate impact on scoring)
  MODERATE_PREFERENCES: [
    'deal_breaker_loudness',
    'deal_breaker_uncleanliness'
  ],

  // Scoring penalties
  ABSOLUTE_PENALTY: 0,              // Complete exclusion
  STRONG_PENALTY: -30,              // Major penalty
  MODERATE_PENALTY: -15             // Moderate penalty
};

// ===== DEFAULT FILTERS =====
export const DEFAULT_FILTERS = {
  minScore: 50,                     // Minimum compatibility score
  maxResults: 20,                   // Maximum results to return
  hideAlreadyMatched: true,         // Hide users with existing connections
  hideRequestsSent: true,           // Hide users with pending requests
  
  // Available filter options
  RECOVERY_STAGES: Object.values(RECOVERY_STAGES),
  SPIRITUAL_AFFILIATIONS: SPIRITUAL_AFFILIATIONS,
  AGE_RANGES: [
    { min: 18, max: 25, label: '18-25' },
    { min: 26, max: 35, label: '26-35' },
    { min: 36, max: 45, label: '36-45' },
    { min: 46, max: 55, label: '46-55' },
    { min: 56, max: 65, label: '56-65' },
    { min: 66, max: 100, label: '65+' }
  ],
  BUDGET_RANGES: [
    { min: 0, max: 500, label: 'Under $500' },
    { min: 500, max: 800, label: '$500-$800' },
    { min: 800, max: 1200, label: '$800-$1,200' },
    { min: 1200, max: 1600, label: '$1,200-$1,600' },
    { min: 1600, max: 2000, label: '$1,600-$2,000' },
    { min: 2000, max: 5000, label: 'Over $2,000' }
  ],
  MIN_SCORES: [30, 40, 50, 60, 70, 80]
};

// ===== FLAG THRESHOLDS =====
export const RED_FLAG_THRESHOLDS = {
  overall: 45,                      // Overall compatibility below 45%
  location: 35,                     // Location compatibility concerns
  budget: 40,                       // Budget compatibility concerns
  recovery: 45,                     // Recovery compatibility concerns
  lifestyle: 35,                    // Lifestyle compatibility concerns
  gender: 50,                       // Gender preference concerns
  spiritual: 40                     // Spiritual compatibility concerns
};

export const GREEN_FLAG_THRESHOLDS = {
  overall: 80,                      // Overall compatibility above 80%
  location: 85,                     // Excellent location compatibility
  budget: 85,                       // Excellent budget compatibility
  recovery: 85,                     // Excellent recovery compatibility
  lifestyle: 80,                    // Great lifestyle compatibility
  gender: 100,                      // Perfect gender compatibility
  spiritual: 85,                    // Great spiritual compatibility
  interests: 70                     // Good shared interests
};

// ===== COMPATIBILITY GROUPS =====
// ✅ UPDATED: Using actual values from constants and schema
export const COMPATIBILITY_GROUPS = {
  SPIRITUAL: {
    CHRISTIAN: ['Christian', 'Catholic'],
    SPIRITUAL: ['Spiritual (non-religious)', 'Other'],
    NON_RELIGIOUS: ['Agnostic', 'Atheist'],
    RELIGIOUS: ['Jewish', 'Islamic', 'Buddhist', 'Hindu'],
    FLEXIBLE: ['Prefer not to say']
  },
  
  RECOVERY_STAGES: {
    EARLY: ['early'],
    STABLE: ['stable', 'maintained'],
    LONG_TERM: ['long-term']
  },
  
  // Recovery methods would be grouped here based on actual schema values
  RECOVERY_METHODS: {
    TWELVE_STEP: ['AA (Alcoholics Anonymous)', 'NA (Narcotics Anonymous)'],
    SECULAR: ['SMART Recovery', 'Secular recovery'],
    FAITH_BASED: ['Celebrate Recovery', 'Faith-based program'],
    PROFESSIONAL: ['Outpatient therapy', 'Intensive outpatient (IOP)'],
    HOLISTIC: ['Meditation/Spirituality']
  }
};

// ===== VALIDATION CONFIGURATION =====
export const VALIDATION_CONFIG = {
  // ✅ UPDATED: Required fields from actual schema
  REQUIRED_FIELDS: [
    'user_id',
    'primary_city',
    'primary_state', 
    'budget_min',
    'budget_max',
    'preferred_roommate_gender',
    'recovery_stage',
    'recovery_methods',
    'primary_issues',
    'spiritual_affiliation',
    'social_level',
    'cleanliness_level',
    'noise_tolerance',
    'work_schedule',
    'move_in_date',
    'about_me',
    'looking_for'
  ],
  
  RECOMMENDED_FIELDS: [
    'date_of_birth',
    'substance_free_home_required',
    'interests',
    'important_qualities',
    'housing_types_accepted'
  ],
  
  // Scoring
  MIN_VALIDATION_SCORE: 75,         // 75% of required fields must be complete
  MISSING_REQUIRED_PENALTY: 15,     // 15 points per missing required field
  MISSING_RECOMMENDED_PENALTY: 3    // 3 points per missing recommended field
};

// ===== PERFORMANCE CONFIGURATION =====
export const PERFORMANCE_CONFIG = {
  MAX_BATCH_SIZE: 50,               // Process up to 50 profiles at once
  CACHE_DURATION_MINUTES: 15,       // Cache results for 15 minutes
  MAX_CALCULATION_TIME: 5000,       // 5 second timeout
  MAX_PROFILES_TO_PROCESS: 200,     // Maximum profiles to consider
  TIMEOUT_WARNING_THRESHOLD: 3000,  // Warn if taking over 3 seconds
  
  // Quality settings
  ENABLE_DETAILED_INSIGHTS: true,   // Generate detailed match explanations
  USE_PARALLEL_PROCESSING: false,   // Keep simple for now
  SKIP_OBVIOUS_MISMATCHES: true     // Skip clearly incompatible profiles early
};

// ===== HELPER FUNCTIONS =====

/**
 * Validate that weights add up to 100%
 */
export const validateWeights = () => {
  const total = Object.values(COMPATIBILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const isValid = Math.abs(total - 100) < 0.1; // Allow small floating point differences
  
  if (!isValid) {
    console.warn(`⚠️ Compatibility weights total ${total.toFixed(1)}%, should be 100%`);
  }
  
  return isValid;
};

/**
 * Get weight for compatibility category
 */
export const getWeight = (category) => {
  return COMPATIBILITY_WEIGHTS[category] || 0;
};

/**
 * Check if score meets minimum threshold
 */
export const meetsMinimumThreshold = (category, score) => {
  const threshold = MATCHING_THRESHOLDS.CORE_MINIMUMS[category] || 
                   MATCHING_THRESHOLDS.RECOMMENDED_MINIMUMS[category];
  return !threshold || score >= threshold;
};

/**
 * Check for red flags
 */
export const shouldGenerateRedFlag = (category, score) => {
  const threshold = RED_FLAG_THRESHOLDS[category];
  return threshold && score < threshold;
};

/**
 * Check for green flags
 */
export const shouldGenerateGreenFlag = (category, score) => {
  const threshold = GREEN_FLAG_THRESHOLDS[category];
  return threshold && score >= threshold;
};

/**
 * Get spiritual compatibility group
 */
export const getSpiritualCompatibilityGroup = (affiliation) => {
  const groups = COMPATIBILITY_GROUPS.SPIRITUAL;
  for (const [groupName, affiliations] of Object.entries(groups)) {
    if (affiliations.includes(affiliation)) {
      return groupName;
    }
  }
  return 'OTHER';
};

/**
 * Check for absolute deal breakers
 */
export const hasAbsoluteDealBreakers = (userProfile, candidateProfile) => {
  return DEAL_BREAKER_CONFIG.ABSOLUTE_DEAL_BREAKERS.some(dealBreaker => {
    return dealBreaker.check(userProfile, candidateProfile);
  });
};

/**
 * Calculate age from date_of_birth
 */
export const calculateAge = (dateOfBirth) => {
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

/**
 * Get configuration summary
 */
export const getConfigSummary = () => {
  return {
    version: '1.0',
    weightsValid: validateWeights(),
    totalWeight: Object.values(COMPATIBILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0),
    categories: Object.keys(COMPATIBILITY_WEIGHTS),
    coreMinimums: MATCHING_THRESHOLDS.CORE_MINIMUMS,
    dealBreakerCount: DEAL_BREAKER_CONFIG.ABSOLUTE_DEAL_BREAKERS.length,
    performanceSettings: {
      maxBatchSize: PERFORMANCE_CONFIG.MAX_BATCH_SIZE,
      timeout: PERFORMANCE_CONFIG.MAX_CALCULATION_TIME,
      cacheMinutes: PERFORMANCE_CONFIG.CACHE_DURATION_MINUTES
    }
  };
};

// Validate configuration on import
validateWeights();

// Export default configuration
export default {
  COMPATIBILITY_WEIGHTS,
  MATCHING_THRESHOLDS,
  SCORING_CONFIG,
  DEAL_BREAKER_CONFIG,
  DEFAULT_FILTERS,
  RED_FLAG_THRESHOLDS,
  GREEN_FLAG_THRESHOLDS,
  COMPATIBILITY_GROUPS,
  VALIDATION_CONFIG,
  PERFORMANCE_CONFIG,
  
  // Helper functions
  validateWeights,
  getWeight,
  meetsMinimumThreshold,
  shouldGenerateRedFlag,
  shouldGenerateGreenFlag,
  getSpiritualCompatibilityGroup,
  hasAbsoluteDealBreakers,
  calculateAge,
  getConfigSummary
};
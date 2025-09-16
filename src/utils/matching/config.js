// src/utils/matching/config.js
/**
 * Matching Algorithm Configuration
 * Centralized place to modify weights and thresholds for the matching system
 */

// ===== COMPATIBILITY WEIGHTS =====
// These weights determine how much each factor contributes to the overall match score
// Total should add up to 100 for easy percentage calculations
export const COMPATIBILITY_WEIGHTS = {
  location: 20,      // Geographic compatibility - HIGH PRIORITY
  lifestyle: 20,     // Cleanliness, noise, social levels - HIGH PRIORITY  
  recovery: 18,      // Recovery stage and methods - HIGH PRIORITY
  budget: 15,        // Budget compatibility - IMPORTANT
  gender: 10,        // Gender preferences - IMPORTANT
  age: 6,           // Age compatibility - MODERATE
  spiritual: 5,      // Spiritual alignment - LOW PRIORITY
  preferences: 4,    // Living preferences (pets, guests, etc) - LOW PRIORITY
  interests: 2,      // Shared interests - NICE TO HAVE
  housing: 1         // Housing subsidy match - MINIMAL
};

// ===== MINIMUM THRESHOLDS =====
export const MATCHING_THRESHOLDS = {
  // Minimum overall compatibility score to show a match
  MIN_OVERALL_SCORE: 30,
  
  // Individual category minimums (0 = complete incompatibility)
  HARD_FILTERS: {
    gender: 0,  // Gender incompatibility is a hard filter
  },
  
  // Recommended minimums for good matches
  RECOMMENDED_MINIMUMS: {
    recovery: 40,
    lifestyle: 35,
    location: 30,
    budget: 40
  }
};

// ===== SCORING PARAMETERS =====
export const SCORING_CONFIG = {
  // Age compatibility scoring
  AGE: {
    PERFECT_MATCH: 0,          // Exact same age
    EXCELLENT_DIFF: 3,         // Within 3 years
    GOOD_DIFF: 6,              // Within 6 years  
    FAIR_DIFF: 10,             // Within 10 years
    POOR_DIFF: 15,             // Within 15 years
    SCORES: {
      PERFECT: 100,
      EXCELLENT: 90,
      GOOD: 75,
      FAIR: 60,
      POOR: 45,
      VERY_POOR: 30
    }
  },

  // Budget compatibility scoring
  BUDGET: {
    SCORE_REDUCTION_PER_50: 2,  // Reduce score by 2 points for every $50 difference
    MIN_SCORE: 0
  },

  // Lifestyle scale differences (1-5 scales)
  LIFESTYLE: {
    POINTS_PER_LEVEL: 25,       // 25 points reduction per level difference
    MIN_SCORE: 0
  },

  // Recovery stage compatibility
  RECOVERY_STAGE: {
    SAME_STAGE: 100,
    ADJACENT_STAGES: 80,        // One stage apart
    TWO_STAGES: 60,             // Two stages apart  
    THREE_STAGES: 40            // Three stages apart
  },

  // Location compatibility
  LOCATION: {
    EXACT_MATCH: 100,
    CONTAINS_MATCH: 85,         // One location contains the other
    SAME_STATE: 60,             // Same state, different cities
    DIFFERENT_LOCATIONS: 30     // Completely different
  },

  // Smoking compatibility matrix
  SMOKING: {
    SAME_STATUS: 100,
    COMPATIBILITY_MATRIX: {
      'non_smoker': { 'outdoor_only': 70, 'occasional': 40, 'regular': 20 },
      'outdoor_only': { 'non_smoker': 70, 'occasional': 80, 'regular': 60 },
      'occasional': { 'non_smoker': 40, 'outdoor_only': 80, 'regular': 70 },
      'regular': { 'non_smoker': 20, 'outdoor_only': 60, 'occasional': 70 }
    }
  },

  // Spiritual compatibility
  SPIRITUAL: {
    EXACT_MATCH: 100,
    SAME_GROUP: 90,             // e.g., different Christian denominations
    MODERATE_COMPATIBILITY: 70,  // e.g., spiritual-not-religious
    NEUTRAL: 65,                // e.g., one party is "other"
    LOW_COMPATIBILITY: 35       // e.g., very different worldviews
  }
};

// ===== FILTER DEFAULTS =====
export const DEFAULT_FILTERS = {
  minScore: 50,                 // Default minimum compatibility score
  hideAlreadyMatched: true,     // Default to hiding already connected users
  hideRequestsSent: true,       // Default to hiding users with pending requests
  maxResults: 20,               // Default maximum number of results
  
  // Available filter options
  RECOVERY_STAGES: ['early', 'stabilizing', 'stable', 'long-term'],
  AGE_RANGES: ['18-25', '26-35', '36-45', '46-65'],
  MIN_SCORES: [30, 40, 50, 60, 70, 80]
};

// ===== RED FLAG THRESHOLDS =====
// Scores below these thresholds will generate red flags
export const RED_FLAG_THRESHOLDS = {
  overall: 40,                  // Overall compatibility below 40%
  lifestyle: 40,                // Lifestyle compatibility below 40%
  recovery: 50,                 // Recovery compatibility below 50%
  budget: 50,                   // Budget compatibility below 50%
  spiritual: 40,                // Spiritual compatibility below 40%
  age: 45,                      // Age compatibility below 45%
  location: 30                  // Location compatibility below 30%
};

// ===== GREEN FLAG THRESHOLDS =====  
// Scores above these thresholds will generate green flags
export const GREEN_FLAG_THRESHOLDS = {
  overall: 80,                  // Overall compatibility above 80%
  lifestyle: 85,                // Lifestyle compatibility above 85%
  recovery: 85,                 // Recovery compatibility above 85%
  budget: 90,                   // Budget compatibility above 90%
  spiritual: 90,                // Spiritual compatibility above 90%
  age: 90,                      // Age compatibility above 90%
  location: 95,                 // Location compatibility above 95%
  interests: 70                 // Interest overlap above 70%
};

// ===== COMPATIBILITY GROUPS =====
// Used for determining spiritual and other group-based compatibility
export const COMPATIBILITY_GROUPS = {
  SPIRITUAL: {
    CHRISTIAN: ['christian-protestant', 'christian-catholic'],
    SPIRITUAL_NOT_RELIGIOUS: ['spiritual-not-religious', 'agnostic'],
    NON_RELIGIOUS: ['agnostic', 'atheist'],
    MAJOR_RELIGIONS: ['muslim', 'jewish', 'buddhist']
  },
  
  RECOVERY_METHODS: {
    TWELVE_STEP: ['12-step', 'AA (Alcoholics Anonymous)', 'NA (Narcotics Anonymous)'],
    SECULAR: ['SMART Recovery', 'Secular recovery', 'LifeRing'],
    FAITH_BASED: ['Celebrate Recovery', 'Faith-based program'],
    PROFESSIONAL: ['clinical-therapy', 'Outpatient therapy', 'Intensive outpatient (IOP)']
  }
};

// ===== VALIDATION RULES =====
export const VALIDATION_CONFIG = {
  // Minimum data required for matching
  REQUIRED_FIELDS: ['user_id', 'recovery_stage', 'budget_max'],
  
  // Recommended fields for good matching
  RECOMMENDED_FIELDS: [
    'age', 'gender', 'cleanliness_level', 'noise_level', 
    'social_level', 'smoking_status', 'interests'
  ],
  
  // Minimum validation score to include in matching
  MIN_VALIDATION_SCORE: 70,
  
  // Points deducted for missing fields
  MISSING_REQUIRED_PENALTY: 25,
  MISSING_RECOMMENDED_PENALTY: 5
};

// ===== ALGORITHM PERFORMANCE =====
export const PERFORMANCE_CONFIG = {
  // Maximum number of profiles to process at once
  MAX_BATCH_SIZE: 100,
  
  // Cache compatibility calculations for this many minutes
  CACHE_DURATION_MINUTES: 15,
  
  // Maximum time to spend on matching calculation (milliseconds)
  MAX_CALCULATION_TIME: 5000
};

// ===== HELPER FUNCTIONS =====

/**
 * Validate that weights add up to 100
 */
export const validateWeights = () => {
  const total = Object.values(COMPATIBILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  if (total !== 100) {
    console.warn(`⚠️ Compatibility weights total ${total}%, should be 100%`);
  }
  return total === 100;
};

/**
 * Get weight for a specific compatibility category
 */
export const getWeight = (category) => {
  return COMPATIBILITY_WEIGHTS[category] || 0;
};

/**
 * Check if a score meets the minimum threshold for a category
 */
export const meetsMinimumThreshold = (category, score) => {
  const threshold = MATCHING_THRESHOLDS.RECOMMENDED_MINIMUMS[category];
  return !threshold || score >= threshold;
};

/**
 * Determine if a score should generate a red flag
 */
export const shouldGenerateRedFlag = (category, score) => {
  const threshold = RED_FLAG_THRESHOLDS[category];
  return threshold && score < threshold;
};

/**
 * Determine if a score should generate a green flag
 */
export const shouldGenerateGreenFlag = (category, score) => {
  const threshold = GREEN_FLAG_THRESHOLDS[category];
  return threshold && score >= threshold;
};

/**
 * Get compatibility group for spiritual affiliation
 */
export const getSpiritualCompatibilityGroup = (affiliation) => {
  for (const [groupName, affiliations] of Object.entries(COMPATIBILITY_GROUPS.SPIRITUAL)) {
    if (affiliations.includes(affiliation)) {
      return groupName;
    }
  }
  return 'OTHER';
};

/**
 * Export configuration summary for debugging
 */
export const getConfigSummary = () => {
  return {
    weightsValid: validateWeights(),
    totalWeight: Object.values(COMPATIBILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0),
    categories: Object.keys(COMPATIBILITY_WEIGHTS),
    thresholds: MATCHING_THRESHOLDS,
    redFlagThresholds: RED_FLAG_THRESHOLDS,
    greenFlagThresholds: GREEN_FLAG_THRESHOLDS
  };
};

// Validate configuration on import
validateWeights();

export default {
  COMPATIBILITY_WEIGHTS,
  MATCHING_THRESHOLDS,
  SCORING_CONFIG,
  DEFAULT_FILTERS,
  RED_FLAG_THRESHOLDS,
  GREEN_FLAG_THRESHOLDS,
  COMPATIBILITY_GROUPS,
  VALIDATION_CONFIG,
  PERFORMANCE_CONFIG,
  getWeight,
  meetsMinimumThreshold,
  shouldGenerateRedFlag,
  shouldGenerateGreenFlag,
  getSpiritualCompatibilityGroup,
  getConfigSummary
};
// src/utils/matching/config.js - ENHANCED WITH COMPLETE PRIORITY MATRIX INTEGRATION

/**
 * ✅ ENHANCED: Matching Algorithm Configuration v2.0
 * Centralized configuration aligned with Master Data Mapping Table priority matrix
 * Implements Core → High → Medium → Low factor weighting system
 */

// ===== ENHANCED COMPATIBILITY WEIGHTS =====
// ✅ UPDATED: Based on Master Data Mapping Table priority matrix
// Core (70%) + High (25%) + Medium (4%) + Low (1%) = 100%
export const ENHANCED_COMPATIBILITY_WEIGHTS = {
  // 🔴 CORE FACTORS (Primary Matching) - 70% total weight
  location: 20,                    // primary_city/primary_state compatibility - PRIMARY MATCH FACTOR
  budget: 18,                      // budget_min/budget_max alignment - PRIMARY MATCH FACTOR  
  recovery_core: 16,               // recovery_stage + recovery_methods + primary_issues - PRIMARY MATCH FACTOR
  lifestyle_core: 16,              // social_level + cleanliness_level + noise_tolerance - PRIMARY MATCH FACTOR
  
  // 🟡 HIGH FACTORS (Secondary Matching) - 25% total weight
  recovery_environment: 8,         // substance_free_home_required + spiritual_affiliation - COMPATIBILITY FACTOR
  gender_preferences: 6,           // preferred_roommate_gender compatibility - HIGH FACTOR
  schedule_compatibility: 4,       // bedtime_preference + work_schedule - HIGH FACTOR
  communication_style: 4,          // conflict_resolution_style + communication_style - HIGH FACTOR
  housing_safety: 3,              // smoking_status + pets compatibility - HIGH FACTOR
  
  // 🟢 MEDIUM FACTORS (Compatibility Enhancement) - 4% total weight
  shared_interests: 2,            // interests + important_qualities alignment - MEDIUM FACTOR
  timing_flexibility: 1,          // move_in_date + timing compatibility - MEDIUM FACTOR
  goals_alignment: 1,             // short_term_goals + long_term_vision - MEDIUM FACTOR
  
  // ⚪ LOW FACTORS (Nice-to-Have) - 1% total weight
  extended_compatibility: 1       // additional_interests + profile personality - LOW FACTOR
};

// ===== LEGACY COMPATIBILITY WEIGHTS =====
// Maintained for backwards compatibility with existing code
export const COMPATIBILITY_WEIGHTS = {
  location: 20,
  lifestyle: 20,     
  recovery: 18,      
  budget: 15,        
  gender: 10,        
  age: 6,           
  spiritual: 5,      
  preferences: 4,    
  interests: 2,      
  housing: 1         
};

// ===== ENHANCED MINIMUM THRESHOLDS =====
export const ENHANCED_MATCHING_THRESHOLDS = {
  // Overall compatibility requirements
  MIN_OVERALL_SCORE: 40,                    // Minimum overall score to show a match
  GOOD_MATCH_SCORE: 65,                     // Score for "good" compatibility level
  EXCELLENT_MATCH_SCORE: 85,                // Score for "excellent" compatibility level
  
  // ✅ NEW: Priority-based minimums
  PRIORITY_MINIMUMS: {
    core_factors: 50,                       // Core factors must meet 50% minimum
    high_factors: 40,                       // High factors should meet 40% minimum
    medium_factors: 30,                     // Medium factors nice to have 30%+
    low_factors: 20                         // Low factors minimal impact
  },
  
  // Hard exclusions (0 = complete incompatibility)
  HARD_FILTERS: {
    gender_preferences: 0,                  // Gender incompatibility is absolute
    deal_breaker_substance_use: 0,          // Substance use deal breakers
    deal_breaker_pets: 0,                   // Pet deal breakers
    deal_breaker_smoking: 0,                // Smoking deal breakers
    deal_breaker_financial_issues: 0        // Financial reliability deal breakers
  },
  
  // ✅ ENHANCED: Core factor minimums (based on priority)
  CORE_FACTOR_MINIMUMS: {
    location: 40,                           // Must have reasonable location compatibility
    budget: 50,                             // Budget must be somewhat aligned
    recovery_core: 45,                      // Recovery compatibility is critical
    lifestyle_core: 35                      // Lifestyle differences can be worked out
  },
  
  // High factor recommended minimums
  HIGH_FACTOR_MINIMUMS: {
    recovery_environment: 60,               // Recovery environment very important
    gender_preferences: 100,                // Gender preferences must be respected (hard filter)
    schedule_compatibility: 35,             // Some schedule flexibility possible
    communication_style: 40,               // Communication important for success
    housing_safety: 50                     // Safety factors important
  }
};

// ===== LEGACY THRESHOLDS (for compatibility) =====
export const MATCHING_THRESHOLDS = {
  MIN_OVERALL_SCORE: 30,
  HARD_FILTERS: {
    gender: 0
  },
  RECOMMENDED_MINIMUMS: {
    recovery: 40,
    lifestyle: 35,
    location: 30,
    budget: 40
  }
};

// ===== ENHANCED SCORING PARAMETERS =====
export const ENHANCED_SCORING_CONFIG = {
  // ✅ ENHANCED: Lifestyle scales (1-5) scoring
  LIFESTYLE_SCALES: {
    POINTS_PER_LEVEL: 25,                   // 25 points reduction per level difference
    PERFECT_MATCH: 100,                     // Same level
    ONE_LEVEL_DIFF: 75,                     // Adjacent levels  
    TWO_LEVEL_DIFF: 50,                     // Two levels apart
    THREE_LEVEL_DIFF: 25,                   // Three levels apart
    FOUR_LEVEL_DIFF: 0                      // Maximum difference (1 vs 5)
  },

  // ✅ ENHANCED: Recovery compatibility scoring
  RECOVERY: {
    STAGE_COMPATIBILITY: {
      SAME_STAGE: 100,
      ADJACENT_STAGES: 80,                  // One stage apart (e.g., early → stabilizing)
      TWO_STAGES: 60,                       // Two stages apart (e.g., early → stable)
      THREE_STAGES: 40                      // Three stages apart (e.g., early → long-term)
    },
    METHODS_OVERLAP: {
      HIGH_OVERLAP: 100,                    // 80%+ methods in common
      MODERATE_OVERLAP: 75,                 // 50-79% methods in common
      SOME_OVERLAP: 50,                     // 25-49% methods in common
      LOW_OVERLAP: 25,                      // 1-24% methods in common
      NO_OVERLAP: 0                         // No methods in common
    },
    ISSUES_COMPATIBILITY: {
      SHARED_ISSUES: 100,                   // Understanding through shared experience
      DIFFERENT_ISSUES: 75,                 // Different but complementary support
      CONFLICTING_ISSUES: 25                // Potentially conflicting issues
    }
  },

  // ✅ ENHANCED: Budget compatibility with standardized fields
  BUDGET: {
    EXACT_MATCH: 100,                       // Same budget_max
    SCORE_REDUCTION_PER_50: 2,              // Reduce by 2 points per $50 difference
    SCORE_REDUCTION_PER_100: 4,             // Reduce by 4 points per $100 difference
    MIN_SCORE: 0,
    ACCEPTABLE_DIFFERENCE: 200,             // $200 difference still good compatibility
    MAJOR_DIFFERENCE: 500                   // $500+ difference is concerning
  },

  // ✅ ENHANCED: Location compatibility with standardized fields
  LOCATION: {
    EXACT_CITY_STATE: 100,                  // Same primary_city and primary_state
    SAME_CITY: 100,                         // Same primary_city
    SAME_STATE_NEARBY: 75,                  // Same state, nearby cities
    SAME_STATE_FAR: 60,                     // Same state, distant cities
    NEARBY_STATES: 50,                      // Adjacent states
    DIFFERENT_REGIONS: 40,                  // Different regions
    CROSS_COUNTRY: 30                       // Cross-country distance
  },

  // ✅ ENHANCED: Gender preference compatibility
  GENDER_PREFERENCES: {
    MUTUAL_COMPATIBILITY: 100,              // Both users' preferences satisfied
    ONE_WAY_COMPATIBILITY: 50,              // Only one user's preference satisfied
    NO_COMPATIBILITY: 0,                    // Neither preference satisfied (hard filter)
    INCLUSIVE_BONUS: 10                     // Bonus for gender_inclusive users
  },

  // ✅ ENHANCED: Schedule compatibility matrix
  SCHEDULE: {
    BEDTIME_COMPATIBILITY: {
      SAME_PREFERENCE: 100,
      COMPATIBLE_PATTERNS: 75,              // e.g., early + moderate
      NEUTRAL_PATTERNS: 50,                 // e.g., moderate + varies
      INCOMPATIBLE_PATTERNS: 25             // e.g., early + late
    },
    WORK_SCHEDULE_COMPATIBILITY: {
      SAME_SCHEDULE: 100,
      COMPLEMENTARY_SCHEDULES: 80,          // e.g., day shift + night shift
      FLEXIBLE_SCHEDULES: 70,               // One or both have flexibility
      CONFLICTING_SCHEDULES: 40             // Potential conflicts
    }
  },

  // ✅ ENHANCED: Communication style compatibility
  COMMUNICATION: {
    COMMUNICATION_STYLE: {
      SAME_STYLE: 100,
      COMPATIBLE_STYLES: 80,                // e.g., direct + casual check-ins
      NEUTRAL_STYLES: 60,                   // e.g., written + group meetings
      CHALLENGING_STYLES: 40                // e.g., direct + minimal communication
    },
    CONFLICT_RESOLUTION: {
      SAME_APPROACH: 100,
      COMPLEMENTARY_APPROACHES: 85,         // e.g., direct + mediated
      WORKABLE_APPROACHES: 65,              // Different but manageable
      PROBLEMATIC_APPROACHES: 30            // Likely to cause issues
    }
  },

  // Age compatibility (legacy support)
  AGE: {
    PERFECT_MATCH: 0,
    EXCELLENT_DIFF: 3,
    GOOD_DIFF: 6,
    FAIR_DIFF: 10,
    POOR_DIFF: 15,
    SCORES: {
      PERFECT: 100,
      EXCELLENT: 90,
      GOOD: 75,
      FAIR: 60,
      POOR: 45,
      VERY_POOR: 30
    }
  },

  // Smoking compatibility matrix (enhanced)
  SMOKING: {
    SAME_STATUS: 100,
    COMPATIBILITY_MATRIX: {
      'non_smoker': { 
        'non_smoker': 100,
        'outdoor_only': 70, 
        'occasional': 40, 
        'regular': 20 
      },
      'outdoor_only': { 
        'non_smoker': 70, 
        'outdoor_only': 100,
        'occasional': 80, 
        'regular': 60 
      },
      'occasional': { 
        'non_smoker': 40, 
        'outdoor_only': 80, 
        'occasional': 100,
        'regular': 70 
      },
      'regular': { 
        'non_smoker': 20, 
        'outdoor_only': 60, 
        'occasional': 70,
        'regular': 100
      }
    }
  },

  // Spiritual compatibility (enhanced)
  SPIRITUAL: {
    EXACT_MATCH: 100,
    SAME_GROUP: 90,
    MODERATE_COMPATIBILITY: 70,
    NEUTRAL: 65,
    LOW_COMPATIBILITY: 35,
    POTENTIAL_CONFLICT: 25
  }
};

// ===== LEGACY SCORING (for compatibility) =====
export const SCORING_CONFIG = ENHANCED_SCORING_CONFIG;

// ===== ENHANCED FILTER DEFAULTS =====
export const ENHANCED_DEFAULT_FILTERS = {
  minScore: 50,                             // Default minimum compatibility score
  hideAlreadyMatched: true,                 // Hide already connected users
  hideRequestsSent: true,                   // Hide users with pending requests
  maxResults: 20,                           // Maximum results per query
  
  // ✅ NEW: Enhanced filtering options
  priorityWeighting: 'balanced',            // balanced, strict, flexible
  includeLowerScores: false,                // Include matches below minScore for learning
  enhancedInsights: true,                   // Generate detailed match insights
  
  // Recovery-specific filters
  recoveryStageFlexibility: 'moderate',     // strict, moderate, flexible
  recoveryMethodsRequired: false,           // Require overlapping recovery methods
  substanceFreeRequired: null,              // null, true, false
  
  // Lifestyle filters
  lifestyleFlexibility: 'moderate',         // How flexible on lifestyle differences
  scheduleCompatibilityRequired: false,    // Require compatible schedules
  
  // Available filter options (enhanced)
  RECOVERY_STAGES: [
    'early', 'stabilizing', 'stable', 'long-term'
  ],
  AGE_RANGES: [
    '18-25', '26-35', '36-45', '46-55', '56-65', '65+'
  ],
  BUDGET_RANGES: [
    'Under $500', '$500-$750', '$750-$1000', '$1000-$1500', 'Over $1500'
  ],
  MIN_SCORES: [30, 40, 50, 60, 70, 80, 90],
  
  // ✅ NEW: Enhanced filter categories
  SPIRITUAL_AFFILIATIONS: [
    'christian-protestant', 'christian-catholic', 'muslim', 'jewish', 
    'buddhist', 'spiritual-not-religious', 'agnostic', 'atheist', 'other'
  ],
  RECOVERY_METHODS: [
    '12-step', 'smart-recovery', 'therapy', 'medication-assisted', 
    'faith-based', 'secular', 'holistic', 'community-support'
  ],
  HOUSING_TYPES: [
    'Shared house/apartment', 'Private room in house', 'Studio apartment',
    'Recovery residence', 'Sober living house', 'Transitional housing'
  ]
};

// Legacy default filters (for compatibility)
export const DEFAULT_FILTERS = {
  minScore: 50,
  hideAlreadyMatched: true,
  hideRequestsSent: true,
  maxResults: 20,
  RECOVERY_STAGES: ['early', 'stabilizing', 'stable', 'long-term'],
  AGE_RANGES: ['18-25', '26-35', '36-45', '46-65'],
  MIN_SCORES: [30, 40, 50, 60, 70, 80]
};

// ===== ENHANCED FLAG THRESHOLDS =====
// ✅ UPDATED: Based on priority system and realistic expectations

// Red flag thresholds (concerns to highlight)
export const ENHANCED_RED_FLAG_THRESHOLDS = {
  overall: 45,                              // Overall compatibility below 45%
  core_factors: 40,                         // Core factors below 40% is concerning
  high_factors: 35,                         // High factors below 35% is concerning
  
  // Individual factor thresholds
  location: 35,                             // Location compatibility below 35%
  budget: 40,                               // Budget compatibility below 40%
  recovery_core: 45,                        // Recovery compatibility below 45%
  lifestyle_core: 35,                       // Lifestyle compatibility below 35%
  recovery_environment: 50,                 // Recovery environment below 50%
  gender_preferences: 50,                   // Gender preferences below 50%
  schedule_compatibility: 30,               // Schedule compatibility below 30%
  communication_style: 35,                  // Communication style below 35%
  housing_safety: 40,                       // Housing safety below 40%
  
  // Legacy support
  lifestyle: 40,
  recovery: 50,
  spiritual: 40,
  age: 45
};

// Green flag thresholds (strengths to highlight)
export const ENHANCED_GREEN_FLAG_THRESHOLDS = {
  overall: 80,                              // Overall compatibility above 80%
  core_factors: 75,                         // Core factors above 75% is excellent
  high_factors: 70,                         // High factors above 70% is great
  
  // Individual factor thresholds
  location: 90,                             // Location compatibility above 90%
  budget: 85,                               // Budget compatibility above 85%
  recovery_core: 80,                        // Recovery compatibility above 80%
  lifestyle_core: 80,                       // Lifestyle compatibility above 80%
  recovery_environment: 75,                 // Recovery environment above 75%
  gender_preferences: 100,                  // Perfect gender compatibility
  schedule_compatibility: 75,               // Schedule compatibility above 75%
  communication_style: 80,                  // Communication style above 80%
  housing_safety: 85,                       // Housing safety above 85%
  shared_interests: 70,                     // Shared interests above 70%
  
  // Legacy support
  lifestyle: 85,
  recovery: 85,
  budget: 90,
  spiritual: 90,
  age: 90,
  interests: 70
};

// Legacy flag thresholds (for compatibility)
export const RED_FLAG_THRESHOLDS = ENHANCED_RED_FLAG_THRESHOLDS;
export const GREEN_FLAG_THRESHOLDS = ENHANCED_GREEN_FLAG_THRESHOLDS;

// ===== ENHANCED COMPATIBILITY GROUPS =====
export const ENHANCED_COMPATIBILITY_GROUPS = {
  SPIRITUAL: {
    CHRISTIAN: ['christian-protestant', 'christian-catholic'],
    SPIRITUAL_NOT_RELIGIOUS: ['spiritual-not-religious', 'agnostic'],
    NON_RELIGIOUS: ['agnostic', 'atheist'],
    MAJOR_RELIGIONS: ['muslim', 'jewish', 'buddhist', 'hindu'],
    OTHER: ['other', 'prefer-not-to-say']
  },
  
  RECOVERY_METHODS: {
    TWELVE_STEP: ['12-step', 'aa-alcoholics-anonymous', 'na-narcotics-anonymous', 'ca-cocaine-anonymous'],
    SECULAR: ['smart-recovery', 'secular-recovery', 'lifering', 'sos-secular'],
    FAITH_BASED: ['celebrate-recovery', 'faith-based-program', 'christian-recovery'],
    PROFESSIONAL: ['clinical-therapy', 'outpatient-therapy', 'intensive-outpatient', 'psychiatrist'],
    HOLISTIC: ['meditation', 'yoga', 'acupuncture', 'nutrition-therapy', 'exercise-therapy'],
    MEDICATION_ASSISTED: ['suboxone', 'methadone', 'naltrexone', 'medication-assisted-treatment'],
    COMMUNITY: ['peer-support', 'support-groups', 'community-meetings', 'online-support']
  },
  
  RECOVERY_STAGES: {
    EARLY_RECOVERY: ['early'],
    STABILIZING_RECOVERY: ['stabilizing'],
    STABLE_RECOVERY: ['stable'],
    LONG_TERM_RECOVERY: ['long-term']
  },
  
  PRIMARY_ISSUES: {
    SUBSTANCE_RELATED: ['alcohol-addiction', 'drug-addiction', 'prescription-drug-abuse', 'marijuana-dependency'],
    MENTAL_HEALTH: ['depression', 'anxiety', 'ptsd', 'bipolar-disorder', 'eating-disorder'],
    BEHAVIORAL: ['gambling-addiction', 'sex-addiction', 'internet-addiction', 'shopping-addiction'],
    TRAUMA_RELATED: ['childhood-trauma', 'domestic-violence', 'sexual-trauma', 'military-trauma'],
    DUAL_DIAGNOSIS: ['substance-abuse-mental-health', 'addiction-depression', 'addiction-anxiety']
  }
};

// Legacy compatibility groups (for compatibility)
export const COMPATIBILITY_GROUPS = ENHANCED_COMPATIBILITY_GROUPS;

// ===== ENHANCED VALIDATION RULES =====
export const ENHANCED_VALIDATION_CONFIG = {
  // ✅ UPDATED: Core requirements based on Master Data Mapping
  CORE_REQUIRED_FIELDS: [
    'user_id', 'primary_city', 'primary_state', 'budget_min', 'budget_max',
    'preferred_roommate_gender', 'recovery_stage', 'recovery_methods', 'primary_issues',
    'spiritual_affiliation', 'social_level', 'cleanliness_level', 'noise_tolerance',
    'work_schedule', 'move_in_date', 'about_me', 'looking_for'
  ],
  
  HIGH_PRIORITY_FIELDS: [
    'date_of_birth', 'substance_free_home_required', 'bedtime_preference',
    'conflict_resolution_style', 'smoking_status', 'pets_owned', 'pets_comfortable'
  ],
  
  MEDIUM_PRIORITY_FIELDS: [
    'interests', 'important_qualities', 'housing_types_accepted', 
    'lease_duration', 'move_in_flexibility'
  ],
  
  LOW_PRIORITY_FIELDS: [
    'additional_interests', 'short_term_goals', 'long_term_vision'
  ],
  
  // Scoring weights for validation
  CORE_WEIGHT: 70,
  HIGH_PRIORITY_WEIGHT: 20,
  MEDIUM_PRIORITY_WEIGHT: 8,
  LOW_PRIORITY_WEIGHT: 2,
  
  // Minimum validation scores
  MIN_CORE_COMPLETION: 85,                  // 85% of core fields required
  MIN_OVERALL_COMPLETION: 70,               // 70% overall completion required
  MIN_VALIDATION_SCORE: 80,                 // Higher threshold for enhanced matching
  
  // Points deducted for missing fields
  MISSING_CORE_PENALTY: 10,                 // 10 points per missing core field
  MISSING_HIGH_PENALTY: 5,                  // 5 points per missing high priority field
  MISSING_MEDIUM_PENALTY: 2,                // 2 points per missing medium priority field
  MISSING_LOW_PENALTY: 1                    // 1 point per missing low priority field
};

// Legacy validation config (for compatibility)
export const VALIDATION_CONFIG = {
  REQUIRED_FIELDS: ['user_id', 'recovery_stage', 'budget_max'],
  RECOMMENDED_FIELDS: ['age', 'gender', 'cleanliness_level', 'noise_level', 'social_level', 'smoking_status', 'interests'],
  MIN_VALIDATION_SCORE: 70,
  MISSING_REQUIRED_PENALTY: 25,
  MISSING_RECOMMENDED_PENALTY: 5
};

// ===== ENHANCED ALGORITHM PERFORMANCE =====
export const ENHANCED_PERFORMANCE_CONFIG = {
  // Batch processing
  MAX_BATCH_SIZE: 50,                       // Smaller batches for more complex calculations
  OPTIMAL_BATCH_SIZE: 25,                   // Optimal performance batch size
  
  // Caching strategy
  CACHE_DURATION_MINUTES: 15,               // Cache compatibility calculations
  PROFILE_CACHE_DURATION: 60,               // Cache transformed profiles longer
  RESULTS_CACHE_DURATION: 10,               // Cache final results shorter
  
  // Performance limits
  MAX_CALCULATION_TIME: 8000,               // Increased for enhanced algorithm (8 seconds)
  MAX_PROFILES_TO_PROCESS: 200,             // Maximum profiles to consider
  TIMEOUT_WARNING_THRESHOLD: 5000,         // Warn if calculation takes >5 seconds
  
  // ✅ NEW: Enhanced algorithm settings
  USE_PARALLEL_PROCESSING: true,            // Process profiles in parallel where possible
  ENABLE_PROGRESSIVE_LOADING: true,         // Load and display results progressively
  OPTIMIZE_FOR_MOBILE: true,                // Optimize calculations for mobile devices
  
  // Quality vs Speed trade-offs
  CALCULATION_QUALITY: 'high',              // high, medium, fast
  ENABLE_DEEP_INSIGHTS: true,               // Generate detailed insights (slower)
  SKIP_LOW_PROBABILITY_MATCHES: true,       // Skip obviously incompatible profiles early
  
  // Memory management
  MAX_CACHED_PROFILES: 500,                 // Maximum profiles to keep in memory
  CLEANUP_INTERVAL_MINUTES: 30             // Clean up old cache entries
};

// Legacy performance config (for compatibility)
export const PERFORMANCE_CONFIG = {
  MAX_BATCH_SIZE: 100,
  CACHE_DURATION_MINUTES: 15,
  MAX_CALCULATION_TIME: 5000
};

// ===== DEAL BREAKER CONFIGURATION =====
export const DEAL_BREAKER_CONFIG = {
  // Hard exclusions that completely block matches
  ABSOLUTE_DEAL_BREAKERS: [
    'deal_breaker_substance_use',
    'deal_breaker_financial_issues',
    'preferred_roommate_gender_mismatch'
  ],
  
  // Strong preferences that heavily impact scoring
  STRONG_DEAL_BREAKERS: [
    'deal_breaker_pets',
    'deal_breaker_smoking',
    'deal_breaker_loudness'
  ],
  
  // Moderate preferences that impact scoring
  MODERATE_DEAL_BREAKERS: [
    'deal_breaker_uncleanliness',
    'conflicting_schedules'
  ],
  
  // Scoring impact
  ABSOLUTE_SCORE: 0,                        // Complete incompatibility
  STRONG_PENALTY: -50,                      // Major penalty
  MODERATE_PENALTY: -25                     // Moderate penalty
};

// ===== HELPER FUNCTIONS =====

/**
 * ✅ ENHANCED: Validate that enhanced weights add up to 100
 */
export const validateEnhancedWeights = () => {
  const total = Object.values(ENHANCED_COMPATIBILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(total - 100) > 0.1) { // Allow small floating point differences
    console.warn(`⚠️ Enhanced compatibility weights total ${total}%, should be 100%`);
  }
  return Math.abs(total - 100) <= 0.1;
};

/**
 * Legacy weight validation (for compatibility)
 */
export const validateWeights = () => {
  const total = Object.values(COMPATIBILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  if (total !== 100) {
    console.warn(`⚠️ Legacy compatibility weights total ${total}%, should be 100%`);
  }
  return total === 100;
};

/**
 * ✅ ENHANCED: Get weight for compatibility category
 */
export const getEnhancedWeight = (category) => {
  return ENHANCED_COMPATIBILITY_WEIGHTS[category] || 0;
};

/**
 * Legacy get weight (for compatibility)
 */
export const getWeight = (category) => {
  return COMPATIBILITY_WEIGHTS[category] || 0;
};

/**
 * ✅ ENHANCED: Check if score meets enhanced thresholds
 */
export const meetsEnhancedThreshold = (category, score, level = 'core') => {
  const thresholds = ENHANCED_MATCHING_THRESHOLDS;
  
  if (level === 'core') {
    const threshold = thresholds.CORE_FACTOR_MINIMUMS[category];
    return !threshold || score >= threshold;
  } else if (level === 'high') {
    const threshold = thresholds.HIGH_FACTOR_MINIMUMS[category];
    return !threshold || score >= threshold;
  } else {
    const threshold = thresholds.PRIORITY_MINIMUMS[level];
    return !threshold || score >= threshold;
  }
};

/**
 * Legacy threshold check (for compatibility)
 */
export const meetsMinimumThreshold = (category, score) => {
  const threshold = MATCHING_THRESHOLDS.RECOMMENDED_MINIMUMS[category];
  return !threshold || score >= threshold;
};

/**
 * ✅ ENHANCED: Determine if score should generate flags
 */
export const shouldGenerateEnhancedRedFlag = (category, score) => {
  const threshold = ENHANCED_RED_FLAG_THRESHOLDS[category];
  return threshold && score < threshold;
};

export const shouldGenerateEnhancedGreenFlag = (category, score) => {
  const threshold = ENHANCED_GREEN_FLAG_THRESHOLDS[category];
  return threshold && score >= threshold;
};

/**
 * Legacy flag functions (for compatibility)
 */
export const shouldGenerateRedFlag = (category, score) => {
  const threshold = RED_FLAG_THRESHOLDS[category];
  return threshold && score < threshold;
};

export const shouldGenerateGreenFlag = (category, score) => {
  const threshold = GREEN_FLAG_THRESHOLDS[category];
  return threshold && score >= threshold;
};

/**
 * ✅ ENHANCED: Get compatibility group with enhanced groupings
 */
export const getEnhancedCompatibilityGroup = (type, value) => {
  const groups = ENHANCED_COMPATIBILITY_GROUPS[type];
  if (!groups) return 'OTHER';
  
  for (const [groupName, values] of Object.entries(groups)) {
    if (values.includes(value)) {
      return groupName;
    }
  }
  return 'OTHER';
};

/**
 * Legacy compatibility group function
 */
export const getSpiritualCompatibilityGroup = (affiliation) => {
  return getEnhancedCompatibilityGroup('SPIRITUAL', affiliation);
};

/**
 * ✅ ENHANCED: Check for deal breakers
 */
export const checkDealBreakers = (userProfile, candidateProfile) => {
  const dealBreakers = {
    absolute: [],
    strong: [],
    moderate: []
  };
  
  // Check absolute deal breakers
  if (userProfile.deal_breaker_substance_use && !candidateProfile.substance_free_home_required) {
    dealBreakers.absolute.push('substance_use');
  }
  
  if (userProfile.deal_breaker_financial_issues && !candidateProfile.financially_stable) {
    dealBreakers.absolute.push('financial_reliability');
  }
  
  // Check strong deal breakers
  if (userProfile.deal_breaker_pets && candidateProfile.pets_owned) {
    dealBreakers.strong.push('pets');
  }
  
  if (userProfile.deal_breaker_smoking && candidateProfile.smoking_status !== 'non_smoker') {
    dealBreakers.strong.push('smoking');
  }
  
  // Check moderate deal breakers
  if (userProfile.deal_breaker_uncleanliness && candidateProfile.cleanliness_level < 3) {
    dealBreakers.moderate.push('cleanliness');
  }
  
  return dealBreakers;
};

/**
 * ✅ ENHANCED: Export comprehensive configuration summary
 */
export const getEnhancedConfigSummary = () => {
  return {
    algorithmVersion: '2.0_enhanced',
    weightsValid: validateEnhancedWeights(),
    totalWeight: Object.values(ENHANCED_COMPATIBILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0),
    categories: Object.keys(ENHANCED_COMPATIBILITY_WEIGHTS),
    priorityLevels: {
      core: 70,
      high: 25,
      medium: 4,
      low: 1
    },
    thresholds: ENHANCED_MATCHING_THRESHOLDS,
    redFlagThresholds: ENHANCED_RED_FLAG_THRESHOLDS,
    greenFlagThresholds: ENHANCED_GREEN_FLAG_THRESHOLDS,
    dealBreakerConfig: DEAL_BREAKER_CONFIG,
    performanceConfig: ENHANCED_PERFORMANCE_CONFIG
  };
};

/**
 * Legacy config summary (for compatibility)
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

// Validate configurations on import
validateEnhancedWeights();
validateWeights();

// ===== ENHANCED EXPORTS =====
export default {
  // Enhanced configuration (primary)
  ENHANCED_COMPATIBILITY_WEIGHTS,
  ENHANCED_MATCHING_THRESHOLDS,
  ENHANCED_SCORING_CONFIG,
  ENHANCED_DEFAULT_FILTERS,
  ENHANCED_RED_FLAG_THRESHOLDS,
  ENHANCED_GREEN_FLAG_THRESHOLDS,
  ENHANCED_COMPATIBILITY_GROUPS,
  ENHANCED_VALIDATION_CONFIG,
  ENHANCED_PERFORMANCE_CONFIG,
  
  // Deal breaker configuration
  DEAL_BREAKER_CONFIG,
  
  // Enhanced helper functions
  validateEnhancedWeights,
  getEnhancedWeight,
  meetsEnhancedThreshold,
  shouldGenerateEnhancedRedFlag,
  shouldGenerateEnhancedGreenFlag,
  getEnhancedCompatibilityGroup,
  checkDealBreakers,
  getEnhancedConfigSummary,
  
  // Legacy compatibility
  COMPATIBILITY_WEIGHTS,
  MATCHING_THRESHOLDS,
  SCORING_CONFIG,
  DEFAULT_FILTERS,
  RED_FLAG_THRESHOLDS,
  GREEN_FLAG_THRESHOLDS,
  COMPATIBILITY_GROUPS,
  VALIDATION_CONFIG,
  PERFORMANCE_CONFIG,
  
  // Legacy helper functions
  validateWeights,
  getWeight,
  meetsMinimumThreshold,
  shouldGenerateRedFlag,
  shouldGenerateGreenFlag,
  getSpiritualCompatibilityGroup,
  getConfigSummary
};
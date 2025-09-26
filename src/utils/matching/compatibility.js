// src/utils/matching/compatibility.js - SCHEMA COMPLIANT VERSION

import { calculateDetailedCompatibility } from './algorithm.js';
import { calculateAge } from './dataTransform.js';

/**
 * SCHEMA COMPLIANT: Enhanced compatibility flags with strict schema field alignment
 * Uses only fields that exist in applicant_matching_profiles table
 * All field references validated against schema.sql
 */

// SCHEMA COMPLIANT: Enhanced thresholds aligned with algorithm priorities
const ENHANCED_GREEN_FLAG_THRESHOLDS = {
  location: 85,
  budget: 80,
  recovery_core: 80,
  lifestyle_core: 80,
  recovery_environment: 75,
  gender_preferences: 90,
  schedule_compatibility: 75,
  communication_style: 75,
  housing_safety: 80,
  shared_interests: 70,
  timing_flexibility: 75,
  goals_alignment: 70
};

const ENHANCED_RED_FLAG_THRESHOLDS = {
  location: 35,
  budget: 40,
  recovery_core: 45,
  lifestyle_core: 40,
  recovery_environment: 35,
  gender_preferences: 30,
  schedule_compatibility: 35,
  communication_style: 40,
  housing_safety: 30,
  shared_interests: 30,
  timing_flexibility: 35,
  goals_alignment: 35
};

/**
 * SCHEMA COMPLIANT: Deal breaker detection using exact schema field names
 * @param {Object} user1 - First user's profile (schema-transformed)
 * @param {Object} user2 - Second user's profile (schema-transformed)
 * @returns {Object} Deal breaker analysis
 */
const checkDealBreakers = (user1, user2) => {
  const absolute = [];
  const strong = [];

  // ABSOLUTE DEAL BREAKERS (complete incompatibility)
  
  // Substance use deal breaker using schema fields
  if (user1.deal_breaker_substance_use && !user2.substance_free_home_required) {
    absolute.push('substance_use');
  }
  if (user2.deal_breaker_substance_use && !user1.substance_free_home_required) {
    absolute.push('substance_use');
  }

  // Financial issues deal breaker using schema fields
  if (user1.deal_breaker_financial_issues && !user2.financially_stable) {
    absolute.push('financial_reliability');
  }
  if (user2.deal_breaker_financial_issues && !user1.financially_stable) {
    absolute.push('financial_reliability');
  }

  // STRONG DEAL BREAKERS (major concerns)
  
  // Pet deal breaker using schema fields
  if (user1.deal_breaker_pets && user2.pets_owned) {
    strong.push('pets');
  }
  if (user2.deal_breaker_pets && user1.pets_owned) {
    strong.push('pets');
  }

  // Smoking deal breaker using schema fields
  if (user1.deal_breaker_smoking && 
      user2.smoking_status && 
      user2.smoking_status !== 'non_smoker') {
    strong.push('smoking');
  }
  if (user2.deal_breaker_smoking && 
      user1.smoking_status && 
      user1.smoking_status !== 'non_smoker') {
    strong.push('smoking');
  }

  // Loudness deal breaker using schema fields
  if (user1.deal_breaker_loudness && user2.noise_tolerance && user2.noise_tolerance >= 4) {
    strong.push('loudness');
  }
  if (user2.deal_breaker_loudness && user1.noise_tolerance && user1.noise_tolerance >= 4) {
    strong.push('loudness');
  }

  // Uncleanliness deal breaker using schema fields
  if (user1.deal_breaker_uncleanliness && user2.cleanliness_level && user2.cleanliness_level <= 2) {
    strong.push('uncleanliness');
  }
  if (user2.deal_breaker_uncleanliness && user1.cleanliness_level && user1.cleanliness_level <= 2) {
    strong.push('uncleanliness');
  }

  return { absolute, strong };
};

/**
 * SCHEMA COMPLIANT: Generate comprehensive compatibility flags with schema field alignment
 * @param {Object} user1 - First user's profile data (schema-transformed)
 * @param {Object} user2 - Second user's profile data (schema-transformed)
 * @param {Object} scores - Compatibility scores from enhanced algorithm
 * @returns {Object} Object with greenFlags, redFlags, and yellowFlags arrays
 */
export const generateDetailedFlags = (user1, user2, scores) => {
  const greenFlags = [];
  const redFlags = [];
  const yellowFlags = [];

  // Core Factor Flags (Primary matching factors)
  generateCoreFlagsFromScores(scores, greenFlags, redFlags, yellowFlags);
  
  // High Factor Flags (Secondary matching factors)
  generateHighFactorFlags(user1, user2, scores, greenFlags, redFlags, yellowFlags);
  
  // Medium Factor Flags (Enhancement factors)
  generateMediumFactorFlags(user1, user2, scores, greenFlags, redFlags, yellowFlags);
  
  // Deal Breaker Detection
  const dealBreakers = checkDealBreakers(user1, user2);
  generateDealBreakerFlags(dealBreakers, redFlags);
  
  // Specific Compatibility Analysis using schema fields
  generateSpecificCompatibilityFlags(user1, user2, greenFlags, redFlags, yellowFlags);
  
  // Recovery-Specific Flags using schema fields
  generateRecoveryFlags(user1, user2, scores, greenFlags, redFlags, yellowFlags);
  
  return { 
    green: greenFlags, 
    red: redFlags, 
    yellow: yellowFlags 
  };
};

/**
 * Generate flags for core factors (location, budget, recovery_core, lifestyle_core)
 */
const generateCoreFlagsFromScores = (scores, greenFlags, redFlags, yellowFlags) => {
  // Location flags (20% weight - highest priority)
  if (scores.location >= ENHANCED_GREEN_FLAG_THRESHOLDS.location) {
    greenFlags.push('Excellent location compatibility - same area preferred');
  } else if (scores.location >= 75) {
    greenFlags.push('Good location compatibility - nearby areas');
  } else if (scores.location <= ENHANCED_RED_FLAG_THRESHOLDS.location) {
    redFlags.push('Very different preferred locations');
  } else if (scores.location <= 55) {
    yellowFlags.push('Moderate location differences - may require compromise');
  }
  
  // Budget flags (18% weight)
  if (scores.budget >= ENHANCED_GREEN_FLAG_THRESHOLDS.budget) {
    greenFlags.push('Excellent budget alignment - very similar ranges');
  } else if (scores.budget >= 75) {
    greenFlags.push('Good budget compatibility');
  } else if (scores.budget <= ENHANCED_RED_FLAG_THRESHOLDS.budget) {
    redFlags.push('Significant budget differences');
  } else if (scores.budget <= 55) {
    yellowFlags.push('Some budget differences - discuss cost expectations');
  }
  
  // Recovery core flags (16% weight)
  if (scores.recovery_core >= ENHANCED_GREEN_FLAG_THRESHOLDS.recovery_core || scores.recovery >= 80) {
    greenFlags.push('Excellent recovery compatibility - similar journey and methods');
  } else if ((scores.recovery_core || scores.recovery) >= 65) {
    greenFlags.push('Good recovery stage compatibility');
  } else if ((scores.recovery_core || scores.recovery) <= ENHANCED_RED_FLAG_THRESHOLDS.recovery_core) {
    redFlags.push('Very different recovery approaches or stages');
  } else if ((scores.recovery_core || scores.recovery) <= 55) {
    yellowFlags.push('Some recovery differences - discuss support needs');
  }
  
  // Lifestyle core flags (16% weight)
  if (scores.lifestyle_core >= ENHANCED_GREEN_FLAG_THRESHOLDS.lifestyle_core || scores.lifestyle >= 80) {
    greenFlags.push('Excellent lifestyle compatibility - similar daily routines');
  } else if ((scores.lifestyle_core || scores.lifestyle) >= 70) {
    greenFlags.push('Good lifestyle compatibility');
  } else if ((scores.lifestyle_core || scores.lifestyle) <= ENHANCED_RED_FLAG_THRESHOLDS.lifestyle_core) {
    redFlags.push('Significantly different lifestyle preferences');
  } else if ((scores.lifestyle_core || scores.lifestyle) <= 45) {
    yellowFlags.push('Some lifestyle differences - discuss daily routines');
  }
};

/**
 * Generate flags for high priority factors
 */
const generateHighFactorFlags = (user1, user2, scores, greenFlags, redFlags, yellowFlags) => {
  // Recovery environment flags (8% weight)
  if (scores.recovery_environment >= 75) {
    greenFlags.push('Compatible recovery environment preferences');
  } else if (scores.recovery_environment <= 45) {
    yellowFlags.push('Different recovery environment needs - discuss boundaries');
  }
  
  // Gender preference flags (6% weight - critical)
  if (scores.gender_preferences === 0 || scores.gender === 0) {
    redFlags.push('Incompatible gender preferences - this is a hard filter');
  } else if (scores.gender_preferences === 100 || scores.gender === 100) {
    greenFlags.push('Perfect gender preference compatibility');
  } else if ((scores.gender_preferences || scores.gender) >= 80) {
    greenFlags.push('Good gender preference compatibility');
  }
  
  // Schedule compatibility flags (4% weight)
  if (scores.schedule_compatibility >= 75) {
    greenFlags.push('Compatible schedules and sleep patterns');
  } else if (scores.schedule_compatibility <= 35) {
    yellowFlags.push('Different schedules - discuss routines and quiet hours');
  }
  
  // Communication style flags (4% weight)
  if (scores.communication_style >= 75) {
    greenFlags.push('Compatible communication and conflict resolution styles');
  } else if (scores.communication_style <= 40) {
    yellowFlags.push('Different communication styles - discuss how to handle house issues');
  }
  
  // Housing safety flags (3% weight)
  if (scores.housing_safety >= 80) {
    greenFlags.push('Compatible safety and substance preferences');
  } else if (scores.housing_safety <= 45) {
    yellowFlags.push('Different safety preferences - discuss house rules');
  }
};

/**
 * Generate flags for medium priority factors
 */
const generateMediumFactorFlags = (user1, user2, scores, greenFlags, redFlags, yellowFlags) => {
  // Shared interests flags (2% weight)
  if (scores.shared_interests >= 70 || scores.interests >= 70) {
    greenFlags.push('Several shared interests and hobbies');
  } else if ((scores.shared_interests || scores.interests) >= 50) {
    yellowFlags.push('Some shared interests - good foundation for friendship');
  }
  
  // Timing compatibility flags (1% weight)
  if (scores.timing_flexibility >= 80) {
    greenFlags.push('Compatible move-in timeline and lease preferences');
  } else if (scores.timing_flexibility <= 40) {
    yellowFlags.push('Different timing preferences - discuss flexibility');
  }
  
  // Goals alignment flags (1% weight)
  if (scores.goals_alignment >= 75) {
    greenFlags.push('Aligned goals and aspirations');
  } else if (scores.goals_alignment >= 50) {
    yellowFlags.push('Some goal alignment - supportive of each other\'s journey');
  }
};

/**
 * Generate deal breaker flags
 */
const generateDealBreakerFlags = (dealBreakers, redFlags) => {
  // Absolute deal breakers (complete incompatibility)
  if (dealBreakers.absolute.length > 0) {
    dealBreakers.absolute.forEach(breaker => {
      switch (breaker) {
        case 'substance_use':
          redFlags.push('INCOMPATIBLE: Substance use preferences conflict');
          break;
        case 'financial_reliability':
          redFlags.push('INCOMPATIBLE: Financial reliability concerns');
          break;
        default:
          redFlags.push(`INCOMPATIBLE: ${breaker} deal breaker violated`);
      }
    });
  }
  
  // Strong deal breakers (major concerns)
  if (dealBreakers.strong.length > 0) {
    dealBreakers.strong.forEach(breaker => {
      switch (breaker) {
        case 'pets':
          redFlags.push('Pet ownership conflict - one wants pets, other has deal breaker');
          break;
        case 'smoking':
          redFlags.push('Smoking conflict - preferences incompatible');
          break;
        case 'loudness':
          redFlags.push('Noise level conflict - may cause living tension');
          break;
        case 'uncleanliness':
          redFlags.push('Cleanliness standards conflict - may cause friction');
          break;
        default:
          redFlags.push(`${breaker} preference conflict`);
      }
    });
  }
};

/**
 * SCHEMA COMPLIANT: Generate specific compatibility flags using exact schema field names
 */
const generateSpecificCompatibilityFlags = (user1, user2, greenFlags, redFlags, yellowFlags) => {
  // SCHEMA COMPLIANT: Age compatibility using calculated age from date_of_birth
  const age1 = user1.age || calculateAge(user1.date_of_birth);
  const age2 = user2.age || calculateAge(user2.date_of_birth);
  
  if (age1 && age2) {
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 3) {
      greenFlags.push('Very similar ages for easy connection');
    } else if (ageDiff <= 6) {
      greenFlags.push('Similar age group');
    } else if (ageDiff >= 15) {
      yellowFlags.push(`${ageDiff}-year age difference - consider compatibility`);
    }
  }
  
  // SCHEMA COMPLIANT: Location using primary_location (auto-generated) and primary_city/primary_state
  if (user1.primary_location && user2.primary_location) {
    const loc1 = user1.primary_location.toLowerCase();
    const loc2 = user2.primary_location.toLowerCase();
    
    if (loc1 === loc2) {
      greenFlags.push('Perfect location match - same preferred area');
    } else if (user1.primary_state === user2.primary_state) {
      greenFlags.push('Same preferred state - good location compatibility');
    }
  }
  
  // SCHEMA COMPLIANT: Budget using budget_min/budget_max
  if (user1.budget_max && user2.budget_max) {
    const budgetDiff = Math.abs(user1.budget_max - user2.budget_max);
    if (budgetDiff <= 100) {
      greenFlags.push('Very similar budget ranges');
    } else if (budgetDiff > 500) {
      yellowFlags.push(`$${budgetDiff} budget difference - discuss cost expectations`);
    }
  }
  
  // SCHEMA COMPLIANT: Recovery methods using recovery_methods array
  if (user1.recovery_methods?.length && user2.recovery_methods?.length) {
    const sharedMethods = user1.recovery_methods.filter(method => 
      user2.recovery_methods.includes(method)
    );
    if (sharedMethods.length >= 2) {
      greenFlags.push(`Multiple shared recovery methods: ${sharedMethods.slice(0, 2).join(', ')}`);
    } else if (sharedMethods.length === 1) {
      greenFlags.push(`Shared recovery method: ${sharedMethods[0]}`);
    }
  }
  
  // SCHEMA COMPLIANT: Program types using program_types array
  if (user1.program_types?.length && user2.program_types?.length) {
    const sharedPrograms = user1.program_types.filter(program => 
      user2.program_types.includes(program)
    );
    if (sharedPrograms.length > 0) {
      greenFlags.push(`Shared recovery programs: ${sharedPrograms.slice(0, 2).join(', ')}`);
    }
  }
  
  // SCHEMA COMPLIANT: Smoking compatibility using smoking_status
  if (user1.smoking_status && user2.smoking_status) {
    if (user1.smoking_status === user2.smoking_status) {
      if (user1.smoking_status === 'non_smoker') {
        greenFlags.push('Both non-smokers - clean air environment');
      } else {
        greenFlags.push('Matching smoking preferences');
      }
    } else if (
      (user1.smoking_status === 'non_smoker' && user2.smoking_status === 'regular') ||
      (user2.smoking_status === 'non_smoker' && user1.smoking_status === 'regular')
    ) {
      redFlags.push('Non-smoker paired with regular smoker');
    }
  }
  
  // SCHEMA COMPLIANT: Lifestyle scales using exact schema field names with constraints
  if (user1.social_level && user2.social_level) {
    const diff = Math.abs(user1.social_level - user2.social_level);
    if (diff === 0) {
      greenFlags.push('Perfect social level match');
    } else if (diff === 1) {
      greenFlags.push('Very similar social preferences');
    } else if (diff >= 3) {
      yellowFlags.push('Different social needs - discuss interaction expectations');
    }
  }
  
  if (user1.cleanliness_level && user2.cleanliness_level) {
    const diff = Math.abs(user1.cleanliness_level - user2.cleanliness_level);
    if (diff === 0) {
      greenFlags.push('Perfect cleanliness standards match');
    } else if (diff >= 2) {
      yellowFlags.push('Different cleanliness standards - discuss house rules');
    }
  }
  
  if (user1.noise_tolerance && user2.noise_tolerance) {
    const diff = Math.abs(user1.noise_tolerance - user2.noise_tolerance);
    if (diff === 0) {
      greenFlags.push('Perfect noise tolerance match');
    } else if (diff >= 2) {
      yellowFlags.push('Different noise preferences - discuss quiet hours');
    }
  }
  
  // SCHEMA COMPLIANT: Pet compatibility using pets_owned and pets_comfortable
  if (user1.pets_owned && !user2.pets_comfortable) {
    redFlags.push('Pet conflict: One has pets, other uncomfortable with pets');
  } else if (user2.pets_owned && !user1.pets_comfortable) {
    redFlags.push('Pet conflict: One has pets, other uncomfortable with pets');
  } else if (user1.pets_owned === user2.pets_owned) {
    if (user1.pets_owned) {
      greenFlags.push('Both are pet owners - understand pet care needs');
    } else {
      greenFlags.push('Both prefer pet-free environment');
    }
  }
  
  // SCHEMA COMPLIANT: Substance-free home using substance_free_home_required
  if (user1.substance_free_home_required && user2.substance_free_home_required) {
    greenFlags.push('Both require substance-free home environment');
  } else if (user1.substance_free_home_required !== user2.substance_free_home_required) {
    yellowFlags.push('Different substance-free home preferences - discuss boundaries');
  }
};

/**
 * SCHEMA COMPLIANT: Generate recovery-specific flags using exact schema fields
 */
const generateRecoveryFlags = (user1, user2, scores, greenFlags, redFlags, yellowFlags) => {
  // SCHEMA COMPLIANT: Recovery stage compatibility using recovery_stage
  if (user1.recovery_stage === user2.recovery_stage) {
    greenFlags.push(`Both in ${user1.recovery_stage} recovery stage - mutual understanding`);
  } else {
    const stages = ['early', 'stabilizing', 'stable', 'long-term'];
    const user1Index = stages.indexOf(user1.recovery_stage);
    const user2Index = stages.indexOf(user2.recovery_stage);
    
    if (user1Index !== -1 && user2Index !== -1) {
      const diff = Math.abs(user1Index - user2Index);
      if (diff === 1) {
        yellowFlags.push('Adjacent recovery stages - can provide complementary support');
      } else if (diff >= 2) {
        yellowFlags.push('Different recovery stages - discuss experience levels and needs');
      }
    }
  }
  
  // SCHEMA COMPLIANT: Spiritual alignment using spiritual_affiliation
  if (user1.spiritual_affiliation && user2.spiritual_affiliation) {
    if (user1.spiritual_affiliation === user2.spiritual_affiliation) {
      greenFlags.push(`Shared spiritual approach: ${user1.spiritual_affiliation}`);
    } else {
      // Check for compatible groups
      const christianGroups = ['christian-protestant', 'christian-catholic'];
      const spiritualGroups = ['spiritual-not-religious', 'agnostic'];
      
      if (
        (christianGroups.includes(user1.spiritual_affiliation) && christianGroups.includes(user2.spiritual_affiliation)) ||
        (spiritualGroups.includes(user1.spiritual_affiliation) && spiritualGroups.includes(user2.spiritual_affiliation))
      ) {
        greenFlags.push('Compatible spiritual perspectives');
      } else if (
        user1.spiritual_affiliation === 'spiritual-not-religious' || 
        user2.spiritual_affiliation === 'spiritual-not-religious'
      ) {
        yellowFlags.push('Different but potentially compatible spiritual views');
      }
    }
  }
  
  // SCHEMA COMPLIANT: Primary issues overlap using primary_issues array
  if (user1.primary_issues?.length && user2.primary_issues?.length) {
    const sharedIssues = user1.primary_issues.filter(issue => 
      user2.primary_issues.includes(issue)
    );
    if (sharedIssues.length > 0) {
      greenFlags.push('Shared understanding through similar recovery challenges');
    } else {
      yellowFlags.push('Different primary issues - can offer diverse support perspectives');
    }
  }
};

/**
 * SCHEMA COMPLIANT: Generate comprehensive compatibility flags (legacy compatibility)
 * @param {Object} user1 - First user's profile data (schema-transformed)
 * @param {Object} user2 - Second user's profile data (schema-transformed)
 * @param {number} matchScore - Overall match score
 * @returns {Object} Object with greenFlags and redFlags arrays
 */
export const generateCompatibilityFlags = (user1, user2, matchScore) => {
  // Use the enhanced algorithm for calculation
  const detailedMatch = calculateDetailedCompatibility(user1, user2);
  const flags = generateDetailedFlags(user1, user2, detailedMatch.score_breakdown);
  
  // Return in legacy format for backwards compatibility
  return {
    greenFlags: flags.green,
    redFlags: flags.red
  };
};

/**
 * SCHEMA COMPLIANT: Get comprehensive compatibility summary with priority breakdown
 * @param {Object} user1 - First user's profile data (schema-transformed)
 * @param {Object} user2 - Second user's profile data (schema-transformed)
 * @returns {Object} Enhanced compatibility summary
 */
export const getCompatibilitySummary = (user1, user2) => {
  const detailedMatch = calculateDetailedCompatibility(user1, user2);
  const flags = generateDetailedFlags(user1, user2, detailedMatch.score_breakdown);
  
  // Get compatibility level using new thresholds
  const { level, description } = getEnhancedCompatibilityLevel(detailedMatch.compatibility_score);
  
  return {
    overallScore: detailedMatch.compatibility_score,
    level,
    description,
    breakdown: detailedMatch.score_breakdown,
    priorityBreakdown: detailedMatch.priority_breakdown,
    greenFlags: flags.green,
    redFlags: flags.red,
    yellowFlags: flags.yellow,
    recommendation: getEnhancedRecommendation(detailedMatch.compatibility_score, flags),
    weights: detailedMatch.weights,
    algorithmVersion: detailedMatch.algorithm_version,
    dealBreakers: checkDealBreakers(user1, user2)
  };
};

/**
 * Get compatibility level with enhanced thresholds
 */
const getEnhancedCompatibilityLevel = (score) => {
  if (score >= 85) {
    return {
      level: 'excellent',
      description: 'Exceptional compatibility - excellent potential for a successful roommate relationship with strong mutual support'
    };
  } else if (score >= 75) {
    return {
      level: 'very_good',
      description: 'Very good compatibility - strong alignment in most important areas with great potential for success'
    };
  } else if (score >= 65) {
    return {
      level: 'good',
      description: 'Good compatibility - solid foundation with many shared values and manageable differences'
    };
  } else if (score >= 55) {
    return {
      level: 'moderate',
      description: 'Moderate compatibility - some areas align well, others will need discussion and compromise'
    };
  } else if (score >= 45) {
    return {
      level: 'fair',
      description: 'Fair compatibility - significant differences exist that would require good communication and flexibility'
    };
  } else {
    return {
      level: 'poor',
      description: 'Limited compatibility - many fundamental differences that would be challenging to navigate'
    };
  }
};

/**
 * Get recommendation with priority factor consideration
 */
const getEnhancedRecommendation = (score, flags) => {
  const hasAbsoluteDealBreakers = flags.red.some(flag => flag.includes('INCOMPATIBLE'));
  
  if (hasAbsoluteDealBreakers) {
    return "Not recommended - fundamental incompatibilities detected. Consider other matches.";
  }
  
  if (score >= 80) {
    return "Highly recommended! This appears to be an excellent match. Consider reaching out to start a conversation.";
  } else if (score >= 70) {
    return "Recommended - this is a strong potential match. Review the details and consider connecting.";
  } else if (score >= 60) {
    return "Good potential match. Review the compatibility breakdown and consider if the differences are manageable.";
  } else if (score >= 50) {
    return "Moderate match. Carefully consider the yellow and red flags before proceeding.";
  } else if (score >= 40) {
    return "Lower compatibility. Review the concerns carefully and ensure you're both prepared for significant differences.";
  } else {
    return "Poor match. Consider looking for more compatible roommates unless you're prepared for substantial challenges.";
  }
};

/**
 * Filter and rank matches with priority factor consideration
 * @param {Array} candidates - Array of potential match candidates (schema-transformed)
 * @param {Object} userProfile - Current user's profile (schema-transformed)
 * @param {Object} filters - Enhanced filtering criteria
 * @returns {Array} Filtered and ranked matches
 */
export const filterAndRankMatches = (candidates, userProfile, filters = {}) => {
  const {
    minScore = 45,
    maxResults = 20,
    excludeDealBreakers = true,
    excludeRedFlags = [],
    requireGreenFlags = [],
    prioritizeFactors = [],
    includeModerateConcerns = true
  } = filters;

  let matches = candidates.map(candidate => {
    const summary = getCompatibilitySummary(userProfile, candidate);
    return {
      ...candidate,
      compatibility: summary
    };
  });

  // Filter by deal breakers first
  if (excludeDealBreakers) {
    matches = matches.filter(match => 
      match.compatibility.dealBreakers.absolute.length === 0
    );
  }

  // Filter by minimum score
  matches = matches.filter(match => match.compatibility.overallScore >= minScore);

  // Filter by red flags if specified
  if (excludeRedFlags.length > 0) {
    matches = matches.filter(match => 
      !excludeRedFlags.some(flag => 
        match.compatibility.redFlags.some(redFlag => 
          redFlag.toLowerCase().includes(flag.toLowerCase())
        )
      )
    );
  }

  // Filter by required green flags if specified
  if (requireGreenFlags.length > 0) {
    matches = matches.filter(match => 
      requireGreenFlags.every(flag => 
        match.compatibility.greenFlags.some(greenFlag => 
          greenFlag.toLowerCase().includes(flag.toLowerCase())
        )
      )
    );
  }

  // Sort by compatibility score with priority factor consideration
  matches.sort((a, b) => {
    // Primary sort by overall score
    if (b.compatibility.overallScore !== a.compatibility.overallScore) {
      return b.compatibility.overallScore - a.compatibility.overallScore;
    }
    
    // Secondary sort by core factors
    if (a.compatibility.priorityBreakdown && b.compatibility.priorityBreakdown) {
      return b.compatibility.priorityBreakdown.core_factors - a.compatibility.priorityBreakdown.core_factors;
    }
    
    return 0;
  });

  // Apply priority factors if specified
  if (prioritizeFactors.length > 0) {
    matches = applyEnhancedPriorityFactors(matches, prioritizeFactors);
  }

  // Limit results
  return matches.slice(0, maxResults);
};

/**
 * Apply priority factors with enhanced algorithm consideration
 */
const applyEnhancedPriorityFactors = (matches, priorityFactors) => {
  return matches.map(match => {
    let priorityBonus = 0;
    
    priorityFactors.forEach(factor => {
      const breakdown = match.compatibility.breakdown;
      
      switch (factor) {
        case 'recovery':
        case 'recovery_core':
          if ((breakdown.recovery_core || breakdown.recovery) >= 80) {
            priorityBonus += 15;
          }
          break;
        case 'lifestyle':
        case 'lifestyle_core':
          if ((breakdown.lifestyle_core || breakdown.lifestyle) >= 80) {
            priorityBonus += 12;
          }
          break;
        case 'location':
          if (breakdown.location >= 80) {
            priorityBonus += 18;
          }
          break;
        case 'budget':
          if (breakdown.budget >= 80) {
            priorityBonus += 14;
          }
          break;
        case 'recovery_environment':
          if (breakdown.recovery_environment >= 75) {
            priorityBonus += 10;
          }
          break;
        case 'gender_preferences':
        case 'gender':
          if ((breakdown.gender_preferences || breakdown.gender) >= 100) {
            priorityBonus += 8;
          }
          break;
        case 'communication':
        case 'communication_style':
          if ((breakdown.communication_style || breakdown.preferences) >= 75) {
            priorityBonus += 8;
          }
          break;
        case 'schedule':
        case 'schedule_compatibility':
          if (breakdown.schedule_compatibility >= 75) {
            priorityBonus += 6;
          }
          break;
        case 'interests':
        case 'shared_interests':
          if ((breakdown.shared_interests || breakdown.interests) >= 70) {
            priorityBonus += 4;
          }
          break;
        case 'spiritual':
          if (breakdown.spiritual >= 80) {
            priorityBonus += 3;
          }
          break;
      }
    });
    
    return {
      ...match,
      adjustedScore: match.compatibility.overallScore + priorityBonus
    };
  }).sort((a, b) => (b.adjustedScore || b.compatibility.overallScore) - (a.adjustedScore || a.compatibility.overallScore));
};

/**
 * Generate personalized match insights with priority consideration
 * @param {Object} userProfile - Current user's profile (schema-transformed)
 * @param {Object} matchProfile - Potential match's profile (schema-transformed)
 * @returns {Object} Enhanced personalized insights
 */
export const generateMatchInsights = (userProfile, matchProfile) => {
  const summary = getCompatibilitySummary(userProfile, matchProfile);
  const insights = [];

  // Priority-based insights
  generateCoreFactorInsights(summary, insights);
  generateHighFactorInsights(summary, insights);
  generateMediumFactorInsights(summary, insights);
  
  // Deal breaker insights
  if (summary.dealBreakers.absolute.length > 0) {
    insights.push({
      type: 'critical',
      category: 'deal_breakers',
      message: 'Critical incompatibilities detected that would make this match very challenging.'
    });
  }

  return {
    overallInsight: generateEnhancedOverallInsight(summary.overallScore, summary.priorityBreakdown),
    specificInsights: insights,
    nextSteps: generateEnhancedNextSteps(summary.overallScore, summary.redFlags.length, summary.dealBreakers),
    priorityFocus: generatePriorityFocus(summary.priorityBreakdown)
  };
};

/**
 * Generate insights for core factors
 */
const generateCoreFactorInsights = (summary, insights) => {
  const breakdown = summary.breakdown;
  
  if (breakdown.location >= 85 || (breakdown.location >= 80 && summary.priorityBreakdown?.core_factors >= 75)) {
    insights.push({
      type: 'positive',
      category: 'location',
      priority: 'core',
      message: 'Excellent location compatibility makes finding housing together much easier and reduces commute stress.'
    });
  } else if (breakdown.location <= 45) {
    insights.push({
      type: 'consideration',
      category: 'location',
      priority: 'core',
      message: 'Location preferences differ significantly. Consider if you\'re both willing to compromise on preferred areas.'
    });
  }

  if (breakdown.budget >= 85) {
    insights.push({
      type: 'positive',
      category: 'budget',
      priority: 'core',
      message: 'Very similar budget ranges will make housing searches and cost-sharing much smoother.'
    });
  } else if (breakdown.budget <= 50) {
    insights.push({
      type: 'consideration',
      category: 'budget',
      priority: 'core',
      message: 'Budget expectations differ substantially. Important to discuss how this affects housing choices and cost-sharing.'
    });
  }

  const recoveryScore = breakdown.recovery_core || breakdown.recovery;
  if (recoveryScore >= 80) {
    insights.push({
      type: 'positive',
      category: 'recovery',
      priority: 'core',
      message: 'Strong recovery compatibility suggests good mutual understanding and support for each other\'s journey.'
    });
  } else if (recoveryScore <= 50) {
    insights.push({
      type: 'consideration',
      category: 'recovery',
      priority: 'core',
      message: 'Different recovery approaches or stages. Discuss how you can support each other despite differences.'
    });
  }

  const lifestyleScore = breakdown.lifestyle_core || breakdown.lifestyle;
  if (lifestyleScore >= 80) {
    insights.push({
      type: 'positive',
      category: 'lifestyle',
      priority: 'core',
      message: 'Excellent lifestyle compatibility means similar daily routines and living standards - great foundation for harmony.'
    });
  } else if (lifestyleScore <= 45) {
    insights.push({
      type: 'consideration',
      category: 'lifestyle',
      priority: 'core',
      message: 'Significant lifestyle differences in cleanliness, noise tolerance, or social needs. Clear house rules will be essential.'
    });
  }
};

/**
 * Generate insights for high priority factors
 */
const generateHighFactorInsights = (summary, insights) => {
  const breakdown = summary.breakdown;
  
  if (breakdown.recovery_environment >= 75) {
    insights.push({
      type: 'positive',
      category: 'recovery_environment',
      priority: 'high',
      message: 'Compatible recovery environment preferences create a supportive living atmosphere for both of you.'
    });
  }

  if ((breakdown.gender_preferences || breakdown.gender) === 100) {
    insights.push({
      type: 'positive',
      category: 'gender_preferences',
      priority: 'high',
      message: 'Perfect gender preference alignment ensures both feel comfortable with the living arrangement.'
    });
  }

  if (breakdown.communication_style >= 75) {
    insights.push({
      type: 'positive',
      category: 'communication',
      priority: 'high',
      message: 'Compatible communication styles will help you handle conflicts constructively and maintain a positive relationship.'
    });
  } else if (breakdown.communication_style <= 45) {
    insights.push({
      type: 'consideration',
      category: 'communication',
      priority: 'high',
      message: 'Different communication and conflict resolution styles. Establish clear communication protocols early.'
    });
  }
};

/**
 * Generate insights for medium priority factors
 */
const generateMediumFactorInsights = (summary, insights) => {
  const breakdown = summary.breakdown;
  
  if ((breakdown.shared_interests || breakdown.interests) >= 70) {
    insights.push({
      type: 'positive',
      category: 'interests',
      priority: 'medium',
      message: 'Shared interests provide great opportunities for friendship and enjoyable shared activities.'
    });
  }

  if (breakdown.timing_flexibility >= 75) {
    insights.push({
      type: 'positive',
      category: 'timing',
      priority: 'medium',
      message: 'Compatible timing for move-in and lease preferences makes the logistics much easier.'
    });
  }
};

/**
 * Generate enhanced overall insight
 */
const generateEnhancedOverallInsight = (score, priorityBreakdown) => {
  if (score >= 85) {
    return "This is an exceptional match with excellent compatibility across all major factors. You share core values and preferences that create a strong foundation for successful roommate relationship.";
  } else if (score >= 75) {
    return "This is a very strong match with good to excellent compatibility in most important areas. Any differences appear manageable with good communication.";
  } else if (score >= 65) {
    const coreStrength = priorityBreakdown?.core_factors >= 70 ? " Your core compatibility factors are strong, which is most important." : "";
    return `This is a good match with solid compatibility in key areas.${coreStrength} Some differences exist but can likely be worked through.`;
  } else if (score >= 55) {
    return "This match has moderate compatibility. While some areas align well, there are notable differences that would require open communication and flexibility from both parties.";
  } else if (score >= 45) {
    return "This match has fair compatibility with several significant differences. Success would depend heavily on both parties being very communicative and flexible.";
  } else {
    return "This match shows limited compatibility with many fundamental differences. Consider whether you're both prepared for the challenges this would present.";
  }
};

/**
 * Generate enhanced next steps
 */
const generateEnhancedNextSteps = (score, redFlagCount, dealBreakers) => {
  const steps = [];

  // Deal breakers override everything
  if (dealBreakers.absolute.length > 0) {
    steps.push("Not recommended due to fundamental incompatibilities");
    steps.push("Consider exploring other matches with better core compatibility");
    return steps;
  }

  if (score >= 75) {
    steps.push("Send a match request - this is a strong potential match");
    steps.push("Start with a friendly message highlighting your shared interests or goals");
    steps.push("Discuss housing timeline, preferences, and logistics");
    steps.push("Share your recovery journey and support needs openly");
  } else if (score >= 60) {
    steps.push("Review the compatibility breakdown carefully");
    steps.push("Consider if the differences are manageable for your situation");
    steps.push("If comfortable, reach out with a thoughtful message acknowledging both similarities and differences");
    steps.push("Be prepared for honest conversations about expectations");
  } else if (score >= 50) {
    steps.push("Proceed with caution - significant differences exist");
    steps.push("Focus on core compatibility factors (location, budget, recovery, lifestyle)");
    if (redFlagCount > 0) {
      steps.push("Address the red flags directly if you decide to proceed");
    }
    steps.push("Extensive communication will be essential");
  } else {
    steps.push("Consider looking for more compatible matches first");
    steps.push("If still interested, ensure both parties are committed to working through differences");
    steps.push("Plan for very open communication and clear boundary setting");
    steps.push("Consider a trial period or more gradual approach");
  }

  return steps;
};

/**
 * Generate priority focus areas
 */
const generatePriorityFocus = (priorityBreakdown) => {
  if (!priorityBreakdown) return null;

  const focus = {};
  
  if (priorityBreakdown.core_factors >= 75) {
    focus.strength = "Core compatibility factors are strong - excellent foundation";
  } else if (priorityBreakdown.core_factors <= 50) {
    focus.concern = "Core compatibility factors need attention - focus on location, budget, recovery, and lifestyle alignment";
  }

  if (priorityBreakdown.high_factors >= 70) {
    focus.secondary_strength = "Secondary factors align well - good for long-term success";
  } else if (priorityBreakdown.high_factors <= 45) {
    focus.secondary_concern = "Secondary factors may need discussion - communication, schedules, and safety preferences";
  }

  return focus;
};

/**
 * SCHEMA COMPLIANT: Validate compatibility data with schema requirements
 * @param {Object} user1 - First user's profile (schema-transformed)
 * @param {Object} user2 - Second user's profile (schema-transformed)
 * @returns {boolean} Whether both profiles have required data for compatibility analysis
 */
export const validateCompatibilityData = (user1, user2) => {
  if (!user1 || !user2) {
    return false;
  }

  // SCHEMA COMPLIANT: Core required fields based on schema NOT NULL constraints
  const coreRequiredFields = [
    'user_id', // References registrant_profiles.id
    'recovery_stage', // VARCHAR(50) NOT NULL
    'primary_city', // VARCHAR(100) NOT NULL
    'primary_state', // VARCHAR(2) NOT NULL
    'budget_max' // Used in budget compatibility calculations
  ];
  
  for (const field of coreRequiredFields) {
    if (!user1[field] || !user2[field]) {
      console.warn(`Missing core required field for compatibility: ${field}`);
      return false;
    }
  }

  return true;
};

/**
 * Get compatibility tier with new thresholds
 */
export const getCompatibilityTier = (score) => {
  if (score >= 85) return 'excellent';
  if (score >= 75) return 'very_good';
  if (score >= 65) return 'good';
  if (score >= 55) return 'moderate';
  if (score >= 45) return 'fair';
  return 'poor';
};

/**
 * Get compatibility color for UI display
 */
export const getCompatibilityColor = (score) => {
  if (score >= 85) return '#10B981'; // emerald-500
  if (score >= 75) return '#22C55E'; // green-500
  if (score >= 65) return '#84CC16'; // lime-500
  if (score >= 55) return '#EAB308'; // yellow-500
  if (score >= 45) return '#F97316'; // orange-500
  return '#EF4444'; // red-500
};

/**
 * Generate compatibility badge text
 */
export const getCompatibilityBadge = (score, level) => {
  const tier = getCompatibilityTier(score);
  const badges = {
    excellent: { text: 'Excellent Match', icon: '🌟' },
    very_good: { text: 'Very Good Match', icon: '✨' },
    good: { text: 'Good Match', icon: '👍' },
    moderate: { text: 'Moderate Match', icon: '⚖️' },
    fair: { text: 'Fair Match', icon: '🤔' },
    poor: { text: 'Limited Match', icon: '⚠️' }
  };
  
  return badges[tier] || badges.poor;
};

export default {
  generateCompatibilityFlags,
  generateDetailedFlags,
  getCompatibilitySummary,
  filterAndRankMatches,
  generateMatchInsights,
  validateCompatibilityData,
  getCompatibilityTier,
  getCompatibilityColor,
  getCompatibilityBadge
};
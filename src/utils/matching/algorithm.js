// src/utils/matching/algorithm.js - ENHANCED WITH COMPLETE MASTER DATA MAPPING INTEGRATION

/**
 * Enhanced matching algorithm for Recovery Housing Connect
 * ✅ COMPLETE INTEGRATION: Master Data Mapping Table + Priority Matrix
 * ✅ STANDARDIZED: All field names updated to match database schema
 * ✅ COMPREHENSIVE: All form sections and compatibility factors included
 */

// Import the location compatibility function
import { calculateLocationCompatibility as baseLocationCompatibility } from './dataTransform';

/**
 * ✅ ENHANCED: Complete priority-based weights from Master Data Mapping Table
 */
const ENHANCED_COMPATIBILITY_WEIGHTS = {
  // 🔴 CORE FACTORS (Primary Matching) - 70% total weight
  location: 20,           // primary_city/primary_state compatibility
  budget: 18,             // budget_min/budget_max alignment  
  recovery_core: 16,      // recovery_stage + recovery_methods + primary_issues
  lifestyle_core: 16,     // social_level + cleanliness_level + noise_tolerance
  
  // 🟡 HIGH FACTORS (Secondary Matching) - 25% total weight
  recovery_environment: 8, // substance_free_home_required + spiritual_affiliation
  gender_preferences: 6,   // preferred_roommate_gender compatibility
  schedule_compatibility: 4, // bedtime_preference + work_schedule
  communication_style: 4,  // conflict_resolution_style + communication_style
  housing_safety: 3,      // smoking_status + pets compatibility
  
  // 🟢 MEDIUM FACTORS (Compatibility Enhancement) - 4% total weight
  shared_interests: 2,    // interests + important_qualities alignment
  timing_flexibility: 1,  // move_in_date + timing compatibility
  goals_alignment: 1,     // short_term_goals + long_term_vision
  
  // ⚪ LOW FACTORS (Nice-to-Have) - 1% total weight
  extended_compatibility: 1 // additional_interests + profile personality
};

/**
 * ✅ ENHANCED: Calculate comprehensive compatibility with full Master Data integration
 * @param {Object} user1 - First user's complete profile data
 * @param {Object} user2 - Second user's complete profile data
 * @returns {Object} Detailed compatibility analysis with priority-based scoring
 */
export const calculateDetailedCompatibility = (user1, user2) => {
  try {
    console.log(`🔄 Calculating enhanced compatibility between users`);
    
    // Validate input data
    if (!user1 || !user2) {
      throw new Error('Missing user profile data for compatibility calculation');
    }
    
    // Calculate compatibility scores for each category with enhanced precision
    const scores = {
      // 🔴 CORE FACTORS
      location: calculateLocationCompatibility(user1, user2),
      budget: calculateBudgetCompatibility(user1, user2),
      recovery_core: calculateRecoveryCoreCompatibility(user1, user2),
      lifestyle_core: calculateLifestyleCoreCompatibility(user1, user2),
      
      // 🟡 HIGH FACTORS  
      recovery_environment: calculateRecoveryEnvironmentCompatibility(user1, user2),
      gender_preferences: calculateGenderPreferencesCompatibility(user1, user2),
      schedule_compatibility: calculateScheduleCompatibility(user1, user2),
      communication_style: calculateCommunicationCompatibility(user1, user2),
      housing_safety: calculateHousingSafetyCompatibility(user1, user2),
      
      // 🟢 MEDIUM FACTORS
      shared_interests: calculateSharedInterestsCompatibility(user1, user2),
      timing_flexibility: calculateTimingCompatibility(user1, user2),
      goals_alignment: calculateGoalsCompatibility(user1, user2),
      
      // ⚪ LOW FACTORS
      extended_compatibility: calculateExtendedCompatibility(user1, user2),
      
      // 📊 LEGACY COMPATIBILITY (for backwards compatibility)
      age: calculateAgeCompatibility(user1, user2),
      spiritual: calculateSpiritualCompatibility(user1, user2),
      interests: calculateInterestsCompatibility(user1, user2),
      housing: calculateHousingCompatibility(user1, user2),
      preferences: calculatePreferencesCompatibility(user1, user2)
    };

    // Calculate weighted overall score using enhanced weights
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(ENHANCED_COMPATIBILITY_WEIGHTS).forEach(([category, weight]) => {
      if (scores[category] !== null && scores[category] !== undefined) {
        totalScore += scores[category] * weight;
        totalWeight += weight;
      }
    });
    
    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    // ✅ ENHANCED: Include priority-based breakdown
    const priorityBreakdown = calculatePriorityBreakdown(scores);
    
    return {
      compatibility_score: overallScore,
      score_breakdown: scores,
      priority_breakdown: priorityBreakdown,
      user1_id: user1.id || user1.user_id,
      user2_id: user2.id || user2.user_id,
      calculated_at: new Date().toISOString(),
      weights: ENHANCED_COMPATIBILITY_WEIGHTS,
      algorithm_version: '2.0_enhanced'
    };
    
  } catch (error) {
    console.error('💥 Error calculating enhanced compatibility:', error);
    throw error;
  }
};

/**
 * ✅ NEW: Calculate priority-based breakdown for better insights
 */
const calculatePriorityBreakdown = (scores) => {
  const coreFactors = ['location', 'budget', 'recovery_core', 'lifestyle_core'];
  const highFactors = ['recovery_environment', 'gender_preferences', 'schedule_compatibility', 'communication_style', 'housing_safety'];
  const mediumFactors = ['shared_interests', 'timing_flexibility', 'goals_alignment'];
  const lowFactors = ['extended_compatibility'];
  
  const calculateCategoryScore = (factors) => {
    const validScores = factors
      .map(factor => scores[factor])
      .filter(score => score !== null && score !== undefined);
    
    return validScores.length > 0 ? 
      Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) : 50;
  };
  
  return {
    core_factors: calculateCategoryScore(coreFactors),
    high_factors: calculateCategoryScore(highFactors),
    medium_factors: calculateCategoryScore(mediumFactors),
    low_factors: calculateCategoryScore(lowFactors)
  };
};

/**
 * ✅ NEW: Calculate recovery core compatibility (PRIMARY MATCH FACTOR)
 * Combines: recovery_stage + recovery_methods + primary_issues
 */
export const calculateRecoveryCoreCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Recovery stage compatibility (40% of recovery core)
  if (user1.recovery_stage && user2.recovery_stage) {
    const stageScore = calculateRecoveryStageCompatibility(user1.recovery_stage, user2.recovery_stage);
    totalScore += stageScore * 0.4;
    factors += 0.4;
  }
  
  // Recovery methods overlap (35% of recovery core)
  if (user1.recovery_methods?.length && user2.recovery_methods?.length) {
    const methodsScore = calculateArrayOverlapScore(user1.recovery_methods, user2.recovery_methods);
    totalScore += methodsScore * 0.35;
    factors += 0.35;
  }
  
  // Primary issues understanding (25% of recovery core)
  if (user1.primary_issues?.length && user2.primary_issues?.length) {
    const issuesScore = calculatePrimaryIssuesCompatibility(user1.primary_issues, user2.primary_issues);
    totalScore += issuesScore * 0.25;
    factors += 0.25;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ NEW: Calculate lifestyle core compatibility (PRIMARY MATCH FACTOR)
 * Uses: social_level + cleanliness_level + noise_tolerance (1-5 scales)
 */
export const calculateLifestyleCoreCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Social level compatibility (35% weight)
  if (user1.social_level && user2.social_level) {
    const diff = Math.abs(user1.social_level - user2.social_level);
    const socialScore = Math.max(0, 100 - (diff * 25)); // 25 points per level difference
    totalScore += socialScore * 0.35;
    factors += 0.35;
  }
  
  // Cleanliness level compatibility (35% weight)
  if (user1.cleanliness_level && user2.cleanliness_level) {
    const diff = Math.abs(user1.cleanliness_level - user2.cleanliness_level);
    const cleanScore = Math.max(0, 100 - (diff * 25));
    totalScore += cleanScore * 0.35;
    factors += 0.35;
  }
  
  // Noise tolerance compatibility (30% weight)
  if (user1.noise_tolerance && user2.noise_tolerance) {
    const diff = Math.abs(user1.noise_tolerance - user2.noise_tolerance);
    const noiseScore = Math.max(0, 100 - (diff * 25));
    totalScore += noiseScore * 0.30;
    factors += 0.30;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ NEW: Calculate recovery environment compatibility (HIGH FACTOR)
 * Includes: substance_free_home_required + spiritual_affiliation + recovery support preferences
 */
export const calculateRecoveryEnvironmentCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Substance-free home requirement (CRITICAL - 50% weight)
  if (user1.substance_free_home_required !== undefined && user2.substance_free_home_required !== undefined) {
    const substanceScore = user1.substance_free_home_required === user2.substance_free_home_required ? 100 : 0;
    totalScore += substanceScore * 0.5;
    factors += 0.5;
  }
  
  // Spiritual affiliation compatibility (30% weight)
  if (user1.spiritual_affiliation && user2.spiritual_affiliation) {
    const spiritualScore = calculateSpiritualCompatibility(user1, user2);
    totalScore += spiritualScore * 0.3;
    factors += 0.3;
  }
  
  // Recovery support preferences (20% weight)
  const supportFactors = ['want_recovery_support', 'comfortable_discussing_recovery', 'attend_meetings_together'];
  let supportScore = 0;
  let supportCount = 0;
  
  supportFactors.forEach(factor => {
    if (user1[factor] !== undefined && user2[factor] !== undefined) {
      supportScore += user1[factor] === user2[factor] ? 100 : 50;
      supportCount++;
    }
  });
  
  if (supportCount > 0) {
    totalScore += (supportScore / supportCount) * 0.2;
    factors += 0.2;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ ENHANCED: Calculate gender preferences compatibility (HIGH FACTOR)
 * Uses: preferred_roommate_gender + gender_inclusive
 */
export const calculateGenderPreferencesCompatibility = (user1, user2) => {
  const user1Gender = user1.gender_identity || user1.gender;
  const user2Gender = user2.gender_identity || user2.gender;
  
  const user1Pref = user1.preferred_roommate_gender;
  const user2Pref = user2.preferred_roommate_gender;
  
  // If no preferences specified, assume compatibility
  if (!user1Pref && !user2Pref) return 100;
  if (!user1Pref) return checkGenderPreference(user2Pref, user2Gender, user1Gender);
  if (!user2Pref) return checkGenderPreference(user1Pref, user1Gender, user2Gender);
  
  // Check both preferences
  const user1Compatible = checkGenderPreference(user1Pref, user1Gender, user2Gender);
  const user2Compatible = checkGenderPreference(user2Pref, user2Gender, user1Gender);
  
  // Both must be compatible - this is a HARD requirement
  const baseCompatibility = Math.min(user1Compatible, user2Compatible);
  
  // Bonus for gender inclusivity if both are inclusive
  if (user1.gender_inclusive && user2.gender_inclusive && baseCompatibility > 0) {
    return Math.min(100, baseCompatibility + 10); // 10 point bonus
  }
  
  return baseCompatibility;
};

/**
 * ✅ NEW: Calculate schedule compatibility (HIGH FACTOR)
 * Includes: bedtime_preference + work_schedule + early_riser + night_owl
 */
export const calculateScheduleCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Bedtime preference compatibility (40% weight)
  if (user1.bedtime_preference && user2.bedtime_preference) {
    const bedtimeScore = user1.bedtime_preference === user2.bedtime_preference ? 100 : 
                       isCompatibleBedtime(user1.bedtime_preference, user2.bedtime_preference) ? 75 : 25;
    totalScore += bedtimeScore * 0.4;
    factors += 0.4;
  }
  
  // Work schedule compatibility (35% weight)
  if (user1.work_schedule && user2.work_schedule) {
    const workScore = user1.work_schedule === user2.work_schedule ? 100 :
                     isCompatibleWorkSchedule(user1.work_schedule, user2.work_schedule) ? 75 : 50;
    totalScore += workScore * 0.35;
    factors += 0.35;
  }
  
  // Sleep pattern compatibility (25% weight)
  const sleepPatterns = ['early_riser', 'night_owl'];
  let sleepScore = 0;
  let sleepCount = 0;
  
  sleepPatterns.forEach(pattern => {
    if (user1[pattern] !== undefined && user2[pattern] !== undefined) {
      // If both have the same sleep pattern, that's good
      if (user1[pattern] === user2[pattern]) {
        sleepScore += user1[pattern] ? 100 : 75; // 100 if both are pattern, 75 if both are not
      } else {
        // Different patterns can still work if they're complementary
        sleepScore += 50;
      }
      sleepCount++;
    }
  });
  
  if (sleepCount > 0) {
    totalScore += (sleepScore / sleepCount) * 0.25;
    factors += 0.25;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ NEW: Calculate communication compatibility (HIGH FACTOR)
 * Includes: communication_style + conflict_resolution_style + chore_sharing_style
 */
export const calculateCommunicationCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Communication style compatibility (40% weight)
  if (user1.communication_style && user2.communication_style) {
    const commScore = calculateCommunicationStyleCompatibility(user1.communication_style, user2.communication_style);
    totalScore += commScore * 0.4;
    factors += 0.4;
  }
  
  // Conflict resolution compatibility (40% weight)
  if (user1.conflict_resolution_style && user2.conflict_resolution_style) {
    const conflictScore = calculateConflictResolutionCompatibility(user1.conflict_resolution_style, user2.conflict_resolution_style);
    totalScore += conflictScore * 0.4;
    factors += 0.4;
  }
  
  // Chore sharing style compatibility (20% weight)
  if (user1.chore_sharing_style && user2.chore_sharing_style) {
    const choreScore = calculateChoreStyleCompatibility(user1.chore_sharing_style, user2.chore_sharing_style);
    totalScore += choreScore * 0.2;
    factors += 0.2;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ NEW: Calculate housing safety compatibility (HIGH FACTOR)
 * Includes: smoking_status + pets + substance considerations
 */
export const calculateHousingSafetyCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Smoking compatibility (50% weight)
  if (user1.smoking_status && user2.smoking_status) {
    const smokingScore = calculateSmokingCompatibility(user1.smoking_status, user2.smoking_status);
    totalScore += smokingScore * 0.5;
    factors += 0.5;
  }
  
  // Pet compatibility (30% weight)
  if (user1.pets_owned !== undefined && user2.pets_comfortable !== undefined) {
    const petScore = user1.pets_owned && !user2.pets_comfortable ? 0 : 100;
    totalScore += petScore * 0.3;
    factors += 0.3;
  }
  
  if (user2.pets_owned !== undefined && user1.pets_comfortable !== undefined) {
    const petScore = user2.pets_owned && !user1.pets_comfortable ? 0 : 100;
    totalScore += petScore * 0.2;
    factors += 0.2;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ NEW: Calculate shared interests compatibility (MEDIUM FACTOR)
 * Enhanced version with interests + important_qualities
 */
export const calculateSharedInterestsCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Interests overlap (60% weight)
  if (user1.interests?.length && user2.interests?.length) {
    const interestsScore = calculateArrayOverlapScore(user1.interests, user2.interests);
    totalScore += interestsScore * 0.6;
    factors += 0.6;
  }
  
  // Important qualities alignment (40% weight)
  if (user1.important_qualities?.length && user2.important_qualities?.length) {
    const qualitiesScore = calculateArrayOverlapScore(user1.important_qualities, user2.important_qualities);
    totalScore += qualitiesScore * 0.4;
    factors += 0.4;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ NEW: Calculate timing compatibility (MEDIUM FACTOR)
 * Includes: move_in_date + move_in_flexibility + lease_duration
 */
export const calculateTimingCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Move-in date compatibility (60% weight)
  if (user1.move_in_date && user2.move_in_date) {
    const date1 = new Date(user1.move_in_date);
    const date2 = new Date(user2.move_in_date);
    const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
    
    let dateScore;
    if (daysDiff <= 7) dateScore = 100;      // Within a week
    else if (daysDiff <= 30) dateScore = 80; // Within a month
    else if (daysDiff <= 60) dateScore = 60; // Within two months
    else dateScore = 40;                     // More than two months
    
    totalScore += dateScore * 0.6;
    factors += 0.6;
  }
  
  // Lease duration compatibility (40% weight)
  if (user1.lease_duration && user2.lease_duration) {
    const leaseScore = user1.lease_duration === user2.lease_duration ? 100 : 75;
    totalScore += leaseScore * 0.4;
    factors += 0.4;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * ✅ NEW: Calculate goals compatibility (MEDIUM FACTOR)
 * Includes: short_term_goals + long_term_vision alignment
 */
export const calculateGoalsCompatibility = (user1, user2) => {
  // This would require NLP analysis for text comparison
  // For now, return moderate compatibility if both have goals
  const hasGoals1 = (user1.short_term_goals && user1.short_term_goals.length > 0) || 
                   (user1.long_term_vision && user1.long_term_vision.length > 0);
  const hasGoals2 = (user2.short_term_goals && user2.short_term_goals.length > 0) || 
                   (user2.long_term_vision && user2.long_term_vision.length > 0);
  
  if (hasGoals1 && hasGoals2) return 75; // Both have goals - likely compatible
  if (hasGoals1 || hasGoals2) return 60; // One has goals - moderate compatibility
  return 50; // Neither has goals specified
};

/**
 * ✅ NEW: Calculate extended compatibility (LOW FACTOR)
 * Includes: additional_interests + profile text quality
 */
export const calculateExtendedCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Additional interests (if provided)
  if (user1.additional_interests && user2.additional_interests) {
    // Simple text similarity check
    const text1 = user1.additional_interests.toLowerCase();
    const text2 = user2.additional_interests.toLowerCase();
    const similarity = calculateTextSimilarity(text1, text2);
    totalScore += similarity;
    factors++;
  }
  
  // Profile completeness bonus
  const completeness1 = calculateProfileCompleteness(user1);
  const completeness2 = calculateProfileCompleteness(user2);
  const avgCompleteness = (completeness1 + completeness2) / 2;
  
  totalScore += avgCompleteness;
  factors++;
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

// ===== ENHANCED HELPER FUNCTIONS =====

/**
 * ✅ ENHANCED: Communication style compatibility matrix
 */
const calculateCommunicationStyleCompatibility = (style1, style2) => {
  if (style1 === style2) return 100;
  
  const compatibility = {
    'direct-verbal': { 'written-notes': 70, 'casual-check-ins': 80, 'group-meetings': 60 },
    'written-notes': { 'direct-verbal': 70, 'casual-check-ins': 60, 'group-meetings': 80 },
    'group-meetings': { 'direct-verbal': 60, 'written-notes': 80, 'casual-check-ins': 70 },
    'casual-check-ins': { 'direct-verbal': 80, 'written-notes': 60, 'group-meetings': 70 },
    'minimal-communication': { 'direct-verbal': 30, 'written-notes': 50, 'group-meetings': 20, 'casual-check-ins': 40 }
  };
  
  return compatibility[style1]?.[style2] || 50;
};

/**
 * ✅ ENHANCED: Conflict resolution compatibility matrix
 */
const calculateConflictResolutionCompatibility = (style1, style2) => {
  if (style1 === style2) return 100;
  
  const compatibility = {
    'direct-communication': { 'mediated-discussion': 80, 'written-communication': 60, 'avoid-conflict': 30 },
    'mediated-discussion': { 'direct-communication': 80, 'written-communication': 90, 'avoid-conflict': 70 },
    'written-communication': { 'direct-communication': 60, 'mediated-discussion': 90, 'avoid-conflict': 80 },
    'avoid-conflict': { 'direct-communication': 30, 'mediated-discussion': 70, 'written-communication': 80 }
  };
  
  return compatibility[style1]?.[style2] || 50;
};

/**
 * ✅ NEW: Chore style compatibility matrix
 */
const calculateChoreStyleCompatibility = (style1, style2) => {
  if (style1 === style2) return 100;
  
  const compatibility = {
    'formal-schedule': { 'informal-sharing': 70, 'individual-responsibility': 60, 'hire-help': 80, 'flexible': 50 },
    'informal-sharing': { 'formal-schedule': 70, 'individual-responsibility': 80, 'hire-help': 60, 'flexible': 90 },
    'individual-responsibility': { 'formal-schedule': 60, 'informal-sharing': 80, 'hire-help': 70, 'flexible': 70 },
    'hire-help': { 'formal-schedule': 80, 'informal-sharing': 60, 'individual-responsibility': 70, 'flexible': 60 },
    'flexible': { 'formal-schedule': 50, 'informal-sharing': 90, 'individual-responsibility': 70, 'hire-help': 60 }
  };
  
  return compatibility[style1]?.[style2] || 60;
};

/**
 * ✅ NEW: Simple text similarity calculation
 */
const calculateTextSimilarity = (text1, text2) => {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return totalWords > 0 ? Math.round((commonWords.length / totalWords) * 100) : 0;
};

/**
 * ✅ NEW: Calculate profile completeness score
 */
const calculateProfileCompleteness = (profile) => {
  const requiredFields = [
    'primary_city', 'primary_state', 'budget_min', 'budget_max', 'preferred_roommate_gender',
    'recovery_stage', 'recovery_methods', 'primary_issues', 'spiritual_affiliation',
    'social_level', 'cleanliness_level', 'noise_tolerance', 'work_schedule',
    'move_in_date', 'about_me', 'looking_for'
  ];
  
  const completedFields = requiredFields.filter(field => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  });
  
  return Math.round((completedFields.length / requiredFields.length) * 100);
};

// ===== EXISTING FUNCTIONS (Updated with standardized field names) =====

/**
 * ✅ UPDATED: Location compatibility with full standardization
 */
export const calculateLocationCompatibility = (user1, user2) => {
  const location1 = user1.primary_location || 
                   (user1.primary_city && user1.primary_state ? 
                    `${user1.primary_city}, ${user1.primary_state}` : null);
  
  const location2 = user2.primary_location || 
                   (user2.primary_city && user2.primary_state ? 
                    `${user2.primary_city}, ${user2.primary_state}` : null);
  
  if (!location1 || !location2) return 50;
  
  // Exact match
  if (location1.toLowerCase() === location2.toLowerCase()) return 100;
  
  // Same state check
  const state1 = user1.primary_state || extractStateFromLocation(location1);
  const state2 = user2.primary_state || extractStateFromLocation(location2);
  
  if (state1 && state2 && state1.toLowerCase() === state2.toLowerCase()) {
    const city1 = user1.primary_city || extractCityFromLocation(location1);
    const city2 = user2.primary_city || extractCityFromLocation(location2);
    
    if (city1 && city2 && city1.toLowerCase() === city2.toLowerCase()) {
      return 100; // Same city
    }
    return 75; // Same state, different city
  }
  
  return 40; // Different states
};

/**
 * ✅ UPDATED: Budget compatibility with standardized fields
 */
export const calculateBudgetCompatibility = (user1, user2) => {
  const budget1 = user1.budget_max;
  const budget2 = user2.budget_max;
  
  if (!budget1 || !budget2) return 50;
  
  const budgetDiff = Math.abs(budget1 - budget2);
  
  if (budgetDiff === 0) return 100;
  
  // Decrease score by 2 points for every $50 difference
  const score = Math.max(0, 100 - Math.floor(budgetDiff / 50) * 2);
  return score;
};

// ===== MAINTAIN EXISTING FUNCTIONS FOR BACKWARDS COMPATIBILITY =====

/**
 * Legacy lifestyle compatibility (maintained for backwards compatibility)
 */
export const calculateLifestyleCompatibility = (user1, user2) => {
  return calculateLifestyleCoreCompatibility(user1, user2);
};

/**
 * Legacy recovery compatibility (maintained for backwards compatibility)
 */
export const calculateRecoveryCompatibility = (user1, user2) => {
  return calculateRecoveryCoreCompatibility(user1, user2);
};

/**
 * Legacy gender compatibility (maintained for backwards compatibility)
 */
export const calculateGenderCompatibility = (user1, user2) => {
  return calculateGenderPreferencesCompatibility(user1, user2);
};

// ===== KEEP ALL EXISTING HELPER FUNCTIONS =====

export const calculateAgeCompatibility = (user1, user2) => {
  if (!user1.age || !user2.age) return 50;
  
  const ageDiff = Math.abs(user1.age - user2.age);
  
  if (ageDiff === 0) return 100;
  if (ageDiff <= 3) return 90;
  if (ageDiff <= 6) return 75;
  if (ageDiff <= 10) return 60;
  if (ageDiff <= 15) return 45;
  return 30;
};

export const calculateSpiritualCompatibility = (user1, user2) => {
  const spiritual1 = user1.spiritual_affiliation;
  const spiritual2 = user2.spiritual_affiliation;
  
  if (!spiritual1 || !spiritual2) return 75;
  if (spiritual1 === spiritual2) return 100;
  
  const christianGroups = ['christian-protestant', 'christian-catholic'];
  const spiritualButNotReligious = ['spiritual-not-religious', 'agnostic'];
  const nonReligious = ['agnostic', 'atheist'];
  
  if (christianGroups.includes(spiritual1) && christianGroups.includes(spiritual2)) return 90;
  if (spiritualButNotReligious.includes(spiritual1) && spiritualButNotReligious.includes(spiritual2)) return 90;
  if (nonReligious.includes(spiritual1) && nonReligious.includes(spiritual2)) return 90;
  
  if (spiritual1 === 'spiritual-not-religious' || spiritual2 === 'spiritual-not-religious') return 70;
  if (spiritual1 === 'other' || spiritual2 === 'other') return 65;
  
  const potentialConflicts = [
    ['christian-protestant', 'muslim'], ['christian-catholic', 'muslim'],
    ['christian-protestant', 'atheist'], ['christian-catholic', 'atheist'],
    ['muslim', 'atheist'], ['jewish', 'muslim']
  ];
  
  const isConflict = potentialConflicts.some(([a, b]) => 
    (spiritual1 === a && spiritual2 === b) || (spiritual1 === b && spiritual2 === a)
  );
  
  return isConflict ? 35 : 60;
};

export const calculateInterestsCompatibility = (user1, user2) => {
  if (!user1.interests || !user2.interests) return 50;
  return calculateArrayOverlapScore(user1.interests, user2.interests);
};

export const calculateHousingCompatibility = (user1, user2) => {
  const subsidy1 = user1.housing_assistance || user1.housing_subsidy || [];
  const subsidy2 = user2.housing_assistance || user2.housing_subsidy || [];
  
  if (subsidy1.length === 0 && subsidy2.length === 0) return 75;
  
  const overlap = calculateArrayOverlapScore(subsidy1, subsidy2);
  return Math.max(50, overlap);
};

export const calculatePreferencesCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  const binaryPrefs = ['pets_owned', 'pets_comfortable', 'overnight_guests_ok', 'shared_groceries'];
  
  binaryPrefs.forEach(pref => {
    if (user1[pref] !== undefined && user2[pref] !== undefined) {
      totalScore += user1[pref] === user2[pref] ? 100 : 40;
      factors++;
    }
  });
  
  if (user1.smoking_status && user2.smoking_status) {
    const smokingScore = calculateSmokingCompatibility(user1.smoking_status, user2.smoking_status);
    totalScore += smokingScore;
    factors++;
  }
  
  const guestPolicy1 = user1.guests_policy;
  const guestPolicy2 = user2.guests_policy;
  
  if (guestPolicy1 && guestPolicy2) {
    const guestScore = calculateGuestCompatibility(guestPolicy1, guestPolicy2);
    totalScore += guestScore;
    factors++;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

// ===== ALL EXISTING HELPER FUNCTIONS (kept for compatibility) =====

const extractStateFromLocation = (location) => {
  if (!location) return null;
  const parts = location.split(',').map(p => p.trim());
  return parts.length > 1 ? parts[parts.length - 1] : null;
};

const extractCityFromLocation = (location) => {
  if (!location) return null;
  const parts = location.split(',').map(p => p.trim());
  return parts.length > 0 ? parts[0] : null;
};

const isCompatibleBedtime = (bedtime1, bedtime2) => {
  const compatible = {
    'early': ['moderate'],
    'moderate': ['early', 'late'],
    'late': ['moderate'],
    'varies': ['early', 'moderate', 'late']
  };
  return compatible[bedtime1]?.includes(bedtime2) || compatible[bedtime2]?.includes(bedtime1);
};

const isCompatibleWorkSchedule = (schedule1, schedule2) => {
  const compatible = {
    'traditional_9_5': ['flexible', 'student'],
    'flexible': ['traditional_9_5', 'student', 'irregular'],
    'student': ['traditional_9_5', 'flexible', 'irregular'],
    'early_morning': ['night_shift'],
    'night_shift': ['early_morning']
  };
  return compatible[schedule1]?.includes(schedule2) || compatible[schedule2]?.includes(schedule1);
};

const calculateRecoveryStageCompatibility = (stage1, stage2) => {
  if (stage1 === stage2) return 100;
  
  const stageOrder = ['early', 'stabilizing', 'stable', 'long-term'];
  const index1 = stageOrder.indexOf(stage1);
  const index2 = stageOrder.indexOf(stage2);
  
  if (index1 === -1 || index2 === -1) return 50;
  
  const diff = Math.abs(index1 - index2);
  if (diff === 1) return 80;
  if (diff === 2) return 60;
  return 40;
};

const calculatePrimaryIssuesCompatibility = (issues1, issues2) => {
  const sharedIssues = issues1.filter(issue => issues2.includes(issue));
  return sharedIssues.length > 0 ? 100 : 75;
};

const checkGenderPreference = (preference, userGender, otherGender) => {
  switch (preference) {
    case 'no_preference':
    case 'any':
      return 100;
    case 'same_gender':
    case 'same':
      return userGender === otherGender ? 100 : 0;
    case 'different_gender':
    case 'different':
      return userGender !== otherGender ? 100 : 0;
    case 'male':
      return otherGender === 'male' ? 100 : 0;
    case 'female':
      return otherGender === 'female' ? 100 : 0;
    case 'non_binary':
    case 'non-binary':
      return otherGender === 'non_binary' || otherGender === 'non-binary' ? 100 : 0;
    default:
      return 100;
  }
};

const calculateSmokingCompatibility = (smoking1, smoking2) => {
  if (smoking1 === smoking2) return 100;
  
  const compatibility = {
    'non_smoker': { 'outdoor_only': 70, 'occasional': 40, 'regular': 20 },
    'outdoor_only': { 'non_smoker': 70, 'occasional': 80, 'regular': 60 },
    'occasional': { 'non_smoker': 40, 'outdoor_only': 80, 'regular': 70 },
    'regular': { 'non_smoker': 20, 'outdoor_only': 60, 'occasional': 70 }
  };
  
  return compatibility[smoking1]?.[smoking2] || 50;
};

const calculateGuestCompatibility = (guests1, guests2) => {
  if (guests1 === guests2) return 100;
  
  const guestOrder = ['no_guests', 'rare_guests', 'moderate_guests', 'frequent_guests'];
  const index1 = guestOrder.indexOf(guests1);
  const index2 = guestOrder.indexOf(guests2);
  
  if (index1 === -1 || index2 === -1) return 50;
  
  const diff = Math.abs(index1 - index2);
  if (diff === 1) return 75;
  if (diff === 2) return 50;
  return 25;
};

const calculateArrayOverlapScore = (array1, array2) => {
  if (!array1?.length || !array2?.length) return 50;
  
  const overlap = array1.filter(item => array2.includes(item));
  const union = [...new Set([...array1, ...array2])];
  
  return Math.round((overlap.length / union.length) * 100);
};

// ===== MAIN EXPORT FUNCTIONS =====

export const calculateMatchScore = (user1, user2) => {
  const result = calculateDetailedCompatibility(user1, user2);
  return result.compatibility_score;
};

export const calculateDetailedMatch = (user1, user2) => {
  const result = calculateDetailedCompatibility(user1, user2);
  
  return {
    overallScore: result.compatibility_score,
    breakdown: {
      // Enhanced priority-based breakdown
      core_factors: {
        score: result.priority_breakdown.core_factors,
        weight: '70%',
        details: 'Location, Budget, Recovery Core, Lifestyle Core'
      },
      high_factors: {
        score: result.priority_breakdown.high_factors,
        weight: '25%',
        details: 'Recovery Environment, Gender, Schedule, Communication, Housing Safety'
      },
      medium_factors: {
        score: result.priority_breakdown.medium_factors,
        weight: '4%',
        details: 'Shared Interests, Timing, Goals Alignment'
      },
      low_factors: {
        score: result.priority_breakdown.low_factors,
        weight: '1%',
        details: 'Extended Compatibility Factors'
      },
      // Individual factor breakdown
      individual: result.score_breakdown
    },
    algorithm_version: result.algorithm_version,
    weights: result.weights
  };
};

export const findCompatibleMatches = async (userId = null, minScore = 60, limit = 20) => {
  throw new Error('findCompatibleMatches not implemented - requires database integration');
};

export default {
  calculateMatchScore,
  calculateDetailedMatch,
  calculateDetailedCompatibility,
  calculateRecoveryCoreCompatibility,
  calculateLifestyleCoreCompatibility,
  calculateRecoveryEnvironmentCompatibility,
  calculateGenderPreferencesCompatibility,
  calculateScheduleCompatibility,
  calculateCommunicationCompatibility,
  calculateHousingSafetyCompatibility,
  calculateSharedInterestsCompatibility,
  calculateTimingCompatibility,
  calculateGoalsCompatibility,
  calculateExtendedCompatibility,
  // Legacy functions
  calculateLifestyleCompatibility,
  calculateAgeCompatibility,
  calculateBudgetCompatibility,
  calculateRecoveryCompatibility,
  calculateSpiritualCompatibility,
  calculateInterestsCompatibility,
  calculateHousingCompatibility,
  calculateGenderCompatibility,
  calculatePreferencesCompatibility,
  calculateLocationCompatibility,
  findCompatibleMatches
};
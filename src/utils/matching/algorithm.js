// src/utils/matching/algorithm.js

/**
 * Core matching algorithm for Recovery Housing Connect
 * Based on the advanced matching system with weighted compatibility factors
 */

/**
 * Calculate detailed compatibility between two users
 * @param {Object} user1 - First user's complete profile data (profile + responses)
 * @param {Object} user2 - Second user's complete profile data (profile + responses)
 * @returns {Object} Detailed compatibility analysis
 */
export const calculateDetailedCompatibility = (user1, user2) => {
  try {
    console.log(`Calculating detailed compatibility between users`);
    
    // Validate input data
    if (!user1 || !user2) {
      throw new Error('Missing user profile data for compatibility calculation');
    }
    
    // Calculate compatibility scores for each category
    const scores = {
      lifestyle: calculateLifestyleCompatibility(user1, user2),
      age: calculateAgeCompatibility(user1, user2),
      budget: calculateBudgetCompatibility(user1, user2),
      recovery: calculateRecoveryCompatibility(user1, user2),
      interests: calculateInterestsCompatibility(user1, user2),
      spiritual: calculateSpiritualCompatibility(user1, user2),
      housing: calculateHousingCompatibility(user1, user2),
      gender: calculateGenderCompatibility(user1, user2),
      preferences: calculatePreferencesCompatibility(user1, user2),
      location: calculateLocationCompatibility(user1, user2)
    };

    // Weights based on importance for recovery housing matching
    const weights = {
      location: 20,   // HIGH PRIORITY - Geographic compatibility
      lifestyle: 20,  // Cleanliness, noise, social levels
      recovery: 18,   // Recovery stage and methods
      budget: 15,     // Budget compatibility
      gender: 10,     // Gender preferences
      age: 6,         // Age compatibility
      spiritual: 5,   // Spiritual alignment
      preferences: 4, // Living preferences
      interests: 2,   // Shared interests
      housing: 1      // Housing subsidy match
    };
    
    // Calculate weighted overall score
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(weights).forEach(([category, weight]) => {
      if (scores[category] !== null && scores[category] !== undefined) {
        totalScore += scores[category] * weight;
        totalWeight += weight;
      }
    });
    
    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    return {
      compatibility_score: overallScore,
      score_breakdown: scores,
      user1_id: user1.id || user1.user_id,
      user2_id: user2.id || user2.user_id,
      calculated_at: new Date().toISOString(),
      weights: weights
    };
    
  } catch (error) {
    console.error('Error calculating detailed compatibility:', error);
    throw error;
  }
};

/**
 * Calculate lifestyle compatibility (cleanliness, noise, social levels, schedules)
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Lifestyle compatibility score (0-100)
 */
export const calculateLifestyleCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Cleanliness level (1-5 scale)
  if (user1.cleanliness_level && user2.cleanliness_level) {
    const diff = Math.abs(user1.cleanliness_level - user2.cleanliness_level);
    const cleanScore = Math.max(0, 100 - (diff * 25)); // 25 points per level difference
    totalScore += cleanScore;
    factors++;
  }
  
  // Noise level (1-5 scale)
  if (user1.noise_level && user2.noise_level) {
    const diff = Math.abs(user1.noise_level - user2.noise_level);
    const noiseScore = Math.max(0, 100 - (diff * 25));
    totalScore += noiseScore;
    factors++;
  }
  
  // Social level (1-5 scale)
  if (user1.social_level && user2.social_level) {
    const diff = Math.abs(user1.social_level - user2.social_level);
    const socialScore = Math.max(0, 100 - (diff * 25));
    totalScore += socialScore;
    factors++;
  }
  
  // Bedtime preference
  if (user1.bedtime_preference && user2.bedtime_preference) {
    const bedtimeScore = user1.bedtime_preference === user2.bedtime_preference ? 100 : 
                       isCompatibleBedtime(user1.bedtime_preference, user2.bedtime_preference) ? 75 : 25;
    totalScore += bedtimeScore;
    factors++;
  }
  
  // Work schedule compatibility
  if (user1.work_schedule && user2.work_schedule) {
    const workScore = user1.work_schedule === user2.work_schedule ? 100 :
                     isCompatibleWorkSchedule(user1.work_schedule, user2.work_schedule) ? 75 : 50;
    totalScore += workScore;
    factors++;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * Calculate age compatibility
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Age compatibility score (0-100)
 */
export const calculateAgeCompatibility = (user1, user2) => {
  if (!user1.age || !user2.age) return 50; // Default if age not provided
  
  const ageDiff = Math.abs(user1.age - user2.age);
  
  if (ageDiff === 0) return 100; // Perfect match
  if (ageDiff <= 3) return 90;   // Within 3 years
  if (ageDiff <= 6) return 75;   // Within 6 years
  if (ageDiff <= 10) return 60;  // Within 10 years
  if (ageDiff <= 15) return 45;  // Within 15 years
  return 30; // More than 15 years apart
};

/**
 * Calculate budget compatibility
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Budget compatibility score (0-100)
 */
export const calculateBudgetCompatibility = (user1, user2) => {
  if (!user1.budget_max || !user2.budget_max) return 50;
  
  const budgetDiff = Math.abs(user1.budget_max - user2.budget_max);
  
  if (budgetDiff === 0) return 100; // Perfect match
  
  // Decrease score by 2 points for every $50 difference
  const score = Math.max(0, 100 - Math.floor(budgetDiff / 50) * 2);
  return score;
};

/**
 * Calculate recovery compatibility (stage, methods, issues)
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Recovery compatibility score (0-100)
 */
export const calculateRecoveryCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Recovery stage compatibility
  if (user1.recovery_stage && user2.recovery_stage) {
    const stageScore = calculateRecoveryStageCompatibility(
      user1.recovery_stage, 
      user2.recovery_stage
    );
    totalScore += stageScore;
    factors++;
  }
  
  // Recovery methods overlap
  if (user1.recovery_methods && user2.recovery_methods) {
    const methodsScore = calculateArrayOverlapScore(
      user1.recovery_methods, 
      user2.recovery_methods
    );
    totalScore += methodsScore;
    factors++;
  }
  
  // Primary issues consideration
  if (user1.primary_issues && user2.primary_issues) {
    const issuesScore = calculatePrimaryIssuesCompatibility(
      user1.primary_issues,
      user2.primary_issues
    );
    totalScore += issuesScore;
    factors++;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * Calculate spiritual compatibility
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Spiritual compatibility score (0-100)
 */
export const calculateSpiritualCompatibility = (user1, user2) => {
  const spiritual1 = user1.spiritual_affiliation;
  const spiritual2 = user2.spiritual_affiliation;
  
  if (!spiritual1 || !spiritual2) return 75; // Default if not specified
  
  if (spiritual1 === spiritual2) return 100; // Perfect match
  
  // Define compatibility groups
  const christianGroups = ['christian-protestant', 'christian-catholic'];
  const spiritualButNotReligious = ['spiritual-not-religious', 'agnostic'];
  const nonReligious = ['agnostic', 'atheist'];
  
  // Same group compatibility
  if (christianGroups.includes(spiritual1) && christianGroups.includes(spiritual2)) return 90;
  if (spiritualButNotReligious.includes(spiritual1) && spiritualButNotReligious.includes(spiritual2)) return 90;
  if (nonReligious.includes(spiritual1) && nonReligious.includes(spiritual2)) return 90;
  
  // Moderate compatibility
  if (spiritual1 === 'spiritual-not-religious' || spiritual2 === 'spiritual-not-religious') return 70;
  if (spiritual1 === 'other' || spiritual2 === 'other') return 65;
  
  // Lower compatibility for very different worldviews
  const potentialConflicts = [
    ['christian-protestant', 'muslim'],
    ['christian-catholic', 'muslim'],
    ['christian-protestant', 'atheist'],
    ['christian-catholic', 'atheist'],
    ['muslim', 'atheist'],
    ['jewish', 'muslim']
  ];
  
  const isConflict = potentialConflicts.some(([a, b]) => 
    (spiritual1 === a && spiritual2 === b) || (spiritual1 === b && spiritual2 === a)
  );
  
  return isConflict ? 35 : 60;
};

/**
 * Calculate interests compatibility
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Interests compatibility score (0-100)
 */
export const calculateInterestsCompatibility = (user1, user2) => {
  if (!user1.interests || !user2.interests) return 50;
  
  return calculateArrayOverlapScore(user1.interests, user2.interests);
};

/**
 * Calculate housing compatibility
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Housing compatibility score (0-100)
 */
export const calculateHousingCompatibility = (user1, user2) => {
  if (!user1.housing_subsidy || !user2.housing_subsidy) return 75;
  
  const overlap = calculateArrayOverlapScore(user1.housing_subsidy, user2.housing_subsidy);
  return Math.max(50, overlap); // Minimum 50 even if no overlap
};

/**
 * Calculate gender preference compatibility
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Gender compatibility score (0 or 100)
 */
export const calculateGenderCompatibility = (user1, user2) => {
  const user1Gender = user1.gender;
  const user2Gender = user2.gender;
  const user1Pref = user1.preferred_roommate_gender;
  const user2Pref = user2.preferred_roommate_gender;
  
  // If no preferences specified, assume compatibility
  if (!user1Pref && !user2Pref) return 100;
  if (!user1Pref) return checkGenderPreference(user2Pref, user2Gender, user1Gender);
  if (!user2Pref) return checkGenderPreference(user1Pref, user1Gender, user2Gender);
  
  // Check both preferences
  const user1Compatible = checkGenderPreference(user1Pref, user1Gender, user2Gender);
  const user2Compatible = checkGenderPreference(user2Pref, user2Gender, user1Gender);
  
  // Both must be compatible
  return Math.min(user1Compatible, user2Compatible);
};

/**
 * Calculate living preferences compatibility
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Preferences compatibility score (0-100)
 */
export const calculatePreferencesCompatibility = (user1, user2) => {
  let totalScore = 0;
  let factors = 0;
  
  // Binary preferences that should match
  const binaryPrefs = [
    'pets_owned', 'pets_comfortable', 'overnight_guests_ok', 'shared_groceries'
  ];
  
  binaryPrefs.forEach(pref => {
    if (user1[pref] !== undefined && user2[pref] !== undefined) {
      totalScore += user1[pref] === user2[pref] ? 100 : 40; // Penalty for mismatch
      factors++;
    }
  });
  
  // Smoking compatibility
  if (user1.smoking_status && user2.smoking_status) {
    const smokingScore = calculateSmokingCompatibility(user1.smoking_status, user2.smoking_status);
    totalScore += smokingScore;
    factors++;
  }
  
  // Guest policy compatibility
  if (user1.guests_policy && user2.guests_policy) {
    const guestScore = calculateGuestCompatibility(user1.guests_policy, user2.guests_policy);
    totalScore += guestScore;
    factors++;
  }
  
  return factors > 0 ? Math.round(totalScore / factors) : 50;
};

/**
 * Calculate location compatibility (placeholder for now)
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Location compatibility score (0-100)
 */
export const calculateLocationCompatibility = (user1, user2) => {
  // This would integrate with a ZIP code compatibility function
  // For now, return a default moderate score
  if (window.calculateZipCodeCompatibility) {
    return window.calculateZipCodeCompatibility(user1, user2);
  }
  return 50;
};

// ===== HELPER FUNCTIONS =====

/**
 * Check bedtime compatibility
 */
const isCompatibleBedtime = (bedtime1, bedtime2) => {
  const compatible = {
    'early': ['moderate'],
    'moderate': ['early', 'late'],
    'late': ['moderate'],
    'varies': ['early', 'moderate', 'late']
  };
  return compatible[bedtime1]?.includes(bedtime2) || compatible[bedtime2]?.includes(bedtime1);
};

/**
 * Check work schedule compatibility
 */
const isCompatibleWorkSchedule = (schedule1, schedule2) => {
  const compatible = {
    'traditional_9_5': ['flexible', 'student'],
    'flexible': ['traditional_9_5', 'student', 'irregular'],
    'student': ['traditional_9_5', 'flexible', 'irregular'],
    'early_morning': ['night_shift'], // Opposite schedules can work
    'night_shift': ['early_morning']
  };
  return compatible[schedule1]?.includes(schedule2) || compatible[schedule2]?.includes(schedule1);
};

/**
 * Calculate recovery stage compatibility
 */
const calculateRecoveryStageCompatibility = (stage1, stage2) => {
  if (stage1 === stage2) return 100;
  
  const stageOrder = ['early', 'stabilizing', 'stable', 'long-term'];
  const index1 = stageOrder.indexOf(stage1);
  const index2 = stageOrder.indexOf(stage2);
  
  if (index1 === -1 || index2 === -1) return 50;
  
  const diff = Math.abs(index1 - index2);
  if (diff === 1) return 80; // Adjacent stages
  if (diff === 2) return 60; // Two stages apart
  return 40; // Three stages apart
};

/**
 * Calculate primary issues compatibility
 */
const calculatePrimaryIssuesCompatibility = (issues1, issues2) => {
  const sharedIssues = issues1.filter(issue => issues2.includes(issue));
  
  if (sharedIssues.length > 0) {
    return 100; // Shared understanding through similar experiences
  }
  
  // Different issues but still compatible for mutual support
  return 75;
};

/**
 * Check gender preference
 */
const checkGenderPreference = (preference, userGender, otherGender) => {
  switch (preference) {
    case 'no_preference':
      return 100;
    case 'same_gender':
      return userGender === otherGender ? 100 : 0; // Hard incompatibility
    case 'different_gender':
      return userGender !== otherGender ? 100 : 0; // Hard incompatibility
    default:
      return 100;
  }
};

/**
 * Calculate smoking compatibility
 */
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

/**
 * Calculate guest policy compatibility
 */
const calculateGuestCompatibility = (guests1, guests2) => {
  if (guests1 === guests2) return 100;
  
  const guestOrder = ['no_guests', 'rare_guests', 'moderate_guests', 'frequent_guests'];
  const index1 = guestOrder.indexOf(guests1);
  const index2 = guestOrder.indexOf(guests2);
  
  if (index1 === -1 || index2 === -1) return 50;
  
  const diff = Math.abs(index1 - index2);
  if (diff === 1) return 75; // Adjacent levels
  if (diff === 2) return 50; // Two levels apart
  return 25; // Opposite extremes
};

/**
 * Calculate array overlap score using Jaccard similarity
 */
const calculateArrayOverlapScore = (array1, array2) => {
  if (!array1?.length || !array2?.length) return 50;
  
  const overlap = array1.filter(item => array2.includes(item));
  const union = [...new Set([...array1, ...array2])];
  
  // Jaccard similarity coefficient * 100
  return Math.round((overlap.length / union.length) * 100);
};

/**
 * Enhanced match filtering function
 * @param {string} userId - Target user ID
 * @param {number} minScore - Minimum compatibility score
 * @param {number} limit - Maximum number of results
 * @returns {Array} Array of compatible matches
 */
export const findCompatibleMatches = async (userId = null, minScore = 60, limit = 20) => {
  // This would integrate with database queries and user data fetching
  // Implementation depends on the specific database structure and data access patterns
  throw new Error('findCompatibleMatches not implemented - requires database integration');
};

/**
 * Main matching function (legacy compatibility)
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {number} Overall compatibility score
 */
export const calculateMatchScore = (user1, user2) => {
  const result = calculateDetailedCompatibility(user1, user2);
  return result.compatibility_score;
};

/**
 * Detailed match calculation (legacy compatibility)
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {Object} Detailed match analysis
 */
export const calculateDetailedMatch = (user1, user2) => {
  const result = calculateDetailedCompatibility(user1, user2);
  
  return {
    overallScore: result.compatibility_score,
    breakdown: {
      recovery: {
        score: result.score_breakdown.recovery,
        weight: '18%',
        details: 'Recovery stage and methods compatibility'
      },
      lifestyle: {
        score: result.score_breakdown.lifestyle,
        weight: '20%',
        details: 'Lifestyle preferences alignment'
      },
      budget: {
        score: result.score_breakdown.budget,
        weight: '15%',
        details: 'Budget compatibility'
      },
      location: {
        score: result.score_breakdown.location,
        weight: '20%',
        details: 'Geographic location compatibility'
      },
      gender: {
        score: result.score_breakdown.gender,
        weight: '10%',
        details: 'Gender preference compatibility'
      },
      spiritual: {
        score: result.score_breakdown.spiritual,
        weight: '5%',
        details: 'Spiritual and religious compatibility'
      },
      interests: {
        score: result.score_breakdown.interests,
        weight: '2%',
        details: 'Common interests and hobbies'
      },
      housing: {
        score: result.score_breakdown.housing,
        weight: '1%',
        details: 'Housing assistance compatibility'
      },
      preferences: {
        score: result.score_breakdown.preferences,
        weight: '4%',
        details: 'Living preferences compatibility'
      },
      age: {
        score: result.score_breakdown.age,
        weight: '6%',
        details: 'Age compatibility'
      }
    }
  };
};

export default {
  calculateMatchScore,
  calculateDetailedMatch,
  calculateDetailedCompatibility,
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
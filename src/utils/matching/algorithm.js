// src/utils/matching/algorithm.js

/**
 * Core matching algorithm for Recovery Housing Connect
 * Calculates compatibility scores between users based on multiple factors
 */

/**
 * Calculate overall match score between two users
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @returns {number} Match score (0-100)
 */
export const calculateMatchScore = (user1, user2) => {
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Recovery stage compatibility (25% weight)
  const recoveryScore = calculateRecoveryCompatibility(user1, user2);
  totalScore += recoveryScore.score;
  maxPossibleScore += recoveryScore.maxScore;

  // Program type overlap (20% weight)
  const programScore = calculateProgramCompatibility(user1, user2);
  totalScore += programScore.score;
  maxPossibleScore += programScore.maxScore;

  // Interest overlap (15% weight)
  const interestScore = calculateInterestCompatibility(user1, user2);
  totalScore += interestScore.score;
  maxPossibleScore += interestScore.maxScore;

  // Housing preferences (15% weight)
  const housingScore = calculateHousingCompatibility(user1, user2);
  totalScore += housingScore.score;
  maxPossibleScore += housingScore.maxScore;

  // Lifestyle compatibility (15% weight)
  const lifestyleScore = calculateLifestyleCompatibility(user1, user2);
  totalScore += lifestyleScore.score;
  maxPossibleScore += lifestyleScore.maxScore;

  // Demographics compatibility (10% weight)
  const demographicsScore = calculateDemographicsCompatibility(user1, user2);
  totalScore += demographicsScore.score;
  maxPossibleScore += demographicsScore.maxScore;

  // Convert to percentage
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

/**
 * Calculate recovery stage compatibility
 */
export const calculateRecoveryCompatibility = (user1, user2) => {
  const maxScore = 25;
  
  if (!user1.recovery_stage || !user2.recovery_stage) {
    return { score: 0, maxScore };
  }

  const stages = ['early', 'stable', 'maintained', 'long-term'];
  const user1Index = stages.indexOf(user1.recovery_stage);
  const user2Index = stages.indexOf(user2.recovery_stage);
  
  if (user1Index === -1 || user2Index === -1) {
    return { score: 0, maxScore };
  }

  const stageDifference = Math.abs(user1Index - user2Index);
  
  let score;
  switch (stageDifference) {
    case 0: score = maxScore; break;      // Same stage
    case 1: score = maxScore * 0.8; break; // Adjacent stages
    case 2: score = maxScore * 0.4; break; // Two stages apart
    case 3: score = maxScore * 0.1; break; // Furthest apart
    default: score = 0;
  }

  return { score, maxScore };
};

/**
 * Calculate program type compatibility
 */
export const calculateProgramCompatibility = (user1, user2) => {
  const maxScore = 20;
  
  const programs1 = user1.program_type || [];
  const programs2 = user2.program_type || [];
  
  if (programs1.length === 0 || programs2.length === 0) {
    return { score: 0, maxScore };
  }

  const commonPrograms = programs1.filter(program => programs2.includes(program));
  const totalPrograms = Math.max(programs1.length, programs2.length);
  
  // Score based on overlap percentage
  const overlapPercentage = commonPrograms.length / totalPrograms;
  const score = Math.min(maxScore, overlapPercentage * maxScore * 1.5); // Bonus for high overlap

  return { score, maxScore };
};

/**
 * Calculate interest compatibility
 */
export const calculateInterestCompatibility = (user1, user2) => {
  const maxScore = 15;
  
  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  
  if (interests1.length === 0 || interests2.length === 0) {
    return { score: 0, maxScore };
  }

  const commonInterests = interests1.filter(interest => interests2.includes(interest));
  const totalInterests = Math.max(interests1.length, interests2.length);
  
  // Score based on overlap
  const overlapPercentage = commonInterests.length / totalInterests;
  const score = overlapPercentage * maxScore;

  return { score, maxScore };
};

/**
 * Calculate housing preferences compatibility
 */
export const calculateHousingCompatibility = (user1, user2) => {
  const maxScore = 15;
  let score = 0;

  // Housing type compatibility (5 points)
  const housingTypes1 = user1.housing_type || [];
  const housingTypes2 = user2.housing_type || [];
  const commonHousingTypes = housingTypes1.filter(type => housingTypes2.includes(type));
  if (commonHousingTypes.length > 0) score += 5;

  // Price range overlap (5 points)
  if (user1.price_range_min && user1.price_range_max && 
      user2.price_range_min && user2.price_range_max) {
    const overlap = Math.max(0, 
      Math.min(user1.price_range_max, user2.price_range_max) - 
      Math.max(user1.price_range_min, user2.price_range_min)
    );
    if (overlap > 0) score += 5;
  }

  // Location compatibility (5 points)
  if (user1.preferred_location && user2.preferred_location) {
    const location1 = user1.preferred_location.toLowerCase();
    const location2 = user2.preferred_location.toLowerCase();
    
    // Check for city/state matches
    if (location1.includes(location2) || location2.includes(location1)) {
      score += 5;
    }
  }

  return { score, maxScore };
};

/**
 * Calculate lifestyle compatibility
 */
export const calculateLifestyleCompatibility = (user1, user2) => {
  const maxScore = 15;
  let score = 0;

  // Work schedule compatibility (3 points)
  if (user1.work_schedule && user2.work_schedule) {
    if (user1.work_schedule === user2.work_schedule) {
      score += 3;
    } else if (areSchedulesCompatible(user1.work_schedule, user2.work_schedule)) {
      score += 2;
    }
  }

  // Cleanliness level (3 points)
  if (user1.cleanliness_level && user2.cleanliness_level) {
    const cleanlinessScore = calculateCleanlinessCompatibility(
      user1.cleanliness_level, 
      user2.cleanliness_level
    );
    score += cleanlinessScore;
  }

  // Noise level (3 points)
  if (user1.noise_level && user2.noise_level) {
    const noiseScore = calculateNoiseCompatibility(
      user1.noise_level, 
      user2.noise_level
    );
    score += noiseScore;
  }

  // Social level (3 points)
  if (user1.social_level && user2.social_level) {
    const socialScore = calculateSocialCompatibility(
      user1.social_level, 
      user2.social_level
    );
    score += socialScore;
  }

  // Smoking preference (3 points)
  if (user1.smoking_preference && user2.smoking_preference) {
    if (user1.smoking_preference === user2.smoking_preference) {
      score += 3;
    } else if (user1.smoking_preference === 'non-smoking' && 
               user2.smoking_preference === 'non-smoking') {
      score += 3; // Both non-smoking is highly compatible
    }
  }

  return { score, maxScore };
};

/**
 * Calculate demographics compatibility
 */
export const calculateDemographicsCompatibility = (user1, user2) => {
  const maxScore = 10;
  let score = 0;

  // Age compatibility (5 points)
  if (user1.age && user2.age) {
    const ageDifference = Math.abs(user1.age - user2.age);
    if (ageDifference <= 3) score += 5;
    else if (ageDifference <= 7) score += 3;
    else if (ageDifference <= 15) score += 1;
  }

  // Gender preference compatibility (5 points)
  if (user1.gender_preference && user2.gender_preference) {
    if (user1.gender_preference === 'any' || user2.gender_preference === 'any') {
      score += 5;
    } else if (user1.gender_preference === user2.gender_preference) {
      score += 5;
    }
  }

  return { score, maxScore };
};

/**
 * Helper function to check schedule compatibility
 */
const areSchedulesCompatible = (schedule1, schedule2) => {
  const compatiblePairs = [
    ['traditional', 'remote'],
    ['early', 'traditional'],
    ['student', 'remote'],
    ['remote', 'student']
  ];

  return compatiblePairs.some(pair => 
    (pair[0] === schedule1 && pair[1] === schedule2) ||
    (pair[1] === schedule1 && pair[0] === schedule2)
  );
};

/**
 * Helper function for cleanliness compatibility
 */
const calculateCleanlinessCompatibility = (level1, level2) => {
  const levels = ['messy', 'moderate', 'clean', 'very-clean'];
  const index1 = levels.indexOf(level1);
  const index2 = levels.indexOf(level2);
  
  if (index1 === -1 || index2 === -1) return 0;
  
  const difference = Math.abs(index1 - index2);
  if (difference === 0) return 3;
  if (difference === 1) return 2;
  if (difference === 2) return 1;
  return 0;
};

/**
 * Helper function for noise compatibility
 */
const calculateNoiseCompatibility = (level1, level2) => {
  const levels = ['very-quiet', 'quiet', 'moderate', 'loud'];
  const index1 = levels.indexOf(level1);
  const index2 = levels.indexOf(level2);
  
  if (index1 === -1 || index2 === -1) return 0;
  
  const difference = Math.abs(index1 - index2);
  if (difference === 0) return 3;
  if (difference === 1) return 2;
  if (difference === 2) return 1;
  return 0;
};

/**
 * Helper function for social compatibility
 */
const calculateSocialCompatibility = (level1, level2) => {
  const levels = ['very-introverted', 'introverted', 'moderate', 'social', 'very-social'];
  const index1 = levels.indexOf(level1);
  const index2 = levels.indexOf(level2);
  
  if (index1 === -1 || index2 === -1) return 0;
  
  const difference = Math.abs(index1 - index2);
  if (difference === 0) return 3;
  if (difference === 1) return 2;
  if (difference === 2) return 1;
  return 0;
};

/**
 * Calculate match score with detailed breakdown
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @returns {Object} Detailed match analysis
 */
export const calculateDetailedMatch = (user1, user2) => {
  const recoveryScore = calculateRecoveryCompatibility(user1, user2);
  const programScore = calculateProgramCompatibility(user1, user2);
  const interestScore = calculateInterestCompatibility(user1, user2);
  const housingScore = calculateHousingCompatibility(user1, user2);
  const lifestyleScore = calculateLifestyleCompatibility(user1, user2);
  const demographicsScore = calculateDemographicsCompatibility(user1, user2);

  const totalScore = recoveryScore.score + programScore.score + interestScore.score + 
                    housingScore.score + lifestyleScore.score + demographicsScore.score;
  const maxPossibleScore = recoveryScore.maxScore + programScore.maxScore + 
                          interestScore.maxScore + housingScore.maxScore + 
                          lifestyleScore.maxScore + demographicsScore.maxScore;

  const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return {
    overallScore,
    breakdown: {
      recovery: {
        score: Math.round((recoveryScore.score / recoveryScore.maxScore) * 100),
        weight: '25%',
        details: 'Recovery stage compatibility'
      },
      programs: {
        score: Math.round((programScore.score / programScore.maxScore) * 100),
        weight: '20%',
        details: 'Shared recovery programs'
      },
      interests: {
        score: Math.round((interestScore.score / interestScore.maxScore) * 100),
        weight: '15%',
        details: 'Common interests and hobbies'
      },
      housing: {
        score: Math.round((housingScore.score / housingScore.maxScore) * 100),
        weight: '15%',
        details: 'Housing preferences alignment'
      },
      lifestyle: {
        score: Math.round((lifestyleScore.score / lifestyleScore.maxScore) * 100),
        weight: '15%',
        details: 'Lifestyle compatibility'
      },
      demographics: {
        score: Math.round((demographicsScore.score / demographicsScore.maxScore) * 100),
        weight: '10%',
        details: 'Age and gender preferences'
      }
    }
  };
};

export default {
  calculateMatchScore,
  calculateDetailedMatch,
  calculateRecoveryCompatibility,
  calculateProgramCompatibility,
  calculateInterestCompatibility,
  calculateHousingCompatibility,
  calculateLifestyleCompatibility,
  calculateDemographicsCompatibility
};
// src/utils/matching/compatibility.js

import { calculateDetailedCompatibility, calculateDetailedMatch } from './algorithm';

/**
 * Generate detailed compatibility flags based on user data and scores
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @param {Object} scores - Compatibility scores from algorithm
 * @returns {Object} Object with greenFlags and redFlags arrays
 */
export const generateDetailedFlags = (user1, user2, scores) => {
  const greenFlags = [];
  const redFlags = [];
  
  // Lifestyle flags
  if (scores.lifestyle >= 85) {
    greenFlags.push('Very compatible lifestyle preferences');
  } else if (scores.lifestyle <= 40) {
    redFlags.push('Significantly different lifestyle preferences');
  }
  
  // Age flags
  if (scores.age >= 90) {
    greenFlags.push('Similar ages for easy connection');
  } else if (scores.age <= 45) {
    redFlags.push('Considerable age difference to consider');
  }
  
  // Budget flags
  if (scores.budget >= 90) {
    greenFlags.push('Very similar budget ranges');
  } else if (scores.budget <= 50) {
    redFlags.push('Different budget expectations');
  }
  
  // Recovery flags
  if (scores.recovery >= 85) {
    greenFlags.push('Strong recovery stage compatibility');
  } else if (scores.recovery <= 50) {
    redFlags.push('Different recovery approaches or stages');
  }
  
  // Gender preference flags
  if (scores.gender === 0) {
    redFlags.push('Incompatible gender preferences - this match should be filtered');
  } else if (scores.gender === 100) {
    greenFlags.push('Perfect gender preference match');
  }
  
  // Spiritual flags
  if (scores.spiritual >= 90) {
    greenFlags.push('Shared spiritual/religious outlook');
  } else if (scores.spiritual <= 40) {
    redFlags.push('Very different religious/spiritual beliefs');
  }
  
  // Location flags (if available)
  if (scores.location >= 95) {
    greenFlags.push('Perfect location match!');
  } else if (scores.location >= 75) {
    greenFlags.push('Good location compatibility');
  } else if (scores.location <= 30) {
    redFlags.push('Very different target areas');
  }
  
  // Smoking flags
  if (user1.smoking_status && user2.smoking_status) {
    if (user1.smoking_status === 'non_smoker' && user2.smoking_status === 'regular') {
      redFlags.push('Non-smoker matched with regular smoker');
    } else if (user1.smoking_status === user2.smoking_status) {
      greenFlags.push('Matching smoking preferences');
    }
  }
  
  // Binary preference flags
  const binaryPrefs = [
    { key: 'overnight_guests_ok', label: 'overnight guests' },
    { key: 'shared_groceries', label: 'grocery sharing' },
    { key: 'pets_owned', label: 'pet ownership' }
  ];
  
  binaryPrefs.forEach(({ key, label }) => {
    if (user1[key] !== undefined && user2[key] !== undefined) {
      if (user1[key] === user2[key]) {
        greenFlags.push(`Matching ${label} preferences`);
      } else {
        redFlags.push(`Different ${label} preferences`);
      }
    }
  });
  
  // Interest flags
  if (scores.interests >= 70) {
    greenFlags.push('Several shared interests and hobbies');
  }
  
  // Recovery method flags
  if (user1.recovery_methods && user2.recovery_methods) {
    const sharedMethods = user1.recovery_methods.filter(method => 
      user2.recovery_methods.includes(method)
    );
    if (sharedMethods.length > 0) {
      greenFlags.push(`Shared recovery methods: ${sharedMethods.slice(0, 2).join(', ')}`);
    }
  }
  
  // Program type flags
  if (user1.program_type && user2.program_type) {
    const sharedPrograms = user1.program_type.filter(program => 
      user2.program_type.includes(program)
    );
    if (sharedPrograms.length > 0) {
      greenFlags.push(`Shared recovery programs: ${sharedPrograms.slice(0, 2).join(', ')}`);
    }
  }
  
  return { green: greenFlags, red: redFlags };
};

/**
 * Generate compatibility flags (legacy function for backward compatibility)
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @param {number} matchScore - Overall match score
 * @returns {Object} Object with greenFlags and redFlags arrays
 */
export const generateCompatibilityFlags = (user1, user2, matchScore) => {
  const greenFlags = [];
  const redFlags = [];

  // Recovery program overlap
  const programOverlap = (user1.program_type || []).filter(program => 
    (user2.program_type || []).includes(program)
  );
  if (programOverlap.length > 0) {
    if (programOverlap.length === 1) {
      greenFlags.push(`Shared program: ${programOverlap[0]}`);
    } else {
      greenFlags.push(`Shared programs: ${programOverlap.slice(0, 2).join(', ')}${programOverlap.length > 2 ? '...' : ''}`);
    }
  }

  // Interest overlap
  const interestOverlap = (user1.interests || []).filter(interest => 
    (user2.interests || []).includes(interest)
  );
  if (interestOverlap.length >= 2) {
    greenFlags.push(`Common interests: ${interestOverlap.slice(0, 2).join(', ')}`);
  }

  // Recovery stage compatibility
  if (user1.recovery_stage === user2.recovery_stage) {
    greenFlags.push('Similar recovery stage');
  }

  // Lifestyle compatibility
  if (user1.smoking_status === user2.smoking_status && user1.smoking_status === 'non_smoker') {
    greenFlags.push('Both non-smoking');
  }

  if (user1.cleanliness_level === user2.cleanliness_level) {
    greenFlags.push('Compatible cleanliness standards');
  }

  if (user1.work_schedule === user2.work_schedule) {
    greenFlags.push('Similar work schedules');
  }

  // Check for location compatibility using new city/state fields
  const user1HasLocation = user1.preferred_city || user1.preferred_state;
  const user2HasLocation = user2.preferred_city || user2.preferred_state;
  
  if (user1HasLocation && user2HasLocation) {
    const city1 = user1.preferred_city?.toLowerCase();
    const state1 = user1.preferred_state?.toLowerCase();
    const city2 = user2.preferred_city?.toLowerCase();
    const state2 = user2.preferred_state?.toLowerCase();
    
    // Check for exact matches
    if ((city1 && city2 && city1 === city2) && (state1 && state2 && state1 === state2)) {
      greenFlags.push('Same preferred city and state');
    } else if (city1 && city2 && city1 === city2) {
      greenFlags.push('Same preferred city');
    } else if (state1 && state2 && state1 === state2) {
      greenFlags.push('Same preferred state');
    }
  }

  // Age compatibility
  if (user1.age && user2.age) {
    const ageDifference = Math.abs(user1.age - user2.age);
    if (ageDifference <= 5) {
      greenFlags.push('Similar age group');
    }
  }

  // RED FLAGS

  // Overall low compatibility
  if (matchScore < 40) {
    redFlags.push('Lower overall compatibility');
  }

  // Budget mismatch
  if (user1.budget_max && user2.budget_max) {
    const budgetDiff = Math.abs(user1.budget_max - user2.budget_max);
    if (budgetDiff > 500) {
      redFlags.push('Significant budget difference');
    }
  }

  // Recovery stage mismatch
  if (user1.recovery_stage && user2.recovery_stage) {
    const stages = ['early', 'stabilizing', 'stable', 'long-term'];
    const user1Index = stages.indexOf(user1.recovery_stage);
    const user2Index = stages.indexOf(user2.recovery_stage);
    if (user1Index !== -1 && user2Index !== -1 && Math.abs(user1Index - user2Index) > 2) {
      redFlags.push('Very different recovery stages');
    }
  }

  // Deal breaker conflicts
  const dealBreakers1 = user1.deal_breakers || [];
  const dealBreakers2 = user2.deal_breakers || [];
  
  if (user1.smoking_status === 'regular' && dealBreakers2.includes('Smoking indoors')) {
    redFlags.push('Smoking preference conflict');
  }
  if (user2.smoking_status === 'regular' && dealBreakers1.includes('Smoking indoors')) {
    redFlags.push('Smoking preference conflict');
  }

  // Large age gap
  if (user1.age && user2.age) {
    const ageDifference = Math.abs(user1.age - user2.age);
    if (ageDifference > 15) {
      redFlags.push('Significant age difference');
    }
  }

  // No shared interests
  if (interestOverlap.length === 0 && (user1.interests || []).length > 0 && (user2.interests || []).length > 0) {
    redFlags.push('No shared interests');
  }

  // No shared recovery programs
  if (programOverlap.length === 0 && (user1.program_type || []).length > 0 && (user2.program_type || []).length > 0) {
    redFlags.push('No shared recovery programs');
  }

  return { greenFlags, redFlags };
};

/**
 * Get comprehensive compatibility summary for two users
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @returns {Object} Comprehensive compatibility summary
 */
export const getCompatibilitySummary = (user1, user2) => {
  const detailedMatch = calculateDetailedCompatibility(user1, user2);
  const flags = generateDetailedFlags(user1, user2, detailedMatch.score_breakdown);
  
  let compatibilityLevel;
  let compatibilityDescription;
  
  if (detailedMatch.compatibility_score >= 80) {
    compatibilityLevel = 'excellent';
    compatibilityDescription = 'Highly compatible - strong potential for a successful roommate relationship';
  } else if (detailedMatch.compatibility_score >= 65) {
    compatibilityLevel = 'good';
    compatibilityDescription = 'Good compatibility - many shared values and preferences';
  } else if (detailedMatch.compatibility_score >= 50) {
    compatibilityLevel = 'moderate';
    compatibilityDescription = 'Moderate compatibility - some areas align well, others may need discussion';
  } else if (detailedMatch.compatibility_score >= 35) {
    compatibilityLevel = 'low';
    compatibilityDescription = 'Lower compatibility - significant differences to consider';
  } else {
    compatibilityLevel = 'poor';
    compatibilityDescription = 'Poor compatibility - many fundamental differences';
  }

  return {
    overallScore: detailedMatch.compatibility_score,
    level: compatibilityLevel,
    description: compatibilityDescription,
    breakdown: detailedMatch.score_breakdown,
    greenFlags: flags.green,
    redFlags: flags.red,
    recommendation: getRecommendation(detailedMatch.compatibility_score, flags),
    weights: detailedMatch.weights
  };
};

/**
 * Get recommendation based on compatibility score and flags
 * @param {number} score - Overall compatibility score
 * @param {Object} flags - Green and red flags
 * @returns {string} Recommendation text
 */
const getRecommendation = (score, flags) => {
  if (score >= 80) {
    return "Strong match! Consider reaching out to start a conversation.";
  } else if (score >= 65) {
    return "Good potential match. Review the compatibility details and consider connecting.";
  } else if (score >= 50) {
    return "Moderate match. Consider if the differences are manageable for your situation.";
  } else if (score >= 35) {
    return "Lower compatibility. Carefully review the red flags before proceeding.";
  } else {
    return "Poor match. Consider looking for more compatible roommates.";
  }
};

/**
 * Filter potential matches based on minimum compatibility requirements
 * @param {Array} candidates - Array of potential match candidates
 * @param {Object} userProfile - Current user's profile
 * @param {Object} filters - Filtering criteria
 * @returns {Array} Filtered and sorted matches
 */
export const filterAndRankMatches = (candidates, userProfile, filters = {}) => {
  const {
    minScore = 30,
    maxResults = 20,
    excludeRedFlags = [],
    requireGreenFlags = [],
    prioritizeFactors = []
  } = filters;

  let matches = candidates.map(candidate => {
    const summary = getCompatibilitySummary(userProfile, candidate);
    return {
      ...candidate,
      compatibility: summary
    };
  });

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

  // Sort by compatibility score (descending)
  matches.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

  // Apply priority factors if specified
  if (prioritizeFactors.length > 0) {
    matches = applyPriorityFactors(matches, prioritizeFactors);
  }

  // Limit results
  return matches.slice(0, maxResults);
};

/**
 * Apply priority factors to reorder matches
 * @param {Array} matches - Array of matches with compatibility data
 * @param {Array} priorityFactors - Factors to prioritize
 * @returns {Array} Reordered matches
 */
const applyPriorityFactors = (matches, priorityFactors) => {
  return matches.map(match => {
    let priorityBonus = 0;
    
    priorityFactors.forEach(factor => {
      switch (factor) {
        case 'recovery':
          if (match.compatibility.breakdown.recovery >= 80) {
            priorityBonus += 10;
          }
          break;
        case 'lifestyle':
          if (match.compatibility.breakdown.lifestyle >= 80) {
            priorityBonus += 8;
          }
          break;
        case 'location':
          if (match.compatibility.breakdown.location >= 80) {
            priorityBonus += 12;
          }
          break;
        case 'budget':
          if (match.compatibility.breakdown.budget >= 80) {
            priorityBonus += 8;
          }
          break;
        case 'spiritual':
          if (match.compatibility.breakdown.spiritual >= 80) {
            priorityBonus += 6;
          }
          break;
        case 'interests':
          if (match.compatibility.breakdown.interests >= 80) {
            priorityBonus += 4;
          }
          break;
        case 'gender':
          if (match.compatibility.breakdown.gender >= 80) {
            priorityBonus += 6;
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
 * Generate personalized match insights
 * @param {Object} userProfile - Current user's profile
 * @param {Object} matchProfile - Potential match's profile
 * @returns {Object} Personalized insights
 */
export const generateMatchInsights = (userProfile, matchProfile) => {
  const summary = getCompatibilitySummary(userProfile, matchProfile);
  const insights = [];

  // Recovery insights
  if (summary.breakdown.recovery >= 80) {
    insights.push({
      type: 'positive',
      category: 'recovery',
      message: 'You both are at similar stages in your recovery journey, which can provide mutual understanding and support.'
    });
  } else if (summary.breakdown.recovery < 50) {
    insights.push({
      type: 'consideration',
      category: 'recovery',
      message: 'You\'re at different stages in recovery. Consider how this might affect your living dynamic.'
    });
  }

  // Lifestyle insights
  if (summary.breakdown.lifestyle >= 75) {
    insights.push({
      type: 'positive',
      category: 'lifestyle',
      message: 'Your daily routines and lifestyle preferences align well, which can reduce potential conflicts.'
    });
  } else if (summary.breakdown.lifestyle < 40) {
    insights.push({
      type: 'consideration',
      category: 'lifestyle',
      message: 'Your lifestyle preferences differ significantly. Open communication about expectations will be important.'
    });
  }

  // Location insights
  if (summary.breakdown.location >= 80) {
    insights.push({
      type: 'positive',
      category: 'location',
      message: 'You have compatible location preferences, making it easier to find housing in areas you both like.'
    });
  } else if (summary.breakdown.location < 40) {
    insights.push({
      type: 'consideration',
      category: 'location',
      message: 'Your preferred locations differ significantly. You may need to compromise on location.'
    });
  }

  // Budget insights
  if (summary.breakdown.budget >= 80) {
    insights.push({
      type: 'positive',
      category: 'budget',
      message: 'You have similar budget ranges, making it easier to find affordable housing together.'
    });
  } else if (summary.breakdown.budget < 50) {
    insights.push({
      type: 'consideration',
      category: 'budget',
      message: 'Your budget expectations differ. Discuss how to handle cost-sharing and housing choices.'
    });
  }

  // Spiritual insights
  if (summary.breakdown.spiritual >= 80) {
    insights.push({
      type: 'positive',
      category: 'spiritual',
      message: 'Shared spiritual or religious outlook can provide additional common ground for your relationship.'
    });
  } else if (summary.breakdown.spiritual < 40) {
    insights.push({
      type: 'consideration',
      category: 'spiritual',
      message: 'You have different spiritual or religious perspectives. Respect for each other\'s beliefs will be important.'
    });
  }

  // Interest insights
  if (summary.breakdown.interests >= 60) {
    insights.push({
      type: 'positive',
      category: 'interests',
      message: 'Shared interests can help build friendship and make living together more enjoyable.'
    });
  }

  return {
    overallInsight: generateOverallInsight(summary.overallScore),
    specificInsights: insights,
    nextSteps: generateNextSteps(summary.overallScore, summary.redFlags.length)
  };
};

/**
 * Generate overall insight message
 */
const generateOverallInsight = (score) => {
  if (score >= 80) {
    return "This appears to be an excellent potential match with strong compatibility across multiple areas.";
  } else if (score >= 65) {
    return "This looks like a good potential match with solid compatibility in key areas.";
  } else if (score >= 50) {
    return "This could be a workable match, though you'll want to discuss the areas where you differ.";
  } else {
    return "This match has significant differences that would require careful consideration and open communication.";
  }
};

/**
 * Generate next steps recommendations
 */
const generateNextSteps = (score, redFlagCount) => {
  const steps = [];

  if (score >= 70) {
    steps.push("Send a match request to start the conversation");
    steps.push("Share your housing timeline and preferences");
    steps.push("Discuss your recovery goals and support needs");
  } else if (score >= 50) {
    steps.push("Review the compatibility details carefully");
    steps.push("Consider if the differences are manageable");
    if (redFlagCount > 0) {
      steps.push("Discuss the potential concerns openly if you proceed");
    }
    steps.push("Send a match request if you're comfortable with the compatibility level");
  } else {
    steps.push("Consider looking for more compatible matches");
    steps.push("If interested despite lower compatibility, plan for extensive communication");
    steps.push("Ensure you're both clear about expectations and boundaries");
  }

  return steps;
};

/**
 * Validate compatibility data structure
 * @param {Object} user1 - First user's data
 * @param {Object} user2 - Second user's data
 * @returns {boolean} Whether data is valid for compatibility calculation
 */
export const validateCompatibilityData = (user1, user2) => {
  if (!user1 || !user2) {
    return false;
  }

  // Check for essential fields
  const requiredFields = ['id', 'recovery_stage'];
  
  for (const field of requiredFields) {
    if (!user1[field] || !user2[field]) {
      console.warn(`Missing required field: ${field}`);
      return false;
    }
  }

  return true;
};

/**
 * Get compatibility score tier
 * @param {number} score - Compatibility score
 * @returns {string} Compatibility tier
 */
export const getCompatibilityTier = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'moderate';
  if (score >= 35) return 'low';
  return 'poor';
};

export default {
  generateCompatibilityFlags,
  generateDetailedFlags,
  getCompatibilitySummary,
  filterAndRankMatches,
  generateMatchInsights,
  validateCompatibilityData,
  getCompatibilityTier
};
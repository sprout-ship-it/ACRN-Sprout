// src/utils/matching/compatibility.js

import { calculateDetailedMatch } from './algorithm';

/**
 * Generate compatibility flags (green flags and red flags) for two users
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @param {number} matchScore - Overall match score
 * @returns {Object} Object with greenFlags and redFlags arrays
 */
export const generateCompatibilityFlags = (user1, user2, matchScore) => {
  const greenFlags = [];
  const redFlags = [];

  // Recovery program overlap (Green Flag)
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

  // Interest overlap (Green Flag)
  const interestOverlap = (user1.interests || []).filter(interest => 
    (user2.interests || []).includes(interest)
  );
  if (interestOverlap.length >= 2) {
    greenFlags.push(`Common interests: ${interestOverlap.slice(0, 2).join(', ')}`);
  }

  // Recovery stage compatibility (Green Flag)
  if (user1.recovery_stage === user2.recovery_stage) {
    greenFlags.push('Similar recovery stage');
  }

  // Lifestyle compatibility (Green Flags)
  if (user1.smoking_preference === user2.smoking_preference && user1.smoking_preference === 'non-smoking') {
    greenFlags.push('Both non-smoking');
  }

  if (user1.cleanliness_level === user2.cleanliness_level) {
    greenFlags.push('Compatible cleanliness standards');
  }

  if (user1.work_schedule === user2.work_schedule) {
    greenFlags.push('Similar work schedules');
  }

  // Location compatibility (Green Flag)
  if (user1.preferred_location && user2.preferred_location) {
    const location1 = user1.preferred_location.toLowerCase();
    const location2 = user2.preferred_location.toLowerCase();
    if (location1.includes(location2) || location2.includes(location1)) {
      greenFlags.push('Same preferred location');
    }
  }

  // Price range compatibility (Green Flag)
  if (user1.price_range_min && user1.price_range_max && 
      user2.price_range_min && user2.price_range_max) {
    const overlap = Math.max(0, 
      Math.min(user1.price_range_max, user2.price_range_max) - 
      Math.max(user1.price_range_min, user2.price_range_min)
    );
    if (overlap > 200) { // Significant price range overlap
      greenFlags.push('Compatible budget ranges');
    }
  }

  // Age compatibility (Green Flag)
  if (user1.age && user2.age) {
    const ageDifference = Math.abs(user1.age - user2.age);
    if (ageDifference <= 5) {
      greenFlags.push('Similar age group');
    }
  }

  // RED FLAGS

  // Overall low compatibility (Red Flag)
  if (matchScore < 40) {
    redFlags.push('Lower overall compatibility');
  }

  // Price range mismatch (Red Flag)
  if (user1.price_range_min && user1.price_range_max && 
      user2.price_range_min && user2.price_range_max) {
    const overlap = Math.max(0, 
      Math.min(user1.price_range_max, user2.price_range_max) - 
      Math.max(user1.price_range_min, user2.price_range_min)
    );
    if (overlap === 0) {
      redFlags.push('No budget overlap');
    }
  }

  // Recovery stage mismatch (Red Flag)
  if (user1.recovery_stage && user2.recovery_stage) {
    const stages = ['early', 'stable', 'maintained', 'long-term'];
    const user1Index = stages.indexOf(user1.recovery_stage);
    const user2Index = stages.indexOf(user2.recovery_stage);
    if (user1Index !== -1 && user2Index !== -1 && Math.abs(user1Index - user2Index) > 2) {
      redFlags.push('Very different recovery stages');
    }
  }

  // Deal breaker conflicts (Red Flag)
  const dealBreakers1 = user1.deal_breakers || [];
  const dealBreakers2 = user2.deal_breakers || [];
  
  // Check if either user's preferences conflict with the other's deal breakers
  if (user1.smoking_preference === 'smoking' && dealBreakers2.includes('Smoking indoors')) {
    redFlags.push('Smoking preference conflict');
  }
  if (user2.smoking_preference === 'smoking' && dealBreakers1.includes('Smoking indoors')) {
    redFlags.push('Smoking preference conflict');
  }

  // Substance use conflicts (Red Flag)
  const substanceUse1 = user1.substance_use || [];
  const substanceUse2 = user2.substance_use || [];
  
  if (substanceUse1.includes('Alcohol') && dealBreakers2.includes('Drinking alcohol at home')) {
    redFlags.push('Alcohol use conflict');
  }
  if (substanceUse2.includes('Alcohol') && dealBreakers1.includes('Drinking alcohol at home')) {
    redFlags.push('Alcohol use conflict');
  }

  // Large age gap (Red Flag)
  if (user1.age && user2.age) {
    const ageDifference = Math.abs(user1.age - user2.age);
    if (ageDifference > 15) {
      redFlags.push('Significant age difference');
    }
  }

  // No shared interests (Red Flag)
  if (interestOverlap.length === 0 && (user1.interests || []).length > 0 && (user2.interests || []).length > 0) {
    redFlags.push('No shared interests');
  }

  // No shared recovery programs (Red Flag)
  if (programOverlap.length === 0 && (user1.program_type || []).length > 0 && (user2.program_type || []).length > 0) {
    redFlags.push('No shared recovery programs');
  }

  return { greenFlags, redFlags };
};

/**
 * Get compatibility summary for two users
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @returns {Object} Compatibility summary
 */
export const getCompatibilitySummary = (user1, user2) => {
  const detailedMatch = calculateDetailedMatch(user1, user2);
  const flags = generateCompatibilityFlags(user1, user2, detailedMatch.overallScore);
  
  let compatibilityLevel;
  let compatibilityDescription;
  
  if (detailedMatch.overallScore >= 80) {
    compatibilityLevel = 'excellent';
    compatibilityDescription = 'Highly compatible - strong potential for a successful roommate relationship';
  } else if (detailedMatch.overallScore >= 65) {
    compatibilityLevel = 'good';
    compatibilityDescription = 'Good compatibility - many shared values and preferences';
  } else if (detailedMatch.overallScore >= 50) {
    compatibilityLevel = 'moderate';
    compatibilityDescription = 'Moderate compatibility - some areas align well, others may need discussion';
  } else if (detailedMatch.overallScore >= 35) {
    compatibilityLevel = 'low';
    compatibilityDescription = 'Lower compatibility - significant differences to consider';
  } else {
    compatibilityLevel = 'poor';
    compatibilityDescription = 'Poor compatibility - many fundamental differences';
  }

  return {
    overallScore: detailedMatch.overallScore,
    level: compatibilityLevel,
    description: compatibilityDescription,
    breakdown: detailedMatch.breakdown,
    greenFlags: flags.greenFlags,
    redFlags: flags.redFlags,
    recommendation: getRecommendation(detailedMatch.overallScore, flags)
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
        case 'recovery_stage':
          if (match.compatibility.breakdown.recovery.score >= 80) {
            priorityBonus += 10;
          }
          break;
        case 'programs':
          if (match.compatibility.breakdown.programs.score >= 80) {
            priorityBonus += 8;
          }
          break;
        case 'interests':
          if (match.compatibility.breakdown.interests.score >= 80) {
            priorityBonus += 6;
          }
          break;
        case 'housing':
          if (match.compatibility.breakdown.housing.score >= 80) {
            priorityBonus += 8;
          }
          break;
        case 'lifestyle':
          if (match.compatibility.breakdown.lifestyle.score >= 80) {
            priorityBonus += 7;
          }
          break;
        case 'demographics':
          if (match.compatibility.breakdown.demographics.score >= 80) {
            priorityBonus += 5;
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
  if (summary.breakdown.recovery.score >= 80) {
    insights.push({
      type: 'positive',
      category: 'recovery',
      message: 'You both are at similar stages in your recovery journey, which can provide mutual understanding and support.'
    });
  } else if (summary.breakdown.recovery.score < 50) {
    insights.push({
      type: 'consideration',
      category: 'recovery',
      message: 'You\'re at different stages in recovery. Consider how this might affect your living dynamic.'
    });
  }

  // Program insights
  if (summary.breakdown.programs.score >= 70) {
    insights.push({
      type: 'positive',
      category: 'programs',
      message: 'Shared recovery programs can create opportunities for mutual support and accountability.'
    });
  }

  // Lifestyle insights
  if (summary.breakdown.lifestyle.score >= 75) {
    insights.push({
      type: 'positive',
      category: 'lifestyle',
      message: 'Your daily routines and lifestyle preferences align well, which can reduce potential conflicts.'
    });
  } else if (summary.breakdown.lifestyle.score < 40) {
    insights.push({
      type: 'consideration',
      category: 'lifestyle',
      message: 'Your lifestyle preferences differ significantly. Open communication about expectations will be important.'
    });
  }

  // Housing insights
  if (summary.breakdown.housing.score >= 80) {
    insights.push({
      type: 'positive',
      category: 'housing',
      message: 'You have compatible housing preferences, making it easier to find a place you both like.'
    });
  }

  // Interest insights
  if (summary.breakdown.interests.score >= 60) {
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

export default {
  generateCompatibilityFlags,
  getCompatibilitySummary,
  filterAndRankMatches,
  generateMatchInsights
};
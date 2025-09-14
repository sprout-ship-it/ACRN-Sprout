// src/utils/matching/dataTransform.js

/**
 * Data transformation utilities for converting between database schema 
 * and matching algorithm expectations
 */

/**
 * Calculate age from date of birth
 * @param {string} dateOfBirth - Date string in YYYY-MM-DD format
 * @returns {number|null} Age in years or null if invalid date
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    // Check for invalid date
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  } catch (error) {
    console.warn('Error calculating age from:', dateOfBirth, error);
    return null;
  }
};

/**
 * Transform database applicant_forms record to algorithm-compatible format
 * @param {Object} dbProfile - Raw database record from applicant_forms table
 * @returns {Object|null} Transformed profile or null if invalid
 */
export const transformProfileForAlgorithm = (dbProfile) => {
  if (!dbProfile || typeof dbProfile !== 'object') {
    console.warn('Invalid profile data provided to transform function');
    return null;
  }

  const transformed = {
    // ===== BASIC IDENTIFIERS =====
    id: dbProfile.id,
    user_id: dbProfile.user_id,
    
    // ===== PERSONAL DETAILS =====
    age: calculateAge(dbProfile.date_of_birth),
    gender: dbProfile.gender || null,
    
    // ===== LOCATION =====
// Use preferred_city and preferred_state, then city, then a fallback
    location: (dbProfile.preferred_city && dbProfile.preferred_state) 
      ? `${dbProfile.preferred_city}, ${dbProfile.preferred_state}`
      : dbProfile.preferred_city || dbProfile.preferred_state || dbProfile.city || 'Not specified',
    current_location: dbProfile.current_location,
    target_zip_codes: dbProfile.target_zip_codes || [],
    search_radius: dbProfile.search_radius || 25,
    
    // ===== BUDGET & HOUSING =====
    budget_max: dbProfile.budget_max || 1000,
    price_range: {
      min: dbProfile.price_range_min || 0,
      max: dbProfile.price_range_max || dbProfile.budget_max || 5000
    },
    price_range_min: dbProfile.price_range_min || 0,
    price_range_max: dbProfile.price_range_max || dbProfile.budget_max || 5000,
    housing_type: dbProfile.housing_type || [],
    housing_subsidy: dbProfile.housing_subsidy || [],
    has_section8: dbProfile.has_section8 || false,
    accepts_subsidy: dbProfile.accepts_subsidy !== false, // Default to true
    
    // ===== RECOVERY INFORMATION =====
    recovery_stage: dbProfile.recovery_stage || null,
    recovery_methods: dbProfile.recovery_methods || [],
    program_type: dbProfile.program_type || [],
    primary_issues: dbProfile.primary_issues || [],
    primary_substance: dbProfile.primary_substance,
    time_in_recovery: dbProfile.time_in_recovery,
    sobriety_date: dbProfile.sobriety_date,
    treatment_history: dbProfile.treatment_history,
    sponsor_mentor: dbProfile.sponsor_mentor,
    support_meetings: dbProfile.support_meetings,
    
    // ===== LIFESTYLE PREFERENCES (1-5 scales) =====
    cleanliness_level: dbProfile.cleanliness_level || 3,
    noise_level: dbProfile.noise_level || 3,
    social_level: dbProfile.social_level || 3,
    
    // ===== LIFESTYLE DETAILS =====
    work_schedule: dbProfile.work_schedule || null,
    bedtime_preference: dbProfile.bedtime_preference || null,
    transportation: dbProfile.transportation,
    cooking_frequency: dbProfile.cooking_frequency,
    
    // ===== ROOMMATE PREFERENCES =====
    preferred_roommate_gender: dbProfile.preferred_roommate_gender || null,
    gender_preference: dbProfile.gender_preference || null, // Legacy field
    age_range_min: dbProfile.age_range_min || 18,
    age_range_max: dbProfile.age_range_max || 65,
    
    // ===== SMOKING =====
    smoking_status: dbProfile.smoking_status || null,
    smoking_preference: dbProfile.smoking_preference || null,
    
    // ===== PETS =====
    pets_owned: dbProfile.pets_owned || false,
    pets_comfortable: dbProfile.pets_comfortable !== false, // Default to true
    pet_preference: dbProfile.pet_preference,
    
    // ===== SOCIAL & GUESTS =====
    overnight_guests_ok: dbProfile.overnight_guests_ok !== false, // Default to true
    shared_groceries: dbProfile.shared_groceries || false,
    guests_policy: dbProfile.guests_policy || dbProfile.guest_policy, // Handle both field names
    guest_policy: dbProfile.guest_policy, // Legacy field
    
    // ===== SPIRITUAL & PERSONAL =====
    spiritual_affiliation: dbProfile.spiritual_affiliation || null,
    interests: dbProfile.interests || [],
    deal_breakers: dbProfile.deal_breakers || [],
    important_qualities: dbProfile.important_qualities || [],
    
    // ===== PERSONAL DESCRIPTIONS =====
    about_me: dbProfile.about_me || null,
    looking_for: dbProfile.looking_for || null,
    additional_info: dbProfile.additional_info,
    special_needs: dbProfile.special_needs,
    
    // ===== COMPATIBILITY PREFERENCES =====
    preferred_support_structure: dbProfile.preferred_support_structure,
    conflict_resolution_style: dbProfile.conflict_resolution_style,
    chore_sharing_preference: dbProfile.chore_sharing_preference,
    
    // ===== TIMING =====
    move_in_date: dbProfile.move_in_date,
    lease_duration: dbProfile.lease_duration,
    relocation_timeline: dbProfile.relocation_timeline,
    max_commute: dbProfile.max_commute,
    
    // ===== PROFILE STATUS =====
    is_active: dbProfile.is_active !== false, // Default to true
    profile_completed: dbProfile.profile_completed || false,
    
    // ===== TIMESTAMPS =====
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
    
    // ===== CONTACT INFO (be careful with privacy) =====
    phone: dbProfile.phone,
    emergency_contact_name: dbProfile.emergency_contact_name,
    emergency_contact_phone: dbProfile.emergency_contact_phone,
    
    // ===== JOINED DATA =====
    // Include registrant_profiles data if available (from joins)
    first_name: dbProfile.registrant_profiles?.first_name || 'Anonymous',
    last_name: dbProfile.registrant_profiles?.last_name || '',
    email: dbProfile.registrant_profiles?.email || null,
    
    // ===== LEGACY COMPATIBILITY =====
    // Add camelCase versions for backward compatibility
    recoveryStage: dbProfile.recovery_stage,
    programType: dbProfile.program_type || [],
    priceRange: {
      min: dbProfile.price_range_min || 0,
      max: dbProfile.price_range_max || dbProfile.budget_max || 5000
    },
    housingType: dbProfile.housing_type || [],
    sobrietyDate: dbProfile.sobriety_date,
    genderPreference: dbProfile.preferred_roommate_gender,
    smokingPreference: dbProfile.smoking_preference,
    cleanlinessLevel: dbProfile.cleanliness_level || 3,
    firstName: dbProfile.registrant_profiles?.first_name || 'Anonymous'
  };

  return transformed;
};

/**
 * Transform multiple profiles for algorithm use
 * @param {Array} dbProfiles - Array of database records
 * @returns {Array} Array of transformed profiles
 */
export const transformProfilesForAlgorithm = (dbProfiles) => {
  if (!Array.isArray(dbProfiles)) {
    console.warn('Expected array of profiles, got:', typeof dbProfiles);
    return [];
  }

  return dbProfiles
    .map(transformProfileForAlgorithm)
    .filter(profile => profile !== null);
};

/**
 * Validate that a profile has minimum required data for matching
 * @param {Object} profile - Transformed profile object
 * @returns {Object} Validation result with isValid and missing fields
 */
export const validateProfileForMatching = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return {
      isValid: false,
      missing: ['entire profile'],
      errors: ['Profile is null or invalid']
    };
  }

  const required = [
    'user_id',
    'recovery_stage',
    'budget_max'
  ];

  const recommended = [
    'age',
    'gender',
    'cleanliness_level',
    'noise_level',
    'social_level',
    'smoking_status',
    'interests'
  ];

  const missing = required.filter(field => 
    profile[field] === null || profile[field] === undefined || profile[field] === ''
  );

  const missingRecommended = recommended.filter(field => 
    profile[field] === null || profile[field] === undefined || profile[field] === ''
  );

  const warnings = [];
  
  if (missingRecommended.length > 0) {
    warnings.push(`Missing recommended fields: ${missingRecommended.join(', ')}`);
  }

  if (!profile.profile_completed) {
    warnings.push('Profile marked as incomplete');
  }

  if (!profile.is_active) {
    warnings.push('Profile is not active');
  }

  return {
    isValid: missing.length === 0,
    missing,
    missingRecommended,
    warnings,
    score: Math.max(0, 100 - (missing.length * 25) - (missingRecommended.length * 5))
  };
};

/**
 * Filter profiles that are suitable for matching
 * @param {Array} profiles - Array of transformed profiles
 * @param {Object} options - Filtering options
 * @returns {Array} Filtered profiles suitable for matching
 */
export const filterMatchableProfiles = (profiles, options = {}) => {
  const {
    requireCompleted = true,
    requireActive = true,
    minValidationScore = 70
  } = options;

  return profiles.filter(profile => {
    const validation = validateProfileForMatching(profile);
    
    // Must pass basic validation
    if (!validation.isValid) {
      console.log(`❌ Profile ${profile.user_id} failed validation:`, validation.missing);
      return false;
    }

    // Check completion status
    if (requireCompleted && !profile.profile_completed) {
      console.log(`⚠️ Profile ${profile.user_id} not completed`);
      return false;
    }

    // Check active status
    if (requireActive && !profile.is_active) {
      console.log(`⚠️ Profile ${profile.user_id} not active`);
      return false;
    }

    // Check validation score
    if (validation.score < minValidationScore) {
      console.log(`⚠️ Profile ${profile.user_id} validation score too low: ${validation.score}`);
      return false;
    }

    return true;
  });
};

/**
 * Create a summary of profile data for debugging
 * @param {Object} profile - Transformed profile
 * @returns {Object} Profile summary
 */
export const createProfileSummary = (profile) => {
  if (!profile) return { error: 'No profile provided' };

  return {
    id: profile.user_id,
    name: profile.first_name,
    age: profile.age,
    location: profile.location,
    recovery_stage: profile.recovery_stage,
    budget_max: profile.budget_max,
    is_active: profile.is_active,
    profile_completed: profile.profile_completed,
    validation: validateProfileForMatching(profile)
  };
};

/**
 * Handle location compatibility calculation
 * @param {Object} profile1 - First profile
 * @param {Object} profile2 - Second profile
 * @returns {number} Location compatibility score (0-100)
 */
export const calculateLocationCompatibility = (profile1, profile2) => {
  // Basic location matching - can be enhanced with ZIP code distance calculation
  
  if (!profile1.location || !profile2.location) {
    return 50; // Default score if location not specified
  }

  const location1 = profile1.location.toLowerCase().trim();
  const location2 = profile2.location.toLowerCase().trim();

  // Exact match
  if (location1 === location2) {
    return 100;
  }

  // Check if one location contains the other (city within metro area)
  if (location1.includes(location2) || location2.includes(location1)) {
    return 85;
  }

  // Check for same state (basic heuristic)
  const extractState = (loc) => {
    const parts = loc.split(',');
    return parts[parts.length - 1]?.trim();
  };

  const state1 = extractState(location1);
  const state2 = extractState(location2);

  if (state1 && state2 && state1 === state2) {
    return 60;
  }

  // Different locations
  return 30;
};

export default {
  calculateAge,
  transformProfileForAlgorithm,
  transformProfilesForAlgorithm,
  validateProfileForMatching,
  filterMatchableProfiles,
  createProfileSummary,
  calculateLocationCompatibility
};
// src/utils/matching/dataTransform.js - SCHEMA COMPLIANT VERSION

/**
 * SCHEMA COMPLIANT: Data transformation utilities for converting between standardized database schema 
 * and matching algorithm expectations. Strict compliance with applicant_matching_profiles table.
 * ALL FIELD NAMES: Aligned with schema.sql exactly
 * CONSTRAINTS: All database constraints validated
 * DEFAULTS: All default values applied per schema
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
 * Validate state abbreviation (primary_state is VARCHAR(2))
 * @param {string} state - State value to validate
 * @returns {string|null} Valid 2-character state code or null
 */
const validateStateAbbreviation = (state) => {
  if (!state) return null;
  
  const stateStr = String(state).trim().toUpperCase();
  
  // Must be exactly 2 characters for VARCHAR(2) constraint
  if (stateStr.length !== 2) {
    console.warn('Invalid state abbreviation length:', stateStr);
    return null;
  }
  
  // Basic validation - should be letters
  if (!/^[A-Z]{2}$/.test(stateStr)) {
    console.warn('Invalid state abbreviation format:', stateStr);
    return null;
  }
  
  return stateStr;
};

/**
 * Validate and sanitize array field for PostgreSQL TEXT[]
 * @param {any} value - Value to convert to array
 * @param {string} fieldName - Name of field for logging
 * @returns {string[]} Valid array for PostgreSQL
 */
const sanitizeArrayField = (value, fieldName) => {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    // Filter out null/undefined/empty values and convert to strings
    return value
      .filter(item => item !== null && item !== undefined && item !== '')
      .map(item => String(item).trim());
  }
  
  if (typeof value === 'string') {
    // Handle comma-separated strings
    return value.split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  
  console.warn(`Invalid array value for ${fieldName}:`, value);
  return [];
};

/**
 * Validate integer with range constraints
 * @param {any} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} defaultValue - Default if invalid
 * @returns {number} Valid integer within range
 */
const validateIntegerWithRange = (value, min, max, defaultValue) => {
  const parsed = parseInt(value);
  
  if (isNaN(parsed)) return defaultValue;
  if (parsed < min) return min;
  if (parsed > max) return max;
  
  return parsed;
};

/**
 * Validate date string and ensure it's not in the past (for move_in_date)
 * @param {string} dateStr - Date string to validate
 * @param {boolean} allowPast - Whether past dates are allowed
 * @returns {string|null} Valid date string or null
 */
const validateDate = (dateStr, allowPast = true) => {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    // Check if date is in the past for move_in_date constraint
    if (!allowPast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      if (date < today) {
        console.warn('Date cannot be in the past:', dateStr);
        return null;
      }
    }
    
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch (error) {
    console.warn('Invalid date:', dateStr, error);
    return null;
  }
};

/**
 * SCHEMA COMPLIANT: Transform standardized database record to algorithm-compatible format
 * @param {Object} dbProfile - Raw database record from applicant_matching_profiles table
 * @returns {Object|null} Transformed profile or null if invalid
 */
export const transformProfileForAlgorithm = (dbProfile) => {
  if (!dbProfile || typeof dbProfile !== 'object') {
    console.warn('Invalid profile data provided to transform function');
    return null;
  }

  const transformed = {
    // BASIC IDENTIFIERS
    id: dbProfile.id,
    user_id: dbProfile.user_id,
    
    // PERSONAL DETAILS (Schema Compliant)
    age: calculateAge(dbProfile.date_of_birth),
    first_name: dbProfile.first_name || 'Anonymous', // Not in matching table, comes from registrant_profiles
    last_name: dbProfile.last_name || '', // Not in matching table, comes from registrant_profiles  
    email: dbProfile.email || '', // Not in matching table, comes from registrant_profiles
    primary_phone: dbProfile.primary_phone,
    date_of_birth: dbProfile.date_of_birth,
    
    // GENDER & IDENTITY (Schema Compliant)
    gender_identity: dbProfile.gender_identity,
    biological_sex: dbProfile.biological_sex,
    preferred_roommate_gender: dbProfile.preferred_roommate_gender,
    gender_inclusive: dbProfile.gender_inclusive || false,
    
    // Legacy compatibility
    gender: dbProfile.gender_identity,
    
    // LOCATION (Schema Compliant)
    primary_city: dbProfile.primary_city,
    primary_state: dbProfile.primary_state,
    primary_location: dbProfile.primary_location, // Auto-generated by database
    current_address: dbProfile.current_address,
    current_city: dbProfile.current_city,
    current_state: dbProfile.current_state,
    current_zip_code: dbProfile.current_zip_code,
    target_zip_codes: dbProfile.target_zip_codes ? 
                     dbProfile.target_zip_codes.split(',').map(z => z.trim()) : [],
    search_radius_miles: dbProfile.search_radius_miles || 30,
    location_flexibility: dbProfile.location_flexibility,
    max_commute_minutes: dbProfile.max_commute_minutes,
    transportation_method: dbProfile.transportation_method,
    
    // Legacy compatibility
    location: dbProfile.primary_location || 
             (dbProfile.primary_city && dbProfile.primary_state ? 
              `${dbProfile.primary_city}, ${dbProfile.primary_state}` : 'Not specified'),
    search_radius: dbProfile.search_radius_miles || 30,
    max_commute: dbProfile.max_commute_minutes,
    transportation: dbProfile.transportation_method,
    
    // BUDGET & FINANCIAL (Schema Compliant)
    budget_min: dbProfile.budget_min || 0,
    budget_max: dbProfile.budget_max || 1000,
    housing_assistance: dbProfile.housing_assistance || [],
    has_section8: dbProfile.has_section8 || false,
    
    // Legacy compatibility
    price_range: {
      min: dbProfile.budget_min || 0,
      max: dbProfile.budget_max || 1000
    },
    price_range_min: dbProfile.budget_min || 0,
    price_range_max: dbProfile.budget_max || 1000,
    housing_subsidy: dbProfile.housing_assistance || [], // Legacy name
    accepts_subsidy: dbProfile.housing_assistance?.length > 0,
    
    // RECOVERY & WELLNESS (Schema Compliant)
    recovery_stage: dbProfile.recovery_stage,
    time_in_recovery: dbProfile.time_in_recovery,
    sobriety_date: dbProfile.sobriety_date,
    primary_substance: dbProfile.primary_substance,
    recovery_methods: dbProfile.recovery_methods || [],
    program_types: dbProfile.program_types || [],
    treatment_history: dbProfile.treatment_history,
    support_meetings: dbProfile.support_meetings,
    sponsor_mentor: dbProfile.sponsor_mentor,
    primary_issues: dbProfile.primary_issues || [],
    spiritual_affiliation: dbProfile.spiritual_affiliation,
    want_recovery_support: dbProfile.want_recovery_support || false,
    comfortable_discussing_recovery: dbProfile.comfortable_discussing_recovery || false,
    attend_meetings_together: dbProfile.attend_meetings_together || false,
    substance_free_home_required: dbProfile.substance_free_home_required !== false, // Default true
    recovery_goal_timeframe: dbProfile.recovery_goal_timeframe,
    recovery_context: dbProfile.recovery_context,
    
    // Legacy compatibility
    program_type: dbProfile.program_types || [],
    
    // LIFESTYLE & LIVING PREFERENCES (Schema Compliant with defaults)
    social_level: dbProfile.social_level || 3,
    cleanliness_level: dbProfile.cleanliness_level || 3,
    noise_tolerance: dbProfile.noise_tolerance || 3,
    work_schedule: dbProfile.work_schedule,
    work_from_home_frequency: dbProfile.work_from_home_frequency,
    bedtime_preference: dbProfile.bedtime_preference,
    early_riser: dbProfile.early_riser || false,
    night_owl: dbProfile.night_owl || false,
    guests_policy: dbProfile.guests_policy,
    social_activities_at_home: dbProfile.social_activities_at_home,
    overnight_guests_ok: dbProfile.overnight_guests_ok || false,
    cooking_enthusiast: dbProfile.cooking_enthusiast || false,
    cooking_frequency: dbProfile.cooking_frequency,
    exercise_at_home: dbProfile.exercise_at_home || false,
    plays_instruments: dbProfile.plays_instruments || false,
    tv_streaming_regular: dbProfile.tv_streaming_regular || false,
    
    // Legacy compatibility
    noise_level: dbProfile.noise_tolerance || 3,
    guest_policy: dbProfile.guests_policy,
    
    // HOUSEHOLD MANAGEMENT & COMMUNICATION (Schema Compliant)
    chore_sharing_style: dbProfile.chore_sharing_style,
    chore_sharing_preference: dbProfile.chore_sharing_preference,
    shared_groceries: dbProfile.shared_groceries || false,
    communication_style: dbProfile.communication_style,
    conflict_resolution_style: dbProfile.conflict_resolution_style,
    preferred_support_structure: dbProfile.preferred_support_structure,
    
    // PETS & SMOKING (Schema Compliant)
    pets_owned: dbProfile.pets_owned || false,
    pets_comfortable: dbProfile.pets_comfortable || false,
    pet_preference: dbProfile.pet_preference,
    smoking_status: dbProfile.smoking_status,
    smoking_preference: dbProfile.smoking_preference,
    
    // HOUSING SPECIFICATIONS (Schema Compliant)
    housing_types_accepted: dbProfile.housing_types_accepted || [],
    preferred_bedrooms: dbProfile.preferred_bedrooms,
    furnished_preference: dbProfile.furnished_preference,
    utilities_included_preference: dbProfile.utilities_included_preference,
    accessibility_needed: dbProfile.accessibility_needed || false,
    parking_required: dbProfile.parking_required || false,
    public_transit_access: dbProfile.public_transit_access || false,
    
    // Legacy compatibility
    housing_type: dbProfile.housing_types_accepted || [],
    
    // TIMING & AVAILABILITY (Schema Compliant)
    move_in_date: dbProfile.move_in_date,
    move_in_flexibility: dbProfile.move_in_flexibility,
    lease_duration: dbProfile.lease_duration,
    relocation_timeline: dbProfile.relocation_timeline,
    
    // GOALS & ASPIRATIONS (Schema Compliant)
    short_term_goals: dbProfile.short_term_goals,
    long_term_vision: dbProfile.long_term_vision,
    interests: dbProfile.interests || [],
    additional_interests: dbProfile.additional_interests,
    shared_activities_interest: dbProfile.shared_activities_interest || false,
    important_qualities: dbProfile.important_qualities || [],
    deal_breakers: dbProfile.deal_breakers || [],
    
    // PROFILE CONTENT & STATUS (Schema Compliant)
    about_me: dbProfile.about_me,
    looking_for: dbProfile.looking_for,
    additional_info: dbProfile.additional_info,
    special_needs: dbProfile.special_needs,
    is_active: dbProfile.is_active !== false,
    profile_completed: dbProfile.profile_completed || false,
    profile_visibility: dbProfile.profile_visibility || 'verified-members',
    completion_percentage: dbProfile.completion_percentage || 0,
    profile_quality_score: dbProfile.profile_quality_score || 0,
    
    // EMERGENCY & CONTACT (Schema Compliant)
    emergency_contact_name: dbProfile.emergency_contact_name,
    emergency_contact_phone: dbProfile.emergency_contact_phone,
    emergency_contact_relationship: dbProfile.emergency_contact_relationship,
    
    // Legacy compatibility
    phone: dbProfile.primary_phone,
    
    // ROOMMATE PREFERENCES (Schema Compliant)
    age_range_min: dbProfile.age_range_min || 18,
    age_range_max: dbProfile.age_range_max || 65,
    age_flexibility: dbProfile.age_flexibility,
    prefer_recovery_experience: dbProfile.prefer_recovery_experience || false,
    supportive_of_recovery: dbProfile.supportive_of_recovery !== false,
    respect_privacy: dbProfile.respect_privacy !== false,
    social_interaction_level: dbProfile.social_interaction_level,
    similar_schedules: dbProfile.similar_schedules || false,
    shared_chores: dbProfile.shared_chores || false,
    financially_stable: dbProfile.financially_stable !== false,
    respectful_guests: dbProfile.respectful_guests !== false,
    lgbtq_friendly: dbProfile.lgbtq_friendly || false,
    culturally_sensitive: dbProfile.culturally_sensitive !== false,
    
    // Deal breakers (Schema Compliant)
    deal_breaker_substance_use: dbProfile.deal_breaker_substance_use || false,
    deal_breaker_loudness: dbProfile.deal_breaker_loudness || false,
    deal_breaker_uncleanliness: dbProfile.deal_breaker_uncleanliness || false,
    deal_breaker_financial_issues: dbProfile.deal_breaker_financial_issues !== false,
    deal_breaker_pets: dbProfile.deal_breaker_pets || false,
    deal_breaker_smoking: dbProfile.deal_breaker_smoking || false,
    
    // COMPATIBILITY PREFERENCES (Schema Compliant)
    overnight_guests_preference: dbProfile.overnight_guests_preference || false,
    shared_transportation: dbProfile.shared_transportation || false,
    recovery_accountability: dbProfile.recovery_accountability || false,
    shared_recovery_activities: dbProfile.shared_recovery_activities || false,
    mentorship_interest: dbProfile.mentorship_interest || false,
    recovery_community: dbProfile.recovery_community || false,
    
    // ALGORITHM METADATA (Schema Compliant)
    compatibility_scores: dbProfile.compatibility_scores || {},
    search_preferences: dbProfile.search_preferences || {},
    matching_weights: dbProfile.matching_weights || {},
    last_updated_section: dbProfile.last_updated_section,
    
    // TIMESTAMPS
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
    
    // LEGACY COMPATIBILITY FIELDS (camelCase versions)
    recoveryStage: dbProfile.recovery_stage,
    programType: dbProfile.program_types || [],
    priceRange: {
      min: dbProfile.budget_min || 0,
      max: dbProfile.budget_max || 1000
    },
    housingType: dbProfile.housing_types_accepted || [],
    sobrietyDate: dbProfile.sobriety_date,
    genderPreference: dbProfile.preferred_roommate_gender,
    smokingPreference: dbProfile.smoking_preference,
    cleanlinessLevel: dbProfile.cleanliness_level || 3,
    firstName: dbProfile.first_name || 'Anonymous'
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
 * SCHEMA COMPLIANT: Validate profile has minimum required data per schema constraints
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

  // SCHEMA REQUIRED FIELDS (NOT NULL constraints from schema)
  const requiredFields = [
    'user_id', // References registrant_profiles.id
    'primary_phone', // VARCHAR(20) NOT NULL
    'date_of_birth', // DATE NOT NULL
    'preferred_roommate_gender', // VARCHAR(50) NOT NULL
    'primary_city', // VARCHAR(100) NOT NULL
    'primary_state', // VARCHAR(2) NOT NULL
    'budget_min', // INTEGER NOT NULL
    'budget_max', // INTEGER NOT NULL
    'recovery_stage', // VARCHAR(50) NOT NULL
    'recovery_methods', // TEXT[] NOT NULL
    'program_types', // TEXT[] NOT NULL
    'primary_issues', // TEXT[] NOT NULL
    'spiritual_affiliation', // VARCHAR(50) NOT NULL
    'social_level', // INTEGER NOT NULL DEFAULT 3
    'cleanliness_level', // INTEGER NOT NULL DEFAULT 3
    'noise_tolerance', // INTEGER NOT NULL DEFAULT 3
    'work_schedule', // VARCHAR(50) NOT NULL
    'move_in_date', // DATE NOT NULL
    'about_me', // TEXT NOT NULL
    'looking_for' // TEXT NOT NULL
  ];

  // High priority fields for quality matching
  const highPriority = [
    'age',
    'substance_free_home_required',
    'bedtime_preference',
    'conflict_resolution_style',
    'smoking_status',
    'pets_owned',
    'pets_comfortable'
  ];

  // Medium priority fields for enhanced compatibility
  const mediumPriority = [
    'interests',
    'important_qualities',
    'housing_types_accepted',
    'lease_duration',
    'move_in_flexibility'
  ];

  const missingRequired = requiredFields.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length === 0;
    return value === null || value === undefined || value === '';
  });

  const missingHigh = highPriority.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length === 0;
    return value === null || value === undefined || value === '';
  });

  const missingMedium = mediumPriority.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length === 0;
    return value === null || value === undefined || value === '';
  });

  const errors = [];
  const warnings = [];
  
  // Schema constraint violations
  if (profile.primary_state && profile.primary_state.length !== 2) {
    errors.push('primary_state must be exactly 2 characters');
  }
  
  if (profile.social_level && (profile.social_level < 1 || profile.social_level > 5)) {
    errors.push('social_level must be between 1 and 5');
  }
  
  if (profile.cleanliness_level && (profile.cleanliness_level < 1 || profile.cleanliness_level > 5)) {
    errors.push('cleanliness_level must be between 1 and 5');
  }
  
  if (profile.noise_tolerance && (profile.noise_tolerance < 1 || profile.noise_tolerance > 5)) {
    errors.push('noise_tolerance must be between 1 and 5');
  }
  
  if (profile.budget_min && profile.budget_max && profile.budget_min > profile.budget_max) {
    errors.push('budget_min cannot be greater than budget_max');
  }
  
  if (profile.age_range_min && profile.age_range_min < 18) {
    errors.push('age_range_min must be at least 18');
  }
  
  if (profile.age_range_max && profile.age_range_max > 100) {
    errors.push('age_range_max cannot exceed 100');
  }
  
  if (profile.move_in_date) {
    const moveInDate = new Date(profile.move_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (moveInDate < today) {
      errors.push('move_in_date cannot be in the past');
    }
  }
  
  // Quality warnings
  if (missingHigh.length > 0) {
    warnings.push(`Missing high priority fields: ${missingHigh.join(', ')}`);
  }

  if (missingMedium.length > 0) {
    warnings.push(`Missing medium priority fields: ${missingMedium.join(', ')}`);
  }

  if (!profile.profile_completed) {
    warnings.push('Profile marked as incomplete');
  }

  if (!profile.is_active) {
    warnings.push('Profile is not active');
  }

  // Enhanced scoring based on priority levels
  const requiredScore = Math.max(0, 70 - (missingRequired.length * 3.5)); // 70 points for required
  const highScore = Math.max(0, 20 - (missingHigh.length * 2.5)); // 20 points for high priority
  const mediumScore = Math.max(0, 10 - (missingMedium.length * 1)); // 10 points for medium priority
  const qualityScore = requiredScore + highScore + mediumScore;

  return {
    isValid: missingRequired.length === 0 && errors.length === 0,
    missing: missingRequired,
    missingHigh,
    missingMedium,
    errors,
    warnings,
    score: Math.round(qualityScore),
    requiredComplete: missingRequired.length === 0,
    highPriorityComplete: missingHigh.length === 0,
    mediumPriorityComplete: missingMedium.length === 0
  };
};

/**
 * Filter profiles suitable for enhanced matching
 * @param {Array} profiles - Array of transformed profiles
 * @param {Object} options - Filtering options
 * @returns {Array} Filtered profiles suitable for matching
 */
export const filterMatchableProfiles = (profiles, options = {}) => {
  const {
    requireCompleted = true,
    requireActive = true,
    minValidationScore = 80,
    requireSchemaCompliance = true,
    logFiltering = false
  } = options;

  return profiles.filter(profile => {
    const validation = validateProfileForMatching(profile);
    
    // Must pass schema compliance
    if (requireSchemaCompliance && validation.errors.length > 0) {
      if (logFiltering) {
        console.log(`Schema violations for ${profile.user_id}:`, validation.errors);
      }
      return false;
    }
    
    // Must have all required fields
    if (validation.missing.length > 0) {
      if (logFiltering) {
        console.log(`Missing required fields for ${profile.user_id}:`, validation.missing);
      }
      return false;
    }

    // Must be valid for basic matching
    if (!validation.isValid) {
      if (logFiltering) {
        console.log(`Failed validation for ${profile.user_id}`);
      }
      return false;
    }

    // Check completion status
    if (requireCompleted && !profile.profile_completed) {
      if (logFiltering) {
        console.log(`Profile not completed: ${profile.user_id}`);
      }
      return false;
    }

    // Check active status
    if (requireActive && !profile.is_active) {
      if (logFiltering) {
        console.log(`Profile not active: ${profile.user_id}`);
      }
      return false;
    }

    // Check validation score
    if (validation.score < minValidationScore) {
      if (logFiltering) {
        console.log(`Validation score too low for ${profile.user_id}: ${validation.score} < ${minValidationScore}`);
      }
      return false;
    }

    return true;
  });
};

/**
 * Create comprehensive profile summary for debugging
 * @param {Object} profile - Transformed profile
 * @returns {Object} Enhanced profile summary
 */
export const createProfileSummary = (profile) => {
  if (!profile) return { error: 'No profile provided' };

  const validation = validateProfileForMatching(profile);

  return {
    // Basic info
    id: profile.user_id,
    name: profile.first_name,
    age: profile.age,
    
    // Core matching factors
    location: profile.primary_location,
    budget: `$${profile.budget_min}-${profile.budget_max}`,
    recovery_stage: profile.recovery_stage,
    preferred_roommate_gender: profile.preferred_roommate_gender,
    
    // Lifestyle scores
    lifestyle: {
      social: profile.social_level,
      cleanliness: profile.cleanliness_level,
      noise_tolerance: profile.noise_tolerance
    },
    
    // Status
    is_active: profile.is_active,
    profile_completed: profile.profile_completed,
    completion_percentage: profile.completion_percentage,
    
    // Schema compliance
    validation: {
      score: validation.score,
      requiredComplete: validation.requiredComplete,
      highPriorityComplete: validation.highPriorityComplete,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings
    },
    
    // Array field counts
    arrays: {
      recovery_methods: profile.recovery_methods?.length || 0,
      primary_issues: profile.primary_issues?.length || 0,
      interests: profile.interests?.length || 0,
      housing_types: profile.housing_types_accepted?.length || 0
    }
  };
};

/**
 * Location compatibility with standardized fields
 * @param {Object} profile1 - First profile
 * @param {Object} profile2 - Second profile
 * @returns {number} Location compatibility score (0-100)
 */
export const calculateLocationCompatibility = (profile1, profile2) => {
  const location1 = profile1.primary_location || 
                   (profile1.primary_city && profile1.primary_state ? 
                    `${profile1.primary_city}, ${profile1.primary_state}` : null);
  
  const location2 = profile2.primary_location || 
                   (profile2.primary_city && profile2.primary_state ? 
                    `${profile2.primary_city}, ${profile2.primary_state}` : null);
  
  if (!location1 || !location2) {
    return 50; // Default score if location not specified
  }

  const loc1 = location1.toLowerCase().trim();
  const loc2 = location2.toLowerCase().trim();

  // Exact match
  if (loc1 === loc2) {
    return 100;
  }

  // Same city check
  const city1 = profile1.primary_city?.toLowerCase();
  const city2 = profile2.primary_city?.toLowerCase();
  const state1 = profile1.primary_state?.toLowerCase();
  const state2 = profile2.primary_state?.toLowerCase();

  if (city1 && city2 && state1 && state2) {
    if (city1 === city2 && state1 === state2) {
      return 100; // Same city and state
    }
    
    if (state1 === state2) {
      return 75; // Same state, different city
    }
  }

  // Check if one location contains the other (metro area)
  if (loc1.includes(loc2) || loc2.includes(loc1)) {
    return 85;
  }

  // Different states
  return 40;
};

/**
 * SCHEMA COMPLIANT: Transform form submission data to database format
 * @param {Object} formData - Form data from EnhancedMatchingProfileForm
 * @param {string} userId - User ID (registrant_profiles.id)
 * @returns {Object} Database-ready record with schema compliance
 */
export const transformFormDataToDatabase = (formData, userId) => {
  if (!formData || !userId) {
    throw new Error('Form data and user ID are required');
  }

  // SCHEMA COMPLIANT: Required fields validation (NOT NULL constraints)
  const requiredMappings = {
    primary_phone: formData.phone || formData.primary_phone,
    date_of_birth: formData.dateOfBirth || formData.date_of_birth,
    preferred_roommate_gender: formData.preferredRoommateGender || formData.preferred_roommate_gender,
    primary_city: formData.primary_city,
    primary_state: formData.primary_state,
    budget_min: formData.budget_min,
    budget_max: formData.budget_max,
    recovery_stage: formData.recoveryStage || formData.recovery_stage,
    recovery_methods: formData.recoveryMethods || formData.recovery_methods || [],
    program_types: formData.programType || formData.program_types || [],
    primary_issues: formData.primaryIssues || formData.primary_issues || [],
    spiritual_affiliation: formData.spiritualAffiliation || formData.spiritual_affiliation,
    work_schedule: formData.workSchedule || formData.work_schedule,
    move_in_date: formData.moveInDate || formData.move_in_date,
    about_me: formData.aboutMe || formData.about_me,
    looking_for: formData.lookingFor || formData.looking_for
  };

  // Check for missing required fields
  const missingRequired = Object.entries(requiredMappings)
    .filter(([key, value]) => {
      if (Array.isArray(value)) return value.length === 0;
      return !value || value === '';
    })
    .map(([key]) => key);

  if (missingRequired.length > 0) {
    throw new Error(`Missing required fields: ${missingRequired.join(', ')}`);
  }

  // Validate and process fields according to schema constraints
  const validatedPrimaryState = validateStateAbbreviation(requiredMappings.primary_state);
  if (!validatedPrimaryState) {
    throw new Error('Invalid primary_state: must be 2-character state abbreviation');
  }

  const validatedBudgetMin = parseInt(requiredMappings.budget_min);
  const validatedBudgetMax = parseInt(requiredMappings.budget_max);
  
  if (isNaN(validatedBudgetMin) || isNaN(validatedBudgetMax)) {
    throw new Error('Budget values must be valid integers');
  }
  
  if (validatedBudgetMin > validatedBudgetMax) {
    throw new Error('budget_min cannot be greater than budget_max');
  }

  const validatedMoveInDate = validateDate(requiredMappings.move_in_date, false);
  if (!validatedMoveInDate) {
    throw new Error('Invalid move_in_date or date is in the past');
  }

  // Calculate completion percentage using schema required fields
  const requiredFieldsList = Object.keys(requiredMappings);
  const completedFields = requiredFieldsList.filter(field => {
    const value = requiredMappings[field];
    return value !== null && value !== undefined && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  });
  
  const completionPercentage = Math.round((completedFields.length / requiredFieldsList.length) * 100);
  const isCompleted = completionPercentage >= 80;

  // SCHEMA COMPLIANT: Create database record with all constraints
  const databaseRecord = {
    // CRITICAL: user_id references registrant_profiles.id
    user_id: userId,
    
    // REQUIRED FIELDS (NOT NULL constraints)
    primary_phone: requiredMappings.primary_phone,
    date_of_birth: validateDate(requiredMappings.date_of_birth),
    preferred_roommate_gender: requiredMappings.preferred_roommate_gender,
    primary_city: requiredMappings.primary_city,
    primary_state: validatedPrimaryState,
    // primary_location: EXCLUDED - auto-generated by database
    budget_min: validatedBudgetMin,
    budget_max: validatedBudgetMax,
    recovery_stage: requiredMappings.recovery_stage,
    recovery_methods: sanitizeArrayField(requiredMappings.recovery_methods, 'recovery_methods'),
    program_types: sanitizeArrayField(requiredMappings.program_types, 'program_types'),
    primary_issues: sanitizeArrayField(requiredMappings.primary_issues, 'primary_issues'),
    spiritual_affiliation: requiredMappings.spiritual_affiliation,
    work_schedule: requiredMappings.work_schedule,
    move_in_date: validatedMoveInDate,
    about_me: requiredMappings.about_me,
    looking_for: requiredMappings.looking_for,
    
    // LIFESTYLE FIELDS WITH SCHEMA DEFAULTS AND CONSTRAINTS
    social_level: validateIntegerWithRange(formData.socialLevel || formData.social_level, 1, 5, 3),
    cleanliness_level: validateIntegerWithRange(formData.cleanlinessLevel || formData.cleanliness_level, 1, 5, 3),
    noise_tolerance: validateIntegerWithRange(formData.noiseLevel || formData.noise_tolerance, 1, 5, 3),
    
    // OPTIONAL PERSONAL FIELDS
    gender_identity: formData.gender || formData.gender_identity,
    biological_sex: formData.sex || formData.biological_sex,
    gender_inclusive: formData.genderInclusive || formData.gender_inclusive || false,
    
    // OPTIONAL LOCATION FIELDS
    current_address: formData.address || formData.current_address,
    current_city: formData.city || formData.current_city,
    current_state: formData.state || formData.current_state,
    current_zip_code: formData.zipCode || formData.current_zip_code,
    target_zip_codes: formData.targetZipCodes || formData.target_zip_codes,
    search_radius_miles: validateIntegerWithRange(formData.searchRadius || formData.search_radius_miles, 1, 500, 30),
    location_flexibility: formData.locationFlexibility || formData.location_flexibility,
    max_commute_minutes: formData.maxCommute || formData.max_commute_minutes,
    transportation_method: formData.transportation || formData.transportation_method,
    
    // FINANCIAL FIELDS
    housing_assistance: sanitizeArrayField(formData.housingSubsidy || formData.housing_assistance, 'housing_assistance'),
    has_section8: formData.hasSection8 || formData.has_section8 || false,
    
    // RECOVERY FIELDS (OPTIONAL)
    time_in_recovery: formData.timeInRecovery || formData.time_in_recovery,
    sobriety_date: validateDate(formData.sobrietyDate || formData.sobriety_date),
    primary_substance: formData.primarySubstance || formData.primary_substance,
    treatment_history: formData.treatmentHistory || formData.treatment_history,
    support_meetings: formData.supportMeetings || formData.support_meetings,
    sponsor_mentor: formData.sponsorMentor || formData.sponsor_mentor,
    want_recovery_support: formData.wantRecoverySupport || formData.want_recovery_support || false,
    comfortable_discussing_recovery: formData.comfortableDiscussing || formData.comfortable_discussing_recovery || false,
    attend_meetings_together: formData.attendMeetingsTogether || formData.attend_meetings_together || false,
    substance_free_home_required: formData.substanceFreeHome !== false && formData.substance_free_home_required !== false, // Default true
    recovery_goal_timeframe: formData.recoveryGoalTimeframe || formData.recovery_goal_timeframe,
    recovery_context: formData.recoveryContext || formData.recovery_context,
    
    // SCHEDULE & WORK FIELDS
    work_from_home_frequency: formData.workFromHome || formData.work_from_home_frequency,
    bedtime_preference: formData.bedtimePreference || formData.bedtime_preference,
    early_riser: formData.earlyRiser || formData.early_riser || false,
    night_owl: formData.nightOwl || formData.night_owl || false,
    
    // SOCIAL & GUEST FIELDS
    guests_policy: formData.guestsPolicy || formData.guests_policy,
    social_activities_at_home: formData.socialActivitiesAtHome || formData.social_activities_at_home,
    overnight_guests_ok: formData.overnightGuestsOk || formData.overnight_guests_ok || false,
    
    // DAILY LIVING FIELDS
    cooking_enthusiast: formData.cookingEnthusiast || formData.cooking_enthusiast || false,
    cooking_frequency: formData.cookingFrequency || formData.cooking_frequency,
    exercise_at_home: formData.exerciseAtHome || formData.exercise_at_home || false,
    plays_instruments: formData.musicInstruments || formData.plays_instruments || false,
    tv_streaming_regular: formData.tvStreaming || formData.tv_streaming_regular || false,
    
    // COMMUNICATION FIELDS
    communication_style: formData.communicationStyle || formData.communication_style,
    conflict_resolution_style: formData.conflictResolutionStyle || formData.conflict_resolution_style,
    chore_sharing_style: formData.choreSharingStyle || formData.chore_sharing_style,
    chore_sharing_preference: formData.choreSharingPreference || formData.chore_sharing_preference,
    shared_groceries: formData.sharedGroceries || formData.shared_groceries || false,
    preferred_support_structure: formData.preferredSupportStructure || formData.preferred_support_structure,
    
    // PET & SMOKING FIELDS
    pets_owned: formData.petsOwned || formData.pets_owned || false,
    pets_comfortable: formData.petsComfortable || formData.pets_comfortable || false,
    pet_preference: formData.petPreference || formData.pet_preference,
    smoking_status: formData.smokingStatus || formData.smoking_status,
    smoking_preference: formData.smokingPreference || formData.smoking_preference,
    
    // HOUSING FIELDS
    housing_types_accepted: sanitizeArrayField(formData.housingType || formData.housing_types_accepted, 'housing_types_accepted'),
    preferred_bedrooms: formData.preferredBedrooms || formData.preferred_bedrooms,
    furnished_preference: formData.furnishedPreference || formData.furnished_preference,
    utilities_included_preference: formData.utilitiesIncluded || formData.utilities_included_preference,
    accessibility_needed: formData.accessibilityNeeded || formData.accessibility_needed || false,
    parking_required: formData.parkingRequired || formData.parking_required || false,
    public_transit_access: formData.publicTransitAccess || formData.public_transit_access || false,
    
    // TIMING FIELDS
    move_in_flexibility: formData.moveInFlexibility || formData.move_in_flexibility,
    lease_duration: formData.leaseDuration || formData.lease_duration,
    relocation_timeline: formData.relocationTimeline || formData.relocation_timeline,
    
    // GOALS & ASPIRATIONS FIELDS
    short_term_goals: formData.shortTermGoals || formData.short_term_goals,
    long_term_vision: formData.longTermVision || formData.long_term_vision,
    interests: sanitizeArrayField(formData.interests, 'interests'),
    additional_interests: formData.additionalInterests || formData.additional_interests,
    shared_activities_interest: formData.sharedActivities || formData.shared_activities_interest || false,
    important_qualities: sanitizeArrayField(formData.importantQualities || formData.important_qualities, 'important_qualities'),
    deal_breakers: sanitizeArrayField(formData.dealBreakers || formData.deal_breakers, 'deal_breakers'),
    
    // ADDITIONAL PROFILE FIELDS
    additional_info: formData.additionalInfo || formData.additional_info,
    special_needs: formData.specialNeeds || formData.special_needs,
    
    // PROFILE STATUS FIELDS
    is_active: formData.isActive !== false,
    profile_completed: isCompleted,
    profile_visibility: formData.profileVisibility || formData.profile_visibility || 'verified-members',
    completion_percentage: completionPercentage,
    
    // EMERGENCY CONTACT FIELDS
    emergency_contact_name: formData.emergencyContactName || formData.emergency_contact_name,
    emergency_contact_phone: formData.emergencyContactPhone || formData.emergency_contact_phone,
    emergency_contact_relationship: formData.emergencyContactRelationship || formData.emergency_contact_relationship,
    
    // ROOMMATE PREFERENCE FIELDS WITH SCHEMA CONSTRAINTS
    age_range_min: validateIntegerWithRange(formData.ageRangeMin || formData.age_range_min, 18, 100, 18),
    age_range_max: validateIntegerWithRange(formData.ageRangeMax || formData.age_range_max, 18, 100, 65),
    age_flexibility: formData.ageFlexibility || formData.age_flexibility,
    prefer_recovery_experience: formData.preferRecoveryExperience || formData.prefer_recovery_experience || false,
    supportive_of_recovery: formData.supportiveOfRecovery !== false && formData.supportive_of_recovery !== false, // Default true
    respect_privacy: formData.respectPrivacy !== false && formData.respect_privacy !== false, // Default true
    social_interaction_level: formData.socialInteractionLevel || formData.social_interaction_level,
    similar_schedules: formData.similarSchedules || formData.similar_schedules || false,
    shared_chores: formData.sharedChores || formData.shared_chores || false,
    financially_stable: formData.financiallyStable !== false && formData.financially_stable !== false, // Default true
    respectful_guests: formData.respectfulGuests !== false && formData.respectful_guests !== false, // Default true
    lgbtq_friendly: formData.lgbtqFriendly || formData.lgbtq_friendly || false,
    culturally_sensitive: formData.culturallySensitive !== false && formData.culturally_sensitive !== false, // Default true
    
    // DEAL BREAKER FIELDS
    deal_breaker_substance_use: formData.dealBreakerSubstanceUse || formData.deal_breaker_substance_use || false,
    deal_breaker_loudness: formData.dealBreakerLoudness || formData.deal_breaker_loudness || false,
    deal_breaker_uncleanliness: formData.dealBreakerUncleanliness || formData.deal_breaker_uncleanliness || false,
    deal_breaker_financial_issues: formData.dealBreakerFinancialIssues !== false && formData.deal_breaker_financial_issues !== false, // Default true
    deal_breaker_pets: formData.dealBreakerPets || formData.deal_breaker_pets || false,
    deal_breaker_smoking: formData.dealBreakerSmoking || formData.deal_breaker_smoking || false,
    
    // COMPATIBILITY PREFERENCE FIELDS
    overnight_guests_preference: formData.overnightGuestsPreference || formData.overnight_guests_preference || false,
    shared_transportation: formData.sharedTransportation || formData.shared_transportation || false,
    recovery_accountability: formData.recoveryAccountability || formData.recovery_accountability || false,
    shared_recovery_activities: formData.sharedRecoveryActivities || formData.shared_recovery_activities || false,
    mentorship_interest: formData.mentorshipInterest || formData.mentorship_interest || false,
    recovery_community: formData.recoveryCommunity || formData.recovery_community || false,
    
    // METADATA FIELDS
    profile_quality_score: Math.min(100, completionPercentage + 10), // Bonus for completion
    last_updated_section: formData.lastUpdatedSection || formData.last_updated_section,
    compatibility_scores: formData.compatibilityScores || formData.compatibility_scores || {},
    search_preferences: formData.searchPreferences || formData.search_preferences || {},
    matching_weights: formData.matchingWeights || formData.matching_weights || {},
    
    // TIMESTAMPS
    updated_at: new Date().toISOString()
    // created_at will be set by database default
  };

  // CRITICAL SAFEGUARD: Ensure primary_location is not included
  if ('primary_location' in databaseRecord) {
    console.error('CRITICAL ERROR: primary_location found in database record - removing it!');
    delete databaseRecord.primary_location;
  }

  // SCHEMA VALIDATION: Final check for constraint violations
  const finalValidation = validateProfileForMatching({
    ...databaseRecord,
    age: calculateAge(databaseRecord.date_of_birth)
  });
  
  if (finalValidation.errors.length > 0) {
    throw new Error(`Schema constraint violations: ${finalValidation.errors.join(', ')}`);
  }

  console.log('Schema compliant database record created:', {
    userId,
    fieldCount: Object.keys(databaseRecord).length,
    completionPercentage,
    containsPrimaryLocation: 'primary_location' in databaseRecord, // Should be false
    schemaCompliant: finalValidation.errors.length === 0
  });

  return databaseRecord;
};

/**
 * Get profile statistics for analysis
 * @param {Array} profiles - Array of transformed profiles
 * @returns {Object} Profile statistics
 */
export const getProfileStatistics = (profiles) => {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      averageCompletionPercentage: 0,
      averageQualityScore: 0
    };
  }

  const activeProfiles = profiles.filter(p => p.is_active);
  const completedProfiles = profiles.filter(p => p.profile_completed);
  
  const totalCompletion = profiles.reduce((sum, p) => sum + (p.completion_percentage || 0), 0);
  const totalQuality = profiles.reduce((sum, p) => sum + (p.profile_quality_score || 0), 0);
  
  return {
    total: profiles.length,
    active: activeProfiles.length,
    completed: completedProfiles.length,
    averageCompletionPercentage: Math.round(totalCompletion / profiles.length),
    averageQualityScore: Math.round(totalQuality / profiles.length),
    recoveryStageDistribution: getFieldDistribution(profiles, 'recovery_stage'),
    locationDistribution: getFieldDistribution(profiles, 'primary_state'),
    budgetDistribution: getBudgetDistribution(profiles)
  };
};

/**
 * Helper function to get field distribution
 */
const getFieldDistribution = (profiles, field) => {
  const distribution = {};
  profiles.forEach(profile => {
    const value = profile[field];
    if (value) {
      distribution[value] = (distribution[value] || 0) + 1;
    }
  });
  return distribution;
};

/**
 * Helper function to get budget distribution
 */
const getBudgetDistribution = (profiles) => {
  const ranges = {
    'Under $500': 0,
    '$500-$750': 0,
    '$750-$1000': 0,
    '$1000-$1500': 0,
    'Over $1500': 0
  };
  
  profiles.forEach(profile => {
    const budget = profile.budget_max;
    if (budget < 500) ranges['Under $500']++;
    else if (budget < 750) ranges['$500-$750']++;
    else if (budget < 1000) ranges['$750-$1000']++;
    else if (budget < 1500) ranges['$1000-$1500']++;
    else ranges['Over $1500']++;
  });
  
  return ranges;
};

export default {
  calculateAge,
  transformProfileForAlgorithm,
  transformProfilesForAlgorithm,
  validateProfileForMatching,
  filterMatchableProfiles,
  createProfileSummary,
  calculateLocationCompatibility,
  transformFormDataToDatabase,
  getProfileStatistics
};
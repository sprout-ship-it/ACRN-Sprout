// src/utils/matching/dataTransform.js - ENHANCED WITH COMPLETE SCHEMA INTEGRATION

/**
 * ✅ ENHANCED: Data transformation utilities for converting between standardized database schema 
 * and matching algorithm expectations. Full integration with applicant_matching_profiles table.
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
 * ✅ ENHANCED: Transform standardized database record to algorithm-compatible format
 * @param {Object} dbProfile - Raw database record from applicant_matching_profiles table
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
    
    // ===== PERSONAL DETAILS (Standardized) =====
    age: calculateAge(dbProfile.date_of_birth),
    first_name: dbProfile.first_name || 'Anonymous',
    last_name: dbProfile.last_name || '',
    email: dbProfile.email,
    primary_phone: dbProfile.primary_phone,
    date_of_birth: dbProfile.date_of_birth,
    
    // ===== GENDER & IDENTITY (Standardized) =====
    gender: dbProfile.gender_identity || dbProfile.gender, // Algorithm expects 'gender'
    gender_identity: dbProfile.gender_identity,
    biological_sex: dbProfile.biological_sex,
    preferred_roommate_gender: dbProfile.preferred_roommate_gender,
    gender_inclusive: dbProfile.gender_inclusive || false,
    
    // ===== LOCATION (Standardized) =====
    primary_city: dbProfile.primary_city,
    primary_state: dbProfile.primary_state,
    primary_location: dbProfile.primary_location || 
                     (dbProfile.primary_city && dbProfile.primary_state ? 
                      `${dbProfile.primary_city}, ${dbProfile.primary_state}` : null),
    location: dbProfile.primary_location || // Legacy compatibility
             (dbProfile.primary_city && dbProfile.primary_state ? 
              `${dbProfile.primary_city}, ${dbProfile.primary_state}` : 'Not specified'),
    current_address: dbProfile.current_address,
    current_city: dbProfile.current_city,
    current_state: dbProfile.current_state,
    current_zip_code: dbProfile.current_zip_code,
    current_location: dbProfile.current_city && dbProfile.current_state ? 
                     `${dbProfile.current_city}, ${dbProfile.current_state}` : null,
    target_zip_codes: dbProfile.target_zip_codes ? 
                     dbProfile.target_zip_codes.split(',').map(z => z.trim()) : [],
    search_radius_miles: dbProfile.search_radius_miles || 30,
    search_radius: dbProfile.search_radius_miles || 30, // Legacy compatibility
    location_flexibility: dbProfile.location_flexibility,
    max_commute_minutes: dbProfile.max_commute_minutes,
    max_commute: dbProfile.max_commute_minutes, // Legacy compatibility
    transportation_method: dbProfile.transportation_method,
    transportation: dbProfile.transportation_method, // Legacy compatibility
    
    // ===== BUDGET & FINANCIAL (Standardized) =====
    budget_min: dbProfile.budget_min || 0,
    budget_max: dbProfile.budget_max || 1000,
    price_range: { // Legacy compatibility
      min: dbProfile.budget_min || 0,
      max: dbProfile.budget_max || 1000
    },
    price_range_min: dbProfile.budget_min || 0, // Legacy compatibility
    price_range_max: dbProfile.budget_max || 1000, // Legacy compatibility
    
    // Housing assistance (standardized)
    housing_assistance: dbProfile.housing_assistance || [],
    housing_subsidy: dbProfile.housing_assistance || [], // Legacy compatibility
    has_section8: dbProfile.has_section8 || false,
    accepts_subsidy: dbProfile.housing_assistance?.length > 0, // Computed
    
    // ===== RECOVERY & WELLNESS (Standardized) =====
    // Recovery status
    recovery_stage: dbProfile.recovery_stage,
    time_in_recovery: dbProfile.time_in_recovery,
    sobriety_date: dbProfile.sobriety_date,
    primary_substance: dbProfile.primary_substance,
    
    // Recovery methods (standardized)
    recovery_methods: dbProfile.recovery_methods || [],
    program_types: dbProfile.program_types || [],
    program_type: dbProfile.program_types || [], // Legacy compatibility
    treatment_history: dbProfile.treatment_history,
    support_meetings: dbProfile.support_meetings,
    
    // Recovery support
    sponsor_mentor: dbProfile.sponsor_mentor,
    primary_issues: dbProfile.primary_issues || [],
    spiritual_affiliation: dbProfile.spiritual_affiliation,
    
    // Recovery environment (standardized)
    want_recovery_support: dbProfile.want_recovery_support || false,
    comfortable_discussing_recovery: dbProfile.comfortable_discussing_recovery || false,
    attend_meetings_together: dbProfile.attend_meetings_together || false,
    substance_free_home_required: dbProfile.substance_free_home_required !== false, // ✅ FIXED: Correct field name
    recovery_goal_timeframe: dbProfile.recovery_goal_timeframe,
    recovery_context: dbProfile.recovery_context,
    
    // ===== LIFESTYLE & LIVING PREFERENCES (Standardized) =====
    // Lifestyle scales (1-5, standardized)
    social_level: dbProfile.social_level || 3,
    cleanliness_level: dbProfile.cleanliness_level || 3,
    noise_tolerance: dbProfile.noise_tolerance || 3,
    noise_level: dbProfile.noise_tolerance || 3, // Legacy compatibility
    
    // Schedule & work (standardized)
    work_schedule: dbProfile.work_schedule,
    work_from_home_frequency: dbProfile.work_from_home_frequency,
    bedtime_preference: dbProfile.bedtime_preference,
    early_riser: dbProfile.early_riser || false,
    night_owl: dbProfile.night_owl || false,
    
    // Social & guests (standardized)
    guests_policy: dbProfile.guests_policy,
    guest_policy: dbProfile.guests_policy, // Legacy compatibility
    social_activities_at_home: dbProfile.social_activities_at_home,
    overnight_guests_ok: dbProfile.overnight_guests_ok !== false, // Default true
    
    // Daily living
    cooking_enthusiast: dbProfile.cooking_enthusiast || false,
    cooking_frequency: dbProfile.cooking_frequency,
    exercise_at_home: dbProfile.exercise_at_home || false,
    plays_instruments: dbProfile.plays_instruments || false,
    tv_streaming_regular: dbProfile.tv_streaming_regular || false,
    
    // ===== HOUSEHOLD MANAGEMENT & COMMUNICATION (Standardized) =====
    chore_sharing_style: dbProfile.chore_sharing_style,
    chore_sharing_preference: dbProfile.chore_sharing_preference || dbProfile.chore_sharing_style,
    shared_groceries: dbProfile.shared_groceries || false,
    communication_style: dbProfile.communication_style,
    conflict_resolution_style: dbProfile.conflict_resolution_style,
    preferred_support_structure: dbProfile.preferred_support_structure,
    
    // ===== PETS & SMOKING (Standardized) =====
    pets_owned: dbProfile.pets_owned || false,
    pets_comfortable: dbProfile.pets_comfortable !== false, // Default true
    pet_preference: dbProfile.pet_preference,
    smoking_status: dbProfile.smoking_status,
    smoking_preference: dbProfile.smoking_preference,
    
    // ===== HOUSING SPECIFICATIONS (Standardized) =====
    housing_types_accepted: dbProfile.housing_types_accepted || [],
    housing_type: dbProfile.housing_types_accepted || [], // Legacy compatibility
    preferred_bedrooms: dbProfile.preferred_bedrooms,
    furnished_preference: dbProfile.furnished_preference,
    utilities_included_preference: dbProfile.utilities_included_preference,
    accessibility_needed: dbProfile.accessibility_needed || false,
    parking_required: dbProfile.parking_required || false,
    public_transit_access: dbProfile.public_transit_access || false,
    
    // ===== TIMING & AVAILABILITY (Standardized) =====
    move_in_date: dbProfile.move_in_date,
    move_in_flexibility: dbProfile.move_in_flexibility,
    lease_duration: dbProfile.lease_duration,
    relocation_timeline: dbProfile.relocation_timeline,
    
    // ===== GOALS & ASPIRATIONS (Standardized) =====
    short_term_goals: dbProfile.short_term_goals,
    long_term_vision: dbProfile.long_term_vision,
    interests: dbProfile.interests || [],
    additional_interests: dbProfile.additional_interests,
    shared_activities_interest: dbProfile.shared_activities_interest || false,
    important_qualities: dbProfile.important_qualities || [],
    deal_breakers: dbProfile.deal_breakers || [],
    
    // ===== PROFILE CONTENT & STATUS (Standardized) =====
    about_me: dbProfile.about_me,
    looking_for: dbProfile.looking_for,
    additional_info: dbProfile.additional_info,
    special_needs: dbProfile.special_needs,
    is_active: dbProfile.is_active !== false, // Default true
    profile_completed: dbProfile.profile_completed || false,
    profile_visibility: dbProfile.profile_visibility || 'verified-members',
    completion_percentage: dbProfile.completion_percentage || 0,
    profile_quality_score: dbProfile.profile_quality_score || 0,
    
    // ===== EMERGENCY & CONTACT (Standardized) =====
    emergency_contact_name: dbProfile.emergency_contact_name,
    emergency_contact_phone: dbProfile.emergency_contact_phone,
    emergency_contact_relationship: dbProfile.emergency_contact_relationship,
    phone: dbProfile.primary_phone, // Legacy compatibility
    
    // ===== ROOMMATE PREFERENCES (Enhanced) =====
    age_range_min: dbProfile.age_range_min || 18,
    age_range_max: dbProfile.age_range_max || 65,
    age_flexibility: dbProfile.age_flexibility,
    prefer_recovery_experience: dbProfile.prefer_recovery_experience || false,
    supportive_of_recovery: dbProfile.supportive_of_recovery !== false, // Default true
    substance_free_home_required: dbProfile.substance_free_home_required !== false, // ✅ FIXED: Correct field name (roommate preference)
    respect_privacy: dbProfile.respect_privacy !== false, // Default true
    social_interaction_level: dbProfile.social_interaction_level,
    similar_schedules: dbProfile.similar_schedules || false,
    shared_chores: dbProfile.shared_chores || false,
    financially_stable: dbProfile.financially_stable !== false, // Default true
    respectful_guests: dbProfile.respectful_guests !== false, // Default true
    lgbtq_friendly: dbProfile.lgbtq_friendly || false,
    culturally_sensitive: dbProfile.culturally_sensitive !== false, // Default true
    
    // Deal breakers (specific)
    deal_breaker_substance_use: dbProfile.deal_breaker_substance_use || false,
    deal_breaker_loudness: dbProfile.deal_breaker_loudness || false,
    deal_breaker_uncleanliness: dbProfile.deal_breaker_uncleanliness || false,
    deal_breaker_financial_issues: dbProfile.deal_breaker_financial_issues !== false, // Default true
    deal_breaker_pets: dbProfile.deal_breaker_pets || false,
    deal_breaker_smoking: dbProfile.deal_breaker_smoking || false,
    
    // ===== COMPATIBILITY PREFERENCES (Enhanced) =====
    overnight_guests_preference: dbProfile.overnight_guests_preference || false,
    shared_transportation: dbProfile.shared_transportation || false,
    recovery_accountability: dbProfile.recovery_accountability || false,
    shared_recovery_activities: dbProfile.shared_recovery_activities || false,
    mentorship_interest: dbProfile.mentorship_interest || false,
    recovery_community: dbProfile.recovery_community || false,
    
    // ===== ALGORITHM METADATA =====
    compatibility_scores: dbProfile.compatibility_scores || {},
    search_preferences: dbProfile.search_preferences || {},
    matching_weights: dbProfile.matching_weights || {},
    
    // ===== TIMESTAMPS =====
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
    
    // ===== LEGACY COMPATIBILITY FIELDS =====
    // Add camelCase versions for backward compatibility with existing code
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
 * ✅ ENHANCED: Transform multiple profiles for algorithm use
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
 * ✅ ENHANCED: Validate profile has minimum required data for enhanced matching
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

  // ✅ UPDATED: Core requirements based on Master Data Mapping priority
  const coreRequired = [
    'user_id',
    'primary_city',
    'primary_state', 
    'budget_min',
    'budget_max',
    'preferred_roommate_gender',
    'recovery_stage',
    'recovery_methods',
    'primary_issues',
    'spiritual_affiliation',
    'social_level',
    'cleanliness_level',
    'noise_tolerance',
    'work_schedule',
    'move_in_date',
    'about_me',
    'looking_for'
  ];

  // High priority fields that should be present for quality matching
  const highPriority = [
    'age',
    'date_of_birth',
    'substance_free_home_required', // ✅ FIXED: Correct field name
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

  const missingCore = coreRequired.filter(field => {
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

  const warnings = [];
  
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
  const coreScore = Math.max(0, 70 - (missingCore.length * 10)); // 70 points for core
  const highScore = Math.max(0, 20 - (missingHigh.length * 2.5)); // 20 points for high priority
  const mediumScore = Math.max(0, 10 - (missingMedium.length * 1)); // 10 points for medium priority
  const qualityScore = coreScore + highScore + mediumScore;

  return {
    isValid: missingCore.length === 0,
    missing: missingCore,
    missingHigh,
    missingMedium,
    warnings,
    score: Math.round(qualityScore),
    coreComplete: missingCore.length === 0,
    highPriorityComplete: missingHigh.length === 0,
    mediumPriorityComplete: missingMedium.length === 0
  };
};

/**
 * ✅ ENHANCED: Filter profiles suitable for enhanced matching
 * @param {Array} profiles - Array of transformed profiles
 * @param {Object} options - Filtering options
 * @returns {Array} Filtered profiles suitable for matching
 */
export const filterMatchableProfiles = (profiles, options = {}) => {
  const {
    requireCompleted = true,
    requireActive = true,
    minValidationScore = 80, // Higher threshold for enhanced matching
    requireCoreComplete = true,
    logFiltering = false
  } = options;

  return profiles.filter(profile => {
    const validation = validateProfileForMatching(profile);
    
    // Must pass core validation
    if (requireCoreComplete && !validation.coreComplete) {
      if (logFiltering) {
        console.log(`❌ Profile ${profile.user_id} missing core fields:`, validation.missing);
      }
      return false;
    }

    // Must be valid for basic matching
    if (!validation.isValid) {
      if (logFiltering) {
        console.log(`❌ Profile ${profile.user_id} failed basic validation:`, validation.missing);
      }
      return false;
    }

    // Check completion status
    if (requireCompleted && !profile.profile_completed) {
      if (logFiltering) {
        console.log(`⚠️ Profile ${profile.user_id} not completed`);
      }
      return false;
    }

    // Check active status
    if (requireActive && !profile.is_active) {
      if (logFiltering) {
        console.log(`⚠️ Profile ${profile.user_id} not active`);
      }
      return false;
    }

    // Check enhanced validation score
    if (validation.score < minValidationScore) {
      if (logFiltering) {
        console.log(`⚠️ Profile ${profile.user_id} validation score too low: ${validation.score} < ${minValidationScore}`);
      }
      return false;
    }

    return true;
  });
};

/**
 * ✅ ENHANCED: Create comprehensive profile summary for debugging
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
    
    // Enhanced validation
    validation: {
      score: validation.score,
      coreComplete: validation.coreComplete,
      highPriorityComplete: validation.highPriorityComplete,
      isValid: validation.isValid,
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
 * ✅ ENHANCED: Location compatibility with standardized fields
 * @param {Object} profile1 - First profile
 * @param {Object} profile2 - Second profile
 * @returns {number} Location compatibility score (0-100)
 */
export const calculateLocationCompatibility = (profile1, profile2) => {
  // Use standardized location fields
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
 * ✅ NEW: Transform form submission data to database format
 * @param {Object} formData - Form data from EnhancedMatchingProfileForm
 * @param {string} userId - User ID
 * @returns {Object} Database-ready record
 */
export const transformFormDataToDatabase = (formData, userId) => {
  if (!formData || !userId) {
    throw new Error('Form data and user ID are required');
  }

  // Calculate completion percentage
  const requiredFields = [
    'primary_city', 'primary_state', 'budget_min', 'budget_max', 
    'preferred_roommate_gender', 'recovery_stage', 'recovery_methods',
    'primary_issues', 'spiritual_affiliation', 'social_level',
    'cleanliness_level', 'noise_tolerance', 'work_schedule',
    'move_in_date', 'about_me', 'looking_for'
  ];
  
  const completedFields = requiredFields.filter(field => {
    const value = formData[field];
    return value !== null && value !== undefined && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  });
  
  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
  const isCompleted = completionPercentage >= 80;

  return {
    user_id: userId,
    
    // Personal information
    primary_phone: formData.phone,
    date_of_birth: formData.dateOfBirth,
    
    // Gender & Identity
    gender_identity: formData.gender,
    biological_sex: formData.sex,
    preferred_roommate_gender: formData.preferredRoommateGender,
    gender_inclusive: formData.genderInclusive || false,
    
    // Location
    primary_city: formData.primary_city,
    primary_state: formData.primary_state,
    current_address: formData.address,
    current_city: formData.city,
    current_state: formData.state,
    current_zip_code: formData.zipCode,
    target_zip_codes: formData.targetZipCodes,
    search_radius_miles: formData.searchRadius || 30,
    location_flexibility: formData.locationFlexibility,
    max_commute_minutes: formData.maxCommute,
    transportation_method: formData.transportation,
    
    // Budget
    budget_min: parseInt(formData.budget_min) || 0,
    budget_max: parseInt(formData.budget_max) || 1000,
    
    // Housing assistance
    housing_assistance: formData.housingSubsidy || [],
    has_section8: formData.hasSection8 || false,
    
    // Recovery
    recovery_stage: formData.recoveryStage,
    time_in_recovery: formData.timeInRecovery,
    sobriety_date: formData.sobrietyDate,
    primary_substance: formData.primarySubstance,
    recovery_methods: formData.recoveryMethods || [],
    program_types: formData.programType || [],
    treatment_history: formData.treatmentHistory,
    support_meetings: formData.supportMeetings,
    sponsor_mentor: formData.sponsorMentor,
    primary_issues: formData.primaryIssues || [],
    spiritual_affiliation: formData.spiritualAffiliation,
    
    // Recovery environment
    want_recovery_support: formData.wantRecoverySupport || false,
    comfortable_discussing_recovery: formData.comfortableDiscussing || false,
    attend_meetings_together: formData.attendMeetingsTogether || false,
    substance_free_home_required: formData.substanceFreeHome !== false, // ✅ FIXED: Correct field name
    recovery_goal_timeframe: formData.recoveryGoalTimeframe,
    recovery_context: formData.recoveryContext,
    
    // Lifestyle
    social_level: parseInt(formData.socialLevel) || 3,
    cleanliness_level: parseInt(formData.cleanlinessLevel) || 3,
    noise_tolerance: parseInt(formData.noiseLevel) || 3,
    
    // Schedule & work
    work_schedule: formData.workSchedule,
    work_from_home_frequency: formData.workFromHome,
    bedtime_preference: formData.bedtimePreference,
    early_riser: formData.earlyRiser || false,
    night_owl: formData.nightOwl || false,
    
    // Social & guests
    guests_policy: formData.guestsPolicy,
    social_activities_at_home: formData.socialActivitiesAtHome,
    overnight_guests_ok: formData.overnightGuestsOk || false,
    
    // Daily living
    cooking_enthusiast: formData.cookingEnthusiast || false,
    cooking_frequency: formData.cookingFrequency,
    exercise_at_home: formData.exerciseAtHome || false,
    plays_instruments: formData.musicInstruments || false,
    tv_streaming_regular: formData.tvStreaming || false,
    
    // Communication
    communication_style: formData.communicationStyle,
    conflict_resolution_style: formData.conflictResolutionStyle,
    chore_sharing_style: formData.choreSharingStyle,
    chore_sharing_preference: formData.choreSharingPreference,
    shared_groceries: formData.sharedGroceries || false,
    preferred_support_structure: formData.preferredSupportStructure,
    
    // Pets & smoking
    pets_owned: formData.petsOwned || false,
    pets_comfortable: formData.petsComfortable || false,
    pet_preference: formData.petPreference,
    smoking_status: formData.smokingStatus,
    smoking_preference: formData.smokingPreference,
    
    // Housing
    housing_types_accepted: formData.housingType || [],
    preferred_bedrooms: formData.preferredBedrooms,
    furnished_preference: formData.furnishedPreference,
    utilities_included_preference: formData.utilitiesIncluded,
    accessibility_needed: formData.accessibilityNeeded || false,
    parking_required: formData.parkingRequired || false,
    public_transit_access: formData.publicTransitAccess || false,
    
    // Timing
    move_in_date: formData.moveInDate,
    move_in_flexibility: formData.moveInFlexibility,
    lease_duration: formData.leaseDuration,
    relocation_timeline: formData.relocationTimeline,
    
    // Goals & aspirations
    short_term_goals: formData.shortTermGoals,
    long_term_vision: formData.longTermVision,
    interests: formData.interests || [],
    additional_interests: formData.additionalInterests,
    shared_activities_interest: formData.sharedActivities || false,
    important_qualities: formData.importantQualities || [],
    deal_breakers: formData.dealBreakers || [],
    
    // Profile content
    about_me: formData.aboutMe,
    looking_for: formData.lookingFor,
    additional_info: formData.additionalInfo,
    special_needs: formData.specialNeeds,
    
    // Profile status
    is_active: formData.isActive !== false,
    profile_completed: isCompleted,
    profile_visibility: formData.profileVisibility || 'verified-members',
    completion_percentage: completionPercentage,
    
    // Emergency contact
    emergency_contact_name: formData.emergencyContactName,
    emergency_contact_phone: formData.emergencyContactPhone,
    emergency_contact_relationship: formData.emergencyContactRelationship,
    
    // Timestamps
    updated_at: new Date().toISOString()
  };
};

/**
 * ✅ NEW: Get profile statistics for analysis
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
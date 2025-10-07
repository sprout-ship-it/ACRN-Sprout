// src/utils/matching/sectionValidation.js - Enhanced with Schema Constraints
/**
 * Section-level validation utility for matching profile form
 * Validates each section and prevents navigation if critical issues exist
 * ENHANCED: Added schema constraint alignment and improved validation messages
 */

/**
 * Validation rules for each section - ENHANCED with schema constraints
 */
const SECTION_VALIDATION_RULES = {
  personal: {
    required: ['date_of_birth', 'primary_phone'],
    warnings: ['emergency_contact_name', 'emergency_contact_phone'],
    validations: {
date_of_birth: (value) => {
  if (!value) return 'Date of birth is required';
  
  try {
    const birthDate = new Date(value);
    const today = new Date();
    
    // Validate that the date is valid
    if (isNaN(birthDate.getTime())) {
      return 'Please enter a valid date';
    }
    
    // Calculate age using let so it can be modified
    let age = today.getFullYear() - birthDate.getFullYear(); // ✅ let
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // More precise age calculation - now age can be decremented
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--; // ✅ Now this works!
    }
    
    if (age < 18) return 'Must be 18 or older to use this service';
    if (age > 100) return 'Please enter a valid birth date';
    
    return null;
  } catch (error) {
    console.error('Date validation error:', error);
    return 'Please enter a valid date';
  }
},
      primary_phone: (value) => {
        if (!value) return 'Phone number is required for potential roommate contact';
        const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
        const cleanPhone = value.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          return 'Please enter a valid phone number (10 digits)';
        }
        return null;
      }
    }
  },

  location: {
    required: ['primary_city', 'primary_state', 'budget_min', 'budget_max', 'max_commute_minutes', 'move_in_date', 'housing_types_accepted'],
    warnings: ['search_radius_miles', 'target_zip_codes'],
    validations: {
      primary_city: (value) => {
        if (!value) return 'Primary city is required for location-based matching';
        if (value.length < 2) return 'Please enter a valid city name';
        return null;
      },
      primary_state: (value) => {
        if (!value) return 'Primary state is required for location-based matching';
        return null;
      },
      budget_min: (value) => {
        if (!value) return 'Minimum budget is required for housing search';
        const min = parseInt(value);
        if (isNaN(min)) return 'Please enter a valid number';
        if (min < 200) return 'Minimum budget should be at least $200 for realistic housing options';
        if (min > 4500) return 'Minimum budget cannot exceed $4,500';
        return null;
      },
      budget_max: (value, formData) => {
        if (!value) return 'Maximum budget is required for housing search';
        const max = parseInt(value);
        const min = parseInt(formData.budget_min || 0);
        if (isNaN(max)) return 'Please enter a valid number';
        if (max < 300) return 'Maximum budget should be at least $300 for realistic housing options';
        if (max > 5000) return 'Maximum budget cannot exceed $5,000';
        if (max < min) return 'Maximum budget must be greater than minimum budget';
        if (max - min < 100) return 'Budget range should be at least $100 for flexibility';
        return null;
      },
      max_commute_minutes: (value) => {
        if (!value) return 'Maximum commute time preference is required';
        const minutes = parseInt(value);
        if (isNaN(minutes)) return 'Please enter a valid number';
        if (minutes < 15) return 'Minimum commute tolerance should be at least 15 minutes';
        if (minutes > 180) return 'Maximum commute cannot exceed 3 hours';
        return null;
      },
      move_in_date: (value) => {
        if (!value) return 'Move-in date is required for housing timeline matching';
        const moveDate = new Date(value);
        const today = new Date();
        const maxFuture = new Date();
        maxFuture.setFullYear(today.getFullYear() + 1);
        
        if (isNaN(moveDate.getTime())) return 'Please enter a valid date';
        if (moveDate < today) return 'Move-in date cannot be in the past';
        if (moveDate > maxFuture) return 'Move-in date cannot be more than 1 year in the future';
        return null;
      },
      housing_types_accepted: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one housing type you would consider';
        }
        if (value.length > 6) {
          return 'Please select no more than 6 housing types for focused matching';
        }
        return null;
      }
    }
  },

  recovery: {
    required: ['recovery_stage', 'spiritual_affiliation', 'primary_issues', 'recovery_methods', 'program_types', 'substance_free_home_required'],
    warnings: ['recovery_context', 'time_in_recovery'],
    validations: {
      recovery_stage: (value) => {
        if (!value) return 'Recovery stage is required for appropriate roommate matching';
        return null;
      },
      spiritual_affiliation: (value) => {
        if (!value) return 'Spiritual/religious approach preference is required for compatibility';
        return null;
      },
      primary_issues: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one primary issue you are addressing in recovery';
        }
        if (value.length > 5) {
          return 'Please select your top 5 primary issues for focused matching';
        }
        return null;
      },
      recovery_methods: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one recovery method you use or are interested in';
        }
        if (value.length > 8) {
          return 'Please select your top 8 recovery methods for focused matching';
        }
        return null;
      },
      program_types: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one program type you attend or would be comfortable with';
        }
        if (value.length > 6) {
          return 'Please select your top 6 program types for focused matching';
        }
        return null;
      },
      substance_free_home_required: (value) => {
        if (value === null || value === undefined) {
          return 'Please specify if you require a substance-free home environment';
        }
        return null;
      }
    }
  },

  roommate: {
    required: ['preferred_roommate_gender', 'smoking_status', 'smoking_preference'],
    warnings: ['age_range_min', 'age_range_max', 'pet_preference'],
    validations: {
      preferred_roommate_gender: (value) => {
        if (!value) return 'Roommate gender preference is required for appropriate matching';
        return null;
      },
      smoking_status: (value) => {
        if (!value) return 'Your smoking status is required for compatibility matching';
        return null;
      },
      smoking_preference: (value) => {
        if (!value) return 'Your smoking preference for roommates is required';
        return null;
      },
      age_range_min: (value, formData) => {
        const min = parseInt(value || 18);
        const max = parseInt(formData.age_range_max || 65);
        if (isNaN(min)) return 'Please enter a valid minimum age';
        if (min < 18) return 'Minimum age must be at least 18';
        if (min >= max) return 'Minimum age must be less than maximum age';
        return null;
      },
      age_range_max: (value, formData) => {
        const max = parseInt(value || 65);
        const min = parseInt(formData.age_range_min || 18);
        if (isNaN(max)) return 'Please enter a valid maximum age';
        if (max > 100) return 'Maximum age cannot exceed 100';
        if (max <= min) return 'Maximum age must be greater than minimum age';
        if (max - min < 5) return 'Age range should be at least 5 years for better matching';
        return null;
      }
    }
  },

  lifestyle: {
    required: ['work_schedule', 'social_level', 'cleanliness_level', 'noise_tolerance'],
    warnings: ['bedtime_preference', 'guests_policy'],
    validations: {
      work_schedule: (value) => {
        if (!value) return 'Work schedule is required for lifestyle compatibility';
        return null;
      },
      social_level: (value) => {
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 5) {
          return 'Please select your social interaction level (1 = Very Private, 5 = Very Social)';
        }
        return null;
      },
      cleanliness_level: (value) => {
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 5) {
          return 'Please select your cleanliness level (1 = Very Relaxed, 5 = Very Organized)';
        }
        return null;
      },
      noise_tolerance: (value) => {
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 5) {
          return 'Please select your noise tolerance level (1 = Need Quiet, 5 = High Tolerance)';
        }
        return null;
      }
    }
  },

  compatibility: {
    required: ['about_me', 'looking_for', 'interests'],
    warnings: ['important_qualities', 'deal_breakers'],
    validations: {
      about_me: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please tell potential roommates about yourself';
        }
        if (value.trim().length < 50) {
          return 'Please provide more details about yourself (at least 50 characters) to help with matching';
        }
        if (value.trim().length > 1000) {
          return 'Please keep your description under 1000 characters';
        }
        return null;
      },
      looking_for: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please describe what you are looking for in a roommate';
        }
        if (value.trim().length < 50) {
          return 'Please provide more details about what you are looking for (at least 50 characters)';
        }
        if (value.trim().length > 1000) {
          return 'Please keep your description under 1000 characters';
        }
        return null;
      },
      interests: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one interest or hobby for compatibility matching';
        }
        if (value.length > 10) {
          return 'Please select your top 10 interests for focused matching';
        }
        return null;
      }
    }
  }
};

/**
 * ✅ ENHANCED: Schema constraint validation
 * Validates against database-level constraints
 */
const validateSchemaConstraints = (formData) => {
  const errors = {};

  // Check age range constraint from schema
  const ageMin = parseInt(formData.age_range_min || 18);
  const ageMax = parseInt(formData.age_range_max || 65);
  if (ageMin < 18) errors.age_range_min = 'Minimum age must be at least 18 (database constraint)';
  if (ageMax > 100) errors.age_range_max = 'Maximum age cannot exceed 100 (database constraint)';

  // Check budget range constraint
  const budgetMin = parseInt(formData.budget_min || 0);
  const budgetMax = parseInt(formData.budget_max || 0);
  if (budgetMin > budgetMax) errors.budget_max = 'Maximum budget must be greater than minimum budget';

  // Check move-in date constraint
  if (formData.move_in_date) {
    const moveDate = new Date(formData.move_in_date);
    const today = new Date();
    if (moveDate < today) errors.move_in_date = 'Move-in date cannot be in the past (database constraint)';
  }

  // Check lifestyle levels are within range (1-5)
  ['social_level', 'cleanliness_level', 'noise_tolerance'].forEach(field => {
    const level = parseInt(formData[field]);
    if (formData[field] && (isNaN(level) || level < 1 || level > 5)) {
      errors[field] = `${getFieldDisplayName(field)} must be between 1 and 5 (database constraint)`;
    }
  });

  return errors;
};

/**
 * Validate a specific section
 * @param {string} sectionId - Section identifier
 * @param {Object} formData - Current form data
 * @returns {Object} Validation result with errors and warnings
 */
export const validateSection = (sectionId, formData) => {
  console.log('🔍 Validating section:', sectionId);
  
  const rules = SECTION_VALIDATION_RULES[sectionId];
  if (!rules) {
    console.warn(`No validation rules found for section: ${sectionId}`);
    return { isValid: true, errors: {}, warnings: {}, requiredMissing: [], warningsMissing: [] };
  }

  const errors = {};
  const warnings = {};
  const requiredMissing = [];
  const warningsMissing = [];

  // ✅ ENHANCED: Add schema constraint validation
  const schemaErrors = validateSchemaConstraints(formData);
  Object.assign(errors, schemaErrors);

  // Check required fields
  rules.required.forEach(field => {
    const value = formData[field];
    
    // Check if field has a custom validation function
    if (rules.validations[field]) {
      const error = rules.validations[field](value, formData);
      if (error) {
        errors[field] = error;
        requiredMissing.push(field);
      }
    } else {
      // Default required field validation
      if (value === null || value === undefined || value === '') {
        const errorMsg = `${getFieldDisplayName(field)} is required`;
        errors[field] = errorMsg;
        requiredMissing.push(field);
      } else if (Array.isArray(value) && value.length === 0) {
        const errorMsg = `Please select at least one option for ${getFieldDisplayName(field)}`;
        errors[field] = errorMsg;
        requiredMissing.push(field);
      }
    }
  });

  // Check warning fields (optional but recommended)
  if (rules.warnings) {
    rules.warnings.forEach(field => {
      const value = formData[field];
      if (value === null || value === undefined || value === '') {
        warnings[field] = `Consider adding ${getFieldDisplayName(field)} for better matches`;
        warningsMissing.push(field);
      } else if (Array.isArray(value) && value.length === 0) {
        warnings[field] = `Consider selecting options for ${getFieldDisplayName(field)}`;
        warningsMissing.push(field);
      }
    });
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    warnings,
    requiredMissing,
    warningsMissing,
    errorCount: Object.keys(errors).length,
    warningCount: Object.keys(warnings).length
  };
};

/**
 * Validate all sections
 * @param {Object} formData - Current form data
 * @returns {Object} Complete validation result
 */
export const validateAllSections = (formData) => {
  const results = {};
  const allErrors = {};
  const allWarnings = {};
  let totalErrors = 0;
  let totalWarnings = 0;
  let sectionsWithErrors = [];
  let sectionsWithWarnings = [];

  Object.keys(SECTION_VALIDATION_RULES).forEach(sectionId => {
    const result = validateSection(sectionId, formData);
    results[sectionId] = result;
    
    // Merge errors and warnings
    Object.assign(allErrors, result.errors);
    Object.assign(allWarnings, result.warnings);
    
    totalErrors += result.errorCount;
    totalWarnings += result.warningCount;
    
    if (!result.isValid) {
      sectionsWithErrors.push(sectionId);
    }
    
    if (result.warningCount > 0) {
      sectionsWithWarnings.push(sectionId);
    }
  });

  const overallValid = totalErrors === 0;

  return {
    isValid: overallValid,
    results,
    allErrors,
    allWarnings,
    totalErrors,
    totalWarnings,
    sectionsWithErrors,
    sectionsWithWarnings,
    canSubmit: overallValid
  };
};

/**
 * Check if navigation away from section should be blocked
 * @param {string} fromSectionId - Section being navigated away from
 * @param {Object} formData - Current form data
 * @returns {Object} Navigation decision
 */
export const shouldBlockNavigation = (fromSectionId, formData) => {
  const validation = validateSection(fromSectionId, formData);
  
  // Block if there are critical errors
  const criticalErrors = validation.requiredMissing.length;
  
  if (criticalErrors > 0) {
    return {
      shouldBlock: true,
      reason: 'critical_errors',
      message: `Please complete all required fields in this section before continuing. ${criticalErrors} required field${criticalErrors > 1 ? 's' : ''} missing: ${validation.requiredMissing.map(getFieldDisplayName).join(', ')}`,
      errors: validation.errors,
      criticalCount: criticalErrors,
      missingFields: validation.requiredMissing
    };
  }

  // Warn but don't block if there are warnings
  if (validation.warningCount > 0) {
    return {
      shouldBlock: false,
      reason: 'warnings',
      message: `This section has ${validation.warningCount} recommended field${validation.warningCount > 1 ? 's' : ''} that could improve your matches.`,
      warnings: validation.warnings,
      warningCount: validation.warningCount
    };
  }

  return {
    shouldBlock: false,
    reason: 'complete',
    message: 'Section is complete'
  };
};

/**
 * Get section completion status
 * @param {string} sectionId - Section identifier
 * @param {Object} formData - Current form data
 * @returns {Object} Completion status
 */
export const getSectionStatus = (sectionId, formData) => {
  const validation = validateSection(sectionId, formData);
  
  if (validation.isValid && validation.warningCount === 0) {
    return {
      status: 'complete',
      icon: '✅',
      color: 'green',
      message: 'Complete'
    };
  } else if (validation.isValid && validation.warningCount > 0) {
    return {
      status: 'complete-with-warnings',
      icon: '⚠️',
      color: 'orange',
      message: `Complete (${validation.warningCount} suggestions)`
    };
  } else if (validation.errorCount > 0) {
    return {
      status: 'incomplete',
      icon: '❌',
      color: 'red',
      message: `${validation.errorCount} required field${validation.errorCount > 1 ? 's' : ''} missing`
    };
  } else {
    return {
      status: 'not-started',
      icon: '⭕',
      color: 'gray',
      message: 'Not started'
    };
  }
};

/**
 * Generate user-friendly field names - ENHANCED with all schema fields
 */
export const getFieldDisplayName = (fieldName) => {
  const displayNames = {
    // Personal Info Section
    date_of_birth: 'Date of Birth',
    primary_phone: 'Phone Number',
    emergency_contact_name: 'Emergency Contact Name',
    emergency_contact_phone: 'Emergency Contact Phone',
    
    // Location Section  
    primary_city: 'Primary City',
    primary_state: 'Primary State',
    budget_min: 'Minimum Budget',
    budget_max: 'Maximum Budget',
    max_commute_minutes: 'Maximum Commute Time',
    move_in_date: 'Move-in Date',
    housing_types_accepted: 'Housing Types',
    search_radius_miles: 'Search Radius',
    target_zip_codes: 'Target Zip Codes',
    
    // Recovery Section
    recovery_stage: 'Recovery Stage',
    spiritual_affiliation: 'Spiritual/Religious Approach',
    primary_issues: 'Primary Issues',
    recovery_methods: 'Recovery Methods',
    program_types: 'Program Types',
    recovery_context: 'Recovery Context',
    time_in_recovery: 'Time in Recovery',
    substance_free_home_required: 'Substance-Free Home Required',
    
    // Roommate Section
    preferred_roommate_gender: 'Roommate Gender Preference',
    smoking_status: 'Your Smoking Status',
    smoking_preference: 'Roommate Smoking Preference',
    age_range_min: 'Minimum Age Preference',
    age_range_max: 'Maximum Age Preference',
    pet_preference: 'Pet Preference',
    
    // Lifestyle Section
    work_schedule: 'Work Schedule',
    social_level: 'Social Interaction Level',
    cleanliness_level: 'Cleanliness Level',
    noise_tolerance: 'Noise Tolerance',
    bedtime_preference: 'Bedtime Preference',
    guests_policy: 'Guests Policy',
    
    // Compatibility Section
    about_me: 'About Me',
    looking_for: 'What I\'m Looking For',
    interests: 'Interests & Hobbies',
    important_qualities: 'Important Qualities',
    deal_breakers: 'Deal Breakers'
  };

  return displayNames[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Create a validation summary for display
 * @param {Object} validationResult - Result from validateAllSections
 * @returns {Object} Summary for UI display
 */
export const createValidationSummary = (validationResult) => {
  const summary = {
    canSubmit: validationResult.canSubmit,
    totalIssues: validationResult.totalErrors + validationResult.totalWarnings,
    criticalIssues: validationResult.totalErrors,
    suggestions: validationResult.totalWarnings,
    sectionsNeedingAttention: [],
    overallCompletion: 0
  };

  // Calculate overall completion percentage
  const totalSections = Object.keys(SECTION_VALIDATION_RULES).length;
  const completeSections = totalSections - validationResult.sectionsWithErrors.length;
  summary.overallCompletion = Math.round((completeSections / totalSections) * 100);

  // Create section-specific messages
  Object.keys(validationResult.results).forEach(sectionId => {
    const result = validationResult.results[sectionId];
    if (!result.isValid || result.warningCount > 0) {
      summary.sectionsNeedingAttention.push({
        sectionId,
        sectionName: sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
        errors: result.errorCount,
        warnings: result.warningCount,
        status: getSectionStatus(sectionId, {}).status
      });
    }
  });

  return summary;
};

export default {
  validateSection,
  validateAllSections,
  shouldBlockNavigation,
  getSectionStatus,
  getFieldDisplayName,
  createValidationSummary
};
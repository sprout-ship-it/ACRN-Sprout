// src/utils/matching/sectionValidation.js - NEW UTILITY
/**
 * Section-level validation utility for matching profile form
 * Validates each section and prevents navigation if critical issues exist
 */

/**
 * Validation rules for each section
 */
const SECTION_VALIDATION_RULES = {
  personal: {
    required: ['dateOfBirth', 'phone'],
    warnings: ['emergencyContactName', 'emergencyContactPhone'],
    validations: {
      dateOfBirth: (value) => {
        if (!value) return 'Date of birth is required';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) return 'Must be 18 or older';
        return null;
      },
      phone: (value) => {
        if (!value) return 'Phone number is required';
        const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return null;
      }
    }
  },

  location: {
    required: ['primary_city', 'primary_state', 'budget_min', 'budget_max', 'maxCommute', 'moveInDate'],
    warnings: ['housingType'],
    validations: {
      primary_city: (value) => !value ? 'Primary city is required' : null,
      primary_state: (value) => !value ? 'Primary state is required' : null,
      budget_min: (value) => {
        if (!value) return 'Minimum budget is required';
        const min = parseInt(value);
        if (min < 200) return 'Minimum budget should be at least $200';
        if (min > 4500) return 'Minimum budget cannot exceed $4,500';
        return null;
      },
      budget_max: (value, formData) => {
        if (!value) return 'Maximum budget is required';
        const max = parseInt(value);
        const min = parseInt(formData.budget_min || 0);
        if (max < 300) return 'Maximum budget should be at least $300';
        if (max > 5000) return 'Maximum budget cannot exceed $5,000';
        if (max < min) return 'Maximum budget must be greater than minimum budget';
        return null;
      },
      maxCommute: (value) => !value ? 'Maximum commute time preference is required' : null,
      moveInDate: (value) => {
        if (!value) return 'Move-in date is required';
        const moveDate = new Date(value);
        const today = new Date();
        if (moveDate < today) return 'Move-in date cannot be in the past';
        return null;
      },
      housingType: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one housing type you would consider';
        }
        return null;
      }
    }
  },

  recovery: {
    required: ['recoveryStage', 'spiritualAffiliation', 'primaryIssues', 'recovery_methods', 'programType'],
    warnings: ['recoveryContext'],
    validations: {
      recoveryStage: (value) => !value ? 'Recovery stage is required' : null,
      spiritualAffiliation: (value) => !value ? 'Spiritual/religious approach is required' : null,
      primaryIssues: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one primary issue you are addressing';
        }
        return null;
      },
      recovery_methods: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one recovery method you use or are interested in';
        }
        return null;
      },
      programType: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one program type you attend or would be comfortable with';
        }
        return null;
      }
    }
  },

  roommate: {
    required: ['preferred_roommate_gender', 'smokingStatus'],
    warnings: ['ageRangeMin', 'ageRangeMax'],
    validations: {
      preferred_roommate_gender: (value) => !value ? 'Roommate gender preference is required' : null,
      smokingStatus: (value) => !value ? 'Your smoking status is required' : null,
      ageRangeMin: (value, formData) => {
        const min = parseInt(value || 18);
        const max = parseInt(formData.ageRangeMax || 65);
        if (min >= max) return 'Minimum age must be less than maximum age';
        return null;
      },
      ageRangeMax: (value, formData) => {
        const max = parseInt(value || 65);
        const min = parseInt(formData.ageRangeMin || 18);
        if (max <= min) return 'Maximum age must be greater than minimum age';
        return null;
      }
    }
  },

  lifestyle: {
    required: ['workSchedule'],
    warnings: ['socialLevel', 'cleanlinessLevel', 'noiseLevel'],
    validations: {
      workSchedule: (value) => !value ? 'Work schedule is required' : null,
      socialLevel: (value) => {
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 5) {
          return 'Please select your social interaction level (1-5)';
        }
        return null;
      },
      cleanlinessLevel: (value) => {
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 5) {
          return 'Please select your cleanliness level (1-5)';
        }
        return null;
      },
      noiseLevel: (value) => {
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 5) {
          return 'Please select your noise tolerance level (1-5)';
        }
        return null;
      }
    }
  },

  compatibility: {
    required: ['aboutMe', 'lookingFor'],
    warnings: ['interests'],
    validations: {
      aboutMe: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please tell potential roommates about yourself';
        }
        if (value.trim().length < 50) {
          return 'Please provide more details about yourself (at least 50 characters)';
        }
        return null;
      },
      lookingFor: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please describe what you are looking for in a roommate';
        }
        if (value.trim().length < 50) {
          return 'Please provide more details about what you are looking for (at least 50 characters)';
        }
        return null;
      },
      interests: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least one interest or hobby';
        }
        return null;
      }
    }
  }
};

/**
 * Validate a specific section
 * @param {string} sectionId - Section identifier
 * @param {Object} formData - Current form data
 * @returns {Object} Validation result with errors and warnings
 */
export const validateSection = (sectionId, formData) => {
  const rules = SECTION_VALIDATION_RULES[sectionId];
  if (!rules) {
    console.warn(`No validation rules found for section: ${sectionId}`);
    return { isValid: true, errors: {}, warnings: {}, requiredMissing: [], warningsMissing: [] };
  }

  const errors = {};
  const warnings = {};
  const requiredMissing = [];
  const warningsMissing = [];

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
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
        requiredMissing.push(field);
      } else if (Array.isArray(value) && value.length === 0) {
        errors[field] = `Please select at least one option for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        requiredMissing.push(field);
      }
    }
  });

  // Check warning fields (optional but recommended)
  if (rules.warnings) {
    rules.warnings.forEach(field => {
      const value = formData[field];
      if (value === null || value === undefined || value === '') {
        warnings[field] = `Consider adding ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} for better matches`;
        warningsMissing.push(field);
      } else if (Array.isArray(value) && value.length === 0) {
        warnings[field] = `Consider selecting options for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
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
      message: `Please complete all required fields in this section before continuing. ${criticalErrors} required field${criticalErrors > 1 ? 's' : ''} missing.`,
      errors: validation.errors,
      criticalCount: criticalErrors
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
 * Generate user-friendly field names
 * @param {string} fieldName - Technical field name
 * @returns {string} User-friendly name
 */
export const getFieldDisplayName = (fieldName) => {
  const displayNames = {
    dateOfBirth: 'Date of Birth',
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactPhone: 'Emergency Contact Phone',
    primary_city: 'Primary City',
    primary_state: 'Primary State',
    budget_min: 'Minimum Budget',
    budget_max: 'Maximum Budget',
    maxCommute: 'Maximum Commute Time',
    moveInDate: 'Move-in Date',
    housingType: 'Housing Types',
    recoveryStage: 'Recovery Stage',
    spiritualAffiliation: 'Spiritual/Religious Approach',
    primaryIssues: 'Primary Issues',
    recovery_methods: 'Recovery Methods',
    programType: 'Program Types',
    preferred_roommate_gender: 'Roommate Gender Preference',
    smokingStatus: 'Your Smoking Status',
    workSchedule: 'Work Schedule',
    socialLevel: 'Social Interaction Level',
    cleanlinessLevel: 'Cleanliness Level',
    noiseLevel: 'Noise Tolerance',
    aboutMe: 'About Me',
    lookingFor: 'What I\'m Looking For',
    interests: 'Interests & Hobbies'
  };

  return displayNames[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
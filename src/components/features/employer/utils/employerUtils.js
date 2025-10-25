// src/components/features/employer/utils/employerUtils.js

/**
 * Industry options for employer filtering and forms
 */
export const industryOptions = [
  'Construction', 'Healthcare', 'Retail', 'Food Service', 'Manufacturing',
  'Transportation', 'Technology', 'Education', 'Nonprofit', 'Professional Services',
  'Hospitality', 'Agriculture', 'Finance', 'Real Estate', 'Arts & Entertainment',
  'Government', 'Utilities', 'Energy', 'Media & Communications', 'Other'
];

/**
 * Business type options with values and labels
 */
export const businessTypeOptions = [
  { value: 'small_business', label: 'Small Business (1-50 employees)' },
  { value: 'medium_business', label: 'Medium Business (51-500 employees)' },
  { value: 'large_corporation', label: 'Large Corporation (500+ employees)' },
  { value: 'nonprofit', label: 'Nonprofit Organization' },
  { value: 'startup', label: 'Startup' },
  { value: 'social_enterprise', label: 'Social Enterprise' },
  { value: 'government', label: 'Government Agency' },
  { value: 'cooperative', label: 'Cooperative/Employee-Owned' }
];

/**
 * ✅ NEW: Company size options (for filtering by employee count)
 */
export const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1,000 employees' },
  { value: '1000+', label: '1,000+ employees' }
];

/**
 * Recovery-friendly feature options
 */
export const recoveryFeatureOptions = [
  'second_chance_hiring',
  'flexible_schedules',
  'emp_assistance_program',
  'peer_support_program',
  'substance_abuse_accommodations',
  'mental_health_support',
  'continuing_education',
  'lived_experience_valued',
  'stigma_free_workplace',
  'treatment_time_off',
  'transportation_assistance',
  'skills_training',
  'mentorship_programs',
  'career_advancement',
  'background_check_flexibility'
];

/**
 * Job type options
 */
export const jobTypeOptions = [
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'internship',
  'apprenticeship',
  'seasonal',
  'remote'
];

/**
 * Remote work options with values and labels
 */
export const remoteWorkOptions = [
  { value: 'on_site', label: 'On-Site Only' },
  { value: 'fully_remote', label: 'Fully Remote' },
  { value: 'hybrid', label: 'Hybrid (Remote + On-Site)' },
  { value: 'flexible', label: 'Flexible Options Available' }
];

/**
 * ✅ NEW: Benefits offered options (for filtering)
 */
export const benefitsOptions = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  'Mental Health Coverage',
  'Substance Abuse Treatment Coverage',
  'Life Insurance',
  'Disability Insurance',
  'Retirement Plan (401k/403b)',
  'Paid Time Off',
  'Sick Leave',
  'Parental Leave',
  'Flexible Spending Account',
  'Employee Assistance Program',
  'Tuition Reimbursement',
  'Professional Development',
  'Transportation Subsidy',
  'Childcare Assistance',
  'Wellness Programs',
  'Gym Membership',
  'Flexible Schedule'
];

/**
 * ✅ NEW: Drug testing policy options
 */
export const drugTestingPolicyOptions = [
  { value: 'none', label: 'No Drug Testing' },
  { value: 'pre_employment_only', label: 'Pre-Employment Only' },
  { value: 'random', label: 'Random Testing' },
  { value: 'reasonable_suspicion', label: 'Reasonable Suspicion' },
  { value: 'post_incident', label: 'Post-Incident Only' }
];

/**
 * ✅ NEW: Background check policy options
 */
export const backgroundCheckPolicyOptions = [
  { value: 'none', label: 'No Background Check' },
  { value: 'case_by_case', label: 'Case-by-Case Review' },
  { value: 'flexible', label: 'Flexible/Second Chance' },
  { value: 'standard', label: 'Standard Background Check' }
];

/**
 * US state options
 */
export const stateOptions = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

/**
 * Format a feature string for display (replace underscores with spaces, capitalize words)
 * @param {string} feature - The feature string to format
 * @returns {string} - Formatted feature string
 */
export const formatFeature = (feature) => {
  if (!feature || typeof feature !== 'string') return '';
  return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format business type for display
 * @param {string} type - The business type value
 * @returns {string} - Formatted business type label
 */
export const formatBusinessType = (type) => {
  if (!type) return 'Not specified';
  const option = businessTypeOptions.find(opt => opt.value === type);
  return option ? option.label : formatFeature(type);
};

/**
 * Format remote work options for display
 * @param {string} option - The remote work option value
 * @returns {string} - Formatted remote work label
 */
export const formatRemoteWork = (option) => {
  if (!option) return 'Not specified';
  const remoteOption = remoteWorkOptions.find(opt => opt.value === option);
  return remoteOption ? remoteOption.label : formatFeature(option);
};

/**
 * Get a user-friendly label for an industry
 * @param {string} industry - The industry value
 * @returns {string} - Formatted industry label
 */
export const formatIndustry = (industry) => {
  return industry || 'Not specified';
};

/**
 * Format a list of features for display with a maximum count
 * @param {string[]} features - Array of feature strings
 * @param {number} maxDisplay - Maximum number of features to display
 * @returns {object} - Object with displayFeatures array and remainingCount
 */
export const formatFeatureList = (features, maxDisplay = 3) => {
  if (!Array.isArray(features) || features.length === 0) {
    return { displayFeatures: [], remainingCount: 0 };
  }

  const displayFeatures = features.slice(0, maxDisplay).map(formatFeature);
  const remainingCount = Math.max(0, features.length - maxDisplay);

  return { displayFeatures, remainingCount };
};

/**
 * Format company size for display
 * @param {string} size - The company size value
 * @returns {string} - Formatted company size
 */
export const formatCompanySize = (size) => {
  if (!size) return 'Not specified';
  
  // Handle common size formats
  const sizeMap = {
    '1-10': '1-10 employees',
    '11-50': '11-50 employees', 
    '51-200': '51-200 employees',
    '201-1000': '201-1000 employees',
    '1000+': '1000+ employees'
  };
  
  return sizeMap[size] || size;
};

/**
 * ✅ NEW: Format drug testing policy for display
 * @param {string} policy - The drug testing policy value
 * @returns {string} - Formatted policy label
 */
export const formatDrugTestingPolicy = (policy) => {
  if (!policy) return 'Not specified';
  const option = drugTestingPolicyOptions.find(opt => opt.value === policy);
  return option ? option.label : formatFeature(policy);
};

/**
 * ✅ NEW: Format background check policy for display
 * @param {string} policy - The background check policy value
 * @returns {string} - Formatted policy label
 */
export const formatBackgroundCheckPolicy = (policy) => {
  if (!policy) return 'Not specified';
  const option = backgroundCheckPolicyOptions.find(opt => opt.value === policy);
  return option ? option.label : formatFeature(policy);
};

/**
 * Check if an employer has specific recovery features
 * @param {object} employer - The employer object
 * @param {string[]} requiredFeatures - Array of required features to check
 * @returns {boolean} - True if employer has all required features
 */
export const hasRequiredFeatures = (employer, requiredFeatures) => {
  if (!Array.isArray(requiredFeatures) || requiredFeatures.length === 0) return true;
  if (!employer?.recovery_friendly_features) return false;
  
  return requiredFeatures.every(feature => 
    employer.recovery_friendly_features.includes(feature)
  );
};

/**
 * ✅ UPDATED: Get filter summary text for active filters (removed hasOpenings, added new filters)
 * @param {object} filters - The current filter state
 * @returns {string} - Summary text of active filters
 */
export const getFilterSummary = (filters) => {
  const activeParts = [];
  
  if (filters.industry) activeParts.push(`Industry: ${filters.industry}`);
  if (filters.location) activeParts.push(`Location: ${filters.location}`);
  if (filters.state) activeParts.push(`State: ${filters.state}`);
  if (filters.businessType) activeParts.push(`Type: ${formatBusinessType(filters.businessType)}`);
  if (filters.companySize) activeParts.push(`Size: ${formatCompanySize(filters.companySize)}`);
  if (filters.remoteWork) activeParts.push(`Remote: ${formatRemoteWork(filters.remoteWork)}`);
  if (filters.drugTestingPolicy) activeParts.push(`Drug Testing: ${formatDrugTestingPolicy(filters.drugTestingPolicy)}`);
  if (filters.backgroundCheckPolicy) activeParts.push(`Background Check: ${formatBackgroundCheckPolicy(filters.backgroundCheckPolicy)}`);
  if (filters.recoveryFeatures?.length > 0) {
    activeParts.push(`Recovery Features: ${filters.recoveryFeatures.length} selected`);
  }
  if (filters.jobTypes?.length > 0) {
    activeParts.push(`Job Types: ${filters.jobTypes.length} selected`);
  }
  if (filters.benefits?.length > 0) {
    activeParts.push(`Benefits: ${filters.benefits.length} selected`);
  }
  if (filters.isActivelyHiring) activeParts.push('Actively hiring only');
  
  return activeParts.join(' • ');
};

/**
 * ✅ UPDATED: Check if any filters are active (removed hasOpenings, added new filters)
 * @param {object} filters - The current filter state
 * @returns {boolean} - True if any filters are active beyond defaults
 */
export const hasActiveFilters = (filters) => {
  return !!(
    filters.industry ||
    filters.location ||
    filters.state ||
    filters.businessType ||
    filters.companySize ||
    filters.remoteWork ||
    filters.drugTestingPolicy ||
    filters.backgroundCheckPolicy ||
    filters.recoveryFeatures?.length > 0 ||
    filters.jobTypes?.length > 0 ||
    filters.benefits?.length > 0 ||
    !filters.isActivelyHiring // Only count as active if NOT the default value
  );
};

/**
 * ✅ NEW: Get count of active filters (for badge display)
 * @param {object} filters - The current filter state
 * @returns {number} - Count of active filters
 */
export const getActiveFilterCount = (filters) => {
  if (!filters) return 0;
  
  let count = 0;
  
  if (filters.industry) count++;
  if (filters.location) count++;
  if (filters.state && !filters.location) count++; // Don't double-count if location includes state
  if (filters.businessType) count++;
  if (filters.companySize) count++;
  if (filters.remoteWork) count++;
  if (filters.drugTestingPolicy) count++;
  if (filters.backgroundCheckPolicy) count++;
  if (filters.recoveryFeatures?.length > 0) count++;
  if (filters.jobTypes?.length > 0) count++;
  if (filters.benefits?.length > 0) count++;
  if (!filters.isActivelyHiring) count++; // Only count if different from default
  
  return count;
};

/**
 * Validate filter values and return any errors
 * @param {object} filters - The current filter state
 * @returns {object} - Object with field names as keys and error messages as values
 */
export const validateFilters = (filters) => {
  const errors = {};
  
  // Validate state format if provided
  if (filters.state && !/^[A-Z]{2}$/.test(filters.state)) {
    errors.state = 'State must be 2-letter abbreviation (e.g., CA, NY)';
  }
  
  // Validate location format
  if (filters.location && filters.location.length > 100) {
    errors.location = 'Location must be less than 100 characters';
  }
  
  return errors;
};

/**
 * Generate employer card display data
 * @param {object} employer - The employer object
 * @returns {object} - Formatted employer data for display
 */
export const getEmployerCardData = (employer) => {
  const { displayFeatures: recoveryFeatures, remainingCount: recoveryRemainingCount } = 
    formatFeatureList(employer.recovery_friendly_features);
  
  // ✅ FIXED: Use job_types_available instead of current_openings for new schema
  const { displayFeatures: currentOpenings, remainingCount: openingsRemainingCount } = 
    formatFeatureList(employer.job_types_available);

  return {
    id: employer.id,
    userId: employer.user_id,
    companyName: employer.company_name || 'Company Name Not Provided',
    industry: formatIndustry(employer.industry),
    location: `${employer.city || 'Unknown'}, ${employer.state || 'Unknown'}`,
    businessType: formatBusinessType(employer.business_type),
    companySize: formatCompanySize(employer.company_size),
    remoteWork: formatRemoteWork(employer.remote_work_options),
    isActivelyHiring: employer.is_actively_hiring,
    description: employer.description || '',
    
    // Formatted feature lists
    recoveryFeatures,
    recoveryRemainingCount,
    currentOpenings, // Now represents job types available
    openingsRemainingCount,
    
    // Raw data for modal/details
    raw: employer
  };
};

/**
 * Sort employers by priority criteria
 * @param {object[]} employers - Array of employer objects
 * @param {Set} favorites - Set of favorite employer IDs
 * @returns {object[]} - Sorted array of employers
 */
export const sortEmployers = (employers, favorites = new Set()) => {
  return [...employers].sort((a, b) => {
    // First priority: actively hiring
    if (a.is_actively_hiring && !b.is_actively_hiring) return -1;
    if (!a.is_actively_hiring && b.is_actively_hiring) return 1;
    
    // ✅ FIXED: Use job_types_available instead of current_openings for new schema
    // Second priority: has job types available
    const aHasJobTypes = a.job_types_available?.length > 0;
    const bHasJobTypes = b.job_types_available?.length > 0;
    if (aHasJobTypes && !bHasJobTypes) return -1;
    if (!aHasJobTypes && bHasJobTypes) return 1;
    
    // Third priority: favorites first
    const aIsFavorite = favorites.has(a.user_id);
    const bIsFavorite = favorites.has(b.user_id);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    
    // Fourth priority: most recently created/updated
    const aDate = new Date(a.updated_at || a.created_at || 0);
    const bDate = new Date(b.updated_at || b.created_at || 0);
    return bDate - aDate;
  });
};

/**
 * Generate contact information display text
 * @param {object} employer - The employer object
 * @returns {string} - Formatted contact information
 */
export const getContactInfo = (employer) => {
  const contactMethods = [];
  
  if (employer.contact_email) {
    contactMethods.push(`Email: ${employer.contact_email}`);
  }
  
  if (employer.phone) {
    contactMethods.push(`Phone: ${employer.phone}`);
  }
  
  if (employer.website) {
    contactMethods.push(`Website: ${employer.website}`);
  }
  
  if (employer.contact_person) {
    contactMethods.push(`Contact: ${employer.contact_person}`);
  }
  
  return contactMethods.length > 0 
    ? contactMethods.join(' • ')
    : 'Contact information will be shared after connection';
};
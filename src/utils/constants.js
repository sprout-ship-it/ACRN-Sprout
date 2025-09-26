// src/utils/constants.js - PHASE 4 CORRECTED VERSION

/**
 * Application constants for Recovery Housing Connect
 * Centralized location for all app-wide constants, enums, and configuration values
 * ✅ UPDATED: Aligned with Phase 1-3 schema and architecture
 */

// ✅ FIXED: User roles to match actual schema
export const USER_ROLES = {
  APPLICANT: 'applicant',
  LANDLORD: 'landlord',
  EMPLOYER: 'employer',           // ✅ ADDED: Missing role from schema
  PEER_SUPPORT: 'peer-support'    // ✅ FIXED: Correct role name from schema
};

// Recovery stages (aligned with schema)
export const RECOVERY_STAGES = {
  EARLY: 'early',
  STABLE: 'stable', 
  MAINTAINED: 'maintained',
  LONG_TERM: 'long-term'
};

export const RECOVERY_STAGE_OPTIONS = [
  { value: RECOVERY_STAGES.EARLY, label: 'Early recovery (0-90 days)' },
  { value: RECOVERY_STAGES.STABLE, label: 'Stable recovery (3 months - 1 year)' },
  { value: RECOVERY_STAGES.MAINTAINED, label: 'Maintained recovery (1+ years)' },
  { value: RECOVERY_STAGES.LONG_TERM, label: 'Long-term recovery (5+ years)' }
];

// Recovery methods (aligned with schema field names)
export const RECOVERY_METHODS = [
  'AA (Alcoholics Anonymous)',
  'NA (Narcotics Anonymous)', 
  'SMART Recovery',
  'Celebrate Recovery',
  'LifeRing',
  'Secular recovery',
  'Faith-based program',
  'Outpatient therapy',
  'Intensive outpatient (IOP)',
  'Medication-assisted treatment',
  'Peer support groups',
  'Meditation/Spirituality',
  'Other'
];

// ✅ UPDATED: Program types (separate from recovery methods for clarity)
export const PROGRAM_TYPES = [
  'Inpatient treatment',
  'Outpatient treatment', 
  'Intensive outpatient (IOP)',
  'Partial hospitalization (PHP)',
  'Medication-assisted treatment',
  'Detox program',
  'Sober living',
  'Halfway house',
  'Therapeutic community',
  'Faith-based program',
  'Secular program',
  'None/Self-directed'
];

// Housing types (aligned with schema)
export const HOUSING_TYPES = [
  'apartment',
  'house',
  'condo', 
  'townhouse',
  'studio',
  'duplex',
  'room'
];

// ✅ UPDATED: Property types for recovery housing (from schema)
export const RECOVERY_PROPERTY_TYPES = [
  'sober_living_level_1',
  'sober_living_level_2', 
  'sober_living_level_3',
  'halfway_house',
  'recovery_residence',
  'transitional_housing'
];

// Work schedules
export const WORK_SCHEDULES = [
  { value: 'traditional', label: 'Traditional (9-5)' },
  { value: 'early', label: 'Early morning shift' },
  { value: 'late', label: 'Late shift/Evening' },
  { value: 'rotating', label: 'Rotating shifts' },
  { value: 'weekend', label: 'Weekend work' },
  { value: 'remote', label: 'Work from home' },
  { value: 'student', label: 'Student schedule' },
  { value: 'unemployed', label: 'Currently unemployed' },
  { value: 'retired', label: 'Retired' }
];

// ✅ UPDATED: Lifestyle preferences with numeric values (1-5 scale from schema)
export const SOCIAL_LEVELS = [
  { value: 1, label: 'Very introverted' },
  { value: 2, label: 'Introverted' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Social' },
  { value: 5, label: 'Very social' }
];

export const CLEANLINESS_LEVELS = [
  { value: 1, label: 'Very messy' },
  { value: 2, label: 'Somewhat messy' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Clean' },
  { value: 5, label: 'Very clean' }
];

export const NOISE_TOLERANCE = [
  { value: 1, label: 'Very quiet' },
  { value: 2, label: 'Quiet' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Can handle noise' },
  { value: 5, label: 'Very tolerant of noise' }
];

// ✅ UPDATED: Spiritual affiliations (from schema)
export const SPIRITUAL_AFFILIATIONS = [
  'Christian',
  'Catholic', 
  'Jewish',
  'Islamic',
  'Buddhist',
  'Hindu',
  'Agnostic',
  'Atheist',
  'Spiritual (non-religious)',
  'Native American',
  'Other',
  'Prefer not to say'
];

// Preference options
export const SMOKING_PREFERENCES = [
  { value: 'non-smoking', label: 'Non-smoking' },
  { value: 'smoking-outside', label: 'Smoking outside only' },
  { value: 'smoking', label: 'Smoking allowed' }
];

export const PET_PREFERENCES = [
  { value: 'no-pets', label: 'No pets' },
  { value: 'cats-only', label: 'Cats only' },
  { value: 'dogs-only', label: 'Dogs only' },
  { value: 'any-pets', label: 'Any pets welcome' },
  { value: 'small-pets', label: 'Small pets only' }
];

export const GUEST_POLICIES = [
  { value: 'no-guests', label: 'No overnight guests' },
  { value: 'occasional', label: 'Occasional guests OK' },
  { value: 'frequent', label: 'Frequent guests OK' },
  { value: 'unlimited', label: 'No restrictions' }
];

// Gender options (aligned with schema)
export const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender Identity' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'genderfluid', label: 'Genderfluid' },
  { value: 'agender', label: 'Agender' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

export const BIOLOGICAL_SEX_OPTIONS = [
  { value: '', label: 'Select Biological Sex' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

export const ROOMMATE_GENDER_PREFERENCES = [
  { value: 'any', label: 'Any gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'same-gender', label: 'Same gender as me' }
];

// Interests and hobbies
export const INTEREST_OPTIONS = [
  'Fitness/Exercise',
  'Cooking',
  'Reading',
  'Movies/TV',
  'Music',
  'Art/Crafts',
  'Outdoor activities',
  'Sports',
  'Gaming',
  'Volunteering',
  'Meditation/Spirituality',
  'Learning/Education',
  'Technology',
  'Travel',
  'Pets/Animals',
  'Photography',
  'Writing',
  'Dancing',
  'Gardening',
  'Board games'
];

// Deal breakers (aligned with schema fields)
export const DEAL_BREAKER_OPTIONS = [
  'Smoking indoors',
  'Drinking alcohol at home',
  'Drug use',
  'Loud parties',
  'Poor hygiene',
  'Pets',
  'Overnight guests frequently',
  'Messy common areas',
  'Aggressive behavior',
  'Dishonesty',
  'Not respecting boundaries',
  'Different sleep schedules',
  'Opposite lifestyle choices'
];

// Important qualities
export const IMPORTANT_QUALITY_OPTIONS = [
  'Honesty',
  'Respect for boundaries',
  'Cleanliness',
  'Reliability',
  'Empathy',
  'Good communication',
  'Shared recovery values',
  'Similar schedule',
  'Sense of humor',
  'Mutual support',
  'Independence',
  'Shared interests',
  'Financial responsibility',
  'Conflict resolution skills'
];

// ✅ UPDATED: Primary issues (from schema)
export const PRIMARY_ISSUES = [
  'Alcohol addiction',
  'Drug addiction',
  'Mental health',
  'Trauma/PTSD',
  'Anxiety/Depression',
  'Eating disorders',
  'Gambling addiction',
  'Sex addiction',
  'Co-occurring disorders',
  'Other behavioral addictions'
];

// US States
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

// ✅ UPDATED: Property statuses (from schema)
export const PROPERTY_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'full', label: 'Full' },
  { value: 'temporarily_closed', label: 'Temporarily Closed' },
  { value: 'under_renovation', label: 'Under Renovation' }
];

export const LEASE_LENGTHS = [
  { value: 'month_to_month', label: 'Month-to-month' },
  { value: '6_months', label: '6 months' },
  { value: '1_year', label: '1 year' },
  { value: 'flexible', label: 'Flexible' }
];

// ✅ UPDATED: Property amenities (from schema)
export const PROPERTY_AMENITIES = [
  'washer_dryer',
  'parking',
  'yard',
  'pool',
  'gym',
  'kitchen',
  'furnished',
  'utilities_included',
  'internet_included',
  'wheelchair_accessible',
  'public_transit',
  'shopping_nearby',
  'parks_nearby'
];

// ✅ UPDATED: Match request statuses (aligned with schema)
export const MATCH_REQUEST_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected', 
  WITHDRAWN: 'withdrawn'
};

// ✅ UPDATED: Match request types (from schema)
export const MATCH_REQUEST_TYPES = {
  HOUSING: 'housing',
  EMPLOYMENT: 'employment', 
  PEER_SUPPORT: 'peer-support',
  ROOMMATE: 'roommate'
};

// Compatibility levels for matching algorithm
export const COMPATIBILITY_LEVELS = {
  EXCELLENT: 'excellent',  // 90-100%
  GOOD: 'good',           // 80-89%
  MODERATE: 'moderate',   // 70-79%
  LOW: 'low',            // 60-69%
  POOR: 'poor'           // Below 60%
};

// ✅ UPDATED: Progress tracking (aligned with UserProgressContext)
export const PROGRESS_STEPS = {
  BASIC_PROFILE: 'basicProfile',
  MATCHING_PROFILE: 'matchingProfile', 
  ACTIVE_MATCHING: 'activeMatching',
  HAS_MATCHES: 'hasMatches'
};

// Profile setup flow steps  
export const PROFILE_SETUP_STEPS = {
  BASIC_INFO: 'basicInfo',
  ROLE_SPECIFIC: 'roleSpecific',
  START_MATCHING: 'startMatching'
};

// Age ranges for filtering
export const AGE_RANGES = [
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46-55', label: '46-55' },
  { value: '56-65', label: '56-65' },
  { value: '65+', label: '65+' }
];

// Price ranges for filtering
export const PRICE_RANGES = [
  { value: '0-500', label: 'Under $500' },
  { value: '500-800', label: '$500 - $800' },
  { value: '800-1200', label: '$800 - $1,200' },
  { value: '1200-1600', label: '$1,200 - $1,600' },
  { value: '1600-2000', label: '$1,600 - $2,000' },
  { value: '2000-2500', label: '$2,000 - $2,500' },
  { value: '2500+', label: '$2,500+' }
];

// ✅ UPDATED: Navigation items (paths updated for current architecture)
export const NAV_ITEMS = {
  DASHBOARD: { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: '🏠', 
    path: '/dashboard',
    roles: ['applicant', 'landlord', 'employer', 'peer-support']
  },
  MATCHING_PROFILE: { 
    id: 'matching-profile', 
    label: 'Housing Profile', 
    icon: '📝', 
    path: '/matching/profile',
    roles: ['applicant']
  },
  FIND_MATCHES: { 
    id: 'find-matches', 
    label: 'Find Roommates', 
    icon: '🔍', 
    path: '/matching/discover',
    roles: ['applicant']
  },
  MATCH_REQUESTS: { 
    id: 'match-requests', 
    label: 'Connections', 
    icon: '🤝', 
    path: '/connections',
    roles: ['applicant', 'landlord', 'employer', 'peer-support']
  },
  PROPERTIES: { 
    id: 'properties', 
    label: 'Properties', 
    icon: '🏢', 
    path: '/properties',
    roles: ['landlord', 'applicant']
  },
  PROPERTY_SEARCH: {
    id: 'property-search',
    label: 'Find Housing',
    icon: '🏠',
    path: '/properties/search', 
    roles: ['applicant']
  },
  EMPLOYER_FINDER: {
    id: 'employer-finder',
    label: 'Find Jobs',
    icon: '💼',
    path: '/employer/finder',
    roles: ['applicant']
  },
  PEER_SUPPORT: { 
    id: 'peer-support', 
    label: 'Peer Support', 
    icon: '🤝', 
    path: '/peer-support',
    roles: ['applicant', 'peer-support']
  },
  SETTINGS: {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    path: '/settings',
    roles: ['applicant', 'landlord', 'employer', 'peer-support']
  }
};

// Form validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_TEXT_LENGTH: 500,
  MAX_ADDITIONAL_INFO_LENGTH: 1000,
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
  MIN_BUDGET: 100,
  MAX_BUDGET: 5000,
  PHONE_REGEX: /^[\d\s\-\(\)\+]{10,}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ZIP_REGEX: /^\d{5}(-\d{4})?$/
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_ZIP: 'Please enter a valid ZIP code',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`,
  PASSWORDS_NO_MATCH: 'Passwords do not match',
  AGE_TOO_YOUNG: `You must be ${VALIDATION.MIN_AGE} or older`,
  TEXT_TOO_LONG: `Text must be ${VALIDATION.MAX_TEXT_LENGTH} characters or less`,
  PAST_DATE: 'Date cannot be in the past',
  INVALID_PRICE_RANGE: 'Maximum price must be greater than minimum price',
  INVALID_BUDGET_RANGE: 'Maximum budget must be greater than minimum budget',
  PROFILE_INCOMPLETE: 'Please complete your profile before proceeding',
  AUTHENTICATION_REQUIRED: 'Please sign in to continue'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_SAVED: 'Profile saved successfully!',
  MATCH_REQUEST_SENT: 'Connection request sent successfully!',
  MATCH_REQUEST_APPROVED: 'Connection request approved!',
  MATCH_REQUEST_REJECTED: 'Connection request declined.',
  PROPERTY_CREATED: 'Property created successfully!',
  PROPERTY_UPDATED: 'Property updated successfully!',
  PROPERTY_DELETED: 'Property deleted successfully!',
  ACCOUNT_CREATED: 'Account created successfully!',
  SIGNED_OUT: 'You have been signed out.',
  PROFILE_COMPLETED: 'Profile completed successfully!'
};

// Loading messages
export const LOADING_MESSAGES = {
  SIGNING_IN: 'Signing in...',
  CREATING_ACCOUNT: 'Creating account...',
  SAVING_PROFILE: 'Saving profile...',
  LOADING_MATCHES: 'Finding compatible matches...',
  LOADING_PROPERTIES: 'Loading properties...',
  UPDATING_REQUEST: 'Updating request...',
  LOADING_DASHBOARD: 'Loading your dashboard...',
  CALCULATING_COMPATIBILITY: 'Calculating compatibility...',
  PREPARING_MATCHES: 'Preparing your matches...'
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MATCHES_PER_PAGE: 12,
  PROPERTIES_PER_PAGE: 12,
  REQUESTS_PER_PAGE: 10,
  EMPLOYERS_PER_PAGE: 12,
  PEER_SUPPORT_PER_PAGE: 12
};

// Feature flags
export const FEATURES = {
  MESSAGING_ENABLED: false,
  VIDEO_CALLS_ENABLED: false, 
  BACKGROUND_CHECKS_ENABLED: false,
  PAYMENT_INTEGRATION_ENABLED: false,
  MOBILE_APP_ENABLED: false,
  EMPLOYER_MATCHING_ENABLED: true,
  PEER_SUPPORT_MATCHING_ENABLED: true,
  PROPERTY_SEARCH_ENABLED: true
};

// Theme colors (CSS custom properties)
export const THEME_COLORS = {
  PRIMARY_PURPLE: '#A020F0',
  SECONDARY_PURPLE: '#8E1CC7',
  SECONDARY_TEAL: '#20B2AA',
  CORAL: '#FF6F61',
  GOLD: '#FFD700',
  BG_LIGHT_CREAM: '#F5E9DA',
  BG_LIGHT_PURPLE: '#F0E6F7',
  BORDER_BEIGE: '#E6D5C3',
  SUCCESS_GREEN: '#10B981',
  WARNING_YELLOW: '#F59E0B',
  ERROR_RED: '#EF4444'
};

// ✅ NEW: Matching algorithm constants
export const MATCHING = {
  WEIGHTS: {
    CORE: 0.70,     // 70% - Deal breakers, recovery stage, location, budget
    HIGH: 0.25,     // 25% - Lifestyle compatibility, spiritual alignment  
    MEDIUM: 0.04,   // 4% - Interests, schedule compatibility
    LOW: 0.01       // 1% - Nice-to-have preferences
  },
  THRESHOLDS: {
    EXCELLENT: 90,
    GOOD: 80,
    MODERATE: 70,
    LOW: 60,
    MINIMUM: 50
  },
  DEAL_BREAKERS: {
    SUBSTANCE_FREE_REQUIRED: 'substance_free_home_required',
    RECOVERY_STAGE_MISMATCH: 'recovery_stage_mismatch',
    BUDGET_INCOMPATIBLE: 'budget_incompatible',
    LOCATION_TOO_FAR: 'location_too_far',
    GENDER_PREFERENCE_MISMATCH: 'gender_preference_mismatch'
  }
};

// Default export for backward compatibility
export default {
  USER_ROLES,
  RECOVERY_STAGES,
  RECOVERY_STAGE_OPTIONS,
  RECOVERY_METHODS,
  PROGRAM_TYPES,
  HOUSING_TYPES,
  RECOVERY_PROPERTY_TYPES,
  WORK_SCHEDULES,
  SOCIAL_LEVELS,
  CLEANLINESS_LEVELS,
  NOISE_TOLERANCE,
  SPIRITUAL_AFFILIATIONS,
  SMOKING_PREFERENCES,
  PET_PREFERENCES,
  GUEST_POLICIES,
  GENDER_OPTIONS,
  BIOLOGICAL_SEX_OPTIONS,
  ROOMMATE_GENDER_PREFERENCES,
  INTEREST_OPTIONS,
  DEAL_BREAKER_OPTIONS,
  IMPORTANT_QUALITY_OPTIONS,
  PRIMARY_ISSUES,
  US_STATES,
  PROPERTY_STATUSES,
  LEASE_LENGTHS,
  PROPERTY_AMENITIES,
  MATCH_REQUEST_STATUSES,
  MATCH_REQUEST_TYPES,
  COMPATIBILITY_LEVELS,
  PROGRESS_STEPS,
  PROFILE_SETUP_STEPS,
  AGE_RANGES,
  PRICE_RANGES,
  NAV_ITEMS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  PAGINATION,
  FEATURES,
  THEME_COLORS,
  MATCHING
};
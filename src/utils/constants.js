// src/utils/constants.js

/**
 * Application constants for Recovery Housing Connect
 * Centralized location for all app-wide constants, enums, and configuration values
 */

// User roles
export const USER_ROLES = {
  APPLICANT: 'applicant',
  LANDLORD: 'landlord',
  PEER_SUPPORT: 'peer'
};

// Recovery stages
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

// Recovery program types
export const PROGRAM_TYPES = [
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

// Housing types
export const HOUSING_TYPES = [
  'Apartment',
  'House',
  'Condo',
  'Townhouse',
  'Room in house',
  'Studio',
  'Sober living facility'
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

// Lifestyle preferences
export const SOCIAL_LEVELS = [
  { value: 'very-introverted', label: 'Very introverted' },
  { value: 'introverted', label: 'Introverted' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'social', label: 'Social' },
  { value: 'very-social', label: 'Very social' }
];

export const CLEANLINESS_LEVELS = [
  { value: 'messy', label: 'Messy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'clean', label: 'Clean' },
  { value: 'very-clean', label: 'Very clean' }
];

export const NOISE_LEVELS = [
  { value: 'very-quiet', label: 'Very quiet' },
  { value: 'quiet', label: 'Quiet' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'loud', label: 'Loud' }
];

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

// Gender options
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

export const SEX_OPTIONS = [
  { value: '', label: 'Select Biological Sex' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

export const GENDER_PREFERENCES = [
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

// Deal breakers
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

// Substance use options
export const SUBSTANCE_USE_OPTIONS = [
  'Alcohol',
  'Marijuana',
  'Prescription medications',
  'Tobacco/Nicotine',
  'None'
];

// US States
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Property-related constants
export const PROPERTY_TYPES = [
  'Apartment',
  'House', 
  'Condo',
  'Townhouse',
  'Studio',
  'Room'
];

export const PROPERTY_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'pending', label: 'Pending' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' }
];

export const LEASE_LENGTHS = [
  { value: 'month-to-month', label: 'Month-to-month' },
  { value: '6-months', label: '6 months' },
  { value: '12-months', label: '12 months' },
  { value: '24-months', label: '24 months' }
];

export const PROPERTY_AMENITIES = [
  'Laundry in unit',
  'Laundry on site',
  'Parking',
  'Garage',
  'Gym/Fitness center',
  'Pool',
  'Pet-friendly',
  'Dishwasher',
  'Air conditioning',
  'Heating',
  'Balcony/Patio',
  'Yard',
  'Storage',
  'Utilities included',
  'Internet included',
  'Furnished',
  'Wheelchair accessible'
];

// Match request statuses
export const MATCH_REQUEST_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  MATCHED: 'matched',
  UNMATCHED: 'unmatched'
};

// Compatibility levels
export const COMPATIBILITY_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  MODERATE: 'moderate',
  LOW: 'low',
  POOR: 'poor'
};

// Progress tracking constants
export const PROGRESS_STEPS = {
  BASIC_PROFILE: 'basicProfile',
  MATCHING_PROFILE: 'matchingProfile',
  ACTIVE_MATCHING: 'activeMatching',
  HAS_MATCHES: 'hasMatches'
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

// Navigation items
export const NAV_ITEMS = {
  DASHBOARD: { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/app' },
  PROFILE: { id: 'profile', label: 'Edit Profile', icon: '👤', path: '/app/profile' },
  MATCH_REQUESTS: { id: 'match-requests', label: 'Match Requests', icon: '🤝', path: '/app/match-requests' },
  MATCHING_PROFILE: { id: 'matching-profile', label: 'Matching Profile', icon: '📝', path: '/app/matching-profile' },
  FIND_MATCHES: { id: 'find-matches', label: 'Find Matches', icon: '🔍', path: '/app/find-matches' },
  PROPERTIES: { id: 'properties', label: 'Properties', icon: '🏢', path: '/app/properties' },
  MATCH_DASHBOARD: { id: 'match-dashboard', label: 'Match Dashboard', icon: '🎯', path: '/app/match-dashboard' },
  PEER_PROFILE: { id: 'peer-profile', label: 'Peer Profile', icon: '🤝', path: '/app/profile/peer-support'},
};

// Form validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_TEXT_LENGTH: 500,
  MAX_ADDITIONAL_INFO_LENGTH: 300,
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
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
  INVALID_PRICE_RANGE: 'Maximum price must be greater than minimum price'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_SAVED: 'Profile saved successfully!',
  MATCH_REQUEST_SENT: 'Match request sent successfully!',
  MATCH_REQUEST_APPROVED: 'Match request approved!',
  MATCH_REQUEST_REJECTED: 'Match request rejected.',
  PROPERTY_CREATED: 'Property created successfully!',
  PROPERTY_UPDATED: 'Property updated successfully!',
  PROPERTY_DELETED: 'Property deleted successfully!',
  ACCOUNT_CREATED: 'Account created successfully!',
  SIGNED_OUT: 'You have been signed out.'
};

// Loading messages
export const LOADING_MESSAGES = {
  SIGNING_IN: 'Signing in...',
  CREATING_ACCOUNT: 'Creating account...',
  SAVING_PROFILE: 'Saving profile...',
  LOADING_MATCHES: 'Finding your perfect matches...',
  LOADING_PROPERTIES: 'Loading properties...',
  UPDATING_REQUEST: 'Updating request...',
  LOADING_DASHBOARD: 'Loading your dashboard...'
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'rhc_theme',
  LANGUAGE: 'rhc_language',
  FORM_DRAFT: 'rhc_form_draft',
  USER_PREFERENCES: 'rhc_user_preferences'
};

// API endpoints (if using external APIs)
export const API_ENDPOINTS = {
  GEOCODING: 'https://api.mapbox.com/geocoding/v5',
  PLACES: 'https://api.mapbox.com/places/v1'
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MATCHES_PER_PAGE: 6,
  PROPERTIES_PER_PAGE: 12,
  REQUESTS_PER_PAGE: 10
};

// Feature flags
export const FEATURES = {
  MESSAGING_ENABLED: false,
  VIDEO_CALLS_ENABLED: false,
  BACKGROUND_CHECKS_ENABLED: false,
  PAYMENT_INTEGRATION_ENABLED: false,
  MOBILE_APP_ENABLED: false
};

// Theme colors (for dynamic theming)
export const THEME_COLORS = {
  PRIMARY_PURPLE: '#A020F0',
  SECONDARY_PURPLE: '#8E1CC7',
  SECONDARY_TEAL: '#20B2AA',
  CORAL: '#FF6F61',
  GOLD: '#FFD700',
  BG_LIGHT_CREAM: '#F5E9DA',
  BG_LIGHT_PURPLE: '#F0E6F7',
  BORDER_BEIGE: '#E6D5C3'
};

export default {
  USER_ROLES,
  RECOVERY_STAGES,
  RECOVERY_STAGE_OPTIONS,
  PROGRAM_TYPES,
  HOUSING_TYPES,
  WORK_SCHEDULES,
  SOCIAL_LEVELS,
  CLEANLINESS_LEVELS,
  NOISE_LEVELS,
  SMOKING_PREFERENCES,
  PET_PREFERENCES,
  GUEST_POLICIES,
  GENDER_OPTIONS,
  SEX_OPTIONS,
  GENDER_PREFERENCES,
  INTEREST_OPTIONS,
  DEAL_BREAKER_OPTIONS,
  IMPORTANT_QUALITY_OPTIONS,
  SUBSTANCE_USE_OPTIONS,
  US_STATES,
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  LEASE_LENGTHS,
  PROPERTY_AMENITIES,
  MATCH_REQUEST_STATUSES,
  COMPATIBILITY_LEVELS,
  PROGRESS_STEPS,
  AGE_RANGES,
  PRICE_RANGES,
  NAV_ITEMS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  PAGINATION,
  FEATURES,
  THEME_COLORS
};
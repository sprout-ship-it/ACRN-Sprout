// src/components/features/matching/constants/matchingFormConstants.js - FIXED WITH STANDARDIZED FIELD NAMES

// Gender options
export const genderOptions = [
  { value: '', label: 'Select Gender Identity' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'genderfluid', label: 'Genderfluid' },
  { value: 'agender', label: 'Agender' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

// Sex options
export const sexOptions = [
  { value: '', label: 'Select Biological Sex' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

// US States for dropdown
export const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Housing type options
export const housingTypeOptions = [
  'Apartment', 'House', 'Condo', 'Townhouse', 'Room in house', 'Studio', 
  'Duplex', 'Sober living facility', 'Transitional housing'
];

// Gender preference options
export const genderPreferenceOptions = [
  { value: '', label: 'No preference' },
  { value: 'no_preference', label: 'No preference' },
  { value: 'same_gender', label: 'Same gender only' },
  { value: 'different_gender', label: 'Different gender only' },
  { value: 'male', label: 'Male roommates only' },
  { value: 'female', label: 'Female roommates only' },
  { value: 'non-binary', label: 'Non-binary roommates only' }
];

// Smoking status options
export const smokingStatusOptions = [
  { value: '', label: 'Select smoking status' },
  { value: 'non_smoker', label: 'Non-smoker' },
  { value: 'outdoor_only', label: 'Smoke outdoors only' },
  { value: 'occasional', label: 'Occasional smoker' },
  { value: 'regular', label: 'Regular smoker' },
  { value: 'former_smoker', label: 'Former smoker' }
];

// Recovery stage options
export const recoveryStageOptions = [
  { value: '', label: 'Select recovery stage' },
  { value: 'early', label: 'Early Recovery (0-6 months)' },
  { value: 'stabilizing', label: 'Stabilizing (6-18 months)' },
  { value: 'stable', label: 'Stable Recovery (1.5-3 years)' },
  { value: 'long-term', label: 'Long-term Recovery (3+ years)' },
  { value: 'maintenance', label: 'Maintenance Phase' }
];

// Guest policy options
export const guestsPolicyOptions = [
  { value: '', label: 'Select guest policy' },
  { value: 'no_guests', label: 'No overnight guests' },
  { value: 'rare_guests', label: 'Rare overnight guests' },
  { value: 'moderate_guests', label: 'Moderate overnight guests' },
  { value: 'frequent_guests', label: 'Frequent overnight guests' },
  { value: 'very_flexible', label: 'Very flexible with guests' }
];

// Bedtime preference options
export const bedtimePreferenceOptions = [
  { value: '', label: 'Select bedtime preference' },
  { value: 'early', label: 'Early (before 10 PM)' },
  { value: 'moderate', label: 'Moderate (10 PM - 12 AM)' },
  { value: 'late', label: 'Late (after 12 AM)' },
  { value: 'varies', label: 'Varies/Flexible' }
];

// Work schedule options
export const workScheduleOptions = [
  { value: '', label: 'Select work schedule' },
  { value: 'traditional_9_5', label: 'Traditional 9-5' },
  { value: 'flexible', label: 'Flexible hours' },
  { value: 'early_morning', label: 'Early morning shift' },
  { value: 'night_shift', label: 'Night shift' },
  { value: 'student', label: 'Student schedule' },
  { value: 'irregular', label: 'Irregular/Varies' },
  { value: 'unemployed', label: 'Currently unemployed' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'remote', label: 'Work from home' }
];

// Primary issues options
export const primaryIssuesOptions = [
  'alcohol-addiction', 'cocaine-addiction', 'heroin-addiction', 'fentanyl-addiction', 
  'methamphetamine-addiction', 'prescription-opioids', 'prescription-stimulants', 
  'cannabis-addiction', 'gambling-addiction', 'eating-disorders', 'anxiety', 
  'depression', 'ptsd', 'bipolar-disorder', 'other-addiction'
];

// Recovery methods options
export const recoveryMethodsOptions = [
  'twelve-step', 'therapy', 'medication', 'support-groups', 'spiritual-practices',
  'diet-exercise', 'clinical-therapy', 'church-religion', 'recovery-community',
  'meditation', 'yoga', 'art-therapy', 'music-therapy', 'journaling'
];

// Program type options
export const programTypeOptions = [
  'AA (Alcoholics Anonymous)', 'NA (Narcotics Anonymous)', 'SMART Recovery', 
  'Celebrate Recovery', 'LifeRing', 'Secular recovery', 'Faith-based program',
  'Outpatient therapy', 'Intensive outpatient (IOP)', 'Medication-assisted treatment',
  'Peer support groups', 'Meditation/Spirituality', 'Cognitive Behavioral Therapy',
  'Dialectical Behavior Therapy', 'EMDR', 'Other'
];

// Interest options
export const interestOptions = [
  'Fitness/Exercise', 'Cooking', 'Reading', 'Movies/TV', 'Music', 'Art/Crafts',
  'Outdoor activities', 'Sports', 'Gaming', 'Volunteering', 'Meditation/Spirituality',
  'Learning/Education', 'Technology', 'Travel', 'Pets/Animals', 'Photography',
  'Writing', 'Dancing', 'Theater', 'Community service', 'Gardening'
];

// Housing subsidy options
export const housingSubsidyOptions = [
  { value: 'section_8', label: 'Section 8' },
  { value: 'nonprofit_community_org', label: 'Nonprofit Community Org' },
  { value: 'va_benefits', label: 'VA Benefits' },
  { value: 'disability_assistance', label: 'Disability Assistance' },
  { value: 'lihtc', label: 'LIHTC (Low Income Housing Tax Credit)' },
  { value: 'state_housing_assistance', label: 'State Housing Assistance' },
  { value: 'local_housing_assistance', label: 'Local Housing Assistance' },
  { value: 'other', label: 'Other' }
];

// Spiritual affiliation options
export const spiritualAffiliationOptions = [
  { value: '', label: 'Select spiritual affiliation' },
  { value: 'christian-protestant', label: 'Christian (Protestant)' },
  { value: 'christian-catholic', label: 'Christian (Catholic)' },
  { value: 'christian-orthodox', label: 'Christian (Orthodox)' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'spiritual-not-religious', label: 'Spiritual but not religious' },
  { value: 'agnostic', label: 'Agnostic' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

// Validation constants
export const VALIDATION_RULES = {
  PHONE_REGEX: /^[\d\s\-\(\)\+]{10,}$/,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
  MIN_AGE: 18,
  MIN_BUDGET: 200,
  MAX_BUDGET: 5000,
  MAX_ABOUT_ME_LENGTH: 1000,
  MAX_LOOKING_FOR_LENGTH: 1000,
  MAX_ADDITIONAL_INFO_LENGTH: 500
};

// FIXED: Required fields for validation - using standardized field names
export const REQUIRED_FIELDS = [
  // Personal Demographics - standardized names
  'date_of_birth', 
  'primary_phone',
  
  // Location & Housing - standardized names
  'primary_city', 
  'primary_state', 
  
  // Core matching fields - standardized names
  'max_commute_minutes', 
  'move_in_date', 
  'recovery_stage', 
  'work_schedule', 
  'about_me', 
  'looking_for', 
  'budget_max', 
  'preferred_roommate_gender',
  'smoking_status', 
  'spiritual_affiliation'
];

// Required array fields for validation - using standardized field names
export const REQUIRED_ARRAY_FIELDS = [
  'housing_types_accepted', 
  'program_types', 
  'interests', 
  'primary_issues', 
  'recovery_methods'
];

// FIXED: Default form values - using standardized field names from useMatchingProfileForm.js
export const defaultFormData = {
  // Personal Demographics (using exact database field names)
  date_of_birth: '',
  primary_phone: '',
  gender_identity: '',
  biological_sex: '',
  current_address: '',
  current_city: '',
  current_state: '',
  current_zip_code: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  
  // Location & Housing (standardized names)
  primary_city: '',
  primary_state: '',
  target_zip_codes: '',
  search_radius_miles: 30,
  location_flexibility: '',
  max_commute_minutes: 30,
  transportation_method: '',
  
  // Budget & Financial (standardized names)
  budget_min: 500,
  budget_max: 2000,
  housing_assistance: [],
  has_section8: false,
  
  // Housing Specifications
  housing_types_accepted: [],
  preferred_bedrooms: '',
  move_in_date: '',
  move_in_flexibility: '',
  lease_duration: '',
  furnished_preference: false,
  utilities_included_preference: false,
  accessibility_needed: false,
  parking_required: false,
  public_transit_access: false,
  
  // Recovery & Wellness (standardized names)
  recovery_stage: '',
  time_in_recovery: '',
  sobriety_date: '',
  primary_substance: '',
  recovery_methods: [],
  program_types: [],
  treatment_history: '',
  support_meetings: '',
  sponsor_mentor: '',
  primary_issues: [],
  spiritual_affiliation: '',
  want_recovery_support: false,
  comfortable_discussing_recovery: false,
  attend_meetings_together: false,
  substance_free_home_required: true,
  recovery_goal_timeframe: '',
  recovery_context: '',
  
  // Roommate Preferences (standardized names)
  preferred_roommate_gender: '',
  gender_inclusive: false,
  age_range_min: 18,
  age_range_max: 65,
  age_flexibility: '',
  prefer_recovery_experience: false,
  supportive_of_recovery: true,
  substance_free_required: true,
  respect_privacy: true,
  social_interaction_level: '',
  similar_schedules: false,
  shared_chores: false,
  financially_stable: true,
  respectful_guests: true,
  lgbtq_friendly: false,
  culturally_sensitive: true,
  
  // Lifestyle Preferences (standardized names)
  social_level: 3,
  cleanliness_level: 3,
  noise_tolerance: 3,
  work_schedule: '',
  work_from_home_frequency: '',
  bedtime_preference: '',
  early_riser: false,
  night_owl: false,
  guests_policy: '',
  social_activities_at_home: '',
  overnight_guests_ok: false,
  cooking_enthusiast: false,
  cooking_frequency: '',
  exercise_at_home: false,
  plays_instruments: false,
  tv_streaming_regular: false,
  
  // Household Management (standardized names)
  chore_sharing_style: '',
  shared_groceries: false,
  communication_style: '',
  conflict_resolution_style: '',
  preferred_support_structure: '',
  
  // Pets & Smoking (standardized names)
  pets_owned: false,
  pets_comfortable: false,
  pet_preference: '',
  smoking_status: '',
  smoking_preference: '',
  
  // Compatibility & Goals
  interests: [],
  additional_interests: '',
  shared_activities_interest: false,
  important_qualities: [],
  deal_breakers: [],
  short_term_goals: '',
  long_term_vision: '',
  
  // Profile Content
  about_me: '',
  looking_for: '',
  additional_info: '',
  special_needs: '',
  
  // Profile Status
  is_active: true,
  profile_completed: false,
  profile_visibility: 'verified-members',
  
  // Deal Breakers (specific)
  deal_breaker_substance_use: false,
  deal_breaker_loudness: false,
  deal_breaker_uncleanliness: false,
  deal_breaker_financial_issues: true,
  deal_breaker_pets: false,
  deal_breaker_smoking: false,
  
  // Compatibility preferences
  overnight_guests_preference: false,
  shared_transportation: false,
  recovery_accountability: false,
  shared_recovery_activities: false,
  mentorship_interest: false,
  recovery_community: false
};
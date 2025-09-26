// src/components/features/matching/constants/matchingFormConstants.js - SCHEMA ALIGNED

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

// Housing type options (updated for schema)
export const housingTypeOptions = [
  'apartment', 'house', 'condo', 'townhouse', 'duplex', 'studio', 
  'sober_living_level_1', 'sober_living_level_2', 'sober_living_level_3',
  'halfway_house', 'recovery_residence', 'transitional_housing'
];

// Gender preference options (schema aligned)
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

// Recovery stage options (schema aligned)
export const recoveryStageOptions = [
  { value: '', label: 'Select recovery stage' },
  { value: 'early', label: 'Early Recovery (0-6 months)' },
  { value: 'stabilizing', label: 'Stabilizing (6-18 months)' },
  { value: 'stable', label: 'Stable Recovery (1.5-3 years)' },
  { value: 'long-term', label: 'Long-term Recovery (3+ years)' },
  { value: 'maintenance', label: 'Maintenance Phase' }
];

// Location flexibility options (schema field)
export const locationFlexibilityOptions = [
  { value: '', label: 'Select flexibility' },
  { value: 'very_flexible', label: 'Very flexible' },
  { value: 'somewhat_flexible', label: 'Somewhat flexible' },
  { value: 'preferred_only', label: 'Preferred location only' },
  { value: 'must_stay_local', label: 'Must stay in local area' }
];

// Age flexibility options (schema field)
export const ageFlexibilityOptions = [
  { value: '', label: 'Select age flexibility' },
  { value: 'very_flexible', label: 'Very flexible' },
  { value: 'somewhat_flexible', label: 'Somewhat flexible' },
  { value: 'preferred_range', label: 'Prefer stated range' },
  { value: 'strict_range', label: 'Strict age range only' }
];

// Move-in flexibility options (schema field)
export const moveInFlexibilityOptions = [
  { value: '', label: 'Select move-in flexibility' },
  { value: 'exact_date', label: 'Exact date needed' },
  { value: 'week_window', label: 'Within a week' },
  { value: 'month_window', label: 'Within a month' },
  { value: 'flexible', label: 'Very flexible' }
];

// Relocation timeline options (NEW - schema field)
export const relocationTimelineOptions = [
  { value: '', label: 'Select relocation timeline' },
  { value: 'immediate', label: 'Immediate (within 1 week)' },
  { value: 'short_term', label: 'Short-term (1-4 weeks)' },
  { value: 'medium_term', label: 'Medium-term (1-3 months)' },
  { value: 'long_term', label: 'Long-term (3+ months)' },
  { value: 'flexible', label: 'Flexible timeline' }
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

// Work from home frequency options (schema field)
export const workFromHomeFrequencyOptions = [
  { value: '', label: 'Select WFH frequency' },
  { value: 'never', label: 'Never work from home' },
  { value: 'rarely', label: 'Rarely (1-2 days/month)' },
  { value: 'sometimes', label: 'Sometimes (1-2 days/week)' },
  { value: 'frequently', label: 'Frequently (3-4 days/week)' },
  { value: 'always', label: 'Always work from home' }
];

// Communication style options (schema field)
export const communicationStyleOptions = [
  { value: '', label: 'Select communication style' },
  { value: 'direct', label: 'Direct and straightforward' },
  { value: 'diplomatic', label: 'Diplomatic and gentle' },
  { value: 'casual', label: 'Casual and informal' },
  { value: 'formal', label: 'Formal and structured' },
  { value: 'varies', label: 'Varies by situation' }
];

// Conflict resolution style options (schema field)
export const conflictResolutionStyleOptions = [
  { value: '', label: 'Select conflict resolution style' },
  { value: 'direct_discussion', label: 'Direct discussion' },
  { value: 'mediated_discussion', label: 'Mediated discussion' },
  { value: 'written_communication', label: 'Written communication' },
  { value: 'avoid_when_possible', label: 'Avoid when possible' },
  { value: 'seek_compromise', label: 'Always seek compromise' }
];

// Chore sharing preference options (FIXED: schema field name)
export const choreSharingPreferenceOptions = [
  { value: '', label: 'Select chore sharing preference' },
  { value: 'equal_split', label: 'Equal split of all chores' },
  { value: 'assigned_chores', label: 'Assigned specific chores' },
  { value: 'flexible_sharing', label: 'Flexible sharing' },
  { value: 'minimal_sharing', label: 'Minimal sharing' },
  { value: 'hire_cleaning', label: 'Prefer to hire cleaning service' }
];

// Preferred support structure options (schema field)
export const preferredSupportStructureOptions = [
  { value: '', label: 'Select preferred support structure' },
  { value: 'independent', label: 'Independent living' },
  { value: 'peer_support', label: 'Peer support network' },
  { value: 'structured_program', label: 'Structured program' },
  { value: 'family_support', label: 'Family support' },
  { value: 'professional_support', label: 'Professional support' }
];

// Transportation method options (schema field)
export const transportationMethodOptions = [
  { value: '', label: 'Select transportation method' },
  { value: 'personal_car', label: 'Personal car' },
  { value: 'public_transit', label: 'Public transit' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'walking', label: 'Walking' },
  { value: 'rideshare', label: 'Rideshare/Taxi' },
  { value: 'combination', label: 'Combination of methods' }
];

// Primary issues options (schema array field)
export const primaryIssuesOptions = [
  'alcohol-addiction', 'cocaine-addiction', 'heroin-addiction', 'fentanyl-addiction', 
  'methamphetamine-addiction', 'prescription-opioids', 'prescription-stimulants', 
  'cannabis-addiction', 'gambling-addiction', 'eating-disorders', 'anxiety', 
  'depression', 'ptsd', 'bipolar-disorder', 'other-addiction'
];

// Recovery methods options (schema array field)
export const recoveryMethodsOptions = [
  'twelve-step', 'therapy', 'medication', 'support-groups', 'spiritual-practices',
  'diet-exercise', 'clinical-therapy', 'church-religion', 'recovery-community',
  'meditation', 'yoga', 'art-therapy', 'music-therapy', 'journaling'
];

// Program type options (schema array field)
export const programTypeOptions = [
  'AA (Alcoholics Anonymous)', 'NA (Narcotics Anonymous)', 'SMART Recovery', 
  'Celebrate Recovery', 'LifeRing', 'Secular recovery', 'Faith-based program',
  'Outpatient therapy', 'Intensive outpatient (IOP)', 'Medication-assisted treatment',
  'Peer support groups', 'Meditation/Spirituality', 'Cognitive Behavioral Therapy',
  'Dialectical Behavior Therapy', 'EMDR', 'Other'
];

// Interest options (schema array field)
export const interestOptions = [
  'Fitness/Exercise', 'Cooking', 'Reading', 'Movies/TV', 'Music', 'Art/Crafts',
  'Outdoor activities', 'Sports', 'Gaming', 'Volunteering', 'Meditation/Spirituality',
  'Learning/Education', 'Technology', 'Travel', 'Pets/Animals', 'Photography',
  'Writing', 'Dancing', 'Theater', 'Community service', 'Gardening'
];

// Housing subsidy options (schema array field)
export const housingSubsidyOptions = [
  { value: 'section_8', label: 'Section 8' },
  { value: 'nonprofit_community_org', label: 'Nonprofit Community Org' },
  { value: 'va_benefits', label: 'VA Benefits' },
  { value: 'disability_assistance', label: 'Disability Assistance' },
  { value: 'lihtc', label: 'LIHTC (Low Income Housing Tax Credit)' },
  { value: 'state_housing_assistance', label: 'State Housing Assistance' },
  { value: 'local_housing_assistance', label: 'Local Housing Assistance' },
  { value: 'rapid_rehousing', label: 'Rapid Rehousing' },
  { value: 'vash', label: 'VASH (HUD-Veterans Affairs)' },
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

// Lease duration options (schema field)
export const leaseDurationOptions = [
  { value: '', label: 'Select lease duration' },
  { value: 'month_to_month', label: 'Month-to-month' },
  { value: '3_months', label: '3 months' },
  { value: '6_months', label: '6 months' },
  { value: '1_year', label: '1 year' },
  { value: '2_years', label: '2 years' },
  { value: 'flexible', label: 'Flexible' }
];

// Profile visibility options (schema field)
export const profileVisibilityOptions = [
  { value: 'verified-members', label: 'Verified members only' },
  { value: 'all-members', label: 'All platform members' },
  { value: 'private', label: 'Private (matching only)' }
];

// Validation constants (updated for schema constraints)
export const VALIDATION_RULES = {
  PHONE_REGEX: /^[\d\s\-\(\)\+]{10,}$/,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
  MIN_AGE: 18, // Schema constraint: age_range_min >= 18
  MAX_AGE: 100, // Schema constraint: age_range_max <= 100
  MIN_BUDGET: 1, // Schema constraint: valid_rent CHECK (monthly_rent > 0)
  MAX_BUDGET: 50000, // Reasonable maximum
  MIN_SOCIAL_LEVEL: 1, // Schema constraint: social_level BETWEEN 1 AND 5
  MAX_SOCIAL_LEVEL: 5,
  MIN_CLEANLINESS_LEVEL: 1, // Schema constraint: cleanliness_level BETWEEN 1 AND 5
  MAX_CLEANLINESS_LEVEL: 5,
  MIN_NOISE_TOLERANCE: 1, // Schema constraint: noise_tolerance BETWEEN 1 AND 5
  MAX_NOISE_TOLERANCE: 5,
  MAX_ABOUT_ME_LENGTH: 1000,
  MAX_LOOKING_FOR_LENGTH: 1000,
  MAX_ADDITIONAL_INFO_LENGTH: 500
};

// SCHEMA ALIGNED: Required fields based on schema NOT NULL constraints
export const REQUIRED_FIELDS = [
  // Schema NOT NULL constraints - core required fields
  'primary_phone',
  'date_of_birth', 
  'preferred_roommate_gender',
  'primary_city', 
  'primary_state',
  'budget_min',
  'budget_max',
  'max_commute_minutes',
  'recovery_stage',
  'spiritual_affiliation',
  'social_level',
  'cleanliness_level', 
  'noise_tolerance',
  'work_schedule',
  'move_in_date',
  'about_me',
  'looking_for'
];

// SCHEMA ALIGNED: Required array fields based on schema NOT NULL constraints
export const REQUIRED_ARRAY_FIELDS = [
  'recovery_methods',  // Schema: NOT NULL
  'program_types',     // Schema: NOT NULL  
  'primary_issues'     // Schema: NOT NULL
];

// SCHEMA ALIGNED: Optional array fields (can be empty but should be arrays)
export const OPTIONAL_ARRAY_FIELDS = [
  'housing_types_accepted',
  'housing_assistance',
  'interests',
  'important_qualities',
  'deal_breakers'
];

// SCHEMA PERFECTLY ALIGNED: Default form values using exact database field names
export const defaultFormData = {
  // Personal Demographics (exact schema field names)
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
  
  // Location & Housing (EXCLUDING primary_location - generated column)
  primary_city: '',
  primary_state: '',
  target_zip_codes: '',
  search_radius_miles: 30,
  location_flexibility: '',
  max_commute_minutes: 30,
  transportation_method: '',
  
  // Budget & Financial
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
  relocation_timeline: '', // ✅ ADDED: Schema field
  furnished_preference: false,
  utilities_included_preference: false,
  accessibility_needed: false,
  parking_required: false,
  public_transit_access: false,
  
  // Recovery & Wellness
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
  substance_free_home_required: true, // ✅ CONFIRMED: Correct schema field name
  recovery_goal_timeframe: '',
  recovery_context: '',
  
  // Roommate Preferences
  preferred_roommate_gender: '',
  gender_inclusive: false,
  age_range_min: 18,
  age_range_max: 65,
  age_flexibility: '',
  prefer_recovery_experience: false,
  supportive_of_recovery: true,
  respect_privacy: true,
  social_interaction_level: '',
  similar_schedules: false,
  shared_chores: false,
  financially_stable: true,
  respectful_guests: true,
  lgbtq_friendly: false,
  culturally_sensitive: true,
  
  // Lifestyle Preferences
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
  
  // Household Management (✅ FIXED: Schema field name)
  chore_sharing_preference: '', // ✅ CORRECTED: Was chore_sharing_style
  shared_groceries: false,
  communication_style: '',
  conflict_resolution_style: '',
  preferred_support_structure: '',
  
  // Pets & Smoking
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
  recovery_community: false,
  
  // ✅ NEW: Algorithm metadata (read-only, auto-calculated by database)
  completion_percentage: 0,
  profile_quality_score: 0,
  last_updated_section: null,
  compatibility_scores: {},
  search_preferences: {},
  matching_weights: {}
};

// SCHEMA ALIGNED: Form sections for navigation
export const FORM_SECTIONS = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Basic personal details and contact information',
    fields: ['date_of_birth', 'primary_phone', 'gender_identity', 'biological_sex']
  },
  {
    id: 'location-preferences', 
    title: 'Location & Housing',
    description: 'Where you want to live and housing preferences',
    fields: ['primary_city', 'primary_state', 'budget_min', 'budget_max', 'move_in_date']
  },
  {
    id: 'recovery-info',
    title: 'Recovery Information', 
    description: 'Your recovery journey and support needs',
    fields: ['recovery_stage', 'recovery_methods', 'program_types', 'primary_issues']
  },
  {
    id: 'roommate-preferences',
    title: 'Roommate Preferences',
    description: 'What you\'re looking for in a roommate',
    fields: ['preferred_roommate_gender', 'age_range_min', 'age_range_max']
  },
  {
    id: 'lifestyle-preferences',
    title: 'Lifestyle Preferences',
    description: 'Daily routines and living preferences', 
    fields: ['social_level', 'cleanliness_level', 'noise_tolerance', 'work_schedule']
  },
  {
    id: 'compatibility',
    title: 'About You',
    description: 'Tell potential roommates about yourself',
    fields: ['about_me', 'looking_for', 'interests']
  }
];

// Helper function to validate field against schema constraints
export const validateFieldConstraints = (fieldName, value) => {
  const errors = [];
  
  switch (fieldName) {
    case 'age_range_min':
      if (value < VALIDATION_RULES.MIN_AGE) {
        errors.push(`Minimum age must be ${VALIDATION_RULES.MIN_AGE} or higher`);
      }
      break;
      
    case 'age_range_max':
      if (value > VALIDATION_RULES.MAX_AGE) {
        errors.push(`Maximum age cannot exceed ${VALIDATION_RULES.MAX_AGE}`);
      }
      break;
      
    case 'budget_min':
    case 'budget_max':
      if (value < VALIDATION_RULES.MIN_BUDGET) {
        errors.push('Budget must be positive');
      }
      break;
      
    case 'social_level':
    case 'cleanliness_level': 
    case 'noise_tolerance':
      if (value < VALIDATION_RULES.MIN_SOCIAL_LEVEL || value > VALIDATION_RULES.MAX_SOCIAL_LEVEL) {
        errors.push(`${fieldName.replace('_', ' ')} must be between 1 and 5`);
      }
      break;
      
    case 'move_in_date':
      if (value && new Date(value) < new Date()) {
        errors.push('Move-in date cannot be in the past');
      }
      break;
  }
  
  return errors;
};
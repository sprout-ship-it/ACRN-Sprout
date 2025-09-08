// src/components/forms/constants/matchingFormConstants.js

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

// Gender preference options - FIXED: Added this export
export const genderPreferenceOptions = [
  { value: '', label: 'No preference' },
  { value: 'no_preference', label: 'No preference' },
  { value: 'same_gender', label: 'Same gender only' },
  { value: 'different_gender', label: 'Different gender only' }
];

// Smoking status options - FIXED: Added this export
export const smokingStatusOptions = [
  { value: '', label: 'Select smoking status' },
  { value: 'non_smoker', label: 'Non-smoker' },
  { value: 'outdoor_only', label: 'Smoke outdoors only' },
  { value: 'occasional', label: 'Occasional smoker' },
  { value: 'regular', label: 'Regular smoker' }
];

// Recovery stage options
export const recoveryStageOptions = [
  { value: '', label: 'Select recovery stage' },
  { value: 'early', label: 'Early Recovery (0-6 months)' },
  { value: 'stabilizing', label: 'Stabilizing (6-18 months)' },
  { value: 'stable', label: 'Stable Recovery (1.5-3 years)' },
  { value: 'long-term', label: 'Long-term Recovery (3+ years)' }
];

// Guest policy options
export const guestsPolicyOptions = [
  { value: '', label: 'Select guest policy' },
  { value: 'no_guests', label: 'No overnight guests' },
  { value: 'rare_guests', label: 'Rare overnight guests' },
  { value: 'moderate_guests', label: 'Moderate overnight guests' },
  { value: 'frequent_guests', label: 'Frequent overnight guests' }
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
  { value: 'unemployed', label: 'Currently unemployed' }
];

// Primary issues options
export const primaryIssuesOptions = [
  'alcohol', 'cocaine', 'heroin', 'fentanyl', 'methamphetamine', 
  'prescription-opioids', 'prescription-stimulants', 'cannabis', 'other'
];

// Recovery methods options
export const recoveryMethodsOptions = [
  '12-step', 'diet-exercise', 'clinical-therapy', 'church-religion', 'recovery-community'
];

// Program type options
export const programTypeOptions = [
  'AA (Alcoholics Anonymous)', 'NA (Narcotics Anonymous)', 'SMART Recovery', 
  'Celebrate Recovery', 'LifeRing', 'Secular recovery', 'Faith-based program',
  'Outpatient therapy', 'Intensive outpatient (IOP)', 'Medication-assisted treatment',
  'Peer support groups', 'Meditation/Spirituality', 'Other'
];

// Interest options
export const interestOptions = [
  'Fitness/Exercise', 'Cooking', 'Reading', 'Movies/TV', 'Music', 'Art/Crafts',
  'Outdoor activities', 'Sports', 'Gaming', 'Volunteering', 'Meditation/Spirituality',
  'Learning/Education', 'Technology', 'Travel', 'Pets/Animals'
];

// Housing subsidy options
export const housingSubsidyOptions = [
  { value: 'section_8', label: 'Section 8' },
  { value: 'nonprofit_community_org', label: 'Nonprofit Community Org' },
  { value: 'va_benefits', label: 'VA Benefits' },
  { value: 'disability_assistance', label: 'Disability Assistance' },
  { value: 'lihtc', label: 'LIHTC' },
  { value: 'other', label: 'Other' }
];

// Spiritual affiliation options
export const spiritualAffiliationOptions = [
  { value: '', label: 'Select spiritual affiliation' },
  { value: 'christian-protestant', label: 'Christian (Protestant)' },
  { value: 'christian-catholic', label: 'Christian (Catholic)' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'spiritual-not-religious', label: 'Spiritual but not religious' },
  { value: 'agnostic', label: 'Agnostic' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'other', label: 'Other' }
];

// Validation constants
export const VALIDATION_RULES = {
  PHONE_REGEX: /^[\d\s\-\(\)\+]{10,}$/,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
  MIN_AGE: 18,
  MIN_BUDGET: 200,
  MAX_BUDGET: 5000,
  MAX_ABOUT_ME_LENGTH: 500,
  MAX_LOOKING_FOR_LENGTH: 500,
  MAX_ADDITIONAL_INFO_LENGTH: 300
};

// Required fields for validation
export const REQUIRED_FIELDS = [
  // Demographic fields
  'dateOfBirth', 'phone',
  // Core matching fields
  'preferredLocation', 'maxCommute', 'moveInDate', 'recoveryStage', 
  'workSchedule', 'aboutMe', 'lookingFor', 'budgetMax', 'preferredRoommateGender',
  'smokingStatus', 'spiritualAffiliation'
];

// Required array fields for validation
export const REQUIRED_ARRAY_FIELDS = [
  'housingType', 'programType', 'interests', 'primaryIssues', 'recoveryMethods'
];

// Default form values - FIXED: Added this export
export const defaultFormData = {
  // Personal Demographics
  dateOfBirth: '',
  phone: '',
  gender: '',
  sex: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  
  // Location & Housing Preferences
  preferredLocation: '',
  targetZipCodes: '',
  searchRadius: '25',
  currentLocation: '',
  relocationTimeline: '',
  maxCommute: '',
  housingType: [],
  priceRangeMin: 500,
  priceRangeMax: 2000,
  budgetMax: 1000,
  moveInDate: '',
  leaseDuration: '',
  
  // Personal Demographics & Preferences
  ageRangeMin: 18,
  ageRangeMax: 65,
  genderPreference: '',
  preferredRoommateGender: '',
  smokingPreference: '',
  smokingStatus: '',
  petPreference: '',
  
  // Recovery Information
  recoveryStage: '',
  primarySubstance: '',
  timeInRecovery: '',
  treatmentHistory: '',
  programType: [],
  sobrietyDate: '',
  sponsorMentor: '',
  supportMeetings: '',
  spiritualAffiliation: '',
  primaryIssues: [],
  recoveryMethods: [],
  
  // Lifestyle Preferences
  workSchedule: '',
  socialLevel: 3,
  cleanlinessLevel: 3,
  noiseLevel: 3,
  guestPolicy: '',
  guestsPolicy: '',
  bedtimePreference: '',
  transportation: '',
  choreSharingPreference: '',
  preferredSupportStructure: '',
  conflictResolutionStyle: '',
  
  // Living Situation Preferences
  petsOwned: false,
  petsComfortable: true,
  overnightGuestsOk: true,
  sharedGroceries: false,
  cookingFrequency: '',
  
  // Housing Assistance
  housingSubsidy: [],
  hasSection8: false,
  acceptsSubsidy: true,
  
  // Compatibility Factors
  interests: [],
  dealBreakers: [],
  importantQualities: [],
  
  // Open-ended responses
  aboutMe: '',
  lookingFor: '',
  additionalInfo: '',
  specialNeeds: '',
  
  // Status
  isActive: true
};
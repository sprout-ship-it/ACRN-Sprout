// src/components/features/peer-support/constants/peerSupportConstants.js
// Updated constants aligned with schema and search functionality

// State options for address forms
export const stateOptions = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Spiritual affiliation options - aligned with applicant profiles
export const spiritualAffiliationOptions = [
  { value: 'christian-protestant', label: 'Christian (Protestant)' },
  { value: 'christian-catholic', label: 'Christian (Catholic)' },
  { value: 'christian-orthodox', label: 'Christian (Orthodox)' },
  { value: 'christian-other', label: 'Christian (Other)' },
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

// Specialty areas - aligned with PeerSupportFinder search options
export const specialtyOptions = [
  'AA/NA Programs',
  'SMART Recovery',
  'Trauma-Informed Care',
  'Family Therapy',
  'Mindfulness',
  'Career Counseling',
  'Women in Recovery',
  'Men in Recovery',
  'LGBTQ+ Support',
  'Secular Programs',
  'Housing Support',
  'Mental Health',
  'Addiction Counseling',
  'Group Facilitation',
  'Crisis Intervention',
  'Relapse Prevention',
  'Life Skills Training',
  'Medication Assisted Treatment',
  'Dual Diagnosis Support',
  'Grief & Loss Counseling'
];

// Recovery methods supported - aligned with applicant options
export const recoveryMethodOptions = [
  '12-Step Programs',
  'SMART Recovery',
  'Refuge Recovery',
  'LifeRing Secular Recovery',
  'Celebrate Recovery',
  'Harm Reduction',
  'Medication-Assisted Treatment',
  'Holistic/Alternative Approaches',
  'Trauma-Informed Care',
  'Motivational Interviewing',
  'Cognitive Behavioral Therapy',
  'Dialectical Behavior Therapy',
  'Mindfulness-Based Recovery'
];

// Recovery stage options - aligned with applicant profiles
export const recoveryStageOptions = [
  { value: 'early_recovery', label: 'Early Recovery (0-1 years)' },
  { value: 'sustained_recovery', label: 'Sustained Recovery (1-5 years)' },
  { value: 'long_term_recovery', label: 'Long-term Recovery (5+ years)' },
  { value: 'stable_recovery', label: 'Stable Recovery (10+ years)' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

// Primary issues - aligned with applicant matching profiles
export const primaryIssuesOptions = [
  'Substance Use',
  'Alcohol Use',
  'Mental Health',
  'Dual Diagnosis',
  'Trauma Recovery',
  'Family Issues',
  'Housing Instability',
  'Employment Challenges',
  'Legal Issues',
  'Relationship Issues',
  'Financial Struggles',
  'Health Issues'
];

// Service areas - simplified and practical
export const serviceAreaOptions = [
  'Local Community',
  'City-wide',
  'County-wide',
  'Multi-County',
  'Statewide',
  'Remote/Telehealth Only',
  'Rural Areas',
  'Urban Areas',
  'Suburban Areas'
];

// Consolidated form sections (reduced from 5 to 3)
export const FORM_SECTIONS = [
  {
    id: 'profile',
    title: 'Profile & Contact',
    icon: '👤',
    description: 'Basic information, contact details, and professional background',
    firstField: 'primary_phone'
  },
  {
    id: 'expertise',
    title: 'Expertise & Services',
    icon: '🤝',
    description: 'Your specialties, recovery background, and service approach',
    firstField: 'specialties'
  },
  {
    id: 'settings',
    title: 'About & Settings',
    icon: '⚙️',
    description: 'Your story, service settings, and availability',
    firstField: 'bio'
  }
];

// Schema-aligned validation rules
export const VALIDATION_RULES = {
  primary_phone: {
    required: true,
    pattern: /^[\d\s\-\(\)\+]{10,}$/,
    message: 'Please enter a valid phone number'
  },
  bio: {
    required: true,
    minLength: 50,
    maxLength: 1000,
    message: 'Bio must be between 50 and 1000 characters'
  },
  specialties: {
    required: true,
    minItems: 1,
    maxItems: 10,
    message: 'Please select 1-10 specialties'
  },
  supported_recovery_methods: {
    required: true,
    minItems: 1,
    maxItems: 8,
    message: 'Please select 1-8 recovery methods you support'
  },
  years_experience: {
    min: 0,
    max: 50,
    message: 'Years of experience must be between 0 and 50'
  },
  service_city: {
    required: true,
    message: 'Service city is required'
  },
  service_state: {
    required: true,
    message: 'Service state is required'
  }
};

// Help text for form fields
export const HELP_TEXT = {
  primary_phone: 'Primary contact number for clients to reach you',
  professional_title: 'Your professional title or role in peer support',
  specialties: 'Select the areas where you have experience and can provide support',
  supported_recovery_methods: 'Recovery methodologies you support or are trained in',
  bio: 'Tell potential clients about your approach to peer support and what makes you unique (50-1000 characters)',
  recovery_stage: 'Your current stage of recovery (helps clients relate to your experience)',
  time_in_recovery: 'How long you\'ve been in recovery (optional, share what you\'re comfortable with)',
  primary_issues: 'Issues you have personal or professional experience supporting (optional)',
  spiritual_affiliation: 'Your spiritual or religious background, if relevant to your recovery approach',
  service_areas: 'Geographic areas where you provide peer support services',
  additional_info: 'Any additional information about your services, availability, or approach'
};

// Form completion scoring - aligned with actual required fields
export const COMPLETION_SCORING = {
  required_fields: {
    primary_phone: 15,
    service_city: 10,
    service_state: 10,
    bio: 25,
    specialties: 20,
    supported_recovery_methods: 20
  }
};

// Field mapping for search and display
export const SEARCH_FIELD_MAPPING = {
  specialties: 'specialties',
  serviceArea: 'service_areas',
  location: ['service_city', 'service_state'],
  experience: 'years_experience',
  acceptingClients: 'accepting_clients',
  isActive: 'is_active'
};

// Default form data structure
export const DEFAULT_FORM_DATA = {
  // Contact & Profile
  primary_phone: '',
  professional_title: '',
  contact_email: '',
  service_city: '',
  service_state: '',
  
  // Professional Background
  years_experience: null,
  is_licensed: false,
  
  // Recovery & Expertise
  specialties: [],
  supported_recovery_methods: [],
  recovery_stage: '',
  time_in_recovery: '',
  primary_issues: [],
  spiritual_affiliation: '',
  
  // Content
  bio: '',
  additional_info: '',
  
  // Service Settings
  service_areas: [],
  accepting_clients: true,
  is_active: true
};

export default {
  stateOptions,
  spiritualAffiliationOptions,
  specialtyOptions,
  recoveryMethodOptions,
  recoveryStageOptions,
  primaryIssuesOptions,
  serviceAreaOptions,
  FORM_SECTIONS,
  VALIDATION_RULES,
  HELP_TEXT,
  COMPLETION_SCORING,
  SEARCH_FIELD_MAPPING,
  DEFAULT_FORM_DATA
};
// src/components/forms/constants/peerSupportConstants.js

// State options for address forms
export const stateOptions = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Professional certification options
export const certificationOptions = [
  'Certified Peer Specialist (CPS)',
  'Certified Peer Recovery Coach (CPRC)',
  'Certified Addiction Counselor (CAC)',
  'Licensed Clinical Social Worker (LCSW)',
  'Licensed Professional Counselor (LPC)',
  'Certified Recovery Peer Advocate (CRPA)',
  'Certified Peer Recovery Support Specialist (CPRSS)',
  'National Certified Peer Specialist (NCPS)',
  'Other Professional License'
];

// Specialty areas for peer support
export const specialtyOptions = [
  'Substance Use Recovery',
  'Mental Health Recovery',
  'Trauma Recovery',
  'Housing Support',
  'Employment Support',
  'Family Recovery',
  'Criminal Justice Recovery',
  'LGBTQ+ Support',
  'Veterans Support',
  'Youth/Adolescent Support',
  'Women in Recovery',
  'Men in Recovery',
  'Dual Diagnosis Support',
  'Relapse Prevention'
];

// Recovery approach methodologies
export const recoveryApproachOptions = [
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

// Age groups served
export const ageGroupOptions = [
  'Adolescents (13-17)',
  'Young Adults (18-25)',
  'Adults (26-59)',
  'Seniors (60+)',
  'All Ages'
];

// Population specializations
export const populationOptions = [
  'Men',
  'Women',
  'LGBTQ+ Individuals',
  'Veterans',
  'Parents/Families',
  'Justice-Involved Individuals',
  'Healthcare Workers',
  'First Responders',
  'Students',
  'Professionals',
  'Rural Communities',
  'Urban Communities',
  'Spanish-Speaking Clients',
  'Other Languages'
];

// Service area types
export const serviceAreaOptions = [
  'Urban Areas',
  'Suburban Areas',
  'Rural Areas',
  'Multiple Counties',
  'Statewide',
  'Multi-State',
  'Online Only'
];

// Contact method preferences
export const contactMethodOptions = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text Message' },
  { value: 'app', label: 'App Messaging' },
  { value: 'video', label: 'Video Call' }
];

// Response time options
export const responseTimeOptions = [
  { value: 'immediate', label: 'Immediate (same day)' },
  { value: '24-hours', label: 'Within 24 hours' },
  { value: '48-hours', label: 'Within 48 hours' },
  { value: 'weekly', label: 'Within a week' },
  { value: 'flexible', label: 'Flexible based on need' }
];

// Service delivery methods
export const serviceDeliveryOptions = [
  {
    key: 'individual_sessions',
    label: 'Individual Sessions',
    description: 'One-on-one peer support sessions'
  },
  {
    key: 'group_sessions',
    label: 'Group Sessions',
    description: 'Facilitated group peer support meetings'
  },
  {
    key: 'crisis_support',
    label: 'Crisis Support',
    description: 'Available for crisis intervention and support'
  },
  {
    key: 'housing_assistance',
    label: 'Housing Assistance',
    description: 'Help with housing search and advocacy'
  },
  {
    key: 'employment_support',
    label: 'Employment Support',
    description: 'Job search and workplace reintegration support'
  }
];

// Additional service options
export const additionalServiceOptions = [
  {
    key: 'offers_telehealth',
    label: 'Telehealth Services',
    description: 'Remote support via phone/video'
  },
  {
    key: 'offers_in_person',
    label: 'In-Person Services',
    description: 'Face-to-face meetings available'
  }
];

// Default form sections for navigation
export const FORM_SECTIONS = [
  {
    id: 'contact',
    title: 'Contact Information',
    icon: '📞',
    description: 'Your contact details and service location'
  },
  {
    id: 'professional',
    title: 'Professional Information',
    icon: '🎓',
    description: 'Your experience, certifications, and credentials'
  },
  {
    id: 'services',
    title: 'Services & Specialties',
    icon: '🤝',
    description: 'What services you provide and who you help'
  },
  {
    id: 'about',
    title: 'About You',
    icon: '💫',
    description: 'Your story and approach to peer support'
  },
  {
    id: 'settings',
    title: 'Service Settings',
    icon: '⚙️',
    description: 'Availability, capacity, and service preferences'
  }
];

// Validation rules and constraints
export const VALIDATION_RULES = {
  phone: {
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
    message: 'Please select at least one specialty'
  },
  years_experience: {
    min: 0,
    max: 50,
    message: 'Years of experience must be between 0 and 50'
  },
  max_clients: {
    min: 1,
    max: 100,
    message: 'Maximum clients must be between 1 and 100'
  },
  service_radius: {
    min: 1,
    max: 500,
    message: 'Service radius must be between 1 and 500 miles'
  }
};

// Help text and descriptions
export const HELP_TEXT = {
  phone: 'Primary contact number for clients to reach you',
  title: 'Your professional title or role in peer support',
  certifications: 'Select all certifications and licenses you hold',
  specialties: 'Areas where you have experience and can provide support',
  recovery_approach: 'Recovery methodologies you support or are trained in',
  bio: 'Tell potential clients about your approach to peer support and what makes you unique',
  recovery_story: 'Optional: Share what you\'re comfortable sharing about your recovery journey',
  service_area: 'Geographic areas where you provide services',
  available_hours: 'When you\'re typically available for appointments',
  max_clients: 'Maximum number of clients you can support at one time'
};

// Form completion scoring
export const COMPLETION_SCORING = {
  required_fields: {
    phone: 20,
    bio: 20,
    specialties: 20
  },
  important_fields: {
    title: 8,
    years_experience: 4,
    certifications: 8,
    recovery_approach: 8,
    preferred_contact_method: 4,
    response_time: 4,
    recovery_story: 4
  }
};

export default {
  stateOptions,
  certificationOptions,
  specialtyOptions,
  recoveryApproachOptions,
  ageGroupOptions,
  populationOptions,
  serviceAreaOptions,
  contactMethodOptions,
  responseTimeOptions,
  serviceDeliveryOptions,
  additionalServiceOptions,
  FORM_SECTIONS,
  VALIDATION_RULES,
  HELP_TEXT,
  COMPLETION_SCORING
};
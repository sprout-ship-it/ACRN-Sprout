// src/components/features/property/constants/propertyConstants.js

// ✅ ALIGNED: Property types that match applicant form expectations
export const propertyTypes = [
  { value: 'sober_living_level_1', label: 'Sober Living Home (Level 1 - Peer Run)' },
  { value: 'sober_living_level_2', label: 'Sober Living Home (Level 2 - Monitored)' },
  { value: 'sober_living_level_3', label: 'Sober Living Home (Level 3 - Supervised)' },
  { value: 'sober_living_level_4', label: 'Sober Living Home (Level 4 - Integrated Services)' },
  { value: 'halfway_house', label: 'Halfway House' },
  { value: 'transitional_housing', label: 'Transitional Housing' },
  { value: 'oxford_house', label: 'Oxford House' },
  { value: 'recovery_residence', label: 'Recovery Residence (General)' },
  { value: 'supportive_housing', label: 'Supportive Housing' },
  { value: 'therapeutic_community', label: 'Therapeutic Community' }
];

// ✅ NEW: Housing subsidy programs that properties can accept
export const acceptedSubsidyPrograms = [
  { value: 'section_8', label: 'Section 8 Housing Choice Voucher' },
  { value: 'ssi_ssdi', label: 'SSI/SSDI Benefits' },
  { value: 'veterans_benefits', label: 'Veterans Housing Benefits (VASH/HUD)' },
  { value: 'medicaid_waiver', label: 'Medicaid Waiver Programs' },
  { value: 'tanf', label: 'TANF (Temporary Assistance for Needy Families)' },
  { value: 'general_assistance', label: 'General Assistance/State Aid' },
  { value: 'local_housing_authority', label: 'Local Housing Authority Programs' },
  { value: 'nonprofit_assistance', label: 'Nonprofit/Charity Assistance' },
  { value: 'church_assistance', label: 'Religious Organization Assistance' },
  { value: 'recovery_scholarships', label: 'Recovery Program Scholarships' },
  { value: 'work_release_funds', label: 'Work Release/Correctional Funds' },
  { value: 'none', label: 'No Subsidies Accepted (Private Pay Only)' }
];

// ✅ NEW: Recovery program requirements for properties
export const requiredRecoveryPrograms = [
  { value: 'twelve_step', label: '12-Step Programs (AA/NA/etc.)' },
  { value: 'smart_recovery', label: 'SMART Recovery' },
  { value: 'celebrate_recovery', label: 'Celebrate Recovery' },
  { value: 'refuge_recovery', label: 'Refuge Recovery' },
  { value: 'outpatient_treatment', label: 'Outpatient Treatment' },
  { value: 'counseling_therapy', label: 'Individual Counseling/Therapy' },
  { value: 'group_therapy', label: 'Group Therapy' },
  { value: 'peer_support', label: 'Peer Support Groups' },
  { value: 'medication_assisted', label: 'Medication-Assisted Treatment (MAT)' },
  { value: 'court_ordered', label: 'Court-Ordered Programs' },
  { value: 'employment_training', label: 'Employment/Job Training' },
  { value: 'life_skills', label: 'Life Skills Training' },
  { value: 'none_required', label: 'No Specific Programs Required' },
  { value: 'flexible', label: 'Flexible - Resident Choice' }
];

// ✅ NEW: House rules and restrictions
export const houseRulesOptions = [
  'Curfew Required',
  'Random Drug Testing',
  'Mandatory House Meetings',
  'Required Chores/Cleaning',
  'No Overnight Guests',
  'Limited Overnight Guests',
  'No Romantic Relationships',
  'No Visitors During Certain Hours',
  'Mandatory Employment/Education',
  'Phone/Device Restrictions',
  'No Personal Vehicles',
  'Shared Meals Required',
  'Quiet Hours Enforced',
  'Common Area Restrictions',
  'Personal Space Restrictions'
];

// ✅ ALIGNED: Property amenities that match applicant interests
export const propertyAmenities = [
  // Basic Amenities
  'WiFi/Internet',
  'Laundry Facilities',
  'Full Kitchen Access',
  'Parking Available',
  'Public Transportation Access',
  'Bicycle Storage',
  
  // Recovery-Focused Amenities
  'Meeting/Group Room',
  'Quiet Study/Meditation Space',
  'Computer/Internet Lab',
  'Library/Reading Area',
  'Prayer/Spiritual Space',
  
  // Health & Wellness
  'Gym/Fitness Equipment',
  'Outdoor Exercise Space',
  'Garden/Outdoor Area',
  'Walking Trails Nearby',
  'Swimming Pool Access',
  
  // Support Services
  'On-Site Counseling Services',
  'Case Management Services',
  'Job Training/Placement Assistance',
  'Medical Services/Clinic',
  'Transportation Services',
  'Meal Planning/Nutrition Support',
  
  // Comfort & Convenience
  'Air Conditioning',
  'Heating',
  'Cable/Streaming TV',
  'Furnished Rooms',
  'Linens Provided',
  'Kitchen Supplies Provided',
  'Cleaning Supplies Provided',
  
  // Safety & Security
  'Security System',
  'Gated/Secure Property',
  'Well-lit Grounds',
  'Emergency Response System',
  'Fire Safety Systems'
];

// ✅ NEW: Property accessibility features
export const accessibilityFeatures = [
  'Wheelchair Accessible Entrance',
  'Wheelchair Accessible Bathroom',
  'Wheelchair Accessible Bedroom',
  'Grab Bars in Bathroom',
  'Step-Free Shower',
  'Wide Doorways',
  'Ramp Access',
  'Elevator Access',
  'Visual/Hearing Accommodation',
  'Service Animal Friendly'
];

// ✅ NEW: Neighborhood characteristics
export const neighborhoodFeatures = [
  'Quiet Residential Area',
  'Close to Public Transportation',
  'Walking Distance to Grocery Store',
  'Near Medical Facilities',
  'Close to Employment Opportunities',
  'Near Recovery Meeting Locations',
  'Close to Educational Institutions',
  'Safe Neighborhood (Low Crime)',
  'Family-Friendly Area',
  'Urban Setting',
  'Suburban Setting',
  'Rural Setting'
];

export default {
  propertyTypes,
  acceptedSubsidyPrograms,
  requiredRecoveryPrograms,
  houseRulesOptions,
  propertyAmenities,
  accessibilityFeatures,
  neighborhoodFeatures
};
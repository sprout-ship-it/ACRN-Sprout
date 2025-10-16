// src/components/features/property/constants/propertyConstants.js - ENHANCED FOR DUAL PROPERTY TYPES

// ============================================================================
// PROPERTY TYPES - SEPARATED BY CATEGORY
// ============================================================================

// ✅ Recovery Housing Property Types (existing)
export const recoveryPropertyTypes = [
  { value: 'sober_living_level_1', label: 'Sober Living Home - Level 1' },
  { value: 'sober_living_level_2', label: 'Sober Living Home - Level 2' },
  { value: 'sober_living_level_3', label: 'Sober Living Home - Level 3' },
  { value: 'halfway_house', label: 'Halfway House' },
  { value: 'recovery_residence', label: 'Recovery Residence' },
  { value: 'transitional_housing', label: 'Transitional Housing' },
  { value: 'supportive_housing', label: 'Supportive Housing' },
  { value: 'therapeutic_community', label: 'Therapeutic Community' }
];

// ✅ General Rental Property Types (new)
export const generalPropertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condo', label: 'Condo/Condominium' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'triplex', label: 'Triplex' },
  { value: 'studio', label: 'Studio Apartment' },
  { value: 'loft', label: 'Loft' },
  { value: 'single_room', label: 'Single Room Rental' },
  { value: 'shared_room', label: 'Shared Room' },
  { value: 'basement_apartment', label: 'Basement Apartment' },
  { value: 'garage_apartment', label: 'Garage Apartment' },
  { value: 'tiny_home', label: 'Tiny Home' },
  { value: 'manufactured_home', label: 'Manufactured/Mobile Home' }
];

// ✅ Combined property types for backward compatibility
export const propertyTypes = [...recoveryPropertyTypes, ...generalPropertyTypes];

// ============================================================================
// AMENITIES - UNIVERSAL AND SPECIALIZED
// ============================================================================

// ✅ Universal Amenities (both property types)
export const universalAmenities = [
  'WiFi/Internet Access',
  'Laundry Facilities',
  'Full Kitchen Access',
  'Parking Available',
  'Air Conditioning',
  'Heating System',
  'Cable/Satellite TV',
  'Outdoor Space/Yard',
  'Storage Space',
  'Wheelchair Accessible',
  'Pet-Friendly Areas',
  'Security System',
  'Smoke Detectors',
  'Fire Extinguisher'
];

// ✅ General Rental Specific Amenities
export const generalRentalAmenities = [
  'Swimming Pool',
  'Fitness Center/Gym',
  'Business Center',
  'Community Room',
  'Rooftop Access',
  'Balcony/Patio',
  'Walk-in Closets',
  'In-Unit Washer/Dryer',
  'Dishwasher',
  'Garbage Disposal',
  'Central Air',
  'Fireplace',
  'Hardwood Floors',
  'Carpet',
  'Tile Flooring',
  'Updated Kitchen',
  'Granite Countertops',
  'Stainless Steel Appliances',
  'Walk-in Shower',
  'Garden Tub',
  'Ceiling Fans',
  'Window Blinds',
  'Private Entrance'
];

// ✅ Recovery Housing Specific Amenities
export const recoveryHousingAmenities = [
  'Meeting Room/Space',
  'Computer/Internet Access',
  'Library/Study Area',
  'Recreation Room',
  'Exercise Equipment',
  'Meditation/Prayer Space',
  'Group Kitchen',
  'Shared Living Areas',
  'TV/Entertainment Area',
  'Outdoor Recreation Area',
  'Bicycle Storage',
  'Shared Transportation',
  'Visitor Areas',
  'Phone Access',
  'Mail Service'
];

// ✅ Combined amenities for existing components
export const propertyAmenities = [
  ...universalAmenities,
  ...generalRentalAmenities,
  ...recoveryHousingAmenities
];

// ============================================================================
// UTILITIES - ENHANCED FOR BOTH PROPERTY TYPES
// ============================================================================

export const standardUtilities = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'gas', label: 'Gas' },
  { value: 'trash', label: 'Trash Collection' },
  { value: 'recycling', label: 'Recycling Service' },
  { value: 'sewer', label: 'Sewer' },
  { value: 'internet', label: 'Internet/WiFi' },
  { value: 'cable_tv', label: 'Cable/Satellite TV' },
  { value: 'heating', label: 'Heating' },
  { value: 'air_conditioning', label: 'Air Conditioning' },
  { value: 'landscaping', label: 'Landscaping/Lawn Care' },
  { value: 'snow_removal', label: 'Snow Removal' },
  { value: 'pest_control', label: 'Pest Control' }
];

// ============================================================================
// HOUSING ASSISTANCE PROGRAMS - ENHANCED
// ============================================================================

export const acceptedSubsidyPrograms = [
  { value: 'section_8', label: 'Section 8 Housing Vouchers' },
  { value: 'veterans_benefits', label: 'Veterans Housing Benefits (HUD-VASH)' },
  { value: 'local_housing_authority', label: 'Local Housing Authority Programs' },
  { value: 'supportive_services', label: 'Supportive Services for Veteran Families (SSVF)' },
  { value: 'continuum_of_care', label: 'Continuum of Care Programs' },
  { value: 'rapid_rehousing', label: 'Rapid Re-Housing Assistance' },
  { value: 'permanent_supportive', label: 'Permanent Supportive Housing' },
  { value: 'transitional_housing', label: 'Transitional Housing Programs' },
  { value: 'state_rental_assistance', label: 'State Rental Assistance' },
  { value: 'emergency_rental', label: 'Emergency Rental Assistance' },
  { value: 'disability_assistance', label: 'Disability Housing Assistance' },
  { value: 'low_income_housing', label: 'Low Income Housing Tax Credit Properties' },
  { value: 'none', label: 'No Subsidies Accepted (Private Pay Only)' }
];

// ============================================================================
// RECOVERY-SPECIFIC CONSTANTS
// ============================================================================

export const requiredRecoveryPrograms = [
  { value: 'aa_meetings', label: 'AA Meetings' },
  { value: 'na_meetings', label: 'NA Meetings' },
  { value: 'outpatient_treatment', label: 'Outpatient Treatment Program' },
  { value: 'intensive_outpatient', label: 'Intensive Outpatient Program (IOP)' },
  { value: 'therapy_counseling', label: 'Individual Therapy/Counseling' },
  { value: 'group_therapy', label: 'Group Therapy' },
  { value: 'case_management', label: 'Case Management Services' },
  { value: 'job_training', label: 'Job Training/Employment Program' },
  { value: 'educational_program', label: 'Educational Program' },
  { value: 'life_skills', label: 'Life Skills Training' },
  { value: 'financial_literacy', label: 'Financial Literacy Training' },
  { value: 'community_service', label: 'Community Service Hours' },
  { value: 'sponsor_mentor', label: 'Sponsor/Mentor Relationship' },
  { value: 'peer_support', label: 'Peer Support Groups' },
  { value: 'spiritual_program', label: 'Spiritual/Faith-Based Program' },
  { value: 'none_required', label: 'No Specific Programs Required' }
];

export const houseRulesOptions = [
  'No alcohol or drugs on premises',
  'Random drug/alcohol testing',
  'Curfew hours enforced',
  'Mandatory house meetings',
  'Chore assignments required',
  'No overnight guests without approval',
  'Quiet hours 10 PM - 7 AM',
  'No smoking anywhere on property',
  'Designated smoking areas only',
  'No personal vehicles on property',
  'Shared meal times',
  'Mandatory group activities',
  'Check-in/check-out procedures',
  'No personal refrigerated items',
  'Shared bathroom cleaning schedule',
  'No personal furniture in bedrooms',
  'Bedtime/lights out enforcement',
  'No cell phones during group time',
  'Dress code requirements',
  'No lending money between residents'
];

// ============================================================================
// ACCESSIBILITY & NEIGHBORHOOD FEATURES
// ============================================================================

export const accessibilityFeatures = [
  'Wheelchair Accessible Entrance',
  'Wheelchair Accessible Bathroom',
  'Grab Bars in Bathroom',
  'Roll-in Shower',
  'Step-Free Shower',
  'Wide Doorways (32+ inches)',
  'Ramp Access',
  'Accessible Parking Space',
  'Lowered Light Switches',
  'Lowered Kitchen Counters',
  'Accessible Kitchen Appliances',
  'Visual Fire Alarms',
  'Audio Door Bells',
  'Lever Door Handles',
  'Non-Slip Flooring',
  'Stair Railings',
  'Elevator Access',
  'Accessible Mailbox',
  'Service Animal Friendly'
];

export const neighborhoodFeatures = [
  'Public Transportation Access',
  'Bus Stop Nearby',
  'Subway/Train Station',
  'Shopping Centers',
  'Grocery Stores',
  'Restaurants',
  'Medical Facilities',
  'Hospital Nearby',
  'Pharmacy',
  'Schools',
  'Libraries',
  'Parks and Recreation',
  'Walking Trails',
  'Bike Paths',
  'Community Center',
  'Places of Worship',
  'Post Office',
  'Banks/ATMs',
  'Gas Stations',
  'Employment Opportunities',
  'Safe Neighborhood',
  'Well-Lit Streets',
  'Low Crime Area',
  'Family-Friendly',
  'Quiet/Residential',
  'Urban Setting',
  'Suburban Setting',
  'Rural Setting'
];

// ============================================================================
// LEASE TERMS & AVAILABILITY
// ============================================================================

export const leaseDurationOptions = [
  { value: 'month_to_month', label: 'Month-to-Month' },
  { value: '3_months', label: '3 Months' },
  { value: '6_months', label: '6 Months' },
  { value: '9_months', label: '9 Months' },
  { value: '12_months', label: '1 Year' },
  { value: '18_months', label: '18 Months' },
  { value: '24_months', label: '2 Years' },
  { value: 'flexible', label: 'Flexible Terms' },
  { value: 'short_term', label: 'Short-term (Under 3 months)' },
  { value: 'long_term', label: 'Long-term (2+ years)' }
];

export const propertyStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'waitlist', label: 'Waitlist Only' },
  { value: 'full', label: 'Currently Full' },
  { value: 'temporarily_closed', label: 'Temporarily Closed' },
  { value: 'under_renovation', label: 'Under Renovation' },
  { value: 'seasonal', label: 'Seasonal Availability' }
];

// ============================================================================
// SEARCH & FILTER OPTIONS
// ============================================================================

// ✅ Property search categories
export const propertyCategories = [
  { value: 'general_rental', label: 'General Rental' },
  { value: 'recovery_housing', label: 'Recovery Housing' },
  { value: 'all', label: 'All Properties' }
];

// ✅ Rent ranges for search filters
export const rentRanges = [
  { value: '0-500', label: 'Under $500' },
  { value: '500-750', label: '$500 - $750' },
  { value: '750-1000', label: '$750 - $1,000' },
  { value: '1000-1250', label: '$1,000 - $1,250' },
  { value: '1250-1500', label: '$1,250 - $1,500' },
  { value: '1500-2000', label: '$1,500 - $2,000' },
  { value: '2000-2500', label: '$2,000 - $2,500' },
  { value: '2500-3000', label: '$2,500 - $3,000' },
  { value: '3000+', label: '$3,000+' }
];

// ✅ Bedroom options for search
export const bedroomOptions = [
  { value: '0', label: 'Studio' },
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5+', label: '5+ Bedrooms' }
];

// ============================================================================
// FORM FIELD VALIDATION RULES
// ============================================================================

export const fieldValidation = {
  required: {
    general_rental: [
      'property_name', 'property_type', 'address', 'city', 'state', 'zip_code', 
      'phone', 'bedrooms', 'rent_amount', 'available_date', 'lease_duration'
    ],
    recovery_housing: [
      'property_name', 'property_type', 'address', 'city', 'state', 'zip_code', 
      'phone', 'bedrooms', 'total_beds', 'rent_amount'
    ]
  },
  numeric: {
    min: {
      bedrooms: 0,
      total_beds: 1,
      available_beds: 0,
      bathrooms: 0.5,
      rent_amount: 1,
      security_deposit: 0,
      application_fee: 0,
      square_footage: 100
    },
    max: {
      bedrooms: 20,
      total_beds: 100,
      available_beds: 100,
      bathrooms: 20,
      rent_amount: 50000,
      security_deposit: 50000,
      application_fee: 2000,
      square_footage: 50000
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ✅ Get property types by category
export const getPropertyTypesByCategory = (category) => {
  switch (category) {
    case 'general_rental':
      return generalPropertyTypes;
    case 'recovery_housing':
      return recoveryPropertyTypes;
    default:
      return propertyTypes;
  }
};

// ✅ Get amenities by category
export const getAmenitiesByCategory = (category) => {
  switch (category) {
    case 'general_rental':
      return [...universalAmenities, ...generalRentalAmenities];
    case 'recovery_housing':
      return [...universalAmenities, ...recoveryHousingAmenities];
    default:
      return propertyAmenities;
  }
};

// ✅ Check if property type is recovery housing
export const isRecoveryPropertyType = (propertyType) => {
  return recoveryPropertyTypes.some(type => type.value === propertyType);
};

// ✅ Get validation rules by category
export const getValidationRules = (category) => {
  return {
    required: fieldValidation.required[category] || fieldValidation.required.general_rental,
    numeric: fieldValidation.numeric
  };
};

// ============================================================================
// EXPORT DEFAULT FOR BACKWARD COMPATIBILITY
// ============================================================================

export default {
  propertyTypes,
  propertyAmenities,
  acceptedSubsidyPrograms,
  requiredRecoveryPrograms,
  houseRulesOptions,
  accessibilityFeatures,
  neighborhoodFeatures,
  leaseDurationOptions,
  propertyStatusOptions,
  standardUtilities,
  rentRanges,
  bedroomOptions,
  propertyCategories,
  getPropertyTypesByCategory,
  getAmenitiesByCategory,
  isRecoveryPropertyType,
  getValidationRules
};
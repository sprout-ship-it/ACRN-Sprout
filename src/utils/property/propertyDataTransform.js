// src/utils/property/propertyDataTransform.js
/**
 * Property data transformation utilities for converting database values
 * to human-readable display formats
 */

/**
 * Format property type for display
 * @param {string} type - Raw property type from database
 * @returns {string} Formatted property type
 */
export const formatPropertyType = (type) => {
  if (!type) return 'Property';
  
  const typeMap = {
    'apartment': 'Apartment',
    'house': 'House',
    'condo': 'Condo',
    'townhouse': 'Townhouse',
    'studio': 'Studio',
    'duplex': 'Duplex',
    'room': 'Private Room',
    'shared_room': 'Shared Room',
    'recovery_residence': 'Recovery Residence',
    'sober_living': 'Sober Living Home',
    'sober_living_level_1': 'Sober Living (Level 1)',
    'sober_living_level_2': 'Sober Living (Level 2)',
    'sober_living_level_3': 'Sober Living (Level 3)',
    'sober_living_level_4': 'Sober Living (Level 4)',
    'halfway_house': 'Halfway House',
    'transitional_housing': 'Transitional Housing',
    'therapeutic_community': 'Therapeutic Community'
  };
  
  return typeMap[type] || type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Format lease duration for display
 * @param {string} duration - Raw lease duration from database
 * @returns {string} Formatted lease duration
 */
export const formatLeaseDuration = (duration) => {
  if (!duration) return 'Flexible';
  
  const durationMap = {
    'month_to_month': 'Month-to-Month',
    'weekly': 'Weekly',
    '1_month': '1 Month',
    '3_months': '3 Months',
    '6_months': '6 Months',
    '1_year': '1 Year',
    '2_years': '2 Years',
    'flexible': 'Flexible',
    'negotiable': 'Negotiable'
  };
  
  return durationMap[duration] || duration.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Format currency amount
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Contact for pricing';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${numAmount.toLocaleString()}`;
};

/**
 * Format bedrooms for display
 * @param {number|string} bedrooms - Number of bedrooms
 * @returns {string} Formatted bedrooms
 */
export const formatBedrooms = (bedrooms) => {
  if (!bedrooms || bedrooms === 0 || bedrooms === '0') return 'Studio';
  return `${bedrooms} ${bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`;
};

/**
 * Format bathrooms for display
 * @param {number|string} bathrooms - Number of bathrooms
 * @returns {string} Formatted bathrooms
 */
export const formatBathrooms = (bathrooms) => {
  if (!bathrooms) return 'Not specified';
  const num = parseFloat(bathrooms);
  return `${num} ${num === 1 ? 'Bath' : 'Baths'}`;
};

/**
 * Format available beds for recovery housing
 * @param {number|string} availableBeds - Number of available beds
 * @param {number|string} totalBeds - Total number of beds
 * @returns {string} Formatted bed availability
 */
export const formatBedAvailability = (availableBeds, totalBeds) => {
  if (!availableBeds || availableBeds === 0) return 'No beds available';
  const available = parseInt(availableBeds);
  const total = parseInt(totalBeds);
  
  if (total && total > 0) {
    return `${available} of ${total} ${available === 1 ? 'bed' : 'beds'} available`;
  }
  
  return `${available} ${available === 1 ? 'bed' : 'beds'} available`;
};

/**
 * Format amenities list for preview
 * @param {Array} amenities - Array of amenities
 * @param {number} maxDisplay - Maximum number to display
 * @returns {Object} Formatted amenities object
 */
export const formatAmenities = (amenities, maxDisplay = 3) => {
  if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
    return { preview: [], remaining: 0, total: 0 };
  }
  
  const formatted = amenities.map(amenity => 
    amenity.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  );
  
  return {
    preview: formatted.slice(0, maxDisplay),
    remaining: Math.max(0, formatted.length - maxDisplay),
    total: formatted.length,
    all: formatted
  };
};

/**
 * Format utilities included list
 * @param {Array} utilities - Array of utilities
 * @returns {string} Formatted utilities string
 */
export const formatUtilities = (utilities) => {
  if (!utilities || !Array.isArray(utilities) || utilities.length === 0) {
    return 'Utilities not included';
  }
  
  const utilityMap = {
    'water': 'Water',
    'electricity': 'Electricity',
    'gas': 'Gas',
    'internet': 'Internet',
    'cable': 'Cable/TV',
    'trash': 'Trash',
    'sewer': 'Sewer',
    'heat': 'Heat',
    'hot_water': 'Hot Water',
    'all': 'All Utilities'
  };
  
  const formatted = utilities.map(u => utilityMap[u] || u);
  
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return formatted.join(' & ');
  return formatted.slice(0, -1).join(', ') + ', & ' + formatted[formatted.length - 1];
};

/**
 * Format recovery support services
 * @param {Object} property - Property object
 * @returns {Array} Array of formatted service strings
 */
export const formatRecoveryServices = (property) => {
  if (!property.is_recovery_housing) return [];
  
  const services = [];
  
  if (property.case_management) services.push('Case Management');
  if (property.counseling_services) services.push('Counseling');
  if (property.job_training) services.push('Job Training');
  if (property.medical_services) services.push('Medical Services');
  if (property.transportation_services) services.push('Transportation');
  if (property.life_skills_training) services.push('Life Skills');
  if (property.meals_included) services.push('Meals Included');
  
  return services;
};

/**
 * Format recovery program requirements
 * @param {Array} programs - Array of required programs
 * @returns {string} Formatted requirements string
 */
export const formatProgramRequirements = (programs) => {
  if (!programs || !Array.isArray(programs) || programs.length === 0) {
    return 'No specific program requirements';
  }
  
  const programMap = {
    'aa': 'AA (Alcoholics Anonymous)',
    'na': 'NA (Narcotics Anonymous)',
    'ca': 'CA (Cocaine Anonymous)',
    'smart_recovery': 'SMART Recovery',
    'celebrate_recovery': 'Celebrate Recovery',
    'refuge_recovery': 'Refuge Recovery',
    'womens_recovery': "Women's Recovery Program",
    'mens_recovery': "Men's Recovery Program",
    'dual_diagnosis': 'Dual Diagnosis Treatment',
    'outpatient': 'Outpatient Program',
    'iop': 'Intensive Outpatient (IOP)',
    'php': 'Partial Hospitalization (PHP)'
  };
  
  return programs.map(p => programMap[p] || p).join(', ');
};

/**
 * Format minimum sobriety time
 * @param {string} minTime - Minimum sobriety time requirement
 * @returns {string} Formatted sobriety requirement
 */
export const formatSobrietyRequirement = (minTime) => {
  if (!minTime) return 'No minimum sobriety required';
  
  const timeMap = {
    'none': 'No minimum required',
    '30_days': '30 Days',
    '60_days': '60 Days',
    '90_days': '90 Days',
    '6_months': '6 Months',
    '1_year': '1 Year',
    'flexible': 'Flexible'
  };
  
  return timeMap[minTime] || minTime;
};

/**
 * Format property status
 * @param {string} status - Property status from database
 * @returns {Object} Formatted status with color
 */
export const formatPropertyStatus = (status) => {
  const statusMap = {
    'available': { text: 'Available', color: 'success' },
    'pending': { text: 'Pending', color: 'warning' },
    'rented': { text: 'Rented', color: 'error' },
    'unavailable': { text: 'Unavailable', color: 'gray' },
    'maintenance': { text: 'Under Maintenance', color: 'warning' }
  };
  
  return statusMap[status] || { text: status, color: 'gray' };
};

/**
 * Format address for display
 * @param {Object} property - Property object with address fields
 * @returns {string} Formatted full address
 */
export const formatFullAddress = (property) => {
  const parts = [];
  
  if (property.address) parts.push(property.address);
  if (property.city) parts.push(property.city);
  if (property.state) parts.push(property.state);
  if (property.zip_code) parts.push(property.zip_code);
  
  return parts.join(', ');
};

/**
 * Format short address for card display
 * @param {Object} property - Property object
 * @returns {string} Formatted short address
 */
export const formatShortAddress = (property) => {
  const parts = [];
  
  if (property.city) parts.push(property.city);
  if (property.state) parts.push(property.state);
  
  return parts.join(', ') || 'Location not specified';
};

/**
 * Format available date
 * @param {string} date - Available date string
 * @returns {string} Formatted date
 */
export const formatAvailableDate = (date) => {
  if (!date) return 'Available now';
  
  try {
    const availDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (availDate <= today) return 'Available now';
    
    return `Available ${availDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  } catch (error) {
    return 'Date not specified';
  }
};

/**
 * Get property card badges
 * @param {Object} property - Property object
 * @returns {Array} Array of badge objects
 */
export const getPropertyBadges = (property) => {
  const badges = [];
  
  if (property.is_recovery_housing) {
    badges.push({ text: 'Recovery Housing', color: 'warning', icon: '🌱' });
  }
  
  if (property.furnished) {
    badges.push({ text: 'Furnished', color: 'info', icon: '🛋️' });
  }
  
  if (property.pets_allowed) {
    badges.push({ text: 'Pet Friendly', color: 'success', icon: '🐾' });
  }
  
  if (property.utilities_included && property.utilities_included.length > 0) {
    badges.push({ text: 'Utilities Included', color: 'info', icon: '💡' });
  }
  
  if (property.accepted_subsidies && property.accepted_subsidies.length > 0) {
    badges.push({ text: 'Subsidies OK', color: 'info', icon: '💵' });
  }
  
  if (property.accessibility_features && property.accessibility_features.length > 0) {
    badges.push({ text: 'Accessible', color: 'info', icon: '♿' });
  }
  
  if (property.parking_required) {
    badges.push({ text: 'Parking', color: 'info', icon: '🚗' });
  }
  
  if (property.public_transit_access) {
    badges.push({ text: 'Transit Access', color: 'info', icon: '🚇' });
  }
  
  return badges;
};

/**
 * Create property summary for card
 * @param {Object} property - Property object
 * @returns {Object} Formatted property summary
 */
export const createPropertySummary = (property) => {
  return {
    title: property.title || property.property_name || formatFullAddress(property),
    type: formatPropertyType(property.property_type),
    address: formatShortAddress(property),
    price: {
      monthly: formatCurrency(property.monthly_rent),
      weekly: property.weekly_rate ? formatCurrency(property.weekly_rate) : null
    },
    specs: {
      bedrooms: formatBedrooms(property.bedrooms),
      bathrooms: formatBathrooms(property.bathrooms),
      beds: property.total_beds ? `${property.total_beds} beds` : null
    },
    availability: {
      date: formatAvailableDate(property.available_date),
      beds: property.is_recovery_housing && property.available_beds ? 
            formatBedAvailability(property.available_beds, property.total_beds) : null
    },
    amenities: formatAmenities(property.amenities),
    utilities: property.utilities_included ? formatUtilities(property.utilities_included) : null,
    recovery: property.is_recovery_housing ? {
      services: formatRecoveryServices(property),
      programs: formatProgramRequirements(property.required_programs),
      sobriety: formatSobrietyRequirement(property.min_sobriety_time)
    } : null,
    badges: getPropertyBadges(property),
    status: formatPropertyStatus(property.status)
  };
};

export default {
  formatPropertyType,
  formatLeaseDuration,
  formatCurrency,
  formatBedrooms,
  formatBathrooms,
  formatBedAvailability,
  formatAmenities,
  formatUtilities,
  formatRecoveryServices,
  formatProgramRequirements,
  formatSobrietyRequirement,
  formatPropertyStatus,
  formatFullAddress,
  formatShortAddress,
  formatAvailableDate,
  getPropertyBadges,
  createPropertySummary
};
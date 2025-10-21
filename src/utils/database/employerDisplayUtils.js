// src/utils/database/employerDisplayUtils.js
// Data transformation utilities for displaying employer information

/**
 * Format company name with fallback
 */
export const formatCompanyName = (employer) => {
  return employer?.company_name || 'Company Name Not Listed';
};

/**
 * Format location display
 */
export const formatLocation = (employer) => {
  if (!employer) return 'Location Not Specified';
  
  const { city, state, address } = employer;
  
  if (city && state) {
    return `${city}, ${state}`;
  }
  
  if (address) {
    return address;
  }
  
  return 'Location Not Specified';
};

/**
 * Format industry with professional naming
 */
export const formatIndustry = (industry) => {
  if (!industry) return 'Industry Not Specified';
  
  // Map common database values to display names
  const industryMap = {
    'construction': 'Construction & Trades',
    'healthcare': 'Healthcare & Medical',
    'hospitality': 'Hospitality & Food Service',
    'retail': 'Retail & Sales',
    'manufacturing': 'Manufacturing & Production',
    'technology': 'Technology & IT',
    'education': 'Education & Training',
    'transportation': 'Transportation & Logistics',
    'service': 'Professional Services',
    'nonprofit': 'Nonprofit & Social Services',
    'government': 'Government & Public Sector',
    'agriculture': 'Agriculture & Farming',
    'finance': 'Finance & Banking',
    'real_estate': 'Real Estate',
    'entertainment': 'Entertainment & Media',
    'other': 'Other Industries'
  };
  
  const normalized = industry.toLowerCase().replace(/\s+/g, '_');
  return industryMap[normalized] || industry;
};

/**
 * Format business type for display
 */
export const formatBusinessType = (businessType) => {
  if (!businessType) return 'Not Specified';
  
  const typeMap = {
    'small_business': 'Small Business',
    'medium_business': 'Medium Business',
    'large_corporation': 'Large Corporation',
    'startup': 'Startup',
    'nonprofit': 'Nonprofit Organization',
    'government': 'Government Agency',
    'franchise': 'Franchise',
    'family_owned': 'Family Owned',
    'other': 'Other'
  };
  
  const normalized = businessType.toLowerCase().replace(/\s+/g, '_');
  return typeMap[normalized] || businessType;
};

/**
 * Format company size
 */
export const formatCompanySize = (size) => {
  if (!size) return 'Not Specified';
  
  const sizeMap = {
    '1-10': '1-10 employees',
    '11-50': '11-50 employees',
    '51-200': '51-200 employees',
    '201-500': '201-500 employees',
    '501-1000': '501-1,000 employees',
    '1001+': '1,000+ employees'
  };
  
  return sizeMap[size] || size;
};

/**
 * Format recovery-friendly features for display
 */
export const formatRecoveryFeature = (feature) => {
  if (!feature) return '';
  
  const featureMap = {
    'flexible_scheduling': 'Flexible Scheduling',
    'therapy_time_off': 'Therapy Time Off',
    'peer_support': 'Peer Support Programs',
    'eap_services': 'EAP Services',
    'mental_health_resources': 'Mental Health Resources',
    'substance_free_workplace': 'Substance-Free Workplace',
    'second_chance_employer': 'Second Chance Employer',
    'background_check_flexibility': 'Background Check Flexibility',
    'transportation_assistance': 'Transportation Assistance',
    'housing_assistance': 'Housing Assistance',
    'career_advancement': 'Career Advancement',
    'skills_training': 'Skills Training',
    'mentorship_program': 'Mentorship Program',
    'understanding_management': 'Understanding Management',
    'relapse_support': 'Relapse Support Policy'
  };
  
  const normalized = feature.toLowerCase().replace(/\s+/g, '_');
  return featureMap[normalized] || feature;
};

/**
 * Format job types for display
 */
export const formatJobType = (jobType) => {
  if (!jobType) return '';
  
  const jobTypeMap = {
    'full_time': 'Full-Time',
    'part_time': 'Part-Time',
    'contract': 'Contract',
    'temporary': 'Temporary',
    'seasonal': 'Seasonal',
    'internship': 'Internship',
    'apprenticeship': 'Apprenticeship',
    'remote': 'Remote',
    'hybrid': 'Hybrid',
    'on_site': 'On-Site'
  };
  
  const normalized = jobType.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  return jobTypeMap[normalized] || jobType;
};

/**
 * Format remote work policy
 */
export const formatRemoteWorkPolicy = (policy) => {
  if (!policy) return 'Not Specified';
  
  const policyMap = {
    'fully_remote': 'Fully Remote',
    'hybrid': 'Hybrid (Remote + On-Site)',
    'on_site': 'On-Site Only',
    'flexible': 'Flexible Options',
    'remote_available': 'Remote Available',
    'no_remote': 'No Remote Work'
  };
  
  const normalized = policy.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  return policyMap[normalized] || policy;
};

/**
 * Format hiring status badge
 */
export const getHiringStatusBadge = (isHiring) => {
  return {
    text: isHiring ? 'Actively Hiring' : 'Not Currently Hiring',
    emoji: isHiring ? '🟢' : '⏸️',
    className: isHiring ? 'badge-success' : 'badge-warning'
  };
};

/**
 * Get truncated description
 */
export const getTruncatedDescription = (description, maxLength = 150) => {
  if (!description) return '';
  
  if (description.length <= maxLength) {
    return description;
  }
  
  return description.substring(0, maxLength).trim() + '...';
};

/**
 * Format array list for display (with limit)
 */
export const formatArrayList = (array, limit = 3) => {
  if (!Array.isArray(array) || array.length === 0) {
    return { items: [], remaining: 0 };
  }
  
  const items = array.slice(0, limit);
  const remaining = Math.max(0, array.length - limit);
  
  return { items, remaining };
};

/**
 * Transform employer data for card display
 * Centralizes all formatting logic
 */
export const transformEmployerForDisplay = (employer) => {
  if (!employer) return null;
  
  const hiringStatus = getHiringStatusBadge(employer.is_actively_hiring);
  const jobTypes = formatArrayList(employer.job_types_available || [], 2);
  const recoveryFeatures = formatArrayList(employer.recovery_friendly_features || [], 3);
  
  return {
    // Original data
    original: employer,
    
    // Formatted basic info
    id: employer.id,
    userId: employer.user_id,
    companyName: formatCompanyName(employer),
    location: formatLocation(employer),
    industry: formatIndustry(employer.industry),
    businessType: formatBusinessType(employer.business_type),
    companySize: formatCompanySize(employer.company_size),
    
    // Hiring status
    isActivelyHiring: employer.is_actively_hiring || false,
    hiringStatus,
    
    // Job information
    jobTypes: {
      all: employer.job_types_available || [],
      display: jobTypes.items.map(formatJobType),
      remaining: jobTypes.remaining
    },
    
    // Recovery features
    recoveryFeatures: {
      all: employer.recovery_friendly_features || [],
      display: recoveryFeatures.items.map(formatRecoveryFeature),
      remaining: recoveryFeatures.remaining
    },
    
    // Additional info
    description: employer.description || '',
    truncatedDescription: getTruncatedDescription(employer.description, 150),
    remoteWorkPolicy: formatRemoteWorkPolicy(employer.remote_work_policy),
    foundedYear: employer.founded_year || null,
    website: employer.website || null,
    
    // Contact (only if available)
    contactName: employer.contact_name || null,
    contactEmail: employer.contact_email || null,
    contactPhone: employer.contact_phone || null,
    
    // Metadata
    isActive: employer.is_active !== false,
    createdAt: employer.created_at,
    updatedAt: employer.updated_at
  };
};

/**
 * Transform multiple employers for display
 */
export const transformEmployersForDisplay = (employers) => {
  if (!Array.isArray(employers)) {
    return [];
  }
  
  return employers
    .map(transformEmployerForDisplay)
    .filter(employer => employer !== null);
};

/**
 * Get employer stats for summary display
 */
export const getEmployerStats = (employers) => {
  if (!Array.isArray(employers) || employers.length === 0) {
    return {
      total: 0,
      activelyHiring: 0,
      industries: [],
      locations: []
    };
  }
  
  const activelyHiring = employers.filter(e => e.is_actively_hiring).length;
  
  // Get unique industries
  const industries = [...new Set(
    employers
      .map(e => e.industry)
      .filter(i => i)
  )];
  
  // Get unique locations
  const locations = [...new Set(
    employers
      .filter(e => e.city && e.state)
      .map(e => `${e.city}, ${e.state}`)
  )];
  
  return {
    total: employers.length,
    activelyHiring,
    notHiring: employers.length - activelyHiring,
    industries: industries.slice(0, 5),
    locations: locations.slice(0, 5),
    hasMultipleIndustries: industries.length > 1,
    hasMultipleLocations: locations.length > 1
  };
};

/**
 * Sort employers by various criteria
 */
export const sortEmployers = (employers, sortBy = 'updated') => {
  if (!Array.isArray(employers)) return [];
  
  const sorted = [...employers];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => {
        const nameA = (a.company_name || '').toLowerCase();
        const nameB = (b.company_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
    case 'hiring':
      return sorted.sort((a, b) => {
        // Actively hiring first
        if (a.is_actively_hiring && !b.is_actively_hiring) return -1;
        if (!a.is_actively_hiring && b.is_actively_hiring) return 1;
        return 0;
      });
      
    case 'location':
      return sorted.sort((a, b) => {
        const locA = formatLocation(a).toLowerCase();
        const locB = formatLocation(b).toLowerCase();
        return locA.localeCompare(locB);
      });
      
    case 'updated':
    default:
      return sorted.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA; // Most recent first
      });
  }
};

/**
 * Filter employers by criteria
 */
export const filterEmployers = (employers, filters = {}) => {
  if (!Array.isArray(employers)) return [];
  
  let filtered = [...employers];
  
  // Filter by hiring status
  if (filters.hiringOnly) {
    filtered = filtered.filter(e => e.is_actively_hiring);
  }
  
  // Filter by industry
  if (filters.industry) {
    filtered = filtered.filter(e => 
      e.industry?.toLowerCase() === filters.industry.toLowerCase()
    );
  }
  
  // Filter by location (city or state)
  if (filters.location) {
    const searchLoc = filters.location.toLowerCase();
    filtered = filtered.filter(e => {
      const location = formatLocation(e).toLowerCase();
      return location.includes(searchLoc);
    });
  }
  
  // Filter by job type
  if (filters.jobType) {
    filtered = filtered.filter(e => {
      const jobTypes = e.job_types_available || [];
      return jobTypes.some(jt => 
        jt.toLowerCase().includes(filters.jobType.toLowerCase())
      );
    });
  }
  
  return filtered;
};

/**
 * Search employers by keyword
 */
export const searchEmployers = (employers, searchTerm) => {
  if (!searchTerm || !Array.isArray(employers)) return employers;
  
  const term = searchTerm.toLowerCase().trim();
  
  return employers.filter(employer => {
    const searchableFields = [
      employer.company_name,
      employer.industry,
      employer.city,
      employer.state,
      employer.description,
      ...(employer.job_types_available || []),
      ...(employer.recovery_friendly_features || [])
    ];
    
    return searchableFields.some(field => 
      field && field.toLowerCase().includes(term)
    );
  });
};

export default {
  formatCompanyName,
  formatLocation,
  formatIndustry,
  formatBusinessType,
  formatCompanySize,
  formatRecoveryFeature,
  formatJobType,
  formatRemoteWorkPolicy,
  getHiringStatusBadge,
  getTruncatedDescription,
  formatArrayList,
  transformEmployerForDisplay,
  transformEmployersForDisplay,
  getEmployerStats,
  sortEmployers,
  filterEmployers,
  searchEmployers
};
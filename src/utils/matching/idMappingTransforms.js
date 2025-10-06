// src/utils/matching/idMappingTransforms.js - ID MAPPING UTILITIES

import { supabase } from '../supabase';

/**
 * CRITICAL ID MAPPING UTILITIES
 * 
 * Your app has a 3-tier ID system:
 * 1. auth_users.id (Supabase auth)
 * 2. registrant_profiles.id (your main profile) 
 * 3. role-specific profile IDs (applicant_matching_profiles.id, peer_support_profiles.id, etc.)
 * 
 * Database foreign keys and RLS policies expect specific ID types.
 * These utilities ensure consistent ID mapping across all operations.
 */

/**
 * Get all relevant IDs for a user across the 3-tier system
 * @param {string} authUserId - auth_users.id from useAuth()
 * @param {string} registrantProfileId - registrant_profiles.id from useAuth() 
 * @param {string[]} userRoles - User's roles array
 * @returns {Object} Complete ID mapping object
 */
export const getUserIdMapping = async (authUserId, registrantProfileId, userRoles = []) => {
  console.log('🔍 Getting complete ID mapping for user:', {
    authUserId,
    registrantProfileId,
    userRoles
  });

  const idMapping = {
    // Tier 1: Supabase Auth ID
    authUserId,
    
    // Tier 2: Your Main Profile ID  
    registrantProfileId,
    
    // Tier 3: Role-specific Profile IDs (what database foreign keys expect)
    applicantProfileId: null,
    peerSupportProfileId: null,
    landlordProfileId: null,
    employerProfileId: null
  };

  // Get applicant profile ID if user has applicant role
  if (userRoles.includes('applicant')) {
    try {
      console.log('🔍 Querying applicant_matching_profiles for registrant_profile_id:', registrantProfileId);
      
      const { data: applicantProfile, error: applicantError } = await supabase
        .from('applicant_matching_profiles')
        .select('id, user_id')
        .eq('user_id', registrantProfileId) // ✅ FIXED: Use registrant profile ID
        .single();
      
      if (applicantProfile && !applicantError) {
        idMapping.applicantProfileId = applicantProfile.id;
        console.log('✅ Found applicant profile ID:', applicantProfile.id);
      } else {
        console.log('⚠️ No applicant profile found for registrant:', registrantProfileId);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching applicant profile ID:', err);
    }
  }

  // Get peer support profile ID if user has peer-support role
  if (userRoles.includes('peer-support')) {
    try {
      console.log('🔍 Querying peer_support_profiles for registrant_profile_id:', registrantProfileId);
      
      const { data: peerProfile, error: peerError } = await supabase
        .from('peer_support_profiles')
        .select('id, user_id')
        .eq('user_id', registrantProfileId) // ✅ CORRECT: Use registrant profile ID
        .single();
      
      if (peerProfile && !peerError) {
        idMapping.peerSupportProfileId = peerProfile.id;
        console.log('✅ Found peer support profile ID:', peerProfile.id);
      } else {
        console.log('⚠️ No peer support profile found for registrant:', registrantProfileId);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching peer support profile ID:', err);
    }
  }

  // Get landlord profile ID if user has landlord role
  if (userRoles.includes('landlord')) {
    try {
      console.log('🔍 Querying landlord_profiles for registrant_profile_id:', registrantProfileId);
      
      const { data: landlordProfile, error: landlordError } = await supabase
        .from('landlord_profiles')
        .select('id, user_id')
        .eq('user_id', registrantProfileId)
        .single();
      
      if (landlordProfile && !landlordError) {
        idMapping.landlordProfileId = landlordProfile.id;
        console.log('✅ Found landlord profile ID:', landlordProfile.id);
      } else {
        console.log('⚠️ No landlord profile found for registrant:', registrantProfileId);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching landlord profile ID:', err);
    }
  }

  // Get employer profile ID if user has employer role
  if (userRoles.includes('employer')) {
    try {
      console.log('🔍 Querying employer_profiles for registrant_profile_id:', registrantProfileId);
      
      const { data: employerProfile, error: employerError } = await supabase
        .from('employer_profiles')
        .select('id, user_id')
        .eq('user_id', registrantProfileId)
        .single();
      
      if (employerProfile && !employerError) {
        idMapping.employerProfileId = employerProfile.id;
        console.log('✅ Found employer profile ID:', employerProfile.id);
      } else {
        console.log('⚠️ No employer profile found for registrant:', registrantProfileId);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching employer profile ID:', err);
    }
  }

  console.log('✅ Complete ID mapping:', idMapping);
  return idMapping;
};

/**
 * Get peer support specific IDs for peer_support_matches table
 * This ensures the correct foreign key IDs are used
 * @param {Object} idMapping - Complete ID mapping from getUserIdMapping()
 * @returns {Object} Peer support specific IDs
 */
export const getPeerSupportMatchingIds = (idMapping) => {
  return {
    // For peer_support_matches.applicant_id (FK to applicant_matching_profiles.id)
    applicantId: idMapping.applicantProfileId,
    
    // For peer_support_matches.peer_support_id (FK to peer_support_profiles.id)  
    peerSupportId: idMapping.peerSupportProfileId,
    
    // For RLS policy validation
    authUserId: idMapping.authUserId,
    registrantProfileId: idMapping.registrantProfileId
  };
};

/**
 * Create peer support match record with correct ID mapping
 * @param {Object} matchData - Match creation data
 * @param {Object} idMapping - Complete ID mapping
 * @returns {Object} Database operation result
 */
export const createPeerSupportMatch = async (matchData, idMapping) => {
  const peerIds = getPeerSupportMatchingIds(idMapping);
  
  console.log('🔄 Creating peer support match with IDs:', peerIds);
  
  // Validate required IDs are available
  if (!peerIds.applicantId) {
    return {
      success: false,
      error: 'Applicant profile ID not found. User may not have applicant role or profile.'
    };
  }
  
  if (!peerIds.peerSupportId) {
    return {
      success: false,
      error: 'Peer support profile ID not found. User may not have peer-support role or profile.'
    };
  }

  try {
    // Create the peer_support_matches record with correct foreign key IDs
    const { data, error } = await supabase
      .from('peer_support_matches')
      .insert({
        applicant_id: peerIds.applicantId, // FK to applicant_matching_profiles.id
        peer_support_id: peerIds.peerSupportId, // FK to peer_support_profiles.id
        status: matchData.status || 'pending',
        match_score: matchData.match_score,
        compatibility_factors: matchData.compatibility_factors || {},
        created_by: peerIds.authUserId, // Who created this match
        notes: matchData.notes,
        ...matchData // Any additional fields
      })
      .select()
      .single();

    if (error) {
      console.error('💥 Error creating peer support match:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('✅ Successfully created peer support match:', data);
    return {
      success: true,
      data,
      idMapping: peerIds
    };

  } catch (err) {
    console.error('💥 Exception creating peer support match:', err);
    return {
      success: false,
      error: err.message,
      details: err
    };
  }
};

/**
 * Validate that user has permission to create peer support match
 * @param {Object} idMapping - Complete ID mapping
 * @param {string} targetApplicantId - applicant_matching_profiles.id to match with
 * @returns {Object} Validation result
 */
export const validatePeerSupportMatchPermissions = (idMapping, targetApplicantId) => {
  const validation = {
    canCreate: false,
    errors: [],
    warnings: []
  };

  // Check if user has peer support profile (required to create matches)
  if (!idMapping.peerSupportProfileId) {
    validation.errors.push('User does not have peer support profile');
  }

  // Check if target applicant ID is provided
  if (!targetApplicantId) {
    validation.errors.push('Target applicant ID is required');
  }

  // Check if user is trying to match with themselves (if they're also an applicant)
  if (idMapping.applicantProfileId === targetApplicantId) {
    validation.errors.push('Cannot create peer support match with yourself');
  }

  // Success if no errors
  validation.canCreate = validation.errors.length === 0;

  return validation;
};

/**
 * Transform match request data to peer support match data
 * Bridges the gap between match_requests and peer_support_matches tables
 * @param {Object} matchRequest - Data from match_requests table
 * @param {Object} idMapping - Complete ID mapping
 * @returns {Object} Transformed data for peer_support_matches
 */
export const transformMatchRequestToPeerSupportMatch = (matchRequest, idMapping) => {
  return {
    status: matchRequest.status === 'accepted' ? 'active' : 'pending',
    match_score: calculateBasicMatchScore(matchRequest),
    compatibility_factors: {
      request_message: matchRequest.message,
      request_type: matchRequest.request_type,
      match_source: 'match_request',
      original_request_id: matchRequest.id
    },
    notes: `Created from match request ${matchRequest.id}`,
    created_by: idMapping.authUserId
  };
};

/**
 * Calculate basic match score from request data
 * @param {Object} matchRequest - Match request data
 * @returns {number} Basic match score
 */
const calculateBasicMatchScore = (matchRequest) => {
  // Start with base score
  let score = 75;
  
  // Bonus for having a message
  if (matchRequest.message && matchRequest.message.length > 10) {
    score += 10;
  }
  
  // Bonus for specific request types
  if (matchRequest.request_type === 'peer-support') {
    score += 5;
  }
  
  return Math.min(100, score);
};

/**
 * Get role-specific profile ID for any role
 * @param {string} role - Role name ('applicant', 'peer-support', 'landlord', 'employer')
 * @param {Object} idMapping - Complete ID mapping
 * @returns {string|null} Role-specific profile ID
 */
export const getRoleSpecificProfileId = (role, idMapping) => {
  const roleMapping = {
    'applicant': idMapping.applicantProfileId,
    'peer-support': idMapping.peerSupportProfileId,
    'landlord': idMapping.landlordProfileId,
    'employer': idMapping.employerProfileId
  };
  
  return roleMapping[role] || null;
};

/**
 * Validate ID mapping completeness for specific operations
 * @param {Object} idMapping - Complete ID mapping
 * @param {string[]} requiredRoles - Roles required for the operation
 * @returns {Object} Validation result
 */
export const validateIdMappingCompleteness = (idMapping, requiredRoles) => {
  const validation = {
    isComplete: false,
    missingIds: [],
    errors: []
  };

  // Check required tier 1 and 2 IDs
  if (!idMapping.authUserId) {
    validation.errors.push('Auth user ID missing');
  }
  
  if (!idMapping.registrantProfileId) {
    validation.errors.push('Registrant profile ID missing');
  }

  // Check role-specific IDs
  for (const role of requiredRoles) {
    const roleId = getRoleSpecificProfileId(role, idMapping);
    if (!roleId) {
      validation.missingIds.push(role);
    }
  }

  if (validation.missingIds.length > 0) {
    validation.errors.push(`Missing profile IDs for roles: ${validation.missingIds.join(', ')}`);
  }

  validation.isComplete = validation.errors.length === 0;
  return validation;
};

/**
 * Debug helper to log ID mapping state
 * @param {Object} idMapping - Complete ID mapping
 * @param {string} operation - Operation being performed
 */
export const debugIdMapping = (idMapping, operation = 'unknown') => {
  console.group(`🔍 ID Mapping Debug - ${operation}`);
  console.log('Auth User ID:', idMapping.authUserId);
  console.log('Registrant Profile ID:', idMapping.registrantProfileId);
  console.log('Applicant Profile ID:', idMapping.applicantProfileId);
  console.log('Peer Support Profile ID:', idMapping.peerSupportProfileId);
  console.log('Landlord Profile ID:', idMapping.landlordProfileId);
  console.log('Employer Profile ID:', idMapping.employerProfileId);
  
  const availableRoles = [];
  if (idMapping.applicantProfileId) availableRoles.push('applicant');
  if (idMapping.peerSupportProfileId) availableRoles.push('peer-support');
  if (idMapping.landlordProfileId) availableRoles.push('landlord');
  if (idMapping.employerProfileId) availableRoles.push('employer');
  
  console.log('Available Role Profiles:', availableRoles);
  console.groupEnd();
};

export default {
  getUserIdMapping,
  getPeerSupportMatchingIds,
  createPeerSupportMatch,
  validatePeerSupportMatchPermissions,
  transformMatchRequestToPeerSupportMatch,
  getRoleSpecificProfileId,
  validateIdMappingCompleteness,
  debugIdMapping
};
// src/utils/supabase.js - Updated for Refactored Schema with Properties Table + Peer Support
import { createClient } from '@supabase/supabase-js'

// Import service modules (core services that we've verified)
import createAuthService from './database/authService'
import createProfilesService from './database/profileService'
import createMatchingProfilesService from './database/matchingProfilesService'
import createMatchRequestsService from './database/matchRequestsService'
import createMatchGroupsService from './database/matchGroupsService'

// ✅ NEW: Import properties service (critical for refactored schema)
import createPropertiesService from './database/propertiesService'

// ✅ ADDED: Import peer support service
import createPeerSupportService from './database/peerSupportService'

// TODO: Import remaining role-specific services as we verify alignment
// import createLandlordProfilesService from './database/landlordProfilesService'
// import createEmployerService from './database/employerService'
// import createCommunicationService from './database/communicationService'

console.log('🔧 Supabase client initializing...')

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('💥 Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

console.log('✅ Supabase client created')

// Initialize core services
const authService = createAuthService(supabase)
const profilesService = createProfilesService(supabase)
const matchingProfilesService = createMatchingProfilesService(supabase)
const matchRequestsService = createMatchRequestsService(supabase)
const matchGroupsService = createMatchGroupsService(supabase)
const propertiesService = createPropertiesService(supabase) // ✅ NEW: Critical service

// ✅ ADDED: Initialize peer support service
const peerSupportService = createPeerSupportService(supabase)

// Authentication helpers
export const auth = {
  signUp: authService.signUp,
  signIn: authService.signIn,
  signOut: authService.signOut,
  getSession: authService.getSession,
  getUser: authService.getUser,
  onAuthStateChange: authService.onAuthStateChange,
  updateUser: authService.updateUser,
  resetPassword: authService.resetPassword,
  isAuthenticated: authService.isAuthenticated,
  getAuthStatus: authService.getAuthStatus
}

// ✅ UPDATED: Database helpers organized by refactored schema structure
export const db = {
  // ============================================================================
  // CORE PROFILES - Central hub for role selection (registrant_profiles table)
  // Flow: auth.users.id → registrant_profiles.user_id → registrant_profiles.id
  // ============================================================================
  registrantProfiles: {
    create: profilesService.create,
    getById: profilesService.getById,
    getByUserId: profilesService.getByUserId,
    update: profilesService.update,
    updateByUserId: profilesService.updateByUserId,
    delete: profilesService.delete,
    getByRole: profilesService.getByRole,
    search: profilesService.search,
    getStatistics: profilesService.getStatistics,
    emailExists: profilesService.emailExists
  },

  // ============================================================================
  // APPLICANT MATCHING PROFILES (applicant_matching_profiles table)
  // Flow: registrant_profiles.id → applicant_matching_profiles.user_id → applicant_matching_profiles.id
  // ============================================================================
  matchingProfiles: {
    // Core CRUD operations
    create: matchingProfilesService.create,
    getByUserId: matchingProfilesService.getByUserId,
    getById: matchingProfilesService.getById,
    update: matchingProfilesService.update,
    upsert: matchingProfilesService.upsert,
    delete: matchingProfilesService.delete,

    // Query operations
    getActiveProfiles: matchingProfilesService.getActiveProfiles,
    getByLocation: matchingProfilesService.getByLocation,
    getByRecoveryStage: matchingProfilesService.getByRecoveryStage,
    searchProfiles: matchingProfilesService.searchProfiles,

    // Utility methods
    calculateCompletionPercentage: matchingProfilesService.calculateCompletionPercentage,
    calculateQualityScore: matchingProfilesService.calculateQualityScore,
    isProfileCompleted: matchingProfilesService.isProfileCompleted,
    getStatistics: matchingProfilesService.getStatistics
  },

  // ============================================================================
  // ✅ NEW: PROPERTIES - Individual property listings (properties table)
  // Flow: landlord_profiles.id → properties.landlord_id → properties.id
  // ============================================================================
  properties: {
    // Core CRUD operations
    create: propertiesService.create,
    getById: propertiesService.getById,
    getByLandlordId: propertiesService.getByLandlordId,
    update: propertiesService.update,
    delete: propertiesService.delete,

    // Property search and filtering
    getAvailable: propertiesService.getAvailable,
    getRecoveryHousing: propertiesService.getRecoveryHousing,
    getGeneralRentals: propertiesService.getGeneralRentals,
    searchByLocation: propertiesService.searchByLocation,
    getByPriceRange: propertiesService.getByPriceRange,
    getMatchingProperties: propertiesService.getMatchingProperties,

    // Property management
    updateStatus: propertiesService.updateStatus,
    updateAvailableBeds: propertiesService.updateAvailableBeds,
    toggleAcceptingApplications: propertiesService.toggleAcceptingApplications,

    // Analytics and bulk operations
    getStatistics: propertiesService.getStatistics,
    bulkUpdate: propertiesService.bulkUpdate
  },

  // ============================================================================
  // ✅ ADDED: PEER SUPPORT PROFILES (peer_support_profiles table)
  // Flow: registrant_profiles.id → peer_support_profiles.user_id → peer_support_profiles.id
  // ============================================================================
  peerSupportProfiles: {
    // Core CRUD operations
    create: peerSupportService.create,
    getByUserId: peerSupportService.getByUserId,
    getById: peerSupportService.getById,
    update: peerSupportService.update,
    delete: peerSupportService.delete,

    // Peer support search and filtering
    getAvailable: peerSupportService.getAvailable,
    search: peerSupportService.search,
    getBySpecialty: peerSupportService.getBySpecialty,
    getByServiceArea: peerSupportService.getByServiceArea,

    // Peer support management
    updateAvailability: peerSupportService.updateAvailability,

    // Analytics and bulk operations
    getStatistics: peerSupportService.getStatistics,
    bulkUpdate: peerSupportService.bulkUpdate
  },

  // ============================================================================
  // MATCH REQUESTS - Connection requests between users
  // ✅ UPDATED: Now supports property-specific requests
  // Uses role-specific IDs + property_id for housing requests
  // ============================================================================
  matchRequests: {
    create: matchRequestsService.create,
    getByUserId: matchRequestsService.getByUserId,
    getSentRequests: matchRequestsService.getSentRequests,
    getReceivedRequests: matchRequestsService.getReceivedRequests,
    update: matchRequestsService.update,
    approve: matchRequestsService.approve,
    reject: matchRequestsService.reject,
    cancel: matchRequestsService.cancel,
    getExistingRequest: matchRequestsService.getExistingRequest,
    getPendingCount: matchRequestsService.getPendingCount,
    getStatistics: matchRequestsService.getStatistics,
    delete: matchRequestsService.delete
  },

  // ============================================================================
  // MATCH GROUPS - Complete housing solutions 
  // ✅ UPDATED: Now references properties.id instead of landlord_profiles.id
  // Uses applicant_matching_profiles.id + properties.id + peer_support_profiles.id
  // ============================================================================
  matchGroups: {
    create: matchGroupsService.create,
    getByUserId: matchGroupsService.getByUserId,
    getById: matchGroupsService.getById,
    update: matchGroupsService.update,
    delete: matchGroupsService.delete,
    endGroup: matchGroupsService.endGroup,
    completeGroup: matchGroupsService.completeGroup,
    getConnectionSummary: matchGroupsService.getConnectionSummary,
    getStatistics: matchGroupsService.getStatistics
  }

  // ============================================================================
  // TODO: Add remaining role-specific services as we verify alignment:
  // - landlordProfiles (simplified landlord_profiles table - business info only)
  // - employerProfiles (employer_profiles table) 
  // - housingMatches (applicant_matching_profiles.id + properties.id)
  // - employmentMatches, peerSupportMatches
  // - favorites system (enhanced to support property favorites)
  // ============================================================================
}

// ✅ ADDED: Legacy support for any remaining imports
export const getPeerSupportProfileByUserId = async (userId, supabaseClient = null) => {
  console.log('⚠️ Using legacy getPeerSupportProfileByUserId - consider updating to db.peerSupportProfiles.getByUserId()');
  const client = supabaseClient || supabase;
  const service = createPeerSupportService(client);
  return await service.getByUserId(userId);
};

// ✅ ADDED: Additional legacy exports for different import patterns
export { getPeerSupportProfileByUserId as getPeerSupportProfile };
export { getPeerSupportProfileByUserId as fetchPeerSupportProfile };

// ✅ UPDATED: Schema information reflecting refactored structure + peer support
export const getSchemaInfo = () => {
  return {
    schemaVersion: '2.1-refactored-with-peer-support',
    idFlow: 'auth.users.id → registrant_profiles.user_id → registrant_profiles.id → role_table.user_id → role_table.id',
    coreArchitecture: {
      userAuth: 'auth.users (managed by Supabase)',
      centralHub: 'registrant_profiles (role selection & multi-role support)', 
      roleProfiles: {
        applicants: 'applicant_matching_profiles',
        landlords: 'landlord_profiles (business info only)',
        properties: 'properties (property-specific data)', // ✅ NEW
        employers: 'employer_profiles',
        peerSupport: 'peer_support_profiles' // ✅ ADDED
      }
    },
    relationshipTables: {
      housingMatches: 'Uses applicant_matching_profiles.id + properties.id', // ✅ UPDATED
      employmentMatches: 'Uses applicant_matching_profiles.id + employer_profiles.id',
      peerSupportMatches: 'Uses applicant_matching_profiles.id + peer_support_profiles.id', // ✅ ADDED
      matchGroups: 'Uses applicant_matching_profiles.id + properties.id + peer_support_profiles.id', // ✅ UPDATED
      matchRequests: 'Enhanced with property_id for housing-specific requests', // ✅ UPDATED
      favorites: 'Supports both profile favorites and property favorites' // ✅ NEW
    },
    keyChanges: {
      propertiesTable: 'Separated property data from landlord_profiles for multi-property support',
      updatedReferences: 'Housing matches/groups now reference properties.id instead of landlord_profiles.id',
      enhancedRequests: 'Match requests support property-specific housing requests',
      propertyTypes: 'Supports both general rentals and recovery housing with different field sets',
      peerSupportService: 'Full peer support service integration with correct field mappings' // ✅ ADDED
    }
  }
}

console.log('✅ Supabase module loaded with refactored schema structure + peer support')
console.log('📋 Schema Info:', getSchemaInfo())

export default supabase
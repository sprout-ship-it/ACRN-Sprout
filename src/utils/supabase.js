// src/utils/supabase.js - Updated for Refactored Schema with Properties Table + Peer Support + Employer Service
import { createClient } from '@supabase/supabase-js'

// Import service modules (core services that we've verified)
import createAuthService from './database/authService'
import createProfilesService from './database/profileService'
import createMatchingProfilesService from './database/matchingProfilesService'
import createMatchGroupsService from './database/matchGroupsService'
import createPSSClientsService from './database/pssClients'

// ✅ NEW: Import properties service (critical for refactored schema)
import createPropertiesService from './database/propertiesService'

// ✅ FIXED: Import peer support service with better error handling
import createPeerSupportService from './database/peerSupportService'

// ✅ ADDED: Import employer service for employment connections
import createEmployerService from './database/employerService'

// TODO: Import remaining role-specific services as we verify alignment
// import createLandlordProfilesService from './database/landlordProfilesService'

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

// ✅ FIXED: Initialize services with proper error handling
let authService, profilesService, matchingProfilesService, matchGroupsService, propertiesService, peerSupportService, pssClientsService, employerService;

try {
  // Initialize core services
  authService = createAuthService(supabase)
  profilesService = createProfilesService(supabase)
  matchingProfilesService = createMatchingProfilesService(supabase)
  matchGroupsService = createMatchGroupsService(supabase)
  propertiesService = createPropertiesService(supabase)
  
  // ✅ FIXED: Initialize peer support service with error handling
  console.log('🤝 Initializing peer support service...')
  peerSupportService = createPeerSupportService(supabase)
  
  if (!peerSupportService) {
    throw new Error('Peer support service initialization returned null/undefined')
  }
  
  // Verify the service has required methods
  const requiredMethods = ['create', 'getByUserId', 'update', 'delete', 'getAvailable']
  const missingMethods = requiredMethods.filter(method => typeof peerSupportService[method] !== 'function')
  
  if (missingMethods.length > 0) {
    throw new Error(`Peer support service missing methods: ${missingMethods.join(', ')}`)
  }
  
  console.log('✅ Peer support service initialized successfully')

  // ✅ NEW: Initialize PSS clients service
  console.log('👥 Initializing PSS clients service...')
  pssClientsService = createPSSClientsService(supabase)

  if (!pssClientsService) {
    throw new Error('PSS clients service initialization returned null/undefined')
  }

  const requiredPSSMethods = ['create', 'getByPeerSpecialistId', 'update', 'getById']
  const missingPSSMethods = requiredPSSMethods.filter(method => typeof pssClientsService[method] !== 'function')

  if (missingPSSMethods.length > 0) {
    throw new Error(`PSS clients service missing methods: ${missingPSSMethods.join(', ')}`)
  }

  console.log('✅ PSS clients service initialized successfully')

  // ✅ NEW: Initialize employer service
  console.log('💼 Initializing employer service...')
  employerService = createEmployerService(supabase)
  
  if (!employerService) {
    throw new Error('Employer service initialization returned null/undefined')
  }
  
  // Verify the service has required methods
  const requiredEmployerMethods = ['profiles', 'favorites']
  const missingEmployerMethods = requiredEmployerMethods.filter(method => !employerService[method])
  
  if (missingEmployerMethods.length > 0) {
    throw new Error(`Employer service missing sections: ${missingEmployerMethods.join(', ')}`)
  }
  
  // Verify profiles service methods
  const requiredProfilesMethods = ['create', 'getByUserId', 'update', 'delete', 'getAvailable']
  const missingProfilesMethods = requiredProfilesMethods.filter(method => typeof employerService.profiles[method] !== 'function')
  
  if (missingProfilesMethods.length > 0) {
    throw new Error(`Employer profiles service missing methods: ${missingProfilesMethods.join(', ')}`)
  }
  
  console.log('✅ Employer service initialized successfully')

} catch (error) {
  console.error('💥 Error initializing services:', error)
  
  // ✅ FIXED: Create fallback service to prevent undefined errors
  if (!peerSupportService) {
    console.warn('⚠️ Creating fallback peer support service')
    peerSupportService = {
      create: async () => ({ success: false, error: { message: 'Peer support service not available' } }),
      getByUserId: async () => ({ success: false, error: { message: 'Peer support service not available' } }),
      getById: async () => ({ success: false, error: { message: 'Peer support service not available' } }),
      update: async () => ({ success: false, error: { message: 'Peer support service not available' } }),
      delete: async () => ({ success: false, error: { message: 'Peer support service not available' } }),
      getAvailable: async () => ({ success: false, data: [], error: { message: 'Peer support service not available' } }),
      search: async () => ({ success: false, data: [], error: { message: 'Peer support service not available' } }),
      getBySpecialty: async () => ({ success: false, data: [], error: { message: 'Peer support service not available' } }),
      getByServiceArea: async () => ({ success: false, data: [], error: { message: 'Peer support service not available' } }),
      updateAvailability: async () => ({ success: false, error: { message: 'Peer support service not available' } }),
      getStatistics: async () => ({ success: false, error: { message: 'Peer support service not available' } }),
      bulkUpdate: async () => ({ success: false, error: { message: 'Peer support service not available' } })
    }
  }

  // ✅ NEW: Create fallback PSS clients service
  if (!pssClientsService) {
    console.warn('⚠️ Creating fallback PSS clients service')
    pssClientsService = {
      create: async () => ({ success: false, error: { message: 'PSS clients service not available' } }),
      getByPeerSpecialistId: async () => ({ success: false, data: [], error: { message: 'PSS clients service not available' } }),
      getById: async () => ({ success: false, error: { message: 'PSS clients service not available' } }),
      update: async () => ({ success: false, error: { message: 'PSS clients service not available' } }),
      getByClientId: async () => ({ success: false, data: [], error: { message: 'PSS clients service not available' } }),
      updateStatus: async () => ({ success: false, error: { message: 'PSS clients service not available' } }),
      addMessage: async () => ({ success: false, error: { message: 'PSS clients service not available' } }),
      getActiveClients: async () => ({ success: false, data: [], error: { message: 'PSS clients service not available' } }),
      getGroupsWithPeerSupport: async () => ({ success: false, data: [], error: { message: 'PSS clients service not available' } }),
      getClientStats: async () => ({ success: false, error: { message: 'PSS clients service not available' } })
    }
  }

  // ✅ NEW: Create fallback employer service
  if (!employerService) {
    console.warn('⚠️ Creating fallback employer service')
    employerService = {
      profiles: {
        create: async () => ({ success: false, error: { message: 'Employer service not available' } }),
        getByUserId: async () => ({ success: false, data: [], error: { message: 'Employer service not available' } }),
        getById: async () => ({ success: false, error: { message: 'Employer service not available' } }),
        update: async () => ({ success: false, error: { message: 'Employer service not available' } }),
        delete: async () => ({ success: false, error: { message: 'Employer service not available' } }),
        getAvailable: async () => ({ success: false, data: [], error: { message: 'Employer service not available' } }),
        search: async () => ({ success: false, data: [], error: { message: 'Employer service not available' } }),
        getStatistics: async () => ({ success: false, error: { message: 'Employer service not available' } })
      },
      favorites: {
        getByUserId: async () => ({ success: false, data: [], error: { message: 'Employer favorites service not available' } }),
        add: async () => ({ success: false, error: { message: 'Employer favorites service not available' } }),
        remove: async () => ({ success: false, error: { message: 'Employer favorites service not available' } }),
        toggle: async () => ({ success: false, error: { message: 'Employer favorites service not available' } }),
        isFavorited: async () => ({ success: false, data: false, error: { message: 'Employer favorites service not available' } })
      }
    }
  }
}

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

// ✅ FIXED: Database helpers with guaranteed services including employer
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
  // ✅ FIXED: PEER SUPPORT PROFILES (peer_support_profiles table)
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
  // ✅ NEW: EMPLOYER PROFILES (employer_profiles table)
  // Flow: registrant_profiles.id → employer_profiles.user_id → employer_profiles.id
  // ============================================================================
  employerProfiles: {
    // Core CRUD operations
    create: employerService.profiles.create,
    getByUserId: employerService.profiles.getByUserId,
    getById: employerService.profiles.getById,
    update: employerService.profiles.update,
    delete: employerService.profiles.delete,

    // Employer search and filtering
    getAvailable: employerService.profiles.getAvailable,
    search: employerService.profiles.search,

    // Analytics
    getStatistics: employerService.profiles.getStatistics,

    // Favorites functionality
    favorites: {
      getByUserId: employerService.favorites.getByUserId,
      add: employerService.favorites.add,
      remove: employerService.favorites.remove,
      toggle: employerService.favorites.toggle,
      isFavorited: employerService.favorites.isFavorited
    }
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
  },

  // ============================================================================
  // ✅ NEW: PSS CLIENTS - Peer Support Specialist client management (pss_clients table)
  // Flow: peer_support_profiles.id → pss_clients.peer_specialist_id, applicant_matching_profiles.id → pss_clients.client_id
  // ============================================================================
  pssClients: {
    // Core CRUD operations
    create: pssClientsService.create,
    getByPeerSpecialistId: pssClientsService.getByPeerSpecialistId,
    getById: pssClientsService.getById,
    update: pssClientsService.update,

    // Client-focused operations
    getByClientId: pssClientsService.getByClientId,
    updateStatus: pssClientsService.updateStatus,
    addMessage: pssClientsService.addMessage,
    getActiveClients: pssClientsService.getActiveClients,

    // Integration with match groups
    getGroupsWithPeerSupport: pssClientsService.getGroupsWithPeerSupport,

    // Analytics
    getClientStats: pssClientsService.getClientStats
  }

  // ============================================================================
  // TODO: Add remaining role-specific services as we verify alignment:
  // - landlordProfiles (simplified landlord_profiles table - business info only)
  // - housingMatches (applicant_matching_profiles.id + properties.id)
  // - employmentMatches, peerSupportMatches
  // - favorites system (enhanced to support property favorites)
  // ============================================================================
}

// ✅ FIXED: Enhanced legacy support with error handling
export const getPeerSupportProfileByUserId = async (userId, supabaseClient = null) => {
  console.log('⚠️ Using legacy getPeerSupportProfileByUserId - consider updating to db.peerSupportProfiles.getByUserId()');
  
  try {
    if (db.peerSupportProfiles && typeof db.peerSupportProfiles.getByUserId === 'function') {
      return await db.peerSupportProfiles.getByUserId(userId);
    } else {
      // Fallback to direct service creation
      const client = supabaseClient || supabase;
      const service = createPeerSupportService(client);
      return await service.getByUserId(userId);
    }
  } catch (error) {
    console.error('❌ Legacy peer support function error:', error);
    return { success: false, data: null, error: { message: error.message } };
  }
};

// ✅ ADDED: Additional legacy exports for different import patterns
export { getPeerSupportProfileByUserId as getPeerSupportProfile };
export { getPeerSupportProfileByUserId as fetchPeerSupportProfile };

// ✅ NEW: Legacy employer profile exports
export const getEmployerProfilesByUserId = async (userId, supabaseClient = null) => {
  console.log('⚠️ Using legacy getEmployerProfilesByUserId - consider updating to db.employerProfiles.getByUserId()');
  
  try {
    if (db.employerProfiles && typeof db.employerProfiles.getByUserId === 'function') {
      return await db.employerProfiles.getByUserId(userId);
    } else {
      // Fallback to direct service creation
      const client = supabaseClient || supabase;
      const service = createEmployerService(client);
      return await service.profiles.getByUserId(userId);
    }
  } catch (error) {
    console.error('❌ Legacy employer function error:', error);
    return { success: false, data: [], error: { message: error.message } };
  }
};

// ✅ UPDATED: Schema information reflecting refactored structure + peer support + employer
export const getSchemaInfo = () => {
  return {
    schemaVersion: '2.2-refactored-with-all-services',
    idFlow: 'auth.users.id → registrant_profiles.user_id → registrant_profiles.id → role_table.user_id → role_table.id',
    coreArchitecture: {
      userAuth: 'auth.users (managed by Supabase)',
      centralHub: 'registrant_profiles (role selection & multi-role support)', 
      roleProfiles: {
        applicants: 'applicant_matching_profiles',
        landlords: 'landlord_profiles (business info only)',
        properties: 'properties (property-specific data)',
        employers: 'employer_profiles',
        peerSupport: 'peer_support_profiles'
      }
    },
    relationshipTables: {
      housingMatches: 'Uses applicant_matching_profiles.id + properties.id',
      employmentMatches: 'Uses applicant_matching_profiles.id + employer_profiles.id',
      peerSupportMatches: 'Uses applicant_matching_profiles.id + peer_support_profiles.id',
      matchGroups: 'Uses applicant_matching_profiles.id + properties.id + peer_support_profiles.id',
      matchRequests: 'Enhanced with property_id for housing-specific requests',
      favorites: 'Supports both profile favorites and property favorites'
    },
    keyChanges: {
      propertiesTable: 'Separated property data from landlord_profiles for multi-property support',
      updatedReferences: 'Housing matches/groups now reference properties.id instead of landlord_profiles.id',
      enhancedRequests: 'Match requests support property-specific housing requests',
      propertyTypes: 'Supports both general rentals and recovery housing with different field sets',
      peerSupportService: 'Full peer support service integration with error handling and fallbacks',
      employerService: 'Full employer service integration with profiles and favorites support'
    },
    serviceStatus: {
      peerSupportInitialized: !!peerSupportService,
      employerInitialized: !!employerService,
      peerSupportMethods: peerSupportService ? Object.keys(peerSupportService).length : 0,
      employerMethods: employerService ? Object.keys(employerService).length : 0,
      dbExportValid: !!(db && db.peerSupportProfiles && db.employerProfiles)
    }
  }
}

console.log('✅ Supabase module loaded with refactored schema structure + peer support + employer service')
console.log('📋 Schema Info:', getSchemaInfo())

// ✅ ADDED: Debug export for troubleshooting
export const debugInfo = {
  supabaseClientCreated: !!supabase,
  servicesInitialized: {
    auth: !!authService,
    profiles: !!profilesService,
    matching: !!matchingProfilesService,
    groups: !!matchGroupsService,
    properties: !!propertiesService,
    peerSupport: !!peerSupportService,
    employer: !!employerService
  },
  dbExportStructure: {
    hasRegistrantProfiles: !!(db && db.registrantProfiles),
    hasMatchingProfiles: !!(db && db.matchingProfiles),
    hasProperties: !!(db && db.properties),
    hasPeerSupportProfiles: !!(db && db.peerSupportProfiles),
    hasEmployerProfiles: !!(db && db.employerProfiles),
    hasMatchRequests: !!(db && db.matchRequests),
    hasMatchGroups: !!(db && db.matchGroups)
  }
}

export default supabase
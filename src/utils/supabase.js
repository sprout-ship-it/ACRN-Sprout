// src/utils/supabase.js - REFACTORED VERSION
import { createClient } from '@supabase/supabase-js'

// Import all service modules
import createAuthService from './database/authService'
import createProfilesService from './database/profileService'
import createMatchRequestsService from './database/matchRequestsService'
import createPropertiesService from './database/propertiesService'
import createEmployerService from './database/employerService'
import createPeerSupportService from './database/peerSupportService'
import createMatchGroupsService from './database/matchGroupsService'
import createCommunicationService from './database/communicationService'
import MatchingProfilesService from './database/matchingProfilesService'
import pssClientsService from './database/pssClients'

console.log('🔧 Supabase client initializing...')

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('💥 Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client with simplified config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

console.log('✅ Supabase client created')

// Initialize all services
const authService = createAuthService(supabase)
const profilesService = createProfilesService(supabase)
const matchRequestsService = createMatchRequestsService(supabase)
const propertiesService = createPropertiesService(supabase)
const employerService = createEmployerService(supabase)
const peerSupportService = createPeerSupportService(supabase)
const matchGroupsService = createMatchGroupsService(supabase)
const communicationService = createCommunicationService(supabase)

// Simplified auth helpers (wrapper around authService)
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

// Database helpers - organized by service
export const db = {
  // Profile operations (registrant_profiles table)
  profiles: {
    create: profilesService.create,
    getById: profilesService.getById,
    update: profilesService.update,
    delete: profilesService.delete,
    getByRole: profilesService.getByRole,
    search: profilesService.search,
    getStatistics: profilesService.getStatistics,
    batchUpdate: profilesService.batchUpdate,
    emailExists: profilesService.emailExists
  },

  // Backward compatibility alias
  registrantProfiles: {
    getById: profilesService.getById,
    create: profilesService.create,
    update: profilesService.update
  },

  // Applicant forms operations (using legacy structure for compatibility)
  applicantForms: {
    create: async (profileData) => {
      console.log('📊 DB: applicantForms.create called', { userId: profileData.user_id })
      try {
        const { data, error } = await supabase
          .from('applicant_forms')
          .insert(profileData)
          .select()
        console.log('📊 DB: applicantForms.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.create failed', err)
        return { data: null, error: err }
      }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: applicantForms.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('applicant_forms')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        console.log('📊 DB: applicantForms.getByUserId result', { 
          hasData: !!data, 
          hasError: !!error 
        })

        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.getByUserId failed', err)
        return { data: null, error: err }
      }
    },

    getActiveProfiles: async (excludeUserId = null) => {
      console.log('📊 DB: applicantForms.getActiveProfiles called', { excludeUserId })
      try {
        let query = supabase
          .from('applicant_forms')
          .select(`
            *,
            registrant_profiles!inner(id, first_name, email)
          `)
          .eq('is_active', true)

        if (excludeUserId) {
          query = query.neq('user_id', excludeUserId)
        }

        const { data, error } = await query
        console.log('📊 DB: applicantForms.getActiveProfiles result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.getActiveProfiles failed', err)
        return { data: [], error: err }
      }
    },

    update: async (userId, updates) => {
      console.log('📊 DB: applicantForms.update called', { userId })
      try {
        const { data, error } = await supabase
          .from('applicant_forms')
          .update(updates)
          .eq('user_id', userId)
          .select()
        console.log('📊 DB: applicantForms.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.update failed', err)
        return { data: null, error: err }
      }
    }
  },

// Create service instance with supabase client
matchingProfiles: new MatchingProfilesService(supabase),

  // Match request operations
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
    delete: matchRequestsService.delete,
    cleanupOldRequests: matchRequestsService.cleanupOldRequests
  },

  // Property operations
  properties: {
    create: propertiesService.create,
    getByLandlordId: propertiesService.getByLandlordId,
    getAvailable: propertiesService.getAvailable,
    getById: propertiesService.getById,
    update: propertiesService.update,
    delete: propertiesService.delete,
    updateStatus: propertiesService.updateStatus,
    searchByLocation: propertiesService.searchByLocation,
    getStatistics: propertiesService.getStatistics,
    bulkUpdate: propertiesService.bulkUpdate,
    getByPriceRange: propertiesService.getByPriceRange
  },

  // Employer operations
  employerProfiles: {
    create: employerService.profiles.create,
    getByUserId: employerService.profiles.getByUserId,
    update: employerService.profiles.update,
    delete: employerService.profiles.delete,
    getAvailable: employerService.profiles.getAvailable,
    search: employerService.profiles.search,
    getStatistics: employerService.profiles.getStatistics
  },

  // Employer favorites operations
  employerFavorites: {
    getByUserId: employerService.favorites.getByUserId,
    add: employerService.favorites.add,
    remove: employerService.favorites.remove,
    isFavorited: employerService.favorites.isFavorited,
    getEmployerFavoritesCount: employerService.favorites.getEmployerFavoritesCount,
    checkMultipleFavorites: employerService.favorites.checkMultipleFavorites,
    toggle: employerService.favorites.toggle
  },

  // Peer support operations
  peerSupportProfiles: {
    create: peerSupportService.create,
    getByUserId: peerSupportService.getByUserId,
    update: peerSupportService.update,
    delete: peerSupportService.delete,
    getAvailable: peerSupportService.getAvailable,
    search: peerSupportService.search,
    getBySpecialty: peerSupportService.getBySpecialty,
    getByServiceArea: peerSupportService.getByServiceArea,
    updateAvailability: peerSupportService.updateAvailability,
    getStatistics: peerSupportService.getStatistics,
    getById: peerSupportService.getById,
    bulkUpdate: peerSupportService.bulkUpdate
  },

  // Legacy alias for peer support
  peerSupport: {
    create: peerSupportService.create,
    getByUserId: peerSupportService.getByUserId,
    getAvailable: peerSupportService.getAvailable,
    update: peerSupportService.update
  },

  // Match Groups operations
  matchGroups: {
    create: matchGroupsService.create,
    getByUserId: matchGroupsService.getByUserId,
    getById: matchGroupsService.getById,
    update: matchGroupsService.update,
    delete: matchGroupsService.delete,
    endGroup: matchGroupsService.endGroup,
    completeGroup: matchGroupsService.completeGroup,
    getConnectionSummary: matchGroupsService.getConnectionSummary,
    getStatistics: matchGroupsService.getStatistics,
    // Helper methods
    getMatchType: matchGroupsService.getMatchType,
    getOtherPerson: matchGroupsService.getOtherPerson,
    getUserRole: matchGroupsService.getUserRole,
    isUserInGroup: matchGroupsService.isUserInGroup
  },

  // Communication operations
  communicationTemplates: {
    create: communicationService.templates.create,
    getByCategory: communicationService.templates.getByCategory,
    getByUserId: communicationService.templates.getByUserId,
    getById: communicationService.templates.getById,
    update: communicationService.templates.update,
    delete: communicationService.templates.delete
  },

  communicationLogs: {
    create: communicationService.logs.create,
    getByMatchGroup: communicationService.logs.getByMatchGroup,
    getByUserId: communicationService.logs.getByUserId
  },

  // PSS Clients operations (using existing service)
  pssClients: pssClientsService
}

console.log('✅ Supabase module fully loaded with refactored services')
export default supabase
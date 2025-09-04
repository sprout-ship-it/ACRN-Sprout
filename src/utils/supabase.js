// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // firstName, lastName, roles
      }
    })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Profile operations
  profiles: {
    create: async (profileData) => {
      const { data, error } = await supabase
        .from('registrant_profiles')
        .insert(profileData)
        .select()
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('registrant_profiles')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('registrant_profiles')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    }
  },

  // Basic profile operations
  basicProfiles: {
    create: async (profileData) => {
      const { data, error } = await supabase
        .from('basic_profiles')
        .insert(profileData)
        .select()
      return { data, error }
    },

    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('basic_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      return { data, error }
    },

    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('basic_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
      return { data, error }
    }
  },

  // Matching profile operations
  matchingProfiles: {
    create: async (profileData) => {
      const { data, error } = await supabase
        .from('applicant_forms')
        .insert(profileData)
        .select()
      return { data, error }
    },

    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('applicant_forms')
        .select('*')
        .eq('user_id', userId)
        .single()
      return { data, error }
    },

    getActiveProfiles: async (excludeUserId = null) => {
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
      return { data, error }
    },

    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('applicant_forms')
        .update(updates)
        .eq('user_id', userId)
        .select()
      return { data, error }
    }
  },

  // Match request operations
  matchRequests: {
    create: async (requestData) => {
      const { data, error } = await supabase
        .from('match_requests')
        .insert(requestData)
        .select()
      return { data, error }
    },

    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          *,
          requester:registrant_profiles!requester_id(id, first_name),
          target:registrant_profiles!target_id(id, first_name)
        `)
        .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('match_requests')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    }
  },

  // Property operations
  properties: {
    create: async (propertyData) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
      return { data, error }
    },

    getByLandlordId: async (landlordId) => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getAvailable: async (filters = {}) => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')

      if (filters.maxPrice) {
        query = query.lte('monthly_rent', filters.maxPrice)
      }

      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms)
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }

      const { data, error } = await query.order('is_recovery_friendly', { ascending: false })
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
      return { data, error }
    }
  },

  // Peer support operations
  peerSupport: {
    create: async (profileData) => {
      const { data, error } = await supabase
        .from('peer_support_profiles')
        .insert(profileData)
        .select()
      return { data, error }
    },

    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('peer_support_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      return { data, error }
    },

    getAvailable: async (filters = {}) => {
      let query = supabase
        .from('peer_support_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email)
        `)
        .eq('is_accepting_clients', true)

      if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties)
      }

      if (filters.serviceArea) {
        query = query.overlaps('service_area', [filters.serviceArea])
      }

      const { data, error } = await query.order('years_experience', { ascending: false })
      return { data, error }
    },

    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('peer_support_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
      return { data, error }
    }
  }
}

export default supabase
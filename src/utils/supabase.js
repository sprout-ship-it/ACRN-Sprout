// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

console.log('🔧 Supabase client initializing...')

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('🔧 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'MISSING'
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('💥 Missing Supabase environment variables')
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl)
  console.error('REACT_APP_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey)
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

console.log('🔧 Creating Supabase client...')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Supabase client created successfully')

// Auth helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    console.log('🔑 Auth: signUp called for', email)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // firstName, lastName, roles
        }
      })
      console.log('🔑 Auth: signUp result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 Auth: signUp failed', err)
      throw err
    }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    console.log('🔑 Auth: signIn called for', email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('🔑 Auth: signIn result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 Auth: signIn failed', err)
      throw err
    }
  },

  // Sign out
  signOut: async () => {
    console.log('🔑 Auth: signOut called')
    try {
      const { error } = await supabase.auth.signOut()
      console.log('🔑 Auth: signOut result', { hasError: !!error, error: error?.message })
      return { error }
    } catch (err) {
      console.error('💥 Auth: signOut failed', err)
      throw err
    }
  },

  // Get current session
  getSession: async () => {
    console.log('🔑 Auth: getSession called')
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout after 8 seconds')), 8000)
      )
      
      const sessionPromise = supabase.auth.getSession()
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
      
      console.log('🔑 Auth: getSession result', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        hasError: !!error, 
        error: error?.message 
      })
      return { session, error }
    } catch (err) {
      console.error('💥 Auth: getSession failed', err)
      throw err
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    console.log('🔑 Auth: onAuthStateChange listener setup')
    try {
      const result = supabase.auth.onAuthStateChange(callback)
      console.log('🔑 Auth: onAuthStateChange listener created')
      return result
    } catch (err) {
      console.error('💥 Auth: onAuthStateChange failed', err)
      throw err
    }
  }
}

// Database helpers
export const db = {
  // Profile operations (registrant_profiles table)
  profiles: {
    create: async (profileData) => {
      console.log('📊 DB: profiles.create called', { id: profileData.id, email: profileData.email })
      try {
        const { data, error } = await supabase
          .from('registrant_profiles')
          .insert(profileData)
          .select()
        console.log('📊 DB: profiles.create result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: profiles.create failed', err)
        throw err
      }
    },

    getById: async (id) => {
      console.log('📊 DB: profiles.getById called', { id })
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('profiles.getById timeout after 6 seconds')), 6000)
        )
        
        const queryPromise = supabase
          .from('registrant_profiles')
          .select('*')
          .eq('id', id)
          .single()
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise])
        
        console.log('📊 DB: profiles.getById result', { 
          hasData: !!data, 
          hasError: !!error, 
          error: error?.message,
          errorCode: error?.code 
        })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: profiles.getById failed', err)
        throw err
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: profiles.update called', { id, updates })
      try {
        const { data, error } = await supabase
          .from('registrant_profiles')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: profiles.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: profiles.update failed', err)
        throw err
      }
    }
  },

  // Basic profile operations (basic_profiles table)
  basicProfiles: {
    create: async (profileData) => {
      console.log('📊 DB: basicProfiles.create called', { userId: profileData.user_id })
      try {
        const { data, error } = await supabase
          .from('basic_profiles')
          .insert(profileData)
          .select()
        console.log('📊 DB: basicProfiles.create result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: basicProfiles.create failed', err)
        throw err
      }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: basicProfiles.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('basic_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        console.log('📊 DB: basicProfiles.getByUserId result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: basicProfiles.getByUserId failed', err)
        throw err
      }
    },

    update: async (userId, updates) => {
      console.log('📊 DB: basicProfiles.update called', { userId, updates })
      try {
        const { data, error } = await supabase
          .from('basic_profiles')
          .update(updates)
          .eq('user_id', userId)
          .select()
        console.log('📊 DB: basicProfiles.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: basicProfiles.update failed', err)
        throw err
      }
    }
  },

  // ✅ FIXED: Renamed matchingProfiles to applicantForms to match component expectations
  // Applicant forms operations (applicant_forms table)
  applicantForms: {
    create: async (profileData) => {
      console.log('📊 DB: applicantForms.create called', { userId: profileData.user_id })
      try {
        const { data, error } = await supabase
          .from('applicant_forms')
          .insert(profileData)
          .select()
        console.log('📊 DB: applicantForms.create result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.create failed', err)
        throw err
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
        console.log('📊 DB: applicantForms.getByUserId result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.getByUserId failed', err)
        throw err
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
        console.log('📊 DB: applicantForms.getActiveProfiles result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.getActiveProfiles failed', err)
        throw err
      }
    },

    update: async (userId, updates) => {
      console.log('📊 DB: applicantForms.update called', { userId, updates })
      try {
        const { data, error } = await supabase
          .from('applicant_forms')
          .update(updates)
          .eq('user_id', userId)
          .select()
        console.log('📊 DB: applicantForms.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: applicantForms.update failed', err)
        throw err
      }
    }
  },

  // ✅ ADDED: Keep legacy alias for backward compatibility
  matchingProfiles: {
    create: async (profileData) => {
      console.log('📊 DB: matchingProfiles.create (legacy alias) called - redirecting to applicantForms')
      return await db.applicantForms.create(profileData)
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: matchingProfiles.getByUserId (legacy alias) called - redirecting to applicantForms')
      return await db.applicantForms.getByUserId(userId)
    },

    getActiveProfiles: async (excludeUserId = null) => {
      console.log('📊 DB: matchingProfiles.getActiveProfiles (legacy alias) called - redirecting to applicantForms')
      return await db.applicantForms.getActiveProfiles(excludeUserId)
    },

    update: async (userId, updates) => {
      console.log('📊 DB: matchingProfiles.update (legacy alias) called - redirecting to applicantForms')
      return await db.applicantForms.update(userId, updates)
    }
  },

  // Match request operations (match_requests table)
  matchRequests: {
    create: async (requestData) => {
      console.log('📊 DB: matchRequests.create called', { requestData })
      try {
        const { data, error } = await supabase
          .from('match_requests')
          .insert(requestData)
          .select()
        console.log('📊 DB: matchRequests.create result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchRequests.create failed', err)
        throw err
      }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: matchRequests.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('match_requests')
          .select(`
            *,
            requester:registrant_profiles!requester_id(id, first_name),
            target:registrant_profiles!target_id(id, first_name)
          `)
          .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
          .order('created_at', { ascending: false })
        console.log('📊 DB: matchRequests.getByUserId result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchRequests.getByUserId failed', err)
        throw err
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: matchRequests.update called', { id, updates })
      try {
        const { data, error } = await supabase
          .from('match_requests')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: matchRequests.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchRequests.update failed', err)
        throw err
      }
    }
  },

  // Property operations (properties table)
  properties: {
    create: async (propertyData) => {
      console.log('📊 DB: properties.create called', { propertyData })
      try {
        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
        console.log('📊 DB: properties.create result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.create failed', err)
        throw err
      }
    },

    getByLandlordId: async (landlordId) => {
      console.log('📊 DB: properties.getByLandlordId called', { landlordId })
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('landlord_id', landlordId)
          .order('created_at', { ascending: false })
        console.log('📊 DB: properties.getByLandlordId result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.getByLandlordId failed', err)
        throw err
      }
    },

    getAvailable: async (filters = {}) => {
      console.log('📊 DB: properties.getAvailable called', { filters })
      try {
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
        console.log('📊 DB: properties.getAvailable result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.getAvailable failed', err)
        throw err
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: properties.update called', { id, updates })
      try {
        const { data, error } = await supabase
          .from('properties')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: properties.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.update failed', err)
        throw err
      }
    },

    delete: async (id) => {
      console.log('📊 DB: properties.delete called', { id })
      try {
        const { data, error } = await supabase
          .from('properties')
          .delete()
          .eq('id', id)
        console.log('📊 DB: properties.delete result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.delete failed', err)
        throw err
      }
    }
  },

  // ✅ FIXED: Renamed peerSupport to peerSupportProfiles to match expected usage
  // Peer support operations (peer_support_profiles table)
  peerSupportProfiles: {
    create: async (profileData) => {
      console.log('📊 DB: peerSupportProfiles.create called', { profileData })
      try {
        const { data, error } = await supabase
          .from('peer_support_profiles')
          .insert(profileData)
          .select()
        console.log('📊 DB: peerSupportProfiles.create result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.create failed', err)
        throw err
      }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: peerSupportProfiles.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('peer_support_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        console.log('📊 DB: peerSupportProfiles.getByUserId result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.getByUserId failed', err)
        throw err
      }
    },

    getAvailable: async (filters = {}) => {
      console.log('📊 DB: peerSupportProfiles.getAvailable called', { filters })
      try {
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
        console.log('📊 DB: peerSupportProfiles.getAvailable result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.getAvailable failed', err)
        throw err
      }
    },

    update: async (userId, updates) => {
      console.log('📊 DB: peerSupportProfiles.update called', { userId, updates })
      try {
        const { data, error } = await supabase
          .from('peer_support_profiles')
          .update(updates)
          .eq('user_id', userId)
          .select()
        console.log('📊 DB: peerSupportProfiles.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.update failed', err)
        throw err
      }
    }
  },

  // ✅ ADDED: Keep legacy alias for backward compatibility
  peerSupport: {
    create: async (profileData) => {
      console.log('📊 DB: peerSupport.create (legacy alias) called - redirecting to peerSupportProfiles')
      return await db.peerSupportProfiles.create(profileData)
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: peerSupport.getByUserId (legacy alias) called - redirecting to peerSupportProfiles')
      return await db.peerSupportProfiles.getByUserId(userId)
    },

    getAvailable: async (filters = {}) => {
      console.log('📊 DB: peerSupport.getAvailable (legacy alias) called - redirecting to peerSupportProfiles')
      return await db.peerSupportProfiles.getAvailable(filters)
    },

    update: async (userId, updates) => {
      console.log('📊 DB: peerSupport.update (legacy alias) called - redirecting to peerSupportProfiles')
      return await db.peerSupportProfiles.update(userId, updates)
    }
  }
}

console.log('✅ Supabase module fully loaded')
export default supabase
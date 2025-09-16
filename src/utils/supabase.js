// src/utils/supabase.js - COMPLETE UPDATED VERSION
import { createClient } from '@supabase/supabase-js'

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

// Simplified auth helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    console.log('🔑 Auth: signUp called for', email)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      console.log('🔑 Auth: signUp result', { hasData: !!data, hasError: !!error })
      return { data, error }
    } catch (err) {
      console.error('💥 Auth: signUp failed', err)
      return { data: null, error: err }
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
      console.log('🔑 Auth: signIn result', { hasData: !!data, hasError: !!error })
      return { data, error }
    } catch (err) {
      console.error('💥 Auth: signIn failed', err)
      return { data: null, error: err }
    }
  },

  // Sign out user
  signOut: async () => {
    console.log('🔑 Auth: signOut called')
    try {
      const { error } = await supabase.auth.signOut()
      console.log('🔑 Auth: signOut result', { hasError: !!error })
      return { error }
    } catch (err) {
      console.error('💥 Auth: signOut failed', err)
      return { error: err }
    }
  },

  // Get current session
  getSession: async () => {
    console.log('🔑 Auth: getSession called')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('🔑 Auth: getSession result', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        hasError: !!error
      })
      
      return { session, error }
    } catch (err) {
      console.error('💥 Auth: getSession failed', err)
      return { session: null, error: err }
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    console.log('🔑 Auth: onAuthStateChange listener setup')
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Simplified database helpers
export const db = {
  // Profile operations (registrant_profiles table)
  profiles: {
    create: async (profileData) => {
      console.log('📊 DB: profiles.create called', { id: profileData.id })
      try {
        const { data, error } = await supabase
          .from('registrant_profiles')
          .insert(profileData)
          .select()
        console.log('📊 DB: profiles.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: profiles.create failed', err)
        return { data: null, error: err }
      }
    },

    getById: async (id) => {
      console.log('📊 DB: profiles.getById called', { id })
      
      try {
        const { data, error } = await supabase
          .from('registrant_profiles')
          .select('*')
          .eq('id', id)
          .single()
        
        console.log('📊 DB: profiles.getById result', { 
          hasData: !!data, 
          hasError: !!error,
          error: error?.message 
        })

        return { data, error }
        
      } catch (err) {
        console.error('💥 DB: profiles.getById failed', err)
        return { data: null, error: err }
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: profiles.update called', { id })
      try {
        const { data, error } = await supabase
          .from('registrant_profiles')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: profiles.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: profiles.update failed', err)
        return { data: null, error: err }
      }
    }
  },

  // Add registrantProfiles alias for profiles (for compatibility)
  registrantProfiles: {
    getById: async (id) => db.profiles.getById(id),
    create: async (profileData) => db.profiles.create(profileData),
    update: async (id, updates) => db.profiles.update(id, updates)
  },

  // Applicant forms operations
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

  // Legacy alias for backward compatibility
  matchingProfiles: {
    create: async (profileData) => {
      const userId = profileData.user_id || profileData.userId;
      if (!userId) {
        return { data: null, error: { message: 'user_id is required' } };
      }
      
      try {
        // Check if record already exists
        const { data: existingRecord } = await db.applicantForms.getByUserId(userId);
        
        if (existingRecord) {
          const updateData = { ...profileData };
          delete updateData.userId;
          updateData.user_id = userId;
          return await db.applicantForms.update(userId, updateData);
        } else {
          const createData = { ...profileData };
          delete createData.userId;
          createData.user_id = userId;
          return await db.applicantForms.create(createData);
        }
      } catch (err) {
        console.error('💥 DB: matchingProfiles.create failed', err)
        return { data: null, error: err }
      }
    },

    getByUserId: async (userId) => db.applicantForms.getByUserId(userId),
    getActiveProfiles: async (excludeUserId = null) => db.applicantForms.getActiveProfiles(excludeUserId),
    update: async (userId, updates) => db.applicantForms.update(userId, updates)
  },

  // Match request operations
  matchRequests: {
    create: async (requestData) => {
      console.log('📊 DB: matchRequests.create called')
      try {
        const { data, error } = await supabase
          .from('match_requests')
          .insert(requestData)
          .select()
        console.log('📊 DB: matchRequests.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchRequests.create failed', err)
        return { data: null, error: err }
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
        console.log('📊 DB: matchRequests.getByUserId result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchRequests.getByUserId failed', err)
        return { data: [], error: err }
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: matchRequests.update called', { id })
      try {
        const { data, error } = await supabase
          .from('match_requests')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: matchRequests.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchRequests.update failed', err)
        return { data: null, error: err }
      }
    }
  },

  // Property operations
  properties: {
    create: async (propertyData) => {
      console.log('📊 DB: properties.create called')
      try {
        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
        console.log('📊 DB: properties.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.create failed', err)
        return { data: null, error: err }
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
        console.log('📊 DB: properties.getByLandlordId result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.getByLandlordId failed', err)
        return { data: [], error: err }
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
        console.log('📊 DB: properties.getAvailable result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.getAvailable failed', err)
        return { data: [], error: err }
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: properties.update called', { id })
      try {
        const { data, error } = await supabase
          .from('properties')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: properties.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.update failed', err)
        return { data: null, error: err }
      }
    },

    delete: async (id) => {
      console.log('📊 DB: properties.delete called', { id })
      try {
        const { data, error } = await supabase
          .from('properties')
          .delete()
          .eq('id', id)
        console.log('📊 DB: properties.delete result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: properties.delete failed', err)
        return { data: null, error: err }
      }
    }
  },

  // Employer operations
  employerProfiles: {
    create: async (employerData) => {
      console.log('📊 DB: employerProfiles.create called')
      try {
        const { data, error } = await supabase
          .from('employer_profiles')
          .insert(employerData)
          .select()
        console.log('📊 DB: employerProfiles.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerProfiles.create failed', err)
        return { data: null, error: err }
      }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: employerProfiles.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        console.log('📊 DB: employerProfiles.getByUserId result', { 
          hasData: !!data, 
          dataLength: data?.length,
          hasError: !!error
        })

        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerProfiles.getByUserId failed', err)
        return { data: [], error: err }
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: employerProfiles.update called', { id })
      try {
        const { data, error } = await supabase
          .from('employer_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
        console.log('📊 DB: employerProfiles.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerProfiles.update failed', err)
        return { data: null, error: err }
      }
    },

    delete: async (id) => {
      console.log('📊 DB: employerProfiles.delete called', { id })
      try {
        const { data, error } = await supabase
          .from('employer_profiles')
          .delete()
          .eq('id', id)
        console.log('📊 DB: employerProfiles.delete result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerProfiles.delete failed', err)
        return { data: null, error: err }
      }
    },

    getAvailable: async (filters = {}) => {
      console.log('📊 DB: employerProfiles.getAvailable called', { filters })
      try {
        let query = supabase
          .from('employer_profiles')
          .select('*')
          .eq('profile_completed', true)

        // Apply filters
        if (filters.isActivelyHiring) {
          query = query.eq('is_actively_hiring', true)
        }

        if (filters.industry) {
          query = query.eq('industry', filters.industry)
        }

        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`)
        }

        if (filters.state) {
          query = query.eq('state', filters.state)
        }

        if (filters.businessType) {
          query = query.eq('business_type', filters.businessType)
        }

        if (filters.remoteWork) {
          query = query.eq('remote_work_options', filters.remoteWork)
        }

        // Array filters need to be handled with contains or overlap
        if (filters.recoveryFeatures && filters.recoveryFeatures.length > 0) {
          query = query.overlaps('recovery_friendly_features', filters.recoveryFeatures)
        }

        if (filters.jobTypes && filters.jobTypes.length > 0) {
          query = query.overlaps('current_openings', filters.jobTypes)
        }

        const { data, error } = await query
          .order('is_actively_hiring', { ascending: false })
          .order('updated_at', { ascending: false })

        console.log('📊 DB: employerProfiles.getAvailable result', { 
          hasData: !!data, 
          dataLength: data?.length,
          hasError: !!error 
        })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerProfiles.getAvailable failed', err)
        return { data: [], error: err }
      }
    }
  },

  // Employer favorites operations
  employerFavorites: {
    // Get all favorites for a user with employer details
    getByUserId: async (userId) => {
      console.log('📊 DB: employerFavorites.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('employer_favorites_with_details')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        console.log('📊 DB: employerFavorites.getByUserId result', { 
          hasData: !!data, 
          dataLength: data?.length,
          hasError: !!error
        })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerFavorites.getByUserId failed', err)
        return { data: [], error: err }
      }
    },

    // Add a favorite
    add: async (userId, employerUserId) => {
      console.log('📊 DB: employerFavorites.add called', { userId, employerUserId })
      try {
        const { data, error } = await supabase
          .from('employer_favorites')
          .insert({ 
            user_id: userId, 
            employer_user_id: employerUserId 
          })
          .select()
          .single()
        
        console.log('📊 DB: employerFavorites.add result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerFavorites.add failed', err)
        return { data: null, error: err }
      }
    },

    // Remove a favorite
    remove: async (userId, employerUserId) => {
      console.log('📊 DB: employerFavorites.remove called', { userId, employerUserId })
      try {
        const { data, error } = await supabase
          .from('employer_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('employer_user_id', employerUserId)
          .select()
        
        console.log('📊 DB: employerFavorites.remove result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: employerFavorites.remove failed', err)
        return { data: null, error: err }
      }
    },

    // Check if employer is favorited
    isFavorited: async (userId, employerUserId) => {
      console.log('📊 DB: employerFavorites.isFavorited called', { userId, employerUserId })
      try {
        const { data, error } = await supabase
          .from('employer_favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('employer_user_id', employerUserId)
          .single()
        
        // If data exists, it's favorited; if no data but no error, it's not favorited
        const isFavorited = !!data && !error
        
        console.log('📊 DB: employerFavorites.isFavorited result', { 
          isFavorited, 
          hasError: !!error,
          errorCode: error?.code 
        })
        
        // Return just the boolean result, ignore "not found" errors
        return { 
          data: isFavorited, 
          error: error?.code === 'PGRST116' ? null : error 
        }
      } catch (err) {
        console.error('💥 DB: employerFavorites.isFavorited failed', err)
        return { data: false, error: err }
      }
    },

    // Get favorites count for an employer (how many users have favorited them)
    getEmployerFavoritesCount: async (employerUserId) => {
      console.log('📊 DB: employerFavorites.getEmployerFavoritesCount called', { employerUserId })
      try {
        const { data, error } = await supabase
          .from('employer_favorites')
          .select('id', { count: 'exact' })
          .eq('employer_user_id', employerUserId)
        
        console.log('📊 DB: employerFavorites.getEmployerFavoritesCount result', { 
          count: data?.length || 0, 
          hasError: !!error 
        })
        
        return { data: data?.length || 0, error }
      } catch (err) {
        console.error('💥 DB: employerFavorites.getEmployerFavoritesCount failed', err)
        return { data: 0, error: err }
      }
    },

    // Batch check if multiple employers are favorited (for efficient UI updates)
    checkMultipleFavorites: async (userId, employerUserIds) => {
      console.log('📊 DB: employerFavorites.checkMultipleFavorites called', { 
        userId, 
        employerCount: employerUserIds?.length 
      })
      
      if (!employerUserIds || employerUserIds.length === 0) {
        return { data: [], error: null }
      }
      
      try {
        const { data, error } = await supabase
          .from('employer_favorites')
          .select('employer_user_id')
          .eq('user_id', userId)
          .in('employer_user_id', employerUserIds)
        
        // Convert to Set of favorited employer IDs for easy lookup
        const favoritedIds = new Set(data?.map(fav => fav.employer_user_id) || [])
        
        console.log('📊 DB: employerFavorites.checkMultipleFavorites result', { 
          favoritedCount: favoritedIds.size,
          hasError: !!error 
        })
        
        return { data: favoritedIds, error }
      } catch (err) {
        console.error('💥 DB: employerFavorites.checkMultipleFavorites failed', err)
        return { data: new Set(), error: err }
      }
    }
  },

  // Peer support operations
  peerSupportProfiles: {
    create: async (profileData) => {
      console.log('📊 DB: peerSupportProfiles.create called')
      try {
        const { data, error } = await supabase
          .from('peer_support_profiles')
          .insert(profileData)
          .select()
        console.log('📊 DB: peerSupportProfiles.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.create failed', err)
        return { data: null, error: err }
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
        console.log('📊 DB: peerSupportProfiles.getByUserId result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.getByUserId failed', err)
        return { data: null, error: err }
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

        const { data, error } = await query

        if (error || !data) {
          console.log('📊 DB: peerSupportProfiles.getAvailable error:', error?.message)
          return { data: [], error }
        }

        // Apply filters in JavaScript for simplicity
        let filteredData = data

        if (filters.specialties && filters.specialties.length > 0) {
          filteredData = filteredData.filter(profile => {
            if (!profile.specialties || !Array.isArray(profile.specialties)) return false
            return filters.specialties.some(specialty => 
              profile.specialties.some(profileSpecialty => 
                profileSpecialty.toLowerCase().includes(specialty.toLowerCase()) ||
                specialty.toLowerCase().includes(profileSpecialty.toLowerCase())
              )
            )
          })
        }

        if (filters.serviceArea && filters.serviceArea.trim()) {
          const searchArea = filters.serviceArea.trim().toLowerCase()
          const searchTerms = searchArea.split(/[,\s]+/).filter(term => term.length > 2)
          
          filteredData = filteredData.filter(profile => {
            if (!profile.service_area) return false
            
            let serviceAreas = []
            if (Array.isArray(profile.service_area)) {
              serviceAreas = profile.service_area
            } else if (typeof profile.service_area === 'string') {
              serviceAreas = [profile.service_area]
            } else {
              return false
            }
            
            return serviceAreas.some(area => {
              const areaLower = area.toLowerCase()
              return searchTerms.some(term => 
                areaLower.includes(term) || term.includes(areaLower)
              )
            })
          })
        }

        // Sort by experience
        filteredData.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))

        return { data: filteredData, error: null }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.getAvailable failed', err)
        return { data: [], error: err }
      }
    },

    update: async (userId, updates) => {
      console.log('📊 DB: peerSupportProfiles.update called', { userId })
      try {
        const { data, error } = await supabase
          .from('peer_support_profiles')
          .update(updates)
          .eq('user_id', userId)
          .select()
        console.log('📊 DB: peerSupportProfiles.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.update failed', err)
        return { data: null, error: err }
      }
    }
  },

  // Legacy alias for peer support
  peerSupport: {
    create: async (profileData) => db.peerSupportProfiles.create(profileData),
    getByUserId: async (userId) => db.peerSupportProfiles.getByUserId(userId),
    getAvailable: async (filters = {}) => db.peerSupportProfiles.getAvailable(filters),
    update: async (userId, updates) => db.peerSupportProfiles.update(userId, updates)
  },

  // Match Groups operations
  matchGroups: {
    create: async (groupData) => {
      console.log('📊 DB: matchGroups.create called')
      try {
        const { data, error } = await supabase
          .from('match_groups')
          .insert(groupData)
          .select()
        console.log('📊 DB: matchGroups.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.create failed', err)
        return { data: null, error: err }
      }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: matchGroups.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('match_groups')
          .select(`
            *,
            applicant_1:registrant_profiles!applicant_1_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            applicant_2:registrant_profiles!applicant_2_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            landlord:registrant_profiles!landlord_id(
              id, 
              first_name, 
              email,
              properties(phone)
            ),
            peer_support:registrant_profiles!peer_support_id(
              id, 
              first_name, 
              email,
              peer_support_profiles(phone)
            ),
            property:properties!property_id(id, title, city, monthly_rent)
          `)
          .or(`applicant_1_id.eq.${userId},applicant_2_id.eq.${userId},landlord_id.eq.${userId},peer_support_id.eq.${userId}`)
          .order('created_at', { ascending: false })
        console.log('📊 DB: matchGroups.getByUserId result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.getByUserId failed', err)
        return { data: [], error: err }
      }
    },

    getById: async (id) => {
      console.log('📊 DB: matchGroups.getById called', { id })
      try {
        const { data, error } = await supabase
          .from('match_groups')
          .select(`
            *,
            applicant_1:registrant_profiles!applicant_1_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            applicant_2:registrant_profiles!applicant_2_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            landlord:registrant_profiles!landlord_id(
              id, 
              first_name, 
              email,
              properties(phone)
            ),
            peer_support:registrant_profiles!peer_support_id(
              id, 
              first_name, 
              email,
              peer_support_profiles(phone)
            ),
            property:properties!property_id(id, title, address, city, monthly_rent, phone)
          `)
          .eq('id', id)
          .single()
        console.log('📊 DB: matchGroups.getById result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.getById failed', err)
        return { data: null, error: err }
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: matchGroups.update called', { id })
      try {
        const { data, error } = await supabase
          .from('match_groups')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: matchGroups.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.update failed', err)
        return { data: null, error: err }
      }
    },

    endGroup: async (groupId, endedBy, reason = null) => {
      console.log('📊 DB: matchGroups.endGroup called', { groupId, endedBy, reason })
      try {
        const updates = {
          status: 'dissolved',
          dissolved_at: new Date().toISOString(),
          dissolved_reason: reason,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('match_groups')
          .update(updates)
          .eq('id', groupId)
          .select()
        console.log('📊 DB: matchGroups.endGroup result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.endGroup failed', err)
        return { data: null, error: err }
      }
    },

    // Get connection summary for a user
    getConnectionSummary: async (userId) => {
      console.log('📊 DB: matchGroups.getConnectionSummary called', { userId })
      try {
        // Get all groups for user
        const { data: groups, error } = await supabase
          .from('match_groups')
          .select(`
            id,
            status,
            match_type,
            created_at,
            applicant_1_id,
            applicant_2_id,
            landlord_id,
            peer_support_id,
            property_id
          `)
          .or(`applicant_1_id.eq.${userId},applicant_2_id.eq.${userId},landlord_id.eq.${userId},peer_support_id.eq.${userId}`)

        if (error || !groups) {
          return { data: { active: 0, completed: 0, total: 0 }, error }
        }

        const summary = {
          active: groups.filter(g => g.status === 'active').length,
          completed: groups.filter(g => g.status === 'completed').length,
          dissolved: groups.filter(g => g.status === 'dissolved').length,
          total: groups.length,
          byType: {
            housing: groups.filter(g => g.property_id).length,
            peer_support: groups.filter(g => g.peer_support_id).length,
            applicant_peer: groups.filter(g => g.applicant_1_id && g.applicant_2_id && !g.property_id && !g.peer_support_id).length
          }
        }

        console.log('📊 DB: matchGroups.getConnectionSummary result', { summary })
        return { data: summary, error: null }
      } catch (err) {
        console.error('💥 DB: matchGroups.getConnectionSummary failed', err)
        return { data: { active: 0, completed: 0, total: 0 }, error: err }
      }
    },

    // Helper to determine match type
    getMatchType: (matchGroup) => {
      if (matchGroup.property_id && matchGroup.landlord_id) {
        return 'housing'
      } else if (matchGroup.peer_support_id) {
        return 'peer_support'
      } else if (matchGroup.applicant_1_id && matchGroup.applicant_2_id) {
        return 'applicant_peer'
      }
      return 'unknown'
    },

    // Helper to get the other person in the match
    getOtherPerson: (matchGroup, currentUserId) => {
      const matchType = db.matchGroups.getMatchType(matchGroup)
      
      switch (matchType) {
        case 'housing':
          if (matchGroup.landlord_id === currentUserId) {
            return matchGroup.applicant_1 || matchGroup.applicant_2
          } else {
            return matchGroup.landlord
          }
        
        case 'peer_support':
          if (matchGroup.peer_support_id === currentUserId) {
            return matchGroup.applicant_1 || matchGroup.applicant_2
          } else {
            return matchGroup.peer_support
          }
        
        case 'applicant_peer':
          if (matchGroup.applicant_1_id === currentUserId) {
            return matchGroup.applicant_2
          } else {
            return matchGroup.applicant_1
          }
        
        default:
          return null
      }
    }
  },

  // Communication templates operations
  communicationTemplates: {
    create: async (templateData) => {
      console.log('📊 DB: communicationTemplates.create called')
      try {
        const { data, error } = await supabase
          .from('communication_templates')
          .insert(templateData)
          .select()
        console.log('📊 DB: communicationTemplates.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationTemplates.create failed', err)
        return { data: null, error: err }
      }
    },

    getByCategory: async (category, userId = null) => {
      console.log('📊 DB: communicationTemplates.getByCategory called', { category, userId })
      try {
        let query = supabase
          .from('communication_templates')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)

        // Get both system templates and user's custom templates
        if (userId) {
          query = query.or(`user_id.is.null,user_id.eq.${userId}`)
        } else {
          query = query.is('user_id', null) // Only system templates
        }

        const { data, error } = await query.order('is_system', { ascending: false })
        console.log('📊 DB: communicationTemplates.getByCategory result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationTemplates.getByCategory failed', err)
        return { data: [], error: err }
      }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: communicationTemplates.getByUserId called', { userId })
      try {
        const { data, error } = await supabase
          .from('communication_templates')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        console.log('📊 DB: communicationTemplates.getByUserId result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationTemplates.getByUserId failed', err)
        return { data: [], error: err }
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: communicationTemplates.update called', { id })
      try {
        const { data, error } = await supabase
          .from('communication_templates')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
        console.log('📊 DB: communicationTemplates.update result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationTemplates.update failed', err)
        return { data: null, error: err }
      }
    },

    delete: async (id) => {
      console.log('📊 DB: communicationTemplates.delete called', { id })
      try {
        // Soft delete - mark as inactive instead of actually deleting
        const { data, error } = await supabase
          .from('communication_templates')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
        console.log('📊 DB: communicationTemplates.delete result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationTemplates.delete failed', err)
        return { data: null, error: err }
      }
    }
  },

  // Communication logs operations
  communicationLogs: {
    create: async (logData) => {
      console.log('📊 DB: communicationLogs.create called')
      try {
        const { data, error } = await supabase
          .from('communication_logs')
          .insert(logData)
          .select()
        console.log('📊 DB: communicationLogs.create result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationLogs.create failed', err)
        return { data: null, error: err }
      }
    },

    getByMatchGroup: async (matchGroupId) => {
      console.log('📊 DB: communicationLogs.getByMatchGroup called', { matchGroupId })
      try {
        const { data, error } = await supabase
          .from('communication_logs')
          .select(`
            *,
            sender:registrant_profiles!sender_id(id, first_name),
            recipient:registrant_profiles!recipient_id(id, first_name)
          `)
          .eq('match_group_id', matchGroupId)
          .order('created_at', { ascending: false })
        console.log('📊 DB: communicationLogs.getByMatchGroup result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationLogs.getByMatchGroup failed', err)
        return { data: [], error: err }
      }
    },

    getByUserId: async (userId, limit = 50) => {
      console.log('📊 DB: communicationLogs.getByUserId called', { userId, limit })
      try {
        const { data, error } = await supabase
          .from('communication_logs')
          .select(`
            *,
            sender:registrant_profiles!sender_id(id, first_name),
            recipient:registrant_profiles!recipient_id(id, first_name),
            match_group:match_groups(id, match_type, status)
          `)
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(limit)
        console.log('📊 DB: communicationLogs.getByUserId result', { hasData: !!data, hasError: !!error })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: communicationLogs.getByUserId failed', err)
        return { data: [], error: err }
      }
    }
  }
}

console.log('✅ Supabase module fully loaded')
export default supabase
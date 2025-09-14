// src/utils/supabase.js - SIMPLIFIED VERSION
import { createClient } from '@supabase/supabase-js'

console.log('🔧 Supabase client initializing...')

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('💥 Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// ✅ SIMPLIFIED: Basic Supabase client with standard config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

console.log('✅ Supabase client created')

// ✅ SIMPLIFIED: Clean auth helpers without complex error handling
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    console.log('🔑 Auth: signUp called for', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    console.log('🔑 Auth: signUp result', { hasData: !!data, hasError: !!error })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    console.log('🔑 Auth: signIn called for', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    console.log('🔑 Auth: signIn result', { hasData: !!data, hasError: !!error })
    return { data, error }
  },

  // ✅ SIMPLIFIED: Clean sign out
  signOut: async () => {
    console.log('🔑 Auth: signOut called')
    const { error } = await supabase.auth.signOut()
    console.log('🔑 Auth: signOut result', { hasError: !!error })
    return { error }
  },

  // ✅ SIMPLIFIED: Basic session getter without complex refresh logic
  getSession: async () => {
    console.log('🔑 Auth: getSession called')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔑 Auth: getSession result', { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      hasError: !!error
    })
    
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    console.log('🔑 Auth: onAuthStateChange listener setup')
    return supabase.auth.onAuthStateChange(callback)
  }
}

// ✅ SIMPLIFIED: Clean database helpers
export const db = {
  // Profile operations (registrant_profiles table)
  profiles: {
    create: async (profileData) => {
      console.log('📊 DB: profiles.create called', { id: profileData.id })
      const { data, error } = await supabase
        .from('registrant_profiles')
        .insert(profileData)
        .select()
      console.log('📊 DB: profiles.create result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    // ✅ SIMPLIFIED: Basic profile getter without complex timeouts/fallbacks
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
      const { data, error } = await supabase
        .from('registrant_profiles')
        .update(updates)
        .eq('id', id)
        .select()
      console.log('📊 DB: profiles.update result', { hasData: !!data, hasError: !!error })
      return { data, error }
    }
  },

  // Applicant forms operations
  applicantForms: {
    create: async (profileData) => {
      console.log('📊 DB: applicantForms.create called', { userId: profileData.user_id })
      const { data, error } = await supabase
        .from('applicant_forms')
        .insert(profileData)
        .select()
      console.log('📊 DB: applicantForms.create result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: applicantForms.getByUserId called', { userId })
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
    },

    getActiveProfiles: async (excludeUserId = null) => {
      console.log('📊 DB: applicantForms.getActiveProfiles called', { excludeUserId })
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
    },

    update: async (userId, updates) => {
      console.log('📊 DB: applicantForms.update called', { userId })
      const { data, error } = await supabase
        .from('applicant_forms')
        .update(updates)
        .eq('user_id', userId)
        .select()
      console.log('📊 DB: applicantForms.update result', { hasData: !!data, hasError: !!error })
      return { data, error }
    }
  },

  // Legacy alias for backward compatibility
  matchingProfiles: {
    create: async (profileData) => {
      const userId = profileData.user_id || profileData.userId;
      if (!userId) {
        return { data: null, error: { message: 'user_id is required' } };
      }
      
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
    },

    getByUserId: async (userId) => db.applicantForms.getByUserId(userId),
    getActiveProfiles: async (excludeUserId = null) => db.applicantForms.getActiveProfiles(excludeUserId),
    update: async (userId, updates) => db.applicantForms.update(userId, updates)
  },

  // Match request operations
  matchRequests: {
    create: async (requestData) => {
      console.log('📊 DB: matchRequests.create called')
      const { data, error } = await supabase
        .from('match_requests')
        .insert(requestData)
        .select()
      console.log('📊 DB: matchRequests.create result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: matchRequests.getByUserId called', { userId })
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
    },

    update: async (id, updates) => {
      console.log('📊 DB: matchRequests.update called', { id })
      const { data, error } = await supabase
        .from('match_requests')
        .update(updates)
        .eq('id', id)
        .select()
      console.log('📊 DB: matchRequests.update result', { hasData: !!data, hasError: !!error })
      return { data, error }
    }
  },

  // Property operations
  properties: {
    create: async (propertyData) => {
      console.log('📊 DB: properties.create called')
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
      console.log('📊 DB: properties.create result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    getByLandlordId: async (landlordId) => {
      console.log('📊 DB: properties.getByLandlordId called', { landlordId })
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false })
      console.log('📊 DB: properties.getByLandlordId result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    getAvailable: async (filters = {}) => {
      console.log('📊 DB: properties.getAvailable called', { filters })
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
    },

    update: async (id, updates) => {
      console.log('📊 DB: properties.update called', { id })
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
      console.log('📊 DB: properties.update result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    delete: async (id) => {
      console.log('📊 DB: properties.delete called', { id })
      const { data, error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
      console.log('📊 DB: properties.delete result', { hasData: !!data, hasError: !!error })
      return { data, error }
    }
  },

  // Employer operations
  employerProfiles: {
    create: async (employerData) => {
      console.log('📊 DB: employerProfiles.create called')
      const { data, error } = await supabase
        .from('employer_profiles')
        .insert(employerData)
        .select()
      console.log('📊 DB: employerProfiles.create result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: employerProfiles.getByUserId called', { userId })
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
    },

    getAvailable: async (filters = {}) => {
      console.log('📊 DB: employerProfiles.getAvailable called', { filters })
      let query = supabase
        .from('employer_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email)
        `)
        .eq('is_active', true)

      // Apply filters
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

      if (filters.isActivelyHiring !== undefined) {
        query = query.eq('is_actively_hiring', filters.isActivelyHiring)
      }

      if (filters.recoveryFeatures && filters.recoveryFeatures.length > 0) {
        query = query.overlaps('recovery_friendly_features', filters.recoveryFeatures)
      }

      if (filters.jobTypes && filters.jobTypes.length > 0) {
        query = query.overlaps('job_types_available', filters.jobTypes)
      }

      if (filters.remoteWork) {
        query = query.eq('remote_work_options', filters.remoteWork)
      }

      const { data, error } = await query
        .order('is_actively_hiring', { ascending: false })
        .order('created_at', { ascending: false })

      console.log('📊 DB: employerProfiles.getAvailable result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    update: async (id, updates) => {
      console.log('📊 DB: employerProfiles.update called', { id })
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
    },

    delete: async (id) => {
      console.log('📊 DB: employerProfiles.delete called', { id })
      const { data, error } = await supabase
        .from('employer_profiles')
        .delete()
        .eq('id', id)
      console.log('📊 DB: employerProfiles.delete result', { hasData: !!data, hasError: !!error })
      return { data, error }
    }
  },

  // Peer support operations
  peerSupportProfiles: {
    create: async (profileData) => {
      console.log('📊 DB: peerSupportProfiles.create called')
      const { data, error } = await supabase
        .from('peer_support_profiles')
        .insert(profileData)
        .select()
      console.log('📊 DB: peerSupportProfiles.create result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    getByUserId: async (userId) => {
      console.log('📊 DB: peerSupportProfiles.getByUserId called', { userId })
      const { data, error } = await supabase
        .from('peer_support_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      console.log('📊 DB: peerSupportProfiles.getByUserId result', { hasData: !!data, hasError: !!error })
      return { data, error }
    },

    getAvailable: async (filters = {}) => {
      console.log('📊 DB: peerSupportProfiles.getAvailable called', { filters })
      
      let query = supabase
        .from('peer_support_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email)
        `)
        .eq('is_accepting_clients', true)

      const { data, error } = await query

      console.log('📊 DB: peerSupportProfiles.getAvailable result', { 
        count: data?.length || 0, 
        error: error?.message 
      })

      if (!data || error) {
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
    },

    update: async (userId, updates) => {
      console.log('📊 DB: peerSupportProfiles.update called', { userId })
      const { data, error } = await supabase
        .from('peer_support_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
      console.log('📊 DB: peerSupportProfiles.update result', { hasData: !!data, hasError: !!error })
      return { data, error }
    }
  },

  // Legacy alias
  peerSupport: {
    create: async (profileData) => db.peerSupportProfiles.create(profileData),
    getByUserId: async (userId) => db.peerSupportProfiles.getByUserId(userId),
    getAvailable: async (filters = {}) => db.peerSupportProfiles.getAvailable(filters),
    update: async (userId, updates) => db.peerSupportProfiles.update(userId, updates)
  }
}

console.log('✅ Supabase module fully loaded')
export default supabase
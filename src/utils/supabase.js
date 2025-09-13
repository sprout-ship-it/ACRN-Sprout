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

// Session validation helper - ADD THIS HERE
const ensureValidSession = async () => {
  console.log('🔒 Checking session validity before database query...')
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Session check failed:', error.message)
      throw new Error('Session invalid')
    }
    
    if (!session) {
      console.error('❌ No active session found')
      throw new Error('No active session')
    }
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      console.error('❌ Session expired')
      throw new Error('Session expired')
    }
    
    console.log('✅ Session is valid')
    return session
  } catch (err) {
    console.error('💥 Session validation failed:', err)
    throw err
  }
}

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
// Get current session
getSession: async () => {
  console.log('🔑 Auth: getSession called')
  try {
    // Try to refresh the session first
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      console.log('⚠️ Session refresh failed, trying getSession:', refreshError.message)
    } else {
      console.log('✅ Session refreshed successfully')
      return { session: refreshData.session, error: null }
    }
    
    // Fallback to getSession
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getSession timeout after 30 seconds')), 30000)
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
    // Check session first
    await ensureValidSession()
    
    // Reduced timeout (back to reasonable level)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('profiles.getById timeout after 45 seconds')), 45000)
    )
    
    const queryPromise = supabase
      .from('registrant_profiles')
      .select('*')
      .eq('id', id)
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    
    console.log('📊 DB: profiles.getById result', { 
      hasData: !!data, 
      dataLength: data?.length,
      hasError: !!error, 
      error: error?.message,
      errorCode: error?.code 
    })

    if (error) {
      return { data: null, error }
    }
    
    if (!data || data.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'No rows returned' } }
    }
    
    if (data.length > 1) {
      console.warn('⚠️ Multiple profiles found for user, using first one:', data.length)
      return { data: data[0], error: null }
    }
    
    return { data: data[0], error: null }
    
  } catch (err) {
    console.error('💥 DB: profiles.getById failed', err)
    
    // Handle session-related errors
    if (err.message && (err.message.includes('Session') || err.message.includes('session'))) {
      console.error('🔒 Session issue detected - triggering auth refresh')
      return { 
        data: null, 
        error: { 
          code: 'SESSION_EXPIRED', 
          message: 'Your session has expired. Please refresh the page.' 
        } 
      }
    }
    
    // Handle timeout errors
    if (err.message && err.message.includes('timeout')) {
      console.error('🕐 Database query timed out')
      return { 
        data: null, 
        error: { 
          code: 'TIMEOUT', 
          message: 'Database query timed out. Please try again.' 
        } 
      }
    }
    
    throw err
  }
},

    update: async (id, updates) => {
      console.log('📊 DB: profiles.update called', { id, updates })
      try {
        // ✅ FIXED: Add timeout protection to updates
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('profiles.update timeout after 30 seconds')), 30000)
        )
        
        const updatePromise = supabase
          .from('registrant_profiles')
          .update(updates)
          .eq('id', id)
          .select()
        
        const { data, error } = await Promise.race([updatePromise, timeoutPromise])
        
        console.log('📊 DB: profiles.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: profiles.update failed', err)
        
        // ✅ FIXED: Handle timeout errors gracefully
        if (err.message && err.message.includes('timeout')) {
          return { 
            data: null, 
            error: { 
              code: 'TIMEOUT', 
              message: 'Profile update timed out. Changes may not have been saved.' 
            } 
          }
        }
        
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
        
        console.log('📊 DB: applicantForms.getByUserId result', { 
          hasData: !!data, 
          dataLength: data?.length,
          hasError: !!error, 
          error: error?.message 
        })

        // ✅ FIXED: Handle multiple rows or no rows gracefully
        if (error) {
          return { data: null, error }
        }
        
        if (!data || data.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'No rows returned' } }
        }
        
        if (data.length > 1) {
          console.warn('⚠️ Multiple applicant forms found for user, using first one:', data.length)
          return { data: data[0], error: null }
        }
        
        return { data: data[0], error: null }
        
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
      console.log('📊 DB: matchingProfiles.create (legacy alias) - checking for existing record first')
      
      // Extract user_id from profileData (handle both user_id and userId)
      const userId = profileData.user_id || profileData.userId;
      
      if (!userId) {
        console.error('❌ No user_id/userId provided to matchingProfiles.create');
        return { data: null, error: { message: 'user_id is required' } };
      }
      
      try {
        // Check if record already exists
        const { data: existingRecord } = await db.applicantForms.getByUserId(userId);
        
        if (existingRecord) {
          console.log('✅ Found existing applicant form, updating instead of creating');
          // Record exists, update it
          // Ensure we're passing the right data structure
          const updateData = { ...profileData };
          delete updateData.userId; // Remove userId if it exists
          updateData.user_id = userId; // Ensure user_id is set
          
          return await db.applicantForms.update(userId, updateData);
        } else {
          console.log('📝 No existing record found, creating new one');
          // No record exists, create it
          // Ensure we're passing the right data structure
          const createData = { ...profileData };
          delete createData.userId; // Remove userId if it exists
          createData.user_id = userId; // Ensure user_id is set
          
          return await db.applicantForms.create(createData);
        }
      } catch (error) {
        console.error('💥 Error in matchingProfiles.create legacy alias:', error);
        return { data: null, error };
      }
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
// Add this to your existing db object in src/utils/supabase.js

// Employer operations (employer_profiles table)
employerProfiles: {
  create: async (employerData) => {
    console.log('📊 DB: employerProfiles.create called', { employerData })
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .insert(employerData)
        .select()
      console.log('📊 DB: employerProfiles.create result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.create failed', err)
      throw err
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
        hasError: !!error, 
        error: error?.message 
      })

      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getByUserId failed', err)
      throw err
    }
  },

  getAvailable: async (filters = {}) => {
    console.log('📊 DB: employerProfiles.getAvailable called', { filters })
    try {
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
        // Use overlaps operator to find profiles that have any of the specified features
        query = query.overlaps('recovery_friendly_features', filters.recoveryFeatures)
      }

      if (filters.jobTypes && filters.jobTypes.length > 0) {
        // Use overlaps operator to find profiles that offer any of the specified job types
        query = query.overlaps('job_types_available', filters.jobTypes)
      }

      if (filters.remoteWork) {
        query = query.eq('remote_work_options', filters.remoteWork)
      }

      // Sort by actively hiring first, then by creation date
      const { data, error } = await query
        .order('is_actively_hiring', { ascending: false })
        .order('created_at', { ascending: false })

      console.log('📊 DB: employerProfiles.getAvailable result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getAvailable failed', err)
      throw err
    }
  },

  getById: async (id) => {
    console.log('📊 DB: employerProfiles.getById called', { id })
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email, phone)
        `)
        .eq('id', id)
        .single()
      
      console.log('📊 DB: employerProfiles.getById result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getById failed', err)
      throw err
    }
  },

  update: async (id, updates) => {
    console.log('📊 DB: employerProfiles.update called', { id, updates })
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      console.log('📊 DB: employerProfiles.update result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.update failed', err)
      throw err
    }
  },

  updateByUserId: async (userId, updates) => {
    console.log('📊 DB: employerProfiles.updateByUserId called', { userId, updates })
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
      console.log('📊 DB: employerProfiles.updateByUserId result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.updateByUserId failed', err)
      throw err
    }
  },

  delete: async (id) => {
    console.log('📊 DB: employerProfiles.delete called', { id })
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .delete()
        .eq('id', id)
      console.log('📊 DB: employerProfiles.delete result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.delete failed', err)
      throw err
    }
  },

  // Get employers by location for local job search
  getByLocation: async (city, state, radius = null) => {
    console.log('📊 DB: employerProfiles.getByLocation called', { city, state, radius })
    try {
      let query = supabase
        .from('employer_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email)
        `)
        .eq('is_active', true)
        .eq('is_actively_hiring', true)

      if (city) {
        query = query.ilike('city', `%${city}%`)
      }

      if (state) {
        query = query.eq('state', state)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      console.log('📊 DB: employerProfiles.getByLocation result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getByLocation failed', err)
      throw err
    }
  },

  // Get employers by industry
  getByIndustry: async (industry) => {
    console.log('📊 DB: employerProfiles.getByIndustry called', { industry })
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email)
        `)
        .eq('is_active', true)
        .eq('industry', industry)
        .order('is_actively_hiring', { ascending: false })
        .order('created_at', { ascending: false })

      console.log('📊 DB: employerProfiles.getByIndustry result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getByIndustry failed', err)
      throw err
    }
  },

  // Search employers by recovery-friendly features
  getByRecoveryFeatures: async (features) => {
    console.log('📊 DB: employerProfiles.getByRecoveryFeatures called', { features })
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email)
        `)
        .eq('is_active', true)
        .overlaps('recovery_friendly_features', features)
        .order('is_actively_hiring', { ascending: false })
        .order('created_at', { ascending: false })

      console.log('📊 DB: employerProfiles.getByRecoveryFeatures result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getByRecoveryFeatures failed', err)
      throw err
    }
  },

  // Get employers with current job openings
  getWithOpenings: async () => {
    console.log('📊 DB: employerProfiles.getWithOpenings called')
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select(`
          *,
          registrant_profiles!inner(id, first_name, email)
        `)
        .eq('is_active', true)
        .eq('is_actively_hiring', true)
        .not('current_openings', 'is', null)
        .order('created_at', { ascending: false })

      console.log('📊 DB: employerProfiles.getWithOpenings result', { hasData: !!data, hasError: !!error, error: error?.message })
      return { data, error }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getWithOpenings failed', err)
      throw err
    }
  },

  // Count profiles by criteria (for analytics)
  getStats: async () => {
    console.log('📊 DB: employerProfiles.getStats called')
    try {
      // Get total active employers
      const { count: totalActive, error: totalError } = await supabase
        .from('employer_profiles')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Get actively hiring employers
      const { count: activelyHiring, error: hiringError } = await supabase
        .from('employer_profiles')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .eq('is_actively_hiring', true)

      // Get employers by industry
      const { data: industryData, error: industryError } = await supabase
        .from('employer_profiles')
        .select('industry')
        .eq('is_active', true)

      const industryStats = {}
      if (industryData) {
        industryData.forEach(emp => {
          if (emp.industry) {
            industryStats[emp.industry] = (industryStats[emp.industry] || 0) + 1
          }
        })
      }

      const stats = {
        totalActive: totalActive || 0,
        activelyHiring: activelyHiring || 0,
        byIndustry: industryStats
      }

      console.log('📊 DB: employerProfiles.getStats result', { stats })
      
      if (totalError || hiringError || industryError) {
        const error = totalError || hiringError || industryError
        console.error('📊 DB: employerProfiles.getStats partial error', error)
        return { data: stats, error }
      }

      return { data: stats, error: null }
    } catch (err) {
      console.error('💥 DB: employerProfiles.getStats failed', err)
      throw err
    }
  }
},
  // ✅ ENHANCED: Peer support operations with comprehensive debugging
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
        // Step 1: Check if ANY peer support profiles exist
        console.log('🔍 Step 1: Checking if ANY peer support profiles exist...')
        const { data: allProfiles, error: allError } = await supabase
          .from('peer_support_profiles')
          .select('id, is_accepting_clients, user_id')
        
        console.log('📊 All peer support profiles:', { 
          count: allProfiles?.length || 0, 
          error: allError?.message,
          sample: allProfiles?.slice(0, 3)
        })

        if (!allProfiles || allProfiles.length === 0) {
          console.log('❌ No peer support profiles found in database!')
          return { data: [], error: null }
        }

        // Step 2: Check how many are accepting clients
        const acceptingClients = allProfiles.filter(p => p.is_accepting_clients === true)
        console.log('📊 Profiles accepting clients:', acceptingClients.length)

        if (acceptingClients.length === 0) {
          console.log('❌ No profiles have is_accepting_clients = true')
          return { data: [], error: null }
        }

        // Step 3: Try the full query with join
        console.log('🔍 Step 3: Trying full query with registrant_profiles join...')
        let query = supabase
          .from('peer_support_profiles')
          .select(`
            *,
            registrant_profiles!inner(id, first_name, email)
          `)
          .eq('is_accepting_clients', true)

        const { data: joinedData, error: joinError } = await query
        console.log('📊 Query with join result:', { 
          count: joinedData?.length || 0, 
          error: joinError?.message,
          sample: joinedData?.slice(0, 2)
        })

        if (!joinedData || joinedData.length === 0) {
          console.log('❌ Join with registrant_profiles failed or returned no results')
          
          // Step 4: Try without the inner join to see if that's the issue
          console.log('🔍 Step 4: Trying query WITHOUT inner join...')
          const { data: noJoinData, error: noJoinError } = await supabase
            .from('peer_support_profiles')
            .select('*')
            .eq('is_accepting_clients', true)
          
          console.log('📊 Query WITHOUT join result:', { 
            count: noJoinData?.length || 0, 
            error: noJoinError?.message,
            sample: noJoinData?.slice(0, 2)
          })
          
          return { data: noJoinData || [], error: noJoinError }
        }

        // Step 5: Apply filters if we have data
        let filteredData = joinedData

        if (filters.specialties && filters.specialties.length > 0 && filters.specialties.length < 15) {
          console.log('🔍 Applying specialties filter...')
          const beforeFilter = filteredData.length
          // Try a more flexible specialty matching
          filteredData = filteredData.filter(profile => {
            if (!profile.specialties || !Array.isArray(profile.specialties)) return false
            return filters.specialties.some(specialty => 
              profile.specialties.some(profileSpecialty => 
                profileSpecialty.toLowerCase().includes(specialty.toLowerCase()) ||
                specialty.toLowerCase().includes(profileSpecialty.toLowerCase())
              )
            )
          })
          console.log(`📊 Specialties filter: ${beforeFilter} -> ${filteredData.length}`)
        }

        if (filters.serviceArea && filters.serviceArea.trim()) {
          console.log('🔍 Applying service area filter...')
          const beforeFilter = filteredData.length
          const searchArea = filters.serviceArea.trim().toLowerCase()
          
          // Extract key location terms for flexible matching
          const searchTerms = searchArea.split(/[,\s]+/).filter(term => term.length > 2)
          console.log('🔍 Search terms extracted:', searchTerms)
          
          filteredData = filteredData.filter(profile => {
            if (!profile.service_area) {
              console.log('❌ Profile has no service_area:', profile.user_id)
              return false
            }
            
            console.log('🔍 Checking profile service_area:', profile.service_area)
            
            // Handle both array and string service areas
            let serviceAreas = []
            if (Array.isArray(profile.service_area)) {
              serviceAreas = profile.service_area
            } else if (typeof profile.service_area === 'string') {
              serviceAreas = [profile.service_area]
            } else {
              console.log('❌ Invalid service_area type:', typeof profile.service_area)
              return false
            }
            
            // Check if any search term matches any service area
            const matches = serviceAreas.some(area => {
              const areaLower = area.toLowerCase()
              return searchTerms.some(term => {
                const match = areaLower.includes(term) || term.includes(areaLower)
                if (match) {
                  console.log(`✅ Match found: "${term}" <-> "${area}"`)
                }
                return match
              })
            })
            
            console.log(`🔍 Profile ${profile.user_id} match result:`, matches)
            return matches
          })
          console.log(`📊 Service area filter: ${beforeFilter} -> ${filteredData.length}`)
        }

        // Sort by experience
        filteredData.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))

        console.log('📊 Final result:', { 
          count: filteredData.length,
          sample: filteredData.slice(0, 2)
        })

        return { data: filteredData, error: null }

      } catch (err) {
        console.error('💥 DB: peerSupportProfiles.getAvailable failed', err)
        return { data: [], error: err }
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

  // Match Groups operations
  matchGroups: {
    create: async (groupData) => {
      console.log('📊 DB: matchGroups.create called', { groupData })
      try {
        const { data, error } = await supabase
          .from('match_groups')
          .insert(groupData)
          .select()
        console.log('📊 DB: matchGroups.create result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.create failed', err)
        throw err
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
        console.log('📊 DB: matchGroups.getByUserId result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.getByUserId failed', err)
        throw err
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
        console.log('📊 DB: matchGroups.getById result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.getById failed', err)
        throw err
      }
    },

    update: async (id, updates) => {
      console.log('📊 DB: matchGroups.update called', { id, updates })
      try {
        const { data, error } = await supabase
          .from('match_groups')
          .update(updates)
          .eq('id', id)
          .select()
        console.log('📊 DB: matchGroups.update result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.update failed', err)
        throw err
      }
    },

    getActiveGroups: async (userId) => {
      console.log('📊 DB: matchGroups.getActiveGroups called', { userId })
      try {
        const { data, error } = await supabase
          .from('match_groups')
          .select(`
            *,
            applicant_1:registrant_profiles!applicant_1_id(id, first_name, email),
            applicant_2:registrant_profiles!applicant_2_id(id, first_name, email),
            landlord:registrant_profiles!landlord_id(id, first_name, email),
            peer_support:registrant_profiles!peer_support_id(id, first_name, email),
            property:properties!property_id(id, title, city)
          `)
          .or(`applicant_1_id.eq.${userId},applicant_2_id.eq.${userId},landlord_id.eq.${userId},peer_support_id.eq.${userId}`)
          .in('status', ['active', 'forming'])
          .order('formed_at', { ascending: false, nullsFirst: false })
        console.log('📊 DB: matchGroups.getActiveGroups result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.getActiveGroups failed', err)
        throw err
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
    },

    // End a match group (works for all types)
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
        console.log('📊 DB: matchGroups.endGroup result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.endGroup failed', err)
        throw err
      }
    },

    // Activate a forming group (moves from 'forming' to 'active')
    activateGroup: async (groupId) => {
      console.log('📊 DB: matchGroups.activateGroup called', { groupId })
      try {
        const updates = {
          status: 'active',
          formed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('match_groups')
          .update(updates)
          .eq('id', groupId)
          .select()
        console.log('📊 DB: matchGroups.activateGroup result', { hasData: !!data, hasError: !!error, error: error?.message })
        return { data, error }
      } catch (err) {
        console.error('💥 DB: matchGroups.activateGroup failed', err)
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
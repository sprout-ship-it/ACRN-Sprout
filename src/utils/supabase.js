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
        // ✅ FIXED: Increased timeout to 15 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('profiles.getById timeout after 15 seconds')), 15000)
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

        // ✅ FIXED: Handle multiple rows or no rows gracefully
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
        
        // ✅ FIXED: Better timeout error handling
        if (err.message && err.message.includes('timeout')) {
          console.error('🕐 Database query timed out - this may indicate connectivity issues')
          return { 
            data: null, 
            error: { 
              code: 'TIMEOUT', 
              message: 'Database query timed out. Please check your connection and try again.' 
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
          setTimeout(() => reject(new Error('profiles.update timeout after 10 seconds')), 10000)
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
// Replace the matchGroups section in your supabase.js with this unified version:

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
          applicant_1:registrant_profiles!applicant_1_id(id, first_name, email),
          applicant_2:registrant_profiles!applicant_2_id(id, first_name, email),
          landlord:registrant_profiles!landlord_id(id, first_name, email),
          peer_support:registrant_profiles!peer_support_id(id, first_name, email),
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
          applicant_1:registrant_profiles!applicant_1_id(id, first_name, email, phone),
          applicant_2:registrant_profiles!applicant_2_id(id, first_name, email, phone),
          landlord:registrant_profiles!landlord_id(id, first_name, email, phone),
          peer_support:registrant_profiles!peer_support_id(id, first_name, email, phone),
          property:properties!property_id(id, title, address, city, monthly_rent)
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
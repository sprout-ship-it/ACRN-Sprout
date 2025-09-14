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
  }
}

console.log('✅ Supabase module fully loaded')
export default supabase
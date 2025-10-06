// src/utils/database/peerSupportService.js - FIXED VERSION
/**
 * Peer support service for peer_support_profiles table operations
 * ✅ FIXED: All field names match schema exactly
 * ✅ FIXED: Removed conflicting standalone function
 * ✅ FIXED: Consistent service factory pattern
 */
import { supabase } from '../supabase';

const createPeerSupportService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for peer support service');
  }

  const tableName = 'peer_support_profiles';

  const service = {
    /**
     * Create peer support profile
     */
    create: async (profileData) => {
      try {
        console.log('🤝 PeerSupport: Creating profile for user:', profileData.user_id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert({
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ PeerSupport: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ PeerSupport: Profile created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 PeerSupport: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get peer support profile by user ID (registrant_profiles.id)
     */
getByUserId: async (userId) => {
      try {
        console.log('🤝 PeerSupport: Fetching profile for user:', userId);

        // ✅ FIXED: Use regular query instead of .single() for "maybe exists" queries
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('❌ PeerSupport: GetByUserId failed:', error.message);
          return { success: false, data: null, error };
        }

        // ✅ FIXED: Check if any results exist
        if (!data || data.length === 0) {
          console.log('ℹ️ PeerSupport: No profile found for user:', userId);
          return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'No peer support profile found' } };
        }

        // ✅ FIXED: Return the first (and should be only) result
        console.log('✅ PeerSupport: Profile retrieved successfully');
        return { success: true, data: data[0], error: null };

      } catch (err) {
        console.error('💥 PeerSupport: GetByUserId exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update peer support profile
     */
    update: async (userId, updates) => {
      try {
        console.log('🤝 PeerSupport: Updating profile for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('❌ PeerSupport: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ PeerSupport: Profile updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 PeerSupport: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete peer support profile
     */
    delete: async (userId) => {
      try {
        console.log('🤝 PeerSupport: Deleting profile for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('user_id', userId)
          .select();

        if (error) {
          console.error('❌ PeerSupport: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ PeerSupport: Profile deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 PeerSupport: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get available peer support profiles with filters
     * ✅ FIXED: Uses correct field name 'accepting_clients'
     */
/**
     * Get available peer support profiles with filters
     * ✅ FIXED: Fetch name data separately to avoid RLS JOIN issues
     */
    getAvailable: async (filters = {}) => {
      try {
        console.log('🤝 PeerSupport: Fetching available profiles with filters:', filters);

        // ✅ STEP 1: Get peer support profiles without JOIN first
        let query = supabaseClient
          .from(tableName)
          .select('*')  // Get peer support data without JOIN
          .eq('accepting_clients', true)
          .eq('is_active', true);

        const { data: peerProfiles, error } = await query
          .order('years_experience', { ascending: false })
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('❌ PeerSupport: GetAvailable failed:', error.message);
          return { success: false, data: [], error };
        }

        if (!peerProfiles || peerProfiles.length === 0) {
          console.log('✅ PeerSupport: Found 0 available profiles');
          return { success: true, data: [], error: null };
        }

        // ✅ STEP 2: Get user info separately for each peer specialist
        const enrichedProfiles = await Promise.all(
          peerProfiles.map(async (profile) => {
            try {
              // Fetch the registrant profile data separately
              const { data: userInfo } = await supabaseClient
                .from('registrant_profiles')
                .select('id, first_name, last_name, email')
                .eq('id', profile.user_id)
                .single();

              // Combine the data like the original JOIN would have done
              return {
                ...profile,
                first_name: userInfo?.first_name || null,
                last_name: userInfo?.last_name || null,
                email: userInfo?.email || null,
                registrant_profiles: userInfo || null
              };
            } catch (userError) {
              console.warn('⚠️ Could not fetch user info for peer specialist:', profile.user_id, userError);
              // Return profile without user info rather than failing completely
              return {
                ...profile,
                first_name: null,
                last_name: null,
                email: null,
                registrant_profiles: null
              };
            }
          })
        );

        // ✅ STEP 3: Apply JavaScript filters for complex logic (existing logic)
        let filteredData = enrichedProfiles;

        if (filters.specialties && filters.specialties.length > 0) {
          filteredData = filteredData.filter(profile => {
            if (!profile.specialties || !Array.isArray(profile.specialties)) return false;
            return filters.specialties.some(specialty => 
              profile.specialties.some(profileSpecialty => 
                profileSpecialty.toLowerCase().includes(specialty.toLowerCase()) ||
                specialty.toLowerCase().includes(profileSpecialty.toLowerCase())
              )
            );
          });
        }

        if (filters.serviceArea && filters.serviceArea.trim()) {
          const searchArea = filters.serviceArea.trim().toLowerCase();
          const searchTerms = searchArea.split(/[,\s]+/).filter(term => term.length > 2);
          
          filteredData = filteredData.filter(profile => {
            if (!profile.service_areas) return false;
            
            let serviceAreas = [];
            if (Array.isArray(profile.service_areas)) {
              serviceAreas = profile.service_areas;
            } else if (typeof profile.service_areas === 'string') {
              serviceAreas = [profile.service_areas];
            } else {
              return false;
            }
            
            return serviceAreas.some(area => {
              const areaLower = area.toLowerCase();
              return searchTerms.some(term => 
                areaLower.includes(term) || term.includes(areaLower)
              );
            });
          });
        }

        if (filters.recoveryMethods && filters.recoveryMethods.length > 0) {
          filteredData = filteredData.filter(profile => {
            if (!profile.supported_recovery_methods) return false;
            return filters.recoveryMethods.some(method =>
              profile.supported_recovery_methods.includes(method)
            );
          });
        }

        if (filters.minExperience) {
          filteredData = filteredData.filter(profile => 
            (profile.years_experience || 0) >= filters.minExperience
          );
        }

        if (filters.isLicensed !== undefined) {
          filteredData = filteredData.filter(profile => 
            profile.is_licensed === filters.isLicensed
          );
        }

        console.log(`✅ PeerSupport: Found ${filteredData.length} available profiles`);
        return { success: true, data: filteredData, error: null };

      } catch (err) {
        console.error('💥 PeerSupport: GetAvailable exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Search peer support profiles
     * ✅ FIXED: Uses correct field name 'accepting_clients'
     */
    search: async (searchTerm, filters = {}) => {
      try {
        console.log('🤝 PeerSupport: Searching profiles:', searchTerm);

        let query = supabaseClient
          .from(tableName)
          .select(`
            *,
            registrant_profiles!inner(id, first_name, last_name, email)
          `)
          .eq('accepting_clients', true)
          .eq('is_active', true);

        // Apply basic database filters first
        if (filters.isLicensed !== undefined) {
          query = query.eq('is_licensed', filters.isLicensed);
        }

        if (filters.minExperience) {
          query = query.gte('years_experience', filters.minExperience);
        }

        const { data, error } = await query
          .order('years_experience', { ascending: false })
          .limit(20);

        if (error) {
          console.error('❌ PeerSupport: Search failed:', error.message);
          return { success: false, data: [], error };
        }

        let results = data || [];

        // Apply text search filter
        if (searchTerm && searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          results = results.filter(profile => {
            const searchableText = [
              profile.professional_title,
              profile.bio,
              ...(profile.specialties || []),
              ...(profile.service_areas || [])
            ].filter(Boolean).join(' ').toLowerCase();

            return searchableText.includes(term);
          });
        }

        // Apply remaining filters
        if (filters.specialties && filters.specialties.length > 0) {
          results = results.filter(profile =>
            profile.specialties && 
            filters.specialties.some(specialty =>
              profile.specialties.some(ps => ps.toLowerCase().includes(specialty.toLowerCase()))
            )
          );
        }

        console.log(`✅ PeerSupport: Search found ${results.length} results`);
        return { success: true, data: results, error: null };

      } catch (err) {
        console.error('💥 PeerSupport: Search exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get peer support profiles by specialty
     */
    getBySpecialty: async (specialty) => {
      try {
        console.log('🤝 PeerSupport: Fetching profiles by specialty:', specialty);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            registrant_profiles!inner(id, first_name, last_name, email)
          `)
          .eq('accepting_clients', true)
          .eq('is_active', true)
          .contains('specialties', [specialty])
          .order('years_experience', { ascending: false });

        if (error) {
          console.error('❌ PeerSupport: GetBySpecialty failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ PeerSupport: Found ${data?.length || 0} profiles with specialty: ${specialty}`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 PeerSupport: GetBySpecialty exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get peer support profiles by service area
     */
    getByServiceArea: async (serviceArea) => {
      try {
        console.log('🤝 PeerSupport: Fetching profiles by service area:', serviceArea);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            registrant_profiles!inner(id, first_name, last_name, email)
          `)
          .eq('accepting_clients', true)
          .eq('is_active', true)
          .contains('service_areas', [serviceArea])
          .order('years_experience', { ascending: false });

        if (error) {
          console.error('❌ PeerSupport: GetByServiceArea failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ PeerSupport: Found ${data?.length || 0} profiles in service area: ${serviceArea}`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 PeerSupport: GetByServiceArea exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Update availability status
     * ✅ FIXED: Uses correct field name 'accepting_clients'
     */
    updateAvailability: async (userId, isAccepting) => {
      try {
        console.log('🤝 PeerSupport: Updating availability for user:', userId, 'to:', isAccepting);

        return await service.update(userId, { 
          accepting_clients: isAccepting,
          updated_at: new Date().toISOString()
        });

      } catch (err) {
        console.error('💥 PeerSupport: UpdateAvailability exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get peer support statistics
     * ✅ FIXED: Uses correct field name 'accepting_clients'
     */
    getStatistics: async () => {
      try {
        console.log('🤝 PeerSupport: Fetching statistics');

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('specialties, accepting_clients, is_licensed, years_experience, created_at');

        if (error) {
          console.error('❌ PeerSupport: Statistics failed:', error.message);
          return { success: false, data: null, error };
        }

        const stats = {
          total: data.length,
          acceptingClients: data.filter(p => p.accepting_clients).length,
          licensed: data.filter(p => p.is_licensed).length,
          averageExperience: data.length > 0 ? Math.round(
            data.reduce((sum, p) => sum + (p.years_experience || 0), 0) / data.length
          ) : 0,
          bySpecialty: {},
          experienceRanges: {
            '0-2': 0,
            '3-5': 0,
            '6-10': 0,
            '11+': 0
          },
          recentlyJoined: data.filter(p => {
            const createdDate = new Date(p.created_at);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return createdDate > monthAgo;
          }).length
        };

        // Count specialties
        data.forEach(profile => {
          if (profile.specialties && Array.isArray(profile.specialties)) {
            profile.specialties.forEach(specialty => {
              stats.bySpecialty[specialty] = (stats.bySpecialty[specialty] || 0) + 1;
            });
          }

          // Count experience ranges
          const experience = profile.years_experience || 0;
          if (experience <= 2) stats.experienceRanges['0-2']++;
          else if (experience <= 5) stats.experienceRanges['3-5']++;
          else if (experience <= 10) stats.experienceRanges['6-10']++;
          else stats.experienceRanges['11+']++;
        });

        console.log('✅ PeerSupport: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 PeerSupport: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get profile by ID (with user details)
     */
    getById: async (id) => {
      try {
        console.log('🤝 PeerSupport: Fetching profile by ID:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            registrant_profiles!inner(id, first_name, last_name, email)
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Profile not found' } };
          }
          console.error('❌ PeerSupport: GetById failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ PeerSupport: Profile retrieved successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 PeerSupport: GetById exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Bulk update profiles
     */
    bulkUpdate: async (updates) => {
      try {
        console.log('🤝 PeerSupport: Bulk updating', updates.length, 'profiles');

        const operations = updates.map(({ userId, data }) =>
          service.update(userId, data)
        );

        const results = await Promise.allSettled(operations);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
        const failed = results.filter(r => r.status === 'rejected' || !r.value?.success);

        console.log(`✅ PeerSupport: Bulk update complete - ${successful.length} success, ${failed.length} failed`);
        
        return {
          success: true,
          data: {
            successful: successful.length,
            failed: failed.length,
            total: updates.length,
            results
          },
          error: null
        };

      } catch (err) {
        console.error('💥 PeerSupport: Bulk update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return service;
};
// ADD THESE EXPORTS TO THE END OF YOUR EXISTING peerSupportService.js FILE
// (After the existing createPeerSupportService function)

// ✅ MISSING STANDALONE FUNCTIONS - Add these to your existing file

/**
 * ✅ PRIMARY STANDALONE FUNCTION: Get peer support profile by user ID
 * This matches the pattern of getMatchingProfile() and getRegistrantProfile()
 * @param {string} userId - registrant_profiles.id (user_id in peer_support_profiles)
 * @param {Object} supabaseClient - Optional authenticated supabase client
 * @returns {Object} Database response
 */
export const getPeerSupportProfile = async (userId, authenticatedSupabase = null) => {
  try {
    console.log('🤝 Fetching peer support profile for user:', userId);
    
    // Create client if not provided (like other working services)
// ✅ FIXED: Use authenticated client instead of creating new one
const supabaseClient = authenticatedSupabase || supabase;

    const { data, error } = await supabaseClient
      .from('peer_support_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No peer support profile found for user:', userId);
        return { success: false, error: 'No peer support profile found', code: 'NOT_FOUND' };
      }
      console.error('❌ Error fetching peer support profile:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Peer support profile retrieved successfully');
    return { success: true, data };

  } catch (err) {
    console.error('💥 Error in getPeerSupportProfile:', err);
    return { success: false, error: err.message };
  }
};

/**
 * ✅ SECONDARY STANDALONE FUNCTION: Get profile by peer_support_profiles.id
 * @param {string} profileId - peer_support_profiles.id
 * @param {Object} supabaseClient - Optional authenticated supabase client
 * @returns {Object} Database response
 */
export const getPeerSupportProfileById = async (profileId, authenticatedSupabase = null) => {
  try {
    console.log('🤝 Fetching peer support profile by ID:', profileId);
    
const supabaseClient = authenticatedSupabase || supabase;

    const { data, error } = await supabaseClient
      .from('peer_support_profiles')
      .select(`
        *,
        registrant_profiles!inner(id, first_name, last_name, email)
      `)
      .eq('id', profileId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Profile not found', code: 'NOT_FOUND' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (err) {
    console.error('💥 Error in getPeerSupportProfileById:', err);
    return { success: false, error: err.message };
  }
};
// ✅ REMOVED: Conflicting standalone function that created its own supabase client

export default createPeerSupportService;
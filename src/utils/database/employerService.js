// src/utils/database/employerService.js - FIXED TO MATCH EXISTING SUPABASE.JS STRUCTURE
import { supabase } from '../supabase';

const createEmployerService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for employer service');
  }

  // Profiles service (existing implementation)
  const profiles = {
    tableName: 'employer_profiles',

    /**
     * Create employer profile
     */
    create: async (employerData) => {
      try {
        console.log('💼 Employers: Creating profile for user:', employerData.user_id);

        const { data, error } = await supabaseClient
          .from(profiles.tableName)
          .insert({
            ...employerData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Employers: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Employers: Profile created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Employers: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get employer profiles by user ID (registrant_profiles.id)
     */
    getByUserId: async (userId) => {
      try {
        console.log('💼 Employers: Fetching profiles for user:', userId);

        const { data, error } = await supabaseClient
          .from(profiles.tableName)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Employers: GetByUserId failed:', error.message);
          return { success: false, data: [], error };
        }

        if (!data || data.length === 0) {
          console.log('ℹ️ Employers: No profiles found for user:', userId);
          return { success: false, data: [], error: { code: 'NOT_FOUND', message: 'No employer profiles found' } };
        }

        console.log(`✅ Employers: Found ${data?.length || 0} profiles for user`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Employers: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Update employer profile
     */
    update: async (id, updates) => {
      try {
        console.log('💼 Employers: Updating profile:', id);

        const { data, error } = await supabaseClient
          .from(profiles.tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Employers: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Employers: Profile updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Employers: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete employer profile
     */
    delete: async (id) => {
      try {
        console.log('💼 Employers: Deleting profile:', id);

        const { data, error } = await supabaseClient
          .from(profiles.tableName)
          .delete()
          .eq('id', id)
          .select();

        if (error) {
          console.error('❌ Employers: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Employers: Profile deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Employers: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get available employer profiles with filters
     */
    getAvailable: async (filters = {}) => {
      try {
        console.log('💼 Employers: Fetching available profiles with filters:', filters);

        let query = supabaseClient
          .from(profiles.tableName)
          .select('*')
          .eq('is_active', true);

        // Apply filters with correct field names from schema
        if (filters.isActivelyHiring) {
          query = query.eq('is_actively_hiring', true);
        }

        if (filters.industry) {
          query = query.eq('industry', filters.industry);
        }

        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }

        if (filters.state) {
          query = query.eq('state', filters.state);
        }

        if (filters.businessType) {
          query = query.eq('business_type', filters.businessType);
        }

        // Array filters with correct field names
        if (filters.recoveryMethods && filters.recoveryMethods.length > 0) {
          query = query.overlaps('recovery_friendly_features', filters.recoveryMethods);
        }

        if (filters.jobTypes && filters.jobTypes.length > 0) {
          query = query.overlaps('job_types_available', filters.jobTypes);
        }

        const { data, error } = await query
          .order('updated_at', { ascending: false })
          .limit(filters.limit || 50);

        if (error) {
          console.error('❌ Employers: GetAvailable failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Employers: Found ${data?.length || 0} available profiles`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Employers: GetAvailable exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Search employer profiles
     */
    search: async (searchTerm, filters = {}) => {
      try {
        console.log('💼 Employers: Searching profiles:', searchTerm);

        let query = supabaseClient
          .from(profiles.tableName)
          .select('*')
          .eq('is_active', true);

        // Text search with correct field names
        if (searchTerm) {
          query = query.or(`company_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`);
        }

        // Apply additional filters with correct field names
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value) && value.length > 0) {
              if (key === 'jobTypes') {
                query = query.overlaps('job_types_available', value);
              } else if (key === 'recoveryMethods') {
                query = query.overlaps('recovery_friendly_features', value);
              }
            } else {
              if (key === 'isActivelyHiring') {
                query = query.eq('is_actively_hiring', value);
              } else {
                query = query.eq(key, value);
              }
            }
          }
        });

        const { data, error } = await query
          .order('is_actively_hiring', { ascending: false })
          .limit(20);

        if (error) {
          console.error('❌ Employers: Search failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Employers: Search found ${data?.length || 0} results`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Employers: Search exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get employer statistics
     */
    getStatistics: async (userId = null) => {
      try {
        console.log('💼 Employers: Fetching statistics', userId ? `for user: ${userId}` : 'system-wide');

        let query = supabaseClient
          .from(profiles.tableName)
          .select('industry, business_type, is_actively_hiring, is_active, created_at');

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Employers: Statistics failed:', error.message);
          return { success: false, data: null, error };
        }

        const stats = {
          total: data.length,
          active: data.filter(p => p.is_active).length,
          activelyHiring: data.filter(p => p.is_actively_hiring).length,
          byIndustry: {},
          byBusinessType: {},
          recentlyAdded: data.filter(p => {
            const createdDate = new Date(p.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate > weekAgo;
          }).length
        };

        // Group by industry and business type
        data.forEach(profile => {
          const industry = profile.industry || 'Unknown';
          const businessType = profile.business_type || 'Unknown';
          
          stats.byIndustry[industry] = (stats.byIndustry[industry] || 0) + 1;
          stats.byBusinessType[businessType] = (stats.byBusinessType[businessType] || 0) + 1;
        });

        console.log('✅ Employers: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 Employers: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  // ✅ CRITICAL: Favorites service that matches existing supabase.js structure
  const favorites = {
    tableName: 'employer_favorites',

    /**
     * ✅ FIXED: Get user's favorite employers
     * @param {string} userId - registrant_profiles.id of the user
     * @returns {Object} Database response with favorites list
     */
    getByUserId: async (userId) => {
      try {
        console.log('⭐ Favorites: Getting favorites for user:', userId);

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Favorites: GetByUserId failed:', error);
          return { success: false, data: [], error };
        }

        console.log(`✅ Favorites: Found ${data?.length || 0} favorites for user ${userId}`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Favorites: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Add employer to favorites
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerUserId - registrant_profiles.id of the employer
     * @returns {Object} Database response
     */
    add: async (userId, employerUserId) => {
      try {
        console.log('⭐ Favorites: Adding favorite:', {
          user_id: userId,
          employer_user_id: employerUserId,
          table: favorites.tableName
        });

        // Check if already favorited to prevent duplicates
        const existingCheck = await favorites.isFavorited(userId, employerUserId);
        if (existingCheck.success && existingCheck.data) {
          console.log('⚠️ Already favorited, not adding duplicate');
          return { 
            success: false, 
            data: null, 
            error: { message: 'Employer already favorited', code: 'ALREADY_FAVORITED' }
          };
        }

        // Insert new favorite record
        const favoriteData = {
          user_id: userId,
          employer_user_id: employerUserId,
          created_at: new Date().toISOString()
        };

        console.log('📝 Inserting favorite data:', favoriteData);

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .insert(favoriteData)
          .select()
          .single();

        if (error) {
          console.error('❌ Favorites: Add failed:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return { success: false, data: null, error };
        }

        console.log('✅ Favorites: Favorite added successfully:', data);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Favorites: Add exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Remove employer from favorites
     * @param {string} userId - registrant_profiles.id of the user  
     * @param {string} employerUserId - registrant_profiles.id of the employer
     * @returns {Object} Database response
     */
    remove: async (userId, employerUserId) => {
      try {
        console.log('⭐ Favorites: Removing favorite:', {
          user_id: userId,
          employer_user_id: employerUserId
        });

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .delete()
          .eq('user_id', userId)
          .eq('employer_user_id', employerUserId)
          .select();

        if (error) {
          console.error('❌ Favorites: Remove failed:', error);
          return { success: false, data: null, error };
        }

        if (!data || data.length === 0) {
          console.log('⚠️ No favorite found to remove');
          return { 
            success: false, 
            data: null, 
            error: { message: 'Favorite not found', code: 'NOT_FOUND' }
          };
        }

        console.log('✅ Favorites: Favorite removed successfully:', data);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Favorites: Remove exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Check if employer is favorited
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerUserId - registrant_profiles.id of the employer  
     * @returns {Object} Database response with boolean result
     */
    isFavorited: async (userId, employerUserId) => {
      try {
        console.log('🔍 Favorites: Checking if favorited:', {
          user_id: userId,
          employer_user_id: employerUserId
        });

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .select('id')
          .eq('user_id', userId)
          .eq('employer_user_id', employerUserId)
          .single();

        // Handle "no rows" as not favorited (not an error)
        if (error && error.code === 'PGRST116') {
          console.log('📝 Not favorited (no rows found)');
          return { success: true, data: false, error: null };
        }

        if (error) {
          console.error('❌ Favorites: IsFavorited failed:', error);
          return { success: false, data: false, error };
        }

        const isFavorited = !!data;
        console.log(`📝 Favorited status: ${isFavorited}`);
        return { success: true, data: isFavorited, error: null };

      } catch (err) {
        console.error('💥 Favorites: IsFavorited exception:', err);
        return { success: false, data: false, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Toggle favorite status
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerUserId - registrant_profiles.id of the employer
     * @returns {Object} Database response
     */
    toggle: async (userId, employerUserId) => {
      try {
        console.log('🔄 Favorites: Toggling favorite:', {
          user_id: userId,
          employer_user_id: employerUserId
        });

        const favoriteCheck = await favorites.isFavorited(userId, employerUserId);
        
        if (!favoriteCheck.success) {
          console.error('❌ Could not check favorite status');
          return favoriteCheck;
        }

        if (favoriteCheck.data) {
          // Already favorited - remove it
          console.log('💔 Removing existing favorite');
          return await favorites.remove(userId, employerUserId);
        } else {
          // Not favorited - add it
          console.log('❤️ Adding new favorite');
          return await favorites.add(userId, employerUserId);
        }

      } catch (err) {
        console.error('💥 Favorites: Toggle exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  // ✅ CRITICAL: Return structure that matches supabase.js expectations
  return {
    profiles,
    favorites
  };
};

// ✅ STANDALONE FUNCTION: Get employer profiles by user ID
export const getEmployerProfilesByUserId = async (userId, authenticatedSupabase = null) => {
  try {
    console.log('💼 Fetching employer profiles for registrant profile ID:', userId);
    
    const supabaseClient = authenticatedSupabase || supabase;

    const { data, error } = await supabaseClient
      .from('employer_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching employer profiles:', error);
      return { success: false, data: [], error };
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No employer profiles found for user:', userId);
      return { success: false, data: [], error: { code: 'NOT_FOUND', message: 'No employer profiles found' } };
    }

    console.log(`✅ Found ${data.length} employer profiles`);
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getEmployerProfilesByUserId:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export default createEmployerService;
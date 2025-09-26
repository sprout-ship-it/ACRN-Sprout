// src/utils/database/employerService.js - Employer service module
/**
 * Employer service for employer_profiles and employer_favorites table operations
 */

const createEmployerService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for employer service');
  }

  // Profiles service
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
     * Get employer profiles by user ID
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
      .eq('profile_completed', true);

    // Apply filters with correct field names
    if (filters.isActivelyHiring) {
      query = query.eq('accepting_applications', true); // ✅ FIXED: was 'is_actively_hiring'
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.city) {
      query = query.ilike('service_city', `%${filters.city}%`); // ✅ FIXED: was 'city'
    }

    if (filters.state) {
      query = query.eq('service_state', filters.state); // ✅ FIXED: was 'state'
    }

    if (filters.businessType) {
      query = query.eq('business_type', filters.businessType);
    }

    // ✅ REMOVED: remote_work_options doesn't exist in schema
    
    // Array filters with correct field names
    if (filters.recoveryMethods && filters.recoveryMethods.length > 0) {
      query = query.overlaps('supported_recovery_methods', filters.recoveryMethods); // ✅ FIXED: was 'recovery_friendly_features'
    }

    if (filters.jobTypes && filters.jobTypes.length > 0) {
      query = query.overlaps('job_types_available', filters.jobTypes); // ✅ FIXED: was 'current_openings'
    }

    const { data, error } = await query
      .eq('is_active', true) // ✅ ADDED: filter for active profiles
      .eq('accepting_applications', true) // ✅ ADDED: filter for accepting applications
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
      .eq('profile_completed', true)
      .eq('is_active', true);

    // Text search with correct field names
    if (searchTerm) {
      // ✅ FIXED: Use business_name instead of company_name which doesn't exist
      query = query.or(`business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`);
    }

    // Apply additional filters with correct field names
    const fieldMappings = {
      city: 'service_city',
      state: 'service_state',
      isActivelyHiring: 'accepting_applications',
      // Remove fields that don't exist in schema
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const actualField = fieldMappings[key] || key;
        
        // Skip fields that don't exist in schema
        if (['remoteWork', 'recoveryFeatures'].includes(key)) {
          return;
        }

        if (Array.isArray(value) && value.length > 0) {
          // Map array field names
          if (key === 'jobTypes') {
            query = query.overlaps('job_types_available', value);
          } else if (key === 'recoveryMethods') {
            query = query.overlaps('supported_recovery_methods', value);
          } else {
            query = query.overlaps(actualField, value);
          }
        } else {
          query = query.eq(actualField, value);
        }
      }
    });

    const { data, error } = await query
      .order('accepting_applications', { ascending: false }) // ✅ FIXED: was 'is_actively_hiring'
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
      .select('industry, business_type, accepting_applications, is_active, created_at'); // ✅ FIXED: was 'is_actively_hiring'

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
      acceptingApplications: data.filter(p => p.accepting_applications).length, // ✅ FIXED: was 'activelyHiring'
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

  // Favorites service
  const favorites = {
    tableName: 'employer_favorites',
    viewName: 'employer_favorites_with_details',

    /**
     * Get all favorites for a user with employer details
     */
    getByUserId: async (userId) => {
      try {
        console.log('⭐ Employer Favorites: Fetching for user:', userId);

        const { data, error } = await supabaseClient
          .from(favorites.viewName)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Employer Favorites: GetByUserId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Employer Favorites: Found ${data?.length || 0} favorites`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Employer Favorites: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Add a favorite
     */
    add: async (userId, employerUserId) => {
      try {
        console.log('⭐ Employer Favorites: Adding favorite:', { userId, employerUserId });

        // Check if already favorited
        const existing = await favorites.isFavorited(userId, employerUserId);
        if (existing.success && existing.data) {
          return { 
            success: false, 
            data: null, 
            error: { message: 'Employer already favorited', code: 'ALREADY_FAVORITED' }
          };
        }

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .insert({ 
            user_id: userId, 
            employer_user_id: employerUserId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Employer Favorites: Add failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Employer Favorites: Added successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Employer Favorites: Add exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Remove a favorite
     */
    remove: async (userId, employerUserId) => {
      try {
        console.log('⭐ Employer Favorites: Removing favorite:', { userId, employerUserId });

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .delete()
          .eq('user_id', userId)
          .eq('employer_user_id', employerUserId)
          .select();

        if (error) {
          console.error('❌ Employer Favorites: Remove failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Employer Favorites: Removed successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Employer Favorites: Remove exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Check if employer is favorited
     */
    isFavorited: async (userId, employerUserId) => {
      try {
        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .select('id')
          .eq('user_id', userId)
          .eq('employer_user_id', employerUserId)
          .single();

        // If data exists, it's favorited; if no data but no error, it's not favorited
        const isFavorited = !!data && !error;

        return { 
          success: true,
          data: isFavorited, 
          error: error?.code === 'PGRST116' ? null : error 
        };

      } catch (err) {
        console.error('💥 Employer Favorites: IsFavorited exception:', err);
        return { success: false, data: false, error: { message: err.message } };
      }
    },

    /**
     * Get favorites count for an employer
     */
    getEmployerFavoritesCount: async (employerUserId) => {
      try {
        console.log('⭐ Employer Favorites: Getting count for employer:', employerUserId);

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .select('id', { count: 'exact' })
          .eq('employer_user_id', employerUserId);

        if (error) {
          console.error('❌ Employer Favorites: Count failed:', error.message);
          return { success: false, data: 0, error };
        }

        const count = data?.length || 0;
        console.log(`✅ Employer Favorites: Count is ${count}`);
        return { success: true, data: count, error: null };

      } catch (err) {
        console.error('💥 Employer Favorites: Count exception:', err);
        return { success: false, data: 0, error: { message: err.message } };
      }
    },

    /**
     * Batch check if multiple employers are favorited
     */
    checkMultipleFavorites: async (userId, employerUserIds) => {
      try {
        console.log('⭐ Employer Favorites: Batch checking favorites for user:', userId);

        if (!employerUserIds || employerUserIds.length === 0) {
          return { success: true, data: new Set(), error: null };
        }

        const { data, error } = await supabaseClient
          .from(favorites.tableName)
          .select('employer_user_id')
          .eq('user_id', userId)
          .in('employer_user_id', employerUserIds);

        if (error) {
          console.error('❌ Employer Favorites: Batch check failed:', error.message);
          return { success: false, data: new Set(), error };
        }

        // Convert to Set of favorited employer IDs
        const favoritedIds = new Set(data?.map(fav => fav.employer_user_id) || []);

        console.log(`✅ Employer Favorites: Found ${favoritedIds.size} favorited employers`);
        return { success: true, data: favoritedIds, error: null };

      } catch (err) {
        console.error('💥 Employer Favorites: Batch check exception:', err);
        return { success: false, data: new Set(), error: { message: err.message } };
      }
    },

    /**
     * Toggle favorite status
     */
    toggle: async (userId, employerUserId) => {
      try {
        console.log('⭐ Employer Favorites: Toggling favorite:', { userId, employerUserId });

        const favoriteCheck = await favorites.isFavorited(userId, employerUserId);
        
        if (!favoriteCheck.success) {
          return favoriteCheck;
        }

        if (favoriteCheck.data) {
          // Remove existing favorite
          return await favorites.remove(userId, employerUserId);
        } else {
          // Add new favorite
          return await favorites.add(userId, employerUserId);
        }

      } catch (err) {
        console.error('💥 Employer Favorites: Toggle exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return {
    profiles,
    favorites
  };
};

export const getEmployerProfilesByUserId = async (registrantProfileId) => {
  try {
    console.log('💼 Fetching employer profiles for registrant profile ID:', registrantProfileId);
    
    // Use ES6 import instead of require
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', registrantProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching employer profiles:', error);
      return { success: false, data: [], error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getEmployerProfilesByUserId:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export default createEmployerService;
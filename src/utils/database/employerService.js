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

        // Apply filters
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

        if (filters.remoteWork) {
          query = query.eq('remote_work_options', filters.remoteWork);
        }

        // Array filters
        if (filters.recoveryFeatures && filters.recoveryFeatures.length > 0) {
          query = query.overlaps('recovery_friendly_features', filters.recoveryFeatures);
        }

        if (filters.jobTypes && filters.jobTypes.length > 0) {
          query = query.overlaps('current_openings', filters.jobTypes);
        }

        const { data, error } = await query
          .order('is_actively_hiring', { ascending: false })
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
          .eq('profile_completed', true);

        // Text search
        if (searchTerm) {
          query = query.or(`company_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`);
        }

        // Apply additional filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value) && value.length > 0) {
              query = query.overlaps(key, value);
            } else {
              query = query.eq(key, value);
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
          .select('industry, business_type, is_actively_hiring, created_at');

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

export default createEmployerService;
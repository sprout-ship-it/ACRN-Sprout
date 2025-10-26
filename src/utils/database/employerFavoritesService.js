// src/utils/database/employerFavoritesService.js - FIXED FOR NEW SCHEMA
import { supabase } from '../supabase';

/**
 * ✅ FIXED: Employer favorites service with correct column names
 * Table: employer_favorites
 * Schema: id, user_id (registrant_profiles.id), employer_profile_id (employer_profiles.id), created_at
 */
const createEmployerFavoritesService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for employer favorites service');
  }

  const tableName = 'employer_favorites';

  const service = {
    /**
     * ✅ FIXED: Get user's favorite employers with better error handling
     * @param {string} userId - registrant_profiles.id of the user
     * @returns {Object} Database response with favorites list
     */
    getByUserId: async (userId) => {
      try {
        console.log('⭐ Getting favorites for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Database error getting favorites:', error);
          return { success: false, data: [], error };
        }

        console.log(`✅ Found ${data?.length || 0} favorites for user ${userId}`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Exception getting favorites:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Add employer to favorites with detailed logging
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerProfileId - employer_profiles.id (NOT user_id)
     * @returns {Object} Database response
     */
    add: async (userId, employerProfileId) => {
      try {
        console.log('⭐ Favorites: Adding favorite:', {
          user_id: userId,
          employer_profile_id: employerProfileId,
          table: tableName
        });

        // ✅ FIRST: Check if already favorited to prevent duplicates
        const existingCheck = await service.isFavorited(userId, employerProfileId);
        if (existingCheck.success && existingCheck.data) {
          console.log('⚠️ Already favorited, not adding duplicate');
          return { 
            success: false, 
            data: null, 
            error: { message: 'Employer already favorited', code: 'ALREADY_FAVORITED' }
          };
        }

        // ✅ INSERT: Create new favorite record with explicit timestamp
        const favoriteData = {
          user_id: userId,
          employer_profile_id: employerProfileId,
          created_at: new Date().toISOString()
        };

        console.log('📝 Favorites: Inserting favorite data:', favoriteData);

        const { data, error } = await supabaseClient
          .from(tableName)
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

        console.log('✅ Favorites: Added successfully:', data);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Favorites: Exception adding:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Remove employer from favorites with detailed logging
     * @param {string} userId - registrant_profiles.id of the user  
     * @param {string} employerProfileId - employer_profiles.id (NOT user_id)
     * @returns {Object} Database response
     */
    remove: async (userId, employerProfileId) => {
      try {
        console.log('⭐ Favorites: Removing favorite:', {
          user_id: userId,
          employer_profile_id: employerProfileId,
          table: tableName
        });

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('user_id', userId)
          .eq('employer_profile_id', employerProfileId)
          .select();

        if (error) {
          console.error('❌ Favorites: Remove failed:', error);
          return { success: false, data: null, error };
        }

        if (!data || data.length === 0) {
          console.log('⚠️ Favorites: No favorite found to remove');
          return { 
            success: false, 
            data: null, 
            error: { message: 'Favorite not found', code: 'NOT_FOUND' }
          };
        }

        console.log('✅ Favorites: Removed successfully:', data);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Favorites: Exception removing:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Check if employer is favorited with better error handling
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerProfileId - employer_profiles.id (NOT user_id)
     * @returns {Object} Database response with boolean result
     */
    isFavorited: async (userId, employerProfileId) => {
      try {
        console.log('🔍 Favorites: Checking if favorited:', {
          user_id: userId,
          employer_profile_id: employerProfileId
        });

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id')
          .eq('user_id', userId)
          .eq('employer_profile_id', employerProfileId)
          .single();

        // Handle "no rows" as not favorited (not an error)
        if (error && error.code === 'PGRST116') {
          console.log('📝 Favorites: Not favorited (no rows found)');
          return { success: true, data: false, error: null };
        }

        if (error) {
          console.error('❌ Favorites: IsFavorited failed:', error);
          return { success: false, data: false, error };
        }

        const isFavorited = !!data;
        console.log(`📝 Favorites: Favorited status: ${isFavorited}`);
        return { success: true, data: isFavorited, error: null };

      } catch (err) {
        console.error('💥 Favorites: Exception checking:', err);
        return { success: false, data: false, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Toggle favorite status with comprehensive logic
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerProfileId - employer_profiles.id (NOT user_id)
     * @returns {Object} Database response
     */
    toggle: async (userId, employerProfileId) => {
      try {
        console.log('🔄 Favorites: Toggling favorite:', {
          user_id: userId,
          employer_profile_id: employerProfileId
        });

        const favoriteCheck = await service.isFavorited(userId, employerProfileId);
        
        if (!favoriteCheck.success) {
          console.error('❌ Favorites: Could not check favorite status');
          return favoriteCheck;
        }

        if (favoriteCheck.data) {
          // Already favorited - remove it
          console.log('💔 Favorites: Removing existing favorite');
          return await service.remove(userId, employerProfileId);
        } else {
          // Not favorited - add it
          console.log('❤️ Favorites: Adding new favorite');
          return await service.add(userId, employerProfileId);
        }

      } catch (err) {
        console.error('💥 Favorites: Exception toggling:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ NEW: Get count of favorites for a user
     * @param {string} userId - registrant_profiles.id of the user
     * @returns {Object} Database response with count
     */
    getCount: async (userId) => {
      try {
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id', { count: 'exact' })
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Favorites: Error getting count:', error);
          return { success: false, data: 0, error };
        }

        const count = data?.length || 0;
        console.log(`📊 Favorites: User ${userId} has ${count} favorites`);
        return { success: true, data: count, error: null };

      } catch (err) {
        console.error('💥 Favorites: Exception getting count:', err);
        return { success: false, data: 0, error: { message: err.message } };
      }
    },

    /**
     * ✅ NEW: Test database connection and table access
     * @returns {Object} Test results
     */
    testConnection: async () => {
      try {
        console.log('🧪 Testing employer_favorites table connection...');

        // Test basic table access
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id')
          .limit(1);

        if (error) {
          console.error('❌ Table access test failed:', error);
          return { 
            success: false, 
            error: error,
            message: `Cannot access ${tableName} table: ${error.message}`
          };
        }

        console.log('✅ Table access test passed');
        return { 
          success: true, 
          message: `Successfully connected to ${tableName} table`,
          tableExists: true,
          currentRecords: data?.length || 0
        };

      } catch (err) {
        console.error('💥 Connection test exception:', err);
        return { 
          success: false, 
          error: { message: err.message },
          message: `Connection test failed: ${err.message}`
        };
      }
    }
  };

  return service;
};

// ✅ EXPORT: Standalone functions for direct use
export const addEmployerFavorite = async (userId, employerProfileId, authenticatedSupabase = null) => {
  try {
    console.log('⭐ STANDALONE: Adding employer favorite:', { userId, employerProfileId });
    
    const supabaseClient = authenticatedSupabase || supabase;
    const service = createEmployerFavoritesService(supabaseClient);
    
    return await service.add(userId, employerProfileId);
  } catch (err) {
    console.error('💥 Error in addEmployerFavorite:', err);
    return { success: false, error: err.message };
  }
};

export const removeEmployerFavorite = async (userId, employerProfileId, authenticatedSupabase = null) => {
  try {
    console.log('💔 STANDALONE: Removing employer favorite:', { userId, employerProfileId });
    
    const supabaseClient = authenticatedSupabase || supabase;
    const service = createEmployerFavoritesService(supabaseClient);
    
    return await service.remove(userId, employerProfileId);
  } catch (err) {
    console.error('💥 Error in removeEmployerFavorite:', err);
    return { success: false, error: err.message };
  }
};

export const getEmployerFavorites = async (userId, authenticatedSupabase = null) => {
  try {
    console.log('📋 STANDALONE: Getting employer favorites for user:', userId);
    
    const supabaseClient = authenticatedSupabase || supabase;
    const service = createEmployerFavoritesService(supabaseClient);
    
    return await service.getByUserId(userId);
  } catch (err) {
    console.error('💥 Error in getEmployerFavorites:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const testEmployerFavoritesTable = async (authenticatedSupabase = null) => {
  try {
    console.log('🧪 STANDALONE: Testing employer favorites table...');
    
    const supabaseClient = authenticatedSupabase || supabase;
    const service = createEmployerFavoritesService(supabaseClient);
    
    return await service.testConnection();
  } catch (err) {
    console.error('💥 Error in testEmployerFavoritesTable:', err);
    return { success: false, error: err.message };
  }
};

export default createEmployerFavoritesService;
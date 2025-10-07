// src/utils/database/employerFavoritesService.js - FIXED DATABASE OPERATIONS
import { supabase } from '../supabase';

/**
 * ✅ FIXED: Employer favorites service with correct table operations
 * Table: employer_favorites (no RLS - should be easy writes)
 * Schema: id, user_id (registrant_profiles.id), employer_user_id (registrant_profiles.id), created_at
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
     * @param {string} employerUserId - registrant_profiles.id of the employer
     * @returns {Object} Database response
     */
    add: async (userId, employerUserId) => {
      try {
        console.log('⭐ Adding favorite:', {
          user_id: userId,
          employer_user_id: employerUserId,
          table: tableName
        });

        // ✅ FIRST: Check if already favorited to prevent duplicates
        const existingCheck = await service.isFavorited(userId, employerUserId);
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
          employer_user_id: employerUserId,
          created_at: new Date().toISOString()
        };

        console.log('📝 Inserting favorite data:', favoriteData);

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert(favoriteData)
          .select()
          .single();

        if (error) {
          console.error('❌ Database error adding favorite:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return { success: false, data: null, error };
        }

        console.log('✅ Favorite added successfully:', data);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Exception adding favorite:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Remove employer from favorites with detailed logging
     * @param {string} userId - registrant_profiles.id of the user  
     * @param {string} employerUserId - registrant_profiles.id of the employer
     * @returns {Object} Database response
     */
    remove: async (userId, employerUserId) => {
      try {
        console.log('⭐ Removing favorite:', {
          user_id: userId,
          employer_user_id: employerUserId,
          table: tableName
        });

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('user_id', userId)
          .eq('employer_user_id', employerUserId)
          .select();

        if (error) {
          console.error('❌ Database error removing favorite:', error);
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

        console.log('✅ Favorite removed successfully:', data);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Exception removing favorite:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Check if employer is favorited with better error handling
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerUserId - registrant_profiles.id of the employer  
     * @returns {Object} Database response with boolean result
     */
    isFavorited: async (userId, employerUserId) => {
      try {
        console.log('🔍 Checking if favorited:', {
          user_id: userId,
          employer_user_id: employerUserId
        });

        const { data, error } = await supabaseClient
          .from(tableName)
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
          console.error('❌ Database error checking favorite:', error);
          return { success: false, data: false, error };
        }

        const isFavorited = !!data;
        console.log(`📝 Favorited status: ${isFavorited}`);
        return { success: true, data: isFavorited, error: null };

      } catch (err) {
        console.error('💥 Exception checking favorite:', err);
        return { success: false, data: false, error: { message: err.message } };
      }
    },

    /**
     * ✅ FIXED: Toggle favorite status with comprehensive logic
     * @param {string} userId - registrant_profiles.id of the user
     * @param {string} employerUserId - registrant_profiles.id of the employer
     * @returns {Object} Database response
     */
    toggle: async (userId, employerUserId) => {
      try {
        console.log('🔄 Toggling favorite:', {
          user_id: userId,
          employer_user_id: employerUserId
        });

        const favoriteCheck = await service.isFavorited(userId, employerUserId);
        
        if (!favoriteCheck.success) {
          console.error('❌ Could not check favorite status');
          return favoriteCheck;
        }

        if (favoriteCheck.data) {
          // Already favorited - remove it
          console.log('💔 Removing existing favorite');
          return await service.remove(userId, employerUserId);
        } else {
          // Not favorited - add it
          console.log('❤️ Adding new favorite');
          return await service.add(userId, employerUserId);
        }

      } catch (err) {
        console.error('💥 Exception toggling favorite:', err);
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
          console.error('❌ Error getting favorites count:', error);
          return { success: false, data: 0, error };
        }

        const count = data?.length || 0;
        console.log(`📊 User ${userId} has ${count} favorites`);
        return { success: true, data: count, error: null };

      } catch (err) {
        console.error('💥 Exception getting favorites count:', err);
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
export const addEmployerFavorite = async (userId, employerUserId, authenticatedSupabase = null) => {
  try {
    console.log('⭐ STANDALONE: Adding employer favorite:', { userId, employerUserId });
    
    const supabaseClient = authenticatedSupabase || supabase;
    const service = createEmployerFavoritesService(supabaseClient);
    
    return await service.add(userId, employerUserId);
  } catch (err) {
    console.error('💥 Error in addEmployerFavorite:', err);
    return { success: false, error: err.message };
  }
};

export const removeEmployerFavorite = async (userId, employerUserId, authenticatedSupabase = null) => {
  try {
    console.log('💔 STANDALONE: Removing employer favorite:', { userId, employerUserId });
    
    const supabaseClient = authenticatedSupabase || supabase;
    const service = createEmployerFavoritesService(supabaseClient);
    
    return await service.remove(userId, employerUserId);
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
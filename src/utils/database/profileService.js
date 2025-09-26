// src/utils/database/profileService.js - Optimized for Schema Trigger Integration
/**
 * Profiles service for registrant_profiles table operations
 * 
 * ID HIERARCHY:
 * auth.users.id → registrant_profiles.user_id → registrant_profiles.id → role_table.user_id
 * 
 * This service manages the central hub (registrant_profiles) for role selection
 * UPDATED: Optimized for automatic trigger-based profile creation
 */

const createProfilesService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for profiles service');
  }

  const tableName = 'registrant_profiles';

  const service = {
    /**
     * Create a new registrant profile manually
     * NOTE: This is primarily for fallback scenarios since the trigger should handle most cases
     * 
     * @param {Object} profileData - Profile data including user_id from auth.users.id
     * @returns {Promise<Object>} Creation result
     */
    create: async (profileData) => {
      try {
        console.log('👤 Profiles: Manual profile creation (fallback mode):', {
          ...profileData,
          email: profileData.email ? '***' : undefined
        });

        // Validate required fields for registrant_profiles table
        const requiredFields = ['user_id', 'first_name', 'last_name', 'email', 'roles'];
        const missingFields = requiredFields.filter(field => !profileData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Ensure roles is an array and contains valid roles
        if (!Array.isArray(profileData.roles) || profileData.roles.length === 0) {
          throw new Error('Roles must be a non-empty array');
        }

        const validRoles = ['applicant', 'landlord', 'employer', 'peer-support'];
        const invalidRoles = profileData.roles.filter(role => !validRoles.includes(role));
        if (invalidRoles.length > 0) {
          throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert({
            user_id: profileData.user_id, // References auth.users.id
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email.toLowerCase().trim(),
            roles: profileData.roles,
            is_active: profileData.is_active ?? true,
            created_at: profileData.created_at || new Date().toISOString(),
            updated_at: profileData.updated_at || new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Profiles: Manual create failed:', error.message, error);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Manual registrant profile created successfully', {
          id: data.id,
          user_id: data.user_id,
          roles: data.roles
        });
        
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: Manual create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ PRIMARY METHOD: Get profile by user_id (auth.users.id)
     * This is the primary method AuthContext uses for looking up trigger-created profiles
     * 
     * @param {string} authUserId - auth.users.id 
     * @param {boolean} waitForTrigger - Whether to retry if profile not found (for new registrations)
     * @returns {Promise<Object>} Profile data
     */
    getByUserId: async (authUserId, waitForTrigger = false) => {
      try {
        console.log('👤 Profiles: Fetching profile by auth.users.id (user_id field):', authUserId);

        const fetchProfile = async () => {
          const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .eq('user_id', authUserId) // Query by user_id field which references auth.users.id
            .single();

          return { data, error };
        };

        let { data, error } = await fetchProfile();

        // ✅ NEW: Handle trigger delay for new registrations
        if (error && error.code === 'PGRST116' && waitForTrigger) {
          console.log('⏳ Profiles: Profile not found, waiting for trigger (max 3 attempts)...');
          
          // Retry up to 3 times with exponential backoff
          for (let attempt = 1; attempt <= 3; attempt++) {
            await new Promise(resolve => setTimeout(resolve, attempt * 500)); // 500ms, 1s, 1.5s
            
            const retry = await fetchProfile();
            if (retry.data && !retry.error) {
              data = retry.data;
              error = retry.error;
              console.log(`✅ Profiles: Profile found on attempt ${attempt + 1}`);
              break;
            }
          }
        }

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('ℹ️ Profiles: No profile found for auth user:', authUserId);
            return { 
              success: false, 
              data: null, 
              error: { code: 'NOT_FOUND', message: 'Profile not found' },
              triggerMightHaveFailed: waitForTrigger // Indicate if this was expected to exist
            };
          }
          console.error('❌ Profiles: GetByUserId failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Profile retrieved by user_id successfully', {
          registrant_id: data.id,
          user_id: data.user_id,
          roles: data.roles,
          created_at: data.created_at
        });
        
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: GetByUserId exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get profile by registrant_profiles.id
     * Used when we already have the registrant profile ID
     * 
     * @param {string} id - registrant_profiles.id
     * @returns {Promise<Object>} Profile data
     */
    getById: async (id) => {
      try {
        console.log('👤 Profiles: Fetching profile by registrant_profiles.id:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('ℹ️ Profiles: No profile found for registrant_profiles.id:', id);
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Profile not found' } };
          }
          console.error('❌ Profiles: GetById failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Profile retrieved successfully by registrant ID');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: GetById exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ ENHANCED: Verify and retrieve profile after signup
     * Optimized for the trigger-based registration flow
     * 
     * @param {string} authUserId - auth.users.id from signup
     * @param {number} maxWaitMs - Maximum time to wait for trigger (default 5000ms)
     * @returns {Promise<Object>} Profile verification result
     */
    verifyTriggerProfile: async (authUserId, maxWaitMs = 5000) => {
      console.log('🔍 Profiles: Verifying trigger created profile for:', authUserId);
      
      const startTime = Date.now();
      const pollInterval = 500; // Check every 500ms
      
      while ((Date.now() - startTime) < maxWaitMs) {
        const result = await service.getByUserId(authUserId, false);
        
        if (result.success && result.data) {
          console.log('✅ Profiles: Trigger profile verified successfully:', {
            registrant_id: result.data.id,
            time_taken: Date.now() - startTime + 'ms'
          });
          return {
            success: true,
            profileExists: true,
            profile: result.data,
            registrantProfileId: result.data.id,
            timeTaken: Date.now() - startTime
          };
        }
        
        // Wait before next attempt
        if ((Date.now() - startTime) < maxWaitMs) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
      
      console.warn('⚠️ Profiles: Trigger profile verification timed out after', maxWaitMs + 'ms');
      return {
        success: false,
        profileExists: false,
        error: 'Trigger profile creation timed out',
        suggestion: 'Profile trigger may have failed - consider manual profile creation',
        timeTaken: Date.now() - startTime
      };
    },

    /**
     * Update profile by registrant_profiles.id
     * 
     * @param {string} id - registrant_profiles.id
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Update result
     */
    update: async (id, updates) => {
      try {
        console.log('👤 Profiles: Updating profile by registrant ID:', id);

        // Validate roles if being updated
        if (updates.roles) {
          if (!Array.isArray(updates.roles) || updates.roles.length === 0) {
            throw new Error('Roles must be a non-empty array');
          }
          
          const validRoles = ['applicant', 'landlord', 'employer', 'peer-support'];
          const invalidRoles = updates.roles.filter(role => !validRoles.includes(role));
          if (invalidRoles.length > 0) {
            throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
          }
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Profiles: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Profile updated successfully by registrant ID');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update profile by user_id (auth.users.id)
     * Useful when we only have the auth user ID
     * 
     * @param {string} authUserId - auth.users.id
     * @param {Object} updates - Fields to update  
     * @returns {Promise<Object>} Update result
     */
    updateByUserId: async (authUserId, updates) => {
      try {
        console.log('👤 Profiles: Updating profile by user_id:', authUserId);

        // Validate roles if being updated
        if (updates.roles) {
          if (!Array.isArray(updates.roles) || updates.roles.length === 0) {
            throw new Error('Roles must be a non-empty array');
          }
          
          const validRoles = ['applicant', 'landlord', 'employer', 'peer-support'];
          const invalidRoles = updates.roles.filter(role => !validRoles.includes(role));
          if (invalidRoles.length > 0) {
            throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
          }
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', authUserId) // Update by user_id field
          .select()
          .single();

        if (error) {
          console.error('❌ Profiles: UpdateByUserId failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Profile updated by user_id successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: UpdateByUserId exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Soft delete profile (set is_active = false)
     * 
     * @param {string} id - registrant_profiles.id
     * @returns {Promise<Object>} Delete result
     */
    delete: async (id) => {
      try {
        console.log('👤 Profiles: Soft deleting profile:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) {
          console.error('❌ Profiles: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Profile soft deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get profiles by role
     * Uses the roles array field
     * 
     * @param {string} role - Role to search for
     * @returns {Promise<Object>} Profiles with that role
     */
    getByRole: async (role) => {
      try {
        console.log('👤 Profiles: Fetching profiles by role:', role);

        const validRoles = ['applicant', 'landlord', 'employer', 'peer-support'];
        if (!validRoles.includes(role)) {
          throw new Error(`Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}`);
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .contains('roles', [role])
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Profiles: GetByRole failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Profiles: Found ${data?.length || 0} profiles with role: ${role}`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Profiles: GetByRole exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Search profiles by name or email
     * 
     * @param {string} searchTerm - Search term
     * @param {number} limit - Result limit
     * @returns {Promise<Object>} Matching profiles
     */
    search: async (searchTerm, limit = 20) => {
      try {
        console.log('👤 Profiles: Searching profiles:', searchTerm);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id, first_name, last_name, email, roles, created_at')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .eq('is_active', true)
          .limit(limit)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Profiles: Search failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Profiles: Search found ${data?.length || 0} results`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Profiles: Search exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get profile statistics
     * 
     * @returns {Promise<Object>} Statistics data
     */
    getStatistics: async () => {
      try {
        console.log('👤 Profiles: Fetching statistics');

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('roles, is_active, created_at');

        if (error) {
          console.error('❌ Profiles: Statistics failed:', error.message);
          return { success: false, data: null, error };
        }

        const stats = {
          total: data.length,
          active: data.filter(p => p.is_active).length,
          inactive: data.filter(p => !p.is_active).length,
          byRole: {},
          recentSignups: data.filter(p => {
            const createdDate = new Date(p.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate > weekAgo;
          }).length
        };

        // Count by role (users can have multiple roles)
        data.forEach(profile => {
          if (profile.roles && Array.isArray(profile.roles)) {
            profile.roles.forEach(role => {
              stats.byRole[role] = (stats.byRole[role] || 0) + 1;
            });
          }
        });

        console.log('✅ Profiles: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 Profiles: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Check if email exists in registrant_profiles
     * 
     * @param {string} email - Email to check
     * @returns {Promise<Object>} Existence check result
     */
    emailExists: async (email) => {
      try {
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id')
          .eq('email', email.toLowerCase().trim())
          .single();

        if (error && error.code === 'PGRST116') {
          return { success: true, exists: false, error: null };
        }

        if (error) {
          return { success: false, exists: false, error };
        }

        return { success: true, exists: !!data, error: null };

      } catch (err) {
        console.error('💥 Profiles: Email check exception:', err);
        return { success: false, exists: false, error: { message: err.message } };
      }
    }
  };

  return service;
};

export default createProfilesService;
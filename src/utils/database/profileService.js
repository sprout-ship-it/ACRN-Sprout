// src/utils/database/profilesService.js - Profiles service module
/**
 * Profiles service for registrant_profiles table operations
 */

const createProfilesService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for profiles service');
  }

  const tableName = 'registrant_profiles';

  const service = {
    /**
     * Create a new profile
     */
    create: async (profileData) => {
      try {
        console.log('👤 Profiles: Creating profile for user:', profileData.id);

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
          console.error('❌ Profiles: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Profile created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get profile by ID
     */
    getById: async (id) => {
      try {
        console.log('👤 Profiles: Fetching profile by ID:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('ℹ️ Profiles: No profile found for ID:', id);
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Profile not found' } };
          }
          console.error('❌ Profiles: GetById failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Profiles: Profile retrieved successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: GetById exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update profile
     */
    update: async (id, updates) => {
      try {
        console.log('👤 Profiles: Updating profile:', id);

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

        console.log('✅ Profiles: Profile updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Profiles: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete profile (soft delete by setting is_active = false)
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
     */
    getByRole: async (role) => {
      try {
        console.log('👤 Profiles: Fetching profiles by role:', role);

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
     */
    search: async (searchTerm, limit = 20) => {
      try {
        console.log('👤 Profiles: Searching profiles:', searchTerm);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id, first_name, last_name, email, roles')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .eq('is_active', true)
          .limit(limit);

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

        // Count by role
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
     * Batch update profiles
     */
    batchUpdate: async (updates) => {
      try {
        console.log('👤 Profiles: Batch updating', updates.length, 'profiles');

        const operations = updates.map(({ id, data }) =>
          service.update(id, data)
        );

        const results = await Promise.allSettled(operations);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
        const failed = results.filter(r => r.status === 'rejected' || !r.value?.success);

        console.log(`✅ Profiles: Batch update complete - ${successful.length} success, ${failed.length} failed`);
        
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
        console.error('💥 Profiles: Batch update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Check if email exists
     */
    emailExists: async (email) => {
      try {
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id')
          .eq('email', email.toLowerCase())
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
// src/utils/database/communicationService.js - Communication service module
/**
 * Communication service for communication_templates and communication_logs table operations
 */

const createCommunicationService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for communication service');
  }

  // Templates service
  const templates = {
    tableName: 'communication_templates',

    /**
     * Create communication template
     */
    create: async (templateData) => {
      try {
        console.log('💬 Communication Templates: Creating template');

        const { data, error } = await supabaseClient
          .from(templates.tableName)
          .insert({
            ...templateData,
            is_active: templateData.is_active !== false, // Default to true
            is_system: templateData.is_system || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Communication Templates: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication Templates: Template created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication Templates: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get templates by category
     */
    getByCategory: async (category, userId = null) => {
      try {
        console.log('💬 Communication Templates: Fetching by category:', category, 'for user:', userId);

        let query = supabaseClient
          .from(templates.tableName)
          .select('*')
          .eq('category', category)
          .eq('is_active', true);

        // Get both system templates and user's custom templates
        if (userId) {
          query = query.or(`user_id.is.null,user_id.eq.${userId}`);
        } else {
          query = query.is('user_id', null); // Only system templates
        }

        const { data, error } = await query
          .order('is_system', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Communication Templates: GetByCategory failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Communication Templates: Found ${data?.length || 0} templates for category: ${category}`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Communication Templates: GetByCategory exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get templates by user ID
     */
    getByUserId: async (userId) => {
      try {
        console.log('💬 Communication Templates: Fetching templates for user:', userId);

        const { data, error } = await supabaseClient
          .from(templates.tableName)
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Communication Templates: GetByUserId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Communication Templates: Found ${data?.length || 0} templates for user`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Communication Templates: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Update template
     */
    update: async (id, updates) => {
      try {
        console.log('💬 Communication Templates: Updating template:', id);

        const { data, error } = await supabaseClient
          .from(templates.tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Communication Templates: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication Templates: Template updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication Templates: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete template (soft delete)
     */
    delete: async (id) => {
      try {
        console.log('💬 Communication Templates: Soft deleting template:', id);

        // Soft delete - mark as inactive
        const { data, error } = await supabaseClient
          .from(templates.tableName)
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Communication Templates: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication Templates: Template deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication Templates: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get template by ID
     */
    getById: async (id) => {
      try {
        console.log('💬 Communication Templates: Fetching template by ID:', id);

        const { data, error } = await supabaseClient
          .from(templates.tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Template not found' } };
          }
          console.error('❌ Communication Templates: GetById failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication Templates: Template retrieved successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication Templates: GetById exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  // Logs service
  const logs = {
    tableName: 'communication_logs',

    /**
     * Create communication log entry
     */
    create: async (logData) => {
      try {
        console.log('📝 Communication Logs: Creating log entry');

        const { data, error } = await supabaseClient
          .from(logs.tableName)
          .insert({
            ...logData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Communication Logs: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication Logs: Log entry created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication Logs: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get logs by match group
     */
    getByMatchGroup: async (matchGroupId) => {
      try {
        console.log('📝 Communication Logs: Fetching logs for match group:', matchGroupId);

        const { data, error } = await supabaseClient
          .from(logs.tableName)
          .select(`
            *,
            sender:registrant_profiles!sender_id(id, first_name, last_name),
            recipient:registrant_profiles!recipient_id(id, first_name, last_name)
          `)
          .eq('match_group_id', matchGroupId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Communication Logs: GetByMatchGroup failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Communication Logs: Found ${data?.length || 0} logs for match group`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Communication Logs: GetByMatchGroup exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get logs by user ID
     */
    getByUserId: async (userId, limit = 50) => {
      try {
        console.log('📝 Communication Logs: Fetching logs for user:', userId);

        const { data, error } = await supabaseClient
          .from(logs.tableName)
          .select(`
            *,
            sender:registrant_profiles!sender_id(id, first_name, last_name),
            recipient:registrant_profiles!recipient_id(id, first_name, last_name),
            match_group:match_groups(id, match_type, status)
          `)
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('❌ Communication Logs: GetByUserId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Communication Logs: Found ${data?.length || 0} logs for user`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Communication Logs: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    }
  };

  return {
    templates,
    logs
  };
};

export default createCommunicationService;
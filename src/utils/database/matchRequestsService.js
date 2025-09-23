// src/utils/database/matchRequestsService.js - Match requests service module
/**
 * Match requests service for match_requests table operations
 */

const createMatchRequestsService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for match requests service');
  }

  const tableName = 'match_requests';

  const service = {
    /**
     * Create a new match request
     */
    create: async (requestData) => {
      try {
        console.log('🤝 MatchRequests: Creating request from', requestData.requester_id, 'to', requestData.target_id);

        // Check for existing request
        const existingResult = await service.getExistingRequest(requestData.requester_id, requestData.target_id);
        if (existingResult.success && existingResult.data) {
          return { 
            success: false, 
            data: null, 
            error: { message: 'Match request already exists', code: 'REQUEST_EXISTS' }
          };
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert({
            ...requestData,
            status: requestData.status || 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ MatchRequests: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ MatchRequests: Request created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get match requests for a user (sent and received)
     */
    getByUserId: async (userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching requests for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            requester:registrant_profiles!requester_id(id, first_name, last_name, email),
            target:registrant_profiles!target_id(id, first_name, last_name, email)
          `)
          .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ MatchRequests: GetByUserId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ MatchRequests: Found ${data?.length || 0} requests for user`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get sent requests for a user
     */
    getSentRequests: async (userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching sent requests for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            target:registrant_profiles!target_id(id, first_name, last_name, email)
          `)
          .eq('requester_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ MatchRequests: GetSentRequests failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ MatchRequests: Found ${data?.length || 0} sent requests`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetSentRequests exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get received requests for a user
     */
    getReceivedRequests: async (userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching received requests for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            requester:registrant_profiles!requester_id(id, first_name, last_name, email)
          `)
          .eq('target_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ MatchRequests: GetReceivedRequests failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ MatchRequests: Found ${data?.length || 0} received requests`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetReceivedRequests exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Update match request status
     */
    update: async (id, updates) => {
      try {
        console.log('🤝 MatchRequests: Updating request:', id);

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
          console.error('❌ MatchRequests: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ MatchRequests: Request updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Approve a match request
     */
    approve: async (requestId, approvedBy) => {
      try {
        console.log('🤝 MatchRequests: Approving request:', requestId);

        const updates = {
          status: 'approved',
          target_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        };

        return await service.update(requestId, updates);

      } catch (err) {
        console.error('💥 MatchRequests: Approve exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Reject a match request
     */
    reject: async (requestId, rejectedBy, reason = null) => {
      try {
        console.log('🤝 MatchRequests: Rejecting request:', requestId);

        const updates = {
          status: 'rejected',
          target_approved: false,
          rejected_at: new Date().toISOString(),
          rejected_by: rejectedBy,
          rejection_reason: reason
        };

        return await service.update(requestId, updates);

      } catch (err) {
        console.error('💥 MatchRequests: Reject exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Cancel a match request (by requester)
     */
    cancel: async (requestId, cancelledBy) => {
      try {
        console.log('🤝 MatchRequests: Cancelling request:', requestId);

        const updates = {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancelledBy
        };

        return await service.update(requestId, updates);

      } catch (err) {
        console.error('💥 MatchRequests: Cancel exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get existing request between two users
     */
    getExistingRequest: async (userId1, userId2) => {
      try {
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .or(`and(requester_id.eq.${userId1},target_id.eq.${userId2}),and(requester_id.eq.${userId2},target_id.eq.${userId1})`)
          .in('status', ['pending', 'approved'])
          .single();

        if (error && error.code === 'PGRST116') {
          return { success: true, data: null, error: null };
        }

        if (error) {
          return { success: false, data: null, error };
        }

        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetExistingRequest exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get pending requests count for a user
     */
    getPendingCount: async (userId) => {
      try {
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id', { count: 'exact' })
          .eq('target_id', userId)
          .eq('status', 'pending');

        if (error) {
          console.error('❌ MatchRequests: GetPendingCount failed:', error.message);
          return { success: false, data: 0, error };
        }

        const count = data?.length || 0;
        console.log(`✅ MatchRequests: ${count} pending requests for user`);
        return { success: true, data: count, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetPendingCount exception:', err);
        return { success: false, data: 0, error: { message: err.message } };
      }
    },

    /**
     * Get request statistics for a user
     */
    getStatistics: async (userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching statistics for user:', userId);

        const [sentResult, receivedResult] = await Promise.all([
          service.getSentRequests(userId),
          service.getReceivedRequests(userId)
        ]);

        if (!sentResult.success || !receivedResult.success) {
          throw new Error('Failed to fetch request data for statistics');
        }

        const sent = sentResult.data;
        const received = receivedResult.data;

        const stats = {
          sent: {
            total: sent.length,
            pending: sent.filter(r => r.status === 'pending').length,
            approved: sent.filter(r => r.status === 'approved').length,
            rejected: sent.filter(r => r.status === 'rejected').length,
            cancelled: sent.filter(r => r.status === 'cancelled').length
          },
          received: {
            total: received.length,
            pending: received.filter(r => r.status === 'pending').length,
            approved: received.filter(r => r.status === 'approved').length,
            rejected: received.filter(r => r.status === 'rejected').length
          },
          matches: {
            active: [...sent, ...received].filter(r => r.status === 'approved').length
          }
        };

        console.log('✅ MatchRequests: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete a match request
     */
    delete: async (id) => {
      try {
        console.log('🤝 MatchRequests: Deleting request:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('id', id)
          .select();

        if (error) {
          console.error('❌ MatchRequests: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ MatchRequests: Request deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Cleanup old requests
     */
    cleanupOldRequests: async (daysOld = 90) => {
      try {
        console.log(`🤝 MatchRequests: Cleaning up requests older than ${daysOld} days`);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .lt('created_at', cutoffDate.toISOString())
          .in('status', ['rejected', 'cancelled'])
          .select();

        if (error) {
          console.error('❌ MatchRequests: Cleanup failed:', error.message);
          return { success: false, data: null, error };
        }

        const cleanedCount = data?.length || 0;
        console.log(`✅ MatchRequests: Cleaned up ${cleanedCount} old requests`);
        return { success: true, data: { cleanedCount }, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: Cleanup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return service;
};

export default createMatchRequestsService;
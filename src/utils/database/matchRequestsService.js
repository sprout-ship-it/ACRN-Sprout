// src/utils/database/matchRequestsService.js - Corrected for New Schema
/**
 * Match requests service for match_requests table operations
 * 
 * SCHEMA STRUCTURE:
 * - requester_type + requester_id: Who is making the request (role-specific ID)
 * - recipient_type + recipient_id: Who is receiving the request (role-specific ID)  
 * - request_type: Type of connection (housing, employment, peer-support, roommate)
 * - status: pending, accepted, rejected, withdrawn
 * 
 * This handles generic connection requests between different user roles
 */

const createMatchRequestsService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for match requests service');
  }

  const tableName = 'match_requests';

  // Valid values from schema constraints
  const VALID_USER_TYPES = ['applicant', 'landlord', 'employer', 'peer-support'];
  const VALID_REQUEST_TYPES = ['housing', 'employment', 'peer-support', 'roommate'];
  const VALID_STATUSES = ['pending', 'accepted', 'rejected', 'withdrawn'];

  const service = {
    /**
     * Create a new match request
     * @param {Object} requestData - Request data including types and IDs
     * @returns {Object} Database response
     */
      create: async (requestData) => {
        try {
          console.log('🤝 MatchRequests: Creating request', {
            from: `${requestData.requester_type}:${requestData.requester_id}`,
            to: `${requestData.recipient_type}:${requestData.recipient_id}`,
            type: requestData.request_type,
            property: requestData.property_id || null
          });

          // Validate required fields
          const requiredFields = ['requester_type', 'requester_id', 'recipient_type', 'recipient_id', 'request_type'];
          for (const field of requiredFields) {
            if (!requestData[field]) {
              throw new Error(`Missing required field: ${field}`);
            }
          }

          // ✅ NEW: Validate property_id for housing requests
          if (requestData.request_type === 'housing') {
            if (!requestData.property_id) {
              throw new Error('property_id is required for housing requests');
            }
          }

          // Validate field values
          if (!VALID_USER_TYPES.includes(requestData.requester_type)) {
            throw new Error(`Invalid requester_type: ${requestData.requester_type}`);
          }

          if (!VALID_USER_TYPES.includes(requestData.recipient_type)) {
            throw new Error(`Invalid recipient_type: ${requestData.recipient_type}`);
          }

          if (!VALID_REQUEST_TYPES.includes(requestData.request_type)) {
            throw new Error(`Invalid request_type: ${requestData.request_type}`);
          }

          // Prevent self-requests
          if (requestData.requester_type === requestData.recipient_type && 
              requestData.requester_id === requestData.recipient_id) {
            throw new Error('Cannot send request to yourself');
          }

          // ✅ UPDATED: Check for existing request including property_id
          const existingResult = await service.getExistingRequest(
            requestData.requester_type, 
            requestData.requester_id,
            requestData.recipient_type, 
            requestData.recipient_id,
            requestData.request_type,
            requestData.property_id // Add property_id to uniqueness check
          );

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
              requester_type: requestData.requester_type,
              requester_id: requestData.requester_id,
              recipient_type: requestData.recipient_type,
              recipient_id: requestData.recipient_id,
              request_type: requestData.request_type,
              property_id: requestData.property_id || null, // ✅ NEW: Include property_id
              message: requestData.message || null,
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
     * Get match requests by role-specific user ID
     * @param {string} userType - User type (applicant, landlord, etc.)
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Database response
     */
    getByUserId: async (userType, userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching requests for', `${userType}:${userId}`);

        if (!VALID_USER_TYPES.includes(userType)) {
          throw new Error(`Invalid user type: ${userType}`);
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .or(`and(requester_type.eq.${userType},requester_id.eq.${userId}),and(recipient_type.eq.${userType},recipient_id.eq.${userId})`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ MatchRequests: GetByUserId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ MatchRequests: Found ${data?.length || 0} requests`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get sent requests for a user
     * @param {string} userType - User type
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Database response
     */
    getSentRequests: async (userType, userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching sent requests for', `${userType}:${userId}`);

        if (!VALID_USER_TYPES.includes(userType)) {
          throw new Error(`Invalid user type: ${userType}`);
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('requester_type', userType)
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
     * @param {string} userType - User type
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Database response
     */
    getReceivedRequests: async (userType, userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching received requests for', `${userType}:${userId}`);

        if (!VALID_USER_TYPES.includes(userType)) {
          throw new Error(`Invalid user type: ${userType}`);
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('recipient_type', userType)
          .eq('recipient_id', userId)
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
     * @param {string} requestId - Request ID
     * @param {Object} updates - Fields to update
     * @returns {Object} Database response
     */
    update: async (requestId, updates) => {
      try {
        console.log('🤝 MatchRequests: Updating request:', requestId);

        // Validate status if being updated
        if (updates.status && !VALID_STATUSES.includes(updates.status)) {
          throw new Error(`Invalid status: ${updates.status}`);
        }

        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        // Set responded_at when status changes from pending
        if (updates.status && updates.status !== 'pending') {
          updateData.responded_at = new Date().toISOString();
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .update(updateData)
          .eq('id', requestId)
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
     * Accept/approve a match request
     * @param {string} requestId - Request ID
     * @returns {Object} Database response
     */
    accept: async (requestId) => {
      try {
        console.log('🤝 MatchRequests: Accepting request:', requestId);
        return await service.update(requestId, { status: 'accepted' });
      } catch (err) {
        console.error('💥 MatchRequests: Accept exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Reject a match request
     * @param {string} requestId - Request ID
     * @returns {Object} Database response
     */
    reject: async (requestId) => {
      try {
        console.log('🤝 MatchRequests: Rejecting request:', requestId);
        return await service.update(requestId, { status: 'rejected' });
      } catch (err) {
        console.error('💥 MatchRequests: Reject exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Withdraw a match request (by requester)
     * @param {string} requestId - Request ID
     * @returns {Object} Database response
     */
    withdraw: async (requestId) => {
      try {
        console.log('🤝 MatchRequests: Withdrawing request:', requestId);
        return await service.update(requestId, { status: 'withdrawn' });
      } catch (err) {
        console.error('💥 MatchRequests: Withdraw exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get existing request between two users for a specific request type
     * @param {string} requesterType - Requester user type
     * @param {string} requesterId - Requester ID
     * @param {string} recipientType - Recipient user type
     * @param {string} recipientId - Recipient ID
     * @param {string} requestType - Request type
     * @returns {Object} Database response
     */
      getExistingRequest: async (requesterType, requesterId, recipientType, recipientId, requestType, propertyId = null) => {
        try {
          let query = supabaseClient
            .from(tableName)
            .select('*')
            .eq('requester_type', requesterType)
            .eq('requester_id', requesterId)
            .eq('recipient_type', recipientType)
            .eq('recipient_id', recipientId)
            .eq('request_type', requestType)
            .in('status', ['pending', 'accepted']);

          // ✅ NEW: Include property_id in uniqueness check for housing requests
          if (requestType === 'housing' && propertyId) {
            query = query.eq('property_id', propertyId);
          }

          const { data, error } = await query.maybeSingle();

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
     * @param {string} userType - User type
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Database response
     */
    getPendingCount: async (userType, userId) => {
      try {
        if (!VALID_USER_TYPES.includes(userType)) {
          throw new Error(`Invalid user type: ${userType}`);
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('id', { count: 'exact' })
          .eq('recipient_type', userType)
          .eq('recipient_id', userId)
          .eq('status', 'pending');

        if (error) {
          console.error('❌ MatchRequests: GetPendingCount failed:', error.message);
          return { success: false, data: 0, error };
        }

        const count = data?.length || 0;
        console.log(`✅ MatchRequests: ${count} pending requests for ${userType}:${userId}`);
        return { success: true, data: count, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetPendingCount exception:', err);
        return { success: false, data: 0, error: { message: err.message } };
      }
    },

    /**
     * Get request statistics for a user
     * @param {string} userType - User type
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Database response
     */
    getStatistics: async (userType, userId) => {
      try {
        console.log('🤝 MatchRequests: Fetching statistics for', `${userType}:${userId}`);

        const [sentResult, receivedResult] = await Promise.all([
          service.getSentRequests(userType, userId),
          service.getReceivedRequests(userType, userId)
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
            accepted: sent.filter(r => r.status === 'accepted').length,
            rejected: sent.filter(r => r.status === 'rejected').length,
            withdrawn: sent.filter(r => r.status === 'withdrawn').length
          },
          received: {
            total: received.length,
            pending: received.filter(r => r.status === 'pending').length,
            accepted: received.filter(r => r.status === 'accepted').length,
            rejected: received.filter(r => r.status === 'rejected').length
          },
          byRequestType: {},
          activeConnections: [...sent, ...received].filter(r => r.status === 'accepted').length
        };

        // Group by request type
        [...sent, ...received].forEach(request => {
          if (request.request_type) {
            stats.byRequestType[request.request_type] = (stats.byRequestType[request.request_type] || 0) + 1;
          }
        });

        console.log('✅ MatchRequests: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 MatchRequests: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete a match request
     * @param {string} requestId - Request ID
     * @returns {Object} Database response
     */
    delete: async (requestId) => {
      try {
        console.log('🤝 MatchRequests: Deleting request:', requestId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('id', requestId)
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
     * Get requests by type
     * @param {string} requestType - Request type
     * @param {Object} filters - Additional filters
     * @returns {Object} Database response
     */
    getByRequestType: async (requestType, filters = {}) => {
      try {
        if (!VALID_REQUEST_TYPES.includes(requestType)) {
          throw new Error(`Invalid request type: ${requestType}`);
        }

        let query = supabaseClient
          .from(tableName)
          .select('*')
          .eq('request_type', requestType);

        // Apply additional filters
        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.requesterType) {
          query = query.eq('requester_type', filters.requesterType);
        }

        if (filters.recipientType) {
          query = query.eq('recipient_type', filters.recipientType);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(filters.limit || 100);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 MatchRequests: GetByRequestType exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },
      getByPropertyId: async (propertyId) => {
        try {
          console.log('🤝 MatchRequests: Fetching requests for property:', propertyId);

          const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .eq('property_id', propertyId)
            .eq('request_type', 'housing')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('❌ MatchRequests: GetByPropertyId failed:', error.message);
            return { success: false, data: [], error };
          }

          console.log(`✅ MatchRequests: Found ${data?.length || 0} property requests`);
          return { success: true, data: data || [], error: null };

        } catch (err) {
          console.error('💥 MatchRequests: GetByPropertyId exception:', err);
          return { success: false, data: [], error: { message: err.message } };
        }
      },
    // Legacy method names for backward compatibility
    approve: async (requestId) => service.accept(requestId),
    cancel: async (requestId) => service.withdraw(requestId)
  };

  return service;
};

export const getMatchRequestsByUserId = async (userType, userId) => {
  try {
    console.log('🤝 Fetching match requests for user:', userType, userId);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const validUserTypes = ['applicant', 'landlord', 'employer', 'peer-support'];
    if (!validUserTypes.includes(userType)) {
      return { success: false, error: `Invalid user type: ${userType}` };
    }

    const { data, error } = await supabase
      .from('match_requests')
      .select('*')
      .or(`and(requester_type.eq.${userType},requester_id.eq.${userId}),and(recipient_type.eq.${userType},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching match requests:', error);
      return { success: false, data: [], error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getMatchRequestsByUserId:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const createMatchRequest = async (requestData) => {
  try {
    console.log('🤝 Creating match request:', requestData);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate required fields
    const requiredFields = ['requester_type', 'requester_id', 'recipient_type', 'recipient_id', 'request_type'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return { success: false, error: `Missing required field: ${field}` };
      }
    }

    const { data, error } = await supabase
      .from('match_requests')
      .insert({
        requester_type: requestData.requester_type,
        requester_id: requestData.requester_id,
        recipient_type: requestData.recipient_type,
        recipient_id: requestData.recipient_id,
        request_type: requestData.request_type,
        property_id: requestData.property_id || null,
        message: requestData.message || null,
        status: requestData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating match request:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in createMatchRequest:', err);
    return { success: false, error: err.message };
  }
};

export const updateMatchRequestStatus = async (requestId, status) => {
  try {
    console.log('🤝 Updating match request status:', requestId, status);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status !== 'pending') {
      updateData.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('match_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating match request status:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in updateMatchRequestStatus:', err);
    return { success: false, error: err.message };
  }
};

export default createMatchRequestsService;
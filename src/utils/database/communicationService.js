// src/utils/database/communicationService.js - Schema-Aligned Communication Service
/**
 * Communication service for match-based messaging using existing schema tables
 * 
 * SCHEMA TABLES USED:
 * - match_requests (message field)
 * - housing_matches (applicant_message, landlord_message fields) 
 * - employment_matches (applicant_message, employer_message fields)
 * - peer_support_matches (applicant_message, peer_message fields)
 * - match_groups (for group communication context)
 */

const createCommunicationService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for communication service');
  }

  const service = {
    /**
     * Send a match request with message
     * @param {Object} requestData - Match request data including message
     * @returns {Promise<Object>} Request result
     */
    sendMatchRequest: async (requestData) => {
      try {
        console.log('💬 Communication: Sending match request with message');

        const { data, error } = await supabaseClient
          .from('match_requests')
          .insert({
            requester_type: requestData.requester_type,
            requester_id: requestData.requester_id,
            recipient_type: requestData.recipient_type,
            recipient_id: requestData.recipient_id,
            property_id: requestData.property_id || null,
            request_type: requestData.request_type,
            message: requestData.message,
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .select(`
            *,
            requester_profile:registrant_profiles!requester_id(id, first_name, last_name),
            recipient_profile:registrant_profiles!recipient_id(id, first_name, last_name)
          `)
          .single();

        if (error) {
          console.error('❌ Communication: Match request failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication: Match request sent successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication: Send match request exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update match with message (housing, employment, or peer support)
     * @param {string} matchType - 'housing', 'employment', or 'peer-support'
     * @param {string} matchId - Match ID
     * @param {string} messageType - 'applicant' or role-specific type
     * @param {string} message - Message content
     * @returns {Promise<Object>} Update result
     */
    updateMatchMessage: async (matchType, matchId, messageType, message) => {
      try {
        console.log(`💬 Communication: Updating ${matchType} match message`);

        const tableMap = {
          'housing': 'housing_matches',
          'employment': 'employment_matches',
          'peer-support': 'peer_support_matches'
        };

        const messageFieldMap = {
          'housing': {
            'applicant': 'applicant_message',
            'landlord': 'landlord_message'
          },
          'employment': {
            'applicant': 'applicant_message', 
            'employer': 'employer_message'
          },
          'peer-support': {
            'applicant': 'applicant_message',
            'peer': 'peer_message'
          }
        };

        const tableName = tableMap[matchType];
        const messageField = messageFieldMap[matchType]?.[messageType];

        if (!tableName || !messageField) {
          throw new Error(`Invalid match type (${matchType}) or message type (${messageType})`);
        }

        const updateData = {
          [messageField]: message,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
          .from(tableName)
          .update(updateData)
          .eq('id', matchId)
          .select()
          .single();

        if (error) {
          console.error(`❌ Communication: ${matchType} match message update failed:`, error.message);
          return { success: false, data: null, error };
        }

        console.log(`✅ Communication: ${matchType} match message updated successfully`);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication: Update match message exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get conversation history from match requests between two users
     * @param {string} userId1 - First user's registrant profile ID
     * @param {string} userId2 - Second user's registrant profile ID
     * @returns {Promise<Object>} Conversation history
     */
    getConversationHistory: async (userId1, userId2) => {
      try {
        console.log('💬 Communication: Fetching conversation history');

        const { data, error } = await supabaseClient
          .from('match_requests')
          .select(`
            *,
            requester_profile:registrant_profiles!requester_id(id, first_name, last_name),
            recipient_profile:registrant_profiles!recipient_id(id, first_name, last_name)
          `)
          .or(`and(requester_id.eq.${userId1},recipient_id.eq.${userId2}),and(requester_id.eq.${userId2},recipient_id.eq.${userId1})`)
          .not('message', 'is', null)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ Communication: Get conversation history failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Communication: Found ${data?.length || 0} messages in conversation`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Communication: Get conversation history exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get all messages for a user (sent and received)
     * @param {string} userId - User's registrant profile ID
     * @param {number} limit - Number of recent messages to retrieve
     * @returns {Promise<Object>} User's messages
     */
    getUserMessages: async (userId, limit = 50) => {
      try {
        console.log('💬 Communication: Fetching user messages');

        const { data, error } = await supabaseClient
          .from('match_requests')
          .select(`
            *,
            requester_profile:registrant_profiles!requester_id(id, first_name, last_name, email),
            recipient_profile:registrant_profiles!recipient_id(id, first_name, last_name, email)
          `)
          .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
          .not('message', 'is', null)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('❌ Communication: Get user messages failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Communication: Found ${data?.length || 0} messages for user`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Communication: Get user messages exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get group communication context for match groups
     * @param {string} matchGroupId - Match group ID
     * @returns {Promise<Object>} Group communication context
     */
    getGroupContext: async (matchGroupId) => {
      try {
        console.log('💬 Communication: Fetching group context');

        const { data, error } = await supabaseClient
          .from('match_groups')
          .select(`
            *,
            applicant_1:applicant_matching_profiles!applicant_1_id(
              id, 
              user_id,
              registrant:registrant_profiles!user_id(id, first_name, last_name)
            ),
            applicant_2:applicant_matching_profiles!applicant_2_id(
              id,
              user_id, 
              registrant:registrant_profiles!user_id(id, first_name, last_name)
            ),
            property:properties(
              id,
              title,
              landlord:landlord_profiles(
                id,
                user_id,
                registrant:registrant_profiles!user_id(id, first_name, last_name)
              )
            ),
            peer_support:peer_support_profiles!peer_support_id(
              id,
              user_id,
              registrant:registrant_profiles!user_id(id, first_name, last_name)
            )
          `)
          .eq('id', matchGroupId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Match group not found' } };
          }
          console.error('❌ Communication: Get group context failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication: Group context retrieved successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication: Get group context exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get messages from housing matches for a user
     * @param {string} userId - User's registrant profile ID (for applicant or landlord)
     * @param {string} userType - 'applicant' or 'landlord'
     * @returns {Promise<Object>} Housing match messages
     */
    getHousingMatchMessages: async (userId, userType) => {
      try {
        console.log('💬 Communication: Fetching housing match messages');

        let query = supabaseClient
          .from('housing_matches')
          .select(`
            *,
            applicant:applicant_matching_profiles!applicant_id(
              id,
              user_id,
              registrant:registrant_profiles!user_id(id, first_name, last_name)
            ),
            property:properties!property_id(
              id,
              title,
              landlord:landlord_profiles(
                id,
                user_id,
                registrant:registrant_profiles!user_id(id, first_name, last_name)
              )
            )
          `);

        if (userType === 'applicant') {
          // Find applicant's profile ID first
          const { data: profile } = await supabaseClient
            .from('applicant_matching_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();
          
          if (profile) {
            query = query.eq('applicant_id', profile.id);
          } else {
            return { success: true, data: [], error: null };
          }
        } else if (userType === 'landlord') {
          // Find landlord's properties
          const { data: landlordProfile } = await supabaseClient
            .from('landlord_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (landlordProfile) {
            const { data: properties } = await supabaseClient
              .from('properties')
              .select('id')
              .eq('landlord_id', landlordProfile.id);

            if (properties && properties.length > 0) {
              const propertyIds = properties.map(p => p.id);
              query = query.in('property_id', propertyIds);
            } else {
              return { success: true, data: [], error: null };
            }
          } else {
            return { success: true, data: [], error: null };
          }
        }

        const { data, error } = await query
          .or('applicant_message.not.is.null,landlord_message.not.is.null')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('❌ Communication: Get housing match messages failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Communication: Found ${data?.length || 0} housing messages`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Communication: Get housing match messages exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Mark match request as read/responded
     * @param {string} requestId - Match request ID
     * @param {string} status - New status ('accepted', 'rejected', etc.)
     * @returns {Promise<Object>} Update result
     */
    updateRequestStatus: async (requestId, status) => {
      try {
        console.log('💬 Communication: Updating request status');

        const { data, error } = await supabaseClient
          .from('match_requests')
          .update({
            status,
            responded_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .select()
          .single();

        if (error) {
          console.error('❌ Communication: Update request status failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Communication: Request status updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Communication: Update request status exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return service;
};

export const sendMatchRequestWithMessage = async (requestData) => {
  try {
    console.log('💬 Sending match request with message:', requestData);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('match_requests')
      .insert({
        requester_type: requestData.requester_type,
        requester_id: requestData.requester_id,
        recipient_type: requestData.recipient_type,
        recipient_id: requestData.recipient_id,
        property_id: requestData.property_id || null,
        request_type: requestData.request_type,
        message: requestData.message,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error sending match request with message:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in sendMatchRequestWithMessage:', err);
    return { success: false, error: err.message };
  }
};

export const getUserConversations = async (userId, limit = 50) => {
  try {
    console.log('💬 Fetching conversations for user:', userId);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('match_requests')
      .select(`
        *,
        requester_profile:registrant_profiles!requester_id(id, first_name, last_name, email),
        recipient_profile:registrant_profiles!recipient_id(id, first_name, last_name, email)
      `)
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .not('message', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching user conversations:', error);
      return { success: false, data: [], error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getUserConversations:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const getConversationBetweenUsers = async (userId1, userId2) => {
  try {
    console.log('💬 Fetching conversation between users:', userId1, userId2);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('match_requests')
      .select(`
        *,
        requester_profile:registrant_profiles!requester_id(id, first_name, last_name),
        recipient_profile:registrant_profiles!recipient_id(id, first_name, last_name)
      `)
      .or(`and(requester_id.eq.${userId1},recipient_id.eq.${userId2}),and(requester_id.eq.${userId2},recipient_id.eq.${userId1})`)
      .not('message', 'is', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching conversation:', error);
      return { success: false, data: [], error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getConversationBetweenUsers:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const updateMatchMessage = async (matchType, matchId, messageType, message) => {
  try {
    console.log('💬 Updating match message:', matchType, matchId, messageType);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tableMap = {
      'housing': 'housing_matches',
      'employment': 'employment_matches',
      'peer-support': 'peer_support_matches'
    };

    const messageFieldMap = {
      'housing': {
        'applicant': 'applicant_message',
        'landlord': 'landlord_message'
      },
      'employment': {
        'applicant': 'applicant_message', 
        'employer': 'employer_message'
      },
      'peer-support': {
        'applicant': 'applicant_message',
        'peer': 'peer_message'
      }
    };

    const tableName = tableMap[matchType];
    const messageField = messageFieldMap[matchType]?.[messageType];

    if (!tableName || !messageField) {
      return { success: false, error: `Invalid match type (${matchType}) or message type (${messageType})` };
    }

    const updateData = {
      [messageField]: message,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating match message:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in updateMatchMessage:', err);
    return { success: false, error: err.message };
  }
};

export default createCommunicationService;
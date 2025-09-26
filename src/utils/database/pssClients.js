// src/utils/database/pssClients.js - Schema-Aligned Peer Support Client Service
/**
 * Peer Support Client service using existing schema tables
 * 
 * SCHEMA TABLES USED:
 * - peer_support_matches (applicant_id, peer_support_id, status, messages)
 * - peer_support_profiles (specialist profiles)
 * - applicant_matching_profiles (client profiles)
 * - registrant_profiles (user details)
 * - match_groups (group context where peer support is involved)
 */

const createPSSClientsService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for PSS clients service');
  }

  const service = {
    /**
     * Get all clients (matches) for a specific peer specialist
     * @param {string} peerSpecialistUserId - Peer specialist's registrant_profiles.id
     * @returns {Promise<Object>} Specialist's client matches
     */
    getByPeerSpecialistId: async (peerSpecialistUserId) => {
      try {
        console.log('📊 Fetching PSS clients for peer specialist:', peerSpecialistUserId);

        // First get the peer support profile ID
        const { data: peerProfile, error: peerError } = await supabaseClient
          .from('peer_support_profiles')
          .select('id')
          .eq('user_id', peerSpecialistUserId)
          .single();

        if (peerError || !peerProfile) {
          console.error('❌ Peer support profile not found:', peerError);
          return { success: false, data: [], error: peerError || { message: 'Peer support profile not found' } };
        }

        const { data, error } = await supabaseClient
          .from('peer_support_matches')
          .select(`
            *,
            applicant:applicant_matching_profiles!applicant_id(
              id,
              user_id,
              primary_phone,
              recovery_stage,
              time_in_recovery,
              primary_issues,
              registrant:registrant_profiles!user_id(
                id,
                first_name,
                last_name,
                email
              )
            ),
            peer_specialist:peer_support_profiles!peer_support_id(
              id,
              user_id,
              professional_title,
              registrant:registrant_profiles!user_id(
                id,
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq('peer_support_id', peerProfile.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching PSS client matches:', error);
          return { success: false, data: [], error };
        }

        console.log(`✅ Retrieved ${data?.length || 0} PSS client matches`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Exception in getByPeerSpecialistId:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get a specific peer support match by ID
     * @param {string} matchId - peer_support_matches.id
     * @returns {Promise<Object>} Match details
     */
    getById: async (matchId) => {
      try {
        console.log('📊 Fetching PSS match by ID:', matchId);
        
        const { data, error } = await supabaseClient
          .from('peer_support_matches')
          .select(`
            *,
            applicant:applicant_matching_profiles!applicant_id(
              id,
              user_id,
              primary_phone,
              recovery_stage,
              time_in_recovery,
              primary_issues,
              sobriety_date,
              recovery_methods,
              about_me,
              registrant:registrant_profiles!user_id(
                id,
                first_name,
                last_name,
                email
              )
            ),
            peer_specialist:peer_support_profiles!peer_support_id(
              id,
              user_id,
              professional_title,
              specialties,
              bio,
              registrant:registrant_profiles!user_id(
                id,
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq('id', matchId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'PSS match not found' } };
          }
          console.error('❌ Error fetching PSS match:', error);
          return { success: false, data: null, error };
        }

        console.log('✅ Retrieved PSS match:', data?.id);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Exception in getById:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get peer support matches for a client (applicant)
     * @param {string} applicantUserId - Applicant's registrant_profiles.id  
     * @returns {Promise<Object>} Client's peer support relationships
     */
    getByClientId: async (applicantUserId) => {
      try {
        console.log('📊 Fetching PSS relationships for client:', applicantUserId);

        // First get the applicant profile ID
        const { data: applicantProfile, error: applicantError } = await supabaseClient
          .from('applicant_matching_profiles')
          .select('id')
          .eq('user_id', applicantUserId)
          .single();

        if (applicantError || !applicantProfile) {
          console.error('❌ Applicant profile not found:', applicantError);
          return { success: false, data: [], error: applicantError || { message: 'Applicant profile not found' } };
        }

        const { data, error } = await supabaseClient
          .from('peer_support_matches')
          .select(`
            *,
            applicant:applicant_matching_profiles!applicant_id(
              id,
              user_id,
              registrant:registrant_profiles!user_id(
                id,
                first_name,
                last_name,
                email
              )
            ),
            peer_specialist:peer_support_profiles!peer_support_id(
              id,
              user_id,
              professional_title,
              specialties,
              bio,
              registrant:registrant_profiles!user_id(
                id,
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq('applicant_id', applicantProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching client PSS relationships:', error);
          return { success: false, data: [], error };
        }

        console.log(`✅ Retrieved ${data?.length || 0} PSS relationships for client`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Exception in getByClientId:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Create a new peer support match
     * @param {Object} matchData - Match data
     * @param {string} matchData.applicant_user_id - Applicant's registrant_profiles.id
     * @param {string} matchData.peer_support_user_id - Peer specialist's registrant_profiles.id
     * @returns {Promise<Object>} Creation result
     */
    create: async (matchData) => {
      try {
        console.log('➕ Creating new PSS client relationship:', matchData);

        // Validate required fields
        if (!matchData.applicant_user_id || !matchData.peer_support_user_id) {
          throw new Error('Applicant user ID and peer support user ID are required');
        }

        // Get applicant profile ID
        const { data: applicantProfile } = await supabaseClient
          .from('applicant_matching_profiles')
          .select('id')
          .eq('user_id', matchData.applicant_user_id)
          .single();

        if (!applicantProfile) {
          throw new Error('Applicant profile not found');
        }

        // Get peer support profile ID
        const { data: peerProfile } = await supabaseClient
          .from('peer_support_profiles')
          .select('id')
          .eq('user_id', matchData.peer_support_user_id)
          .single();

        if (!peerProfile) {
          throw new Error('Peer support profile not found');
        }

        // Check for existing relationship
        const { data: existing } = await supabaseClient
          .from('peer_support_matches')
          .select('id')
          .eq('applicant_id', applicantProfile.id)
          .eq('peer_support_id', peerProfile.id)
          .single();

        if (existing) {
          throw new Error('Peer support relationship already exists');
        }

        const { data, error } = await supabaseClient
          .from('peer_support_matches')
          .insert([{
            applicant_id: applicantProfile.id,
            peer_support_id: peerProfile.id,
            compatibility_score: matchData.compatibility_score || null,
            match_factors: matchData.match_factors || {},
            status: matchData.status || 'potential',
            applicant_message: matchData.applicant_message || null,
            peer_message: matchData.peer_message || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating PSS match:', error);
          return { success: false, data: null, error };
        }

        console.log('✅ Created PSS relationship:', data.id);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Exception in create:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update a peer support match
     * @param {string} matchId - peer_support_matches.id
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Update result
     */
    update: async (matchId, updates) => {
      try {
        console.log('📝 Updating PSS match:', matchId, updates);

        const { data, error } = await supabaseClient
          .from('peer_support_matches')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', matchId)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating PSS match:', error);
          return { success: false, data: null, error };
        }

        console.log('✅ Updated PSS match:', data.id);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Exception in update:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update match status (e.g., 'potential' -> 'mutual' -> 'active')
     * @param {string} matchId - peer_support_matches.id
     * @param {string} status - New status
     * @returns {Promise<Object>} Update result
     */
    updateStatus: async (matchId, status) => {
      try {
        console.log('🔄 Updating PSS match status:', matchId, status);

        const validStatuses = ['potential', 'mutual', 'applicant-interested', 'peer-interested', 'rejected'];
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        return await service.update(matchId, { status });

      } catch (err) {
        console.error('💥 Exception in updateStatus:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Add message to peer support match
     * @param {string} matchId - peer_support_matches.id
     * @param {string} messageType - 'applicant' or 'peer'
     * @param {string} message - Message content
     * @returns {Promise<Object>} Update result
     */
    addMessage: async (matchId, messageType, message) => {
      try {
        console.log('💬 Adding message to PSS match:', matchId, messageType);

        const messageField = messageType === 'applicant' ? 'applicant_message' : 'peer_message';
        
        return await service.update(matchId, {
          [messageField]: message
        });

      } catch (err) {
        console.error('💥 Exception in addMessage:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get active peer support relationships for a specialist
     * @param {string} peerSpecialistUserId - Peer specialist's registrant_profiles.id
     * @returns {Promise<Object>} Active client relationships
     */
    getActiveClients: async (peerSpecialistUserId) => {
      try {
        console.log('📊 Fetching active clients for peer specialist:', peerSpecialistUserId);

        const result = await service.getByPeerSpecialistId(peerSpecialistUserId);
        
        if (!result.success) {
          return result;
        }

        // Filter for active/mutual matches only
        const activeClients = result.data.filter(match => 
          ['mutual', 'applicant-interested', 'peer-interested'].includes(match.status)
        );

        console.log(`✅ Retrieved ${activeClients.length} active clients`);
        return { success: true, data: activeClients, error: null };

      } catch (err) {
        console.error('💥 Exception in getActiveClients:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get match groups where peer specialist is involved
     * @param {string} peerSpecialistUserId - Peer specialist's registrant_profiles.id
     * @returns {Promise<Object>} Match groups with peer support
     */
    getGroupsWithPeerSupport: async (peerSpecialistUserId) => {
      try {
        console.log('🏠 Fetching match groups with peer support:', peerSpecialistUserId);

        // Get peer support profile ID
        const { data: peerProfile } = await supabaseClient
          .from('peer_support_profiles')
          .select('id')
          .eq('user_id', peerSpecialistUserId)
          .single();

        if (!peerProfile) {
          return { success: false, data: [], error: { message: 'Peer support profile not found' } };
        }

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
              city,
              state
            ),
            peer_support:peer_support_profiles!peer_support_id(
              id,
              user_id,
              professional_title,
              registrant:registrant_profiles!user_id(id, first_name, last_name)
            )
          `)
          .eq('peer_support_id', peerProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching match groups:', error);
          return { success: false, data: [], error };
        }

        console.log(`✅ Retrieved ${data?.length || 0} match groups with peer support`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Exception in getGroupsWithPeerSupport:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get statistics for a peer specialist
     * @param {string} peerSpecialistUserId - Peer specialist's registrant_profiles.id
     * @returns {Promise<Object>} Statistics
     */
    getClientStats: async (peerSpecialistUserId) => {
      try {
        console.log('📊 Fetching client statistics for peer specialist:', peerSpecialistUserId);

        const result = await service.getByPeerSpecialistId(peerSpecialistUserId);
        
        if (!result.success) {
          return result;
        }

        const matches = result.data;
        const stats = {
          total_matches: matches.length,
          potential_matches: matches.filter(m => m.status === 'potential').length,
          active_relationships: matches.filter(m => 
            ['mutual', 'applicant-interested', 'peer-interested'].includes(m.status)
          ).length,
          rejected_matches: matches.filter(m => m.status === 'rejected').length,
          matches_with_messages: matches.filter(m => 
            m.applicant_message || m.peer_message
          ).length
        };

        console.log('✅ Retrieved client statistics:', stats);
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 Exception in getClientStats:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return service;
};

export default createPSSClientsService;
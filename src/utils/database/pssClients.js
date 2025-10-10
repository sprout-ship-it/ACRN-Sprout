// src/utils/database/pssClients.js - COMPLETE VERSION with Foreign Key Constraint
/**
 * Peer Support Client service using existing schema tables
 * ✅ COMPLETE: All original functionality with cleaner automatic JOINs
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
     * ✅ USES AUTOMATIC JOINS: Now that foreign key exists
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

        // ✅ ENHANCED: Get comprehensive data from BOTH tables
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
              sobriety_date,
              primary_substance,
              primary_issues,
              recovery_methods,
              support_meetings,
              sponsor_mentor,
              recovery_goal_timeframe,
              recovery_context,
              about_me,
              looking_for,
              spiritual_affiliation,
              want_recovery_support,
              comfortable_discussing_recovery,
              attend_meetings_together,
              recovery_accountability,
              shared_recovery_activities,
              mentorship_interest,
              recovery_community,
              emergency_contact_name,
              emergency_contact_phone,
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
          .eq('peer_support_id', peerProfile.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching PSS client matches:', error);
          return { success: false, data: [], error };
        }

        // ✅ NEW: Enrich with PSS clients data from pss_clients table
        const enrichedData = await Promise.all(
          (data || []).map(async (match) => {
            try {
              // Get corresponding PSS client record if it exists
              const { data: pssClientData } = await supabaseClient
                .from('pss_clients')
                .select('*')
                .eq('peer_specialist_id', match.peer_support_id)
                .eq('client_id', match.applicant_id)
                .single();

              // Merge the data, prioritizing PSS client data for enhanced fields
              return {
                ...match,
                // Enhanced client management data from pss_clients table
                recovery_goals: pssClientData?.recovery_goals || [],
                total_sessions: pssClientData?.total_sessions || 0,
                last_session_date: pssClientData?.last_session_date || null,
                next_followup_date: pssClientData?.next_followup_date || null,
                followup_frequency: pssClientData?.followup_frequency || 'weekly',
                last_contact_date: pssClientData?.last_contact_date || null,
                progress_notes: pssClientData?.progress_notes || [],
                client_preferences: pssClientData?.client_preferences || {},
                crisis_plan: pssClientData?.crisis_plan || {},
                status: pssClientData?.status || match.status || 'active',
                // Include PSS client ID for updates
                pss_client_id: pssClientData?.id || null
              };
            } catch (pssError) {
              console.warn('Could not fetch PSS client data for match:', match.id);
              // Return match with default enhanced data
              return {
                ...match,
                recovery_goals: [],
                total_sessions: 0,
                last_session_date: null,
                next_followup_date: null,
                followup_frequency: 'weekly',
                last_contact_date: null,
                progress_notes: [],
                client_preferences: {},
                crisis_plan: {},
                pss_client_id: null
              };
            }
          })
        );

        console.log(`✅ Retrieved ${enrichedData.length} PSS client matches with enhanced data`);
        return { success: true, data: enrichedData, error: null };

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
            status: matchData.status || 'active',
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

        // ✅ SMART ROUTING: Route to appropriate table based on update type
        const clientManagementFields = [
          'recovery_goals', 'next_followup_date', 'followup_frequency', 
          'last_contact_date', 'total_sessions', 'last_session_date',
          'client_preferences', 'crisis_plan', 'progress_notes',
          'referred_by', 'referrals_made', 'consent_to_contact', 'consent_expiry_date'
        ];

        const isClientManagementUpdate = Object.keys(updates).some(key => 
          clientManagementFields.includes(key)
        );

        if (isClientManagementUpdate) {
          // Route to PSS clients table for goal/session management
          return await service.updatePSSClient(matchId, updates);
        } else {
          // Route to peer_support_matches for basic match data
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
        }

      } catch (err) {
        console.error('💥 Exception in update:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * ✅ NEW: Update or create PSS client record for goal/session management
     * @param {string} matchId - peer_support_matches.id
     * @param {Object} updates - Client management fields to update
     * @returns {Promise<Object>} Update result
     */
    updatePSSClient: async (matchId, updates) => {
      try {
        console.log('📝 Updating PSS client record for match:', matchId, updates);

        // First, get the peer_support_match to extract IDs
        const { data: match } = await supabaseClient
          .from('peer_support_matches')
          .select('applicant_id, peer_support_id')
          .eq('id', matchId)
          .single();

        if (!match) {
          throw new Error('Peer support match not found');
        }

        // Check if PSS client record exists (handle 406 gracefully)
        let existingClient = null;
        try {
          const { data, error } = await supabaseClient
            .from('pss_clients')
            .select('id')
            .eq('peer_specialist_id', match.peer_support_id)
            .eq('client_id', match.applicant_id)
            .maybeSingle(); // Use maybeSingle instead of single to handle no results

          if (!error) {
            existingClient = data;
          } else {
            console.warn('Could not check for existing PSS client, will attempt create:', error);
          }
        } catch (checkError) {
          console.warn('Error checking existing PSS client, will attempt create:', checkError);
        }

        if (existingClient) {
          // Update existing PSS client record
          const { data, error } = await supabaseClient
            .from('pss_clients')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingClient.id)
            .select()
            .single();

          if (error) {
            console.error('❌ Error updating PSS client:', error);
            return { success: false, data: null, error };
          }

          console.log('✅ Updated PSS client record:', data.id);
          return { success: true, data, error: null };

        } else {
          // Create new PSS client record
          const { data, error } = await supabaseClient
            .from('pss_clients')
            .insert([{
              peer_specialist_id: match.peer_support_id,
              client_id: match.applicant_id,
              status: 'active',
              ...updates,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) {
            console.error('❌ Error creating PSS client:', error);
            return { success: false, data: null, error };
          }

          console.log('✅ Created PSS client record:', data.id);
          return { success: true, data, error: null };
        }

      } catch (err) {
        console.error('💥 Exception in updatePSSClient:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update match status (e.g., 'active' -> 'inactive')
     * @param {string} matchId - peer_support_matches.id
     * @param {string} status - New status
     * @returns {Promise<Object>} Update result
     */
    updateStatus: async (matchId, status) => {
      try {
        console.log('🔄 Updating PSS match status:', matchId, status);

        const validStatuses = ['active', 'inactive'];
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

        // Filter for active matches only
        const activeClients = result.data.filter(match => match.status === 'active');

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
          active_relationships: matches.filter(m => m.status === 'active').length,
          inactive_relationships: matches.filter(m => m.status === 'inactive').length,
          matches_with_messages: matches.filter(m => 
            m.applicant_message || m.peer_message
          ).length,
          recent_matches: matches.filter(m => {
            const createdDate = new Date(m.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate > weekAgo;
          }).length
        };

        console.log('✅ Retrieved client statistics:', stats);
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 Exception in getClientStats:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Search peer support matches with filters
     * @param {string} peerSpecialistUserId - Peer specialist's registrant_profiles.id
     * @param {Object} filters - Search filters
     * @returns {Promise<Object>} Filtered matches
     */
    searchClients: async (peerSpecialistUserId, filters = {}) => {
      try {
        console.log('🔍 Searching PSS clients with filters:', filters);

        const result = await service.getByPeerSpecialistId(peerSpecialistUserId);
        
        if (!result.success) {
          return result;
        }

        let filteredMatches = result.data;

        // Apply filters
        if (filters.status) {
          filteredMatches = filteredMatches.filter(match => match.status === filters.status);
        }

        if (filters.recoveryStage) {
          filteredMatches = filteredMatches.filter(match => 
            match.applicant?.recovery_stage?.toLowerCase().includes(filters.recoveryStage.toLowerCase())
          );
        }

        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          filteredMatches = filteredMatches.filter(match => {
            const applicant = match.applicant;
            const registrant = applicant?.registrant;
            
            return (
              registrant?.first_name?.toLowerCase().includes(term) ||
              registrant?.last_name?.toLowerCase().includes(term) ||
              applicant?.recovery_stage?.toLowerCase().includes(term) ||
              (applicant?.primary_issues && applicant.primary_issues.some(issue => 
                issue.toLowerCase().includes(term)
              ))
            );
          });
        }

        console.log(`✅ Found ${filteredMatches.length} matches after filtering`);
        return { success: true, data: filteredMatches, error: null };

      } catch (err) {
        console.error('💥 Exception in searchClients:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get matches by recovery stage
     * @param {string} peerSpecialistUserId - Peer specialist's registrant_profiles.id
     * @param {string} recoveryStage - Recovery stage to filter by
     * @returns {Promise<Object>} Filtered matches
     */
    getClientsByRecoveryStage: async (peerSpecialistUserId, recoveryStage) => {
      try {
        console.log('📊 Fetching clients by recovery stage:', recoveryStage);

        return await service.searchClients(peerSpecialistUserId, {
          recoveryStage: recoveryStage
        });

      } catch (err) {
        console.error('💥 Exception in getClientsByRecoveryStage:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get matches requiring follow-up
     * @param {string} peerSpecialistUserId - Peer specialist's registrant_profiles.id
     * @param {number} daysSinceContact - Days since last contact threshold
     * @returns {Promise<Object>} Matches needing follow-up
     */
    getClientsNeedingFollowup: async (peerSpecialistUserId, daysSinceContact = 7) => {
      try {
        console.log('📊 Fetching clients needing follow-up');

        const result = await service.getByPeerSpecialistId(peerSpecialistUserId);
        
        if (!result.success) {
          return result;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSinceContact);

        const clientsNeedingFollowup = result.data.filter(match => {
          if (match.status !== 'active') return false;
          
          const lastUpdate = new Date(match.updated_at);
          return lastUpdate < cutoffDate;
        });

        console.log(`✅ Found ${clientsNeedingFollowup.length} clients needing follow-up`);
        return { success: true, data: clientsNeedingFollowup, error: null };

      } catch (err) {
        console.error('💥 Exception in getClientsNeedingFollowup:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Bulk update multiple matches
     * @param {Array} updates - Array of {matchId, data} objects
     * @returns {Promise<Object>} Bulk update result
     */
    bulkUpdate: async (updates) => {
      try {
        console.log('📝 Bulk updating', updates.length, 'PSS matches');

        const operations = updates.map(({ matchId, data }) =>
          service.update(matchId, data)
        );

        const results = await Promise.allSettled(operations);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
        const failed = results.filter(r => r.status === 'rejected' || !r.value?.success);

        console.log(`✅ Bulk update complete - ${successful.length} success, ${failed.length} failed`);
        
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
        console.error('💥 Exception in bulkUpdate:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete a peer support match
     * @param {string} matchId - peer_support_matches.id
     * @returns {Promise<Object>} Delete result
     */
    delete: async (matchId) => {
      try {
        console.log('🗑️ Deleting PSS match:', matchId);

        const { data, error } = await supabaseClient
          .from('peer_support_matches')
          .delete()
          .eq('id', matchId)
          .select();

        if (error) {
          console.error('❌ Error deleting PSS match:', error);
          return { success: false, data: null, error };
        }

        console.log('✅ Deleted PSS match:', matchId);
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Exception in delete:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Archive/deactivate a match instead of deleting
     * @param {string} matchId - peer_support_matches.id
     * @param {string} reason - Reason for archiving
     * @returns {Promise<Object>} Archive result
     */
    archive: async (matchId, reason = 'Archived by specialist') => {
      try {
        console.log('📦 Archiving PSS match:', matchId);

        return await service.update(matchId, {
          status: 'inactive',
          archive_reason: reason,
          archived_at: new Date().toISOString()
        });

      } catch (err) {
        console.error('💥 Exception in archive:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Reactivate an archived match
     * @param {string} matchId - peer_support_matches.id
     * @returns {Promise<Object>} Reactivation result
     */
    reactivate: async (matchId) => {
      try {
        console.log('🔄 Reactivating PSS match:', matchId);

        return await service.update(matchId, {
          status: 'active',
          archive_reason: null,
          archived_at: null
        });

      } catch (err) {
        console.error('💥 Exception in reactivate:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return service;
};

export default createPSSClientsService;
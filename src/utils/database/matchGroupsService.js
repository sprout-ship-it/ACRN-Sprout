// src/utils/database/matchGroupsService.js - Match groups service module
/**
 * Match groups service for match_groups table operations
 */

const createMatchGroupsService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for match groups service');
  }

  const tableName = 'match_groups';

  const service = {
    /**
     * Create a new match group
     */
    create: async (groupData) => {
      try {
        console.log('🤝 MatchGroups: Creating match group');

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert({
            ...groupData,
            status: groupData.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ MatchGroups: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ MatchGroups: Match group created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchGroups: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get match groups for a user
     */
    getByUserId: async (userId) => {
      try {
        console.log('🤝 MatchGroups: Fetching match groups for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            applicant_1:registrant_profiles!applicant_1_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            applicant_2:registrant_profiles!applicant_2_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            landlord:registrant_profiles!landlord_id(
              id, 
              first_name, 
              email,
              properties(phone)
            ),
            peer_support:registrant_profiles!peer_support_id(
              id, 
              first_name, 
              email,
              peer_support_profiles(phone)
            ),
            property:properties!property_id(id, title, city, monthly_rent)
          `)
          .or(`applicant_1_id.eq.${userId},applicant_2_id.eq.${userId},landlord_id.eq.${userId},peer_support_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ MatchGroups: GetByUserId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ MatchGroups: Found ${data?.length || 0} match groups for user`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 MatchGroups: GetByUserId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get match group by ID
     */
    getById: async (id) => {
      try {
        console.log('🤝 MatchGroups: Fetching match group by ID:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            applicant_1:registrant_profiles!applicant_1_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            applicant_2:registrant_profiles!applicant_2_id(
              id, 
              first_name, 
              email,
              applicant_forms(phone)
            ),
            landlord:registrant_profiles!landlord_id(
              id, 
              first_name, 
              email,
              properties(phone)
            ),
            peer_support:registrant_profiles!peer_support_id(
              id, 
              first_name, 
              email,
              peer_support_profiles(phone)
            ),
            property:properties!property_id(id, title, address, city, monthly_rent, phone)
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Match group not found' } };
          }
          console.error('❌ MatchGroups: GetById failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ MatchGroups: Match group retrieved successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchGroups: GetById exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update match group
     */
    update: async (id, updates) => {
      try {
        console.log('🤝 MatchGroups: Updating match group:', id);

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
          console.error('❌ MatchGroups: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ MatchGroups: Match group updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchGroups: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * End/dissolve a match group
     */
    endGroup: async (groupId, endedBy, reason = null) => {
      try {
        console.log('🤝 MatchGroups: Ending match group:', groupId);

        const updates = {
          status: 'dissolved',
          dissolved_at: new Date().toISOString(),
          dissolved_reason: reason,
          dissolved_by: endedBy
        };

        return await service.update(groupId, updates);

      } catch (err) {
        console.error('💥 MatchGroups: EndGroup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Complete a match group
     */
    completeGroup: async (groupId, completedBy) => {
      try {
        console.log('🤝 MatchGroups: Completing match group:', groupId);

        const updates = {
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy
        };

        return await service.update(groupId, updates);

      } catch (err) {
        console.error('💥 MatchGroups: CompleteGroup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get connection summary for a user
     */
    getConnectionSummary: async (userId) => {
      try {
        console.log('🤝 MatchGroups: Getting connection summary for user:', userId);

        // Get all groups for user
        const { data: groups, error } = await supabaseClient
          .from(tableName)
          .select(`
            id,
            status,
            match_type,
            created_at,
            applicant_1_id,
            applicant_2_id,
            landlord_id,
            peer_support_id,
            property_id
          `)
          .or(`applicant_1_id.eq.${userId},applicant_2_id.eq.${userId},landlord_id.eq.${userId},peer_support_id.eq.${userId}`);

        if (error) {
          console.error('❌ MatchGroups: GetConnectionSummary failed:', error.message);
          return { success: false, data: { active: 0, completed: 0, total: 0 }, error };
        }

        if (!groups) {
          return { success: true, data: { active: 0, completed: 0, total: 0 }, error: null };
        }

        const summary = {
          active: groups.filter(g => g.status === 'active').length,
          completed: groups.filter(g => g.status === 'completed').length,
          dissolved: groups.filter(g => g.status === 'dissolved').length,
          total: groups.length,
          byType: {
            housing: groups.filter(g => g.property_id).length,
            peer_support: groups.filter(g => g.peer_support_id).length,
            applicant_peer: groups.filter(g => g.applicant_1_id && g.applicant_2_id && !g.property_id && !g.peer_support_id).length
          }
        };

        console.log('✅ MatchGroups: Connection summary calculated');
        return { success: true, data: summary, error: null };

      } catch (err) {
        console.error('💥 MatchGroups: GetConnectionSummary exception:', err);
        return { success: false, data: { active: 0, completed: 0, total: 0 }, error: { message: err.message } };
      }
    },

    /**
     * Get statistics for match groups
     */
    getStatistics: async () => {
      try {
        console.log('🤝 MatchGroups: Fetching statistics');

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('status, match_type, created_at, property_id, peer_support_id');

        if (error) {
          console.error('❌ MatchGroups: Statistics failed:', error.message);
          return { success: false, data: null, error };
        }

        const stats = {
          total: data.length,
          byStatus: {
            active: data.filter(g => g.status === 'active').length,
            completed: data.filter(g => g.status === 'completed').length,
            dissolved: data.filter(g => g.status === 'dissolved').length
          },
          byType: {
            housing: data.filter(g => g.property_id).length,
            peer_support: data.filter(g => g.peer_support_id).length,
            applicant_peer: data.filter(g => !g.property_id && !g.peer_support_id).length
          },
          recentMatches: data.filter(g => {
            const createdDate = new Date(g.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate > weekAgo;
          }).length
        };

        console.log('✅ MatchGroups: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 MatchGroups: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    // Helper methods

    /**
     * Determine match type from match group data
     */
    getMatchType: (matchGroup) => {
      if (matchGroup.property_id && matchGroup.landlord_id) {
        return 'housing';
      } else if (matchGroup.peer_support_id) {
        return 'peer_support';
      } else if (matchGroup.applicant_1_id && matchGroup.applicant_2_id) {
        return 'applicant_peer';
      }
      return 'unknown';
    },

    /**
     * Get the other person in the match relative to current user
     */
    getOtherPerson: (matchGroup, currentUserId) => {
      const matchType = service.getMatchType(matchGroup);
      
      switch (matchType) {
        case 'housing':
          if (matchGroup.landlord_id === currentUserId) {
            return matchGroup.applicant_1 || matchGroup.applicant_2;
          } else {
            return matchGroup.landlord;
          }
        
        case 'peer_support':
          if (matchGroup.peer_support_id === currentUserId) {
            return matchGroup.applicant_1 || matchGroup.applicant_2;
          } else {
            return matchGroup.peer_support;
          }
        
        case 'applicant_peer':
          if (matchGroup.applicant_1_id === currentUserId) {
            return matchGroup.applicant_2;
          } else {
            return matchGroup.applicant_1;
          }
        
        default:
          return null;
      }
    },

    /**
     * Get user's role in match group
     */
    getUserRole: (matchGroup, userId) => {
      if (matchGroup.applicant_1_id === userId || matchGroup.applicant_2_id === userId) {
        return 'applicant';
      } else if (matchGroup.landlord_id === userId) {
        return 'landlord';
      } else if (matchGroup.peer_support_id === userId) {
        return 'peer_support';
      }
      return 'unknown';
    },

    /**
     * Check if user is part of match group
     */
    isUserInGroup: (matchGroup, userId) => {
      return [
        matchGroup.applicant_1_id,
        matchGroup.applicant_2_id,
        matchGroup.landlord_id,
        matchGroup.peer_support_id
      ].includes(userId);
    },

    /**
     * Delete match group (soft delete)
     */
    delete: async (id) => {
      try {
        console.log('🤝 MatchGroups: Soft deleting match group:', id);

        return await service.update(id, { 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        });

      } catch (err) {
        console.error('💥 MatchGroups: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return service;
};

export default createMatchGroupsService;
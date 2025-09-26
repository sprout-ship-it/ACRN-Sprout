// src/utils/database/matchGroupsService.js - Corrected for New Schema
/**
 * SCHEMA STRUCTURE:
 * Complete housing solutions with role-specific IDs:
 * - applicant_1_id: applicant_matching_profiles.id (required)
 * - applicant_2_id: applicant_matching_profiles.id (optional roommate)
 * - property_id: properties.id (required) // ✅ CHANGED: property_id not landlord_id
 * - peer_support_id: peer_support_profiles.id (optional)
 * 
 * Status flow: forming → confirmed → active → completed/disbanded
 */

const createMatchGroupsService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for match groups service');
  }

  const tableName = 'match_groups';

  // Valid status values from schema constraints
  const VALID_STATUSES = ['forming', 'confirmed', 'active', 'completed', 'disbanded'];

  const service = {
    /**
     * Create a new match group
     * @param {Object} groupData - Group data with role-specific IDs
     * @returns {Object} Database response
     */
create: async (groupData) => {
  try {
    console.log('🏠 MatchGroups: Creating match group');

    // Validate required fields
    if (!groupData.applicant_1_id) {
      throw new Error('applicant_1_id is required');
    }

    // ✅ CHANGED: property_id is required, not landlord_id
    if (!groupData.property_id) {
      throw new Error('property_id is required');
    }

    // Validate status if provided
    if (groupData.status && !VALID_STATUSES.includes(groupData.status)) {
      throw new Error(`Invalid status: ${groupData.status}`);
    }

    // Ensure different applicants if both provided
    if (groupData.applicant_2_id && groupData.applicant_1_id === groupData.applicant_2_id) {
      throw new Error('applicant_1_id and applicant_2_id must be different');
    }

    const { data, error } = await supabaseClient
      .from(tableName)
      .insert({
        applicant_1_id: groupData.applicant_1_id,
        applicant_2_id: groupData.applicant_2_id || null,
        property_id: groupData.property_id, // ✅ CHANGED: property_id instead of landlord_id
        peer_support_id: groupData.peer_support_id || null,
        group_name: groupData.group_name || null,
        move_in_date: groupData.move_in_date || null,
        status: groupData.status || 'forming',
        group_chat_active: groupData.group_chat_active || false,
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
     * Get match groups by role-specific user ID
     * @param {string} userType - User type (applicant, landlord, peer-support)
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Database response
     */
getByUserId: async (userType, userId) => {
  try {
    console.log('🏠 MatchGroups: Fetching match groups for', `${userType}:${userId}`);

    let orClause;
    switch (userType) {
      case 'applicant':
        orClause = `applicant_1_id.eq.${userId},applicant_2_id.eq.${userId}`;
        break;
      case 'landlord':
        // ✅ CHANGED: Need to join through properties table to find landlord's groups
        // This requires a different approach since we don't directly reference landlord_id
        const { data: properties, error: propsError } = await supabaseClient
          .from('properties')
          .select('id')
          .eq('landlord_id', userId);
        
        if (propsError) {
          console.error('❌ MatchGroups: Failed to get landlord properties:', propsError);
          return { success: false, data: [], error: propsError };
        }
        
        if (!properties || properties.length === 0) {
          console.log('ℹ️ MatchGroups: No properties found for landlord:', userId);
          return { success: true, data: [], error: null };
        }
        
        const propertyIds = properties.map(p => p.id);
        orClause = propertyIds.map(id => `property_id.eq.${id}`).join(',');
        break;
      case 'peer-support':
        orClause = `peer_support_id.eq.${userId}`;
        break;
      default:
        throw new Error(`Invalid user type: ${userType}`);
    }

    const { data, error } = await supabaseClient
      .from(tableName)
      .select(`
        *,
        applicant_1:applicant_matching_profiles!applicant_1_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state
        ),
        applicant_2:applicant_matching_profiles!applicant_2_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state
        ),
        property:properties!property_id(
          id,
          title,
          address,
          city,
          state,
          monthly_rent,
          property_type,
          landlord:landlord_profiles!landlord_id(
            id,
            primary_phone,
            business_name,
            contact_email
          )
        ),
        peer_support:peer_support_profiles!peer_support_id(
          id, 
          primary_phone,
          bio,
          service_city,
          service_state
        )
      `)
      .or(orClause)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ MatchGroups: GetByUserId failed:', error.message);
      return { success: false, data: [], error };
    }

    console.log(`✅ MatchGroups: Found ${data?.length || 0} match groups`);
    return { success: true, data: data || [], error: null };

  } catch (err) {
    console.error('💥 MatchGroups: GetByUserId exception:', err);
    return { success: false, data: [], error: { message: err.message } };
  }
},

    /**
     * Get match group by ID with full details
     * @param {string} groupId - Match group ID
     * @returns {Object} Database response
     */
getById: async (groupId) => {
  try {
    console.log('🏠 MatchGroups: Fetching match group by ID:', groupId);

    const { data, error } = await supabaseClient
      .from(tableName)
      .select(`
        *,
        applicant_1:applicant_matching_profiles!applicant_1_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state,
          recovery_stage,
          move_in_date
        ),
        applicant_2:applicant_matching_profiles!applicant_2_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state,
          recovery_stage,
          move_in_date
        ),
        property:properties!property_id(
          id,
          title,
          address,
          city,
          state,
          monthly_rent,
          property_type,
          bedrooms,
          bathrooms,
          landlord:landlord_profiles!landlord_id(
            id,
            primary_phone,
            contact_email,
            business_name,
            bio
          )
        ),
        peer_support:peer_support_profiles!peer_support_id(
          id, 
          primary_phone,
          contact_email,
          bio,
          professional_title,
          service_city,
          service_state,
          specialties
        )
      `)
      .eq('id', groupId)
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
     * @param {string} groupId - Match group ID
     * @param {Object} updates - Fields to update
     * @returns {Object} Database response
     */
    update: async (groupId, updates) => {
      try {
        console.log('🏠 MatchGroups: Updating match group:', groupId);

        // Validate status if being updated
        if (updates.status && !VALID_STATUSES.includes(updates.status)) {
          throw new Error(`Invalid status: ${updates.status}`);
        }

        // Validate applicant constraint if being updated
        if (updates.applicant_2_id && updates.applicant_1_id && 
            updates.applicant_1_id === updates.applicant_2_id) {
          throw new Error('applicant_1_id and applicant_2_id must be different');
        }

        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        // Update last_activity when group data changes
        if (Object.keys(updates).some(key => key !== 'last_activity')) {
          updateData.last_activity = new Date().toISOString();
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .update(updateData)
          .eq('id', groupId)
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
     * Confirm a forming group (move from 'forming' to 'confirmed')
     * @param {string} groupId - Match group ID
     * @returns {Object} Database response
     */
    confirmGroup: async (groupId) => {
      try {
        console.log('🏠 MatchGroups: Confirming match group:', groupId);
        return await service.update(groupId, { status: 'confirmed' });
      } catch (err) {
        console.error('💥 MatchGroups: ConfirmGroup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Activate a confirmed group (move to 'active' status)
     * @param {string} groupId - Match group ID
     * @returns {Object} Database response
     */
    activateGroup: async (groupId) => {
      try {
        console.log('🏠 MatchGroups: Activating match group:', groupId);
        return await service.update(groupId, { status: 'active' });
      } catch (err) {
        console.error('💥 MatchGroups: ActivateGroup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Complete a match group
     * @param {string} groupId - Match group ID
     * @returns {Object} Database response
     */
    completeGroup: async (groupId) => {
      try {
        console.log('🏠 MatchGroups: Completing match group:', groupId);
        return await service.update(groupId, { status: 'completed' });
      } catch (err) {
        console.error('💥 MatchGroups: CompleteGroup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Disband a match group
     * @param {string} groupId - Match group ID
     * @returns {Object} Database response
     */
    disbandGroup: async (groupId) => {
      try {
        console.log('🏠 MatchGroups: Disbanding match group:', groupId);
        return await service.update(groupId, { status: 'disbanded' });
      } catch (err) {
        console.error('💥 MatchGroups: DisbandGroup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get connection summary for a user
     * @param {string} userType - User type
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Connection summary
     */
    getConnectionSummary: async (userType, userId) => {
      try {
        console.log('🏠 MatchGroups: Getting connection summary for', `${userType}:${userId}`);

        const groupsResult = await service.getByUserId(userType, userId);
        if (!groupsResult.success) {
          return { success: false, data: { active: 0, completed: 0, total: 0 }, error: groupsResult.error };
        }

        const groups = groupsResult.data || [];

        const summary = {
          total: groups.length,
          forming: groups.filter(g => g.status === 'forming').length,
          confirmed: groups.filter(g => g.status === 'confirmed').length,
          active: groups.filter(g => g.status === 'active').length,
          completed: groups.filter(g => g.status === 'completed').length,
          disbanded: groups.filter(g => g.status === 'disbanded').length,
          withRoommate: groups.filter(g => g.applicant_2_id).length,
          withPeerSupport: groups.filter(g => g.peer_support_id).length,
          recentActivity: groups.filter(g => {
            const lastActivity = new Date(g.last_activity || g.updated_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return lastActivity > weekAgo;
          }).length
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
     * @returns {Object} Statistics data
     */
getStatistics: async () => {
  try {
    console.log('🏠 MatchGroups: Fetching statistics');

    // ✅ CHANGED: Remove monthly_rent since it's not in match_groups table
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('status, applicant_2_id, peer_support_id, group_chat_active, created_at');

    if (error) {
      console.error('❌ MatchGroups: Statistics failed:', error.message);
      return { success: false, data: null, error };
    }

    const stats = {
      total: data.length,
      byStatus: {
        forming: data.filter(g => g.status === 'forming').length,
        confirmed: data.filter(g => g.status === 'confirmed').length,
        active: data.filter(g => g.status === 'active').length,
        completed: data.filter(g => g.status === 'completed').length,
        disbanded: data.filter(g => g.status === 'disbanded').length
      },
      groupTypes: {
        withRoommate: data.filter(g => g.applicant_2_id).length,
        withPeerSupport: data.filter(g => g.peer_support_id).length,
        withBoth: data.filter(g => g.applicant_2_id && g.peer_support_id).length,
        soloApplicant: data.filter(g => !g.applicant_2_id && !g.peer_support_id).length
      },
      communication: {
        activeChatGroups: data.filter(g => g.group_chat_active).length,
        chatAdoptionRate: data.length > 0 ? Math.round((data.filter(g => g.group_chat_active).length / data.length) * 100) : 0
      },
      // ✅ REMOVED: financials section since monthly_rent is in properties table now
      recentActivity: data.filter(g => {
        const createdDate = new Date(g.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return createdDate > monthAgo;
      }).length
    };

    console.log('✅ MatchGroups: Statistics calculated');
    return { success: true, data: stats, error: null };

  } catch (err) {
    console.error('💥 MatchGroups: Statistics exception:', err);
    return { success: false, data: null, error: { message: err.message } };
  }
},


    /**
     * Delete match group (hard delete)
     * @param {string} groupId - Match group ID
     * @returns {Object} Database response
     */
    delete: async (groupId) => {
      try {
        console.log('🏠 MatchGroups: Deleting match group:', groupId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('id', groupId)
          .select();

        if (error) {
          console.error('❌ MatchGroups: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ MatchGroups: Match group deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 MatchGroups: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    // ===== UTILITY METHODS =====

    /**
     * Get user's role in match group
     * @param {Object} matchGroup - Match group data
     * @param {string} userType - User type
     * @param {string} userId - Role-specific user ID
     * @returns {string} User's role in the group
     */
getUserRole: (matchGroup, userType, userId) => {
  switch (userType) {
    case 'applicant':
      if (matchGroup.applicant_1_id === userId) return 'applicant_1';
      if (matchGroup.applicant_2_id === userId) return 'applicant_2';
      break;
    case 'landlord':
      // ✅ CHANGED: Check through property relationship
      if (matchGroup.property && matchGroup.property.landlord && matchGroup.property.landlord.id === userId) {
        return 'landlord';
      }
      break;
    case 'peer-support':
      if (matchGroup.peer_support_id === userId) return 'peer_support';
      break;
  }
  return 'none';
},

    /**
     * Check if user is part of match group
     * @param {Object} matchGroup - Match group data
     * @param {string} userType - User type
     * @param {string} userId - Role-specific user ID
     * @returns {boolean} Whether user is in the group
     */
    isUserInGroup: (matchGroup, userType, userId) => {
      return service.getUserRole(matchGroup, userType, userId) !== 'none';
    },

    /**
     * Get group composition summary
     * @param {Object} matchGroup - Match group data
     * @returns {Object} Group composition details
     */
getGroupComposition: (matchGroup) => {
  return {
    hasRoommate: !!matchGroup.applicant_2_id,
    hasPeerSupport: !!matchGroup.peer_support_id,
    hasProperty: !!matchGroup.property_id, // ✅ CHANGED: Check property_id
    memberCount: [
      matchGroup.applicant_1_id,
      matchGroup.applicant_2_id,
      matchGroup.property_id, // ✅ CHANGED: property_id not landlord_id
      matchGroup.peer_support_id
    ].filter(id => id).length,
    groupType: matchGroup.applicant_2_id && matchGroup.peer_support_id ? 'full' :
               matchGroup.applicant_2_id ? 'roommate' :
               matchGroup.peer_support_id ? 'peer_support' : 'minimal'
  };
},

    // Legacy method names for backward compatibility
    endGroup: async (groupId) => service.disbandGroup(groupId)
  };

  return service;
};

export const getMatchGroupsByUserId = async (userType, userId) => {
  try {
    console.log('🏠 Fetching match groups for user:', userType, userId);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let orClause;
    switch (userType) {
      case 'applicant':
        orClause = `applicant_1_id.eq.${userId},applicant_2_id.eq.${userId}`;
        break;
      case 'landlord':
        // Need to join through properties table
        const { data: properties, error: propsError } = await supabase
          .from('properties')
          .select('id')
          .eq('landlord_id', userId);
        
        if (propsError) {
          return { success: false, data: [], error: propsError };
        }
        
        if (!properties || properties.length === 0) {
          return { success: true, data: [], error: null };
        }
        
        const propertyIds = properties.map(p => p.id);
        orClause = propertyIds.map(id => `property_id.eq.${id}`).join(',');
        break;
      case 'peer-support':
        orClause = `peer_support_id.eq.${userId}`;
        break;
      default:
        return { success: false, error: `Invalid user type: ${userType}` };
    }

    const { data, error } = await supabase
      .from('match_groups')
      .select(`
        *,
        applicant_1:applicant_matching_profiles!applicant_1_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state
        ),
        applicant_2:applicant_matching_profiles!applicant_2_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state
        ),
        property:properties!property_id(
          id,
          title,
          address,
          city,
          state,
          monthly_rent,
          property_type
        ),
        peer_support:peer_support_profiles!peer_support_id(
          id, 
          primary_phone,
          bio,
          service_city,
          service_state
        )
      `)
      .or(orClause)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching match groups:', error);
      return { success: false, data: [], error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getMatchGroupsByUserId:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const createMatchGroup = async (groupData) => {
  try {
    console.log('🏠 Creating match group:', groupData);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate required fields
    if (!groupData.applicant_1_id) {
      return { success: false, error: 'applicant_1_id is required' };
    }

    if (!groupData.property_id) {
      return { success: false, error: 'property_id is required' };
    }

    // Ensure different applicants if both provided
    if (groupData.applicant_2_id && groupData.applicant_1_id === groupData.applicant_2_id) {
      return { success: false, error: 'applicant_1_id and applicant_2_id must be different' };
    }

    const { data, error } = await supabase
      .from('match_groups')
      .insert({
        applicant_1_id: groupData.applicant_1_id,
        applicant_2_id: groupData.applicant_2_id || null,
        property_id: groupData.property_id,
        peer_support_id: groupData.peer_support_id || null,
        group_name: groupData.group_name || null,
        move_in_date: groupData.move_in_date || null,
        status: groupData.status || 'forming',
        group_chat_active: groupData.group_chat_active || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating match group:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in createMatchGroup:', err);
    return { success: false, error: err.message };
  }
};

export const updateMatchGroupStatus = async (groupId, status) => {
  try {
    console.log('🏠 Updating match group status:', groupId, status);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const validStatuses = ['forming', 'confirmed', 'active', 'completed', 'disbanded'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status: ${status}` };
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('match_groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating match group status:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in updateMatchGroupStatus:', err);
    return { success: false, error: err.message };
  }
};

export const getMatchGroupById = async (groupId) => {
  try {
    console.log('🏠 Fetching match group by ID:', groupId);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('match_groups')
      .select(`
        *,
        applicant_1:applicant_matching_profiles!applicant_1_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state,
          recovery_stage,
          move_in_date
        ),
        applicant_2:applicant_matching_profiles!applicant_2_id(
          id, 
          primary_phone,
          about_me,
          primary_city,
          primary_state,
          recovery_stage,
          move_in_date
        ),
        property:properties!property_id(
          id,
          title,
          address,
          city,
          state,
          monthly_rent,
          property_type,
          bedrooms,
          bathrooms
        ),
        peer_support:peer_support_profiles!peer_support_id(
          id, 
          primary_phone,
          contact_email,
          bio,
          professional_title,
          service_city,
          service_state,
          specialties
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Match group not found' } };
      }
      console.error('❌ Error fetching match group:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in getMatchGroupById:', err);
    return { success: false, error: err.message };
  }
};

export default createMatchGroupsService;
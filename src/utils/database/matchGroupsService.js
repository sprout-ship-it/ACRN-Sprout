// src/utils/database/matchGroupsService.js - UPDATED FOR JSONB roommate_ids
/**
 * UPDATED SCHEMA STRUCTURE:
 * - roommate_ids: JSONB array of applicant_matching_profiles.id values
 * - property_id: properties.id (optional)
 * - peer_support_id: peer_support_profiles.id (optional)
 * - requested_by_id: applicant_matching_profiles.id (who created/requested)
 * - pending_member_id: applicant_matching_profiles.id (who needs to accept)
 * 
 * Status flow: requested → forming → confirmed → active → completed/disbanded
 */
import { supabase } from '../supabase';

const createMatchGroupsService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for match groups service');
  }

  const tableName = 'match_groups';
  const VALID_STATUSES = ['requested', 'forming', 'confirmed', 'active', 'completed', 'disbanded'];

  const service = {
    /**
     * Create a new match group
     * @param {Object} groupData - Group data with roommate_ids array
     * @returns {Object} Database response
     */
    create: async (groupData) => {
      try {
        console.log('🏠 MatchGroups: Creating match group');

        // Validate required fields
        if (!groupData.roommate_ids || !Array.isArray(groupData.roommate_ids) || groupData.roommate_ids.length === 0) {
          throw new Error('roommate_ids must be a non-empty array');
        }

        // Validate status if provided
        if (groupData.status && !VALID_STATUSES.includes(groupData.status)) {
          throw new Error(`Invalid status: ${groupData.status}`);
        }

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert({
            roommate_ids: JSON.stringify(groupData.roommate_ids), // Convert to JSONB
            property_id: groupData.property_id || null,
            peer_support_id: groupData.peer_support_id || null,
            group_name: groupData.group_name || null,
            move_in_date: groupData.move_in_date || null,
            status: groupData.status || 'requested',
            requested_by_id: groupData.requested_by_id || null,
            pending_member_id: groupData.pending_member_id || null,
            message: groupData.message || null,
            member_confirmations: groupData.member_confirmations || {},
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
     * Get match groups by user ID (checks if user is in roommate_ids array)
     * @param {string} userType - User type (applicant, landlord, peer-support)
     * @param {string} userId - Role-specific user ID
     * @returns {Object} Database response
     */
    getByUserId: async (userType, userId) => {
      try {
        console.log('🏠 MatchGroups: Fetching match groups for', `${userType}:${userId}`);

        let query;
        
        switch (userType) {
          case 'applicant':
            // Check if userId is in the roommate_ids JSONB array
            query = supabaseClient
              .from(tableName)
              .select(`
                *,
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
              .contains('roommate_ids', JSON.stringify([userId]));
            break;
            
          case 'landlord':
            // Get properties owned by landlord, then get groups for those properties
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
            query = supabaseClient
              .from(tableName)
              .select(`
                *,
                property:properties!property_id(
                  id,
                  title,
                  address,
                  city,
                  state,
                  monthly_rent,
                  property_type
                )
              `)
              .in('property_id', propertyIds);
            break;
            
          case 'peer-support':
            query = supabaseClient
              .from(tableName)
              .select(`
                *,
                property:properties!property_id(
                  id,
                  title,
                  address,
                  city,
                  state
                )
              `)
              .eq('peer_support_id', userId);
            break;
            
          default:
            throw new Error(`Invalid user type: ${userType}`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

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

        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        // Convert roommate_ids to JSONB if present
        if (updateData.roommate_ids && Array.isArray(updateData.roommate_ids)) {
          updateData.roommate_ids = JSON.stringify(updateData.roommate_ids);
        }

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
     * Add member to group
     * @param {string} groupId - Match group ID
     * @param {string} memberId - Applicant ID to add
     * @returns {Object} Database response
     */
    addMember: async (groupId, memberId) => {
      try {
        console.log('🏠 MatchGroups: Adding member to group:', groupId, memberId);

        // Get current group
        const groupResult = await service.getById(groupId);
        if (!groupResult.success) {
          return groupResult;
        }

        const currentIds = groupResult.data.roommate_ids || [];
        
        // Check if member already in group
        if (currentIds.includes(memberId)) {
          return { success: false, error: { message: 'Member already in group' } };
        }

        // Add member
        const updatedIds = [...currentIds, memberId];

        return await service.update(groupId, {
          roommate_ids: updatedIds,
          status: 'forming'
        });

      } catch (err) {
        console.error('💥 MatchGroups: AddMember exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Remove member from group
     * @param {string} groupId - Match group ID
     * @param {string} memberId - Applicant ID to remove
     * @returns {Object} Database response
     */
    removeMember: async (groupId, memberId) => {
      try {
        console.log('🏠 MatchGroups: Removing member from group:', groupId, memberId);

        // Get current group
        const groupResult = await service.getById(groupId);
        if (!groupResult.success) {
          return groupResult;
        }

        const currentIds = groupResult.data.roommate_ids || [];
        const updatedIds = currentIds.filter(id => id !== memberId);

        // If no members left, disband the group
        if (updatedIds.length === 0) {
          return await service.update(groupId, { status: 'disbanded' });
        }

        return await service.update(groupId, {
          roommate_ids: updatedIds
        });

      } catch (err) {
        console.error('💥 MatchGroups: RemoveMember exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Confirm a forming group (move from 'requested' or 'forming' to 'confirmed')
     */
    confirmGroup: async (groupId) => {
      return await service.update(groupId, { status: 'confirmed' });
    },

    /**
     * Activate a confirmed group (move to 'active' status)
     */
    activateGroup: async (groupId) => {
      return await service.update(groupId, { status: 'active' });
    },

    /**
     * Complete a match group
     */
    completeGroup: async (groupId) => {
      return await service.update(groupId, { status: 'completed' });
    },

    /**
     * Disband a match group
     */
    disbandGroup: async (groupId) => {
      return await service.update(groupId, { status: 'disbanded' });
    },

    /**
     * Delete match group (hard delete)
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

    /**
     * Check if user is in group
     */
    isUserInGroup: (matchGroup, userId) => {
      const roommateIds = matchGroup.roommate_ids || [];
      return roommateIds.includes(userId);
    },

    /**
     * Get group composition summary
     */
    getGroupComposition: (matchGroup) => {
      const roommateIds = matchGroup.roommate_ids || [];
      return {
        roommateCount: roommateIds.length,
        hasPeerSupport: !!matchGroup.peer_support_id,
        hasProperty: !!matchGroup.property_id,
        totalMembers: roommateIds.length + (matchGroup.peer_support_id ? 1 : 0),
        groupType: roommateIds.length > 1 ? 'multiple_roommates' : 'single_applicant'
      };
    }
  };

  return service;
};

// Standalone helper functions
export const getMatchGroupsByUserId = async (userType, userId, authenticatedSupabase = null) => {
  const supabaseClient = authenticatedSupabase || supabase;
  const service = createMatchGroupsService(supabaseClient);
  return await service.getByUserId(userType, userId);
};

export const createMatchGroup = async (groupData, authenticatedSupabase = null) => {
  const supabaseClient = authenticatedSupabase || supabase;
  const service = createMatchGroupsService(supabaseClient);
  return await service.create(groupData);
};

export const updateMatchGroupStatus = async (groupId, status, authenticatedSupabase = null) => {
  const supabaseClient = authenticatedSupabase || supabase;
  const service = createMatchGroupsService(supabaseClient);
  return await service.update(groupId, { status });
};

export const getMatchGroupById = async (groupId, authenticatedSupabase = null) => {
  const supabaseClient = authenticatedSupabase || supabase;
  const service = createMatchGroupsService(supabaseClient);
  return await service.getById(groupId);
};

export default createMatchGroupsService;
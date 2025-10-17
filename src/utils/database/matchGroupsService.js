// src/utils/database/matchGroupsService.js - UPDATED FOR GROUP EXPANSION
/**
 * UPDATED SCHEMA STRUCTURE:
 * - roommate_ids: JSONB array of applicant_matching_profiles.id values (confirmed members)
 * - pending_member_ids: JSONB array of applicant IDs waiting to join
 * - member_confirmations: JSONB object tracking approval status
 * - property_id: properties.id (optional)
 * - peer_support_id: peer_support_profiles.id (optional)
 * - requested_by_id: applicant_matching_profiles.id (who created/requested)
 * 
 * Status flow (SIMPLIFIED): requested → active → inactive
 */
import { supabase } from '../supabase';

const createMatchGroupsService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for match groups service');
  }

  const tableName = 'match_groups';
  const VALID_STATUSES = ['requested', 'active', 'inactive'];

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
            roommate_ids: groupData.roommate_ids,
            pending_member_ids: groupData.pending_member_ids || [],
            property_id: groupData.property_id || null,
            peer_support_id: groupData.peer_support_id || null,
            group_name: groupData.group_name || null,
            move_in_date: groupData.move_in_date || null,
            status: groupData.status || 'requested',
            requested_by_id: groupData.requested_by_id || null,
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
     * Find if user is in an active group (for roommate requests)
     * @param {string} userId - Applicant matching profile ID
     * @returns {Object} Database response with group or null
     */
    findActiveGroupForUser: async (userId) => {
      try {
        console.log('🔍 MatchGroups: Finding active group for user:', userId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .contains('roommate_ids', [userId])
          .in('status', ['requested', 'active'])
          .is('property_id', null) // Only roommate groups, not housing
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('❌ MatchGroups: FindActiveGroup failed:', error.message);
          return { success: false, data: null, error };
        }

        const group = data && data.length > 0 ? data[0] : null;
        console.log(group ? '✅ Found active group' : 'ℹ️ No active group found');
        
        return { success: true, data: group, error: null };

      } catch (err) {
        console.error('💥 MatchGroups: FindActiveGroup exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Invite a new member to an existing group
     * @param {string} groupId - Match group ID
     * @param {string} inviterId - ID of person sending invite (auto-approves)
     * @param {string} inviteeId - ID of person being invited
     * @returns {Object} Database response
     */
    inviteMemberToGroup: async (groupId, inviterId, inviteeId) => {
      try {
        console.log('🏠 MatchGroups: Inviting member to group:', { groupId, inviterId, inviteeId });

        // Get current group
        const groupResult = await service.getById(groupId);
        if (!groupResult.success) {
          return groupResult;
        }

        const group = groupResult.data;
        const currentMembers = group.roommate_ids || [];
        const pendingMembers = group.pending_member_ids || [];
        const confirmations = group.member_confirmations || {};

        // Validate inviter is in the group
        if (!currentMembers.includes(inviterId)) {
          return { 
            success: false, 
            error: { message: 'Inviter is not a member of this group' } 
          };
        }

        // Check if invitee is already a member or pending
        if (currentMembers.includes(inviteeId)) {
          return { 
            success: false, 
            error: { message: 'User is already a member of this group' } 
          };
        }

        if (pendingMembers.includes(inviteeId)) {
          return { 
            success: false, 
            error: { message: 'User already has a pending invitation to this group' } 
          };
        }

        // Get other members who need to approve (everyone except inviter)
        const needsApprovalFrom = currentMembers.filter(id => id !== inviterId);

        // Create confirmation tracking for this invitee
        const newConfirmations = {
          ...confirmations,
          [inviteeId]: {
            invited_by: inviterId,
            invited_at: new Date().toISOString(),
            approved_by_existing: [inviterId], // Auto-approve by inviter
            accepted_by_invitee: false,
            needs_approval_from: needsApprovalFrom
          }
        };

        // Update group with new pending member
        return await service.update(groupId, {
          pending_member_ids: [...pendingMembers, inviteeId],
          member_confirmations: newConfirmations
        });

      } catch (err) {
        console.error('💥 MatchGroups: InviteMember exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Existing member approves a pending invitee
     * @param {string} groupId - Match group ID
     * @param {string} approverId - ID of existing member approving
     * @param {string} inviteeId - ID of pending member
     * @returns {Object} Database response
     */
    approvePendingMember: async (groupId, approverId, inviteeId) => {
      try {
        console.log('✅ MatchGroups: Approving pending member:', { groupId, approverId, inviteeId });

        // Get current group
        const groupResult = await service.getById(groupId);
        if (!groupResult.success) {
          return groupResult;
        }

        const group = groupResult.data;
        const confirmations = group.member_confirmations || {};

        // Validate invitee is pending
        if (!confirmations[inviteeId]) {
          return { 
            success: false, 
            error: { message: 'No pending invitation found for this user' } 
          };
        }

        const invitation = confirmations[inviteeId];
        
        // Check if approver needs to approve
        if (!invitation.needs_approval_from.includes(approverId)) {
          return { 
            success: false, 
            error: { message: 'You have already approved this member or are not required to approve' } 
          };
        }

        // Add approver and remove from needs_approval
        const updatedInvitation = {
          ...invitation,
          approved_by_existing: [...invitation.approved_by_existing, approverId],
          needs_approval_from: invitation.needs_approval_from.filter(id => id !== approverId)
        };

        const updatedConfirmations = {
          ...confirmations,
          [inviteeId]: updatedInvitation
        };

        // Update group
        const updateResult = await service.update(groupId, {
          member_confirmations: updatedConfirmations
        });

        if (!updateResult.success) {
          return updateResult;
        }

        // Check if all approvals complete and invitee has accepted
        if (updatedInvitation.needs_approval_from.length === 0 && updatedInvitation.accepted_by_invitee) {
          console.log('🎉 All approvals complete! Moving member to active group');
          return await service.confirmPendingMember(groupId, inviteeId);
        }

        return updateResult;

      } catch (err) {
        console.error('💥 MatchGroups: ApprovePendingMember exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Pending invitee accepts the invitation
     * @param {string} groupId - Match group ID
     * @param {string} inviteeId - ID of pending member accepting
     * @returns {Object} Database response
     */
    acceptGroupInvitation: async (groupId, inviteeId) => {
      try {
        console.log('✅ MatchGroups: Invitee accepting invitation:', { groupId, inviteeId });

        // Get current group
        const groupResult = await service.getById(groupId);
        if (!groupResult.success) {
          return groupResult;
        }

        const group = groupResult.data;
        const confirmations = group.member_confirmations || {};

        // Validate invitee is pending
        if (!confirmations[inviteeId]) {
          return { 
            success: false, 
            error: { message: 'No pending invitation found' } 
          };
        }

        const invitation = confirmations[inviteeId];

        // Update acceptance status
        const updatedInvitation = {
          ...invitation,
          accepted_by_invitee: true,
          accepted_at: new Date().toISOString()
        };

        const updatedConfirmations = {
          ...confirmations,
          [inviteeId]: updatedInvitation
        };

        // Update group
        const updateResult = await service.update(groupId, {
          member_confirmations: updatedConfirmations
        });

        if (!updateResult.success) {
          return updateResult;
        }

        // Check if all approvals complete
        if (updatedInvitation.needs_approval_from.length === 0) {
          console.log('🎉 All approvals complete! Moving member to active group');
          return await service.confirmPendingMember(groupId, inviteeId);
        }

        return updateResult;

      } catch (err) {
        console.error('💥 MatchGroups: AcceptGroupInvitation exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Move pending member to confirmed members (called after all approvals)
     * @param {string} groupId - Match group ID
     * @param {string} inviteeId - ID of member to confirm
     * @returns {Object} Database response
     */
    confirmPendingMember: async (groupId, inviteeId) => {
      try {
        console.log('🏠 MatchGroups: Confirming pending member:', { groupId, inviteeId });

        // Get current group
        const groupResult = await service.getById(groupId);
        if (!groupResult.success) {
          return groupResult;
        }

        const group = groupResult.data;
        const currentMembers = group.roommate_ids || [];
        const pendingMembers = group.pending_member_ids || [];
        const confirmations = group.member_confirmations || {};

        // Move from pending to active
        const updatedMembers = [...currentMembers, inviteeId];
        const updatedPending = pendingMembers.filter(id => id !== inviteeId);

        // Remove from confirmations tracking
        const updatedConfirmations = { ...confirmations };
        delete updatedConfirmations[inviteeId];

        // Update group
        return await service.update(groupId, {
          roommate_ids: updatedMembers,
          pending_member_ids: updatedPending,
          member_confirmations: updatedConfirmations,
          status: 'active' // Ensure group is active when member joins
        });

      } catch (err) {
        console.error('💥 MatchGroups: ConfirmPendingMember exception:', err);
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
              .contains('roommate_ids', [userId]);
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

        // If only 1 member left, mark as inactive
        if (updatedIds.length <= 1) {
          return await service.update(groupId, { 
            roommate_ids: updatedIds,
            status: 'inactive' 
          });
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
     * Check if user is in group (confirmed members only)
     */
    isUserInGroup: (matchGroup, userId) => {
      const roommateIds = matchGroup.roommate_ids || [];
      return roommateIds.includes(userId);
    },

    /**
     * Check if user has pending invitation
     */
    isUserPendingInGroup: (matchGroup, userId) => {
      const pendingIds = matchGroup.pending_member_ids || [];
      return pendingIds.includes(userId);
    },

    /**
     * Get group composition summary
     */
    getGroupComposition: (matchGroup) => {
      const roommateIds = matchGroup.roommate_ids || [];
      const pendingIds = matchGroup.pending_member_ids || [];
      
      return {
        confirmedCount: roommateIds.length,
        pendingCount: pendingIds.length,
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

export const findActiveGroupForUser = async (userId, authenticatedSupabase = null) => {
  const supabaseClient = authenticatedSupabase || supabase;
  const service = createMatchGroupsService(supabaseClient);
  return await service.findActiveGroupForUser(userId);
};

export const inviteMemberToGroup = async (groupId, inviterId, inviteeId, authenticatedSupabase = null) => {
  const supabaseClient = authenticatedSupabase || supabase;
  const service = createMatchGroupsService(supabaseClient);
  return await service.inviteMemberToGroup(groupId, inviterId, inviteeId);
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
// src/components/features/connections/ConnectionHub.js - WITH GROUP MODAL
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ProfileModal from './ProfileModal';
import PropertyDetailsModal from './modals/PropertyDetailsModal';
import GroupDetailsModal from './modals/GroupDetailsModal';
import styles from './ConnectionHub.module.css';
import createMatchGroupsService from '../../../utils/database/matchGroupsService';

const ConnectionHub = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [connections, setConnections] = useState({
    active: [],
    sent: [],
    awaiting: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  
  // Modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [actionLoading, setActionLoading] = useState(false);

  // Get user's role-specific profile IDs
  const [profileIds, setProfileIds] = useState({
    applicant: null,
    peerSupport: null,
    landlord: null,
    employer: null
  });

  /**
   * Format name to show only first name and last initial
   * CRITICAL PRIVACY FUNCTION - Used everywhere names are displayed
   */
  const formatName = (firstName, lastName) => {
    if (!firstName) return 'Unknown';
    if (!lastName) return firstName;
    return `${firstName} ${lastName.charAt(0)}.`;
  };

  /**
   * Load user's role-specific profile IDs
   */
  const loadProfileIds = async () => {
    if (!profile?.id) return;

    try {
      const ids = { applicant: null, peerSupport: null, landlord: null, employer: null };

      if (profile.roles?.includes('applicant')) {
        const { data, error } = await supabase
          .from('applicant_matching_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (data && !error) ids.applicant = data.id;
      }

      if (profile.roles?.includes('peer-support')) {
        const { data, error } = await supabase
          .from('peer_support_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (data && !error) ids.peerSupport = data.id;
      }

      if (profile.roles?.includes('landlord')) {
        const { data, error } = await supabase
          .from('landlord_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (data && !error) ids.landlord = data.id;
      }

      if (profile.roles?.includes('employer')) {
        const { data, error } = await supabase
          .from('employer_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (data && !error) ids.employer = data.id;
      }

      setProfileIds(ids);
    } catch (err) {
      console.error('Error loading profile IDs:', err);
    }
  };

  const loadConnections = async () => {
    if (!profile?.id) return;

    setLoading(true);
    setError(null);

    try {
      const connectionCategories = {
        active: [],
        sent: [],
        awaiting: []
      };

      // Load all connection types
      if (profileIds.applicant) {
        await loadMatchGroupConnections(connectionCategories);
      }

      if (profileIds.applicant || profileIds.landlord) {
        await loadHousingMatches(connectionCategories);
      }

      if (profileIds.applicant || profileIds.peerSupport) {
        await loadPeerSupportConnections(connectionCategories);
      }

      if (profileIds.applicant || profileIds.employer) {
        await loadEmploymentConnections(connectionCategories);
      }

      // Sort all categories
      Object.keys(connectionCategories).forEach(category => {
        connectionCategories[category].sort((a, b) => 
          new Date(b.last_activity) - new Date(a.last_activity)
        );
      });

      setConnections(connectionCategories);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

/**
 * Load roommate connections from match_groups (no properties)
 * ✅ FIXED: Implements all 5 cases with proper array checking and member_confirmations parsing
 */
const loadMatchGroupConnections = async (categories) => {
  try {
    const { data: matchGroups, error } = await supabase
      .from('match_groups')
      .select('*')
      .or(`roommate_ids.cs.["${profileIds.applicant}"],requested_by_id.eq.${profileIds.applicant},pending_member_ids.cs.["${profileIds.applicant}"]`)
      .is('property_id', null);

    if (error) throw error;
    if (!matchGroups || matchGroups.length === 0) return;

    for (const group of matchGroups) {
      const roommateIds = group.roommate_ids || [];
      const pendingIds = group.pending_member_ids || [];
      const confirmations = group.member_confirmations || {};
      const isRequester = group.requested_by_id === profileIds.applicant;
      const isConfirmedMember = roommateIds.includes(profileIds.applicant);
      const isPendingMember = pendingIds.includes(profileIds.applicant);

      // Load profiles for ALL members (both confirmed and pending)
      const allMemberIds = [...roommateIds, ...pendingIds].filter(id => id !== profileIds.applicant);
      
      if (allMemberIds.length === 0) continue;
      
const { data: memberData } = await supabase
  .from('applicant_profiles_with_conditional_contact')  // ← Changed
  .select(`
    id, 
    user_id, 
    primary_phone,
    date_of_birth, 
    recovery_stage, 
    work_schedule, 
    budget_min, 
    budget_max, 
    primary_location,
    is_confirmed_groupmate,
    is_pending_groupmate,
    registrant_profiles(first_name, last_name, email)
  `)
  .in('id', allMemberIds);
      
      const members = memberData || [];
      
      // Split into confirmed and pending for display purposes
      const confirmedMembers = members.filter(m => roommateIds.includes(m.id));
      const pendingMembers = members.filter(m => pendingIds.includes(m.id));

      // ✅ CASE 0: Initial 2-person request (no member_confirmations yet)
      // This handles the very first request where A sends to B
if (group.status === 'requested' && 
    roommateIds.length === 1 &&  // ← Changed from 2 to 1
    pendingIds.length === 1 &&
    Object.keys(confirmations).length === 0) {
        
        const pendingMember = members.find(m => m.id === pendingIds[0]);
        const isPendingUser = pendingIds.includes(profileIds.applicant);
        
        const connection = {
          id: group.id,
          type: 'roommate',
          status: group.status,
          source: 'match_group',
          match_group_id: group.id,
          created_at: group.created_at,
          last_activity: group.updated_at || group.created_at,
          avatar: '👥',
          roommates: pendingMember ? [pendingMember] : confirmedMembers,
          requested_by_id: group.requested_by_id,
          pending_member_ids: pendingIds,
          member_confirmations: confirmations,
          message: group.message || (isPendingUser ? 'You have a new roommate request' : 'Waiting for response'),
          group_name: group.group_name,
          move_in_date: group.move_in_date
        };

        if (isPendingUser) {
          categories.awaiting.push(connection);
        } else if (isRequester) {
          categories.sent.push(connection);
        }
        
        continue; // Skip other cases for initial requests
      }

      // ✅ CASE 1: User is pending invitee (needs to accept invitation)
      if (isPendingMember) {
        const confirmation = confirmations[profileIds.applicant];
        if (confirmation) {
          const connection = {
            id: `${group.id}-invitee-${profileIds.applicant}`,
            type: 'roommate',
            status: group.status,
            source: 'match_group',
            match_group_id: group.id,
            created_at: confirmation.invited_at || group.created_at,
            last_activity: group.updated_at || group.created_at,
            avatar: '👥',
            roommates: confirmedMembers, // Show existing members
            requested_by_id: confirmation.invited_by,
            pending_member_ids: pendingIds,
            member_confirmations: confirmations,
            message: group.message || `You've been invited to join this roommate group`,
            group_name: group.group_name,
            move_in_date: group.move_in_date,
            is_group_expansion: true,
            needs_approval_from: confirmation.needs_approval_from || []
          };
          
          categories.awaiting.push(connection);
        }
      }

      // ✅ CASE 2: User is confirmed member and needs to approve pending member(s)
      if (isConfirmedMember && pendingIds.length > 0) {
        pendingIds.forEach(pendingId => {
          const confirmation = confirmations[pendingId];
          
          // Check if current user needs to approve this pending member
          if (confirmation && confirmation.needs_approval_from?.includes(profileIds.applicant)) {
            const pendingMember = members.find(m => m.id === pendingId);
            
            const connection = {
              id: `${group.id}-approve-${pendingId}`,
              type: 'roommate',
              status: group.status,
              source: 'match_group',
              match_group_id: group.id,
              created_at: confirmation.invited_at || group.created_at,
              last_activity: group.updated_at || group.created_at,
              avatar: '👥',
              roommates: pendingMember ? [...confirmedMembers, pendingMember] : confirmedMembers, // Show group context + who wants to join
              requested_by_id: confirmation.invited_by,
              pending_member_ids: [pendingId],
              pending_member_id: pendingId,
              member_confirmations: confirmations,
              message: group.message || `New member wants to join your roommate group`,
              group_name: group.group_name,
              move_in_date: group.move_in_date,
              is_group_expansion: true,
              group_size: roommateIds.length
            };
            
            categories.awaiting.push(connection);
          }
        });
      }

      // ✅ CASE 3: User sent invitation(s) - show in sent requests
      if (isConfirmedMember && pendingIds.length > 0) {
        pendingIds.forEach(pendingId => {
          const confirmation = confirmations[pendingId];
          
          // Check if current user was the inviter
          if (confirmation && confirmation.invited_by === profileIds.applicant) {
            const pendingMember = members.find(m => m.id === pendingId);
            
            const connection = {
              id: `${group.id}-invited-${pendingId}`,
              type: 'roommate',
              status: group.status,
              source: 'match_group',
              match_group_id: group.id,
              created_at: confirmation.invited_at || group.created_at,
              last_activity: group.updated_at || group.created_at,
              avatar: '👥',
              roommates: pendingMember ? [...confirmedMembers, pendingMember] : confirmedMembers, // Show confirmed members + who was invited
              requested_by_id: profileIds.applicant,
              pending_member_ids: [pendingId],
              pending_member_id: pendingId,
              member_confirmations: confirmations,
              message: group.message || `Waiting for group members to approve`,
              group_name: group.group_name,
              move_in_date: group.move_in_date,
              is_group_expansion: true,
              group_size: roommateIds.length,
              awaiting_approvals: confirmation.needs_approval_from || []
            };
            
            categories.sent.push(connection);
          }
        });
      }

      // ✅ CASE 5: Standard roommate groups (no property, no pending members)
      if (!group.property_id && roommateIds.length >= 2 && pendingIds.length === 0 && isConfirmedMember) {
        const connection = {
          id: group.id,
          type: 'roommate',
          status: group.status,
          source: 'match_group',
          match_group_id: group.id,
          created_at: group.created_at,
          last_activity: group.updated_at || group.created_at,
          avatar: '👥',
          roommates: confirmedMembers,
          requested_by_id: group.requested_by_id,
          pending_member_ids: [],
          member_confirmations: confirmations,
          message: group.message,
          group_name: group.group_name,
          move_in_date: group.move_in_date
        };

        // Categorize based on status
        if (group.status === 'requested') {
          if (isRequester) {
            categories.sent.push(connection);
          } else {
            categories.awaiting.push(connection);
          }
        } else if (group.status === 'active') {
          categories.active.push(connection);
        }
      }
    }
  } catch (error) {
    console.error('Error in loadMatchGroupConnections:', error);
    throw error;
  }
};

  /**
   * Load housing matches from housing_matches table
   */
  const loadHousingMatches = async (categories) => {
    try {
      let query = supabase.from('housing_matches').select('*');
      const conditions = [];
      
      if (profileIds.applicant) {
        conditions.push(`applicant_id.eq.${profileIds.applicant}`);
      }
      
      if (profileIds.landlord) {
        const { data: properties } = await supabase
          .from('properties')
          .select('id')
          .eq('landlord_id', profileIds.landlord);
        
        if (properties && properties.length > 0) {
          const propertyIds = properties.map(p => p.id);
          conditions.push(`property_id.in.(${propertyIds.join(',')})`);
        }
      }
      
      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }

      const { data: matches, error } = await query;
      if (error) throw error;
      if (!matches || matches.length === 0) return;

      for (const match of matches) {
        const isApplicant = match.applicant_id === profileIds.applicant;
        
        let property = null;
        if (match.property_id) {
          const { data: propData } = await supabase
            .from('properties')
            .select(`
              *,
              landlord_profiles(
                id,
                user_id,
                primary_phone,
                contact_email,
                contact_person,
                business_name,
                registrant_profiles(first_name, last_name, email)
              )
            `)
            .eq('id', match.property_id)
            .single();
          property = propData;
        }
        
        let applicant = null;
        if (!isApplicant && match.applicant_id) {
const { data: applicantData } = await supabase
  .from('applicant_profiles_with_conditional_contact')  // ← Changed
  .select('*, registrant_profiles(*)')
  .eq('id', match.applicant_id)
  .single();
          applicant = applicantData;
        }

        const connection = {
          id: match.id,
          type: 'landlord',
          status: match.status,
          source: 'housing_match',
          housing_match_id: match.id,
          created_at: match.created_at,
          last_activity: match.updated_at || match.created_at,
          avatar: '🏠',
          property: property,
          requesting_applicant: applicant,
          applicant_message: match.applicant_message,
          landlord_message: match.landlord_message,
          compatibility_score: match.compatibility_score,
          match_factors: match.match_factors,
          is_applicant: isApplicant
        };

        if (match.status === 'requested') {
          if (isApplicant) {
            categories.sent.push(connection);
          } else {
            categories.awaiting.push(connection);
          }
        } else if (match.status === 'approved') {
          categories.active.push(connection);
        }
      }
    } catch (error) {
      console.error('Error in loadHousingMatches:', error);
      throw error;
    }
  };

  /**
   * Load peer support connections
   */
  const loadPeerSupportConnections = async (categories) => {
    let query = supabase.from('peer_support_matches').select('*');
    const conditions = [];
    if (profileIds.applicant) conditions.push(`applicant_id.eq.${profileIds.applicant}`);
    if (profileIds.peerSupport) conditions.push(`peer_support_id.eq.${profileIds.peerSupport}`);
    if (conditions.length > 0) query = query.or(conditions.join(','));

    const { data: matches, error } = await query;
    if (error) throw error;
    if (!matches) return;

    for (const match of matches) {
      const isApplicant = match.applicant_id === profileIds.applicant;
      
      let otherPerson = null;
      if (isApplicant) {
        const { data } = await supabase
          .from('peer_support_profiles')
          .select('id, user_id, professional_title, primary_phone, contact_email, years_experience, specialties, registrant_profiles(first_name, last_name, email)')
          .eq('id', match.peer_support_id)
          .single();
        otherPerson = data;
      } else {
const { data } = await supabase
  .from('applicant_profiles_with_conditional_contact')  // ← Changed
  .select('*, registrant_profiles(*)')
  .eq('id', match.applicant_id)
  .single();
        otherPerson = data;
      }

      const connection = {
        id: match.id,
        type: 'peer_support',
        status: match.status,
        source: 'peer_support_match',
        peer_support_match_id: match.id,
        created_at: match.created_at,
        last_activity: match.updated_at || match.created_at,
        avatar: '🤝',
        other_person: otherPerson,
        requested_by_id: match.requested_by_id,
        is_requester: match.requested_by_id === profileIds.applicant
      };

      if (match.status === 'requested') {
        if (connection.is_requester) {
          categories.sent.push(connection);
        } else {
          categories.awaiting.push(connection);
        }
      } else if (match.status === 'active') {
        categories.active.push(connection);
      }
    }
  };

  /**
   * Load employment connections
   */
  const loadEmploymentConnections = async (categories) => {
    let query = supabase.from('employment_matches').select('*');
    const conditions = [];
    if (profileIds.applicant) conditions.push(`applicant_id.eq.${profileIds.applicant}`);
    if (profileIds.employer) conditions.push(`employer_id.eq.${profileIds.employer}`);
    if (conditions.length > 0) query = query.or(conditions.join(','));

    const { data: matches, error } = await query;
    if (error) throw error;
    if (!matches) return;

    for (const match of matches) {
      const isApplicant = match.applicant_id === profileIds.applicant;
      
      let otherPerson = null;
      if (isApplicant) {
        const { data } = await supabase
          .from('employer_profiles')
          .select('id, user_id, company_name, phone, contact_email, industry, city, state, job_types_available, registrant_profiles(first_name, last_name, email)')
          .eq('id', match.employer_id)
          .single();
        otherPerson = data;
      } else {
const { data } = await supabase
  .from('applicant_profiles_with_conditional_contact')  // ← Changed
  .select('*, registrant_profiles(*)')
  .eq('id', match.applicant_id)
  .single();
        otherPerson = data;
      }

      const connection = {
        id: match.id,
        type: 'employer',
        status: match.status,
        source: 'employment_match',
        employment_match_id: match.id,
        created_at: match.created_at,
        last_activity: match.updated_at || match.created_at,
        avatar: '💼',
        other_person: otherPerson,
        applicant_message: match.applicant_message,
        employer_message: match.employer_message,
        requested_by_id: match.requested_by_id,
        is_requester: match.requested_by_id === profileIds.applicant
      };

      if (match.status === 'active') {
        categories.active.push(connection);
      }
    }
  };

const handleViewProfile = async (connection, specificRoommate = null) => {
  try {
    // Close group modal first to prevent z-index issues
    if (showGroupModal) {
      setShowGroupModal(false);
      // Small delay to allow modal close animation
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    let profileData = null;
    
    // If viewing a specific roommate from the group modal
    if (specificRoommate) {
      profileData = {
        ...specificRoommate,
        profile_type: 'applicant',
        name: formatName(
          specificRoommate.registrant_profiles?.first_name,
          specificRoommate.registrant_profiles?.last_name
        )
      };
    }
    // If viewing first roommate from connection card
    else if (connection.type === 'roommate' && connection.roommates?.length > 0) {
      const roommate = connection.roommates[0];
const { data } = await supabase
  .from('applicant_profiles_with_conditional_contact')  // ← Changed
  .select('*, registrant_profiles(*)')
  .eq('id', roommate.id)
  .single();
      
      if (data) {
        profileData = {
          ...data,
          profile_type: 'applicant',
          name: formatName(
            data.registrant_profiles?.first_name,
            data.registrant_profiles?.last_name
          )
        };
      }
    } else if (connection.type === 'landlord' && connection.requesting_applicant) {
      profileData = {
        ...connection.requesting_applicant,
        profile_type: 'applicant',
        name: formatName(
          connection.requesting_applicant.registrant_profiles?.first_name,
          connection.requesting_applicant.registrant_profiles?.last_name
        )
      };
    } else if (connection.other_person) {
      const isPeerSupportProfile = connection.other_person.professional_title || connection.other_person.specialties;
      const isEmployerProfile = connection.other_person.company_name || connection.other_person.industry;
      
      profileData = {
        ...connection.other_person,
        profile_type: isPeerSupportProfile ? 'peer_support' : isEmployerProfile ? 'employer' : 'applicant',
        name: isPeerSupportProfile 
          ? (connection.other_person.professional_title || formatName(
              connection.other_person.registrant_profiles?.first_name,
              connection.other_person.registrant_profiles?.last_name
            ))
          : isEmployerProfile
          ? connection.other_person.company_name 
          : formatName(
              connection.other_person.registrant_profiles?.first_name,
              connection.other_person.registrant_profiles?.last_name
            )
      };
    }
    
    setSelectedProfile(profileData);
    setSelectedConnection(connection);
    setShowProfileModal(true);
  } catch (err) {
    console.error('Error loading profile:', err);
    alert('Failed to load profile.');
  }
};

  /**
   * NEW: Handle viewing group details in GroupDetailsModal
   */
  const handleViewGroupDetails = (connection) => {
    setSelectedGroup({
      id: connection.match_group_id,
      status: connection.status,
      group_name: connection.group_name,
      move_in_date: connection.move_in_date,
      message: connection.message,
      roommate_ids: connection.roommates?.map(r => r.id) || [],
      requested_by_id: connection.requested_by_id,
      pending_member_id: connection.pending_member_id,
      member_confirmations: connection.member_confirmations
    });
    setSelectedConnection(connection);
    setShowGroupModal(true);
  };

  /**
   * Handle viewing property in modal
   */
  const handleViewProperty = (connection) => {
    setSelectedProperty(connection.property);
    setSelectedConnection(connection);
    setShowPropertyModal(true);
  };

/**
 * Handle approving a connection request
 * ✅ UPDATED: Uses factory pattern matching useMatchActions.js
 */
const handleApproveRequest = async (connection) => {
  if (actionLoading) return;
  setActionLoading(true);

  try {
    if (connection.type === 'roommate') {
      // ✅ Create service instance (add import at top: import createMatchGroupsService from '../../../utils/database/matchGroupsService';)
      const matchGroupsService = createMatchGroupsService(supabase);

      // SCENARIO 1: User is invitee accepting invitation
      const isPendingInvitee = connection.pending_member_ids?.includes(profileIds.applicant);
      
      // SCENARIO 2: User is member approving a pending member
      const isApprovingMember = connection.is_group_expansion && 
                                connection.pending_member_id && 
                                !isPendingInvitee;
      
      if (isPendingInvitee) {
        // User is the invitee - they're accepting the invitation
        console.log('🎯 Invitee accepting group invitation');
        const result = await matchGroupsService.acceptGroupInvitation(
          connection.match_group_id,
          profileIds.applicant
        );
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to accept invitation');
        }
        
        alert('Invitation accepted! You will be added to the group once all members approve.');
        
      } else if (isApprovingMember) {
        // User is an existing member approving a pending member
        console.log('🎯 Member approving pending member:', connection.pending_member_id);
        const result = await matchGroupsService.approvePendingMember(
          connection.match_group_id,
          profileIds.applicant,
          connection.pending_member_id
        );
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to approve member');
        }
        
        // Check if all approvals are complete (result.data will have updated group)
        const updatedGroup = result.data;
        const updatedConfirmation = updatedGroup?.member_confirmations?.[connection.pending_member_id];
        
        if (updatedConfirmation && updatedConfirmation.needs_approval_from.length === 0 && updatedConfirmation.accepted_by_invitee) {
          // All approvals complete - confirm the member
          const confirmResult = await matchGroupsService.confirmPendingMember(
            connection.match_group_id,
            connection.pending_member_id
          );
          
          if (confirmResult.success) {
            alert('Member approved and added to the group!');
          } else {
            alert('Member approved! Waiting for final confirmation.');
          }
        } else {
          alert('Approval recorded! Waiting for other members to approve.');
        }
        
      } else {
        // SCENARIO 3: Standard 2-person roommate match approval
        console.log('🎯 Standard 2-person match approval');
        await supabase
          .from('match_groups')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.match_group_id);
        
        alert('Connection approved! You can now exchange contact information.');
      }
      
    } else if (connection.type === 'landlord') {
      if (connection.source === 'housing_match' && connection.housing_match_id) {
        await supabase
          .from('housing_matches')
          .update({ 
            status: 'approved',
            landlord_message: 'Your inquiry has been approved! Please contact me to discuss next steps.',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.housing_match_id);
      }
      
      alert('Connection approved! You can now exchange contact information.');
      
    } else if (connection.type === 'peer_support') {
      const { data: matchData, error: matchError } = await supabase
        .from('peer_support_matches')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.peer_support_match_id)
        .select()
        .single();

      if (matchError) throw matchError;

      const isPeerSpecialist = profileIds.peerSupport && connection.other_person?.professional_title;
      const peerSpecialistId = isPeerSpecialist ? profileIds.peerSupport : connection.other_person?.id;
      const clientId = isPeerSpecialist ? connection.other_person?.id : profileIds.applicant;

      if (peerSpecialistId && clientId) {
        const { data: existingClient } = await supabase
          .from('pss_clients')
          .select('id, status')
          .eq('peer_specialist_id', peerSpecialistId)
          .eq('client_id', clientId)
          .single();

        if (existingClient) {
          if (existingClient.status === 'inactive') {
            await supabase
              .from('pss_clients')
              .update({
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('id', existingClient.id);
          }
        } else {
          const nextFollowupDate = new Date();
          nextFollowupDate.setDate(nextFollowupDate.getDate() + 7);

          await supabase
            .from('pss_clients')
            .insert({
              peer_specialist_id: peerSpecialistId,
              client_id: clientId,
              status: 'active',
              followup_frequency: 'weekly',
              next_followup_date: nextFollowupDate.toISOString().split('T')[0],
              total_sessions: 0,
              recovery_goals: [],
              progress_notes: [],
              consent_to_contact: true,
              created_by: profile.id
            });
        }
      }
      
      alert('Connection approved! You can now exchange contact information.');
      
    } else if (connection.type === 'employer') {
      await supabase
        .from('employment_matches')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.employment_match_id);
      
      alert('Connection approved! You can now exchange contact information.');
    }

    // Close modals if open
    setShowProfileModal(false);
    setShowPropertyModal(false);
    setShowGroupModal(false);
    
    await loadConnections();
    
  } catch (err) {
    console.error('Error approving request:', err);
    alert(err.message || 'Failed to approve request. Please try again.');
  } finally {
    setActionLoading(false);
  }
};

  /**
   * Handle declining a connection request
   */
  const handleDeclineRequest = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to decline this connection request?');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'roommate') {
        await supabase
          .from('match_groups')
          .delete()
          .eq('id', connection.match_group_id);
      } else if (connection.type === 'landlord') {
        await supabase
          .from('housing_matches')
          .update({ 
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.housing_match_id);
      } else if (connection.type === 'peer_support') {
        await supabase
          .from('peer_support_matches')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.peer_support_match_id);
      } else if (connection.type === 'employer') {
        await supabase
          .from('employment_matches')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.employment_match_id);
      }

      alert('Connection request declined.');
      
      // Close modals if open
      setShowProfileModal(false);
      setShowPropertyModal(false);
      setShowGroupModal(false);
      
      await loadConnections();
    } catch (err) {
      console.error('Error declining request:', err);
      alert('Failed to decline request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle withdrawing a sent request
   */
  const handleWithdrawRequest = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to withdraw this connection request?');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'roommate' || connection.type === 'landlord') {
        if (connection.match_group_id) {
          await supabase
            .from('match_groups')
            .delete()
            .eq('id', connection.match_group_id);
        }
        if (connection.housing_match_id) {
          await supabase
            .from('housing_matches')
            .update({ 
              status: 'inactive',
              updated_at: new Date().toISOString()
            })
            .eq('id', connection.housing_match_id);
        }
      } else if (connection.type === 'peer_support') {
        await supabase
          .from('peer_support_matches')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.peer_support_match_id);
      } else if (connection.type === 'employer') {
        await supabase
          .from('employment_matches')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.employment_match_id);
      }

      alert('Connection request withdrawn.');
      await loadConnections();
    } catch (err) {
      console.error('Error withdrawing request:', err);
      alert('Failed to withdraw request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle ending an active connection
   */
  const handleEndConnection = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to end this connection? This action cannot be undone.');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'landlord' && connection.housing_match_id) {
        await supabase
          .from('housing_matches')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.housing_match_id);
      } else if (connection.type === 'roommate' && connection.match_group_id) {
        const { error } = await supabase.rpc('remove_member_from_group', {
          p_group_id: connection.match_group_id,
          p_member_id: profileIds.applicant
        });
        if (error) throw error;
      } else if (connection.type === 'peer_support') {
        await supabase
          .from('peer_support_matches')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.peer_support_match_id);
      } else if (connection.type === 'employer') {
        await supabase
          .from('employment_matches')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.employment_match_id);
      }

      alert('Connection ended.');
      await loadConnections();
    } catch (err) {
      console.error('Error ending connection:', err);
      alert('Failed to end connection. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getConnectionName = (connection) => {
    if (connection.type === 'landlord' && connection.property) {
      return connection.property.title || connection.property.address || 'Property Match';
    } else if (connection.type === 'roommate') {
      const count = connection.roommates?.length || 0;
      return `Roommate Group (${count} member${count !== 1 ? 's' : ''})`;
    } else if (connection.type === 'peer_support') {
      const other = connection.other_person;
      return other?.professional_title || formatName(other?.registrant_profiles?.first_name, other?.registrant_profiles?.last_name);
    } else if (connection.type === 'employer') {
      const other = connection.other_person;
      return other?.company_name || formatName(other?.registrant_profiles?.first_name, other?.registrant_profiles?.last_name);
    }
    return 'Unknown';
  };

  const getConnectionTypeLabel = (type) => {
    const labels = {
      roommate: 'Roommate Connection',
      peer_support: 'Peer Support',
      landlord: 'Housing',
      employer: 'Employment'
    };
    return labels[type] || 'Connection';
  };

  const getTabCount = (tab) => connections[tab]?.length || 0;

  /**
   * Get CSS class name for connection type
   */
  const getConnectionTypeClass = (type) => {
    const typeMap = {
      'roommate': styles.roommate,
      'peer_support': styles.peerSupport,
      'landlord': styles.landlord,
      'employer': styles.employer
    };
    return typeMap[type] || '';
  };

  useEffect(() => {
    loadProfileIds();
  }, [profile?.id]);

  useEffect(() => {
    if (Object.values(profileIds).some(id => id !== null)) {
      loadConnections();
    }
  }, [profileIds]);

  return (
    <div className="content">
      <div className="text-center mb-5">
        <h1 className="welcome-title">Connection Hub</h1>
        <p className="welcome-text">
          Manage your roommate matches, peer support connections, housing requests, and employer relationships
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <h4>Error Loading Connections</h4>
          <p>{error}</p>
          <button className="btn btn-outline" onClick={loadConnections}>Try Again</button>
        </div>
      )}

      {loading && (
        <div className="text-center" style={{ padding: '4rem' }}>
          <LoadingSpinner size="large" text="Loading your connections..." />
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="card mb-4">
            <div className={styles.connectionStats}>
              <h3 className="card-title">
                {Object.values(connections).reduce((sum, arr) => sum + arr.length, 0)} Total Connection{Object.values(connections).reduce((sum, arr) => sum + arr.length, 0) !== 1 ? 's' : ''}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={loadConnections} disabled={loading}>
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="card">
            <div className={styles.tabContainer}>
              <ul className={styles.tabNav}>
                <li className={styles.tabItem}>
                  <button className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`} onClick={() => setActiveTab('active')}>
                    Active<span className={styles.tabCount}>{getTabCount('active')}</span>
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button className={`${styles.tabButton} ${activeTab === 'awaiting' ? styles.active : ''}`} onClick={() => setActiveTab('awaiting')}>
                    Awaiting Response<span className={styles.tabCount}>{getTabCount('awaiting')}</span>
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button className={`${styles.tabButton} ${activeTab === 'sent' ? styles.active : ''}`} onClick={() => setActiveTab('sent')}>
                    Sent Requests<span className={styles.tabCount}>{getTabCount('sent')}</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {connections[activeTab]?.length > 0 ? (
                <div className={styles.connectionsGrid}>
                  {connections[activeTab].map((connection) => (
                    <div key={connection.id} className={`card ${styles.connectionCard} ${getConnectionTypeClass(connection.type)}`}>
                      {/* Card Header with End Connection Button */}
                      <div className={styles.connectionCardHeader}>
                        <div style={{ flex: 1 }}>
                          <div className={styles.connectionTypeLabel}>{getConnectionTypeLabel(connection.type)}</div>
                          <div className={styles.connectionTitle}>{getConnectionName(connection)}</div>
                        </div>
                        <div className={styles.headerActions}>
                          <span className={`badge ${connection.status === 'active' || connection.status === 'confirmed' || connection.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                            {connection.status}
                          </span>
                          {activeTab === 'active' && (
                            <button 
                              className={`btn btn-sm ${styles.endConnectionButton}`}
                              onClick={() => handleEndConnection(connection)}
                              disabled={actionLoading}
                              title="End Connection"
                            >
                              ❌ End Connection
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="card-subtitle mb-3" style={{ color: 'var(--gray-600)' }}>
                        {formatTimeAgo(connection.last_activity)}
                      </div>

                      {/* Connection-specific details */}
                      <div className={styles.connectionDetails}>
                        {/* Roommate Details - Each member gets their own card */}
                        {connection.type === 'roommate' && (
                          <div className={styles.detailsSection}>
                            {connection.roommates && connection.roommates.length > 0 && (
                              <>
                                <div className={styles.detailLabel}>Group Members:</div>
                                <div className={styles.roommateCards}>
                                  {connection.roommates.map((roommate, idx) => (
                                    <div key={idx} className={styles.roommateCard}>
                                      <div className={styles.roommateName}>
                                        {formatName(
                                          roommate.registrant_profiles?.first_name,
                                          roommate.registrant_profiles?.last_name
                                        )}
                                      </div>
                                      <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => handleViewProfile({
                                          ...connection,
                                          roommates: [roommate]
                                        })}
                                      >
                                        👁️ View
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Peer Support Details */}
                        {connection.type === 'peer_support' && connection.other_person && (
                          <div className={styles.detailsSection}>
                            {connection.other_person.years_experience && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>⭐</span>
                                <span>{connection.other_person.years_experience} years experience</span>
                              </div>
                            )}
                            {connection.other_person.specialties && connection.other_person.specialties.length > 0 && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>🎯</span>
                                <span>{connection.other_person.specialties.slice(0, 2).join(', ')}</span>
                                {connection.other_person.specialties.length > 2 && (
                                  <span className={styles.moreCount}> +{connection.other_person.specialties.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Landlord/Housing Details */}
                        {connection.type === 'landlord' && connection.property && (
                          <div className={styles.detailsSection}>
                            {connection.property.monthly_rent && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>💰</span>
                                <span>${connection.property.monthly_rent}/month</span>
                              </div>
                            )}
                            {connection.property.bedrooms !== undefined && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>🛏️</span>
                                <span>{connection.property.bedrooms === 0 ? 'Studio' : `${connection.property.bedrooms} bed`}</span>
                                {connection.property.bathrooms && ` • ${connection.property.bathrooms} bath`}
                              </div>
                            )}
                            {(connection.property.city || connection.property.state) && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>📍</span>
                                <span>
                                  {connection.property.city}
                                  {connection.property.city && connection.property.state && ', '}
                                  {connection.property.state}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Employer Details */}
                        {connection.type === 'employer' && connection.other_person && (
                          <div className={styles.detailsSection}>
                            {connection.other_person.industry && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>🏢</span>
                                <span>{connection.other_person.industry}</span>
                              </div>
                            )}
                            {(connection.other_person.city || connection.other_person.state) && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>📍</span>
                                <span>
                                  {connection.other_person.city}
                                  {connection.other_person.city && connection.other_person.state && ', '}
                                  {connection.other_person.state}
                                </span>
                              </div>
                            )}
                            {connection.other_person.job_types_available && connection.other_person.job_types_available.length > 0 && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>💼</span>
                                <span>{connection.other_person.job_types_available.slice(0, 2).join(', ')}</span>
                                {connection.other_person.job_types_available.length > 2 && (
                                  <span className={styles.moreCount}> +{connection.other_person.job_types_available.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Contact Icons (Active connections only) */}
                      {activeTab === 'active' && connection.type !== 'roommate' && (
                        <div className={styles.contactIcons}>
                          {connection.type === 'landlord' && connection.property?.landlord_profiles?.primary_phone && (
                            <a 
                              href={`tel:${connection.property.landlord_profiles.primary_phone}`}
                              className={styles.contactIconButton}
                              title="Call"
                            >
                              📱
                            </a>
                          )}
                          {connection.type === 'landlord' && (connection.property?.landlord_profiles?.contact_email || connection.property?.landlord_profiles?.registrant_profiles?.email) && (
                            <a 
                              href={`mailto:${connection.property.landlord_profiles.contact_email || connection.property.landlord_profiles.registrant_profiles.email}`}
                              className={styles.contactIconButton}
                              title="Email"
                            >
                              📧
                            </a>
                          )}
                          {(connection.type === 'peer_support' || connection.type === 'employer') && connection.other_person?.primary_phone && (
                            <a 
                              href={`tel:${connection.other_person.primary_phone}`}
                              className={styles.contactIconButton}
                              title="Call"
                            >
                              📱
                            </a>
                          )}
                          {(connection.type === 'peer_support' || connection.type === 'employer') && (connection.other_person?.contact_email || connection.other_person?.registrant_profiles?.email) && (
                            <a 
                              href={`mailto:${connection.other_person.contact_email || connection.other_person.registrant_profiles.email}`}
                              className={styles.contactIconButton}
                              title="Email"
                            >
                              📧
                            </a>
                          )}
                        </div>
                      )}

                      {/* Primary Action - View Details */}
                      <div className={styles.primaryAction}>
                        {connection.type === 'landlord' ? (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleViewProperty(connection)}
                            style={{ width: '100%' }}
                          >
                            👁️ View Property Details
                          </button>
                        ) : connection.type === 'roommate' ? (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleViewGroupDetails(connection)}
                            style={{ width: '100%' }}
                          >
                            👥 View Group Details
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleViewProfile(connection)}
                            style={{ width: '100%' }}
                          >
                            👁️ View Profile
                          </button>
                        )}
                      </div>

                      {/* ✅ FIXED: JSX comment syntax */}
                      {/* Secondary Actions - Updated to include Approve button */}
                      {activeTab === 'awaiting' && (
                        <div className={styles.secondaryActions}>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleApproveRequest(connection)} 
                            disabled={actionLoading}
                          >
                            ✅ Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => handleDeclineRequest(connection)} 
                            disabled={actionLoading}
                          >
                            ❌ Decline
                          </button>
                        </div>
                      )}

                      {activeTab === 'sent' && (
                        <div className={styles.secondaryActions}>
                          <div className={styles.waitingStatus}>⏳ Waiting for response...</div>
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => handleWithdrawRequest(connection)} 
                            disabled={actionLoading}
                          >
                            🗑️ Withdraw
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    {activeTab === 'active' && '🤝'}
                    {activeTab === 'awaiting' && '⏳'}
                    {activeTab === 'sent' && '📤'}
                  </div>
                  <h3 className="empty-state-title">No {activeTab} connections</h3>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {onBack && (
        <div className="text-center mt-4">
          <button className="btn btn-outline" onClick={onBack}>← Back to Dashboard</button>
        </div>
      )}

{/* Profile Modal */}
{showProfileModal && selectedProfile && (
  <>
    {(() => {
      const debugInfo = {
        connectionType: selectedConnection?.type,
        connectionStatus: selectedConnection?.status,
        pending_member_ids: selectedConnection?.pending_member_ids,
        roommate_ids: selectedConnection?.roommates?.map(r => r.id),
        selectedProfileId: selectedProfile?.id,
        selectedProfileUserId: selectedProfile?.user_id,
        currentUserApplicantId: profileIds.applicant,
        viewerIsPending: selectedConnection?.pending_member_ids?.includes(profileIds.applicant),
        profileIdIsPending: selectedConnection?.pending_member_ids?.includes(selectedProfile?.id),
        profileUserIdIsPending: selectedConnection?.pending_member_ids?.includes(selectedProfile?.user_id)
      };
      console.log('🔍 ProfileModal Debug:', debugInfo);
      return null;
    })()}
    <ProfileModal
      isOpen={showProfileModal}
      profile={selectedProfile}
      connectionStatus={selectedConnection?.status}
      onClose={() => {
        setShowProfileModal(false);
        setSelectedProfile(null);
        setSelectedConnection(null);
      }}
      onApprove={handleApproveRequest}
      onDecline={handleDeclineRequest}
      showContactInfo={
        (selectedConnection?.status === 'confirmed' || 
         selectedConnection?.status === 'active' || 
         selectedConnection?.status === 'approved') &&
        !selectedConnection?.pending_member_ids?.includes(profileIds.applicant) &&
        (selectedConnection?.type !== 'roommate' || 
         !(selectedConnection?.pending_member_ids || []).includes(selectedProfile?.id || selectedProfile?.user_id))
      }
      showActions={activeTab === 'awaiting'}
      isAwaitingApproval={activeTab === 'awaiting'}
    />
  </>
)}

      {/* Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <PropertyDetailsModal
          isOpen={showPropertyModal}
          property={selectedProperty}
          connectionStatus={selectedConnection?.status}
          requestingApplicant={selectedConnection?.requesting_applicant}
          onClose={() => {
            setShowPropertyModal(false);
            setSelectedProperty(null);
            setSelectedConnection(null);
          }}
          onApprove={handleApproveRequest}
          onDecline={handleDeclineRequest}
          showContactInfo={
  (selectedConnection?.status === 'confirmed' || 
   selectedConnection?.status === 'active' || 
   selectedConnection?.status === 'approved')
}
          showActions={activeTab === 'awaiting'}
          isLandlordView={!selectedConnection?.is_applicant}
        />
      )}

{/* Group Details Modal - NEW */}
{showGroupModal && selectedGroup && selectedConnection && (
  <GroupDetailsModal
    isOpen={showGroupModal}
    matchGroup={selectedGroup}
    roommates={selectedConnection.roommates || []}
    currentUserId={profile?.user_id}
    connectionStatus={selectedConnection?.status}
    onClose={() => {
      setShowGroupModal(false);
      setSelectedGroup(null);
      setSelectedConnection(null);
    }}
    onViewProfile={(roommate) => handleViewProfile(selectedConnection, roommate)}
    onApprove={() => handleApproveRequest(selectedConnection)}
    onDecline={() => handleDeclineRequest(selectedConnection)}
showContactInfo={
  (selectedConnection?.status === 'confirmed' || 
   selectedConnection?.status === 'active' || 
   selectedConnection?.status === 'approved') &&
  !selectedConnection?.pending_member_ids?.includes(profileIds.applicant) &&
  // For individual profiles: check if THIS person is pending
  (selectedConnection?.type !== 'roommate' || 
   !selectedConnection?.pending_member_ids?.includes(selectedProfile?.id))
}
    showActions={activeTab === 'awaiting'}
    isAwaitingApproval={activeTab === 'awaiting'}
  />
)}
    </div>
  );
};

export default ConnectionHub;
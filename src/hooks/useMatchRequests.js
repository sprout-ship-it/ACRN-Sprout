// src/hooks/useMatchRequests.js - UPDATED: Show group expansion requests in tabs
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

/**
 * Hook to load and categorize all connection requests across different match types
 * Now includes pending group member approvals in the appropriate tabs
 */
export const useMatchRequests = (profileIds) => {
  const [categorizedRequests, setCategorizedRequests] = useState({
    received: [],
    sent: [],
    active: [],
    history: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load profile data for a request to show names, etc.
   */
  const loadProfileData = async (request) => {
    try {
      let requesterProfile = null;
      let recipientProfile = null;
      
      // Load requester profile based on type
      if (request.requester_type === 'applicant') {
const { data } = await supabase
  .from('applicant_matching_profiles')  // ← Changed
  .select('id, user_id, registrant_profiles!inner(first_name, last_name, email)')
  .eq('id', request.requester_id)
  .single();
        requesterProfile = data;
      } else if (request.requester_type === 'peer-support') {
        const { data } = await supabase
          .from('peer_support_profiles')
          .select('id, user_id, professional_title, registrant_profiles!inner(first_name, last_name, email)')
          .eq('id', request.requester_id)
          .single();
        requesterProfile = data;
      } else if (request.requester_type === 'landlord') {
        const { data } = await supabase
          .from('landlord_profiles')
          .select('id, user_id, contact_person, registrant_profiles!inner(first_name, last_name, email)')
          .eq('id', request.requester_id)
          .single();
        requesterProfile = data;
      } else if (request.requester_type === 'employer') {
        const { data } = await supabase
          .from('employer_profiles')
          .select('id, user_id, contact_person, company_name, registrant_profiles!inner(first_name, last_name, email)')
          .eq('id', request.requester_id)
          .single();
        requesterProfile = data;
      }

      // Load recipient profile based on type
      if (request.recipient_type === 'applicant') {
const { data } = await supabase
  .from('applicant_matching_profiles')
  .select('id, user_id, registrant_profiles!inner(first_name, last_name, email)')
  .eq('id', request.recipient_id)
  .single();
        recipientProfile = data;
      } else if (request.recipient_type === 'peer-support') {
        const { data } = await supabase
          .from('peer_support_profiles')
          .select('id, user_id, professional_title, registrant_profiles!inner(first_name, last_name, email)')
          .eq('id', request.recipient_id)
          .single();
        recipientProfile = data;
      } else if (request.recipient_type === 'landlord') {
        const { data } = await supabase
          .from('landlord_profiles')
          .select('id, user_id, contact_person, registrant_profiles!inner(first_name, last_name, email)')
          .eq('id', request.recipient_id)
          .single();
        recipientProfile = data;
      } else if (request.recipient_type === 'employer') {
        const { data } = await supabase
          .from('employer_profiles')
          .select('id, user_id, contact_person, company_name, registrant_profiles!inner(first_name, last_name, email)')
          .eq('id', request.recipient_id)
          .single();
        recipientProfile = data;
      }

      return {
        ...request,
        requester_profile: requesterProfile,
        recipient_profile: recipientProfile
      };
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      return request;
    }
  };

  /**
   * Load peer support matches
   */
  const loadPeerSupportMatches = async () => {
    if (!profileIds.applicant && !profileIds.peerSupport) return [];

    try {
      const matches = [];

      // If user is an applicant, get their peer support matches
      if (profileIds.applicant) {
        const { data, error } = await supabase
          .from('peer_support_matches')
          .select('*')
          .eq('applicant_id', profileIds.applicant);

        if (!error && data) {
          data.forEach(match => {
            matches.push({
              id: match.id,
              requester_type: 'applicant',
              requester_id: match.applicant_id,
              recipient_type: 'peer-support',
              recipient_id: match.peer_support_id,
              request_type: 'peer-support',
              status: match.status === 'requested' ? 'pending' : match.status === 'active' ? 'accepted' : 'rejected',
              message: match.message,
              created_at: match.created_at,
              responded_at: match.updated_at !== match.created_at ? match.updated_at : null
            });
          });
        }
      }

      // If user is a peer support specialist, get their matches
      if (profileIds.peerSupport) {
        const { data, error } = await supabase
          .from('peer_support_matches')
          .select('*')
          .eq('peer_support_id', profileIds.peerSupport);

        if (!error && data) {
          data.forEach(match => {
            matches.push({
              id: match.id,
              requester_type: 'applicant',
              requester_id: match.applicant_id,
              recipient_type: 'peer-support',
              recipient_id: match.peer_support_id,
              request_type: 'peer-support',
              status: match.status === 'requested' ? 'pending' : match.status === 'active' ? 'accepted' : 'rejected',
              message: match.message,
              created_at: match.created_at,
              responded_at: match.updated_at !== match.created_at ? match.updated_at : null
            });
          });
        }
      }

      return matches;
    } catch (error) {
      console.error('Error loading peer support matches:', error);
      return [];
    }
  };

  /**
   * ✅ UPDATED: Load roommate and housing matches from match_groups
   * Now includes pending group member approvals as separate request entries
   */
  const loadMatchGroups = async () => {
    if (!profileIds.applicant) return [];

    try {
      const matches = [];

      // Get match groups where user is in roommate_ids array OR pending_member_ids array
      const { data, error } = await supabase
        .from('match_groups')
        .select('*')
        .or(`roommate_ids.cs.{${profileIds.applicant}},pending_member_ids.cs.{${profileIds.applicant}}`);

      if (!error && data) {
        data.forEach(group => {
          const roommateIds = group.roommate_ids || [];
          const pendingIds = group.pending_member_ids || [];
          const confirmations = group.member_confirmations || {};
          const isRequester = group.requested_by_id === profileIds.applicant;
          const isConfirmedMember = roommateIds.includes(profileIds.applicant);
          const isPendingMember = pendingIds.includes(profileIds.applicant);

          // ✅ CASE 1: User is a pending invitee (needs to accept)
          if (isPendingMember) {
            const confirmation = confirmations[profileIds.applicant];
            if (confirmation) {
              const inviterId = confirmation.invited_by;
              
              matches.push({
                id: group.id,
                requester_type: 'applicant',
                requester_id: inviterId,
                recipient_type: 'applicant',
                recipient_id: profileIds.applicant,
                request_type: 'roommate',
                status: 'pending',
                message: group.message || `${confirmation.invited_by} invited you to join their roommate group`,
                created_at: confirmation.invited_at || group.created_at,
                responded_at: null,
                is_group_expansion: true,
                group_size: roommateIds.length,
                needs_approval_from: confirmation.needs_approval_from || []
              });
            }
          }

          // ✅ CASE 2: User is confirmed member and there are pending members they need to approve
          if (isConfirmedMember && pendingIds.length > 0) {
            pendingIds.forEach(pendingId => {
              const confirmation = confirmations[pendingId];
              
              // Check if current user needs to approve this pending member
              if (confirmation && confirmation.needs_approval_from.includes(profileIds.applicant)) {
                const inviterId = confirmation.invited_by;
                
                matches.push({
                  id: group.id,
                  requester_type: 'applicant',
                  requester_id: inviterId,
                  recipient_type: 'applicant',
                  recipient_id: profileIds.applicant,
                  request_type: 'roommate',
                  status: 'pending',
                  message: group.message || `New member wants to join your roommate group`,
                  created_at: confirmation.invited_at || group.created_at,
                  responded_at: null,
                  is_group_expansion: true,
                  pending_member_id: pendingId,
                  group_size: roommateIds.length
                });
              }
            });
          }

          // ✅ CASE 3: User sent invitation(s) - show in sent requests
          if (isConfirmedMember && pendingIds.length > 0) {
            pendingIds.forEach(pendingId => {
              const confirmation = confirmations[pendingId];
              
              // Check if current user was the inviter
              if (confirmation && confirmation.invited_by === profileIds.applicant) {
                matches.push({
                  id: group.id,
                  requester_type: 'applicant',
                  requester_id: profileIds.applicant,
                  recipient_type: 'applicant',
                  recipient_id: pendingId,
                  request_type: 'roommate',
                  status: 'pending',
                  message: group.message || `Waiting for group members to approve`,
                  created_at: confirmation.invited_at || group.created_at,
                  responded_at: null,
                  is_group_expansion: true,
                  pending_member_id: pendingId,
                  group_size: roommateIds.length,
                  awaiting_approvals: confirmation.needs_approval_from || []
                });
              }
            });
          }

          // ✅ CASE 4: Single applicant housing inquiries (property_id exists, single roommate)
          if (group.property_id && roommateIds.length === 1 && !isPendingMember) {
            matches.push({
              id: group.id,
              requester_type: 'applicant',
              requester_id: roommateIds[0],
              recipient_type: 'landlord',
              recipient_id: null, // We'd need to lookup from property
              request_type: 'housing',
              status: group.status === 'requested' ? 'pending' : group.status === 'active' ? 'accepted' : 'rejected',
              message: group.message,
              created_at: group.created_at,
              responded_at: group.updated_at !== group.created_at ? group.updated_at : null,
              property_id: group.property_id
            });
          }

          // ✅ CASE 5: Standard roommate matches (no property, confirmed members, no pending)
          if (!group.property_id && roommateIds.length >= 2 && pendingIds.length === 0 && isConfirmedMember) {
            // Only show as active/history, not as pending request
            const otherRoommateId = roommateIds.find(id => id !== profileIds.applicant);
            
            // For initial 2-person groups still in 'requested' status
            if (group.status === 'requested') {
              matches.push({
                id: group.id,
                requester_type: 'applicant',
                requester_id: isRequester ? profileIds.applicant : otherRoommateId,
                recipient_type: 'applicant',
                recipient_id: isRequester ? otherRoommateId : profileIds.applicant,
                request_type: 'roommate',
                status: 'pending',
                message: group.message,
                created_at: group.created_at,
                responded_at: null
              });
            } else {
              // Active or inactive group
              matches.push({
                id: group.id,
                requester_type: 'applicant',
                requester_id: isRequester ? profileIds.applicant : otherRoommateId,
                recipient_type: 'applicant',
                recipient_id: isRequester ? otherRoommateId : profileIds.applicant,
                request_type: 'roommate',
                status: group.status === 'active' ? 'accepted' : 'rejected',
                message: group.message,
                created_at: group.created_at,
                responded_at: group.updated_at !== group.created_at ? group.updated_at : null,
                group_size: roommateIds.length
              });
            }
          }
        });
      }

      return matches;
    } catch (error) {
      console.error('Error loading match groups:', error);
      return [];
    }
  };

  /**
   * Load employment matches
   */
  const loadEmploymentMatches = async () => {
    if (!profileIds.applicant && !profileIds.employer) return [];

    try {
      const matches = [];

      // If user is an applicant, get their employment matches
      if (profileIds.applicant) {
        const { data, error } = await supabase
          .from('employment_matches')
          .select('*')
          .eq('applicant_id', profileIds.applicant);

        if (!error && data) {
          data.forEach(match => {
            matches.push({
              id: match.id,
              requester_type: 'applicant',
              requester_id: match.applicant_id,
              recipient_type: 'employer',
              recipient_id: match.employer_id,
              request_type: 'employment',
              status: match.status === 'requested' ? 'pending' : match.status === 'active' ? 'accepted' : 'rejected',
              message: match.applicant_message,
              created_at: match.created_at,
              responded_at: match.updated_at !== match.created_at ? match.updated_at : null
            });
          });
        }
      }

      // If user is an employer, get their matches
      if (profileIds.employer) {
        const { data, error } = await supabase
          .from('employment_matches')
          .select('*')
          .eq('employer_id', profileIds.employer);

        if (!error && data) {
          data.forEach(match => {
            matches.push({
              id: match.id,
              requester_type: 'applicant',
              requester_id: match.applicant_id,
              recipient_type: 'employer',
              recipient_id: match.employer_id,
              request_type: 'employment',
              status: match.status === 'requested' ? 'pending' : match.status === 'active' ? 'accepted' : 'rejected',
              message: match.applicant_message,
              created_at: match.created_at,
              responded_at: match.updated_at !== match.created_at ? match.updated_at : null
            });
          });
        }
      }

      return matches;
    } catch (error) {
      console.error('Error loading employment matches:', error);
      return [];
    }
  };

  /**
   * Main load function - combines all match types
   */
  const loadRequests = async () => {
    if (!profileIds || Object.values(profileIds).every(id => id === null)) {
      setCategorizedRequests({ received: [], sent: [], active: [], history: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load all match types in parallel
      const [peerSupportMatches, matchGroupMatches, employmentMatches] = await Promise.all([
        loadPeerSupportMatches(),
        loadMatchGroups(),
        loadEmploymentMatches()
      ]);

      // Combine all matches
      const allRequests = [
        ...peerSupportMatches,
        ...matchGroupMatches,
        ...employmentMatches
      ];

      // Remove duplicates by ID (but keep group expansion requests which may share IDs)
      const uniqueRequests = [];
      const seenKeys = new Set();
      
      allRequests.forEach(request => {
        // Create unique key for group expansion requests
        const key = request.is_group_expansion 
          ? `${request.id}-${request.pending_member_id || request.recipient_id}-${request.requester_id}`
          : request.id;
        
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueRequests.push(request);
        }
      });

      if (uniqueRequests.length > 0) {
        // Enrich with profile data
        const enrichedRequests = await Promise.all(
          uniqueRequests.map(request => loadProfileData(request))
        );

        // Categorize requests
        const requests = { received: [], sent: [], active: [], history: [] };
        
        enrichedRequests.forEach(request => {
          const isRecipient = (
            (request.recipient_type === 'applicant' && request.recipient_id === profileIds.applicant) ||
            (request.recipient_type === 'peer-support' && request.recipient_id === profileIds.peerSupport) ||
            (request.recipient_type === 'landlord' && request.recipient_id === profileIds.landlord) ||
            (request.recipient_type === 'employer' && request.recipient_id === profileIds.employer)
          );

          if (request.status === 'pending') {
            if (isRecipient) {
              requests.received.push(request);
            } else {
              requests.sent.push(request);
            }
          } else if (request.status === 'accepted') {
            requests.active.push(request);
          } else {
            requests.history.push(request);
          }
        });

        setCategorizedRequests(requests);
      } else {
        setCategorizedRequests({ received: [], sent: [], active: [], history: [] });
      }
      
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [profileIds]);

  return {
    categorizedRequests,
    loading,
    error,
    reloadRequests: loadRequests
  };
};
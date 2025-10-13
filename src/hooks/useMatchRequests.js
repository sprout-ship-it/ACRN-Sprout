// src/hooks/useMatchRequests.js - REWRITTEN for individual match tables
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

/**
 * Hook to load and categorize all connection requests across different match types
 * Now queries individual tables instead of unified match_requests table
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
          .from('applicant_matching_profiles')
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
   * Load roommate and housing matches from match_groups
   */
  const loadMatchGroups = async () => {
    if (!profileIds.applicant) return [];

    try {
      const matches = [];

      // Get match groups where user is in roommate_ids array
      const { data, error } = await supabase
        .from('match_groups')
        .select('*')
        .contains('roommate_ids', [profileIds.applicant]);

      if (!error && data) {
        data.forEach(group => {
          const roommateIds = group.roommate_ids || [];
          const isRequester = group.requested_by_id === profileIds.applicant;
          
          // For single applicant housing inquiries (property_id exists, single roommate)
          if (group.property_id && roommateIds.length === 1) {
            matches.push({
              id: group.id,
              requester_type: 'applicant',
              requester_id: roommateIds[0],
              recipient_type: 'landlord',
              recipient_id: null, // We'd need to lookup from property
              request_type: 'housing',
              status: group.status === 'requested' ? 'pending' : group.status === 'confirmed' || group.status === 'active' ? 'accepted' : 'rejected',
              message: group.message,
              created_at: group.created_at,
              responded_at: group.updated_at !== group.created_at ? group.updated_at : null,
              property_id: group.property_id
            });
          }
          // For roommate matches (no property, multiple roommates)
          else if (!group.property_id && roommateIds.length > 1) {
            // Find the other roommate
            const otherRoommateId = roommateIds.find(id => id !== profileIds.applicant);
            
            matches.push({
              id: group.id,
              requester_type: 'applicant',
              requester_id: isRequester ? profileIds.applicant : otherRoommateId,
              recipient_type: 'applicant',
              recipient_id: isRequester ? otherRoommateId : profileIds.applicant,
              request_type: 'roommate',
              status: group.status === 'requested' ? 'pending' : group.status === 'confirmed' || group.status === 'active' ? 'accepted' : 'rejected',
              message: group.message,
              created_at: group.created_at,
              responded_at: group.updated_at !== group.created_at ? group.updated_at : null
            });
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

      // Remove duplicates by ID
      const uniqueRequests = [];
      const seenIds = new Set();
      
      allRequests.forEach(request => {
        if (!seenIds.has(request.id)) {
          seenIds.add(request.id);
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
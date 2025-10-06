// src/hooks/useMatchRequests.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import createMatchRequestsService from '../utils/database/matchRequestsService';

const matchRequestsService = createMatchRequestsService(supabase);

export const useMatchRequests = (profileIds) => {
  const [categorizedRequests, setCategorizedRequests] = useState({
    received: [],
    sent: [],
    active: [],
    history: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          .select(`
            id,
            user_id,
            professional_title,
            registrant_profiles!inner(first_name, last_name, email)
          `)
          .eq('id', request.recipient_id)
          .single();
        recipientProfile = data;
      } else if (request.recipient_type === 'landlord') {
        const { data } = await supabase
          .from('landlord_profiles')
          .select(`
            id,
            user_id,
            contact_person,
            registrant_profiles!inner(first_name, last_name, email)
          `)
          .eq('id', request.recipient_id)
          .single();
        recipientProfile = data;
      } else if (request.recipient_type === 'employer') {
        const { data } = await supabase
          .from('employer_profiles')
          .select(`
            id,
            user_id,
            contact_person,
            company_name,
            registrant_profiles!inner(first_name, last_name, email)
          `)
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

  const loadRequests = async () => {
    if (!profileIds || Object.values(profileIds).every(id => id === null)) {
      setCategorizedRequests({ received: [], sent: [], active: [], history: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the service to load requests for all roles
      const allRequestsPromises = [];

      if (profileIds.applicant) {
        allRequestsPromises.push(matchRequestsService.getByUserId('applicant', profileIds.applicant));
      }
      if (profileIds.peerSupport) {
        allRequestsPromises.push(matchRequestsService.getByUserId('peer-support', profileIds.peerSupport));
      }
      if (profileIds.landlord) {
        allRequestsPromises.push(matchRequestsService.getByUserId('landlord', profileIds.landlord));
      }
      if (profileIds.employer) {
        allRequestsPromises.push(matchRequestsService.getByUserId('employer', profileIds.employer));
      }

      const results = await Promise.all(allRequestsPromises);
      
      // Combine all requests and remove duplicates
      const allRequests = [];
      const seenIds = new Set();
      
      results.forEach(result => {
        if (result.success && result.data) {
          result.data.forEach(request => {
            if (!seenIds.has(request.id)) {
              seenIds.add(request.id);
              allRequests.push(request);
            }
          });
        }
      });

      if (allRequests.length > 0) {
        // Enrich with profile data
        const enrichedRequests = await Promise.all(
          allRequests.map(request => loadProfileData(request))
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

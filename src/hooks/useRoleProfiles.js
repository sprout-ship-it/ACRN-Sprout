// src/hooks/useRoleProfiles.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useRoleProfiles = (profile, hasRole) => {
  const [profileIds, setProfileIds] = useState({
    applicant: null,
    peerSupport: null,
    landlord: null,
    employer: null
  });
  
  const [loading, setLoading] = useState(true);

  const loadRoleSpecificProfileIds = async () => {
    if (!profile?.id) return null;
    
    const ids = { applicant: null, peerSupport: null, landlord: null, employer: null };

    try {
      const promises = [];

      if (hasRole('applicant')) {
        promises.push(
          supabase
            .from('applicant_matching_profiles')
            .select('id')
            .eq('user_id', profile.id)
            .single()
            .then(({ data }) => ({ role: 'applicant', id: data?.id }))
        );
      }

      if (hasRole('peer-support')) {
        promises.push(
          supabase
            .from('peer_support_profiles')
            .select('id')
            .eq('user_id', profile.id)
            .single()
            .then(({ data }) => ({ role: 'peerSupport', id: data?.id }))
        );
      }

      if (hasRole('landlord')) {
        promises.push(
          supabase
            .from('landlord_profiles')
            .select('id')
            .eq('user_id', profile.id)
            .single()
            .then(({ data }) => ({ role: 'landlord', id: data?.id }))
        );
      }

      if (hasRole('employer')) {
        promises.push(
          supabase
            .from('employer_profiles')
            .select('id')
            .eq('user_id', profile.id)
            .single()
            .then(({ data }) => ({ role: 'employer', id: data?.id }))
        );
      }

      const results = await Promise.all(promises);
      results.forEach(({ role, id }) => {
        if (id) ids[role] = id;
      });

      console.log('✅ Loaded role-specific profile IDs:', ids);
      return ids;
      
    } catch (error) {
      console.error('Error loading role-specific profile IDs:', error);
      return ids;
    }
  };

  useEffect(() => {
    const loadIds = async () => {
      setLoading(true);
      const ids = await loadRoleSpecificProfileIds();
      if (ids) setProfileIds(ids);
      setLoading(false);
    };

    if (profile?.id) {
      loadIds();
    }
  }, [profile?.id]);

  return { profileIds, loading, loadRoleSpecificProfileIds };
};
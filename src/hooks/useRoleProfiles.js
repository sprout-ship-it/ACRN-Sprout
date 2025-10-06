// src/hooks/useRoleProfiles.js - FIXED ID MAPPING
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
      console.log('🔄 Loading role-specific profile IDs for registrant_profile.id:', profile.id);
      
      const promises = [];

      // ✅ FIXED: All role-specific tables use registrant_profiles.id as user_id
      if (hasRole('applicant')) {
        promises.push(
          supabase
            .from('applicant_matching_profiles')
            .select('id, user_id')
            .eq('user_id', profile.id) // ✅ CORRECT: Use registrant_profiles.id
            .single()
            .then(({ data, error }) => {
              if (error && !error.message.includes('0 rows')) {
                console.warn('⚠️ Error loading applicant profile:', error);
              }
              console.log('📋 Applicant profile result:', data);
              return { role: 'applicant', id: data?.id };
            })
        );
      }

      if (hasRole('peer-support')) {
        promises.push(
          supabase
            .from('peer_support_profiles')
            .select('id, user_id')
            .eq('user_id', profile.id) // ✅ CORRECT: Use registrant_profiles.id
            .single()
            .then(({ data, error }) => {
              if (error && !error.message.includes('0 rows')) {
                console.warn('⚠️ Error loading peer support profile:', error);
              }
              console.log('📋 Peer support profile result:', data);
              return { role: 'peerSupport', id: data?.id };
            })
        );
      }

      if (hasRole('landlord')) {
        promises.push(
          supabase
            .from('landlord_profiles')
            .select('id, user_id')
            .eq('user_id', profile.id) // ✅ CORRECT: Use registrant_profiles.id
            .single()
            .then(({ data, error }) => {
              if (error && !error.message.includes('0 rows')) {
                console.warn('⚠️ Error loading landlord profile:', error);
              }
              console.log('📋 Landlord profile result:', data);
              return { role: 'landlord', id: data?.id };
            })
        );
      }

      if (hasRole('employer')) {
        promises.push(
          supabase
            .from('employer_profiles')
            .select('id, user_id')
            .eq('user_id', profile.id) // ✅ CORRECT: Use registrant_profiles.id
            .single()
            .then(({ data, error }) => {
              if (error && !error.message.includes('0 rows')) {
                console.warn('⚠️ Error loading employer profile:', error);
              }
              console.log('📋 Employer profile result:', data);
              return { role: 'employer', id: data?.id };
            })
        );
      }

      const results = await Promise.all(promises);
      results.forEach(({ role, id }) => {
        if (id) ids[role] = id;
      });

      console.log('✅ Loaded role-specific profile IDs:', ids);
      console.log('🔍 ID Mapping Summary:', {
        registrantProfileId: profile.id,
        applicantMatchingProfileId: ids.applicant,
        peerSupportProfileId: ids.peerSupport,
        landlordProfileId: ids.landlord,
        employerProfileId: ids.employer
      });
      
      return ids;
      
    } catch (error) {
      console.error('💥 Error loading role-specific profile IDs:', error);
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
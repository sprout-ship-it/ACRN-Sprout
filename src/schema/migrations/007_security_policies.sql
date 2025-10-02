-- src/schema/migrations/007_security_policies.sql
-- Dependencies: 006_indexes_performance.sql

BEGIN;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE registrant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_matching_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REGISTRANT PROFILES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own registrant profile" ON registrant_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own registrant profile" ON registrant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own registrant profile" ON registrant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Verified users can view other registrant profiles" ON registrant_profiles
  FOR SELECT USING (
    is_active = true
    AND (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM registrant_profiles rp2
        WHERE rp2.user_id = auth.uid() 
          AND rp2.is_active = true
      )
    )
  );

-- ============================================================================
-- APPLICANT MATCHING PROFILES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own applicant profile" ON applicant_matching_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = applicant_matching_profiles.user_id)
  );

CREATE POLICY "Users can update own applicant profile" ON applicant_matching_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = applicant_matching_profiles.user_id)
  );

CREATE POLICY "Users can insert own applicant profile" ON applicant_matching_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = applicant_matching_profiles.user_id)
  );

CREATE POLICY "Active applicants can view other applicant profiles" ON applicant_matching_profiles
  FOR SELECT USING (
    is_active = true 
    AND profile_completed = true 
    AND profile_visibility = 'verified-members'
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp2
      JOIN registrant_profiles rp ON amp2.user_id = rp.id
      WHERE rp.user_id = auth.uid() AND amp2.is_active = true
    )
  );

CREATE POLICY "Landlords can view applicants with housing matches" ON applicant_matching_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM housing_matches hm
      JOIN properties p ON hm.property_id = p.id
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE hm.applicant_id = applicant_matching_profiles.id
        AND rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- LANDLORD PROFILES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own landlord profile" ON landlord_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = landlord_profiles.user_id)
  );

CREATE POLICY "Users can update own landlord profile" ON landlord_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = landlord_profiles.user_id)
  );

CREATE POLICY "Users can insert own landlord profile" ON landlord_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = landlord_profiles.user_id)
  );

CREATE POLICY "Applicants can view landlords they're matched with" ON landlord_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM housing_matches hm
      JOIN properties p ON hm.property_id = p.id
      JOIN applicant_matching_profiles amp ON hm.applicant_id = amp.id
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE p.landlord_id = landlord_profiles.id
        AND rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PROPERTIES RLS POLICIES
-- ============================================================================

CREATE POLICY "Landlords can view own properties" ON properties
  FOR SELECT USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own properties" ON properties
  FOR UPDATE USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert properties" ON properties
  FOR INSERT WITH CHECK (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can delete own properties" ON properties
  FOR DELETE USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Active applicants can view available properties" ON properties
  FOR SELECT USING (
    accepting_applications = true
    AND status = 'available'
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid() 
        AND amp.is_active = true
        AND amp.profile_completed = true
    )
  );

-- ============================================================================
-- EMPLOYER PROFILES RLS POLICIES (FIXED)
-- ============================================================================

CREATE POLICY "Users can view own employer profile" ON employer_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = employer_profiles.user_id)
  );

CREATE POLICY "Users can update own employer profile" ON employer_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = employer_profiles.user_id)
  );

CREATE POLICY "Users can insert own employer profile" ON employer_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = employer_profiles.user_id)
  );

CREATE POLICY "Verified applicants can view employer profiles" ON employer_profiles
  FOR SELECT USING (
    is_active = true
    AND accepting_applications = true
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid() 
        AND amp.is_active = true
        AND amp.profile_completed = true
    )
  );

-- ============================================================================
-- PEER SUPPORT PROFILES RLS POLICIES (FIXED)
-- ============================================================================

CREATE POLICY "Users can view own peer support profile" ON peer_support_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = peer_support_profiles.user_id)
  );

CREATE POLICY "Users can update own peer support profile" ON peer_support_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = peer_support_profiles.user_id)
  );

CREATE POLICY "Users can insert own peer support profile" ON peer_support_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = peer_support_profiles.user_id)
  );

CREATE POLICY "Verified applicants can view peer support profiles" ON peer_support_profiles
  FOR SELECT USING (
    is_active = true 
    AND accepting_clients = true 
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid() 
        AND amp.is_active = true
        AND amp.profile_completed = true
    )
  );

-- ============================================================================
-- HOUSING MATCHES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their housing matches" ON housing_matches
  FOR SELECT USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create housing matches" ON housing_matches
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their housing matches" ON housing_matches
  FOR UPDATE USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- EMPLOYMENT MATCHES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their employment matches" ON employment_matches
  FOR SELECT USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN registrant_profiles rp ON ep.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create employment matches" ON employment_matches
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN registrant_profiles rp ON ep.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their employment matches" ON employment_matches
  FOR UPDATE USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN registrant_profiles rp ON ep.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PEER SUPPORT MATCHES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their peer support matches" ON peer_support_matches
  FOR SELECT USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    peer_support_id IN (
      SELECT psp.id FROM peer_support_profiles psp
      JOIN registrant_profiles rp ON psp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create peer support matches" ON peer_support_matches
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    peer_support_id IN (
      SELECT psp.id FROM peer_support_profiles psp
      JOIN registrant_profiles rp ON psp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their peer support matches" ON peer_support_matches
  FOR UPDATE USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    peer_support_id IN (
      SELECT psp.id FROM peer_support_profiles psp
      JOIN registrant_profiles rp ON psp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MATCH GROUPS RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their match groups" ON match_groups
  FOR SELECT USING (
    applicant_1_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR applicant_2_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR peer_support_id IN (
      SELECT psp.id FROM peer_support_profiles psp
      JOIN registrant_profiles rp ON psp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create match groups" ON match_groups
  FOR INSERT WITH CHECK (
    applicant_1_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR applicant_2_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their match groups" ON match_groups
  FOR UPDATE USING (
    applicant_1_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR applicant_2_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MATCH REQUESTS RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can create match requests" ON match_requests
  FOR INSERT WITH CHECK (
    (requester_type = 'applicant' AND 
     requester_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'landlord' AND 
     requester_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'employer' AND 
     requester_id IN (
       SELECT ep.id FROM employer_profiles ep
       JOIN registrant_profiles rp ON ep.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'peer-support' AND 
     requester_id IN (
       SELECT psp.id FROM peer_support_profiles psp
       JOIN registrant_profiles rp ON psp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
  );

CREATE POLICY "Users can view their match requests" ON match_requests
  FOR SELECT USING (
    (requester_type = 'applicant' AND 
     requester_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'applicant' AND 
     recipient_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'landlord' AND 
     requester_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'landlord' AND 
     recipient_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'employer' AND 
     requester_id IN (
       SELECT ep.id FROM employer_profiles ep
       JOIN registrant_profiles rp ON ep.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'employer' AND 
     recipient_id IN (
       SELECT ep.id FROM employer_profiles ep
       JOIN registrant_profiles rp ON ep.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'peer-support' AND 
     requester_id IN (
       SELECT psp.id FROM peer_support_profiles psp
       JOIN registrant_profiles rp ON psp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'peer-support' AND 
     recipient_id IN (
       SELECT psp.id FROM peer_support_profiles psp
       JOIN registrant_profiles rp ON psp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
  );

CREATE POLICY "Users can update their match requests" ON match_requests
  FOR UPDATE USING (
    (requester_type = 'applicant' AND 
     requester_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'applicant' AND 
     recipient_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'landlord' AND 
     requester_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'landlord' AND 
     recipient_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'employer' AND 
     requester_id IN (
       SELECT ep.id FROM employer_profiles ep
       JOIN registrant_profiles rp ON ep.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'employer' AND 
     recipient_id IN (
       SELECT ep.id FROM employer_profiles ep
       JOIN registrant_profiles rp ON ep.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'peer-support' AND 
     requester_id IN (
       SELECT psp.id FROM peer_support_profiles psp
       JOIN registrant_profiles rp ON psp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'peer-support' AND 
     recipient_id IN (
       SELECT psp.id FROM peer_support_profiles psp
       JOIN registrant_profiles rp ON psp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
  );

-- ============================================================================
-- FAVORITES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = favoriting_user_id);

CREATE POLICY "Users can create own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = favoriting_user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = favoriting_user_id);

-- ============================================================================
-- EMPLOYER FAVORITES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own employer favorites" ON employer_favorites
  FOR SELECT USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own employer favorites" ON employer_favorites
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own employer favorites" ON employer_favorites
  FOR DELETE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- APPLICATIONS RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own applications" ON applications
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MESSAGES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages" ON messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

COMMIT;
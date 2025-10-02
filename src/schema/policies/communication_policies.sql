-- src/schema/policies/communication_policies.sql
-- Dependencies: All profile tables, properties, match_groups, match_requests, favorites tables
-- Description: RLS policies for communication, groups, requests, and favorites

-- ============================================================================
-- MATCH GROUPS RLS POLICIES
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their match groups" ON match_groups;
DROP POLICY IF EXISTS "Users can create match groups" ON match_groups;
DROP POLICY IF EXISTS "Users can update their match groups" ON match_groups;

-- Users can view match groups they're part of
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

-- Users can create match groups they're part of
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

-- Users can update match groups they're part of
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

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can create match requests" ON match_requests;
DROP POLICY IF EXISTS "Users can view their match requests" ON match_requests;
DROP POLICY IF EXISTS "Users can update their match requests" ON match_requests;

-- Users can create match requests as requester
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

-- Users can view match requests they're involved in (as requester or recipient)
CREATE POLICY "Users can view their match requests" ON match_requests
  FOR SELECT USING (
    -- Requester perspective
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
    OR
    -- Recipient perspective
    (recipient_type = 'applicant' AND 
     recipient_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
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
    (recipient_type = 'employer' AND 
     recipient_id IN (
       SELECT ep.id FROM employer_profiles ep
       JOIN registrant_profiles rp ON ep.user_id = rp.id
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

-- Users can update match requests they're involved in
CREATE POLICY "Users can update their match requests" ON match_requests
  FOR UPDATE USING (
    -- Both requester and recipient can update
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

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Users can manage their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = favoriting_user_id);

CREATE POLICY "Users can create their own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = favoriting_user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (auth.uid() = favoriting_user_id);

-- ============================================================================
-- EMPLOYER FAVORITES RLS POLICIES
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own employer favorites" ON employer_favorites;
DROP POLICY IF EXISTS "Users can create their own employer favorites" ON employer_favorites;
DROP POLICY IF EXISTS "Users can delete their own employer favorites" ON employer_favorites;

-- Users can manage their own employer favorites
CREATE POLICY "Users can view their own employer favorites" ON employer_favorites
  FOR SELECT USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own employer favorites" ON employer_favorites
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own employer favorites" ON employer_favorites
  FOR DELETE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE match_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_favorites ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON match_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON employer_favorites TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
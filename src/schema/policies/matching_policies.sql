-- src/schema/policies/matching_policies.sql
-- Dependencies: All profile tables, properties, matching tables
-- Description: RLS policies for all matching-related tables

-- ============================================================================
-- HOUSING MATCHES RLS POLICIES
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their housing matches" ON housing_matches;
DROP POLICY IF EXISTS "Users can create housing matches" ON housing_matches;
DROP POLICY IF EXISTS "Users can update their housing matches" ON housing_matches;

-- Users can view housing matches they're involved in
CREATE POLICY "Users can view their housing matches" ON housing_matches
  FOR SELECT USING (
    -- Applicants can see their matches
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    -- Landlords can see matches for their properties
    property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can create housing matches for themselves
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

-- Users can update housing matches they're involved in
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

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their employment matches" ON employment_matches;
DROP POLICY IF EXISTS "Users can create employment matches" ON employment_matches;
DROP POLICY IF EXISTS "Users can update their employment matches" ON employment_matches;

-- Users can view employment matches they're involved in
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

-- Users can create employment matches for themselves
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

-- Users can update employment matches they're involved in
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

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their peer support matches" ON peer_support_matches;
DROP POLICY IF EXISTS "Users can create peer support matches" ON peer_support_matches;
DROP POLICY IF EXISTS "Users can update their peer support matches" ON peer_support_matches;

-- Users can view peer support matches they're involved in
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

-- Users can create peer support matches for themselves
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

-- Users can update peer support matches they're involved in
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
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE housing_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_matches ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON housing_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON employment_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON peer_support_matches TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
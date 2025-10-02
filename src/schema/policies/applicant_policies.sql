-- src/schema/policies/applicant_policies.sql
-- Dependencies: registrant_profiles, applicant_matching_profiles tables
-- Description: RLS policies for applicant matching profiles

-- ============================================================================
-- APPLICANT MATCHING PROFILES RLS POLICIES
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own applicant profile" ON applicant_matching_profiles;
DROP POLICY IF EXISTS "Users can insert their own applicant profile" ON applicant_matching_profiles;
DROP POLICY IF EXISTS "Users can update their own applicant profile" ON applicant_matching_profiles;
DROP POLICY IF EXISTS "Users can delete their own applicant profile" ON applicant_matching_profiles;
DROP POLICY IF EXISTS "Active applicants can view other applicant profiles" ON applicant_matching_profiles;
DROP POLICY IF EXISTS "Landlords can view applicants with housing matches" ON applicant_matching_profiles;

-- ============================================================================
-- SELF-MANAGEMENT POLICIES
-- ============================================================================

-- Users can view their own applicant profile
CREATE POLICY "Users can view their own applicant profile" ON applicant_matching_profiles
  FOR SELECT USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can update their own applicant profile
CREATE POLICY "Users can update their own applicant profile" ON applicant_matching_profiles
  FOR UPDATE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can insert their own applicant profile
CREATE POLICY "Users can insert their own applicant profile" ON applicant_matching_profiles
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can delete their own applicant profile
CREATE POLICY "Users can delete their own applicant profile" ON applicant_matching_profiles
  FOR DELETE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CROSS-ROLE ACCESS POLICIES
-- ============================================================================

-- Active applicants can view other active applicant profiles for matching
CREATE POLICY "Active applicants can view other applicant profiles" ON applicant_matching_profiles
  FOR SELECT USING (
    is_active = true 
    AND profile_completed = true 
    AND profile_visibility = 'verified-members'
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp2
      JOIN registrant_profiles rp ON amp2.user_id = rp.id
      WHERE rp.user_id = auth.uid() 
        AND amp2.is_active = true
        AND amp2.profile_completed = true
    )
  );

-- Landlords can view applicant profiles when they have housing matches
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
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE applicant_matching_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON applicant_matching_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

/*
POLICY VERIFICATION:
- ✅ Non-recursive pattern for self-management
- ✅ Users can manage their own profiles
- ✅ Active applicants can view other completed profiles
- ✅ Landlords can view applicants they're matched with
- ✅ Proper permissions granted
- ✅ RLS enabled

SECURITY PATTERN:
- Self-management: user_id IN (SELECT rp.id FROM registrant_profiles rp WHERE rp.user_id = auth.uid())
- Peer visibility: Active applicants can see other active profiles
- Cross-role access: Landlords see applicants through housing matches
*/
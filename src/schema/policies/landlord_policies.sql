-- src/schema/policies/landlord_policies.sql
-- Dependencies: registrant_profiles, landlord_profiles tables
-- Description: RLS policies for landlord profiles

-- ============================================================================
-- LANDLORD PROFILES RLS POLICIES
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own landlord profile" ON landlord_profiles;
DROP POLICY IF EXISTS "Users can insert their own landlord profile" ON landlord_profiles;
DROP POLICY IF EXISTS "Users can update their own landlord profile" ON landlord_profiles;
DROP POLICY IF EXISTS "Users can delete their own landlord profile" ON landlord_profiles;
DROP POLICY IF EXISTS "Applicants can view landlords they're matched with" ON landlord_profiles;

-- ============================================================================
-- SELF-MANAGEMENT POLICIES
-- ============================================================================

-- Users can view their own landlord profile
CREATE POLICY "Users can view their own landlord profile" ON landlord_profiles
  FOR SELECT USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can update their own landlord profile
CREATE POLICY "Users can update their own landlord profile" ON landlord_profiles
  FOR UPDATE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can insert their own landlord profile
CREATE POLICY "Users can insert their own landlord profile" ON landlord_profiles
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can delete their own landlord profile
CREATE POLICY "Users can delete their own landlord profile" ON landlord_profiles
  FOR DELETE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CROSS-ROLE ACCESS POLICIES
-- ============================================================================

-- Applicants can view landlord profiles of properties they're matched with
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
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE landlord_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON landlord_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

/*
POLICY VERIFICATION:
- ✅ Non-recursive pattern for self-management
- ✅ Users can manage their own profiles
- ✅ Applicants can view landlords through housing matches
- ✅ Proper permissions granted
- ✅ RLS enabled

SECURITY PATTERN:
- Self-management: user_id IN (SELECT rp.id FROM registrant_profiles rp WHERE rp.user_id = auth.uid())
- Cross-role access: Applicants see landlords through housing matches and properties
- Symmetric with applicant policies for landlord access
*/
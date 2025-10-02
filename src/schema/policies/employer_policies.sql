-- src/schema/policies/employer_policies.sql
-- Dependencies: registrant_profiles, employer_profiles tables
-- Description: RLS policies for employer profiles with fixed non-recursive patterns

-- ============================================================================
-- EMPLOYER PROFILES RLS POLICIES (FIXED - NO RECURSION)
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own employer profile" ON employer_profiles;
DROP POLICY IF EXISTS "Users can insert their own employer profile" ON employer_profiles;
DROP POLICY IF EXISTS "Users can update their own employer profile" ON employer_profiles;
DROP POLICY IF EXISTS "Active applicants can view employer profiles" ON employer_profiles;
DROP POLICY IF EXISTS "Verified applicants can view employer profiles" ON employer_profiles;

-- ============================================================================
-- SELF-MANAGEMENT POLICIES (Non-recursive pattern)
-- ============================================================================

-- Users can view their own employer profile
CREATE POLICY "Users can view own employer profile" ON employer_profiles
  FOR SELECT USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can insert their own employer profile
CREATE POLICY "Users can insert own employer profile" ON employer_profiles
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can update their own employer profile
CREATE POLICY "Users can update own employer profile" ON employer_profiles
  FOR UPDATE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can delete their own employer profile
CREATE POLICY "Users can delete own employer profile" ON employer_profiles
  FOR DELETE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CROSS-ROLE ACCESS POLICIES
-- ============================================================================

-- Verified applicants can view active employer profiles
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
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON employer_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

/*
POLICY VERIFICATION:
- ✅ No recursive queries (uses direct user_id IN pattern)
- ✅ Users can manage their own profiles
- ✅ Active applicants can view active employer profiles
- ✅ Proper permissions granted
- ✅ RLS enabled

SECURITY PATTERN:
- Self-management: user_id IN (SELECT rp.id FROM registrant_profiles rp WHERE rp.user_id = auth.uid())
- Cross-role access: EXISTS check for active applicant profiles
- No recursive auth.uid() = (SELECT user_id FROM...) patterns
*/
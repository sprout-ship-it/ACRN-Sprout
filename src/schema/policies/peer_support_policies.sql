-- src/schema/policies/peer_support_policies.sql
-- Dependencies: registrant_profiles, peer_support_profiles tables
-- Description: RLS policies for peer support profiles with fixed non-recursive patterns

-- ============================================================================
-- PEER SUPPORT PROFILES RLS POLICIES (FIXED - NO RECURSION)
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own peer support profile" ON peer_support_profiles;
DROP POLICY IF EXISTS "Users can insert their own peer support profile" ON peer_support_profiles;
DROP POLICY IF EXISTS "Users can update their own peer support profile" ON peer_support_profiles;
DROP POLICY IF EXISTS "Active applicants can view peer support profiles" ON peer_support_profiles;
DROP POLICY IF EXISTS "Verified applicants can view peer support profiles" ON peer_support_profiles;

-- ============================================================================
-- SELF-MANAGEMENT POLICIES (Non-recursive pattern)
-- ============================================================================

-- Users can view their own peer support profile
CREATE POLICY "Users can view own peer support profile" ON peer_support_profiles
  FOR SELECT USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can insert their own peer support profile
CREATE POLICY "Users can insert own peer support profile" ON peer_support_profiles
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can update their own peer support profile
CREATE POLICY "Users can update own peer support profile" ON peer_support_profiles
  FOR UPDATE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can delete their own peer support profile
CREATE POLICY "Users can delete own peer support profile" ON peer_support_profiles
  FOR DELETE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CROSS-ROLE ACCESS POLICIES
-- ============================================================================

-- Verified applicants can view active peer support profiles
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
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE peer_support_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON peer_support_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

/*
POLICY VERIFICATION:
- ✅ No recursive queries (uses direct user_id IN pattern)
- ✅ Users can manage their own profiles
- ✅ Active applicants can view active peer support profiles
- ✅ Proper permissions granted
- ✅ RLS enabled

SECURITY PATTERN:
- Self-management: user_id IN (SELECT rp.id FROM registrant_profiles rp WHERE rp.user_id = auth.uid())
- Cross-role access: EXISTS check for active applicant profiles
- No direct auth.uid() = (SELECT user_id FROM...) patterns that cause recursion
*/
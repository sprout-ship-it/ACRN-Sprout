-- src/schema/policies/user_policies.sql
-- Dependencies: registrant_profiles table
-- Description: RLS policies for registrant profiles (core user management)

-- ============================================================================
-- REGISTRANT PROFILES RLS POLICIES
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own registrant profile" ON registrant_profiles;
DROP POLICY IF EXISTS "Users can insert their own registrant profile" ON registrant_profiles;
DROP POLICY IF EXISTS "Users can update their own registrant profile" ON registrant_profiles;
DROP POLICY IF EXISTS "Users can delete their own registrant profile" ON registrant_profiles;
DROP POLICY IF EXISTS "Verified applicants can view other registrant profiles" ON registrant_profiles;

-- ============================================================================
-- SELF-MANAGEMENT POLICIES
-- ============================================================================

-- Users can view their own registrant profile
CREATE POLICY "Users can view their own registrant profile" ON registrant_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own registrant profile
CREATE POLICY "Users can update their own registrant profile" ON registrant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own registrant profile
CREATE POLICY "Users can insert their own registrant profile" ON registrant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own registrant profile
CREATE POLICY "Users can delete their own registrant profile" ON registrant_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CROSS-ROLE ACCESS POLICIES
-- ============================================================================

-- Verified applicants can view other registrant profiles for matching
CREATE POLICY "Verified applicants can view other registrant profiles" ON registrant_profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    OR can_view_applicant_profile(id)
  );

-- ============================================================================
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE registrant_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON registrant_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

/*
POLICY VERIFICATION:
- ✅ Direct auth.uid() = user_id pattern (safe for core user table)
- ✅ Users can manage their own profiles
- ✅ Cross-role viewing via security definer function
- ✅ Proper permissions granted
- ✅ RLS enabled

SECURITY PATTERN:
- Self-management: Direct auth.uid() = user_id (safe since this is the core table)
- Cross-role access: Uses can_view_applicant_profile() security definer function
- This table is referenced by other policies but doesn't reference itself
*/
-- src/schema/policies/property_policies.sql
-- Dependencies: registrant_profiles, landlord_profiles, properties tables
-- Description: RLS policies for properties

-- ============================================================================
-- PROPERTIES RLS POLICIES
-- ============================================================================

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Landlords can view their own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can insert properties" ON properties;
DROP POLICY IF EXISTS "Landlords can update their own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can delete their own properties" ON properties;
DROP POLICY IF EXISTS "Active applicants can view available properties" ON properties;

-- ============================================================================
-- LANDLORD MANAGEMENT POLICIES
-- ============================================================================

-- Landlords can view their own properties
CREATE POLICY "Landlords can view their own properties" ON properties
  FOR SELECT USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- Landlords can update their own properties
CREATE POLICY "Landlords can update their own properties" ON properties
  FOR UPDATE USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- Landlords can insert properties
CREATE POLICY "Landlords can insert properties" ON properties
  FOR INSERT WITH CHECK (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- Landlords can delete their own properties
CREATE POLICY "Landlords can delete their own properties" ON properties
  FOR DELETE USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- APPLICANT ACCESS POLICIES
-- ============================================================================

-- Active applicants can view available properties
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
-- ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON properties TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

/*
POLICY VERIFICATION:
- ✅ Landlords can manage properties through landlord_profiles linkage
- ✅ Active applicants can view available properties
- ✅ Properties only visible when accepting applications and available
- ✅ Proper permissions granted
- ✅ RLS enabled

SECURITY PATTERN:
- Landlord management: landlord_id IN (SELECT lp.id FROM landlord_profiles lp JOIN registrant_profiles rp...)
- Applicant access: accepting_applications = true AND status = 'available' AND verified applicant EXISTS
- Properties are the core asset that drives housing matches
*/
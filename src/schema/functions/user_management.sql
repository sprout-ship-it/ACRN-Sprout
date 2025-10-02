-- src/schema/functions/user_management.sql
-- ============================================================================
-- USER MANAGEMENT FUNCTIONS
-- ============================================================================
-- Functions for user registration, profile creation, and basic user operations
-- Dependencies: Requires registrant_profiles table from schemas/01_core_tables.sql
-- ============================================================================

-- ============================================================================
-- AUTO-CREATE REGISTRANT PROFILE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_registrant_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO registrant_profiles (
    user_id,
    first_name,
    last_name,
    email,
    roles,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email,
    ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'applicant')]::TEXT[],
    TRUE,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECURITY DEFINER FUNCTION (Prevents RLS recursion)
-- ============================================================================

CREATE OR REPLACE FUNCTION can_view_applicant_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applicant_matching_profiles
    WHERE user_id = profile_id
      AND is_active = true
      AND profile_completed = true
  );
END;
$$;
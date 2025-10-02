-- src/schema/migrations/008_functions_triggers.sql
-- Dependencies: 007_security_policies.sql

BEGIN;

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

-- ============================================================================
-- PROFILE COMPLETION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_applicant_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_count INTEGER := 0;
  total_required_fields INTEGER := 20;
BEGIN
  -- Count completed required fields
  IF NEW.primary_phone IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.date_of_birth IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.preferred_roommate_gender IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.primary_city IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.primary_state IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.budget_min IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.budget_max IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.recovery_stage IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.recovery_methods IS NOT NULL AND array_length(NEW.recovery_methods, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  IF NEW.program_types IS NOT NULL AND array_length(NEW.program_types, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  IF NEW.primary_issues IS NOT NULL AND array_length(NEW.primary_issues, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  IF NEW.spiritual_affiliation IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.social_level IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.cleanliness_level IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.noise_tolerance IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.work_schedule IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.move_in_date IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.about_me IS NOT NULL AND length(NEW.about_me) > 20 THEN completion_count := completion_count + 1; END IF;
  IF NEW.looking_for IS NOT NULL AND length(NEW.looking_for) > 20 THEN completion_count := completion_count + 1; END IF;
  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  
  -- Calculate percentage
  NEW.completion_percentage := ROUND((completion_count::DECIMAL / total_required_fields) * 100);
  NEW.profile_completed := (NEW.completion_percentage >= 80);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_property_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_count INTEGER := 0;
  total_required_fields INTEGER;
BEGIN
  -- Different requirements for recovery housing vs general rentals
  IF NEW.is_recovery_housing THEN
    total_required_fields := 12;
    
    -- Basic requirements
    IF NEW.title IS NOT NULL AND length(NEW.title) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.property_type IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.address IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.city IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.state IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.bedrooms IS NOT NULL AND NEW.bedrooms > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.monthly_rent IS NOT NULL AND NEW.monthly_rent > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.description IS NOT NULL AND length(NEW.description) > 20 THEN completion_count := completion_count + 1; END IF;
    
    -- Recovery-specific requirements
    IF NEW.required_programs IS NOT NULL AND array_length(NEW.required_programs, 1) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.house_rules IS NOT NULL AND array_length(NEW.house_rules, 1) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.gender_restrictions IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.amenities IS NOT NULL AND array_length(NEW.amenities, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  ELSE
    total_required_fields := 8;
    
    -- Basic requirements only
    IF NEW.title IS NOT NULL AND length(NEW.title) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.property_type IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.address IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.city IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.state IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.bedrooms IS NOT NULL AND NEW.bedrooms >= 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.monthly_rent IS NOT NULL AND NEW.monthly_rent > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.description IS NOT NULL AND length(NEW.description) > 20 THEN completion_count := completion_count + 1; END IF;
  END IF;
  
  -- Store completion data in internal_notes as JSON
  NEW.internal_notes := jsonb_build_object(
    'completion_percentage', ROUND((completion_count::DECIMAL / total_required_fields) * 100),
    'completed_fields', completion_count,
    'total_required', total_required_fields,
    'profile_completed', (completion_count >= total_required_fields * 0.8)
  )::text;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PROFILE COMPLETION TRIGGERS
-- ============================================================================

CREATE TRIGGER trigger_calculate_applicant_profile_completion
  BEFORE INSERT OR UPDATE ON applicant_matching_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_applicant_profile_completion();

CREATE TRIGGER trigger_calculate_property_completion
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_property_completion();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Employer Favorites with Details View
CREATE VIEW employer_favorites_with_details AS
SELECT 
  ef.*,
  ep.business_type,
  ep.industry,
  ep.description,
  ep.service_city,
  ep.service_state,
  ep.accepting_applications,
  ep.contact_person,
  ep.primary_phone,
  ep.contact_email,
  ep.job_types_available,
  ep.supported_recovery_methods,
  rp.first_name,
  rp.last_name,
  rp.email
FROM employer_favorites ef
JOIN employer_profiles ep ON ep.user_id = ef.employer_user_id
JOIN registrant_profiles rp ON rp.id = ef.employer_user_id;

-- ============================================================================
-- PERMISSIONS AND GRANTS
-- ============================================================================

-- Grant necessary permissions for Supabase auth integration
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, anon, authenticated, service_role;

-- Grant necessary permissions for all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;
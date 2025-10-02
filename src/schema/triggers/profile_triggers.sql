-- src/schema/triggers/profile_triggers.sql
-- ============================================================================
-- PROFILE TRIGGERS
-- ============================================================================
-- Triggers for profile creation and completion calculation
-- Dependencies: Requires functions from functions/user_management.sql and functions/profile_completion.sql
-- ============================================================================

-- ============================================================================
-- USER REGISTRATION TRIGGER
-- ============================================================================

-- Auto-create registrant profile when new user registers
CREATE TRIGGER trigger_create_registrant_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_registrant_profile();

-- ============================================================================
-- PROFILE COMPLETION TRIGGERS
-- ============================================================================

-- Calculate applicant profile completion percentage
CREATE TRIGGER trigger_calculate_applicant_profile_completion
  BEFORE INSERT OR UPDATE ON applicant_matching_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_applicant_profile_completion();

-- Calculate property completion percentage
CREATE TRIGGER trigger_calculate_property_completion
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_property_completion();
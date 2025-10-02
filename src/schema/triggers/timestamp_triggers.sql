-- src/schema/triggers/timestamp_triggers.sql
-- ============================================================================
-- TIMESTAMP TRIGGERS
-- ============================================================================
-- Triggers to automatically update the updated_at timestamp for all tables
-- Dependencies: Requires update_timestamp() function from functions/utility_functions.sql
-- ============================================================================

-- ============================================================================
-- CORE PROFILE TIMESTAMP TRIGGERS
-- ============================================================================

-- Registrant profiles timestamp update
CREATE TRIGGER trigger_update_registrant_profiles_timestamp
  BEFORE UPDATE ON registrant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Applicant profiles timestamp update
CREATE TRIGGER trigger_update_applicant_profiles_timestamp
  BEFORE UPDATE ON applicant_matching_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Landlord profiles timestamp update
CREATE TRIGGER trigger_update_landlord_profiles_timestamp
  BEFORE UPDATE ON landlord_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Employer profiles timestamp update
CREATE TRIGGER trigger_update_employer_profiles_timestamp
  BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Peer support profiles timestamp update
CREATE TRIGGER trigger_update_peer_support_profiles_timestamp
  BEFORE UPDATE ON peer_support_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- PROPERTY TIMESTAMP TRIGGERS
-- ============================================================================

-- Properties timestamp update
CREATE TRIGGER trigger_update_properties_timestamp
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- MATCHING SYSTEM TIMESTAMP TRIGGERS
-- ============================================================================

-- Housing matches timestamp update
CREATE TRIGGER trigger_update_housing_matches_timestamp
  BEFORE UPDATE ON housing_matches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Employment matches timestamp update
CREATE TRIGGER trigger_update_employment_matches_timestamp
  BEFORE UPDATE ON employment_matches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Peer support matches timestamp update
CREATE TRIGGER trigger_update_peer_support_matches_timestamp
  BEFORE UPDATE ON peer_support_matches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Match groups timestamp update
CREATE TRIGGER trigger_update_match_groups_timestamp
  BEFORE UPDATE ON match_groups
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Match requests timestamp update
CREATE TRIGGER trigger_update_match_requests_timestamp
  BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
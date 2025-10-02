-- src/schema/indexes/core_indexes.sql
-- ============================================================================
-- CORE INDEXES - Registrant Profiles and Basic System Tables
-- ============================================================================
-- Essential indexes for the central registrant_profiles table and basic system operations
-- Dependencies: Requires registrant_profiles table from schemas/01_core_tables.sql
-- ============================================================================

-- ============================================================================
-- REGISTRANT PROFILES INDEXES
-- ============================================================================
CREATE INDEX idx_registrant_profiles_user_id ON registrant_profiles(user_id);
CREATE INDEX idx_registrant_profiles_email ON registrant_profiles(email);
CREATE INDEX idx_registrant_profiles_roles ON registrant_profiles USING GIN(roles);
CREATE INDEX idx_registrant_profiles_active ON registrant_profiles(is_active) WHERE is_active = TRUE;
-- src/schema/indexes/profile_indexes.sql
-- ============================================================================
-- PROFILE INDEXES - Applicant Matching Profile Performance Optimization
-- ============================================================================
-- Comprehensive indexes for applicant matching profiles to support efficient matching algorithms
-- Dependencies: Requires applicant_matching_profiles table from schemas/02_profile_tables.sql
-- ============================================================================

-- ============================================================================
-- APPLICANT MATCHING PROFILES INDEXES
-- ============================================================================

-- Basic profile identification and status
CREATE INDEX idx_applicant_active_profiles ON applicant_matching_profiles(is_active, profile_completed) WHERE is_active = TRUE;
CREATE INDEX idx_applicant_profile_updated ON applicant_matching_profiles(updated_at DESC);

-- Location-based matching
CREATE INDEX idx_applicant_primary_location ON applicant_matching_profiles(primary_city, primary_state);
CREATE INDEX idx_applicant_location_budget ON applicant_matching_profiles(primary_city, primary_state, budget_min, budget_max);

-- Financial criteria
CREATE INDEX idx_applicant_budget_range ON applicant_matching_profiles(budget_min, budget_max);

-- Recovery and wellness matching
CREATE INDEX idx_applicant_recovery_stage ON applicant_matching_profiles(recovery_stage);
CREATE INDEX idx_applicant_spiritual_affiliation ON applicant_matching_profiles(spiritual_affiliation);
CREATE INDEX idx_applicant_substance_free ON applicant_matching_profiles(substance_free_home_required);
CREATE INDEX idx_applicant_recovery_compatibility ON applicant_matching_profiles(recovery_stage, spiritual_affiliation, substance_free_home_required);

-- Lifestyle compatibility
CREATE INDEX idx_applicant_preferred_gender ON applicant_matching_profiles(preferred_roommate_gender);
CREATE INDEX idx_applicant_lifestyle_compatibility ON applicant_matching_profiles(social_level, cleanliness_level, noise_tolerance);

-- Timing and availability
CREATE INDEX idx_applicant_move_in_date ON applicant_matching_profiles(move_in_date);

-- Array field indexes for complex matching
CREATE INDEX idx_applicant_recovery_methods ON applicant_matching_profiles USING GIN(recovery_methods);
CREATE INDEX idx_applicant_primary_issues ON applicant_matching_profiles USING GIN(primary_issues);
CREATE INDEX idx_applicant_interests ON applicant_matching_profiles USING GIN(interests);
CREATE INDEX idx_applicant_housing_types ON applicant_matching_profiles USING GIN(housing_types_accepted);
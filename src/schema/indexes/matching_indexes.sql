-- src/schema/indexes/matching_indexes.sql
-- ============================================================================
-- MATCHING INDEXES - Relationship Tables and Matching System Performance
-- ============================================================================
-- Indexes for all matching tables, requests, and relationship systems
-- Dependencies: Requires matching tables from schemas/04_matching_tables.sql
-- ============================================================================

-- ============================================================================
-- EMPLOYER PROFILES INDEXES
-- ============================================================================
CREATE INDEX idx_employer_service_location ON employer_profiles(service_city, service_state);
CREATE INDEX idx_employer_active_accepting ON employer_profiles(is_active, accepting_applications) WHERE is_active = TRUE AND accepting_applications = TRUE;
CREATE INDEX idx_employer_job_types ON employer_profiles USING GIN(job_types_available);

-- ============================================================================
-- PEER SUPPORT PROFILES INDEXES
-- ============================================================================
CREATE INDEX idx_peer_service_location ON peer_support_profiles(service_city, service_state);
CREATE INDEX idx_peer_active_accepting ON peer_support_profiles(is_active, accepting_clients) WHERE is_active = TRUE AND accepting_clients = TRUE;
CREATE INDEX idx_peer_specialties ON peer_support_profiles USING GIN(specialties);
CREATE INDEX idx_peer_recovery_methods ON peer_support_profiles USING GIN(supported_recovery_methods);

-- ============================================================================
-- HOUSING MATCHES INDEXES
-- ============================================================================
CREATE INDEX idx_housing_matches_applicant ON housing_matches(applicant_id);
CREATE INDEX idx_housing_matches_property ON housing_matches(property_id);
CREATE INDEX idx_housing_matches_status ON housing_matches(status);

-- ============================================================================
-- EMPLOYMENT MATCHES INDEXES
-- ============================================================================
CREATE INDEX idx_employment_matches_applicant ON employment_matches(applicant_id);
CREATE INDEX idx_employment_matches_employer ON employment_matches(employer_id);

-- ============================================================================
-- PEER SUPPORT MATCHES INDEXES
-- ============================================================================
CREATE INDEX idx_peer_matches_applicant ON peer_support_matches(applicant_id);
CREATE INDEX idx_peer_matches_peer ON peer_support_matches(peer_support_id);

-- ============================================================================
-- MATCH GROUPS INDEXES
-- ============================================================================
CREATE INDEX idx_match_groups_applicant_1 ON match_groups(applicant_1_id);
CREATE INDEX idx_match_groups_applicant_2 ON match_groups(applicant_2_id);
CREATE INDEX idx_match_groups_property ON match_groups(property_id);
CREATE INDEX idx_match_groups_peer_support ON match_groups(peer_support_id);
CREATE INDEX idx_match_groups_status ON match_groups(status);

-- ============================================================================
-- MATCH REQUESTS INDEXES
-- ============================================================================
CREATE INDEX idx_match_requests_requester ON match_requests(requester_type, requester_id);
CREATE INDEX idx_match_requests_recipient ON match_requests(recipient_type, recipient_id);
CREATE INDEX idx_match_requests_property ON match_requests(property_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_match_requests_type ON match_requests(request_type);

-- ============================================================================
-- FAVORITES SYSTEM INDEXES
-- ============================================================================
CREATE INDEX idx_favorites_user ON favorites(favoriting_user_id);
CREATE INDEX idx_favorites_profile ON favorites(favorited_profile_id);
CREATE INDEX idx_favorites_property ON favorites(favorited_property_id);
CREATE INDEX idx_favorites_type ON favorites(favorite_type);

-- ============================================================================
-- EMPLOYER FAVORITES INDEXES
-- ============================================================================
CREATE INDEX idx_employer_favorites_user_id ON employer_favorites(user_id);
CREATE INDEX idx_employer_favorites_employer_user_id ON employer_favorites(employer_user_id);
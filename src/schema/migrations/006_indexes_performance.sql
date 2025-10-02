-- src/schema/migrations/006_indexes_performance.sql
-- Dependencies: 005_communication.sql

BEGIN;

-- ============================================================================
-- APPLICANT MATCHING PROFILES INDEXES
-- ============================================================================

CREATE INDEX idx_applicant_primary_location ON applicant_matching_profiles(primary_city, primary_state);
CREATE INDEX idx_applicant_budget_range ON applicant_matching_profiles(budget_min, budget_max);
CREATE INDEX idx_applicant_recovery_stage ON applicant_matching_profiles(recovery_stage);
CREATE INDEX idx_applicant_preferred_gender ON applicant_matching_profiles(preferred_roommate_gender);
CREATE INDEX idx_applicant_lifestyle_compatibility ON applicant_matching_profiles(social_level, cleanliness_level, noise_tolerance);
CREATE INDEX idx_applicant_spiritual_affiliation ON applicant_matching_profiles(spiritual_affiliation);
CREATE INDEX idx_applicant_move_in_date ON applicant_matching_profiles(move_in_date);
CREATE INDEX idx_applicant_substance_free ON applicant_matching_profiles(substance_free_home_required);
CREATE INDEX idx_applicant_active_profiles ON applicant_matching_profiles(is_active, profile_completed) WHERE is_active = TRUE;
CREATE INDEX idx_applicant_profile_updated ON applicant_matching_profiles(updated_at DESC);

-- Array field indexes
CREATE INDEX idx_applicant_recovery_methods ON applicant_matching_profiles USING GIN(recovery_methods);
CREATE INDEX idx_applicant_primary_issues ON applicant_matching_profiles USING GIN(primary_issues);
CREATE INDEX idx_applicant_interests ON applicant_matching_profiles USING GIN(interests);
CREATE INDEX idx_applicant_housing_types ON applicant_matching_profiles USING GIN(housing_types_accepted);

-- Composite indexes
CREATE INDEX idx_applicant_location_budget ON applicant_matching_profiles(primary_city, primary_state, budget_min, budget_max);
CREATE INDEX idx_applicant_recovery_compatibility ON applicant_matching_profiles(recovery_stage, spiritual_affiliation, substance_free_home_required);

-- ============================================================================
-- LANDLORD PROFILES INDEXES
-- ============================================================================

CREATE INDEX idx_landlord_service_location ON landlord_profiles(primary_service_city, primary_service_state);
CREATE INDEX idx_landlord_active_accepting ON landlord_profiles(is_active, currently_accepting_tenants) WHERE is_active = TRUE AND currently_accepting_tenants = TRUE;
CREATE INDEX idx_landlord_service_areas ON landlord_profiles USING GIN(service_areas);
CREATE INDEX idx_landlord_recovery_methods ON landlord_profiles USING GIN(supported_recovery_methods);

-- ============================================================================
-- PROPERTIES INDEXES
-- ============================================================================

CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_properties_location ON properties(city, state);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_recovery_housing ON properties(is_recovery_housing);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_accepting ON properties(accepting_applications) WHERE accepting_applications = TRUE;
CREATE INDEX idx_properties_rent_range ON properties(monthly_rent);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_available_beds ON properties(available_beds) WHERE available_beds > 0;
CREATE INDEX idx_properties_available_date ON properties(available_date);

-- Property search optimization
CREATE INDEX idx_properties_search ON properties(city, state, status, is_recovery_housing, monthly_rent);
CREATE INDEX idx_properties_recovery_search ON properties(is_recovery_housing, city, state, status) WHERE is_recovery_housing = TRUE;
CREATE INDEX idx_properties_general_search ON properties(is_recovery_housing, city, state, status) WHERE is_recovery_housing = FALSE;

-- Array field indexes for properties
CREATE INDEX idx_properties_amenities ON properties USING GIN(amenities);
CREATE INDEX idx_properties_utilities ON properties USING GIN(utilities_included);
CREATE INDEX idx_properties_subsidies ON properties USING GIN(accepted_subsidies);
CREATE INDEX idx_properties_required_programs ON properties USING GIN(required_programs) WHERE is_recovery_housing = TRUE;
CREATE INDEX idx_properties_house_rules ON properties USING GIN(house_rules) WHERE is_recovery_housing = TRUE;

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
-- RELATIONSHIP TABLES INDEXES
-- ============================================================================

CREATE INDEX idx_housing_matches_applicant ON housing_matches(applicant_id);
CREATE INDEX idx_housing_matches_property ON housing_matches(property_id);
CREATE INDEX idx_housing_matches_status ON housing_matches(status);

CREATE INDEX idx_employment_matches_applicant ON employment_matches(applicant_id);
CREATE INDEX idx_employment_matches_employer ON employment_matches(employer_id);

CREATE INDEX idx_peer_matches_applicant ON peer_support_matches(applicant_id);
CREATE INDEX idx_peer_matches_peer ON peer_support_matches(peer_support_id);

CREATE INDEX idx_match_groups_applicant_1 ON match_groups(applicant_1_id);
CREATE INDEX idx_match_groups_applicant_2 ON match_groups(applicant_2_id);
CREATE INDEX idx_match_groups_property ON match_groups(property_id);
CREATE INDEX idx_match_groups_peer_support ON match_groups(peer_support_id);
CREATE INDEX idx_match_groups_status ON match_groups(status);

CREATE INDEX idx_match_requests_requester ON match_requests(requester_type, requester_id);
CREATE INDEX idx_match_requests_recipient ON match_requests(recipient_type, recipient_id);
CREATE INDEX idx_match_requests_property ON match_requests(property_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_match_requests_type ON match_requests(request_type);

-- ============================================================================
-- FAVORITES AND COMMUNICATION INDEXES
-- ============================================================================

CREATE INDEX idx_favorites_user ON favorites(favoriting_user_id);
CREATE INDEX idx_favorites_profile ON favorites(favorited_profile_id);
CREATE INDEX idx_favorites_property ON favorites(favorited_property_id);
CREATE INDEX idx_favorites_type ON favorites(favorite_type);

CREATE INDEX idx_employer_favorites_user_id ON employer_favorites(user_id);
CREATE INDEX idx_employer_favorites_employer_user_id ON employer_favorites(employer_user_id);

CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_property ON applications(property_id);
CREATE INDEX idx_applications_employer ON applications(employer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(application_type);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_match_group ON messages(match_group_id);
CREATE INDEX idx_messages_property ON messages(property_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);

COMMIT;
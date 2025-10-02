-- src/schema/indexes/property_indexes.sql
-- ============================================================================
-- PROPERTY INDEXES - Properties and Landlord Profile Performance Optimization
-- ============================================================================
-- Indexes for properties table and landlord profiles to support efficient property search and matching
-- Dependencies: Requires properties and landlord_profiles tables from schemas/03_property_tables.sql
-- ============================================================================

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

-- Basic property identification and ownership
CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);

-- Location-based search
CREATE INDEX idx_properties_location ON properties(city, state);

-- Property classification and status
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_recovery_housing ON properties(is_recovery_housing);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_accepting ON properties(accepting_applications) WHERE accepting_applications = TRUE;

-- Financial and physical specifications
CREATE INDEX idx_properties_rent_range ON properties(monthly_rent);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_available_beds ON properties(available_beds) WHERE available_beds > 0;

-- Availability timing
CREATE INDEX idx_properties_available_date ON properties(available_date);

-- ============================================================================
-- PROPERTY SEARCH OPTIMIZATION INDEXES
-- ============================================================================

-- General property search (most common queries)
CREATE INDEX idx_properties_search ON properties(city, state, status, is_recovery_housing, monthly_rent);

-- Recovery housing specific search
CREATE INDEX idx_properties_recovery_search ON properties(is_recovery_housing, city, state, status) WHERE is_recovery_housing = TRUE;

-- General rental search
CREATE INDEX idx_properties_general_search ON properties(is_recovery_housing, city, state, status) WHERE is_recovery_housing = FALSE;

-- ============================================================================
-- PROPERTY ARRAY FIELD INDEXES
-- ============================================================================

-- General property features
CREATE INDEX idx_properties_amenities ON properties USING GIN(amenities);
CREATE INDEX idx_properties_utilities ON properties USING GIN(utilities_included);
CREATE INDEX idx_properties_subsidies ON properties USING GIN(accepted_subsidies);

-- Recovery housing specific features
CREATE INDEX idx_properties_required_programs ON properties USING GIN(required_programs) WHERE is_recovery_housing = TRUE;
CREATE INDEX idx_properties_house_rules ON properties USING GIN(house_rules) WHERE is_recovery_housing = TRUE;
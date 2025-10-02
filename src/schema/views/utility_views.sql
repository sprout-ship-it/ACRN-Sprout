-- src/schema/views/utility_views.sql
-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================
-- Convenience views for common data joins and aggregations
-- Dependencies: Requires employer_favorites, employer_profiles, and registrant_profiles tables
-- ============================================================================

-- ============================================================================
-- EMPLOYER FAVORITES WITH DETAILS VIEW
-- ============================================================================

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
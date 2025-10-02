-- src/schema/setup/reset.sql
-- ============================================================================
-- DATABASE RESET SCRIPT
-- ============================================================================
-- Complete database cleanup - removes all tables, functions, triggers, and policies
-- WARNING: This is destructive and will delete all data (preserves Supabase auth.users)
-- Use this for development environment resets or clean reinstalls
-- ============================================================================

-- ============================================================================
-- SAFETY WARNING
-- ============================================================================
-- This script will completely destroy all data in the Recovery Housing Connect database.
-- Only run this in development environments or when you're certain you want to start fresh.
-- Supabase auth.users table will be preserved.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: DROP VIEWS
-- ============================================================================

DROP VIEW IF EXISTS employer_favorites_with_details CASCADE;

-- ============================================================================
-- STEP 2: DROP TABLES (Reverse dependency order)
-- ============================================================================

-- Relationship and matching tables (depend on profile tables)
DROP TABLE IF EXISTS housing_matches CASCADE;
DROP TABLE IF EXISTS employment_matches CASCADE;
DROP TABLE IF EXISTS peer_support_matches CASCADE;
DROP TABLE IF EXISTS match_groups CASCADE;
DROP TABLE IF EXISTS match_requests CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS employer_favorites CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- Property tables (depend on landlord profiles)
DROP TABLE IF EXISTS properties CASCADE;

-- Profile tables (depend on registrant profiles)
DROP TABLE IF EXISTS applicant_matching_profiles CASCADE;
DROP TABLE IF EXISTS landlord_profiles CASCADE;
DROP TABLE IF EXISTS employer_profiles CASCADE;
DROP TABLE IF EXISTS peer_support_profiles CASCADE;

-- Core tables
DROP TABLE IF EXISTS registrant_profiles CASCADE;

-- ============================================================================
-- STEP 3: DROP FUNCTIONS
-- ============================================================================

-- Profile completion functions
DROP FUNCTION IF EXISTS calculate_applicant_profile_completion() CASCADE;
DROP FUNCTION IF EXISTS calculate_property_completion() CASCADE;

-- User management functions
DROP FUNCTION IF EXISTS create_registrant_profile() CASCADE;
DROP FUNCTION IF EXISTS can_view_applicant_profile(UUID) CASCADE;

-- Utility functions
DROP FUNCTION IF EXISTS update_timestamp() CASCADE;

-- ============================================================================
-- STEP 4: DROP EXTENSIONS (if they were created)
-- ============================================================================

-- Note: Extensions are typically managed at the database level
-- and may need to be preserved for other applications
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- ============================================================================
-- STEP 5: CLEANUP ORPHANED SEQUENCES
-- ============================================================================

-- Drop any sequences that might not have been cleaned up
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    FOR seq_name IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public' 
        AND sequence_name LIKE '%recovery%' 
        OR sequence_name LIKE '%registrant%'
        OR sequence_name LIKE '%applicant%'
        OR sequence_name LIKE '%landlord%'
        OR sequence_name LIKE '%employer%'
        OR sequence_name LIKE '%peer%'
        OR sequence_name LIKE '%property%'
        OR sequence_name LIKE '%match%'
        OR sequence_name LIKE '%favorite%'
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || seq_name || ' CASCADE';
    END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- RESET COMPLETE
-- ============================================================================
-- The Recovery Housing Connect database has been completely reset.
-- 
-- Next steps:
-- 1. Verify cleanup: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 2. Check functions: SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
-- 3. Run install.sql to recreate the schema
-- 4. Run seed_data.sql for development data (optional)
-- ============================================================================
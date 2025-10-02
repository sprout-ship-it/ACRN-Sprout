-- src/schema/setup/install.sql
-- ============================================================================
-- MASTER INSTALLATION SCRIPT
-- ============================================================================
-- Complete database setup by running all components in the correct order
-- This script installs the entire Recovery Housing Connect database schema
-- ============================================================================

-- ============================================================================
-- INSTALLATION ORDER & DEPENDENCIES
-- ============================================================================
-- 1. Core tables (registrant_profiles)
-- 2. Profile tables (applicant, landlord, employer, peer support)
-- 3. Property tables (properties)
-- 4. Matching tables (matches, requests, favorites)
-- 5. Communication tables
-- 6. Utility tables
-- 7. Functions (user management, profile completion, utilities)
-- 8. Triggers (timestamps, profile triggers)
-- 9. Indexes (performance optimization)
-- 10. Views (convenience views)
-- 11. Policies (row level security)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: CREATE TABLES
-- ============================================================================

-- Core system tables
\i ../schemas/01_core_tables.sql

-- Profile tables
\i ../schemas/02_profile_tables.sql

-- Property tables  
\i ../schemas/03_property_tables.sql

-- Matching system tables
\i ../schemas/04_matching_tables.sql

-- Communication tables
\i ../schemas/05_communication_tables.sql

-- Utility tables
\i ../schemas/06_utility_tables.sql

-- ============================================================================
-- STEP 2: CREATE FUNCTIONS
-- ============================================================================

-- User management functions
\i ../functions/user_management.sql

-- Profile completion functions
\i ../functions/profile_completion.sql

-- Utility functions
\i ../functions/utility_functions.sql

-- ============================================================================
-- STEP 3: CREATE TRIGGERS
-- ============================================================================

-- Timestamp triggers
\i ../triggers/timestamp_triggers.sql

-- Profile-specific triggers
\i ../triggers/profile_triggers.sql

-- ============================================================================
-- STEP 4: CREATE INDEXES
-- ============================================================================

-- Core indexes
\i ../indexes/core_indexes.sql

-- Profile indexes
\i ../indexes/profile_indexes.sql

-- Property indexes
\i ../indexes/property_indexes.sql

-- Matching system indexes
\i ../indexes/matching_indexes.sql

-- ============================================================================
-- STEP 5: CREATE VIEWS
-- ============================================================================

-- Utility views
\i ../views/utility_views.sql

-- ============================================================================
-- STEP 6: APPLY SECURITY POLICIES
-- ============================================================================

-- Row level security policies
\i ../policies/user_policies.sql
\i ../policies/profile_policies.sql
\i ../policies/property_policies.sql
\i ../policies/matching_policies.sql

-- ============================================================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions for Supabase auth integration
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, anon, authenticated, service_role;

-- Grant necessary permissions for all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;

-- ============================================================================
-- INSTALLATION COMPLETE
-- ============================================================================
-- The Recovery Housing Connect database schema has been successfully installed.
-- 
-- Next steps:
-- 1. Verify all tables were created: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 2. Check RLS policies: SELECT * FROM pg_policies;
-- 3. Verify indexes: SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
-- 4. Test user registration and profile creation
-- 5. Run seed_data.sql for development data (optional)
-- ============================================================================
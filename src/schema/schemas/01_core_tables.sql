-- src/schema/schemas/01_core_tables.sql
-- Dependencies: auth.users (Supabase Auth)
-- Description: Core foundational tables - registrant_profiles as central hub

-- ============================================================================
-- REGISTRANT PROFILES (Central Hub for Role Selection)
-- ============================================================================
-- Purpose: Role selection & multi-role dashboard routing
-- References: auth.users.id (Supabase Auth)
-- Referenced by: All role-specific profile tables
-- ============================================================================

CREATE TABLE registrant_profiles (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ============================================================================
  -- BASIC PROFILE INFORMATION
  -- ============================================================================
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- ============================================================================
  -- MULTI-ROLE SYSTEM
  -- ============================================================================
  roles TEXT[] NOT NULL DEFAULT '{}',
  
  -- ============================================================================
  -- STATUS & METADATA
  -- ============================================================================
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT valid_roles CHECK (
    roles <@ ARRAY['applicant', 'landlord', 'employer', 'peer-support']::TEXT[]
    AND array_length(roles, 1) > 0
  )
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE registrant_profiles IS 'Central hub table for user registration and role management. All role-specific profiles reference this table.';
COMMENT ON COLUMN registrant_profiles.user_id IS 'References auth.users.id from Supabase Auth system';
COMMENT ON COLUMN registrant_profiles.roles IS 'Array of user roles: applicant, landlord, employer, peer-support. Users can have multiple roles.';
COMMENT ON COLUMN registrant_profiles.id IS 'Primary key referenced by all role-specific profile tables (user_id column in those tables)';

-- ============================================================================
-- ARCHITECTURE FLOW DOCUMENTATION
-- ============================================================================

/*
CENTRAL HUB ARCHITECTURE:
auth.users.id → registrant_profiles.user_id → registrant_profiles.id → role_profiles.user_id

ROLE PROFILE REFERENCES:
- applicant_matching_profiles.user_id → registrant_profiles.id
- landlord_profiles.user_id → registrant_profiles.id  
- employer_profiles.user_id → registrant_profiles.id
- peer_support_profiles.user_id → registrant_profiles.id

MULTI-ROLE SUPPORT:
- Users can have multiple roles in the roles array
- Each role requires a separate profile table entry
- Dashboard routing based on available roles
- Cross-role functionality enabled through central hub

SECURITY MODEL:
- RLS policies use this table as the bridge between auth.uid() and profile access
- Non-recursive pattern: user_id IN (SELECT rp.id FROM registrant_profiles rp WHERE rp.user_id = auth.uid())
*/
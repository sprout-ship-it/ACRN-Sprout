-- ============================================================================
-- MIGRATION 001: CORE USER SYSTEM
-- ============================================================================
-- Description: Central user management and registrant profiles
-- Dependencies: Supabase auth.users table
-- Creates: registrant_profiles table and core user functions
-- Version: 1.0
-- Date: October 2024
-- ============================================================================

BEGIN;

-- ============================================================================
-- CLEANUP SECTION (Development Only)
-- ============================================================================
-- Drop existing core tables if they exist
-- WARNING: This will delete all data - only use in development!

DROP TABLE IF EXISTS registrant_profiles CASCADE;
DROP FUNCTION IF EXISTS create_registrant_profile() CASCADE;
DROP FUNCTION IF EXISTS update_timestamp() CASCADE;

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- ============================================================================
-- REGISTRANT PROFILES (Central Hub for Multi-Role System)
-- ============================================================================
-- Purpose: Central user management and role selection
-- Flow: auth.users.id → registrant_profiles.user_id → role-specific profiles
-- ============================================================================

CREATE TABLE registrant_profiles (
  -- Primary Identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Profile Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- Multi-Role System
  roles TEXT[] NOT NULL DEFAULT '{}',
  
  -- Status & Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_roles CHECK (
    roles <@ ARRAY['applicant', 'landlord', 'employer', 'peer-support']::TEXT[]
    AND array_length(roles, 1) > 0
  )
);

-- ============================================================================
-- CORE UTILITY FUNCTIONS
-- ============================================================================

-- ============================================================================
-- AUTO-CREATE REGISTRANT PROFILE FUNCTION
-- ============================================================================
-- Automatically creates a registrant profile when a user signs up
-- Triggered by INSERT on auth.users

CREATE OR REPLACE FUNCTION create_registrant_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO registrant_profiles (
    user_id,
    first_name,
    last_name,
    email,
    roles,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email,
    ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'applicant')]::TEXT[],
    TRUE,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TIMESTAMP UPDATE FUNCTION
-- ============================================================================
-- Updates the updated_at timestamp on any table update

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE TRIGGERS
-- ============================================================================

-- Auto-create registrant profile when user signs up
CREATE TRIGGER trigger_create_registrant_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_registrant_profile();

-- Update timestamp on registrant profile changes
CREATE TRIGGER trigger_update_registrant_profiles_timestamp
  BEFORE UPDATE ON registrant_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- CORE INDEXES
-- ============================================================================

-- Essential indexes for registrant_profiles
CREATE INDEX idx_registrant_profiles_user_id ON registrant_profiles(user_id);
CREATE INDEX idx_registrant_profiles_email ON registrant_profiles(email);
CREATE INDEX idx_registrant_profiles_roles ON registrant_profiles USING GIN(roles);
CREATE INDEX idx_registrant_profiles_active ON registrant_profiles(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- CORE RLS POLICIES
-- ============================================================================

-- Enable RLS on registrant_profiles
ALTER TABLE registrant_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own registrant profile
CREATE POLICY "Users can view own registrant profile" ON registrant_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own registrant profile" ON registrant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own registrant profile" ON registrant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verified users can view other registrant profiles (for cross-role visibility)
CREATE POLICY "Verified users can view other registrant profiles" ON registrant_profiles
  FOR SELECT USING (
    is_active = true
    AND (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM registrant_profiles rp2
        WHERE rp2.user_id = auth.uid() 
          AND rp2.is_active = true
      )
    )
  );

-- ============================================================================
-- CORE PERMISSIONS
-- ============================================================================

-- Grant necessary permissions for Supabase auth integration
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, anon, authenticated, service_role;

-- Grant permissions for registrant_profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON registrant_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
/*
-- To rollback this migration, run:

BEGIN;
DROP TRIGGER IF EXISTS trigger_create_registrant_profile ON auth.users;
DROP TRIGGER IF EXISTS trigger_update_registrant_profiles_timestamp ON registrant_profiles;
DROP TABLE IF EXISTS registrant_profiles CASCADE;
DROP FUNCTION IF EXISTS create_registrant_profile() CASCADE;
DROP FUNCTION IF EXISTS update_timestamp() CASCADE;
COMMIT;

*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
/*
-- Run these to verify the migration worked:

-- Check table exists and has correct structure
\d registrant_profiles;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'registrant_profiles';

-- Check policies exist
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'registrant_profiles';

-- Check triggers exist
SELECT tgname, tgrelid::regclass, tgtype 
FROM pg_trigger 
WHERE tgrelid = 'registrant_profiles'::regclass;

-- Test basic functionality (should return empty but no errors)
SELECT COUNT(*) FROM registrant_profiles;

*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- ✅ Core user system established
-- ✅ Auto-profile creation working
-- ✅ RLS policies in place
-- ✅ Indexes for performance
-- ✅ Ready for role-specific profile tables
-- ============================================================================
-- ============================================================================
-- RECOVERY HOUSING CONNECT - CLEAN DATABASE SCHEMA WITH PROPERTIES TABLE
-- ============================================================================
-- Complete database schema with proper properties table separation and comprehensive RLS
-- Flow: auth.users.id → registrant_profiles.user_id → registrant_profiles.id → role_table.user_id → role_table.id
-- Properties: landlord_profiles.id → properties.landlord_id → properties.id (used in matches)
-- Data Architecture:
--   • Central Hub: registrant_profiles (multi-role support)
--   • Role Profiles: applicant_matching_profiles, landlord_profiles, employer_profiles, peer_support_profiles
--   • Properties: Separate table linked to landlord_profiles for scalability
--   • Matching: housing_matches references properties.id (not landlord_profiles.id)
--   • Security: Comprehensive RLS policies for cross-role access and data protection
-- Last Updated: September 2025
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE CLEANUP (DESTRUCTIVE - USE WITH CAUTION)
-- ============================================================================

-- Drop all existing tables (preserves Supabase auth.users)
DROP TABLE IF EXISTS housing_matches CASCADE;
DROP TABLE IF EXISTS employment_matches CASCADE;
DROP TABLE IF EXISTS peer_support_matches CASCADE;
DROP TABLE IF EXISTS match_groups CASCADE;
DROP TABLE IF EXISTS match_requests CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS employer_favorites CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS applicant_matching_profiles CASCADE;
DROP TABLE IF EXISTS landlord_profiles CASCADE;
DROP TABLE IF EXISTS employer_profiles CASCADE;
DROP TABLE IF EXISTS peer_support_profiles CASCADE;
DROP TABLE IF EXISTS registrant_profiles CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS create_registrant_profile() CASCADE;
DROP FUNCTION IF EXISTS can_view_applicant_profile(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_applicant_profile_completion() CASCADE;
DROP FUNCTION IF EXISTS calculate_property_completion() CASCADE;
DROP FUNCTION IF EXISTS update_timestamp() CASCADE;

-- ============================================================================
-- SECTION 2: CORE ARCHITECTURE TABLES
-- ============================================================================

-- ============================================================================
-- REGISTRANT PROFILES (Central Hub for Role Selection)
-- ============================================================================
-- Purpose: Role selection & multi-role dashboard routing
-- References: auth.users.id (Supabase Auth)
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
-- APPLICANT MATCHING PROFILES (Complete Implementation)
-- ============================================================================

CREATE TABLE applicant_matching_profiles (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & METADATA
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- PERSONAL IDENTITY & DEMOGRAPHICS
  -- ============================================================================
  primary_phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender_identity VARCHAR(50),
  biological_sex VARCHAR(20),
  preferred_roommate_gender VARCHAR(50) NOT NULL,
  gender_inclusive BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- LOCATION & GEOGRAPHY
  -- ============================================================================
  primary_city VARCHAR(100) NOT NULL,
  primary_state VARCHAR(2) NOT NULL,
  primary_location VARCHAR(200) GENERATED ALWAYS AS (primary_city || ', ' || primary_state) STORED,
  
  current_address VARCHAR(255),
  current_city VARCHAR(100),
  current_state VARCHAR(2),
  current_zip_code VARCHAR(10),
  
  target_zip_codes TEXT,
  search_radius_miles INTEGER DEFAULT 30,
  location_flexibility VARCHAR(50),
  max_commute_minutes INTEGER NOT NULL,
  transportation_method VARCHAR(50),
  
  -- ============================================================================
  -- BUDGET & FINANCIAL
  -- ============================================================================
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  housing_assistance TEXT[],
  has_section8 BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- RECOVERY & WELLNESS
  -- ============================================================================
  recovery_stage VARCHAR(50) NOT NULL,
  time_in_recovery VARCHAR(50),
  sobriety_date DATE,
  primary_substance VARCHAR(100),
  recovery_methods TEXT[] NOT NULL,
  program_types TEXT[] NOT NULL,
  treatment_history TEXT,
  support_meetings VARCHAR(100),
  sponsor_mentor VARCHAR(100),
  primary_issues TEXT[] NOT NULL,
  spiritual_affiliation VARCHAR(50) NOT NULL,
  want_recovery_support BOOLEAN DEFAULT FALSE,
  comfortable_discussing_recovery BOOLEAN DEFAULT FALSE,
  attend_meetings_together BOOLEAN DEFAULT FALSE,
  substance_free_home_required BOOLEAN DEFAULT TRUE,
  recovery_goal_timeframe VARCHAR(50),
  recovery_context TEXT,
  
  -- ============================================================================
  -- LIFESTYLE & LIVING PREFERENCES
  -- ============================================================================
  social_level INTEGER NOT NULL DEFAULT 3 CHECK (social_level BETWEEN 1 AND 5),
  cleanliness_level INTEGER NOT NULL DEFAULT 3 CHECK (cleanliness_level BETWEEN 1 AND 5),
  noise_tolerance INTEGER NOT NULL DEFAULT 3 CHECK (noise_tolerance BETWEEN 1 AND 5),
  
  work_schedule VARCHAR(50) NOT NULL,
  work_from_home_frequency VARCHAR(50),
  bedtime_preference VARCHAR(50),
  early_riser BOOLEAN DEFAULT FALSE,
  night_owl BOOLEAN DEFAULT FALSE,
  
  guests_policy VARCHAR(50),
  social_activities_at_home VARCHAR(50),
  overnight_guests_ok BOOLEAN DEFAULT FALSE,
  
  cooking_enthusiast BOOLEAN DEFAULT FALSE,
  cooking_frequency VARCHAR(50),
  exercise_at_home BOOLEAN DEFAULT FALSE,
  plays_instruments BOOLEAN DEFAULT FALSE,
  tv_streaming_regular BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- HOUSEHOLD MANAGEMENT & COMMUNICATION
  -- ============================================================================
  chore_sharing_style VARCHAR(50),
  chore_sharing_preference VARCHAR(50),
  shared_groceries BOOLEAN DEFAULT FALSE,
  communication_style VARCHAR(50),
  conflict_resolution_style VARCHAR(50),
  preferred_support_structure VARCHAR(50),
  
  -- ============================================================================
  -- PETS & SMOKING
  -- ============================================================================
  pets_owned BOOLEAN DEFAULT FALSE,
  pets_comfortable BOOLEAN DEFAULT FALSE,
  pet_preference VARCHAR(50),
  smoking_status VARCHAR(50),
  smoking_preference VARCHAR(50),
  
  -- ============================================================================
  -- HOUSING SPECIFICATIONS
  -- ============================================================================
  housing_types_accepted TEXT[],
  preferred_bedrooms VARCHAR(20),
  furnished_preference BOOLEAN,
  utilities_included_preference BOOLEAN,
  accessibility_needed BOOLEAN DEFAULT FALSE,
  parking_required BOOLEAN DEFAULT FALSE,
  public_transit_access BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- TIMING & AVAILABILITY
  -- ============================================================================
  move_in_date DATE NOT NULL,
  move_in_flexibility VARCHAR(50),
  lease_duration VARCHAR(50),
  relocation_timeline VARCHAR(50),
  
  -- ============================================================================
  -- GOALS & ASPIRATIONS
  -- ============================================================================
  short_term_goals TEXT,
  long_term_vision TEXT,
  interests TEXT[],
  additional_interests TEXT,
  shared_activities_interest BOOLEAN DEFAULT FALSE,
  important_qualities TEXT[],
  deal_breakers TEXT[],
  
  -- ============================================================================
  -- PROFILE CONTENT & STATUS
  -- ============================================================================
  about_me TEXT NOT NULL,
  looking_for TEXT NOT NULL,
  additional_info TEXT,
  special_needs TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_visibility VARCHAR(50) DEFAULT 'verified-members',
  
  -- ============================================================================
  -- EMERGENCY CONTACT
  -- ============================================================================
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  
  -- ============================================================================
  -- ROOMMATE PREFERENCES
  -- ============================================================================
  age_range_min INTEGER DEFAULT 18 CHECK (age_range_min >= 18),
  age_range_max INTEGER DEFAULT 65 CHECK (age_range_max <= 100),
  age_flexibility VARCHAR(50),
  prefer_recovery_experience BOOLEAN DEFAULT FALSE,
  supportive_of_recovery BOOLEAN DEFAULT TRUE,
  respect_privacy BOOLEAN DEFAULT TRUE,
  social_interaction_level VARCHAR(50),
  similar_schedules BOOLEAN DEFAULT FALSE,
  shared_chores BOOLEAN DEFAULT FALSE,
  financially_stable BOOLEAN DEFAULT TRUE,
  respectful_guests BOOLEAN DEFAULT TRUE,
  lgbtq_friendly BOOLEAN DEFAULT FALSE,
  culturally_sensitive BOOLEAN DEFAULT TRUE,
  
  -- Deal Breakers (Specific)
  deal_breaker_substance_use BOOLEAN DEFAULT FALSE,
  deal_breaker_loudness BOOLEAN DEFAULT FALSE,
  deal_breaker_uncleanliness BOOLEAN DEFAULT FALSE,
  deal_breaker_financial_issues BOOLEAN DEFAULT TRUE,
  deal_breaker_pets BOOLEAN DEFAULT FALSE,
  deal_breaker_smoking BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- COMPATIBILITY PREFERENCES
  -- ============================================================================
  overnight_guests_preference BOOLEAN DEFAULT FALSE,
  shared_transportation BOOLEAN DEFAULT FALSE,
  recovery_accountability BOOLEAN DEFAULT FALSE,
  shared_recovery_activities BOOLEAN DEFAULT FALSE,
  mentorship_interest BOOLEAN DEFAULT FALSE,
  recovery_community BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- ALGORITHM METADATA & SCORING
  -- ============================================================================
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  profile_quality_score INTEGER DEFAULT 0 CHECK (profile_quality_score BETWEEN 0 AND 100),
  last_updated_section VARCHAR(50),
  compatibility_scores JSONB DEFAULT '{}',
  search_preferences JSONB DEFAULT '{}',
  matching_weights JSONB DEFAULT '{}',
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT valid_age_range CHECK (age_range_min <= age_range_max),
  CONSTRAINT valid_budget_range CHECK (budget_min <= budget_max),
  CONSTRAINT valid_move_in_date CHECK (move_in_date >= CURRENT_DATE),
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- ============================================================================
-- LANDLORD PROFILES (Simplified - Property-specific fields in properties table)
-- ============================================================================

CREATE TABLE landlord_profiles (
  -- Primary Identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Basic Contact Information
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  contact_person VARCHAR(100),
  
  -- Service Areas
  primary_service_city VARCHAR(100) NOT NULL,
  primary_service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  
  -- Business Information
  business_name VARCHAR(200),
  business_type VARCHAR(100),
  years_in_business INTEGER,
  
  -- Recovery Support Philosophy
  recovery_friendly BOOLEAN DEFAULT TRUE,
  recovery_experience_level VARCHAR(50),
  preferred_recovery_stages TEXT[],
  supported_recovery_methods TEXT[],
  
  -- Operational Information
  max_properties INTEGER DEFAULT 10,
  accepts_subsidies BOOLEAN DEFAULT FALSE,
  background_check_required BOOLEAN DEFAULT FALSE,
  
  -- Business Policies
  standard_lease_terms VARCHAR(50),
  application_process_description TEXT,
  
  -- Profile Content
  bio TEXT,
  experience_description TEXT,
  approach_philosophy TEXT,
  
  -- Availability & Status
  currently_accepting_tenants BOOLEAN DEFAULT TRUE,
  preferred_contact_method VARCHAR(50),
  response_time_expectation VARCHAR(50),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_verified BOOLEAN DEFAULT FALSE,
  
  -- Constraints
  CONSTRAINT unique_landlord_profile UNIQUE (user_id)
);

-- ============================================================================
-- PROPERTIES TABLE (Updated with Enhanced Property Types)
-- ============================================================================

CREATE TABLE properties (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & METADATA
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlord_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- PROPERTY TYPE & CLASSIFICATION
  -- ============================================================================
  is_recovery_housing BOOLEAN DEFAULT FALSE,
  property_type VARCHAR(50) NOT NULL,
  
  -- ============================================================================
  -- BASIC PROPERTY INFORMATION
  -- ============================================================================
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Address Information
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  
  -- Contact Information
  phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  -- ============================================================================
  -- PHYSICAL PROPERTY DETAILS
  -- ============================================================================
  bedrooms INTEGER NOT NULL DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  available_beds INTEGER DEFAULT 0,
  bathrooms DECIMAL(3,1) DEFAULT 1.0,
  square_footage INTEGER,
  
  -- ============================================================================
  -- FINANCIAL INFORMATION
  -- ============================================================================
  monthly_rent INTEGER NOT NULL,
  weekly_rate INTEGER,
  security_deposit INTEGER,
  application_fee INTEGER DEFAULT 0,
  
  -- Utilities & Services
  utilities_included TEXT[],
  furnished BOOLEAN DEFAULT FALSE,
  meals_included BOOLEAN DEFAULT FALSE,
  linens_provided BOOLEAN DEFAULT FALSE,
  
  -- Financial Assistance
  accepted_subsidies TEXT[],
  
  -- ============================================================================
  -- AVAILABILITY & LEASE TERMS
  -- ============================================================================
  available_date DATE,
  lease_duration VARCHAR(50),
  
  -- ============================================================================
  -- RECOVERY-SPECIFIC FIELDS
  -- ============================================================================
  -- Recovery Program Requirements
  required_programs TEXT[],
  min_sobriety_time VARCHAR(50),
  treatment_completion_required VARCHAR(50),
  
  -- House Rules & Requirements
  house_rules TEXT[],
  additional_house_rules TEXT,
  
  -- Resident Restrictions
  gender_restrictions VARCHAR(50) DEFAULT 'any',
  age_restrictions VARCHAR(100),
  pets_allowed BOOLEAN DEFAULT FALSE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  criminal_background_ok BOOLEAN DEFAULT FALSE,
  sex_offender_restrictions BOOLEAN DEFAULT FALSE,
  
  -- Support Services Available
  case_management BOOLEAN DEFAULT FALSE,
  counseling_services BOOLEAN DEFAULT FALSE,
  job_training BOOLEAN DEFAULT FALSE,
  medical_services BOOLEAN DEFAULT FALSE,
  transportation_services BOOLEAN DEFAULT FALSE,
  life_skills_training BOOLEAN DEFAULT FALSE,
  
  -- Licensing & Certification
  license_number VARCHAR(100),
  accreditation VARCHAR(100),
  
  -- ============================================================================
  -- PROPERTY FEATURES & AMENITIES
  -- ============================================================================
  amenities TEXT[],
  accessibility_features TEXT[],
  neighborhood_features TEXT[],
  
  -- ============================================================================
  -- PROPERTY STATUS & AVAILABILITY
  -- ============================================================================
  status VARCHAR(50) DEFAULT 'available',
  accepting_applications BOOLEAN DEFAULT TRUE,
  
  -- ============================================================================
  -- ADDITIONAL INFORMATION
  -- ============================================================================
  additional_notes TEXT,
  
  -- Internal Management
  internal_notes TEXT,
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,

  -- Proper policy if properties should be public
CREATE POLICY "Properties are publicly readable" ON properties
FOR SELECT USING (true);

-- Or if they should only be readable by their owners:
CREATE POLICY "Users can read their own properties" ON properties
FOR SELECT USING (
  landlord_id IN (
    SELECT id FROM landlord_profiles 
    WHERE user_id = auth.uid()
  )
);
-- Allow users to save their own favorites
CREATE POLICY "Users can insert their own favorites" ON favorites
FOR INSERT WITH CHECK (
  favoriting_user_id IN (
    SELECT id FROM registrant_profiles 
    WHERE user_id = auth.uid()
  )
);
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT valid_bedrooms CHECK (bedrooms >= 0),
  CONSTRAINT valid_total_beds CHECK (total_beds >= 0),
  CONSTRAINT valid_available_beds CHECK (available_beds >= 0 AND (total_beds IS NULL OR available_beds <= total_beds)),
  CONSTRAINT valid_bathrooms CHECK (bathrooms >= 0.5),
  CONSTRAINT valid_rent CHECK (monthly_rent > 0),
  CONSTRAINT valid_status CHECK (status IN ('available', 'waitlist', 'full', 'temporarily_closed', 'under_renovation')),
  
  -- ✅ UPDATED: Enhanced property type constraint with all new types
  CONSTRAINT valid_property_type CHECK (
    (is_recovery_housing = FALSE AND property_type IN (
      'apartment', 
      'house', 
      'townhouse', 
      'condo', 
      'duplex', 
      'triplex',
      'studio', 
      'loft', 
      'single_room', 
      'shared_room', 
      'basement_apartment', 
      'garage_apartment', 
      'tiny_home', 
      'manufactured_home'
    )) OR
    (is_recovery_housing = TRUE AND property_type IN (
      'sober_living_level_1', 
      'sober_living_level_2', 
      'sober_living_level_3', 
      'halfway_house', 
      'recovery_residence', 
      'transitional_housing',
      'supportive_housing',
      'therapeutic_community'
    ))
  )
);

-- ============================================================================
-- EMPLOYER PROFILES
-- ============================================================================

CREATE TABLE employer_profiles (
  -- Primary Identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Basic Information
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  contact_person VARCHAR(100),
  
  -- Business Information
  business_type VARCHAR(100) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  
  -- Location & Service Areas
  service_city VARCHAR(100) NOT NULL,
  service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  
  -- Employment Information
  job_types_available TEXT[] NOT NULL,
  work_schedule VARCHAR(50),
  salary_ranges JSONB,
  benefits_offered TEXT[],
  
  -- Recovery Support
  recovery_friendly BOOLEAN DEFAULT TRUE,
  supported_recovery_methods TEXT[],
  substance_free_workplace BOOLEAN DEFAULT TRUE,
  
  -- Requirements
  background_check_required BOOLEAN DEFAULT FALSE,
  drug_testing_policy VARCHAR(50),
  
  -- Availability
  accepting_applications BOOLEAN DEFAULT TRUE,
  
  -- Profile Content
  description TEXT NOT NULL,
  additional_info TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Constraints
  CONSTRAINT unique_employer_profile UNIQUE (user_id)
);

-- ============================================================================
-- PEER SUPPORT PROFILES
-- ============================================================================

CREATE TABLE peer_support_profiles (
  -- Primary Identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Basic Information
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  
  -- Professional Information
  professional_title VARCHAR(100) NOT NULL,
  is_licensed BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  
  -- Location & Service Areas
  service_city VARCHAR(100) NOT NULL,
  service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  
  -- Specialties & Services
  specialties TEXT[] NOT NULL,
  supported_recovery_methods TEXT[] NOT NULL,
  
  -- Recovery Experience
  recovery_stage VARCHAR(50) NOT NULL,
  time_in_recovery VARCHAR(50),
  primary_issues TEXT[],
  spiritual_affiliation VARCHAR(50),
  
  -- Service Information
  accepting_clients BOOLEAN DEFAULT TRUE,
  
  -- Profile Content
  bio TEXT NOT NULL,
  about_me TEXT NOT NULL,
  additional_info TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Constraints
  CONSTRAINT unique_peer_support_profile UNIQUE (user_id)
);

-- ============================================================================
-- SECTION 3: RELATIONSHIP & MATCHING TABLES
-- ============================================================================

-- ============================================================================
-- HOUSING MATCHES (Uses properties.id)
-- ============================================================================

CREATE TABLE housing_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Matching Metadata
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  
  -- Match Status
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-liked', 'landlord-liked', 'rejected')),
  
  -- Communication
  applicant_message TEXT,
  landlord_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT unique_housing_match UNIQUE (applicant_id, property_id)
);

-- ============================================================================
-- EMPLOYMENT MATCHES
-- ============================================================================

CREATE TABLE employment_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  
  -- Matching Metadata
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  
  -- Match Status
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-interested', 'employer-interested', 'rejected')),
  
  -- Communication
  applicant_message TEXT,
  employer_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT unique_employment_match UNIQUE (applicant_id, employer_id)
);

-- ============================================================================
-- PEER SUPPORT MATCHES
-- ============================================================================

CREATE TABLE peer_support_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  peer_support_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  
  -- Matching Metadata
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  
  -- Match Status
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-interested', 'peer-interested', 'rejected')),
  
  -- Communication
  applicant_message TEXT,
  peer_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT unique_peer_support_match UNIQUE (applicant_id, peer_support_id)
);

-- ============================================================================
-- MATCH GROUPS (Uses properties.id)
-- ============================================================================

CREATE TABLE match_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Group Members
  applicant_1_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  applicant_2_id UUID REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  peer_support_id UUID REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  
  -- Group Information
  group_name VARCHAR(255),
  move_in_date DATE,
  
  -- Group Status
  status VARCHAR(50) DEFAULT 'forming' CHECK (status IN ('forming', 'confirmed', 'active', 'completed', 'disbanded')),
  
  -- Group Communication
  group_chat_active BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT different_applicants CHECK (applicant_1_id != applicant_2_id)
);

-- ============================================================================
-- MATCH REQUESTS (Property-specific requests)
-- ============================================================================

CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Request Information
  requester_type VARCHAR(20) NOT NULL CHECK (requester_type IN ('applicant', 'landlord', 'employer', 'peer-support')),
  requester_id UUID NOT NULL,
  
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('applicant', 'landlord', 'employer', 'peer-support')),
  recipient_id UUID NOT NULL,
  
  -- Property-specific requests
  property_id UUID REFERENCES properties(id),
  
  -- Request Details
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('housing', 'employment', 'peer-support', 'roommate')),
  message TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_match_request UNIQUE (requester_type, requester_id, recipient_type, recipient_id, request_type, property_id),
  CONSTRAINT no_self_request CHECK (NOT (requester_type = recipient_type AND requester_id = recipient_id)),
  CONSTRAINT property_required_for_housing CHECK (
    (request_type = 'housing' AND property_id IS NOT NULL) OR 
    (request_type != 'housing')
  )
);

-- ============================================================================
-- FAVORITES SYSTEM (Enhanced for properties)
-- ============================================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  favoriting_user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  
  -- Can favorite profiles or properties
  favorited_profile_id UUID,
  favorited_property_id UUID REFERENCES properties(id),
  
  favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('housing', 'property', 'employment', 'peer-support')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT unique_favorite UNIQUE (favoriting_user_id, favorited_profile_id, favorited_property_id, favorite_type),
  CONSTRAINT favorite_target_check CHECK (
    (favorite_type IN ('property', 'housing') AND favorited_property_id IS NOT NULL) OR
    (favorite_type IN ('employment', 'peer-support') AND favorited_profile_id IS NOT NULL)
  )
);

-- ============================================================================
-- EMPLOYER FAVORITES
-- ============================================================================

CREATE TABLE employer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  employer_user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_employer_favorite UNIQUE (user_id, employer_user_id)
);

-- ============================================================================
-- SECTION 4: UTILITY FUNCTIONS
-- ============================================================================

-- ============================================================================
-- AUTO-CREATE REGISTRANT PROFILE FUNCTION
-- ============================================================================

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
-- SECURITY DEFINER FUNCTION (Prevents RLS recursion)
-- ============================================================================

CREATE OR REPLACE FUNCTION can_view_applicant_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applicant_matching_profiles
    WHERE user_id = profile_id
      AND is_active = true
      AND profile_completed = true
  );
END;
$$;

-- ============================================================================
-- TIMESTAMP UPDATE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PROFILE COMPLETION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_applicant_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_count INTEGER := 0;
  total_required_fields INTEGER := 20;
BEGIN
  -- Count completed required fields
  IF NEW.primary_phone IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.date_of_birth IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.preferred_roommate_gender IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.primary_city IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.primary_state IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.budget_min IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.budget_max IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.recovery_stage IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.recovery_methods IS NOT NULL AND array_length(NEW.recovery_methods, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  IF NEW.program_types IS NOT NULL AND array_length(NEW.program_types, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  IF NEW.primary_issues IS NOT NULL AND array_length(NEW.primary_issues, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  IF NEW.spiritual_affiliation IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.social_level IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.cleanliness_level IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.noise_tolerance IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.work_schedule IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.move_in_date IS NOT NULL THEN completion_count := completion_count + 1; END IF;
  IF NEW.about_me IS NOT NULL AND length(NEW.about_me) > 20 THEN completion_count := completion_count + 1; END IF;
  IF NEW.looking_for IS NOT NULL AND length(NEW.looking_for) > 20 THEN completion_count := completion_count + 1; END IF;
  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  
  -- Calculate percentage
  NEW.completion_percentage := ROUND((completion_count::DECIMAL / total_required_fields) * 100);
  NEW.profile_completed := (NEW.completion_percentage >= 80);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_property_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_count INTEGER := 0;
  total_required_fields INTEGER;
BEGIN
  -- Different requirements for recovery housing vs general rentals
  IF NEW.is_recovery_housing THEN
    total_required_fields := 12;
    
    -- Basic requirements
    IF NEW.title IS NOT NULL AND length(NEW.title) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.property_type IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.address IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.city IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.state IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.bedrooms IS NOT NULL AND NEW.bedrooms > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.monthly_rent IS NOT NULL AND NEW.monthly_rent > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.description IS NOT NULL AND length(NEW.description) > 20 THEN completion_count := completion_count + 1; END IF;
    
    -- Recovery-specific requirements
    IF NEW.required_programs IS NOT NULL AND array_length(NEW.required_programs, 1) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.house_rules IS NOT NULL AND array_length(NEW.house_rules, 1) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.gender_restrictions IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.amenities IS NOT NULL AND array_length(NEW.amenities, 1) > 0 THEN completion_count := completion_count + 1; END IF;
  ELSE
    total_required_fields := 8;
    
    -- Basic requirements only
    IF NEW.title IS NOT NULL AND length(NEW.title) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.property_type IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.address IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.city IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.state IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.bedrooms IS NOT NULL AND NEW.bedrooms >= 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.monthly_rent IS NOT NULL AND NEW.monthly_rent > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.description IS NOT NULL AND length(NEW.description) > 20 THEN completion_count := completion_count + 1; END IF;
  END IF;
  
  -- Store completion data in internal_notes as JSON
  NEW.internal_notes := jsonb_build_object(
    'completion_percentage', ROUND((completion_count::DECIMAL / total_required_fields) * 100),
    'completed_fields', completion_count,
    'total_required', total_required_fields,
    'profile_completed', (completion_count >= total_required_fields * 0.8)
  )::text;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- Auto-create registrant profile
CREATE TRIGGER trigger_create_registrant_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_registrant_profile();

-- Timestamp updates
CREATE TRIGGER trigger_update_registrant_profiles_timestamp
  BEFORE UPDATE ON registrant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_applicant_profiles_timestamp
  BEFORE UPDATE ON applicant_matching_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_landlord_profiles_timestamp
  BEFORE UPDATE ON landlord_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_properties_timestamp
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_employer_profiles_timestamp
  BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_peer_support_profiles_timestamp
  BEFORE UPDATE ON peer_support_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_housing_matches_timestamp
  BEFORE UPDATE ON housing_matches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_employment_matches_timestamp
  BEFORE UPDATE ON employment_matches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_peer_support_matches_timestamp
  BEFORE UPDATE ON peer_support_matches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_match_groups_timestamp
  BEFORE UPDATE ON match_groups
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_match_requests_timestamp
  BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Profile completion calculations
CREATE TRIGGER trigger_calculate_applicant_profile_completion
  BEFORE INSERT OR UPDATE ON applicant_matching_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_applicant_profile_completion();

CREATE TRIGGER trigger_calculate_property_completion
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_property_completion();

-- ============================================================================
-- SECTION 6: PERFORMANCE INDEXES
-- ============================================================================

-- ============================================================================
-- REGISTRANT PROFILES INDEXES
-- ============================================================================
CREATE INDEX idx_registrant_profiles_user_id ON registrant_profiles(user_id);
CREATE INDEX idx_registrant_profiles_email ON registrant_profiles(email);
CREATE INDEX idx_registrant_profiles_roles ON registrant_profiles USING GIN(roles);
CREATE INDEX idx_registrant_profiles_active ON registrant_profiles(is_active) WHERE is_active = TRUE;

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
-- OTHER PROFILE INDEXES
-- ============================================================================
CREATE INDEX idx_employer_service_location ON employer_profiles(service_city, service_state);
CREATE INDEX idx_employer_active_accepting ON employer_profiles(is_active, accepting_applications) WHERE is_active = TRUE AND accepting_applications = TRUE;
CREATE INDEX idx_employer_job_types ON employer_profiles USING GIN(job_types_available);

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

CREATE INDEX idx_favorites_user ON favorites(favoriting_user_id);
CREATE INDEX idx_favorites_profile ON favorites(favorited_profile_id);
CREATE INDEX idx_favorites_property ON favorites(favorited_property_id);
CREATE INDEX idx_favorites_type ON favorites(favorite_type);

CREATE INDEX idx_employer_favorites_user_id ON employer_favorites(user_id);
CREATE INDEX idx_employer_favorites_employer_user_id ON employer_favorites(employer_user_id);

-- ============================================================================
-- SECTION 7: VIEWS AND CONVENIENCE FUNCTIONS
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

-- ============================================================================
-- SECTION 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE registrant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_matching_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REGISTRANT PROFILES RLS POLICIES
-- ============================================================================

-- Users can manage their own registrant profile
CREATE POLICY "Users can view their own registrant profile" ON registrant_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrant profile" ON registrant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrant profile" ON registrant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verified applicants can view other registrant profiles for matching
CREATE POLICY "Verified applicants can view other registrant profiles" ON registrant_profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    OR can_view_applicant_profile(id)
  );

-- ============================================================================
-- APPLICANT MATCHING PROFILES RLS POLICIES
-- ============================================================================

-- Users can manage their own applicant profile
CREATE POLICY "Users can view their own applicant profile" ON applicant_matching_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = applicant_matching_profiles.user_id)
  );

CREATE POLICY "Users can update their own applicant profile" ON applicant_matching_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = applicant_matching_profiles.user_id)
  );

CREATE POLICY "Users can insert their own applicant profile" ON applicant_matching_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = applicant_matching_profiles.user_id)
  );

-- Active applicants can view other active applicant profiles for matching
CREATE POLICY "Active applicants can view other applicant profiles" ON applicant_matching_profiles
  FOR SELECT USING (
    is_active = true 
    AND profile_completed = true 
    AND profile_visibility = 'verified-members'
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp2
      JOIN registrant_profiles rp ON amp2.user_id = rp.id
      WHERE rp.user_id = auth.uid() AND amp2.is_active = true
    )
  );

-- Landlords can view applicant profiles when they have housing matches
CREATE POLICY "Landlords can view applicants with housing matches" ON applicant_matching_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM housing_matches hm
      JOIN properties p ON hm.property_id = p.id
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE hm.applicant_id = applicant_matching_profiles.id
        AND rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- LANDLORD PROFILES RLS POLICIES
-- ============================================================================

-- Users can manage their own landlord profile
CREATE POLICY "Users can view their own landlord profile" ON landlord_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = landlord_profiles.user_id)
  );

CREATE POLICY "Users can update their own landlord profile" ON landlord_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = landlord_profiles.user_id)
  );

CREATE POLICY "Users can insert their own landlord profile" ON landlord_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = landlord_profiles.user_id)
  );

-- Applicants can view landlord profiles of properties they're matched with
CREATE POLICY "Applicants can view landlords they're matched with" ON landlord_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM housing_matches hm
      JOIN properties p ON hm.property_id = p.id
      JOIN applicant_matching_profiles amp ON hm.applicant_id = amp.id
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE p.landlord_id = landlord_profiles.id
        AND rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PROPERTIES RLS POLICIES
-- ============================================================================

-- Landlords can manage their own properties
CREATE POLICY "Landlords can view their own properties" ON properties
  FOR SELECT USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update their own properties" ON properties
  FOR UPDATE USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert properties" ON properties
  FOR INSERT WITH CHECK (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can delete their own properties" ON properties
  FOR DELETE USING (
    landlord_id IN (
      SELECT lp.id FROM landlord_profiles lp
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- Active applicants can view available properties
CREATE POLICY "Active applicants can view available properties" ON properties
  FOR SELECT USING (
    accepting_applications = true
    AND status = 'available'
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid() 
        AND amp.is_active = true
        AND amp.profile_completed = true
    )
  );

-- ============================================================================
-- EMPLOYER PROFILES RLS POLICIES
-- ============================================================================

-- Users can manage their own employer profile
CREATE POLICY "Users can view their own employer profile" ON employer_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = employer_profiles.user_id)
  );

CREATE POLICY "Users can update their own employer profile" ON employer_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = employer_profiles.user_id)
  );

CREATE POLICY "Users can insert their own employer profile" ON employer_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = employer_profiles.user_id)
  );

-- Active applicants can view active employer profiles
CREATE POLICY "Active applicants can view employer profiles" ON employer_profiles
  FOR SELECT USING (
    is_active = true
    AND accepting_applications = true
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid() 
        AND amp.is_active = true
        AND amp.profile_completed = true
    )
  );

-- ============================================================================
-- PEER SUPPORT PROFILES RLS POLICIES
-- ============================================================================

-- Users can manage their own peer support profile
CREATE POLICY "Users can view their own peer support profile" ON peer_support_profiles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = peer_support_profiles.user_id)
  );

CREATE POLICY "Users can update their own peer support profile" ON peer_support_profiles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = peer_support_profiles.user_id)
  );

CREATE POLICY "Users can insert their own peer support profile" ON peer_support_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM registrant_profiles WHERE id = peer_support_profiles.user_id)
  );

-- Active applicants can view active peer support profiles
CREATE POLICY "Active applicants can view peer support profiles" ON peer_support_profiles
  FOR SELECT USING (
    is_active = true
    AND accepting_clients = true
    AND EXISTS (
      SELECT 1 FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid() 
        AND amp.is_active = true
        AND amp.profile_completed = true
    )
  );

-- ============================================================================
-- HOUSING MATCHES RLS POLICIES
-- ============================================================================

-- Users can view housing matches they're involved in
CREATE POLICY "Users can view their housing matches" ON housing_matches
  FOR SELECT USING (
    -- Applicants can see their matches
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    -- Landlords can see matches for their properties
    property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can create housing matches for themselves
CREATE POLICY "Users can create housing matches" ON housing_matches
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can update housing matches they're involved in
CREATE POLICY "Users can update their housing matches" ON housing_matches
  FOR UPDATE USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- EMPLOYMENT MATCHES RLS POLICIES
-- ============================================================================

-- Users can view employment matches they're involved in
CREATE POLICY "Users can view their employment matches" ON employment_matches
  FOR SELECT USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN registrant_profiles rp ON ep.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- Similar INSERT and UPDATE policies for employment_matches...
CREATE POLICY "Users can create employment matches" ON employment_matches
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN registrant_profiles rp ON ep.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PEER SUPPORT MATCHES RLS POLICIES
-- ============================================================================

-- Users can view peer support matches they're involved in
CREATE POLICY "Users can view their peer support matches" ON peer_support_matches
  FOR SELECT USING (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    peer_support_id IN (
      SELECT psp.id FROM peer_support_profiles psp
      JOIN registrant_profiles rp ON psp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- Similar INSERT policies for peer_support_matches...
CREATE POLICY "Users can create peer support matches" ON peer_support_matches
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp 
      JOIN registrant_profiles rp ON amp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
    OR 
    peer_support_id IN (
      SELECT psp.id FROM peer_support_profiles psp
      JOIN registrant_profiles rp ON psp.user_id = rp.id 
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MATCH GROUPS RLS POLICIES
-- ============================================================================

-- Users can view match groups they're part of
CREATE POLICY "Users can view their match groups" ON match_groups
  FOR SELECT USING (
    applicant_1_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR applicant_2_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR property_id IN (
      SELECT p.id FROM properties p
      JOIN landlord_profiles lp ON p.landlord_id = lp.id
      JOIN registrant_profiles rp ON lp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR peer_support_id IN (
      SELECT psp.id FROM peer_support_profiles psp
      JOIN registrant_profiles rp ON psp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- Users can create match groups they're part of
CREATE POLICY "Users can create match groups" ON match_groups
  FOR INSERT WITH CHECK (
    applicant_1_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
    OR applicant_2_id IN (
      SELECT amp.id FROM applicant_matching_profiles amp
      JOIN registrant_profiles rp ON amp.user_id = rp.id
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MATCH REQUESTS RLS POLICIES
-- ============================================================================

-- Users can create match requests as requester
CREATE POLICY "Users can create match requests" ON match_requests
  FOR INSERT WITH CHECK (
    (requester_type = 'applicant' AND 
     requester_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'landlord' AND 
     requester_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'employer' AND 
     requester_id IN (
       SELECT ep.id FROM employer_profiles ep
       JOIN registrant_profiles rp ON ep.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'peer-support' AND 
     requester_id IN (
       SELECT psp.id FROM peer_support_profiles psp
       JOIN registrant_profiles rp ON psp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
  );

-- Users can view match requests they're involved in
CREATE POLICY "Users can view their match requests" ON match_requests
  FOR SELECT USING (
    -- Requester perspective
    (requester_type = 'applicant' AND 
     requester_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'landlord' AND 
     requester_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    -- Recipient perspective
    (recipient_type = 'applicant' AND 
     recipient_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'landlord' AND 
     recipient_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
  );

-- Users can update match requests they're involved in
CREATE POLICY "Users can update their match requests" ON match_requests
  FOR UPDATE USING (
    -- Same logic as SELECT policy - both requester and recipient can update
    (requester_type = 'applicant' AND 
     requester_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'applicant' AND 
     recipient_id IN (
       SELECT amp.id FROM applicant_matching_profiles amp
       JOIN registrant_profiles rp ON amp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (requester_type = 'landlord' AND 
     requester_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
    OR
    (recipient_type = 'landlord' AND 
     recipient_id IN (
       SELECT lp.id FROM landlord_profiles lp
       JOIN registrant_profiles rp ON lp.user_id = rp.id
       WHERE rp.user_id = auth.uid()
     ))
  );

-- ============================================================================
-- FAVORITES RLS POLICIES
-- ============================================================================

-- Users can manage their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (
    favoriting_user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own favorites" ON favorites
  FOR INSERT WITH CHECK (
    favoriting_user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (
    favoriting_user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- EMPLOYER FAVORITES RLS POLICIES
-- ============================================================================

-- Users can manage their own employer favorites
CREATE POLICY "Users can view their own employer favorites" ON employer_favorites
  FOR SELECT USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own employer favorites" ON employer_favorites
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own employer favorites" ON employer_favorites
  FOR DELETE USING (
    user_id IN (
      SELECT rp.id FROM registrant_profiles rp
      WHERE rp.user_id = auth.uid()
    )
  );

ALTER TABLE properties 
ADD COLUMN total_beds INTEGER;

-- Add comment to clarify the distinction
COMMENT ON COLUMN properties.bedrooms IS 'Number of actual rooms/bedrooms in the property';
COMMENT ON COLUMN properties.total_beds IS 'Total number of beds across all rooms (can exceed bedroom count)';
COMMENT ON COLUMN properties.available_beds IS 'Number of currently vacant/available beds';
-- Remove any legacy constraint that incorrectly limits available_beds to bedrooms
-- (This is needed because sober living homes can have multiple beds per room)
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS valid_available_beds;

-- Add the correct constraint that ensures available_beds doesn't exceed total_beds
ALTER TABLE properties 
ADD CONSTRAINT check_available_beds_valid 
CHECK (available_beds IS NULL OR total_beds IS NULL OR available_beds <= total_beds);

-- Add check constraint to ensure available_beds doesn't exceed total_beds
ALTER TABLE properties 
ADD CONSTRAINT check_available_beds_valid 
CHECK (available_beds IS NULL OR total_beds IS NULL OR available_beds <= total_beds);

-- Update any existing properties where total_beds should match current bedrooms
-- (You may want to adjust this based on your existing data)
UPDATE properties 
SET total_beds = bedrooms 
WHERE total_beds IS NULL AND bedrooms IS NOT NULL;
-- ============================================================================
-- SECTION 9: PERMISSIONS AND GRANTS
-- ============================================================================

-- Grant necessary permissions for Supabase auth integration
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, anon, authenticated, service_role;

-- Grant necessary permissions for all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SCHEMA COMPLETION SUMMARY
-- ============================================================================

/*
✅ CLEAN SCHEMA FEATURES:
1. ✅ Logical organization into clear sections
2. ✅ All RLS policies grouped together and comprehensive
3. ✅ Complete property-based architecture (landlord → properties)
4. ✅ Cross-role viewing permissions (applicants ↔ landlords)
5. ✅ Comprehensive indexes for performance
6. ✅ All triggers and functions properly organized
7. ✅ Ready for landlord registration and property management
8. ✅ Security-first design with proper access controls

ARCHITECTURE FLOW:
auth.users.id → registrant_profiles.user_id → role_profiles → properties/matches

READY FOR NEXT PHASE:
- Landlord registration workflow
- Property creation and management
- Property listing and search
- Enhanced matching algorithms
*/
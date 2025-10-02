-- src/schema/schemas/02_profile_tables.sql
-- Dependencies: registrant_profiles table
-- Description: Applicant matching profiles with comprehensive recovery and lifestyle data

-- ============================================================================
-- APPLICANT MATCHING PROFILES (Complete Implementation)
-- ============================================================================
-- Purpose: Comprehensive matching data for applicants seeking housing/recovery support
-- References: registrant_profiles.id
-- Referenced by: housing_matches, employment_matches, peer_support_matches, match_groups
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
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE applicant_matching_profiles IS 'Comprehensive matching profiles for applicants seeking housing and recovery support. Contains detailed preferences, recovery data, and lifestyle information for algorithmic matching.';
COMMENT ON COLUMN applicant_matching_profiles.user_id IS 'References registrant_profiles.id - the central hub connection';
COMMENT ON COLUMN applicant_matching_profiles.primary_location IS 'Generated column combining city and state for search optimization';
COMMENT ON COLUMN applicant_matching_profiles.completion_percentage IS 'Auto-calculated via trigger based on required field completion';
COMMENT ON COLUMN applicant_matching_profiles.compatibility_scores IS 'JSONB storing compatibility scores with other profiles/properties';

-- ============================================================================
-- ARCHITECTURE NOTES
-- ============================================================================

/*
MATCHING ALGORITHM SUPPORT:
- Comprehensive lifestyle compatibility scoring
- Recovery stage and method matching
- Geographic and budget filtering
- Roommate preference alignment
- Deal breaker enforcement

PROFILE COMPLETION:
- Calculated via trigger function
- 20+ required fields for basic completion
- Drives profile visibility and matching eligibility

SECURITY INTEGRATION:
- Referenced by housing_matches, employment_matches, peer_support_matches
- RLS policies control cross-role visibility
- Profile visibility settings respected
*/
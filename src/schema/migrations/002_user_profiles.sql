-- src/schema/migrations/002_user_profiles.sql
-- Dependencies: 001_initial_setup.sql

BEGIN;

-- ============================================================================
-- APPLICANT MATCHING PROFILES
-- ============================================================================

CREATE TABLE applicant_matching_profiles (
  -- Primary Identifiers & Metadata
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Personal Identity & Demographics
  primary_phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender_identity VARCHAR(50),
  biological_sex VARCHAR(20),
  preferred_roommate_gender VARCHAR(50) NOT NULL,
  gender_inclusive BOOLEAN DEFAULT FALSE,
  
  -- Location & Geography
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
  
  -- Budget & Financial
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  housing_assistance TEXT[],
  has_section8 BOOLEAN DEFAULT FALSE,
  
  -- Recovery & Wellness
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
  
  -- Lifestyle & Living Preferences
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
  
  -- Household Management & Communication
  chore_sharing_style VARCHAR(50),
  chore_sharing_preference VARCHAR(50),
  shared_groceries BOOLEAN DEFAULT FALSE,
  communication_style VARCHAR(50),
  conflict_resolution_style VARCHAR(50),
  preferred_support_structure VARCHAR(50),
  
  -- Pets & Smoking
  pets_owned BOOLEAN DEFAULT FALSE,
  pets_comfortable BOOLEAN DEFAULT FALSE,
  pet_preference VARCHAR(50),
  smoking_status VARCHAR(50),
  smoking_preference VARCHAR(50),
  
  -- Housing Specifications
  housing_types_accepted TEXT[],
  preferred_bedrooms VARCHAR(20),
  furnished_preference BOOLEAN,
  utilities_included_preference BOOLEAN,
  accessibility_needed BOOLEAN DEFAULT FALSE,
  parking_required BOOLEAN DEFAULT FALSE,
  public_transit_access BOOLEAN DEFAULT FALSE,
  
  -- Timing & Availability
  move_in_date DATE NOT NULL,
  move_in_flexibility VARCHAR(50),
  lease_duration VARCHAR(50),
  relocation_timeline VARCHAR(50),
  
  -- Goals & Aspirations
  short_term_goals TEXT,
  long_term_vision TEXT,
  interests TEXT[],
  additional_interests TEXT,
  shared_activities_interest BOOLEAN DEFAULT FALSE,
  important_qualities TEXT[],
  deal_breakers TEXT[],
  
  -- Profile Content & Status
  about_me TEXT NOT NULL,
  looking_for TEXT NOT NULL,
  additional_info TEXT,
  special_needs TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_visibility VARCHAR(50) DEFAULT 'verified-members',
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  
  -- Roommate Preferences
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
  
  -- Deal Breakers
  deal_breaker_substance_use BOOLEAN DEFAULT FALSE,
  deal_breaker_loudness BOOLEAN DEFAULT FALSE,
  deal_breaker_uncleanliness BOOLEAN DEFAULT FALSE,
  deal_breaker_financial_issues BOOLEAN DEFAULT TRUE,
  deal_breaker_pets BOOLEAN DEFAULT FALSE,
  deal_breaker_smoking BOOLEAN DEFAULT FALSE,
  
  -- Compatibility Preferences
  overnight_guests_preference BOOLEAN DEFAULT FALSE,
  shared_transportation BOOLEAN DEFAULT FALSE,
  recovery_accountability BOOLEAN DEFAULT FALSE,
  shared_recovery_activities BOOLEAN DEFAULT FALSE,
  mentorship_interest BOOLEAN DEFAULT FALSE,
  recovery_community BOOLEAN DEFAULT FALSE,
  
  -- Algorithm Metadata & Scoring
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  profile_quality_score INTEGER DEFAULT 0 CHECK (profile_quality_score BETWEEN 0 AND 100),
  last_updated_section VARCHAR(50),
  compatibility_scores JSONB DEFAULT '{}',
  search_preferences JSONB DEFAULT '{}',
  matching_weights JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_age_range CHECK (age_range_min <= age_range_max),
  CONSTRAINT valid_budget_range CHECK (budget_min <= budget_max),
  CONSTRAINT valid_move_in_date CHECK (move_in_date >= CURRENT_DATE),
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- ============================================================================
-- LANDLORD PROFILES
-- ============================================================================

CREATE TABLE landlord_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  contact_person VARCHAR(100),
  primary_service_city VARCHAR(100) NOT NULL,
  primary_service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  business_name VARCHAR(200),
  business_type VARCHAR(100),
  years_in_business INTEGER,
  recovery_friendly BOOLEAN DEFAULT TRUE,
  recovery_experience_level VARCHAR(50),
  preferred_recovery_stages TEXT[],
  supported_recovery_methods TEXT[],
  max_properties INTEGER DEFAULT 10,
  accepts_subsidies BOOLEAN DEFAULT FALSE,
  background_check_required BOOLEAN DEFAULT FALSE,
  standard_lease_terms VARCHAR(50),
  application_process_description TEXT,
  bio TEXT,
  experience_description TEXT,
  approach_philosophy TEXT,
  currently_accepting_tenants BOOLEAN DEFAULT TRUE,
  preferred_contact_method VARCHAR(50),
  response_time_expectation VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_verified BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT unique_landlord_profile UNIQUE (user_id)
);

-- ============================================================================
-- EMPLOYER PROFILES
-- ============================================================================

CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  contact_person VARCHAR(100),
  business_type VARCHAR(100) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  service_city VARCHAR(100) NOT NULL,
  service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  job_types_available TEXT[] NOT NULL,
  work_schedule VARCHAR(50),
  salary_ranges JSONB,
  benefits_offered TEXT[],
  recovery_friendly BOOLEAN DEFAULT TRUE,
  supported_recovery_methods TEXT[],
  substance_free_workplace BOOLEAN DEFAULT TRUE,
  background_check_required BOOLEAN DEFAULT FALSE,
  drug_testing_policy VARCHAR(50),
  accepting_applications BOOLEAN DEFAULT TRUE,
  description TEXT NOT NULL,
  additional_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT unique_employer_profile UNIQUE (user_id)
);

-- ============================================================================
-- PEER SUPPORT PROFILES
-- ============================================================================

CREATE TABLE peer_support_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  professional_title VARCHAR(100) NOT NULL,
  is_licensed BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  service_city VARCHAR(100) NOT NULL,
  service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  specialties TEXT[] NOT NULL,
  supported_recovery_methods TEXT[] NOT NULL,
  recovery_stage VARCHAR(50) NOT NULL,
  time_in_recovery VARCHAR(50),
  primary_issues TEXT[],
  spiritual_affiliation VARCHAR(50),
  accepting_clients BOOLEAN DEFAULT TRUE,
  bio TEXT NOT NULL,
  about_me TEXT NOT NULL,
  additional_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT unique_peer_support_profile UNIQUE (user_id)
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trigger_update_applicant_profiles_timestamp
  BEFORE UPDATE ON applicant_matching_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_landlord_profiles_timestamp
  BEFORE UPDATE ON landlord_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_employer_profiles_timestamp
  BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_peer_support_profiles_timestamp
  BEFORE UPDATE ON peer_support_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

COMMIT;
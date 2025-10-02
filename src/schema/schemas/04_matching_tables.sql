-- src/schema/schemas/04_matching_tables.sql
-- Dependencies: registrant_profiles, applicant_matching_profiles, landlord_profiles, properties
-- Description: Service provider profiles and all matching relationship tables

-- ============================================================================
-- EMPLOYER PROFILES
-- ============================================================================
-- Purpose: Business profiles for employment opportunities
-- References: registrant_profiles.id
-- Referenced by: employment_matches
-- ============================================================================

CREATE TABLE employer_profiles (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & METADATA
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- BASIC CONTACT INFORMATION
  -- ============================================================================
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  contact_person VARCHAR(100),
  
  -- ============================================================================
  -- BUSINESS INFORMATION
  -- ============================================================================
  business_type VARCHAR(100) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  
  -- ============================================================================
  -- LOCATION & SERVICE AREAS
  -- ============================================================================
  service_city VARCHAR(100) NOT NULL,
  service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  
  -- ============================================================================
  -- EMPLOYMENT INFORMATION
  -- ============================================================================
  job_types_available TEXT[] NOT NULL,
  work_schedule VARCHAR(50),
  salary_ranges JSONB,
  benefits_offered TEXT[],
  
  -- ============================================================================
  -- RECOVERY SUPPORT
  -- ============================================================================
  recovery_friendly BOOLEAN DEFAULT TRUE,
  supported_recovery_methods TEXT[],
  substance_free_workplace BOOLEAN DEFAULT TRUE,
  
  -- ============================================================================
  -- REQUIREMENTS
  -- ============================================================================
  background_check_required BOOLEAN DEFAULT FALSE,
  drug_testing_policy VARCHAR(50),
  
  -- ============================================================================
  -- AVAILABILITY & PROFILE CONTENT
  -- ============================================================================
  accepting_applications BOOLEAN DEFAULT TRUE,
  description TEXT NOT NULL,
  additional_info TEXT,
  
  -- ============================================================================
  -- STATUS
  -- ============================================================================
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_employer_profile UNIQUE (user_id)
);

-- ============================================================================
-- PEER SUPPORT PROFILES
-- ============================================================================
-- Purpose: Peer support specialist profiles for recovery assistance
-- References: registrant_profiles.id  
-- Referenced by: peer_support_matches
-- ============================================================================

CREATE TABLE peer_support_profiles (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & METADATA
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- BASIC CONTACT INFORMATION
  -- ============================================================================
  primary_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  
  -- ============================================================================
  -- PROFESSIONAL INFORMATION
  -- ============================================================================
  professional_title VARCHAR(100) NOT NULL,
  is_licensed BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  
  -- ============================================================================
  -- LOCATION & SERVICE AREAS
  -- ============================================================================
  service_city VARCHAR(100) NOT NULL,
  service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  
  -- ============================================================================
  -- SPECIALTIES & SERVICES
  -- ============================================================================
  specialties TEXT[] NOT NULL,
  supported_recovery_methods TEXT[] NOT NULL,
  
  -- ============================================================================
  -- RECOVERY EXPERIENCE
  -- ============================================================================
  recovery_stage VARCHAR(50) NOT NULL,
  time_in_recovery VARCHAR(50),
  primary_issues TEXT[],
  spiritual_affiliation VARCHAR(50),
  
  -- ============================================================================
  -- SERVICE INFORMATION & PROFILE CONTENT
  -- ============================================================================
  accepting_clients BOOLEAN DEFAULT TRUE,
  bio TEXT NOT NULL,
  about_me TEXT NOT NULL,
  additional_info TEXT,
  
  -- ============================================================================
  -- STATUS
  -- ============================================================================
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_peer_support_profile UNIQUE (user_id)
);

-- ============================================================================
-- HOUSING MATCHES (Uses properties.id)
-- ============================================================================
-- Purpose: Matching relationships between applicants and specific properties
-- References: applicant_matching_profiles.id, properties.id
-- ============================================================================

CREATE TABLE housing_matches (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & RELATIONSHIPS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- ============================================================================
  -- MATCHING METADATA
  -- ============================================================================
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  
  -- ============================================================================
  -- MATCH STATUS
  -- ============================================================================
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-liked', 'landlord-liked', 'rejected')),
  
  -- ============================================================================
  -- COMMUNICATION
  -- ============================================================================
  applicant_message TEXT,
  landlord_message TEXT,
  
  -- ============================================================================
  -- TIMESTAMPS
  -- ============================================================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_housing_match UNIQUE (applicant_id, property_id)
);

-- ============================================================================
-- EMPLOYMENT MATCHES
-- ============================================================================
-- Purpose: Matching relationships between applicants and employers
-- References: applicant_matching_profiles.id, employer_profiles.id
-- ============================================================================

CREATE TABLE employment_matches (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & RELATIONSHIPS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  
  -- ============================================================================
  -- MATCHING METADATA
  -- ============================================================================
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  
  -- ============================================================================
  -- MATCH STATUS
  -- ============================================================================
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-interested', 'employer-interested', 'rejected')),
  
  -- ============================================================================
  -- COMMUNICATION
  -- ============================================================================
  applicant_message TEXT,
  employer_message TEXT,
  
  -- ============================================================================
  -- TIMESTAMPS
  -- ============================================================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_employment_match UNIQUE (applicant_id, employer_id)
);

-- ============================================================================
-- PEER SUPPORT MATCHES
-- ============================================================================
-- Purpose: Matching relationships between applicants and peer support specialists
-- References: applicant_matching_profiles.id, peer_support_profiles.id
-- ============================================================================

CREATE TABLE peer_support_matches (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & RELATIONSHIPS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  peer_support_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  
  -- ============================================================================
  -- MATCHING METADATA
  -- ============================================================================
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  
  -- ============================================================================
  -- MATCH STATUS
  -- ============================================================================
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-interested', 'peer-interested', 'rejected')),
  
  -- ============================================================================
  -- COMMUNICATION
  -- ============================================================================
  applicant_message TEXT,
  peer_message TEXT,
  
  -- ============================================================================
  -- TIMESTAMPS
  -- ============================================================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_peer_support_match UNIQUE (applicant_id, peer_support_id)
);

-- ============================================================================
-- MATCH GROUPS (Multi-party matching for roommates + property + support)
-- ============================================================================
-- Purpose: Group matching for multiple applicants sharing housing/support
-- References: applicant_matching_profiles.id, properties.id, peer_support_profiles.id
-- ============================================================================

CREATE TABLE match_groups (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & RELATIONSHIPS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Group Members
  applicant_1_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  applicant_2_id UUID REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  peer_support_id UUID REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  
  -- ============================================================================
  -- GROUP INFORMATION
  -- ============================================================================
  group_name VARCHAR(255),
  move_in_date DATE,
  
  -- ============================================================================
  -- GROUP STATUS
  -- ============================================================================
  status VARCHAR(50) DEFAULT 'forming' CHECK (status IN ('forming', 'confirmed', 'active', 'completed', 'disbanded')),
  
  -- ============================================================================
  -- GROUP COMMUNICATION
  -- ============================================================================
  group_chat_active BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  contact_shared BOOLEAN DEFAULT FALSE,
  shared_contact_info JSONB DEFAULT '{}',
  
  -- ============================================================================
  -- TIMESTAMPS
  -- ============================================================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT different_applicants CHECK (applicant_1_id != applicant_2_id)
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE employer_profiles IS 'Business profiles for employers offering recovery-friendly employment opportunities';
COMMENT ON TABLE peer_support_profiles IS 'Peer support specialist profiles for recovery assistance and mentorship';
COMMENT ON TABLE housing_matches IS 'Matching relationships between applicants and specific properties (not landlords)';
COMMENT ON TABLE employment_matches IS 'Matching relationships between applicants and employers for job opportunities';
COMMENT ON TABLE peer_support_matches IS 'Matching relationships between applicants and peer support specialists';
COMMENT ON TABLE match_groups IS 'Multi-party groups for roommate matching with shared housing and support services';

-- ============================================================================
-- ARCHITECTURE NOTES
-- ============================================================================

/*
MATCHING ARCHITECTURE:
- housing_matches: applicant ↔ property (property-specific, not landlord-specific)
- employment_matches: applicant ↔ employer 
- peer_support_matches: applicant ↔ peer support specialist
- match_groups: multiple applicants + property + optional peer support

COMPATIBILITY SCORING:
- All match tables include compatibility_score (0-100)
- match_factors JSONB stores detailed scoring breakdown
- Supports algorithmic matching and manual override

STATUS PROGRESSION:
- potential → interested → mutual/rejected
- Enables both sides to express interest before mutual match
- Group matching has separate lifecycle (forming → confirmed → active)
*/
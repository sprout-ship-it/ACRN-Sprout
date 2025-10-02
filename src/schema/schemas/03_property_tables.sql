-- src/schema/schemas/03_property_tables.sql
-- Dependencies: registrant_profiles table
-- Description: Landlord profiles and properties tables for housing management

-- ============================================================================
-- LANDLORD PROFILES (Simplified - Property-specific fields in properties table)
-- ============================================================================
-- Purpose: Basic landlord information and service preferences
-- References: registrant_profiles.id
-- Referenced by: properties table
-- ============================================================================

CREATE TABLE landlord_profiles (
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
  -- SERVICE AREAS
  -- ============================================================================
  primary_service_city VARCHAR(100) NOT NULL,
  primary_service_state VARCHAR(2) NOT NULL,
  service_areas TEXT[],
  
  -- ============================================================================
  -- BUSINESS INFORMATION
  -- ============================================================================
  business_name VARCHAR(200),
  business_type VARCHAR(100),
  years_in_business INTEGER,
  
  -- ============================================================================
  -- RECOVERY SUPPORT PHILOSOPHY
  -- ============================================================================
  recovery_friendly BOOLEAN DEFAULT TRUE,
  recovery_experience_level VARCHAR(50),
  preferred_recovery_stages TEXT[],
  supported_recovery_methods TEXT[],
  
  -- ============================================================================
  -- OPERATIONAL INFORMATION
  -- ============================================================================
  max_properties INTEGER DEFAULT 10,
  accepts_subsidies BOOLEAN DEFAULT FALSE,
  background_check_required BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- BUSINESS POLICIES
  -- ============================================================================
  standard_lease_terms VARCHAR(50),
  application_process_description TEXT,
  
  -- ============================================================================
  -- PROFILE CONTENT
  -- ============================================================================
  bio TEXT,
  experience_description TEXT,
  approach_philosophy TEXT,
  
  -- ============================================================================
  -- AVAILABILITY & STATUS
  -- ============================================================================
  currently_accepting_tenants BOOLEAN DEFAULT TRUE,
  preferred_contact_method VARCHAR(50),
  response_time_expectation VARCHAR(50),
  
  -- ============================================================================
  -- STATUS
  -- ============================================================================
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_verified BOOLEAN DEFAULT FALSE,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_landlord_profile UNIQUE (user_id)
);

-- ============================================================================
-- PROPERTIES TABLE (Enhanced with Recovery Housing Support)
-- ============================================================================
-- Purpose: Individual property listings with detailed specifications
-- References: landlord_profiles.id
-- Referenced by: housing_matches, match_groups, match_requests, favorites
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
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT valid_bedrooms CHECK (bedrooms >= 0),
  CONSTRAINT valid_total_beds CHECK (total_beds >= 0),
  CONSTRAINT check_available_beds_valid CHECK (
    available_beds >= 0 AND 
    (total_beds IS NULL OR available_beds <= total_beds)
  ),
  CONSTRAINT valid_bathrooms CHECK (bathrooms >= 0.5),
  CONSTRAINT valid_rent CHECK (monthly_rent > 0),
  CONSTRAINT valid_status CHECK (status IN ('available', 'waitlist', 'full', 'temporarily_closed', 'under_renovation')),
  
  -- Enhanced property type constraint with all property types
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
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE landlord_profiles IS 'Landlord business profiles containing contact info, service areas, and recovery support philosophy';
COMMENT ON COLUMN landlord_profiles.user_id IS 'References registrant_profiles.id - central hub connection';
COMMENT ON COLUMN landlord_profiles.recovery_friendly IS 'Indicates willingness to work with individuals in recovery';

COMMENT ON TABLE properties IS 'Individual property listings with detailed specifications for both general and recovery housing';
COMMENT ON COLUMN properties.landlord_id IS 'References landlord_profiles.id - property ownership link';
COMMENT ON COLUMN properties.is_recovery_housing IS 'Distinguishes recovery housing from general rentals';
COMMENT ON COLUMN properties.bedrooms IS 'Number of actual rooms/bedrooms in the property';
COMMENT ON COLUMN properties.total_beds IS 'Total number of beds across all rooms (can exceed bedroom count)';
COMMENT ON COLUMN properties.available_beds IS 'Number of currently vacant/available beds';

-- ============================================================================
-- ARCHITECTURE NOTES
-- ============================================================================

/*
PROPERTY ARCHITECTURE FLOW:
registrant_profiles.id → landlord_profiles.user_id → landlord_profiles.id → properties.landlord_id

HOUSING TYPES:
- General Rentals: apartment, house, townhouse, condo, etc.
- Recovery Housing: sober_living_level_1-3, halfway_house, recovery_residence, etc.

BED VS BEDROOM DISTINCTION:
- bedrooms: Physical room count
- total_beds: Total bed capacity (multiple beds per room possible)
- available_beds: Current vacancy count

MATCHING INTEGRATION:
- housing_matches references properties.id (not landlord_profiles.id)
- Enables property-specific matching and communication
- Supports multiple properties per landlord
*/
-- src/schema/migrations/003_properties_housing.sql
-- Dependencies: 002_user_profiles.sql

BEGIN;

-- ============================================================================
-- PROPERTIES TABLE
-- ============================================================================

CREATE TABLE properties (
  -- Primary Identifiers & Metadata
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlord_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Property Type & Classification
  is_recovery_housing BOOLEAN DEFAULT FALSE,
  property_type VARCHAR(50) NOT NULL,
  
  -- Basic Property Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  -- Physical Property Details
  bedrooms INTEGER NOT NULL DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  available_beds INTEGER DEFAULT 0,
  bathrooms DECIMAL(3,1) DEFAULT 1.0,
  square_footage INTEGER,
  
  -- Financial Information
  monthly_rent INTEGER NOT NULL,
  weekly_rate INTEGER,
  security_deposit INTEGER,
  application_fee INTEGER DEFAULT 0,
  utilities_included TEXT[],
  furnished BOOLEAN DEFAULT FALSE,
  meals_included BOOLEAN DEFAULT FALSE,
  linens_provided BOOLEAN DEFAULT FALSE,
  accepted_subsidies TEXT[],
  
  -- Availability & Lease Terms
  available_date DATE,
  lease_duration VARCHAR(50),
  
  -- Recovery-Specific Fields
  required_programs TEXT[],
  min_sobriety_time VARCHAR(50),
  treatment_completion_required VARCHAR(50),
  house_rules TEXT[],
  additional_house_rules TEXT,
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
  license_number VARCHAR(100),
  accreditation VARCHAR(100),
  
  -- Property Features & Amenities
  amenities TEXT[],
  accessibility_features TEXT[],
  neighborhood_features TEXT[],
  
  -- Property Status & Availability
  status VARCHAR(50) DEFAULT 'available',
  accepting_applications BOOLEAN DEFAULT TRUE,
  
  -- Additional Information
  additional_notes TEXT,
  internal_notes TEXT,
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_bedrooms CHECK (bedrooms >= 0),
  CONSTRAINT valid_total_beds CHECK (total_beds >= 0),
  CONSTRAINT check_available_beds_valid CHECK (
    available_beds >= 0 AND 
    (total_beds IS NULL OR available_beds <= total_beds)
  ),
  CONSTRAINT valid_bathrooms CHECK (bathrooms >= 0.5),
  CONSTRAINT valid_rent CHECK (monthly_rent > 0),
  CONSTRAINT valid_status CHECK (status IN ('available', 'waitlist', 'full', 'temporarily_closed', 'under_renovation')),
  CONSTRAINT valid_property_type CHECK (
    (is_recovery_housing = FALSE AND property_type IN (
      'apartment', 'house', 'townhouse', 'condo', 'duplex', 'triplex',
      'studio', 'loft', 'single_room', 'shared_room', 'basement_apartment', 
      'garage_apartment', 'tiny_home', 'manufactured_home'
    )) OR
    (is_recovery_housing = TRUE AND property_type IN (
      'sober_living_level_1', 'sober_living_level_2', 'sober_living_level_3', 
      'halfway_house', 'recovery_residence', 'transitional_housing',
      'supportive_housing', 'therapeutic_community'
    ))
  )
);

-- Comments for clarity
COMMENT ON COLUMN properties.bedrooms IS 'Number of actual rooms/bedrooms in the property';
COMMENT ON COLUMN properties.total_beds IS 'Total number of beds across all rooms (can exceed bedroom count)';
COMMENT ON COLUMN properties.available_beds IS 'Number of currently vacant/available beds';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trigger_update_properties_timestamp
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

COMMIT;
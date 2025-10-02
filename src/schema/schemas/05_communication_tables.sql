-- src/schema/schemas/05_communication_tables.sql
-- Dependencies: All profile tables, properties table
-- Description: Communication, requests, and favorites system tables

-- ============================================================================
-- MATCH REQUESTS (Property-specific requests and general communication)
-- ============================================================================
-- Purpose: Structured communication system for cross-role requests and inquiries
-- References: All profile tables via polymorphic requester/recipient system
-- ============================================================================

CREATE TABLE match_requests (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ============================================================================
  -- POLYMORPHIC REQUEST SYSTEM
  -- ============================================================================
  -- Requester Information
  requester_type VARCHAR(20) NOT NULL CHECK (requester_type IN ('applicant', 'landlord', 'employer', 'peer-support')),
  requester_id UUID NOT NULL,
  
  -- Recipient Information
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('applicant', 'landlord', 'employer', 'peer-support')),
  recipient_id UUID NOT NULL,
  
  -- ============================================================================
  -- PROPERTY-SPECIFIC REQUESTS
  -- ============================================================================
  property_id UUID REFERENCES properties(id),
  
  -- ============================================================================
  -- REQUEST DETAILS
  -- ============================================================================
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('housing', 'employment', 'peer-support', 'roommate')),
  message TEXT,
  
  -- ============================================================================
  -- STATUS TRACKING
  -- ============================================================================
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- ============================================================================
  -- TIMESTAMPS
  -- ============================================================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_match_request UNIQUE (requester_type, requester_id, recipient_type, recipient_id, request_type, property_id),
  CONSTRAINT no_self_request CHECK (NOT (requester_type = recipient_type AND requester_id = recipient_id)),
  CONSTRAINT property_required_for_housing CHECK (
    (request_type = 'housing' AND property_id IS NOT NULL) OR 
    (request_type != 'housing')
  )
);

-- ============================================================================
-- FAVORITES SYSTEM (Enhanced for profiles and properties)
-- ============================================================================
-- Purpose: Users can favorite both profiles and properties for easy reference
-- References: auth.users.id, registrant_profiles.id, properties.id
-- ============================================================================

CREATE TABLE favorites (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  favoriting_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ============================================================================
  -- POLYMORPHIC FAVORITE TARGETS
  -- ============================================================================
  -- Can favorite profiles or properties
  favorited_profile_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  favorited_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('profile', 'property')),
  
  -- ============================================================================
  -- INTERACTION TRACKING
  -- ============================================================================
  outreach_status VARCHAR(50) DEFAULT NULL,
  last_inquiry_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- ============================================================================
  -- TIMESTAMPS
  -- ============================================================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_favorite UNIQUE (favoriting_user_id, favorited_profile_id, favorited_property_id),
  CONSTRAINT favorite_target_check CHECK (
    (favorite_type = 'profile' AND favorited_profile_id IS NOT NULL AND favorited_property_id IS NULL) OR
    (favorite_type = 'property' AND favorited_property_id IS NOT NULL AND favorited_profile_id IS NULL)
  )
);

-- ============================================================================
-- EMPLOYER FAVORITES (Specialized favorites for employment tracking)
-- ============================================================================
-- Purpose: Specialized favorites system for tracking employment interest
-- References: registrant_profiles.id (user and employer)
-- ============================================================================

CREATE TABLE employer_favorites (
  -- ============================================================================
  -- PRIMARY IDENTIFIERS & RELATIONSHIPS
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  employer_user_id UUID NOT NULL REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  
  -- ============================================================================
  -- TIMESTAMPS
  -- ============================================================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============================================================================
  -- CONSTRAINTS
  -- ============================================================================
  CONSTRAINT unique_employer_favorite UNIQUE (user_id, employer_user_id)
);

-- ============================================================================
-- EMPLOYER FAVORITES WITH DETAILS VIEW
-- ============================================================================
-- Purpose: Convenient view joining employer favorites with detailed employer information
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
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE match_requests IS 'Structured communication system for cross-role requests. Supports property-specific housing requests and general service requests.';
COMMENT ON COLUMN match_requests.requester_type IS 'Type of user making the request: applicant, landlord, employer, peer-support';
COMMENT ON COLUMN match_requests.recipient_type IS 'Type of user receiving the request: applicant, landlord, employer, peer-support';
COMMENT ON COLUMN match_requests.property_id IS 'Required for housing requests, optional for other request types';

COMMENT ON TABLE favorites IS 'General favorites system supporting both profile and property favorites with interaction tracking';
COMMENT ON COLUMN favorites.favoriting_user_id IS 'References auth.users.id directly for simplified access control';
COMMENT ON COLUMN favorites.favorite_type IS 'Discriminator: profile or property';

COMMENT ON TABLE employer_favorites IS 'Specialized favorites for employment opportunities with registrant_profiles linkage';
COMMENT ON VIEW employer_favorites_with_details IS 'Convenience view joining employer favorites with detailed employer profile information';

-- ============================================================================
-- ARCHITECTURE NOTES
-- ============================================================================

/*
POLYMORPHIC REQUEST SYSTEM:
- requester_type + requester_id: Can be any profile type
- recipient_type + recipient_id: Can be any profile type  
- property_id: Required for housing requests, enables property-specific communication
- Prevents self-requests and ensures housing requests include property

FAVORITES ARCHITECTURE:
- General favorites: Supports both profiles and properties
- Employer favorites: Specialized system for employment tracking
- Both systems track user interaction and outreach status

COMMUNICATION FLOW:
1. match_requests: Formal structured requests between roles
2. favorites: Informal interest tracking and easy reference
3. employer_favorites: Employment-specific interest with detailed views

INTEGRATION WITH MATCHING:
- match_requests can trigger creation of formal matches
- favorites inform matching algorithm preferences
- Both systems support the full user journey from interest to connection
*/
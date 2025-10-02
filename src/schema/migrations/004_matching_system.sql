-- src/schema/migrations/004_matching_system.sql
-- Dependencies: 003_properties_housing.sql

BEGIN;

-- ============================================================================
-- HOUSING MATCHES
-- ============================================================================

CREATE TABLE housing_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-liked', 'landlord-liked', 'rejected')),
  applicant_message TEXT,
  landlord_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_housing_match UNIQUE (applicant_id, property_id)
);

-- ============================================================================
-- EMPLOYMENT MATCHES
-- ============================================================================

CREATE TABLE employment_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-interested', 'employer-interested', 'rejected')),
  applicant_message TEXT,
  employer_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_employment_match UNIQUE (applicant_id, employer_id)
);

-- ============================================================================
-- PEER SUPPORT MATCHES
-- ============================================================================

CREATE TABLE peer_support_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  peer_support_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  match_factors JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'applicant-interested', 'peer-interested', 'rejected')),
  applicant_message TEXT,
  peer_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_peer_support_match UNIQUE (applicant_id, peer_support_id)
);

-- ============================================================================
-- MATCH GROUPS
-- ============================================================================

CREATE TABLE match_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_1_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  applicant_2_id UUID REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  peer_support_id UUID REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  group_name VARCHAR(255),
  move_in_date DATE,
  status VARCHAR(50) DEFAULT 'forming' CHECK (status IN ('forming', 'confirmed', 'active', 'completed', 'disbanded')),
  group_chat_active BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  contact_shared BOOLEAN DEFAULT FALSE,
  shared_contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT different_applicants CHECK (applicant_1_id != applicant_2_id)
);

-- ============================================================================
-- MATCH REQUESTS
-- ============================================================================

CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_type VARCHAR(20) NOT NULL CHECK (requester_type IN ('applicant', 'landlord', 'employer', 'peer-support')),
  requester_id UUID NOT NULL,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('applicant', 'landlord', 'employer', 'peer-support')),
  recipient_id UUID NOT NULL,
  property_id UUID REFERENCES properties(id),
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('housing', 'employment', 'peer-support', 'roommate')),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_match_request UNIQUE (requester_type, requester_id, recipient_type, recipient_id, request_type, property_id),
  CONSTRAINT no_self_request CHECK (NOT (requester_type = recipient_type AND requester_id = recipient_id)),
  CONSTRAINT property_required_for_housing CHECK (
    (request_type = 'housing' AND property_id IS NOT NULL) OR 
    (request_type != 'housing')
  )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

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

COMMIT;
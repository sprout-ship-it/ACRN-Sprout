-- src/schema/migrations/005_communication.sql
-- Dependencies: 004_matching_system.sql

BEGIN;

-- ============================================================================
-- FAVORITES SYSTEM
-- ============================================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  favoriting_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorited_profile_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  favorited_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('profile', 'property')),
  outreach_status VARCHAR(50) DEFAULT NULL,
  last_inquiry_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_favorite UNIQUE (favoriting_user_id, favorited_profile_id, favorited_property_id),
  CONSTRAINT favorite_target_check CHECK (
    (favorite_type = 'profile' AND favorited_profile_id IS NOT NULL AND favorited_property_id IS NULL) OR
    (favorite_type = 'property' AND favorited_property_id IS NOT NULL AND favorited_profile_id IS NULL)
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
-- APPLICATIONS (Placeholder for future implementation)
-- ============================================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicant_matching_profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE,
  application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('housing', 'employment')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'withdrawn')),
  application_data JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT application_target_check CHECK (
    (application_type = 'housing' AND property_id IS NOT NULL AND employer_id IS NULL) OR
    (application_type = 'employment' AND employer_id IS NOT NULL AND property_id IS NULL)
  )
);

-- ============================================================================
-- MESSAGES (Placeholder for future implementation)
-- ============================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_group_id UUID REFERENCES match_groups(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  message_body TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'direct' CHECK (message_type IN ('direct', 'group', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT no_self_message CHECK (sender_id != recipient_id)
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trigger_update_applications_timestamp
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

COMMIT;
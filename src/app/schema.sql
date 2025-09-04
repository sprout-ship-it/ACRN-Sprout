-- Recovery Housing App Database Schema
-- Run this script in your Supabase SQL editor to create all necessary tables

-- Enable Row Level Security on auth.users (should already be enabled)
-- This ensures users can only access their own data

-- ==================== MAIN TABLES ====================

-- 1. Registrant Profiles Table
-- Stores basic user information and roles
CREATE TABLE IF NOT EXISTS registrant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Basic Profiles Table 
-- Stores demographic and personal information
CREATE TABLE IF NOT EXISTS basic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  phone TEXT,
  gender TEXT,
  sex TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Applicant Forms Table (Matching Profiles)
-- Stores detailed matching preferences and recovery information
CREATE TABLE IF NOT EXISTS applicant_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  
  -- Location & Housing Preferences
  preferred_location TEXT,
  max_commute INTEGER, -- in minutes
  housing_type TEXT[] DEFAULT '{}',
  price_range_min INTEGER DEFAULT 0,
  price_range_max INTEGER DEFAULT 5000,
  move_in_date DATE,
  lease_duration TEXT,
  
  -- Personal Preferences  
  age_range_min INTEGER DEFAULT 18,
  age_range_max INTEGER DEFAULT 65,
  gender_preference TEXT,
  smoking_preference TEXT,
  pet_preference TEXT,
  substance_use TEXT[] DEFAULT '{}',
  
  -- Recovery Information
  recovery_stage TEXT,
  program_type TEXT[] DEFAULT '{}',
  sobriety_date DATE,
  sponsor_mentor TEXT,
  support_meetings TEXT,
  
  -- Lifestyle Preferences
  work_schedule TEXT,
  social_level TEXT,
  cleanliness_level TEXT,
  noise_level TEXT,
  guest_policy TEXT,
  
  -- Compatibility Factors
  interests TEXT[] DEFAULT '{}',
  deal_breakers TEXT[] DEFAULT '{}',
  important_qualities TEXT[] DEFAULT '{}',
  
  -- Open-ended responses
  about_me TEXT,
  looking_for TEXT,
  additional_info TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Match Requests Table
-- Stores all match requests between users
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'matched', 'unmatched')) DEFAULT 'pending',
  message TEXT,
  rejection_reason TEXT,
  match_score INTEGER, -- calculated compatibility score
  
  -- Mutual approval tracking
  requester_approved BOOLEAN DEFAULT FALSE,
  target_approved BOOLEAN DEFAULT FALSE,
  
  -- Match metadata
  matched_at TIMESTAMP WITH TIME ZONE,
  unmatched_at TIMESTAMP WITH TIME ZONE,
  unmatched_by UUID REFERENCES registrant_profiles(id),
  unmatched_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate requests
  UNIQUE(requester_id, target_id)
);

-- 5. Properties Table
-- Stores landlord property listings
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  
  -- Basic Property Info
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT, -- apartment, house, condo, etc.
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  
  -- Property Details
  bedrooms INTEGER DEFAULT 0,
  bathrooms DECIMAL DEFAULT 1,
  square_feet INTEGER,
  
  -- Pricing
  monthly_rent INTEGER NOT NULL,
  security_deposit INTEGER,
  application_fee INTEGER DEFAULT 0,
  
  -- Lease Terms
  lease_length TEXT,
  available_date DATE,
  
  -- Features & Amenities
  amenities TEXT[] DEFAULT '{}',
  utilities_included TEXT[] DEFAULT '{}',
  parking_available BOOLEAN DEFAULT FALSE,
  pets_allowed BOOLEAN DEFAULT FALSE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  
  -- Recovery-Friendly Features
  is_recovery_friendly BOOLEAN DEFAULT TRUE,
  recovery_features TEXT[] DEFAULT '{}', -- close to meetings, sober living, etc.
  
  -- Status
  status TEXT CHECK (status IN ('available', 'rented', 'pending', 'maintenance', 'inactive')) DEFAULT 'available',
  
  -- Media
  images TEXT[] DEFAULT '{}', -- array of image URLs
  virtual_tour_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Peer Support Specialists Table
-- Stores peer support specialist profiles and specialties
CREATE TABLE IF NOT EXISTS peer_support_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  
  -- Professional Info
  title TEXT, -- Certified Peer Specialist, etc.
  years_experience INTEGER,
  certifications TEXT[] DEFAULT '{}',
  license_number TEXT,
  
  -- Specialties & Approach
  specialties TEXT[] DEFAULT '{}',
  recovery_approach TEXT[] DEFAULT '{}', -- 12-step, SMART, secular, etc.
  age_groups_served TEXT[] DEFAULT '{}', -- young adults, adults, seniors
  populations_served TEXT[] DEFAULT '{}', -- women, LGBTQ+, veterans, etc.
  
  -- Services Offered
  individual_sessions BOOLEAN DEFAULT TRUE,
  group_sessions BOOLEAN DEFAULT TRUE,
  crisis_support BOOLEAN DEFAULT FALSE,
  housing_assistance BOOLEAN DEFAULT TRUE,
  employment_support BOOLEAN DEFAULT FALSE,
  
  -- Availability
  available_hours TEXT, -- JSON object with schedule
  preferred_contact_method TEXT,
  response_time TEXT, -- within 24 hours, etc.
  
  -- Location & Service Area
  service_area TEXT[] DEFAULT '{}', -- cities/regions served
  offers_telehealth BOOLEAN DEFAULT TRUE,
  offers_in_person BOOLEAN DEFAULT TRUE,
  
  -- Bio
  bio TEXT,
  recovery_story TEXT, -- optional personal recovery story
  
  -- Status
  is_accepting_clients BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 7. Match Groups Table
-- Stores complete matches (roommate pair + landlord + peer support)
CREATE TABLE IF NOT EXISTS match_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Group Members
  applicant_1_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  applicant_2_id UUID REFERENCES registrant_profiles(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES registrant_profiles(id) ON DELETE SET NULL,
  peer_support_id UUID REFERENCES registrant_profiles(id) ON DELETE SET NULL,
  
  -- Property
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT CHECK (status IN ('forming', 'complete', 'active', 'dissolved')) DEFAULT 'forming',
  
  -- Dates
  formed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lease_start_date DATE,
  lease_end_date DATE,
  dissolved_at TIMESTAMP WITH TIME ZONE,
  dissolved_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_registrant_profiles_email ON registrant_profiles(email);
CREATE INDEX IF NOT EXISTS idx_registrant_profiles_roles ON registrant_profiles USING GIN(roles);

CREATE INDEX IF NOT EXISTS idx_basic_profiles_user_id ON basic_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_applicant_forms_user_id ON applicant_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_applicant_forms_active ON applicant_forms(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_applicant_forms_location ON applicant_forms(preferred_location);
CREATE INDEX IF NOT EXISTS idx_applicant_forms_recovery_stage ON applicant_forms(recovery_stage);

CREATE INDEX IF NOT EXISTS idx_match_requests_requester ON match_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_target ON match_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);

CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(monthly_rent);

CREATE INDEX IF NOT EXISTS idx_peer_support_user_id ON peer_support_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_support_accepting ON peer_support_profiles(is_accepting_clients) WHERE is_accepting_clients = TRUE;

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS on all tables
ALTER TABLE registrant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE basic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registrant_profiles
CREATE POLICY "Users can view own profile" ON registrant_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON registrant_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other active profiles for matching" ON registrant_profiles
  FOR SELECT USING (is_active = TRUE);

-- RLS Policies for basic_profiles
CREATE POLICY "Users can manage own basic profile" ON basic_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for applicant_forms
CREATE POLICY "Users can manage own matching profile" ON applicant_forms
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view active matching profiles" ON applicant_forms
  FOR SELECT USING (is_active = TRUE);

-- RLS Policies for match_requests
CREATE POLICY "Users can view their match requests" ON match_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Users can create match requests" ON match_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update match requests they're involved in" ON match_requests
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- RLS Policies for properties
CREATE POLICY "Landlords can manage own properties" ON properties
  FOR ALL USING (auth.uid() = landlord_id);

CREATE POLICY "Users can view available properties" ON properties
  FOR SELECT USING (status = 'available');

-- RLS Policies for peer_support_profiles
CREATE POLICY "Peer specialists can manage own profile" ON peer_support_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view accepting peer specialists" ON peer_support_profiles
  FOR SELECT USING (is_accepting_clients = TRUE);

-- RLS Policies for match_groups
CREATE POLICY "Group members can view their match groups" ON match_groups
  FOR SELECT USING (
    auth.uid() = applicant_1_id OR 
    auth.uid() = applicant_2_id OR 
    auth.uid() = landlord_id OR 
    auth.uid() = peer_support_id
  );

-- ==================== FUNCTIONS AND TRIGGERS ====================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_registrant_profiles_updated_at 
  BEFORE UPDATE ON registrant_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_basic_profiles_updated_at 
  BEFORE UPDATE ON basic_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_forms_updated_at 
  BEFORE UPDATE ON applicant_forms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_requests_updated_at 
  BEFORE UPDATE ON match_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_support_profiles_updated_at 
  BEFORE UPDATE ON peer_support_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_groups_updated_at 
  BEFORE UPDATE ON match_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update match status when both parties approve
CREATE OR REPLACE FUNCTION update_match_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If both parties have approved, update status to 'matched'
  IF NEW.requester_approved = TRUE AND NEW.target_approved = TRUE AND NEW.status = 'approved' THEN
    NEW.status = 'matched';
    NEW.matched_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_match_status_trigger
  BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_match_status();

-- ==================== SAMPLE DATA (Optional) ====================

-- Insert sample roles for testing
-- You can remove this section in production

INSERT INTO registrant_profiles (id, email, first_name, last_name, roles) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo.applicant@example.com', 'Demo', 'Applicant', ARRAY['applicant']),
  ('00000000-0000-0000-0000-000000000002', 'demo.landlord@example.com', 'Demo', 'Landlord', ARRAY['landlord']),
  ('00000000-0000-0000-0000-000000000003', 'demo.peer@example.com', 'Demo', 'Peer', ARRAY['peer'])
ON CONFLICT (email) DO NOTHING;

-- ==================== NOTES ====================

/*
IMPORTANT SETUP STEPS:

1. Run this entire script in your Supabase SQL Editor

2. Set up Authentication:
   - Go to Authentication > Settings in Supabase dashboard
   - Enable email signup
   - Configure email templates as needed

3. Set up Storage (for property images):
   - Go to Storage in Supabase dashboard
   - Create a bucket called 'property-images'
   - Set appropriate policies for image uploads

4. Environment Variables:
   - Copy .env.example to .env.local
   - Fill in your Supabase URL and anon key

5. Testing:
   - The sample data above creates test users
   - Use these to test your application functionality
   - Remove sample data before production

6. Production Considerations:
   - Review and adjust RLS policies for your specific needs
   - Add additional indexes based on your query patterns
   - Set up proper backup and monitoring
   - Configure email templates for notifications
   - Add proper error handling and logging
*/
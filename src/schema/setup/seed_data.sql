-- src/schema/setup/seed_data.sql
-- ============================================================================
-- DEVELOPMENT SEED DATA
-- ============================================================================
-- Sample data for development and testing purposes
-- WARNING: This is for development only - do not run in production
-- Dependencies: Requires complete schema installation from install.sql
-- ============================================================================

-- ============================================================================
-- SAFETY CHECK
-- ============================================================================
-- Verify this is not being run in production
DO $$
BEGIN
  IF current_database() = 'production' OR current_database() LIKE '%prod%' THEN
    RAISE EXCEPTION 'Seed data cannot be run in production database: %', current_database();
  END IF;
END $$;

-- ============================================================================
-- SAMPLE REGISTRANT PROFILES
-- ============================================================================
-- Note: In real application, these would be created via auth.users trigger
-- For development, we're creating them directly

INSERT INTO registrant_profiles (id, user_id, first_name, last_name, email, roles, is_active) VALUES
-- Applicants
('a1111111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111111', 'Sarah', 'Johnson', 'sarah.johnson@example.com', ARRAY['applicant'], true),
('a2222222-2222-2222-2222-222222222222', 'u2222222-2222-2222-2222-222222222222', 'Michael', 'Chen', 'michael.chen@example.com', ARRAY['applicant'], true),
('a3333333-3333-3333-3333-333333333333', 'u3333333-3333-3333-3333-333333333333', 'Jessica', 'Rodriguez', 'jessica.rodriguez@example.com', ARRAY['applicant'], true),

-- Landlords
('l1111111-1111-1111-1111-111111111111', 'ul111111-1111-1111-1111-111111111111', 'David', 'Wilson', 'david.wilson@example.com', ARRAY['landlord'], true),
('l2222222-2222-2222-2222-222222222222', 'ul222222-2222-2222-2222-222222222222', 'Maria', 'Garcia', 'maria.garcia@example.com', ARRAY['landlord'], true),

-- Multi-role users
('m1111111-1111-1111-1111-111111111111', 'um111111-1111-1111-1111-111111111111', 'Robert', 'Thompson', 'robert.thompson@example.com', ARRAY['applicant', 'peer-support'], true),

-- Employers
('e1111111-1111-1111-1111-111111111111', 'ue111111-1111-1111-1111-111111111111', 'Lisa', 'Anderson', 'lisa.anderson@example.com', ARRAY['employer'], true),

-- Peer Support
('p1111111-1111-1111-1111-111111111111', 'up111111-1111-1111-1111-111111111111', 'James', 'Miller', 'james.miller@example.com', ARRAY['peer-support'], true);

-- ============================================================================
-- SAMPLE APPLICANT MATCHING PROFILES
-- ============================================================================

INSERT INTO applicant_matching_profiles (
  user_id, primary_phone, date_of_birth, preferred_roommate_gender, 
  primary_city, primary_state, budget_min, budget_max, 
  recovery_stage, recovery_methods, program_types, primary_issues,
  spiritual_affiliation, social_level, cleanliness_level, noise_tolerance,
  work_schedule, move_in_date, about_me, looking_for, interests,
  is_active, profile_completed
) VALUES
-- Sarah Johnson - Early recovery, seeking sober living
('a1111111-1111-1111-1111-111111111111', '555-0101', '1995-03-15', 'any', 
 'Portland', 'OR', 800, 1200, 
 'early-recovery', ARRAY['AA', '12-step'], ARRAY['outpatient'], ARRAY['alcohol'],
 'spiritual-not-religious', 3, 4, 3,
 'full-time-days', '2025-11-01', 
 'I am 6 months into my recovery journey and looking for a supportive living environment. I work full-time as a graphic designer and value quiet spaces for creativity.',
 'Looking for a clean, supportive home with others who understand the recovery process. I prefer a quiet environment where I can focus on my healing and work.',
 ARRAY['art', 'yoga', 'hiking', 'cooking'],
 true, true),

-- Michael Chen - Stable recovery, seeking roommate
('a2222222-2222-2222-2222-222222222222', '555-0102', '1988-07-22', 'male', 
 'Seattle', 'WA', 600, 1000, 
 'stable-recovery', ARRAY['NA', 'SMART'], ARRAY['intensive-outpatient'], ARRAY['opioids'],
 'agnostic', 4, 3, 2,
 'full-time-evenings', '2025-10-15', 
 'Two years clean and working as a software developer. I enjoy a social but respectful living environment and am committed to maintaining my recovery.',
 'Seeking a responsible roommate who supports recovery. I am clean, reliable, and looking for a stable housing situation with mutual respect.',
 ARRAY['gaming', 'technology', 'fitness', 'movies'],
 true, true),

-- Jessica Rodriguez - Long-term recovery, flexible
('a3333333-3333-3333-3333-333333333333', '555-0103', '1990-12-08', 'female', 
 'San Francisco', 'CA', 1000, 1800, 
 'long-term-recovery', ARRAY['therapy', 'meditation'], ARRAY['aftercare'], ARRAY['anxiety', 'depression'],
 'christian', 2, 5, 4,
 'flexible', '2025-12-01', 
 'Five years in recovery, working as a nurse. I value cleanliness and quiet study time. Very committed to helping others in their recovery journey.',
 'Looking for a peaceful home environment with others who value personal growth and recovery. I can be flexible with living arrangements.',
 ARRAY['reading', 'volunteering', 'gardening', 'meditation'],
 true, true);

-- ============================================================================
-- SAMPLE LANDLORD PROFILES
-- ============================================================================

INSERT INTO landlord_profiles (
  user_id, primary_phone, primary_service_city, primary_service_state,
  business_name, recovery_friendly, recovery_experience_level,
  bio, currently_accepting_tenants, is_active, profile_completed
) VALUES
-- David Wilson - Sober living operator
('l1111111-1111-1111-1111-111111111111', '555-0201', 'Portland', 'OR',
 'New Beginnings Recovery Housing', true, 'expert',
 'I have been operating sober living homes for over 10 years. Our focus is on creating a supportive, structured environment that promotes long-term recovery and personal growth.',
 true, true, true),

-- Maria Garcia - Recovery-friendly landlord
('l2222222-2222-2222-2222-222222222222', '555-0202', 'Seattle', 'WA',
 'Safe Harbor Properties', true, 'experienced',
 'As someone with personal experience in recovery, I understand the importance of stable housing. I offer both sober living and recovery-friendly apartments.',
 true, true, true);

-- ============================================================================
-- SAMPLE PROPERTIES
-- ============================================================================

INSERT INTO properties (
  landlord_id, is_recovery_housing, property_type, title, description,
  address, city, state, zip_code, bedrooms, total_beds, available_beds,
  bathrooms, monthly_rent, utilities_included, house_rules,
  gender_restrictions, status, accepting_applications
) VALUES
-- Sober living properties
((SELECT id FROM landlord_profiles WHERE user_id = 'l1111111-1111-1111-1111-111111111111'), 
 true, 'sober_living_level_2', 'New Beginnings Men''s House',
 'Structured sober living environment with case management support, weekly house meetings, and recovery programming. Located in a quiet residential neighborhood with easy access to public transportation.',
 '1234 Recovery Way', 'Portland', 'OR', '97201', 4, 8, 2,
 2.5, 650, ARRAY['utilities', 'wifi'], 
 ARRAY['no substances', 'house meetings', 'chores', '10pm curfew weeknights'],
 'male', 'available', true),

((SELECT id FROM landlord_profiles WHERE user_id = 'l1111111-1111-1111-1111-111111111111'), 
 true, 'sober_living_level_1', 'New Beginnings Women''s House',
 'Supportive women-only sober living home with optional case management. Focus on peer support and independent living skills development.',
 '5678 Serenity Street', 'Portland', 'OR', '97202', 5, 6, 1,
 3.0, 700, ARRAY['utilities', 'wifi', 'basic-cable'],
 ARRAY['no substances', 'weekly meetings', 'shared chores', 'quiet hours 10pm-7am'],
 'female', 'available', true),

-- Recovery-friendly apartments
((SELECT id FROM landlord_profiles WHERE user_id = 'l2222222-2222-2222-2222-222222222222'), 
 false, 'apartment', 'Recovery-Friendly Studio Apartments',
 'Clean, affordable studio apartments in a recovery-supportive building. No discrimination based on recovery status. Close to public transportation and recovery resources.',
 '910 Hope Avenue #101', 'Seattle', 'WA', '98101', 0, 1, 1,
 1.0, 850, ARRAY['water', 'heat'],
 NULL, 'any', 'available', true),

((SELECT id FROM landlord_profiles WHERE user_id = 'l2222222-2222-2222-2222-222222222222'), 
 false, 'house', 'Shared Recovery House',
 'Large house perfect for 2-3 people in recovery. Landlord understands the recovery process and provides supportive, non-judgmental environment.',
 '1122 Peaceful Place', 'Seattle', 'WA', '98102', 3, 3, 2,
 2.0, 1200, ARRAY['utilities'],
 NULL, 'any', 'available', true);

-- ============================================================================
-- SAMPLE EMPLOYER PROFILES
-- ============================================================================

INSERT INTO employer_profiles (
  user_id, primary_phone, business_type, industry, service_city, service_state,
  job_types_available, recovery_friendly, description, accepting_applications,
  is_active, profile_completed
) VALUES
('e1111111-1111-1111-1111-111111111111', '555-0301', 'Small Business', 'Food Service',
 'Portland', 'OR', ARRAY['kitchen-prep', 'server', 'cashier'],
 true, 
 'Fresh Start Cafe is a recovery-friendly restaurant that provides second chances. We offer flexible scheduling for treatment appointments and a supportive work environment.',
 true, true, true);

-- ============================================================================
-- SAMPLE PEER SUPPORT PROFILES
-- ============================================================================

INSERT INTO peer_support_profiles (
  user_id, primary_phone, professional_title, service_city, service_state,
  specialties, supported_recovery_methods, recovery_stage, time_in_recovery,
  bio, about_me, accepting_clients, is_active, profile_completed
) VALUES
('p1111111-1111-1111-1111-111111111111', '555-0401', 'Certified Peer Support Specialist',
 'Portland', 'OR', ARRAY['addiction-recovery', 'trauma-informed-care', 'housing-navigation'],
 ARRAY['12-step', 'SMART', 'therapy'], 'long-term-recovery', '8-years',
 'Certified peer support specialist with 8 years of recovery experience. I specialize in helping people navigate housing challenges and early recovery struggles.',
 'Having walked the path of recovery myself, I understand the challenges of finding stable housing and rebuilding life. I am here to offer support, guidance, and hope.',
 true, true, true);

-- ============================================================================
-- SAMPLE HOUSING MATCHES
-- ============================================================================

INSERT INTO housing_matches (
  applicant_id, property_id, compatibility_score, status, applicant_message
) VALUES
((SELECT id FROM applicant_matching_profiles WHERE user_id = 'a1111111-1111-1111-1111-111111111111'),
 (SELECT id FROM properties WHERE title = 'New Beginnings Women''s House'),
 85, 'applicant-liked', 
 'Hi! I am very interested in your women''s sober living home. I am 6 months into recovery and looking for a supportive environment. I work full-time and am committed to my recovery journey.'),

((SELECT id FROM applicant_matching_profiles WHERE user_id = 'a2222222-2222-2222-2222-222222222222'),
 (SELECT id FROM properties WHERE title = 'Shared Recovery House'),
 78, 'potential', NULL);

-- ============================================================================
-- SAMPLE FAVORITES
-- ============================================================================

INSERT INTO favorites (
  favoriting_user_id, favorited_property_id, favorite_type
) VALUES
('u1111111-1111-1111-1111-111111111111',
 (SELECT id FROM properties WHERE title = 'New Beginnings Women''s House'),
 'property'),

('u2222222-2222-2222-2222-222222222222',
 (SELECT id FROM properties WHERE title = 'Recovery-Friendly Studio Apartments'),
 'property');

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
-- Development seed data has been successfully loaded.
-- 
-- Summary of created data:
-- - 8 registrant profiles (applicants, landlords, employers, peer support)
-- - 3 applicant matching profiles with detailed information
-- - 2 landlord profiles (sober living operator + recovery-friendly landlord)
-- - 4 properties (2 sober living, 2 recovery-friendly rentals)
-- - 1 employer profile (recovery-friendly cafe)
-- - 1 peer support specialist profile
-- - 2 housing matches (1 with interest, 1 potential)
-- - 2 favorites (properties saved by applicants)
-- 
-- This data provides a realistic foundation for testing the application's
-- matching algorithms, search functionality, and user interactions.
-- ============================================================================
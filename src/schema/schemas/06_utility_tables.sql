-- src/schema/schemas/06_utility_tables.sql
-- Dependencies: registrant_profiles, applicant_matching_profiles, properties tables
-- Description: Reference tables, audit logs, and system utility tables

-- ============================================================================
-- REFERENCE/LOOKUP TABLES
-- ============================================================================
-- Purpose: Standardize dropdown values and ensure data consistency across the platform
-- ============================================================================

-- ============================================================================
-- RECOVERY STAGES REFERENCE
-- ============================================================================

CREATE TABLE recovery_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO recovery_stages (code, display_name, description, sort_order) VALUES
('detox', 'Detoxification', 'Currently in or recently completed medical detox', 1),
('early-recovery', 'Early Recovery (0-90 days)', 'First 90 days of sobriety', 2),
('transitional', 'Transitional Recovery (3-12 months)', 'Building foundation and life skills', 3),
('stable-recovery', 'Stable Recovery (1-5 years)', 'Established sobriety with ongoing growth', 4),
('long-term-recovery', 'Long-term Recovery (5+ years)', 'Sustained recovery with life stability', 5),
('maintenance', 'Maintenance Phase', 'Focused on maintaining recovery achievements', 6);

-- ============================================================================
-- SPIRITUAL AFFILIATIONS REFERENCE
-- ============================================================================

CREATE TABLE spiritual_affiliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO spiritual_affiliations (code, display_name, description, sort_order) VALUES
('christian', 'Christian', 'Various Christian denominations', 1),
('catholic', 'Catholic', 'Roman Catholic faith', 2),
('jewish', 'Jewish', 'Jewish faith traditions', 3),
('muslim', 'Muslim', 'Islamic faith', 4),
('buddhist', 'Buddhist', 'Buddhist traditions', 5),
('hindu', 'Hindu', 'Hindu traditions', 6),
('spiritual-not-religious', 'Spiritual but not religious', 'Personal spirituality without organized religion', 7),
('agnostic', 'Agnostic', 'Questioning or uncertain about spiritual matters', 8),
('atheist', 'Atheist', 'Non-religious worldview', 9),
('native-american', 'Native American', 'Indigenous spiritual traditions', 10),
('other', 'Other', 'Other spiritual or religious traditions', 11),
('prefer-not-to-say', 'Prefer not to say', 'Wishes to keep spiritual beliefs private', 12);

-- ============================================================================
-- RECOVERY METHODS REFERENCE
-- ============================================================================

CREATE TABLE recovery_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'program', 'therapy', 'medication', 'alternative'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO recovery_methods (code, display_name, description, category, sort_order) VALUES
-- 12-Step Programs
('AA', 'Alcoholics Anonymous', 'Traditional 12-step program for alcohol addiction', 'program', 1),
('NA', 'Narcotics Anonymous', '12-step program for drug addiction', 'program', 2),
('CA', 'Cocaine Anonymous', '12-step program specifically for cocaine addiction', 'program', 3),
('HA', 'Heroin Anonymous', '12-step program for heroin addiction', 'program', 4),

-- Alternative Programs  
('SMART', 'SMART Recovery', 'Self-Management and Recovery Training', 'program', 10),
('refuge-recovery', 'Refuge Recovery', 'Buddhist-inspired recovery program', 'program', 11),
('celebrate-recovery', 'Celebrate Recovery', 'Christian-based recovery program', 'program', 12),
('lifering', 'LifeRing', 'Secular self-help recovery program', 'program', 13),

-- Therapy Approaches
('therapy', 'Individual Therapy', 'One-on-one counseling', 'therapy', 20),
('group-therapy', 'Group Therapy', 'Therapeutic group sessions', 'therapy', 21),
('CBT', 'Cognitive Behavioral Therapy', 'CBT approach to recovery', 'therapy', 22),
('DBT', 'Dialectical Behavior Therapy', 'DBT skills and approach', 'therapy', 23),
('EMDR', 'EMDR Therapy', 'Eye Movement Desensitization and Reprocessing', 'therapy', 24),

-- Medical/Medication
('MAT', 'Medication Assisted Treatment', 'Medically supervised treatment', 'medication', 30),
('suboxone', 'Suboxone', 'Buprenorphine/naloxone treatment', 'medication', 31),
('methadone', 'Methadone', 'Methadone maintenance treatment', 'medication', 32),

-- Alternative/Holistic
('meditation', 'Meditation', 'Mindfulness and meditation practices', 'alternative', 40),
('yoga', 'Yoga', 'Yoga practice for recovery', 'alternative', 41),
('acupuncture', 'Acupuncture', 'Traditional Chinese medicine approach', 'alternative', 42),
('art-therapy', 'Art Therapy', 'Creative expression in recovery', 'alternative', 43),
('music-therapy', 'Music Therapy', 'Music-based therapeutic approach', 'alternative', 44);

-- ============================================================================
-- PROPERTY STATUS REFERENCE
-- ============================================================================

CREATE TABLE property_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  allows_applications BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO property_statuses (code, display_name, description, allows_applications, sort_order) VALUES
('available', 'Available', 'Property is available for immediate occupancy', true, 1),
('waitlist', 'Waitlist Only', 'Property is full but accepting waitlist applications', true, 2),
('full', 'Full', 'Property is at capacity with no waitlist', false, 3),
('temporarily_closed', 'Temporarily Closed', 'Property temporarily unavailable', false, 4),
('under_renovation', 'Under Renovation', 'Property being updated or repaired', false, 5),
('inactive', 'Inactive', 'Property listing is inactive', false, 6);

-- ============================================================================
-- BUSINESS TYPES REFERENCE
-- ============================================================================

CREATE TABLE business_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'service', 'retail', 'hospitality', 'healthcare', etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO business_types (code, display_name, description, category, sort_order) VALUES
('restaurant', 'Restaurant', 'Food service establishment', 'hospitality', 1),
('retail', 'Retail Store', 'Retail sales business', 'retail', 2),
('healthcare', 'Healthcare Facility', 'Medical or healthcare services', 'healthcare', 3),
('nonprofit', 'Non-Profit Organization', 'Non-profit service organization', 'service', 4),
('construction', 'Construction Company', 'Building and construction services', 'trades', 5),
('manufacturing', 'Manufacturing', 'Production and manufacturing', 'industrial', 6),
('office', 'Office/Professional Services', 'Professional or office environment', 'professional', 7),
('warehouse', 'Warehouse/Distribution', 'Logistics and distribution', 'industrial', 8),
('cleaning', 'Cleaning Services', 'Janitorial and cleaning services', 'service', 9),
('landscaping', 'Landscaping', 'Grounds maintenance and landscaping', 'service', 10);

-- ============================================================================
-- AUDIT TABLES
-- ============================================================================
-- Purpose: Track important changes to profiles, matches, and system operations
-- ============================================================================

-- ============================================================================
-- PROFILE AUDIT LOG
-- ============================================================================

CREATE TABLE profile_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  profile_type VARCHAR(50) NOT NULL, -- 'applicant', 'landlord', 'employer', 'peer_support'
  profile_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'completed', 'activated', 'deactivated'
  field_changes JSONB, -- Record of what fields changed
  old_values JSONB, -- Previous values for changed fields
  new_values JSONB, -- New values for changed fields
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MATCH AUDIT LOG
-- ============================================================================

CREATE TABLE match_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_type VARCHAR(50) NOT NULL, -- 'housing', 'employment', 'peer_support'
  match_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'status_changed', 'deleted'
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  initiated_by_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SYSTEM CONFIGURATION TABLES
-- ============================================================================
-- Purpose: Application settings and configuration values
-- ============================================================================

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  data_type VARCHAR(20) DEFAULT 'string', -- 'string', 'integer', 'boolean', 'json'
  is_public BOOLEAN DEFAULT FALSE, -- Whether setting can be exposed to frontend
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_public) VALUES
('matching.compatibility_threshold', '70', 'Minimum compatibility score for showing matches', 'integer', true),
('matching.max_distance_miles', '50', 'Maximum distance for location-based matching', 'integer', true),
('profiles.min_completion_percentage', '80', 'Minimum profile completion for matching eligibility', 'integer', true),
('communication.max_daily_requests', '10', 'Maximum match requests per user per day', 'integer', false),
('properties.max_per_landlord', '20', 'Maximum properties per landlord account', 'integer', false),
('search.results_per_page', '20', 'Number of search results per page', 'integer', true);

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  subject_template TEXT,
  body_template TEXT NOT NULL,
  template_type VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'push', 'in_app'
  variables JSONB, -- Available template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notification_templates (template_key, template_name, subject_template, body_template, template_type, variables) VALUES
('match_notification', 'New Match Notification', 'You have a new match!', 
 'Hi {{user_first_name}},\n\nYou have a new {{match_type}} match! {{match_details}}\n\nLog in to view details and respond.\n\nBest regards,\nRecovery Housing Connect', 
 'email', '["user_first_name", "match_type", "match_details"]'),

('profile_completion_reminder', 'Complete Your Profile', 'Complete your profile to find better matches',
 'Hi {{user_first_name}},\n\nYour profile is {{completion_percentage}}% complete. Complete your profile to find better matches and increase your visibility.\n\nLog in to complete your profile.\n\nBest regards,\nRecovery Housing Connect',
 'email', '["user_first_name", "completion_percentage"]'),

('property_inquiry', 'New Property Inquiry', 'Someone is interested in your property',
 'Hi {{landlord_name}},\n\n{{applicant_name}} is interested in your property "{{property_title}}". \n\nMessage: {{inquiry_message}}\n\nLog in to respond.\n\nBest regards,\nRecovery Housing Connect',
 'email', '["landlord_name", "applicant_name", "property_title", "inquiry_message"]');

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'profile_update', 'search', 'match_action', 'message_sent'
  entity_type VARCHAR(50), -- 'profile', 'property', 'match', 'message'
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR UTILITY TABLES
-- ============================================================================

-- Reference table indexes
CREATE INDEX idx_recovery_stages_code ON recovery_stages(code);
CREATE INDEX idx_recovery_stages_active ON recovery_stages(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_spiritual_affiliations_code ON spiritual_affiliations(code);
CREATE INDEX idx_spiritual_affiliations_active ON spiritual_affiliations(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_recovery_methods_code ON recovery_methods(code);
CREATE INDEX idx_recovery_methods_category ON recovery_methods(category);
CREATE INDEX idx_recovery_methods_active ON recovery_methods(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_property_statuses_code ON property_statuses(code);
CREATE INDEX idx_property_statuses_allows_applications ON property_statuses(allows_applications) WHERE allows_applications = TRUE;

CREATE INDEX idx_business_types_code ON business_types(code);
CREATE INDEX idx_business_types_category ON business_types(category);

-- Audit table indexes
CREATE INDEX idx_profile_audit_log_user_id ON profile_audit_log(user_id);
CREATE INDEX idx_profile_audit_log_profile ON profile_audit_log(profile_type, profile_id);
CREATE INDEX idx_profile_audit_log_action ON profile_audit_log(action);
CREATE INDEX idx_profile_audit_log_created_at ON profile_audit_log(created_at DESC);

CREATE INDEX idx_match_audit_log_match ON match_audit_log(match_type, match_id);
CREATE INDEX idx_match_audit_log_user ON match_audit_log(initiated_by_user_id);
CREATE INDEX idx_match_audit_log_created_at ON match_audit_log(created_at DESC);

-- System table indexes
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = TRUE;

CREATE INDEX idx_notification_templates_key ON notification_templates(template_key);
CREATE INDEX idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UTILITY TABLES
-- ============================================================================

-- System settings timestamp trigger
CREATE TRIGGER trigger_update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Notification templates timestamp trigger
CREATE TRIGGER trigger_update_notification_templates_timestamp
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE recovery_stages IS 'Reference table for standardizing recovery stage terminology across the platform';
COMMENT ON TABLE spiritual_affiliations IS 'Reference table for spiritual and religious affiliations in recovery context';
COMMENT ON TABLE recovery_methods IS 'Reference table for various recovery approaches and methodologies';
COMMENT ON TABLE property_statuses IS 'Reference table for property availability status with application rules';
COMMENT ON TABLE business_types IS 'Reference table for employer business classifications';

COMMENT ON TABLE profile_audit_log IS 'Audit trail for all profile changes including field-level tracking';
COMMENT ON TABLE match_audit_log IS 'Audit trail for matching system actions and status changes';
COMMENT ON TABLE system_settings IS 'Application configuration settings with type safety and access control';
COMMENT ON TABLE notification_templates IS 'Email and notification templates with variable substitution';
COMMENT ON TABLE activity_log IS 'General user activity tracking for analytics and security';

-- ============================================================================
-- UTILITY TABLE NOTES
-- ============================================================================

/*
REFERENCE TABLE BENEFITS:
- Data consistency across all profiles and properties
- Standardized dropdown options for better matching
- Easier maintenance and updates to available options
- Better data quality and reporting capabilities

AUDIT SYSTEM BENEFITS:
- Complete change tracking for compliance and debugging
- User activity monitoring for security and analytics
- Match history for algorithm improvement
- Profile completion tracking for user engagement

SYSTEM CONFIGURATION:
- Runtime configuration without code deployments
- Feature toggles and matching algorithm tuning
- Environment-specific settings support
- Public/private setting classification for security

NOTIFICATION SYSTEM:
- Consistent messaging across the platform
- Template versioning and A/B testing support
- Multi-channel communication support
- Variable substitution for personalization
*/
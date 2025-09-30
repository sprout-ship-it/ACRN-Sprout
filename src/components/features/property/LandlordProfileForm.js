// src/components/features/property/LandlordProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';

const LandlordProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Basic Contact Information
    primary_phone: '',
    contact_email: '',
    contact_person: '',
    
    // Service Areas
    primary_service_city: '',
    primary_service_state: '',
    service_areas: [],
    
    // Business Information
    business_name: '',
    business_type: '',
    years_in_business: '',
    
    // Recovery Support Philosophy
    recovery_friendly: true,
    recovery_experience_level: '',
    preferred_recovery_stages: [],
    supported_recovery_methods: [],
    
    // Operational Information
    max_properties: '10',
    accepts_subsidies: false,
    background_check_required: false,
    
    // Business Policies
    standard_lease_terms: '',
    application_process_description: '',
    
    // Profile Content
    bio: '',
    experience_description: '',
    approach_philosophy: '',
    
    // Availability & Status
    currently_accepting_tenants: true,
    preferred_contact_method: 'email',
    response_time_expectation: '24_hours'
  });

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const recoveryExperienceLevels = [
    { value: 'new_to_recovery_housing', label: 'New to Recovery Housing' },
    { value: 'some_experience', label: 'Some Experience (1-3 years)' },
    { value: 'experienced', label: 'Experienced (3-5 years)' },
    { value: 'very_experienced', label: 'Very Experienced (5+ years)' },
    { value: 'expert', label: 'Expert/Certified Recovery Housing Provider' }
  ];

  const recoveryStages = [
    { value: 'early_recovery', label: 'Early Recovery (0-1 year)' },
    { value: 'ongoing_recovery', label: 'Ongoing Recovery (1-3 years)' },
    { value: 'stable_recovery', label: 'Stable Recovery (3+ years)' },
    { value: 'all_stages', label: 'All Recovery Stages' }
  ];

  const recoveryMethods = [
    { value: '12_step', label: '12-Step Programs (AA, NA, etc.)' },
    { value: 'smart_recovery', label: 'SMART Recovery' },
    { value: 'refuge_recovery', label: 'Refuge Recovery' },
    { value: 'celebrate_recovery', label: 'Celebrate Recovery' },
    { value: 'therapy_counseling', label: 'Therapy/Counseling' },
    { value: 'medication_assisted', label: 'Medication-Assisted Treatment' },
    { value: 'holistic_approaches', label: 'Holistic Approaches' },
    { value: 'faith_based', label: 'Faith-Based Recovery' },
    { value: 'secular_approaches', label: 'Secular Approaches' }
  ];

  const businessTypes = [
    { value: 'individual_landlord', label: 'Individual Landlord' },
    { value: 'property_management', label: 'Property Management Company' },
    { value: 'recovery_housing_provider', label: 'Recovery Housing Provider' },
    { value: 'nonprofit_organization', label: 'Nonprofit Organization' },
    { value: 'social_enterprise', label: 'Social Enterprise' },
    { value: 'other', label: 'Other' }
  ];

  const leaseTermOptions = [
    { value: 'month_to_month', label: 'Month-to-Month' },
    { value: '6_months', label: '6 Months' },
    { value: '12_months', label: '12 Months' },
    { value: 'flexible', label: 'Flexible Based on Tenant Needs' },
    { value: 'varies_by_property', label: 'Varies by Property' }
  ];

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'text', label: 'Text Message' },
    { value: 'any', label: 'Any Method' }
  ];

  const responseTimeOptions = [
    { value: 'immediate', label: 'Within a few hours' },
    { value: '24_hours', label: 'Within 24 hours' },
    { value: '48_hours', label: 'Within 48 hours' },
    { value: 'week', label: 'Within a week' }
  ];

  // Load existing profile data if in edit mode
  useEffect(() => {
    if (editMode && profile?.id) {
      loadExistingProfile();
    }
  }, [editMode, profile?.id]);

  const loadExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('landlord_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (data) {
        setExistingProfile(data);
        setFormData({
          primary_phone: data.primary_phone || '',
          contact_email: data.contact_email || '',
          contact_person: data.contact_person || '',
          primary_service_city: data.primary_service_city || '',
          primary_service_state: data.primary_service_state || '',
          service_areas: data.service_areas || [],
          business_name: data.business_name || '',
          business_type: data.business_type || '',
          years_in_business: data.years_in_business?.toString() || '',
          recovery_friendly: data.recovery_friendly !== false,
          recovery_experience_level: data.recovery_experience_level || '',
          preferred_recovery_stages: data.preferred_recovery_stages || [],
          supported_recovery_methods: data.supported_recovery_methods || [],
          max_properties: data.max_properties?.toString() || '10',
          accepts_subsidies: data.accepts_subsidies || false,
          background_check_required: data.background_check_required || false,
          standard_lease_terms: data.standard_lease_terms || '',
          application_process_description: data.application_process_description || '',
          bio: data.bio || '',
          experience_description: data.experience_description || '',
          approach_philosophy: data.approach_philosophy || '',
          currently_accepting_tenants: data.currently_accepting_tenants !== false,
          preferred_contact_method: data.preferred_contact_method || 'email',
          response_time_expectation: data.response_time_expectation || '24_hours'
        });
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (fieldName, value, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: isChecked
        ? [...(prev[fieldName] || []), value]
        : (prev[fieldName] || []).filter(item => item !== value)
    }));
    
    // Clear error when user makes changes
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = [
      'primary_phone',
      'primary_service_city', 
      'primary_service_state',
      'business_type'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Phone validation
    if (formData.primary_phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.primary_phone)) {
      newErrors.primary_phone = 'Please enter a valid phone number';
    }

    // Email validation
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        user_id: profile.id,
        primary_phone: formData.primary_phone,
        contact_email: formData.contact_email || null,
        contact_person: formData.contact_person || null,
        primary_service_city: formData.primary_service_city,
        primary_service_state: formData.primary_service_state,
        service_areas: formData.service_areas,
        business_name: formData.business_name || null,
        business_type: formData.business_type,
        years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null,
        recovery_friendly: formData.recovery_friendly,
        recovery_experience_level: formData.recovery_experience_level || null,
        preferred_recovery_stages: formData.preferred_recovery_stages,
        supported_recovery_methods: formData.supported_recovery_methods,
        max_properties: parseInt(formData.max_properties) || 10,
        accepts_subsidies: formData.accepts_subsidies,
        background_check_required: formData.background_check_required,
        standard_lease_terms: formData.standard_lease_terms || null,
        application_process_description: formData.application_process_description || null,
        bio: formData.bio || null,
        experience_description: formData.experience_description || null,
        approach_philosophy: formData.approach_philosophy || null,
        currently_accepting_tenants: formData.currently_accepting_tenants,
        preferred_contact_method: formData.preferred_contact_method,
        response_time_expectation: formData.response_time_expectation,
        profile_completed: true,
        is_active: true
      };

      let result;
      if (existingProfile) {
        result = await supabase
          .from('landlord_profiles')
          .update(profileData)
          .eq('id', existingProfile.id);
      } else {
        result = await supabase
          .from('landlord_profiles')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      alert(existingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="form-title">
        {editMode ? 'Edit Landlord Profile' : 'Create Your Landlord Profile'}
      </h2>
      
      <p className="form-subtitle">
        Complete your landlord profile to start listing properties and connecting with potential tenants seeking recovery-friendly housing.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Basic Contact Information */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Contact Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="label">
                Primary Phone <span className="required">*</span>
              </label>
              <input
                className={`input ${errors.primary_phone ? 'input-error' : ''}`}
                type="tel"
                name="primary_phone"
                value={formData.primary_phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                disabled={loading}
                required
              />
              {errors.primary_phone && (
                <div className="error-text">{errors.primary_phone}</div>
              )}
            </div>
            
            <div className="form-group">
              <label className="label">Contact Email</label>
              <input
                className={`input ${errors.contact_email ? 'input-error' : ''}`}
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="landlord@example.com"
                disabled={loading}
              />
              {errors.contact_email && (
                <div className="error-text">{errors.contact_email}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Contact Person Name</label>
            <input
              className="input"
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
              placeholder="John Smith (if different from account holder)"
              disabled={loading}
            />
          </div>
        </div>

        {/* Service Areas */}
        <div className="form-section">
          <h3 className="form-section-title">Service Areas</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="label">
                Primary Service City <span className="required">*</span>
              </label>
              <input
                className={`input ${errors.primary_service_city ? 'input-error' : ''}`}
                type="text"
                name="primary_service_city"
                value={formData.primary_service_city}
                onChange={handleInputChange}
                placeholder="e.g., Atlanta"
                disabled={loading}
                required
              />
              {errors.primary_service_city && (
                <div className="error-text">{errors.primary_service_city}</div>
              )}
            </div>
            
            <div className="form-group">
              <label className="label">
                Primary Service State <span className="required">*</span>
              </label>
              <select
                className={`input ${errors.primary_service_state ? 'input-error' : ''}`}
                name="primary_service_state"
                value={formData.primary_service_state}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">Select State</option>
                {stateOptions.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.primary_service_state && (
                <div className="error-text">{errors.primary_service_state}</div>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="form-section">
          <h3 className="form-section-title">Business Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="label">Business Name</label>
              <input
                className="input"
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                placeholder="Your Property Management Company"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="label">
                Business Type <span className="required">*</span>
              </label>
              <select
                className={`input ${errors.business_type ? 'input-error' : ''}`}
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">Select Business Type</option>
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.business_type && (
                <div className="error-text">{errors.business_type}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Years in Business</label>
            <input
              className="input"
              type="number"
              name="years_in_business"
              value={formData.years_in_business}
              onChange={handleInputChange}
              min="0"
              max="50"
              disabled={loading}
            />
          </div>
        </div>

        {/* Recovery Support Philosophy */}
        <div className="form-section">
          <h3 className="form-section-title">Recovery Support Philosophy</h3>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="recovery_friendly"
                checked={formData.recovery_friendly}
                onChange={handleInputChange}
                disabled={loading}
              />
              <label className="checkbox-label">
                I am committed to providing recovery-friendly housing
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Recovery Housing Experience Level</label>
            <select
              className="input"
              name="recovery_experience_level"
              value={formData.recovery_experience_level}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select Experience Level</option>
              {recoveryExperienceLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Preferred Recovery Stages</label>
            <div className="checkbox-grid">
              {recoveryStages.map(stage => (
                <div key={stage.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.preferred_recovery_stages.includes(stage.value)}
                    onChange={(e) => handleArrayChange('preferred_recovery_stages', stage.value, e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-text">{stage.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Supported Recovery Methods</label>
            <div className="checkbox-grid">
              {recoveryMethods.map(method => (
                <div key={method.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.supported_recovery_methods.includes(method.value)}
                    onChange={(e) => handleArrayChange('supported_recovery_methods', method.value, e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-text">{method.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Policies */}
        <div className="form-section">
          <h3 className="form-section-title">Business Policies</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="label">Standard Lease Terms</label>
              <select
                className="input"
                name="standard_lease_terms"
                value={formData.standard_lease_terms}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select Standard Terms</option>
                {leaseTermOptions.map(term => (
                  <option key={term.value} value={term.value}>{term.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Max Properties You Manage</label>
              <input
                className="input"
                type="number"
                name="max_properties"
                value={formData.max_properties}
                onChange={handleInputChange}
                min="1"
                max="100"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="accepts_subsidies"
                checked={formData.accepts_subsidies}
                onChange={handleInputChange}
                disabled={loading}
              />
              <label className="checkbox-label">
                I accept housing subsidies (Section 8, etc.)
              </label>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="background_check_required"
                checked={formData.background_check_required}
                onChange={handleInputChange}
                disabled={loading}
              />
              <label className="checkbox-label">
                Background check required for all tenants
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Application Process Description</label>
            <textarea
              className="textarea"
              name="application_process_description"
              value={formData.application_process_description}
              onChange={handleInputChange}
              placeholder="Describe your application process, requirements, and timeline..."
              disabled={loading}
            />
          </div>
        </div>

        {/* Profile Content */}
        <div className="form-section">
          <h3 className="form-section-title">About You</h3>
          
          <div className="form-group">
            <label className="label">Bio</label>
            <textarea
              className="textarea"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell potential tenants about yourself and your commitment to recovery housing..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Experience Description</label>
            <textarea
              className="textarea"
              name="experience_description"
              value={formData.experience_description}
              onChange={handleInputChange}
              placeholder="Describe your experience with recovery housing, property management, or working with people in recovery..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Approach & Philosophy</label>
            <textarea
              className="textarea"
              name="approach_philosophy"
              value={formData.approach_philosophy}
              onChange={handleInputChange}
              placeholder="Share your philosophy on supporting tenants in recovery and creating a positive living environment..."
              disabled={loading}
            />
          </div>
        </div>

        {/* Availability & Contact Preferences */}
        <div className="form-section">
          <h3 className="form-section-title">Availability & Contact Preferences</h3>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="currently_accepting_tenants"
                checked={formData.currently_accepting_tenants}
                onChange={handleInputChange}
                disabled={loading}
              />
              <label className="checkbox-label">
                I am currently accepting new tenants
              </label>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="label">Preferred Contact Method</label>
              <select
                className="input"
                name="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={handleInputChange}
                disabled={loading}
              >
                {contactMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Response Time Expectation</label>
              <select
                className="input"
                name="response_time_expectation"
                value={formData.response_time_expectation}
                onChange={handleInputChange}
                disabled={loading}
              >
                {responseTimeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Create Profile')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LandlordProfileForm;
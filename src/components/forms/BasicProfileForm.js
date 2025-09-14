// src/components/forms/BasicProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const BasicProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  console.log('🎨 BasicProfileForm rendering!', { editMode, onComplete: !!onComplete, onCancel: !!onCancel });
  const { user, profile, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    gender: '',
    sex: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Gender options
  const genderOptions = [
    { value: '', label: 'Select Gender Identity' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'genderfluid', label: 'Genderfluid' },
    { value: 'agender', label: 'Agender' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];
  
  // Sex options
  const sexOptions = [
    { value: '', label: 'Select Biological Sex' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  // US States for dropdown
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  
  // ✅ FIXED: Load existing profile data from applicant_forms table
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) return;

      try {
        // ✅ FIXED: Load from applicant_forms table instead of basic_profiles
        const { data: applicantData } = await db.applicantForms.getByUserId(user.id);
        
        setFormData(prev => ({
          ...prev,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          email: profile?.email || '',
          // ✅ FIXED: Load demographic data from applicant_forms
          dateOfBirth: applicantData?.date_of_birth || '',
          phone: applicantData?.phone || '',
          gender: applicantData?.gender || '',
          sex: applicantData?.sex || '',
          address: applicantData?.address || '',
          city: applicantData?.city || '',
          state: applicantData?.state || '',
          zipCode: applicantData?.zip_code || '',
          emergencyContactName: applicantData?.emergency_contact_name || '',
          emergencyContactPhone: applicantData?.emergency_contact_phone || ''
        }));
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (user && profile) {
      loadExistingData();
    } else {
      setInitialLoading(false);
    }
  }, [user, profile]);
  
  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'phone'];
    const optionalFields = ['gender', 'sex', 'address', 'city', 'state'];
    const totalFields = requiredFields.length + optionalFields.length;
    
    let completedFields = 0;
    requiredFields.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') completedFields++;
    });
    optionalFields.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') completedFields++;
    });
    
    return Math.round((completedFields / totalFields) * 100);
  };
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Age validation (must be 18+)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be 18 or older to use this service';
      }
    }

    // ZIP code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ✅ FIXED: Handle form submission - save to both registrant_profiles and applicant_forms
// src/components/forms/BasicProfileForm.js
// FIXED: Replace the entire handleSubmit function (around line 200) with this:

// src/components/forms/BasicProfileForm.js
// ✅ FIXED: Improved error handling and user feedback

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  setSuccessMessage('');
  setErrors({}); // Clear previous errors
  
  try {
    console.log('🔄 Starting profile save process...');
    
    // Step 1: Update registrant profile with basic info
    const profileUpdates = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone
    };
    
    console.log('🔄 Updating registrant profile...');
    const profileResult = await updateProfile(profileUpdates);
    
    if (!profileResult.success) {
      throw new Error(profileResult.error || 'Failed to update profile');
    }
    
    console.log('✅ Registrant profile updated successfully');
    
    // Step 2: Handle applicant form data
    console.log('🔄 Handling applicant form data...');
    
    try {
      const { data: existingApplicant } = await db.applicantForms.getByUserId(user.id);
      
      if (existingApplicant) {
        console.log('🔄 Updating existing applicant form...');
        // Update existing applicant form with demographic data
        const applicantUpdates = {
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender || null,
          sex: formData.sex || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null
        };
        
        const { error } = await db.applicantForms.update(user.id, applicantUpdates);
        if (error) throw error;
        
        console.log('✅ Applicant form updated successfully');
        
      } else {
        console.log('🔄 Creating new applicant form...');
        // Create new applicant form with required fields
        const newApplicantData = {
          user_id: user.id,
          
          // Demographic data from form
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender || null,
          sex: formData.sex || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null,
          
          // Required fields with defaults
          budget_max: 1000,
          preferred_roommate_gender: 'no_preference',
          smoking_status: 'non_smoker',
          spiritual_affiliation: 'prefer-not-to-say',
          recovery_stage: 'stable',
          work_schedule: 'traditional_9_5',
          
          // Required text fields
          about_me: 'Profile in progress - please update in matching profile section',
          looking_for: 'Profile in progress - please update in matching profile section',
          
          // Required arrays
          housing_type: [],
          program_type: [],
          primary_issues: [],
          recovery_methods: [],
          interests: [],
          
          // Optional fields with defaults
          preferred_city: formData.city || null,
          preferred_state: formData.state || null,
          age_range_min: 18,
          age_range_max: 65,
          price_range_min: 500,
          price_range_max: 2000,
          social_level: 3,
          cleanliness_level: 3,
          noise_level: 3,
          
          // Status fields
          is_active: true,
          profile_completed: false
        };
        
        const { error } = await db.applicantForms.create(newApplicantData);
        if (error) {
          console.error('❌ Error creating applicant form:', error);
          throw error;
        }
        
        console.log('✅ Applicant form created successfully');
      }
    } catch (applicantError) {
      // ✅ FIXED: Handle applicant form errors separately
      console.error('❌ Error with applicant form:', applicantError);
      
      // Profile was updated successfully, but applicant form failed
      // This is not a complete failure - inform user
      setSuccessMessage('Profile updated successfully, but some additional data could not be saved. You can complete this information later.');
      
      if (onComplete) {
        setTimeout(() => onComplete(), 2000);
      }
      return; // Don't throw error, just return
    }
    
    console.log('✅ Profile save process completed successfully');
    setSuccessMessage('Profile saved successfully!');
    
    // Call completion callback after a brief delay
    if (onComplete) {
      setTimeout(() => onComplete(), 1500);
    }
    
  } catch (error) {
    console.error('💥 Error saving profile:', error);
    
    // ✅ FIXED: More specific error messages
    let errorMessage = 'Failed to save profile. Please try again.';
    
    if (error.message && error.message.includes('timeout')) {
      errorMessage = 'The save operation timed out. Your changes may have been saved. Please refresh and check your profile.';
    } else if (error.message && error.message.includes('network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setErrors({ submit: errorMessage });
  } finally {
    setLoading(false);
  }
};

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }
  
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="form-title">
          {editMode ? 'Edit Your Profile' : 'Complete Your Basic Profile'}
        </h2>
        <p className="text-gray-600">
          {editMode 
            ? 'Update your basic information to keep your profile current.'
            : 'Complete your basic profile to get started. This information helps us provide better matches and services.'
          }
        </p>
      </div>
      
      {/* Progress Bar */}
      {!editMode && (
        <>
          <div className="progress-bar mb-2">
            <div 
              className="progress-fill"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          <p className="text-center text-gray-500 mb-4" style={{ fontSize: '0.9rem' }}>
            Form completion: {getCompletionPercentage()}%
          </p>
        </>
      )}
      
      {/* Error Message */}
      {errors.submit && (
        <div className="alert alert-error mb-4">
          {errors.submit}
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success mb-4">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              First Name <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input
              className={`input ${errors.firstName ? 'border-red-500' : ''}`}
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              disabled={loading}
              required
            />
            {errors.firstName && (
              <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                {errors.firstName}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Last Name <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input
              className={`input ${errors.lastName ? 'border-red-500' : ''}`}
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              disabled={loading}
              required
            />
            {errors.lastName && (
              <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                {errors.lastName}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group mb-4">
          <label className="label">
            Email Address <span style={{ color: 'var(--coral)' }}>*</span>
          </label>
          <input
            className={`input ${errors.email ? 'border-red-500' : ''}`}
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            disabled={loading}
            required
          />
          {errors.email && (
            <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
              {errors.email}
            </div>
          )}
        </div>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Date of Birth <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input
              className={`input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              disabled={loading}
              required
            />
            {errors.dateOfBirth && (
              <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                {errors.dateOfBirth}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Phone Number <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input
              className={`input ${errors.phone ? 'border-red-500' : ''}`}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              disabled={loading}
              required
            />
            {errors.phone && (
              <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                {errors.phone}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">Gender Identity</label>
            <select
              className="input"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              disabled={loading}
            >
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-gray-500 mt-1" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
              This information helps us provide better matches and services
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Biological Sex</label>
            <select
              className="input"
              value={formData.sex}
              onChange={(e) => handleInputChange('sex', e.target.value)}
              disabled={loading}
            >
              {sexOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-gray-500 mt-1" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
              Used for medical and housing compatibility purposes
            </div>
          </div>
        </div>

        {/* Address Information */}
        <h3 style={{ color: 'var(--secondary-teal)', marginBottom: 'var(--spacing-lg)', paddingBottom: '10px', borderBottom: '2px solid var(--border-beige)' }}>
          Address Information (Optional)
        </h3>

        <div className="form-group mb-4">
          <label className="label">Street Address</label>
          <input
            className="input"
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main St, Apt 4B"
            disabled={loading}
          />
        </div>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">City</label>
            <input
              className="input"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="label">State</label>
            <select
              className="input"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={loading}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group mb-4">
          <label className="label">ZIP Code</label>
          <input
            className={`input ${errors.zipCode ? 'border-red-500' : ''}`}
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="12345 or 12345-6789"
            disabled={loading}
            style={{ maxWidth: '200px' }}
          />
          {errors.zipCode && (
            <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
              {errors.zipCode}
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <h3 style={{ color: 'var(--secondary-teal)', marginBottom: 'var(--spacing-lg)', paddingBottom: '10px', borderBottom: '2px solid var(--border-beige)' }}>
          Emergency Contact (Optional)
        </h3>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">Emergency Contact Name</label>
            <input
              className="input"
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              placeholder="Full name"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="label">Emergency Contact Phone</label>
            <input
              className="input"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              placeholder="(555) 123-4567"
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className={`${onCancel ? 'grid-2' : ''} mt-5`}>
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
            {loading ? (
              <div className="flex-center">
                <div className="loading-spinner small" style={{ marginRight: '8px' }}></div>
                Saving Profile...
              </div>
            ) : (
              `${editMode ? 'Update Profile' : 'Save Profile'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicProfileForm;
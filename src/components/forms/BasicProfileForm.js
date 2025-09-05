// src/components/forms/BasicProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  
  // Load existing profile data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) return;

      try {
        // Load basic profile data if it exists
        const { data: basicProfile } = await db.basicProfiles.getByUserId(user.id);
        
        setFormData(prev => ({
          ...prev,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          email: profile?.email || '',
          dateOfBirth: basicProfile?.date_of_birth || '',
          phone: basicProfile?.phone || '',
          gender: basicProfile?.gender || '',
          sex: basicProfile?.sex || '',
          address: basicProfile?.address || '',
          city: basicProfile?.city || '',
          state: basicProfile?.state || '',
          zipCode: basicProfile?.zip_code || '',
          emergencyContactName: basicProfile?.emergency_contact_name || '',
          emergencyContactPhone: basicProfile?.emergency_contact_phone || ''
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccessMessage('');
    
    try {
      // Update registrant profile with basic info
      const profileUpdates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email
      };
      
      await updateProfile(profileUpdates);
      
      // Prepare basic profile data
      const basicProfileData = {
        user_id: user.id,
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone,
        gender: formData.gender || null,
        sex: formData.sex || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_phone: formData.emergencyContactPhone || null
      };
      
      // Try to update existing profile, or create new one
      const { data: existingProfile } = await db.basicProfiles.getByUserId(user.id);
      
      if (existingProfile) {
        const { error } = await db.basicProfiles.update(user.id, basicProfileData);
        if (error) throw error;
      } else {
        const { error } = await db.basicProfiles.create(basicProfileData);
        if (error) throw error;
      }
      
      setSuccessMessage('Profile saved successfully!');
      
      // Call completion callback after a brief delay
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
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
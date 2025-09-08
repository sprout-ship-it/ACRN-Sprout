// DEBUGGING VERSION of EnhancedMatchingProfileForm.js
// Add these debugging elements to identify the issue

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import PersonalInfoSection from './sections/PersonalInfoSection';
import LocationPreferencesSection from './sections/LocationPreferencesSection';
import RecoveryInfoSection from './sections/RecoveryInfoSection';
import LifestylePreferencesSection from './sections/LifestylePreferencesSection';
import CompatibilitySection from './sections/CompatibilitySection';
import { 
  defaultFormData, 
  genderPreferenceOptions,
  smokingStatusOptions 
} from './constants/matchingFormConstants';
import '../../styles/global.css';

const EnhancedMatchingProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { user, profile, hasRole } = useAuth();
  
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('Component mounted');

  // DEBUG: Add click handler to test if events work
  const handleDebugClick = () => {
    console.log('🔍 DEBUG: Debug button clicked - events are working');
    setDebugInfo('Debug button clicked - events are working');
  };

  // DEBUG: Enhanced handleSubmit with more logging
  const handleSubmit = async (e) => {
    console.log('🔍 DEBUG: ===== FORM SUBMISSION STARTED =====');
    console.log('🔍 DEBUG: Event object:', e);
    console.log('🔍 DEBUG: Event type:', e?.type);
    console.log('🔍 DEBUG: Event target:', e?.target);
    
    e.preventDefault();
    e.stopPropagation(); // Prevent any event bubbling issues
    
    console.log('🔍 DEBUG: preventDefault called');
    console.log('🔍 DEBUG: Current formData at submission:', formData);
    console.log('🔍 DEBUG: Current loading state:', loading);
    console.log('🔍 DEBUG: User object:', user);
    
    setDebugInfo('Form submission started...');
    
    console.log('🔍 DEBUG: About to validate form...');
    
    if (!validateForm()) {
      console.log('🔍 DEBUG: Form validation failed - stopping submission');
      setDebugInfo('Form validation failed. Check the error messages above.');
      return;
    }
    
    console.log('🔍 DEBUG: Form validation passed, proceeding with submission');
    setDebugInfo('Form validation passed, submitting...');
    
    setLoading(true);
    setSuccessMessage('');
    
    try {
      // Parse target zip codes
      const targetZipCodes = formData.targetZipCodes
        .split(',')
        .map(zip => zip.trim())
        .filter(zip => zip && /^\d{5}$/.test(zip));

      const applicantFormData = {
        // Personal Demographics
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone,
        gender: formData.gender || null,
        sex: formData.sex || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        
        // Location & Housing
        preferred_location: formData.preferredLocation,
        target_zip_codes: targetZipCodes,
        search_radius: parseInt(formData.searchRadius),
        current_location: formData.currentLocation || null,
        relocation_timeline: formData.relocationTimeline || null,
        max_commute: parseInt(formData.maxCommute),
        housing_type: formData.housingType,
        price_range_min: formData.priceRangeMin,
        price_range_max: formData.priceRangeMax,
        budget_max: parseInt(formData.budgetMax),
        move_in_date: formData.moveInDate,
        lease_duration: formData.leaseDuration || null,
        
        // Personal Preferences
        age_range_min: formData.ageRangeMin,
        age_range_max: formData.ageRangeMax,
        gender_preference: formData.genderPreference || null,
        preferred_roommate_gender: formData.preferredRoommateGender,
        smoking_preference: formData.smokingPreference || null,
        smoking_status: formData.smokingStatus,
        pet_preference: formData.petPreference || null,
        
        // Recovery Information
        recovery_stage: formData.recoveryStage,
        primary_substance: formData.primarySubstance || null,
        time_in_recovery: formData.timeInRecovery || null,
        treatment_history: formData.treatmentHistory || null,
        program_type: formData.programType,
        sobriety_date: formData.sobrietyDate || null,
        sponsor_mentor: formData.sponsorMentor || null,
        support_meetings: formData.supportMeetings || null,
        spiritual_affiliation: formData.spiritualAffiliation,
        primary_issues: formData.primaryIssues,
        recovery_methods: formData.recoveryMethods,
        
        // Lifestyle Preferences
        work_schedule: formData.workSchedule,
        social_level: parseInt(formData.socialLevel),
        cleanliness_level: parseInt(formData.cleanlinessLevel),
        noise_level: parseInt(formData.noiseLevel),
        guest_policy: formData.guestPolicy || null,
        guests_policy: formData.guestsPolicy || null,
        bedtime_preference: formData.bedtimePreference || null,
        transportation: formData.transportation || null,
        chore_sharing_preference: formData.choreSharingPreference || null,
        preferred_support_structure: formData.preferredSupportStructure || null,
        conflict_resolution_style: formData.conflictResolutionStyle || null,
        
        // Living Situation
        pets_owned: formData.petsOwned,
        pets_comfortable: formData.petsComfortable,
        overnight_guests_ok: formData.overnightGuestsOk,
        shared_groceries: formData.sharedGroceries,
        cooking_frequency: formData.cookingFrequency || null,
        
        // Housing Assistance
        housing_subsidy: formData.housingSubsidy,
        has_section8: formData.hasSection8,
        accepts_subsidy: formData.acceptsSubsidy,
        
        // Compatibility Factors
        interests: formData.interests,
        deal_breakers: formData.dealBreakers,
        important_qualities: formData.importantQualities,
        
        // Open-ended responses
        about_me: formData.aboutMe,
        looking_for: formData.lookingFor,
        additional_info: formData.additionalInfo || null,
        special_needs: formData.specialNeeds || null,
        
        // Status
        is_active: formData.isActive,
        profile_completed: true
      };
      
      console.log('🔍 DEBUG: Prepared applicantFormData for database:', applicantFormData);
      
      console.log('🔧 Updating existing applicant form with comprehensive profile data');
      const { error } = await db.applicantForms.update(user.id, applicantFormData);
      
      if (error) {
        console.error('❌ Error updating applicant form:', error);
        setDebugInfo(`Database error: ${error.message || JSON.stringify(error)}`);
        throw error;
      }
      
      console.log('✅ Comprehensive matching profile saved successfully');
      setSuccessMessage('Comprehensive matching profile saved successfully!');
      setDebugInfo('Form submitted successfully to database!');
      
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
      
    } catch (error) {
      console.error('💥 Error saving applicant form:', error);
      setErrors({ submit: 'Failed to save matching profile. Please try again.' });
      setDebugInfo(`Submission error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // DEBUG: Enhanced validation with more logging
  const validateForm = () => {
    console.log('🔍 DEBUG: Starting form validation...');
    console.log('🔍 DEBUG: Form data being validated:', formData);
    
    const newErrors = {};
    
    // Check required fields
    const requiredFields = [
      'dateOfBirth', 'phone', 'preferredLocation', 'maxCommute', 'moveInDate', 
      'recoveryStage', 'workSchedule', 'aboutMe', 'lookingFor', 'budgetMax', 
      'preferredRoommateGender', 'smokingStatus', 'spiritualAffiliation'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = `${field} is required`;
        console.log(`🔍 DEBUG: Required field missing: ${field} = "${formData[field]}"`);
      }
    });
    
    // Check required arrays
    const requiredArrayFields = ['housingType', 'programType', 'interests', 'primaryIssues', 'recoveryMethods'];
    requiredArrayFields.forEach(field => {
      if (!formData[field] || formData[field].length === 0) {
        newErrors[field] = `Please select at least one ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        console.log(`🔍 DEBUG: Required array field empty: ${field} = ${JSON.stringify(formData[field])}`);
      }
    });
    
    console.log('🔍 DEBUG: Validation errors found:', newErrors);
    console.log('🔍 DEBUG: Validation result:', Object.keys(newErrors).length === 0 ? 'PASSED' : 'FAILED');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // DEBUG: Load existing data with enhanced logging
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user || !hasRole('applicant')) return;

      try {
        console.log('🔍 DEBUG: Loading existing data for user:', user.id);
        const { data: applicantForm } = await db.applicantForms.getByUserId(user.id);
        
        console.log('🔍 DEBUG: Loaded applicant form data:', applicantForm);
        
        if (applicantForm) {
          const loadedData = {
            ...defaultFormData,
            // Load all the data like in original version
            // (truncated for brevity - use original loading logic)
          };
          
          console.log('🔍 DEBUG: Setting loaded form data:', loadedData);
          setFormData(loadedData);
        }
      } catch (error) {
        console.error('🔍 DEBUG: Error loading applicant form data:', error);
        setDebugInfo(`Error loading data: ${error.message}`);
      } finally {
        setInitialLoading(false);
      }
    };

    if (user && profile) {
      loadExistingData();
    } else {
      setInitialLoading(false);
    }
  }, [user, profile, hasRole]);

  // Handle input changes with debugging
  const handleInputChange = (field, value) => {
    console.log('🔍 DEBUG: handleInputChange called:', { field, value, type: typeof value });
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('🔍 DEBUG: Updated formData for field:', field, 'New value:', value);
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle array field changes with debugging
  const handleArrayChange = (field, value, checked) => {
    console.log('🔍 DEBUG: handleArrayChange called:', { field, value, checked });
    setFormData(prev => {
      const newArray = checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value);
      console.log('🔍 DEBUG: Updated array for field:', field, 'New array:', newArray);
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  // Handle range changes
  const handleRangeChange = (field, value) => {
    console.log('🔍 DEBUG: handleRangeChange called:', { field, value });
    handleInputChange(field, parseInt(value));
  };

  if (initialLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  if (!hasRole('applicant')) {
    return (
      <div className="alert alert-info">
        <p>Matching profiles are only available for applicants seeking housing.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* DEBUG INFO PANEL */}
      <div style={{ 
        background: '#f0f0f0', 
        border: '1px solid #ccc', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <strong>🔍 DEBUG INFO:</strong>
        <div>Loading: {loading ? 'TRUE' : 'FALSE'}</div>
        <div>User ID: {user?.id || 'NOT SET'}</div>
        <div>Has Role Applicant: {hasRole('applicant') ? 'TRUE' : 'FALSE'}</div>
        <div>Debug Info: {debugInfo}</div>
        <div>Form Data Keys: {Object.keys(formData).length}</div>
        <div>Errors: {Object.keys(errors).length}</div>
        
        {/* DEBUG: Test button to verify event handling works */}
        <button 
          type="button" 
          onClick={handleDebugClick}
          style={{ 
            background: 'orange', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px',
            margin: '5px 0',
            cursor: 'pointer'
          }}
        >
          🔍 Test Click (Should work)
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="form-title">
          {editMode ? 'Edit Your Comprehensive Matching Profile' : 'Create Your Comprehensive Matching Profile'}
        </h2>
        <p className="text-gray-600">
          Complete your personal information and preferences to find the best roommate matches for your recovery journey.
        </p>
      </div>

      {/* Messages */}
      {errors.submit && (
        <div className="alert alert-error mb-4">{errors.submit}</div>
      )}
      
      {successMessage && (
        <div className="alert alert-success mb-4">{successMessage}</div>
      )}
      
      {/* DEBUG: Add onClick handler to form to see if it's being triggered */}
      <form 
        onSubmit={handleSubmit}
        onClick={() => console.log('🔍 DEBUG: Form clicked')}
      >
        {/* Personal Information Section */}
        <PersonalInfoSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          profile={profile}
        />

        {/* Roommate Preferences */}
        <h3 className="card-title mb-4">Roommate Preferences</h3>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Roommate Gender Preference <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.preferredRoommateGender ? 'border-red-500' : ''}`}
              value={formData.preferredRoommateGender}
              onChange={(e) => handleInputChange('preferredRoommateGender', e.target.value)}
              disabled={loading}
              required
            >
              {genderPreferenceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.preferredRoommateGender && (
              <div className="text-red-500 mt-1">{errors.preferredRoommateGender}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Your Smoking Status <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.smokingStatus ? 'border-red-500' : ''}`}
              value={formData.smokingStatus}
              onChange={(e) => handleInputChange('smokingStatus', e.target.value)}
              disabled={loading}
              required
            >
              {smokingStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.smokingStatus && (
              <div className="text-red-500 mt-1">{errors.smokingStatus}</div>
            )}
          </div>
        </div>

        {/* Other sections */}
        <LocationPreferencesSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onArrayChange={handleArrayChange}
        />

        <RecoveryInfoSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onArrayChange={handleArrayChange}
        />

        <LifestylePreferencesSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onRangeChange={handleRangeChange}
        />

        <CompatibilitySection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onArrayChange={handleArrayChange}
        />

        {/* DEBUG: Enhanced Submit Button with multiple event handlers */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            onClick={(e) => {
              console.log('🔍 DEBUG: Submit button clicked!');
              console.log('🔍 DEBUG: Button event:', e);
              console.log('🔍 DEBUG: Button type:', e.target.type);
              console.log('🔍 DEBUG: Loading state:', loading);
              console.log('🔍 DEBUG: Button disabled:', e.target.disabled);
              setDebugInfo('Submit button clicked!');
              // Don't prevent default here - let the form handle it
            }}
            onMouseDown={() => console.log('🔍 DEBUG: Submit button mouse down')}
            onMouseUp={() => console.log('🔍 DEBUG: Submit button mouse up')}
          >
            {loading ? 'Saving...' : (editMode ? 'Update Profile' : 'Save Profile')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={(e) => {
                console.log('🔍 DEBUG: Cancel button clicked');
                onCancel();
              }}
              disabled={loading}
            >
              Cancel
            </button>
          )}

          {/* DEBUG: Alternative submit button for testing */}
          <button
            type="button"
            onClick={(e) => {
              console.log('🔍 DEBUG: Manual submit button clicked');
              handleSubmit(e);
            }}
            style={{ 
              background: 'red', 
              color: 'white', 
              border: 'none', 
              padding: '10px',
              margin: '10px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            🔍 DEBUG: Manual Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedMatchingProfileForm;
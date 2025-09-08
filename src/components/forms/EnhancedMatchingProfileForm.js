// src/components/forms/EnhancedMatchingProfileForm.js
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

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user || !hasRole('applicant')) return;

      try {
        const { data: applicantForm } = await db.applicantForms.getByUserId(user.id);
        
        if (applicantForm) {
          setFormData(prev => ({
            ...prev,
            // Personal Demographics
            dateOfBirth: applicantForm.date_of_birth || '',
            phone: applicantForm.phone || '',
            gender: applicantForm.gender || '',
            sex: applicantForm.sex || '',
            address: applicantForm.address || '',
            city: applicantForm.city || '',
            state: applicantForm.state || '',
            zipCode: applicantForm.zip_code || '',
            emergencyContactName: applicantForm.emergency_contact_name || '',
            emergencyContactPhone: applicantForm.emergency_contact_phone || '',
            
            // Location & Housing
            preferredLocation: applicantForm.preferred_location || '',
            targetZipCodes: applicantForm.target_zip_codes?.join(', ') || '',
            searchRadius: applicantForm.search_radius?.toString() || '25',
            currentLocation: applicantForm.current_location || '',
            relocationTimeline: applicantForm.relocation_timeline || '',
            maxCommute: applicantForm.max_commute?.toString() || '',
            housingType: applicantForm.housing_type || [],
            priceRangeMin: applicantForm.price_range_min || 500,
            priceRangeMax: applicantForm.price_range_max || 2000,
            budgetMax: applicantForm.budget_max || 1000,
            moveInDate: applicantForm.move_in_date || '',
            leaseDuration: applicantForm.lease_duration || '',
            
            // Personal Preferences
            ageRangeMin: applicantForm.age_range_min || 18,
            ageRangeMax: applicantForm.age_range_max || 65,
            genderPreference: applicantForm.gender_preference || '',
            preferredRoommateGender: applicantForm.preferred_roommate_gender || '',
            smokingPreference: applicantForm.smoking_preference || '',
            smokingStatus: applicantForm.smoking_status || '',
            petPreference: applicantForm.pet_preference || '',
            
            // Recovery Information
            recoveryStage: applicantForm.recovery_stage || '',
            primarySubstance: applicantForm.primary_substance || '',
            timeInRecovery: applicantForm.time_in_recovery || '',
            treatmentHistory: applicantForm.treatment_history || '',
            programType: applicantForm.program_type || [],
            sobrietyDate: applicantForm.sobriety_date || '',
            sponsorMentor: applicantForm.sponsor_mentor || '',
            supportMeetings: applicantForm.support_meetings || '',
            spiritualAffiliation: applicantForm.spiritual_affiliation || '',
            primaryIssues: applicantForm.primary_issues || [],
            recoveryMethods: applicantForm.recovery_methods || [],
            
            // Lifestyle Preferences
            workSchedule: applicantForm.work_schedule || '',
            socialLevel: applicantForm.social_level || 3,
            cleanlinessLevel: applicantForm.cleanliness_level || 3,
            noiseLevel: applicantForm.noise_level || 3,
            guestPolicy: applicantForm.guest_policy || '',
            guestsPolicy: applicantForm.guests_policy || '',
            bedtimePreference: applicantForm.bedtime_preference || '',
            transportation: applicantForm.transportation || '',
            choreSharingPreference: applicantForm.chore_sharing_preference || '',
            preferredSupportStructure: applicantForm.preferred_support_structure || '',
            conflictResolutionStyle: applicantForm.conflict_resolution_style || '',
            
            // Living Situation
            petsOwned: applicantForm.pets_owned || false,
            petsComfortable: applicantForm.pets_comfortable !== false,
            overnightGuestsOk: applicantForm.overnight_guests_ok !== false,
            sharedGroceries: applicantForm.shared_groceries || false,
            cookingFrequency: applicantForm.cooking_frequency || '',
            
            // Housing Assistance
            housingSubsidy: applicantForm.housing_subsidy || [],
            hasSection8: applicantForm.has_section8 || false,
            acceptsSubsidy: applicantForm.accepts_subsidy !== false,
            
            // Compatibility Factors
            interests: applicantForm.interests || [],
            dealBreakers: applicantForm.deal_breakers || [],
            importantQualities: applicantForm.important_qualities || [],
            
            // Open-ended responses
            aboutMe: applicantForm.about_me || '',
            lookingFor: applicantForm.looking_for || '',
            additionalInfo: applicantForm.additional_info || '',
            specialNeeds: applicantForm.special_needs || '',
            isActive: applicantForm.is_active !== false
          }));
        }
      } catch (error) {
        console.error('Error loading applicant form data:', error);
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
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const requiredFields = [
      // Demographic fields
      'dateOfBirth', 'phone',
      // Core matching fields
      'preferredLocation', 'maxCommute', 'moveInDate', 'recoveryStage', 
      'workSchedule', 'aboutMe', 'lookingFor', 'budgetMax', 'preferredRoommateGender',
      'smokingStatus', 'spiritualAffiliation'
    ];
    const arrayFields = ['housingType', 'programType', 'interests', 'primaryIssues', 'recoveryMethods'];
    
    let completed = 0;
    let total = requiredFields.length + arrayFields.length;
    
    requiredFields.forEach(field => {
      if (formData[field] && formData[field].toString().trim() !== '') completed++;
    });
    
    arrayFields.forEach(field => {
      if (formData[field] && formData[field].length > 0) completed++;
    });
    
    return Math.round((completed / total) * 100);
  };
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Handle array field changes
  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };
  
  // Handle range changes
  const handleRangeChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(value) }));
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Demographic validation
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
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

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }
    
    // Required fields
    if (!formData.preferredLocation.trim()) newErrors.preferredLocation = 'Preferred location is required';
    if (!formData.maxCommute) newErrors.maxCommute = 'Maximum commute time is required';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required';
    if (!formData.recoveryStage) newErrors.recoveryStage = 'Recovery stage is required';
    if (!formData.workSchedule) newErrors.workSchedule = 'Work schedule is required';
    if (!formData.aboutMe.trim()) newErrors.aboutMe = 'About me section is required';
    if (!formData.lookingFor.trim()) newErrors.lookingFor = 'Looking for section is required';
    if (!formData.budgetMax) newErrors.budgetMax = 'Personal budget maximum is required';
    if (!formData.preferredRoommateGender) newErrors.preferredRoommateGender = 'Roommate gender preference is required';
    if (!formData.smokingStatus) newErrors.smokingStatus = 'Your smoking status is required';
    if (!formData.spiritualAffiliation) newErrors.spiritualAffiliation = 'Spiritual affiliation is required';
    
    // Array fields
    if (formData.housingType.length === 0) newErrors.housingType = 'Please select at least one housing type';
    if (formData.programType.length === 0) newErrors.programType = 'Please select at least one program type';
    if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
    if (formData.primaryIssues.length === 0) newErrors.primaryIssues = 'Please select at least one primary issue';
    if (formData.recoveryMethods.length === 0) newErrors.recoveryMethods = 'Please select at least one recovery method';
    
    // Text length validation
    if (formData.aboutMe.length > 500) newErrors.aboutMe = 'About me must be 500 characters or less';
    if (formData.lookingFor.length > 500) newErrors.lookingFor = 'Looking for must be 500 characters or less';
    if (formData.additionalInfo.length > 300) newErrors.additionalInfo = 'Additional info must be 300 characters or less';
    
    // Date validation
    if (formData.moveInDate) {
      const moveInDate = new Date(formData.moveInDate);
      const today = new Date();
      if (moveInDate < today) {
        newErrors.moveInDate = 'Move-in date cannot be in the past';
      }
    }

    // Budget validation
    if (formData.budgetMax < 200) {
      newErrors.budgetMax = 'Budget must be at least $200';
    }
    if (formData.budgetMax > 5000) {
      newErrors.budgetMax = 'Budget seems unreasonably high. Please verify.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        
        // Lifestyle Preferences - Ensure integers for 1-5 scales
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
      
      console.log('🔧 Updating existing applicant form with comprehensive profile data');
      const { error } = await db.applicantForms.update(user.id, applicantFormData);
      
      if (error) {
        console.error('❌ Error updating applicant form:', error);
        throw error;
      }
      
      console.log('✅ Comprehensive matching profile saved successfully');
      setSuccessMessage('Comprehensive matching profile saved successfully!');
      
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
      
    } catch (error) {
      console.error('Error saving applicant form:', error);
      setErrors({ submit: 'Failed to save matching profile. Please try again.' });
    } finally {
      setLoading(false);
    }
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
      {/* Custom Styles for Enhanced Formatting */}
      <style>{`
        .checkbox-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }
        
        .checkbox-columns-compact {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 8px;
        }
        
        .enhanced-range-container {
          margin-top: 12px;
        }
        
        .range-description {
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        
        .range-slider-wrapper {
          position: relative;
          margin: 16px 0;
        }
        
        .range-slider {
          width: 100%;
          height: 6px;
          background: var(--border-beige);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }
        
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--primary-teal);
          border-radius: 50%;
          cursor: pointer;
        }
        
        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--primary-teal);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .enhanced-range-labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .range-endpoint {
          flex: 1;
          text-align: center;
        }
        
        .range-arrow {
          flex: 0 0 auto;
          font-size: 18px;
          color: var(--secondary-teal);
          margin: 0 10px;
        }
        
        .current-value-display {
          text-align: center;
          margin-top: 12px;
          padding: 8px;
          background: var(--background-cream);
          border-radius: 6px;
          border: 1px solid var(--border-beige);
        }
        
        .current-value-number {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-teal);
          display: block;
        }
        
        .current-value-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .housing-assistance-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
          margin-bottom: 12px;
          font-style: italic;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="form-title">
          {editMode ? 'Edit Your Comprehensive Matching Profile' : 'Create Your Comprehensive Matching Profile'}
        </h2>
        <p className="text-gray-600">
          Complete your personal information and preferences to find the best roommate matches for your recovery journey.
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
          <p className="text-center text-gray-500 mb-4">Form completion: {getCompletionPercentage()}%</p>
        </>
      )}
      
      {/* Messages */}
      {errors.submit && (
        <div className="alert alert-error mb-4">{errors.submit}</div>
      )}
      
      {successMessage && (
        <div className="alert alert-success mb-4">{successMessage}</div>
      )}
      
      <form onSubmit={handleSubmit}>
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

        {/* Location & Housing Preferences Section */}
        <LocationPreferencesSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onArrayChange={handleArrayChange}
        />

        {/* Recovery Information Section */}
        <RecoveryInfoSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onArrayChange={handleArrayChange}
        />

        {/* Lifestyle Preferences Section */}
        <LifestylePreferencesSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onRangeChange={handleRangeChange}
        />

        {/* Compatibility Section */}
        <CompatibilitySection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onArrayChange={handleArrayChange}
        />

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editMode ? 'Update Profile' : 'Save Profile')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            )}
        </div>
      </form>
    </div>
  );
};

export default EnhancedMatchingProfileForm;
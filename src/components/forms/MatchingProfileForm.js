// src/components/forms/MatchingProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const MatchingProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { user, profile, hasRole } = useAuth();
  
  const [formData, setFormData] = useState({
    // Location & Housing Preferences
    preferredLocation: '',
    maxCommute: '',
    housingType: [],
    priceRangeMin: 500,
    priceRangeMax: 2000,
    moveInDate: '',
    leaseDuration: '',
    
    // Personal Preferences
    ageRangeMin: 18,
    ageRangeMax: 65,
    genderPreference: '',
    smokingPreference: '',
    petPreference: '',
    substanceUse: [],
    
    // Recovery Information
    recoveryStage: '',
    programType: [],
    sobrietyDate: '',
    sponsorMentor: '',
    supportMeetings: '',
    
    // Lifestyle Preferences
    workSchedule: '',
    socialLevel: '',
    cleanlinessLevel: '',
    noiseLevel: '',
    guestPolicy: '',
    
    // Compatibility Factors
    interests: [],
    dealBreakers: [],
    importantQualities: [],
    
    // Open-ended responses
    aboutMe: '',
    lookingFor: '',
    additionalInfo: '',
    
    // Status
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form options
  const housingTypeOptions = [
    'Apartment', 'House', 'Condo', 'Townhouse', 'Room in house', 'Studio', 'Sober living facility'
  ];
  
  const substanceUseOptions = [
    'Alcohol', 'Marijuana', 'Prescription medications', 'Tobacco/Nicotine', 'None'
  ];
  
  const programTypeOptions = [
    'AA (Alcoholics Anonymous)', 'NA (Narcotics Anonymous)', 'SMART Recovery', 
    'Celebrate Recovery', 'LifeRing', 'Secular recovery', 'Faith-based program',
    'Outpatient therapy', 'Intensive outpatient (IOP)', 'Medication-assisted treatment',
    'Peer support groups', 'Meditation/Spirituality', 'Other'
  ];
  
  const interestOptions = [
    'Fitness/Exercise', 'Cooking', 'Reading', 'Movies/TV', 'Music', 'Art/Crafts',
    'Outdoor activities', 'Sports', 'Gaming', 'Volunteering', 'Meditation/Spirituality',
    'Learning/Education', 'Technology', 'Travel', 'Pets/Animals'
  ];
  
  const dealBreakerOptions = [
    'Smoking indoors', 'Drinking alcohol at home', 'Drug use', 'Loud parties',
    'Poor hygiene', 'Pets', 'Overnight guests frequently', 'Messy common areas',
    'Aggressive behavior', 'Dishonesty', 'Not respecting boundaries'
  ];
  
  const importantQualityOptions = [
    'Honesty', 'Respect for boundaries', 'Cleanliness', 'Reliability', 'Empathy',
    'Good communication', 'Shared recovery values', 'Similar schedule', 'Sense of humor',
    'Mutual support', 'Independence', 'Shared interests'
  ];

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user || !hasRole('applicant')) return;

      try {
        const { data: matchingProfile } = await db.matchingProfiles.getByUserId(user.id);
        
        if (matchingProfile) {
          setFormData(prev => ({
            ...prev,
            preferredLocation: matchingProfile.preferred_location || '',
            maxCommute: matchingProfile.max_commute?.toString() || '',
            housingType: matchingProfile.housing_type || [],
            priceRangeMin: matchingProfile.price_range_min || 500,
            priceRangeMax: matchingProfile.price_range_max || 2000,
            moveInDate: matchingProfile.move_in_date || '',
            leaseDuration: matchingProfile.lease_duration || '',
            ageRangeMin: matchingProfile.age_range_min || 18,
            ageRangeMax: matchingProfile.age_range_max || 65,
            genderPreference: matchingProfile.gender_preference || '',
            smokingPreference: matchingProfile.smoking_preference || '',
            petPreference: matchingProfile.pet_preference || '',
            substanceUse: matchingProfile.substance_use || [],
            recoveryStage: matchingProfile.recovery_stage || '',
            programType: matchingProfile.program_type || [],
            sobrietyDate: matchingProfile.sobriety_date || '',
            sponsorMentor: matchingProfile.sponsor_mentor || '',
            supportMeetings: matchingProfile.support_meetings || '',
            workSchedule: matchingProfile.work_schedule || '',
            socialLevel: matchingProfile.social_level || '',
            cleanlinessLevel: matchingProfile.cleanliness_level || '',
            noiseLevel: matchingProfile.noise_level || '',
            guestPolicy: matchingProfile.guest_policy || '',
            interests: matchingProfile.interests || [],
            dealBreakers: matchingProfile.deal_breakers || [],
            importantQualities: matchingProfile.important_qualities || [],
            aboutMe: matchingProfile.about_me || '',
            lookingFor: matchingProfile.looking_for || '',
            additionalInfo: matchingProfile.additional_info || '',
            isActive: matchingProfile.is_active !== false
          }));
        }
      } catch (error) {
        console.error('Error loading matching profile:', error);
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
      'preferredLocation', 'maxCommute', 'moveInDate', 'recoveryStage', 
      'workSchedule', 'aboutMe', 'lookingFor'
    ];
    const arrayFields = ['housingType', 'programType', 'interests'];
    
    let completed = 0;
    let total = requiredFields.length + arrayFields.length;
    
    requiredFields.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') completed++;
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
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.preferredLocation.trim()) newErrors.preferredLocation = 'Preferred location is required';
    if (!formData.maxCommute) newErrors.maxCommute = 'Maximum commute time is required';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required';
    if (!formData.recoveryStage) newErrors.recoveryStage = 'Recovery stage is required';
    if (!formData.workSchedule) newErrors.workSchedule = 'Work schedule is required';
    if (!formData.aboutMe.trim()) newErrors.aboutMe = 'About me section is required';
    if (!formData.lookingFor.trim()) newErrors.lookingFor = 'Looking for section is required';
    
    // Array fields
    if (formData.housingType.length === 0) newErrors.housingType = 'Please select at least one housing type';
    if (formData.programType.length === 0) newErrors.programType = 'Please select at least one program type';
    if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
    
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
      const profileData = {
        user_id: user.id,
        preferred_location: formData.preferredLocation,
        max_commute: parseInt(formData.maxCommute),
        housing_type: formData.housingType,
        price_range_min: formData.priceRangeMin,
        price_range_max: formData.priceRangeMax,
        move_in_date: formData.moveInDate,
        lease_duration: formData.leaseDuration || null,
        age_range_min: formData.ageRangeMin,
        age_range_max: formData.ageRangeMax,
        gender_preference: formData.genderPreference || null,
        smoking_preference: formData.smokingPreference || null,
        pet_preference: formData.petPreference || null,
        substance_use: formData.substanceUse,
        recovery_stage: formData.recoveryStage,
        program_type: formData.programType,
        sobriety_date: formData.sobrietyDate || null,
        sponsor_mentor: formData.sponsorMentor || null,
        support_meetings: formData.supportMeetings || null,
        work_schedule: formData.workSchedule,
        social_level: formData.socialLevel || null,
        cleanliness_level: formData.cleanlinessLevel || null,
        noise_level: formData.noiseLevel || null,
        guest_policy: formData.guestPolicy || null,
        interests: formData.interests,
        deal_breakers: formData.dealBreakers,
        important_qualities: formData.importantQualities,
        about_me: formData.aboutMe,
        looking_for: formData.lookingFor,
        additional_info: formData.additionalInfo || null,
        is_active: formData.isActive,
        profile_completed: true
      };
      
      // Try to update existing profile, or create new one
      const { data: existingProfile } = await db.matchingProfiles.getByUserId(user.id);
      
      if (existingProfile) {
        const { error } = await db.matchingProfiles.update(user.id, profileData);
        if (error) throw error;
      } else {
        const { error } = await db.matchingProfiles.create(profileData);
        if (error) throw error;
      }
      
      setSuccessMessage('Matching profile saved successfully!');
      
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
      
    } catch (error) {
      console.error('Error saving matching profile:', error);
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
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="form-title">
          {editMode ? 'Edit Your Matching Profile' : 'Set Up Your Matching Profile'}
        </h2>
        <p className="text-gray-600">
          Tell us about yourself and what you're looking for in a roommate and living situation.
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
        {/* Location & Housing Preferences */}
        <h3 className="card-title mb-4">Location & Housing Preferences</h3>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Preferred Location <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.preferredLocation ? 'border-red-500' : ''}`}
              type="text"
              value={formData.preferredLocation}
              onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
              placeholder="City, State or ZIP code"
              disabled={loading}
              required
            />
            {errors.preferredLocation && (
              <div className="text-red-500 mt-1">
                {errors.preferredLocation}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Max Commute Time <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.maxCommute ? 'border-red-500' : ''}`}
              value={formData.maxCommute}
              onChange={(e) => handleInputChange('maxCommute', e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select commute time</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2+ hours</option>
            </select>
            {errors.maxCommute && (
              <div className="text-red-500 mt-1">
                {errors.maxCommute}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group mb-4">
          <label className="label">
            Housing Types <span className="text-red-500">*</span>
          </label>
          <div className="grid-auto mt-2">
            {housingTypeOptions.map(option => (
              <div
                key={option}
                className={`checkbox-item ${formData.housingType.includes(option) ? 'selected' : ''}`}
                onClick={() => handleArrayChange('housingType', option, !formData.housingType.includes(option))}
              >
                <input
                  type="checkbox"
                  checked={formData.housingType.includes(option)}
                  onChange={() => {}}
                  disabled={loading}
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
          {errors.housingType && (
            <div className="text-red-500 mt-1">
              {errors.housingType}
            </div>
          )}
        </div>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">Price Range (Monthly)</label>
            <div className="mb-2">
              <label className="text-gray-600">Min: ${formData.priceRangeMin}</label>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={formData.priceRangeMin}
                onChange={(e) => handleRangeChange('priceRangeMin', e.target.value)}
                disabled={loading}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="text-gray-600">Max: ${formData.priceRangeMax}</label>
              <input
                type="range"
                min="500"
                max="5000"
                step="50"
                value={formData.priceRangeMax}
                onChange={(e) => handleRangeChange('priceRangeMax', e.target.value)}
                disabled={loading}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">
              Desired Move-in Date <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.moveInDate ? 'border-red-500' : ''}`}
              type="date"
              value={formData.moveInDate}
              onChange={(e) => handleInputChange('moveInDate', e.target.value)}
              disabled={loading}
              required
            />
            {errors.moveInDate && (
              <div className="text-red-500 mt-1">
                {errors.moveInDate}
              </div>
            )}
          </div>
        </div>
        
        {/* Recovery Information */}
        <h3 className="card-title mb-4">Recovery Information</h3>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Recovery Stage <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.recoveryStage ? 'border-red-500' : ''}`}
              value={formData.recoveryStage}
              onChange={(e) => handleInputChange('recoveryStage', e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select recovery stage</option>
              <option value="early">Early recovery (0-90 days)</option>
              <option value="stable">Stable recovery (3 months - 1 year)</option>
              <option value="maintained">Maintained recovery (1+ years)</option>
              <option value="long-term">Long-term recovery (5+ years)</option>
            </select>
            {errors.recoveryStage && (
              <div className="text-red-500 mt-1">
                {errors.recoveryStage}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Sobriety Date</label>
            <input
              className="input"
              type="date"
              value={formData.sobrietyDate}
              onChange={(e) => handleInputChange('sobrietyDate', e.target.value)}
              disabled={loading}
            />
            <div className="text-gray-500 mt-1">
              Optional - helps with compatibility matching
            </div>
          </div>
        </div>
        
        <div className="form-group mb-4">
          <label className="label">
            Recovery Programs <span className="text-red-500">*</span>
          </label>
          <div className="grid-auto mt-2">
            {programTypeOptions.map(option => (
              <div
                key={option}
                className={`checkbox-item ${formData.programType.includes(option) ? 'selected' : ''}`}
                onClick={() => handleArrayChange('programType', option, !formData.programType.includes(option))}
              >
                <input
                  type="checkbox"
                  checked={formData.programType.includes(option)}
                  onChange={() => {}}
                  disabled={loading}
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
          {errors.programType && (
            <div className="text-red-500 mt-1">
              {errors.programType}
            </div>
          )}
        </div>

        {/* Lifestyle Preferences */}
        <h3 className="card-title mb-4">Lifestyle Preferences</h3>

        <div className="form-group mb-4">
          <label className="label">
            Work Schedule <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.workSchedule ? 'border-red-500' : ''}`}
            value={formData.workSchedule}
            onChange={(e) => handleInputChange('workSchedule', e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select work schedule</option>
            <option value="traditional">Traditional (9-5)</option>
            <option value="early">Early morning shift</option>
            <option value="late">Late shift/Evening</option>
            <option value="rotating">Rotating shifts</option>
            <option value="weekend">Weekend work</option>
            <option value="remote">Work from home</option>
            <option value="student">Student schedule</option>
            <option value="unemployed">Currently unemployed</option>
            <option value="retired">Retired</option>
          </select>
          {errors.workSchedule && (
            <div className="text-red-500 mt-1">
              {errors.workSchedule}
            </div>
          )}
        </div>
        
        {/* About You */}
        <h3 className="card-title mb-4">About You</h3>
        
        <div className="form-group mb-4">
          <label className="label">
            Tell us about yourself <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input ${errors.aboutMe ? 'border-red-500' : ''}`}
            value={formData.aboutMe}
            onChange={(e) => handleInputChange('aboutMe', e.target.value)}
            placeholder="Share your personality, interests, recovery journey, and what makes you a good roommate..."
            disabled={loading}
            required
            style={{ minHeight: '120px', resize: 'vertical' }}
          />
          <div className="text-gray-500 mt-1">
            {formData.aboutMe.length}/500 characters
          </div>
          {errors.aboutMe && (
            <div className="text-red-500 mt-1">
              {errors.aboutMe}
            </div>
          )}
        </div>
        
        <div className="form-group mb-4">
          <label className="label">
            What are you looking for in a roommate? <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input ${errors.lookingFor ? 'border-red-500' : ''}`}
            value={formData.lookingFor}
            onChange={(e) => handleInputChange('lookingFor', e.target.value)}
            placeholder="Describe your ideal roommate and living situation..."
            disabled={loading}
            required
            style={{ minHeight: '120px', resize: 'vertical' }}
          />
          <div className="text-gray-500 mt-1">
            {formData.lookingFor.length}/500 characters
          </div>
          {errors.lookingFor && (
            <div className="text-red-500 mt-1">
              {errors.lookingFor}
            </div>
          )}
        </div>
        
        {/* Interests */}
        <div className="form-group mb-4">
          <label className="label">
            Interests & Hobbies <span className="text-red-500">*</span>
          </label>
          <div className="grid-auto mt-2">
            {interestOptions.map(option => (
              <div
                key={option}
                className={`checkbox-item ${formData.interests.includes(option) ? 'selected' : ''}`}
                onClick={() => handleArrayChange('interests', option, !formData.interests.includes(option))}
              >
                <input
                  type="checkbox"
                  checked={formData.interests.includes(option)}
                  onChange={() => {}}
                  disabled={loading}
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
          {errors.interests && (
            <div className="text-red-500 mt-1">
              {errors.interests}
            </div>
          )}
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
                <div className="loading-spinner small mr-2"></div>
                Saving Profile...
              </div>
            ) : (
              `${editMode ? 'Update Matching Profile' : 'Save Matching Profile'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchingProfileForm;
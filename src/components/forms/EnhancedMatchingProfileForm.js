// src/components/forms/EnhancedMatchingProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const EnhancedMatchingProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { user, profile, hasRole } = useAuth();
  
  const [formData, setFormData] = useState({
    // Location & Housing Preferences
    preferredLocation: '',
    targetZipCodes: '',
    searchRadius: '25',
    currentLocation: '',
    relocationTimeline: '',
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
    
    // Recovery Information (Enhanced)
    recoveryStage: '',
    primarySubstance: '',
    timeInRecovery: '',
    treatmentHistory: '',
    programType: [],
    sobrietyDate: '',
    sponsorMentor: '',
    supportMeetings: '',
    spiritualAffiliation: '',
    primaryIssues: [],
    recoveryMethods: [],
    
    // Lifestyle Preferences (Enhanced)
    workSchedule: '',
    socialLevel: '',
    cleanlinessLevel: '',
    noiseLevel: '',
    guestPolicy: '',
    bedtimePreference: '',
    transportation: '',
    choreSharingPreference: '',
    preferredSupportStructure: '',
    conflictResolutionStyle: '',
    
    // Living Situation Preferences
    petsOwned: false,
    petsComfortable: true,
    overnightGuestsOk: true,
    sharedGroceries: false,
    cookingFrequency: '',
    
    // Housing Assistance
    housingSubsidy: [],
    hasSection8: false,
    acceptsSubsidy: true,
    
    // Compatibility Factors
    interests: [],
    dealBreakers: [],
    importantQualities: [],
    
    // Open-ended responses
    aboutMe: '',
    lookingFor: '',
    additionalInfo: '',
    specialNeeds: '',
    
    // Status
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Enhanced form options based on old system
  const housingTypeOptions = [
    'Apartment', 'House', 'Condo', 'Townhouse', 'Room in house', 'Studio', 
    'Duplex', 'Sober living facility', 'Transitional housing'
  ];
  
  const substanceUseOptions = [
    'Alcohol', 'Marijuana', 'Prescription medications', 'Tobacco/Nicotine', 
    'Cocaine', 'Heroin', 'Fentanyl', 'Methamphetamine', 'Other', 'None'
  ];
  
  const primaryIssuesOptions = [
    'alcohol', 'cocaine', 'heroin', 'fentanyl', 'methamphetamine', 
    'prescription-opioids', 'prescription-stimulants', 'cannabis', 'other'
  ];
  
  const recoveryMethodsOptions = [
    '12-step', 'diet-exercise', 'clinical-therapy', 'church-religion', 'recovery-community'
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

  const housingSubsidyOptions = [
    'section_8', 'nonprofit_community_org', 'va_benefits', 'disability_assistance', 
    'lihtc', 'other'
  ];

  const spiritualAffiliationOptions = [
    'christian-protestant', 'christian-catholic', 'muslim', 'jewish', 'buddhist',
    'spiritual-not-religious', 'agnostic', 'atheist', 'other'
  ];

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user || !hasRole('applicant')) return;

      try {
        const { data: applicantForm } = await db.applicantForms.getByUserId(user.id);
        
        if (applicantForm) {
          setFormData(prev => ({
            ...prev,
            // Map all the comprehensive fields from your old system
            preferredLocation: applicantForm.preferred_location || '',
            targetZipCodes: applicantForm.target_zip_codes?.join(', ') || '',
            searchRadius: applicantForm.search_radius?.toString() || '25',
            currentLocation: applicantForm.current_location || '',
            relocationTimeline: applicantForm.relocation_timeline || '',
            maxCommute: applicantForm.max_commute?.toString() || '',
            housingType: applicantForm.housing_type || [],
            priceRangeMin: applicantForm.price_range_min || 500,
            priceRangeMax: applicantForm.price_range_max || 2000,
            moveInDate: applicantForm.move_in_date || '',
            leaseDuration: applicantForm.lease_duration || '',
            
            // Personal & Recovery
            ageRangeMin: applicantForm.age_range_min || 18,
            ageRangeMax: applicantForm.age_range_max || 65,
            genderPreference: applicantForm.gender_preference || '',
            smokingPreference: applicantForm.smoking_preference || '',
            petPreference: applicantForm.pet_preference || '',
            substanceUse: applicantForm.substance_use || [],
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
            
            // Lifestyle
            workSchedule: applicantForm.work_schedule || '',
            socialLevel: applicantForm.social_level?.toString() || '',
            cleanlinessLevel: applicantForm.cleanliness_level?.toString() || '',
            noiseLevel: applicantForm.noise_level?.toString() || '',
            guestPolicy: applicantForm.guest_policy || '',
            bedtimePreference: applicantForm.bedtime_preference || '',
            transportation: applicantForm.transportation || '',
            choreSharingPreference: applicantForm.chore_sharing_preference || '',
            preferredSupportStructure: applicantForm.preferred_support_structure || '',
            conflictResolutionStyle: applicantForm.conflict_resolution_style || '',
            
            // Living situation
            petsOwned: applicantForm.pets_owned || false,
            petsComfortable: applicantForm.pets_comfortable !== false,
            overnightGuestsOk: applicantForm.overnight_guests_ok !== false,
            sharedGroceries: applicantForm.shared_groceries || false,
            cookingFrequency: applicantForm.cooking_frequency || '',
            
            // Housing assistance
            housingSubsidy: applicantForm.housing_subsidy || [],
            hasSection8: applicantForm.has_section8 || false,
            acceptsSubsidy: applicantForm.accepts_subsidy !== false,
            
            // Compatibility
            interests: applicantForm.interests || [],
            dealBreakers: applicantForm.deal_breakers || [],
            importantQualities: applicantForm.important_qualities || [],
            
            // Text fields
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
      // Parse target zip codes
      const targetZipCodes = formData.targetZipCodes
        .split(',')
        .map(zip => zip.trim())
        .filter(zip => zip && /^\d{5}$/.test(zip));

      const applicantFormData = {
        user_id: user.id,
        
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
        move_in_date: formData.moveInDate,
        lease_duration: formData.leaseDuration || null,
        
        // Personal Preferences
        age_range_min: formData.ageRangeMin,
        age_range_max: formData.ageRangeMax,
        gender_preference: formData.genderPreference || null,
        smoking_preference: formData.smokingPreference || null,
        pet_preference: formData.petPreference || null,
        substance_use: formData.substanceUse,
        
        // Recovery Information
        recovery_stage: formData.recoveryStage,
        primary_substance: formData.primarySubstance || null,
        time_in_recovery: formData.timeInRecovery || null,
        treatment_history: formData.treatmentHistory || null,
        program_type: formData.programType,
        sobriety_date: formData.sobrietyDate || null,
        sponsor_mentor: formData.sponsorMentor || null,
        support_meetings: formData.supportMeetings || null,
        spiritual_affiliation: formData.spiritualAffiliation || null,
        primary_issues: formData.primaryIssues,
        recovery_methods: formData.recoveryMethods,
        
        // Lifestyle Preferences
        work_schedule: formData.workSchedule,
        social_level: parseInt(formData.socialLevel) || null,
        cleanliness_level: parseInt(formData.cleanlinessLevel) || null,
        noise_level: parseInt(formData.noiseLevel) || null,
        guest_policy: formData.guestPolicy || null,
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
      
      // Try to update existing form, or create new one
      const { data: existingForm } = await db.applicantForms.getByUserId(user.id);
      
      if (existingForm) {
        const { error } = await db.applicantForms.update(user.id, applicantFormData);
        if (error) throw error;
      } else {
        const { error } = await db.applicantForms.create(applicantFormData);
        if (error) throw error;
      }
      
      setSuccessMessage('Matching profile saved successfully!');
      
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
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="form-title">
          {editMode ? 'Edit Your Comprehensive Matching Profile' : 'Create Your Comprehensive Matching Profile'}
        </h2>
        <p className="text-gray-600">
          Complete information helps us find the best roommate matches for your recovery journey.
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
              placeholder="City, State or general area"
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
            <label className="label">Target ZIP Codes</label>
            <input
              className="input"
              type="text"
              value={formData.targetZipCodes}
              onChange={(e) => handleInputChange('targetZipCodes', e.target.value)}
              placeholder="29301, 29302, 29303 (comma separated)"
              disabled={loading}
            />
            <div className="text-gray-500 mt-1 text-sm">
              Specific ZIP codes you prefer (optional)
            </div>
          </div>
        </div>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">Current Location</label>
            <input
              className="input"
              type="text"
              value={formData.currentLocation}
              onChange={(e) => handleInputChange('currentLocation', e.target.value)}
              placeholder="Where you currently live"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="label">Search Radius (miles)</label>
            <select
              className="input"
              value={formData.searchRadius}
              onChange={(e) => handleInputChange('searchRadius', e.target.value)}
              disabled={loading}
            >
              <option value="10">10 miles</option>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
        </div>

        {/* Continue with the rest of the comprehensive form sections... */}
        {/* Recovery Information Section - Enhanced */}
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
              <option value="stabilizing">Stabilizing (3-12 months)</option>
              <option value="stable">Stable recovery (1+ years)</option>
              <option value="long-term">Long-term recovery (3+ years)</option>
            </select>
            {errors.recoveryStage && (
              <div className="text-red-500 mt-1">
                {errors.recoveryStage}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Primary Substance</label>
            <select
              className="input"
              value={formData.primarySubstance}
              onChange={(e) => handleInputChange('primarySubstance', e.target.value)}
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="alcohol">Alcohol</option>
              <option value="opioids">Opioids</option>
              <option value="stimulants">Stimulants</option>
              <option value="cannabis">Cannabis</option>
              <option value="multiple">Multiple substances</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">Time in Recovery</label>
            <select
              className="input"
              value={formData.timeInRecovery}
              onChange={(e) => handleInputChange('timeInRecovery', e.target.value)}
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="0_90_days">0-90 days</option>
              <option value="3_12_months">3-12 months</option>
              <option value="1_3_years">1-3 years</option>
              <option value="3_plus_years">3+ years</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Treatment History</label>
            <select
              className="input"
              value={formData.treatmentHistory}
              onChange={(e) => handleInputChange('treatmentHistory', e.target.value)}
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="no-formal-treatment">No formal treatment</option>
              <option value="outpatient">Outpatient only</option>
              <option value="inpatient">Inpatient/Residential</option>
              <option value="multiple">Multiple programs</option>
            </select>
          </div>
        </div>

        <div className="form-group mb-4">
          <label className="label">Spiritual/Religious Affiliation</label>
          <select
            className="input"
            value={formData.spiritualAffiliation}
            onChange={(e) => handleInputChange('spiritualAffiliation', e.target.value)}
            disabled={loading}
          >
            <option value="">Select...</option>
            {spiritualAffiliationOptions.map(option => (
              <option key={option} value={option}>
                {option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Continue with all other sections from the old comprehensive form... */}
        
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

export default EnhancedMatchingProfileForm;
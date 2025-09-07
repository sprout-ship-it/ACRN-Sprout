// src/components/forms/EnhancedMatchingProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const EnhancedMatchingProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { user, profile, hasRole } = useAuth();
  
  const [formData, setFormData] = useState({
    // ✅ PHASE 3: Added demographic data fields
    // Personal Demographics (from BasicProfileForm)
    dateOfBirth: '',
    phone: '',
    gender: '',
    sex: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    
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
    budgetMax: 1000, // Key field for matching
    moveInDate: '',
    leaseDuration: '',
    
    // Personal Demographics & Preferences
    ageRangeMin: 18,
    ageRangeMax: 65,
    genderPreference: '',
    preferredRoommateGender: '', // Key field for matching
    smokingPreference: '',
    smokingStatus: '', // Key field for matching
    petPreference: '',
    
    // Recovery Information
    recoveryStage: '', // Key field for matching
    primarySubstance: '',
    timeInRecovery: '',
    treatmentHistory: '',
    programType: [],
    sobrietyDate: '',
    sponsorMentor: '',
    supportMeetings: '',
    spiritualAffiliation: '', // Key field for matching
    primaryIssues: [], // Key field for matching
    recoveryMethods: [], // Key field for matching
    
    // Lifestyle Preferences (1-5 scales for matching)
    workSchedule: '', // Key field for matching
    socialLevel: 3, // 1-5 scale for matching
    cleanlinessLevel: 3, // 1-5 scale for matching
    noiseLevel: 3, // 1-5 scale for matching
    guestPolicy: '',
    guestsPolicy: '', // Key field for matching
    bedtimePreference: '', // Key field for matching
    transportation: '',
    choreSharingPreference: '',
    preferredSupportStructure: '',
    conflictResolutionStyle: '',
    
    // Living Situation Preferences (Key fields for matching)
    petsOwned: false, // Key field for matching
    petsComfortable: true, // Key field for matching
    overnightGuestsOk: true, // Key field for matching
    sharedGroceries: false, // Key field for matching
    cookingFrequency: '',
    
    // Housing Assistance
    housingSubsidy: [], // Key field for matching
    hasSection8: false,
    acceptsSubsidy: true,
    
    // Compatibility Factors
    interests: [], // Key field for matching
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
  
  // ✅ PHASE 3: Added demographic options
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
  
  // Form options based on matching algorithm requirements
  const housingTypeOptions = [
    'Apartment', 'House', 'Condo', 'Townhouse', 'Room in house', 'Studio', 
    'Duplex', 'Sober living facility', 'Transitional housing'
  ];
  
  const genderPreferenceOptions = [
    { value: '', label: 'No preference' },
    { value: 'no_preference', label: 'No preference' },
    { value: 'same_gender', label: 'Same gender only' },
    { value: 'different_gender', label: 'Different gender only' }
  ];

  const smokingStatusOptions = [
    { value: '', label: 'Select smoking status' },
    { value: 'non_smoker', label: 'Non-smoker' },
    { value: 'outdoor_only', label: 'Smoke outdoors only' },
    { value: 'occasional', label: 'Occasional smoker' },
    { value: 'regular', label: 'Regular smoker' }
  ];

  const recoveryStageOptions = [
    { value: '', label: 'Select recovery stage' },
    { value: 'early', label: 'Early Recovery (0-6 months)' },
    { value: 'stabilizing', label: 'Stabilizing (6-18 months)' },
    { value: 'stable', label: 'Stable Recovery (1.5-3 years)' },
    { value: 'long-term', label: 'Long-term Recovery (3+ years)' }
  ];

  const guestsPolicyOptions = [
    { value: '', label: 'Select guest policy' },
    { value: 'no_guests', label: 'No overnight guests' },
    { value: 'rare_guests', label: 'Rare overnight guests' },
    { value: 'moderate_guests', label: 'Moderate overnight guests' },
    { value: 'frequent_guests', label: 'Frequent overnight guests' }
  ];

  const bedtimePreferenceOptions = [
    { value: '', label: 'Select bedtime preference' },
    { value: 'early', label: 'Early (before 10 PM)' },
    { value: 'moderate', label: 'Moderate (10 PM - 12 AM)' },
    { value: 'late', label: 'Late (after 12 AM)' },
    { value: 'varies', label: 'Varies/Flexible' }
  ];

  const workScheduleOptions = [
    { value: '', label: 'Select work schedule' },
    { value: 'traditional_9_5', label: 'Traditional 9-5' },
    { value: 'flexible', label: 'Flexible hours' },
    { value: 'early_morning', label: 'Early morning shift' },
    { value: 'night_shift', label: 'Night shift' },
    { value: 'student', label: 'Student schedule' },
    { value: 'irregular', label: 'Irregular/Varies' },
    { value: 'unemployed', label: 'Currently unemployed' }
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
  
  const housingSubsidyOptions = [
    'section_8', 'nonprofit_community_org', 'va_benefits', 'disability_assistance', 
    'lihtc', 'other'
  ];

  const spiritualAffiliationOptions = [
    { value: '', label: 'Select spiritual affiliation' },
    { value: 'christian-protestant', label: 'Christian (Protestant)' },
    { value: 'christian-catholic', label: 'Christian (Catholic)' },
    { value: 'muslim', label: 'Muslim' },
    { value: 'jewish', label: 'Jewish' },
    { value: 'buddhist', label: 'Buddhist' },
    { value: 'spiritual-not-religious', label: 'Spiritual but not religious' },
    { value: 'agnostic', label: 'Agnostic' },
    { value: 'atheist', label: 'Atheist' },
    { value: 'other', label: 'Other' }
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
            // ✅ PHASE 3: Load demographic data
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
            
            // Map all existing fields from database
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
            
            ageRangeMin: applicantForm.age_range_min || 18,
            ageRangeMax: applicantForm.age_range_max || 65,
            genderPreference: applicantForm.gender_preference || '',
            preferredRoommateGender: applicantForm.preferred_roommate_gender || '',
            smokingPreference: applicantForm.smoking_preference || '',
            smokingStatus: applicantForm.smoking_status || '',
            petPreference: applicantForm.pet_preference || '',
            
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
            
            petsOwned: applicantForm.pets_owned || false,
            petsComfortable: applicantForm.pets_comfortable !== false,
            overnightGuestsOk: applicantForm.overnight_guests_ok !== false,
            sharedGroceries: applicantForm.shared_groceries || false,
            cookingFrequency: applicantForm.cooking_frequency || '',
            
            housingSubsidy: applicantForm.housing_subsidy || [],
            hasSection8: applicantForm.has_section8 || false,
            acceptsSubsidy: applicantForm.accepts_subsidy !== false,
            
            interests: applicantForm.interests || [],
            dealBreakers: applicantForm.deal_breakers || [],
            importantQualities: applicantForm.important_qualities || [],
            
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
  
  // ✅ PHASE 3: Updated completion percentage to include demographic fields
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
  
  // ✅ PHASE 3: Updated validation to include demographic fields
  const validateForm = () => {
    const newErrors = {};
    
    // ✅ PHASE 3: Demographic validation
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
  
  // ✅ PHASE 3: Updated form submission to include demographic data
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
        // ✅ PHASE 3: Include demographic data in submission
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
        {/* ✅ PHASE 3: Added Personal Information Section */}
        <h3 className="card-title mb-4">Personal Information</h3>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">First Name</label>
            <input
              className="input"
              type="text"
              value={profile?.first_name || ''}
              disabled
            />
          </div>
          
          <div className="form-group">
            <label className="label">Last Name</label>
            <input
              className="input"
              type="text"
              value={profile?.last_name || ''}
              disabled
            />
          </div>
        </div>
        
        <div className="form-group mb-4">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={profile?.email || ''}
            disabled
          />
        </div>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Date of Birth <span className="text-red-500">*</span>
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
              <div className="text-red-500 mt-1">{errors.dateOfBirth}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Phone Number <span className="text-red-500">*</span>
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
              <div className="text-red-500 mt-1">{errors.phone}</div>
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
            <div className="text-gray-500 mt-1 text-sm">
              This information helps us provide better matches
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
            <div className="text-gray-500 mt-1 text-sm">
              Used for housing compatibility purposes
            </div>
          </div>
        </div>

        {/* Address Information (Optional) */}
        <h4 style={{ color: 'var(--secondary-teal)', marginBottom: 'var(--spacing-lg)', paddingBottom: '10px', borderBottom: '2px solid var(--border-beige)' }}>
          Address Information (Optional)
        </h4>

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
            <div className="text-red-500 mt-1">{errors.zipCode}</div>
          )}
        </div>

        {/* Emergency Contact (Optional) */}
        <h4 style={{ color: 'var(--secondary-teal)', marginBottom: 'var(--spacing-lg)', paddingBottom: '10px', borderBottom: '2px solid var(--border-beige)' }}>
          Emergency Contact (Optional)
        </h4>

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
              <div className="text-red-500 mt-1">{errors.preferredLocation}</div>
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
              Specific ZIP codes you prefer (optional but helps with location matching)
            </div>
          </div>
        </div>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Personal Budget Maximum <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.budgetMax ? 'border-red-500' : ''}`}
              type="number"
              value={formData.budgetMax}
              onChange={(e) => handleInputChange('budgetMax', e.target.value)}
              placeholder="Your maximum monthly budget"
              disabled={loading}
              min="200"
              max="5000"
              required
            />
            {errors.budgetMax && (
              <div className="text-red-500 mt-1">{errors.budgetMax}</div>
            )}
            <div className="text-gray-500 mt-1 text-sm">
              Your personal budget for housing costs
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">
              Maximum Commute Time <span className="text-red-500">*</span>
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
              <option value="unlimited">No preference</option>
            </select>
            {errors.maxCommute && (
              <div className="text-red-500 mt-1">{errors.maxCommute}</div>
            )}
          </div>
        </div>

        {/* Housing Type Selection */}
        <div className="form-group mb-4">
          <label className="label">
            Housing Type Preferences <span className="text-red-500">*</span>
          </label>
          <div className="checkbox-grid">
            {housingTypeOptions.map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.housingType.includes(type)}
                  onChange={(e) => handleArrayChange('housingType', type, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">{type}</span>
              </label>
            ))}
          </div>
          {errors.housingType && (
            <div className="text-red-500 mt-1">{errors.housingType}</div>
          )}
        </div>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Move-in Date <span className="text-red-500">*</span>
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
              <div className="text-red-500 mt-1">{errors.moveInDate}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Preferred Lease Duration</label>
            <select
              className="input"
              value={formData.leaseDuration}
              onChange={(e) => handleInputChange('leaseDuration', e.target.value)}
              disabled={loading}
            >
              <option value="">Select duration</option>
              <option value="month-to-month">Month-to-month</option>
              <option value="6-months">6 months</option>
              <option value="12-months">12 months</option>
              <option value="18-months">18 months</option>
              <option value="24-months">24 months</option>
            </select>
          </div>
        </div>

        {/* Personal Preferences & Demographics */}
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

        {/* Recovery Information - Enhanced */}
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
              {recoveryStageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.recoveryStage && (
              <div className="text-red-500 mt-1">{errors.recoveryStage}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Spiritual Affiliation <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.spiritualAffiliation ? 'border-red-500' : ''}`}
              value={formData.spiritualAffiliation}
              onChange={(e) => handleInputChange('spiritualAffiliation', e.target.value)}
              disabled={loading}
              required
            >
              {spiritualAffiliationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.spiritualAffiliation && (
              <div className="text-red-500 mt-1">{errors.spiritualAffiliation}</div>
            )}
          </div>
        </div>

        {/* Primary Issues */}
        <div className="form-group mb-4">
          <label className="label">
            Primary Issues <span className="text-red-500">*</span>
          </label>
          <div className="checkbox-grid">
            {primaryIssuesOptions.map(issue => (
              <label key={issue} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.primaryIssues.includes(issue)}
                  onChange={(e) => handleArrayChange('primaryIssues', issue, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">
                  {issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
          {errors.primaryIssues && (
            <div className="text-red-500 mt-1">{errors.primaryIssues}</div>
          )}
        </div>

        {/* Recovery Methods */}
        <div className="form-group mb-4">
          <label className="label">
            Recovery Methods <span className="text-red-500">*</span>
          </label>
          <div className="checkbox-grid">
            {recoveryMethodsOptions.map(method => (
              <label key={method} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.recoveryMethods.includes(method)}
                  onChange={(e) => handleArrayChange('recoveryMethods', method, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">
                  {method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
          {errors.recoveryMethods && (
            <div className="text-red-500 mt-1">{errors.recoveryMethods}</div>
          )}
        </div>

        {/* Program Types */}
        <div className="form-group mb-4">
          <label className="label">
            Recovery Program Types <span className="text-red-500">*</span>
          </label>
          <div className="checkbox-grid">
            {programTypeOptions.map(program => (
              <label key={program} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.programType.includes(program)}
                  onChange={(e) => handleArrayChange('programType', program, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">{program}</span>
              </label>
            ))}
          </div>
          {errors.programType && (
            <div className="text-red-500 mt-1">{errors.programType}</div>
          )}
        </div>

        {/* Lifestyle Preferences - Enhanced with Scales */}
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
            {workScheduleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.workSchedule && (
            <div className="text-red-500 mt-1">{errors.workSchedule}</div>
          )}
        </div>

        {/* 1-5 Scale Preferences */}
        <div className="grid-3 mb-4">
          <div className="form-group">
            <label className="label">Social Level (1-5)</label>
            <div className="range-container">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.socialLevel}
                onChange={(e) => handleRangeChange('socialLevel', e.target.value)}
                className="range-slider"
                disabled={loading}
              />
              <div className="range-labels">
                <span>Quiet</span>
                <span className="range-value">{formData.socialLevel}</span>
                <span>Very Social</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Cleanliness Level (1-5)</label>
            <div className="range-container">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.cleanlinessLevel}
                onChange={(e) => handleRangeChange('cleanlinessLevel', e.target.value)}
                className="range-slider"
                disabled={loading}
              />
              <div className="range-labels">
                <span>Relaxed</span>
                <span className="range-value">{formData.cleanlinessLevel}</span>
                <span>Very Clean</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Noise Level (1-5)</label>
            <div className="range-container">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.noiseLevel}
                onChange={(e) => handleRangeChange('noiseLevel', e.target.value)}
                className="range-slider"
                disabled={loading}
              />
              <div className="range-labels">
                <span>Very Quiet</span>
                <span className="range-value">{formData.noiseLevel}</span>
                <span>Loud OK</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">Bedtime Preference</label>
            <select
              className="input"
              value={formData.bedtimePreference}
              onChange={(e) => handleInputChange('bedtimePreference', e.target.value)}
              disabled={loading}
            >
              {bedtimePreferenceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Guest Policy</label>
            <select
              className="input"
              value={formData.guestsPolicy}
              onChange={(e) => handleInputChange('guestsPolicy', e.target.value)}
              disabled={loading}
            >
              {guestsPolicyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Living Situation Preferences */}
        <h3 className="card-title mb-4">Living Situation Preferences</h3>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.petsOwned}
                onChange={(e) => handleInputChange('petsOwned', e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">I own pets</span>
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.petsComfortable}
                onChange={(e) => handleInputChange('petsComfortable', e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">I'm comfortable with roommate's pets</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.overnightGuestsOk}
                onChange={(e) => handleInputChange('overnightGuestsOk', e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">Overnight guests are OK</span>
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.sharedGroceries}
                onChange={(e) => handleInputChange('sharedGroceries', e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">I'm open to sharing groceries</span>
            </label>
          </div>
        </div>

        {/* Housing Assistance */}
        <h3 className="card-title mb-4">Housing Assistance</h3>
        
        <div className="form-group mb-4">
          <label className="label">Housing Assistance Programs</label>
          <div className="checkbox-grid">
            {housingSubsidyOptions.map(subsidy => (
              <label key={subsidy} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.housingSubsidy.includes(subsidy)}
                  onChange={(e) => handleArrayChange('housingSubsidy', subsidy, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">
                  {subsidy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Compatibility Factors */}
        <h3 className="card-title mb-4">Compatibility Factors</h3>
        
        <div className="form-group mb-4">
          <label className="label">
            Interests & Hobbies <span className="text-red-500">*</span>
          </label>
          <div className="checkbox-grid">
            {interestOptions.map(interest => (
              <label key={interest} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={(e) => handleArrayChange('interests', interest, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">{interest}</span>
              </label>
            ))}
          </div>
          {errors.interests && (
            <div className="text-red-500 mt-1">{errors.interests}</div>
          )}
        </div>

        {/* Open-ended Responses */}
        <h3 className="card-title mb-4">About You</h3>
        
        <div className="form-group mb-4">
          <label className="label">
            About Me <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input ${errors.aboutMe ? 'border-red-500' : ''}`}
            value={formData.aboutMe}
            onChange={(e) => handleInputChange('aboutMe', e.target.value)}
            placeholder="Tell potential roommates about yourself, your recovery journey, and what makes you a good roommate..."
            rows="4"
            disabled={loading}
            maxLength="500"
            required
          />
          <div className="text-gray-500 mt-1 text-sm">
            {formData.aboutMe.length}/500 characters
          </div>
          {errors.aboutMe && (
            <div className="text-red-500 mt-1">{errors.aboutMe}</div>
          )}
        </div>

        <div className="form-group mb-4">
          <label className="label">
            What I'm Looking For <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input ${errors.lookingFor ? 'border-red-500' : ''}`}
            value={formData.lookingFor}
            onChange={(e) => handleInputChange('lookingFor', e.target.value)}
            placeholder="Describe what you're looking for in a roommate and living situation..."
            rows="4"
            disabled={loading}
            maxLength="500"
            required
          />
          <div className="text-gray-500 mt-1 text-sm">
            {formData.lookingFor.length}/500 characters
          </div>
          {errors.lookingFor && (
            <div className="text-red-500 mt-1">{errors.lookingFor}</div>
          )}
        </div>

        {/* Profile Status */}
        <div className="form-group mb-4">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-text">Keep my profile active for matching</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            You can deactivate your profile at any time to stop receiving new matches
          </div>
        </div>

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
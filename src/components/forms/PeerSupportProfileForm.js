// src/components/forms/PeerSupportProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const PeerSupportProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { user, profile, hasRole } = useAuth();
  
  const [formData, setFormData] = useState({
    // ✅ PHASE 3: Demographic data now collected here instead of basic profile
    dateOfBirth: '',
    phone: '',
    gender: '',
    sex: '',
    
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    
    // Location & Availability
    serviceLocation: '',
    serviceRadius: '25',
    availableLocations: [],
    
    // Recovery Background
    timeInRecovery: '',
    recoveryStage: '',
    recoveryBackground: '',
    personalRecoveryStory: '',
    primarySubstancesExperience: [],
    treatmentExperience: [],
    
    // Credentials & Training
    certifications: '',
    education: '',
    professionalBackground: '',
    peerSupportTraining: [],
    continuingEducation: '',
    
    // Service Details
    specialties: '',
    supportedRecoveryMethods: [],
    serviceTypes: [],
    availability: '',
    maxClients: 10,
    sessionFormat: 'both', // individual, group, both
    sessionLength: '60',
    
    // Client Preferences
    minRecoveryStage: '',
    genderPreference: '',
    ageRangePreference: '',
    substanceSpecialties: [],
    culturalCompetencies: [],
    
    // Approach & Philosophy
    approachDescription: '',
    recoveryPhilosophy: '',
    strengths: [],
    communicationStyle: '',
    
    // Practical Information
    fees: '',
    insurance: false,
    slidingScale: false,
    meetingLocations: [],
    virtualServices: false,
    emergencyAvailability: false,
    
    // Additional Information
    languages: [],
    specialPopulations: [],
    additionalServices: [],
    personalInterests: [],
    
    // Bio & Contact
    bio: '',
    additionalInfo: '',
    
    // Status
    isActive: true,
    acceptingClients: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  // ✅ PHASE 3: Added demographic options
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
  
  const sexOptions = [
    { value: '', label: 'Select Biological Sex' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];
  
  // Form options
  const recoveryStageOptions = [
    'early', 'stabilizing', 'stable', 'long-term', 'maintained'
  ];
  
  const substanceOptions = [
    'alcohol', 'opioids', 'stimulants', 'cannabis', 'prescription-drugs', 
    'tobacco', 'behavioral-addictions', 'multiple-substances'
  ];
  
  const treatmentExperienceOptions = [
    'inpatient-rehab', 'outpatient-programs', 'detox', 'sober-living',
    'halfway-houses', 'therapeutic-communities', 'medication-assisted',
    'mental-health-treatment', 'court-ordered-programs'
  ];
  
  const peerSupportTrainingOptions = [
    'certified-peer-specialist', 'peer-recovery-coach', 'recovery-coach-academy',
    'smart-recovery-facilitator', 'refuge-recovery', 'lifering-facilitator',
    'celebrate-recovery', 'aa-sponsor-training', 'na-sponsor-training'
  ];
  
  const supportedMethodsOptions = [
    '12-step', 'smart-recovery', 'refuge-recovery', 'lifering', 'celebrate-recovery',
    'secular-recovery', 'harm-reduction', 'medication-assisted', 'holistic-approaches',
    'trauma-informed', 'mindfulness-based', 'cognitive-behavioral'
  ];
  
  const serviceTypeOptions = [
    'one-on-one-support', 'group-facilitation', 'family-support', 'crisis-intervention',
    'recovery-planning', 'goal-setting', 'relapse-prevention', 'life-skills',
    'employment-support', 'housing-assistance', 'advocacy', 'mentoring'
  ];
  
  const availabilityOptions = [
    'mornings', 'afternoons', 'evenings', 'weekends', 'weekdays-only',
    'flexible-schedule', 'on-call', 'emergency-availability'
  ];
  
  const strengthsOptions = [
    'active-listening', 'empathy', 'motivational-interviewing', 'crisis-management',
    'boundary-setting', 'problem-solving', 'advocacy', 'cultural-sensitivity',
    'trauma-awareness', 'family-dynamics', 'group-dynamics', 'conflict-resolution'
  ];
  
  const meetingLocationOptions = [
    'office', 'community-centers', 'libraries', 'coffee-shops', 'parks',
    'treatment-facilities', 'hospitals', 'clients-homes', 'virtual-only'
  ];
  
  const languageOptions = [
    'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'mandarin',
    'cantonese', 'japanese', 'korean', 'arabic', 'hindi', 'russian', 'other'
  ];
  
  const specialPopulationOptions = [
    'adolescents', 'young-adults', 'seniors', 'veterans', 'lgbtq+', 'women',
    'men', 'parents', 'healthcare-workers', 'first-responders', 'professionals',
    'students', 'homeless-individuals', 'justice-involved'
  ];
  
  const additionalServiceOptions = [
    'transportation-assistance', 'childcare-referrals', 'housing-referrals',
    'employment-referrals', 'educational-referrals', 'legal-referrals',
    'medical-referrals', 'mental-health-referrals', 'financial-assistance',
    'insurance-navigation', 'benefits-assistance'
  ];

  // ✅ PHASE 3: Load existing data from both tables
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user || !hasRole('peer')) return;

      try {
        // Load registrant profile for basic info and phone
        const registrantProfile = profile;
        
        // Load peer support profile for comprehensive data
        const { data: peerProfile } = await db.peerSupportProfiles.getByUserId(user.id);
        
        // Load demographic data from peer support profiles table
        if (peerProfile) {
          setFormData(prev => ({
            ...prev,
            // ✅ PHASE 3: Load demographic data from peer support profile
            phone: registrantProfile?.phone || '',
            gender: peerProfile.gender || '',
            // Calculate age from DOB if available, or use stored age
            dateOfBirth: peerProfile.date_of_birth || '',
            sex: peerProfile.sex || '', // Note: sex field may not exist in peer table
            
            // Load basic info from registrant profile
            firstName: registrantProfile?.first_name || '',
            lastName: registrantProfile?.last_name || '',
            email: registrantProfile?.email || '',
            
            // Load comprehensive peer support data
            serviceLocation: peerProfile.service_location || '',
            serviceRadius: peerProfile.service_radius?.toString() || '25',
            availableLocations: peerProfile.available_locations || [],
            
            timeInRecovery: peerProfile.time_in_recovery || '',
            recoveryStage: peerProfile.recovery_stage || '',
            recoveryBackground: peerProfile.recovery_background || '',
            personalRecoveryStory: peerProfile.personal_recovery_story || '',
            primarySubstancesExperience: peerProfile.primary_substances_experience || [],
            treatmentExperience: peerProfile.treatment_experience || [],
            
            certifications: peerProfile.certifications || '',
            education: peerProfile.education || '',
            professionalBackground: peerProfile.professional_background || '',
            peerSupportTraining: peerProfile.peer_support_training || [],
            continuingEducation: peerProfile.continuing_education || '',
            
            specialties: peerProfile.specialties || '',
            supportedRecoveryMethods: peerProfile.supported_recovery_methods || [],
            serviceTypes: peerProfile.service_types || [],
            availability: peerProfile.availability || '',
            maxClients: peerProfile.max_clients || 10,
            sessionFormat: peerProfile.session_format || 'both',
            sessionLength: peerProfile.session_length?.toString() || '60',
            
            minRecoveryStage: peerProfile.min_recovery_stage || '',
            genderPreference: peerProfile.gender_preference || '',
            ageRangePreference: peerProfile.age_range_preference || '',
            substanceSpecialties: peerProfile.substance_specialties || [],
            culturalCompetencies: peerProfile.cultural_competencies || [],
            
            approachDescription: peerProfile.approach_description || '',
            recoveryPhilosophy: peerProfile.recovery_philosophy || '',
            strengths: peerProfile.strengths || [],
            communicationStyle: peerProfile.communication_style || '',
            
            fees: peerProfile.fees || '',
            insurance: peerProfile.insurance || false,
            slidingScale: peerProfile.sliding_scale || false,
            meetingLocations: peerProfile.meeting_locations || [],
            virtualServices: peerProfile.virtual_services || false,
            emergencyAvailability: peerProfile.emergency_availability || false,
            
            languages: peerProfile.languages || [],
            specialPopulations: peerProfile.special_populations || [],
            additionalServices: peerProfile.additional_services || [],
            personalInterests: peerProfile.personal_interests || [],
            
            bio: peerProfile.bio || '',
            additionalInfo: peerProfile.additional_info || '',
            
            isActive: peerProfile.is_active !== false,
            acceptingClients: peerProfile.accepting_clients !== false
          }));
        } else {
          // No peer profile exists, load basic info from registrant profile
          setFormData(prev => ({
            ...prev,
            firstName: registrantProfile?.first_name || '',
            lastName: registrantProfile?.last_name || '',
            email: registrantProfile?.email || '',
            phone: registrantProfile?.phone || ''
          }));
        }
      } catch (error) {
        console.error('Error loading peer support profile:', error);
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
      // ✅ PHASE 3: Include demographic fields in completion calculation
      'dateOfBirth', 'phone', 'firstName', 'lastName', 'email', 
      'timeInRecovery', 'specialties', 'availability', 'bio'
    ];
    const arrayFields = ['supportedRecoveryMethods', 'serviceTypes'];
    
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
  
  // ✅ PHASE 3: Enhanced validation including demographic fields
  const validateForm = () => {
    const newErrors = {};
    
    // ✅ PHASE 3: Validate demographic fields
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Age validation
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be 18 or older';
      }
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Basic info validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Peer-specific validation
    if (!formData.timeInRecovery) newErrors.timeInRecovery = 'Time in recovery is required';
    if (!formData.specialties.trim()) newErrors.specialties = 'Specialties description is required';
    if (!formData.availability) newErrors.availability = 'Availability is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    
    // Array fields
    if (formData.supportedRecoveryMethods.length === 0) {
      newErrors.supportedRecoveryMethods = 'Please select at least one recovery method';
    }
    if (formData.serviceTypes.length === 0) {
      newErrors.serviceTypes = 'Please select at least one service type';
    }
    
    // Text length validation
    if (formData.bio.length > 1000) newErrors.bio = 'Bio must be 1000 characters or less';
    if (formData.specialties.length > 500) newErrors.specialties = 'Specialties must be 500 characters or less';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ✅ PHASE 3: Enhanced form submission with demographic data handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccessMessage('');
    
    try {
      // ✅ PHASE 3: Step 1: Update registrant profile with basic info and phone
      const registrantUpdates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };
      
      const { error: registrantError } = await db.profiles.update(user.id, registrantUpdates);
      if (registrantError) throw registrantError;
      
      // ✅ PHASE 3: Step 2: Calculate age from date of birth
      const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age;
      };
      
      // ✅ PHASE 3: Step 3: Prepare peer support profile data with demographics
      const peerProfileData = {
        user_id: user.id,
        
        // ✅ PHASE 3: Include demographic data
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender || null,
        date_of_birth: formData.dateOfBirth || null, // Store DOB for reference
        // Note: sex field may not exist in peer_support_profiles table
        
        // Location & Availability
        service_location: formData.serviceLocation || null,
        service_radius: parseInt(formData.serviceRadius),
        available_locations: formData.availableLocations,
        
        // Recovery Background
        time_in_recovery: formData.timeInRecovery,
        recovery_stage: formData.recoveryStage || null,
        recovery_background: formData.recoveryBackground || null,
        personal_recovery_story: formData.personalRecoveryStory || null,
        primary_substances_experience: formData.primarySubstancesExperience,
        treatment_experience: formData.treatmentExperience,
        
        // Credentials & Training
        certifications: formData.certifications || null,
        education: formData.education || null,
        professional_background: formData.professionalBackground || null,
        peer_support_training: formData.peerSupportTraining,
        continuing_education: formData.continuingEducation || null,
        
        // Service Details
        specialties: formData.specialties,
        supported_recovery_methods: formData.supportedRecoveryMethods,
        service_types: formData.serviceTypes,
        availability: formData.availability,
        max_clients: formData.maxClients,
        session_format: formData.sessionFormat,
        session_length: parseInt(formData.sessionLength),
        
        // Client Preferences
        min_recovery_stage: formData.minRecoveryStage || null,
        gender_preference: formData.genderPreference || null,
        age_range_preference: formData.ageRangePreference || null,
        substance_specialties: formData.substanceSpecialties,
        cultural_competencies: formData.culturalCompetencies,
        
        // Approach & Philosophy
        approach_description: formData.approachDescription || null,
        recovery_philosophy: formData.recoveryPhilosophy || null,
        strengths: formData.strengths,
        communication_style: formData.communicationStyle || null,
        
        // Practical Information
        fees: formData.fees || null,
        insurance: formData.insurance,
        sliding_scale: formData.slidingScale,
        meeting_locations: formData.meetingLocations,
        virtual_services: formData.virtualServices,
        emergency_availability: formData.emergencyAvailability,
        
        // Additional Information
        languages: formData.languages,
        special_populations: formData.specialPopulations,
        additional_services: formData.additionalServices,
        personal_interests: formData.personalInterests,
        
        // Bio & Contact
        bio: formData.bio,
        additional_info: formData.additionalInfo || null,
        
        // Status
        is_active: formData.isActive,
        accepting_clients: formData.acceptingClients,
        profile_completed: true
      };
      
      // Try to update existing profile, or create new one
      const { data: existingProfile } = await db.peerSupportProfiles.getByUserId(user.id);
      
      if (existingProfile) {
        const { error } = await db.peerSupportProfiles.update(user.id, peerProfileData);
        if (error) throw error;
      } else {
        const { error } = await db.peerSupportProfiles.create(peerProfileData);
        if (error) throw error;
      }
      
      setSuccessMessage('Peer support profile saved successfully!');
      
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
      
    } catch (error) {
      console.error('Error saving peer support profile:', error);
      setErrors({ submit: 'Failed to save peer support profile. Please try again.' });
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

  if (!hasRole('peer')) {
    return (
      <div className="alert alert-info">
        <p>Peer support profiles are only available for peer support specialists.</p>
      </div>
    );
  }
  
  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="form-title">
          {editMode ? 'Edit Your Peer Support Profile' : 'Create Your Peer Support Profile'}
        </h2>
        <p className="text-gray-600">
          Share your experience and approach to help others find the right peer support.
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
        {/* ✅ PHASE 3: Demographic Information Section */}
        <h3 className="card-title mb-4">Personal Information</h3>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.firstName ? 'border-red-500' : ''}`}
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={loading}
              required
            />
            {errors.firstName && (
              <div className="text-red-500 mt-1">{errors.firstName}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.lastName ? 'border-red-500' : ''}`}
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={loading}
              required
            />
            {errors.lastName && (
              <div className="text-red-500 mt-1">{errors.lastName}</div>
            )}
          </div>
        </div>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              required
            />
            {errors.email && (
              <div className="text-red-500 mt-1">{errors.email}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Phone <span className="text-red-500">*</span>
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
            <div className="text-gray-500 mt-1 text-sm">
              Your age helps clients find appropriate peer support
            </div>
          </div>
          
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
              Helps with client-peer matching preferences
            </div>
          </div>
        </div>

        {/* Recovery Background */}
        <h3 className="card-title mb-4">Your Recovery Background</h3>
        
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Time in Recovery <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.timeInRecovery ? 'border-red-500' : ''}`}
              value={formData.timeInRecovery}
              onChange={(e) => handleInputChange('timeInRecovery', e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select...</option>
              <option value="1-2 years">1-2 years</option>
              <option value="2-5 years">2-5 years</option>
              <option value="5-10 years">5-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
            {errors.timeInRecovery && (
              <div className="text-red-500 mt-1">{errors.timeInRecovery}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Recovery Stage</label>
            <select
              className="input"
              value={formData.recoveryStage}
              onChange={(e) => handleInputChange('recoveryStage', e.target.value)}
              disabled={loading}
            >
              <option value="">Select...</option>
              {recoveryStageOptions.map(stage => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Details */}
        <h3 className="card-title mb-4">Services You Provide</h3>
        
        <div className="form-group mb-4">
          <label className="label">
            Your Specialties & Approach <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input ${errors.specialties ? 'border-red-500' : ''}`}
            value={formData.specialties}
            onChange={(e) => handleInputChange('specialties', e.target.value)}
            placeholder="Describe your areas of expertise and approach to peer support..."
            disabled={loading}
            required
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
          <div className="text-gray-500 mt-1">
            {formData.specialties.length}/500 characters
          </div>
          {errors.specialties && (
            <div className="text-red-500 mt-1">{errors.specialties}</div>
          )}
        </div>

        <div className="form-group mb-4">
          <label className="label">
            Recovery Methods You Support <span className="text-red-500">*</span>
          </label>
          <div className="grid-auto mt-2">
            {supportedMethodsOptions.map(method => (
              <div
                key={method}
                className={`checkbox-item ${formData.supportedRecoveryMethods.includes(method) ? 'selected' : ''}`}
                onClick={() => handleArrayChange('supportedRecoveryMethods', method, !formData.supportedRecoveryMethods.includes(method))}
              >
                <input
                  type="checkbox"
                  checked={formData.supportedRecoveryMethods.includes(method)}
                  onChange={() => {}}
                  disabled={loading}
                />
                <span>{method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            ))}
          </div>
          {errors.supportedRecoveryMethods && (
            <div className="text-red-500 mt-1">{errors.supportedRecoveryMethods}</div>
          )}
        </div>

        <div className="form-group mb-4">
          <label className="label">
            Types of Support You Provide <span className="text-red-500">*</span>
          </label>
          <div className="grid-auto mt-2">
            {serviceTypeOptions.map(service => (
              <div
                key={service}
                className={`checkbox-item ${formData.serviceTypes.includes(service) ? 'selected' : ''}`}
                onClick={() => handleArrayChange('serviceTypes', service, !formData.serviceTypes.includes(service))}
              >
                <input
                  type="checkbox"
                  checked={formData.serviceTypes.includes(service)}
                  onChange={() => {}}
                  disabled={loading}
                />
                <span>{service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            ))}
          </div>
          {errors.serviceTypes && (
            <div className="text-red-500 mt-1">{errors.serviceTypes}</div>
          )}
        </div>

        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="label">
              Availability <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.availability ? 'border-red-500' : ''}`}
              value={formData.availability}
              onChange={(e) => handleInputChange('availability', e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select...</option>
              {availabilityOptions.map(option => (
                <option key={option} value={option}>
                  {option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            {errors.availability && (
              <div className="text-red-500 mt-1">{errors.availability}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Maximum Clients</label>
            <input
              className="input"
              type="number"
              min="1"
              max="50"
              value={formData.maxClients}
              onChange={(e) => handleInputChange('maxClients', parseInt(e.target.value))}
              disabled={loading}
            />
          </div>
        </div>

        {/* Bio Section */}
        <h3 className="card-title mb-4">About You</h3>
        
        <div className="form-group mb-4">
          <label className="label">
            Your Story & Approach <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input ${errors.bio ? 'border-red-500' : ''}`}
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Share your recovery journey and how you approach peer support..."
            disabled={loading}
            required
            style={{ minHeight: '150px', resize: 'vertical' }}
          />
          <div className="text-gray-500 mt-1">
            {formData.bio.length}/1000 characters
          </div>
          {errors.bio && (
            <div className="text-red-500 mt-1">{errors.bio}</div>
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
              `${editMode ? 'Update Peer Support Profile' : 'Save Peer Support Profile'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PeerSupportProfileForm;
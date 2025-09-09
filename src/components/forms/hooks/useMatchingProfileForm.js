// src/components/forms/hooks/useMatchingProfileForm.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../../utils/supabase';
import { 
  defaultFormData, 
  REQUIRED_FIELDS, 
  REQUIRED_ARRAY_FIELDS,
  VALIDATION_RULES 
} from '../constants/matchingFormConstants';

export const useMatchingProfileForm = () => {
  const { user, profile, hasRole } = useAuth();
  
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing data from database
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user || !hasRole('applicant')) {
        setInitialLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading existing data for user:', user.id);
        const { data: applicantForm } = await db.applicantForms.getByUserId(user.id);
        
        if (applicantForm) {
          console.log('🔍 Loaded applicant form data:', applicantForm);
          
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
        setErrors({ load: `Error loading data: ${error.message}` });
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingData();
  }, [user, profile, hasRole]);

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    let completed = 0;
    let total = REQUIRED_FIELDS.length + REQUIRED_ARRAY_FIELDS.length;
    
    REQUIRED_FIELDS.forEach(field => {
      if (formData[field] && formData[field].toString().trim() !== '') completed++;
    });
    
    REQUIRED_ARRAY_FIELDS.forEach(field => {
      if (formData[field] && formData[field].length > 0) completed++;
    });
    
    return Math.round((completed / total) * 100);
  };

  // Validation function
  const validateForm = () => {
    console.log('🔍 Starting form validation...');
    const newErrors = {};
    
    // Required field validation
    REQUIRED_FIELDS.forEach(field => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });
    
    // Required array field validation
    REQUIRED_ARRAY_FIELDS.forEach(field => {
      if (!formData[field] || formData[field].length === 0) {
        newErrors[field] = `Please select at least one ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    });

    // Age validation (must be 18+)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < VALIDATION_RULES.MIN_AGE) {
        newErrors.dateOfBirth = `You must be ${VALIDATION_RULES.MIN_AGE} or older to use this service`;
      }
    }

    // Phone validation
    if (formData.phone && !VALIDATION_RULES.PHONE_REGEX.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.zipCode && !VALIDATION_RULES.ZIP_CODE_REGEX.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    // Budget validation
    if (formData.budgetMax < VALIDATION_RULES.MIN_BUDGET) {
      newErrors.budgetMax = `Budget must be at least $${VALIDATION_RULES.MIN_BUDGET}`;
    }
    if (formData.budgetMax > VALIDATION_RULES.MAX_BUDGET) {
      newErrors.budgetMax = 'Budget seems unreasonably high. Please verify.';
    }

    // Text length validation
    if (formData.aboutMe.length > VALIDATION_RULES.MAX_ABOUT_ME_LENGTH) {
      newErrors.aboutMe = `About me must be ${VALIDATION_RULES.MAX_ABOUT_ME_LENGTH} characters or less`;
    }
    if (formData.lookingFor.length > VALIDATION_RULES.MAX_LOOKING_FOR_LENGTH) {
      newErrors.lookingFor = `Looking for must be ${VALIDATION_RULES.MAX_LOOKING_FOR_LENGTH} characters or less`;
    }
    if (formData.additionalInfo.length > VALIDATION_RULES.MAX_ADDITIONAL_INFO_LENGTH) {
      newErrors.additionalInfo = `Additional info must be ${VALIDATION_RULES.MAX_ADDITIONAL_INFO_LENGTH} characters or less`;
    }

    // Date validation
    if (formData.moveInDate) {
      const moveInDate = new Date(formData.moveInDate);
      const today = new Date();
      if (moveInDate < today) {
        newErrors.moveInDate = 'Move-in date cannot be in the past';
      }
    }

    console.log('🔍 Validation errors found:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    console.log('🔍 handleInputChange called:', { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (field, value, checked) => {
    console.log('🔍 handleArrayChange called:', { field, value, checked });
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle range changes
  const handleRangeChange = (field, value) => {
    console.log('🔍 handleRangeChange called:', { field, value });
    handleInputChange(field, parseInt(value));
  };

  // Submit form
  const submitForm = async (onComplete) => {
    console.log('🔍 Form submission started');
    
    if (!validateForm()) {
      console.log('🔍 Form validation failed');
      return false;
    }
    
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
      
      console.log('🔧 Updating applicant form with data:', applicantFormData);
      const { error } = await db.applicantForms.update(user.id, applicantFormData);
      
      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ Form submitted successfully');
      setSuccessMessage('Comprehensive matching profile saved successfully!');
      
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
      
      return true;
      
    } catch (error) {
      console.error('💥 Submission error:', error);
      setErrors({ submit: 'Failed to save matching profile. Please try again.' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    formData,
    errors,
    loading,
    initialLoading,
    successMessage,
    
    // Computed values
    completionPercentage: getCompletionPercentage(),
    canSubmit: hasRole('applicant'),
    
    // Handlers
    handleInputChange,
    handleArrayChange, 
    handleRangeChange,
    submitForm,
    
    // Utilities
    validateForm,
    setErrors,
    setSuccessMessage
  };
};
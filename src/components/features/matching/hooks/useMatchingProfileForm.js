// src/components/features/matching/hooks/useMatchingProfileForm.js - UPDATED WITH STANDARDIZED FIELD NAMES
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { db } from '../../../../utils/supabase';
import { 
  defaultFormData, 
  REQUIRED_FIELDS, 
  REQUIRED_ARRAY_FIELDS,
  VALIDATION_RULES 
} from '../constants/matchingFormConstants';

export const useMatchingProfileForm = () => {
  const { user, profile, hasRole } = useAuth();
  
  // ✅ UPDATED: Form data structure using standardized field names internally
  const [formData, setFormData] = useState({
    ...defaultFormData,
    // ✅ STANDARDIZED: Internal form state uses consistent naming
    primary_city: '',
    primary_state: '',
    budget_min: 500,
    budget_max: 2000,
    preferred_roommate_gender: '',
    recovery_methods: [],
    guests_policy: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // ✅ UPDATED: Load existing data with standardized field mapping
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user || !hasRole('applicant')) {
        setInitialLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading existing data for user:', user.id);
        
      const result = await db.matchingProfiles.getByUserId(user.id);
      const applicantForm = result.success ? result.data : null;
      const error = result.success ? null : result.error;
        
        if (error) {
          console.error('❌ Error loading applicant form:', error);
          setErrors({ load: `Error loading data: ${error.message}` });
          setInitialLoading(false);
          return;
        }
        
        if (applicantForm) {
          console.log('🔍 Loaded applicant form data with standardized fields:', applicantForm);
          
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
            
            // ✅ STANDARDIZED: Location & Housing using new field names
            primary_city: applicantForm.primary_city || applicantForm.preferred_city || '',
            primary_state: applicantForm.primary_state || applicantForm.preferred_state || '',
            targetZipCodes: applicantForm.target_zip_codes?.join(', ') || '',
            searchRadius: applicantForm.search_radius?.toString() || '25',
            currentLocation: applicantForm.current_location || '',
            relocationTimeline: applicantForm.relocation_timeline || '',
            maxCommute: applicantForm.max_commute?.toString() || '',
            housingType: applicantForm.housing_type || [],
            priceRangeMin: applicantForm.price_range_min || 500,
            priceRangeMax: applicantForm.price_range_max || 2000,
            
            // ✅ STANDARDIZED: Budget using new field names
            budget_min: applicantForm.budget_min || applicantForm.price_range_min || 500,
            budget_max: applicantForm.budget_max || applicantForm.price_range_max || 2000,
            
            moveInDate: applicantForm.move_in_date || '',
            leaseDuration: applicantForm.lease_duration || '',
            
            // ✅ STANDARDIZED: Gender preferences using new field name
            ageRangeMin: applicantForm.age_range_min || 18,
            ageRangeMax: applicantForm.age_range_max || 65,
            preferred_roommate_gender: applicantForm.preferred_roommate_gender || applicantForm.gender_preference || '',
            smokingPreference: applicantForm.smoking_preference || '',
            smokingStatus: applicantForm.smoking_status || '',
            petPreference: applicantForm.pet_preference || '',
            
            // ✅ STANDARDIZED: Recovery information using standardized field names
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
            recovery_methods: applicantForm.recovery_methods || [],
            
            // ✅ STANDARDIZED: Lifestyle preferences using standardized field names
            workSchedule: applicantForm.work_schedule || '',
            socialLevel: applicantForm.social_level || 3,
            cleanlinessLevel: applicantForm.cleanliness_level || 3,
            noiseLevel: applicantForm.noise_level || 3,
            guests_policy: applicantForm.guests_policy || applicantForm.guest_policy || '',
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
          
          console.log('✅ Form data populated successfully with standardized fields');
        } else {
          console.log('🔍 No existing applicant form found for user');
        }
      } catch (error) {
        console.error('💥 Error loading applicant form data:', error);
        setErrors({ load: `Error loading data: ${error.message}` });
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingData();
  }, [user, profile, hasRole]);

  // ✅ UPDATED: Calculate completion with standardized required fields
  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 0;
    
    // ✅ STANDARDIZED: Core required fields using new naming
    const coreRequiredFields = [
      'dateOfBirth', 'phone', 'gender', 'primary_city', 'primary_state',
      'budget_max', 'recoveryStage', 'preferred_roommate_gender'
    ];
    
    const arrayRequiredFields = [
      'housingType', 'recovery_methods', 'primaryIssues'
    ];
    
    total = coreRequiredFields.length + arrayRequiredFields.length;
    
    coreRequiredFields.forEach(field => {
      if (formData[field] && formData[field].toString().trim() !== '') completed++;
    });
    
    arrayRequiredFields.forEach(field => {
      if (formData[field] && formData[field].length > 0) completed++;
    });
    
    return Math.round((completed / total) * 100);
  };

  // ✅ UPDATED: Validation with standardized field names
  const validateForm = () => {
    console.log('🔍 Starting form validation with standardized fields...');
    const newErrors = {};
    
    // ✅ STANDARDIZED: Core required field validation
    const requiredFields = {
      dateOfBirth: 'Date of birth is required',
      phone: 'Phone number is required',
      gender: 'Gender is required',
      primary_city: 'Preferred city is required',
      primary_state: 'Preferred state is required',
      budget_max: 'Maximum budget is required',
      recoveryStage: 'Recovery stage is required',
      preferred_roommate_gender: 'Roommate gender preference is required'
    };
    
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = message;
      }
    });
    
    // ✅ STANDARDIZED: Array field validation
    const arrayRequiredFields = {
      housingType: 'Please select at least one housing type',
      recovery_methods: 'Please select at least one recovery method',
      primaryIssues: 'Please select at least one primary issue'
    };
    
    Object.entries(arrayRequiredFields).forEach(([field, message]) => {
      if (!formData[field] || formData[field].length === 0) {
        newErrors[field] = message;
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
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be 18 or older to use this service';
      }
    }

    // Phone validation
    if (formData.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    // ✅ STANDARDIZED: Budget validation using new field names
    if (formData.budget_max < 300) {
      newErrors.budget_max = 'Maximum budget must be at least $300';
    }
    if (formData.budget_max > 10000) {
      newErrors.budget_max = 'Budget seems unreasonably high. Please verify.';
    }
    
    if (formData.budget_min && formData.budget_min >= formData.budget_max) {
      newErrors.budget_min = 'Minimum budget must be less than maximum budget';
    }

    // Text length validation
    if (formData.aboutMe && formData.aboutMe.length > 1000) {
      newErrors.aboutMe = 'About me must be 1000 characters or less';
    }
    if (formData.lookingFor && formData.lookingFor.length > 1000) {
      newErrors.lookingFor = 'Looking for must be 1000 characters or less';
    }
    if (formData.additionalInfo && formData.additionalInfo.length > 500) {
      newErrors.additionalInfo = 'Additional info must be 500 characters or less';
    }

    // Date validation
    if (formData.moveInDate) {
      const moveInDate = new Date(formData.moveInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
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
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
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

  // ✅ UPDATED: Form submission with standardized database field mapping
  const submitForm = async () => {
    console.log('🔍 Form submission started with standardized fields');
    
    setErrors(prev => {
      const { submit, ...otherErrors } = prev;
      return otherErrors;
    });
    
    if (!validateForm()) {
      console.log('🔍 Form validation failed');
      return false;
    }
    
    setLoading(true);
    setSuccessMessage('');
    
    try {
      console.log('📊 Preparing standardized form data for submission...');
      
      // Parse target zip codes
      const targetZipCodes = formData.targetZipCodes
        ? formData.targetZipCodes
            .split(',')
            .map(zip => zip.trim())
            .filter(zip => zip && /^\d{5}$/.test(zip))
        : [];

      // ✅ STANDARDIZED: Database submission using correct field names
      const applicantFormData = {
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
        emergency_contact_phone: formData.emergencyContactPhone || null,
        
        // ✅ STANDARDIZED: Use primary_city/primary_state for database
        primary_city: formData.primary_city,
        primary_state: formData.primary_state,
        target_zip_codes: targetZipCodes,
        search_radius: formData.searchRadius ? parseInt(formData.searchRadius) : 25,
        current_location: formData.currentLocation || null,
        relocation_timeline: formData.relocationTimeline || null,
        max_commute: formData.maxCommute ? parseInt(formData.maxCommute) : null,
        housing_type: formData.housingType || [],
        price_range_min: formData.priceRangeMin || formData.budget_min || 500,
        price_range_max: formData.priceRangeMax || formData.budget_max || 2000,
        
        // ✅ STANDARDIZED: Use budget_min/budget_max for database
        budget_min: formData.budget_min || 500,
        budget_max: formData.budget_max || 2000,
        
        move_in_date: formData.moveInDate || null,
        lease_duration: formData.leaseDuration || null,
        
        // ✅ STANDARDIZED: Use preferred_roommate_gender for database
        age_range_min: formData.ageRangeMin || 18,
        age_range_max: formData.ageRangeMax || 65,
        preferred_roommate_gender: formData.preferred_roommate_gender || null,
        smoking_preference: formData.smokingPreference || null,
        smoking_status: formData.smokingStatus || null,
        pet_preference: formData.petPreference || null,
        
        // ✅ STANDARDIZED: Recovery information
        recovery_stage: formData.recoveryStage,
        primary_substance: formData.primarySubstance || null,
        time_in_recovery: formData.timeInRecovery || null,
        treatment_history: formData.treatmentHistory || null,
        program_type: formData.programType || [],
        sobriety_date: formData.sobrietyDate || null,
        sponsor_mentor: formData.sponsorMentor || null,
        support_meetings: formData.supportMeetings || null,
        spiritual_affiliation: formData.spiritualAffiliation || null,
        primary_issues: formData.primaryIssues || [],
        recovery_methods: formData.recovery_methods || [],
        
        // ✅ STANDARDIZED: Lifestyle preferences
        work_schedule: formData.workSchedule || null,
        social_level: formData.socialLevel ? parseInt(formData.socialLevel) : 3,
        cleanliness_level: formData.cleanlinessLevel ? parseInt(formData.cleanlinessLevel) : 3,
        noise_level: formData.noiseLevel ? parseInt(formData.noiseLevel) : 3,
        guests_policy: formData.guests_policy || null,
        bedtime_preference: formData.bedtimePreference || null,
        transportation: formData.transportation || null,
        chore_sharing_preference: formData.choreSharingPreference || null,
        preferred_support_structure: formData.preferredSupportStructure || null,
        conflict_resolution_style: formData.conflictResolutionStyle || null,
        
        // Living situation
        pets_owned: formData.petsOwned || false,
        pets_comfortable: formData.petsComfortable !== false,
        overnight_guests_ok: formData.overnightGuestsOk !== false,
        shared_groceries: formData.sharedGroceries || false,
        cooking_frequency: formData.cookingFrequency || null,
        
        // Housing assistance
        housing_subsidy: formData.housingSubsidy || [],
        has_section8: formData.hasSection8 || false,
        accepts_subsidy: formData.acceptsSubsidy !== false,
        
        // Compatibility factors
        interests: formData.interests || [],
        deal_breakers: formData.dealBreakers || [],
        important_qualities: formData.importantQualities || [],
        
        // Open-ended responses
        about_me: formData.aboutMe || null,
        looking_for: formData.lookingFor || null,
        additional_info: formData.additionalInfo || null,
        special_needs: formData.specialNeeds || null,
        
        // Status
        is_active: formData.isActive !== false,
        profile_completed: true
      };
      
      console.log('🔧 Standardized database submission starting...', { 
        userId: user.id, 
        dataKeys: Object.keys(applicantFormData),
        primaryCity: applicantFormData.primary_city,
        primaryState: applicantFormData.primary_state,
        budgetMax: applicantFormData.budget_max,
        preferredRoommateGender: applicantFormData.preferred_roommate_gender,
        recoveryMethods: applicantFormData.recovery_methods,
        guestsPolicy: applicantFormData.guests_policy
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const result = await db.matchingProfiles.upsert(applicantFormData);

      clearTimeout(timeoutId);

      if (!result.success) {
        console.error('❌ Submission error:', result.error);
        setErrors({ submit: `Database error: ${result.error}` });
        return false;
      }

      console.log('✅ Form submission successful', result.data);
      setSuccessMessage('Comprehensive matching profile saved successfully with standardized fields!');

      return true;
      
    } catch (error) {
      console.error('💥 Standardized submission error:', error);
      
      if (error.name === 'AbortError') {
        setErrors({ submit: 'Request timed out. Please try again.' });
      } else {
        setErrors({ submit: `Error: ${error.message}` });
      }
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
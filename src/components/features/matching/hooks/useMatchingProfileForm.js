// src/components/features/matching/hooks/useMatchingProfileForm.js - FULLY STANDARDIZED VERSION
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
  
  // FIXED: Form data structure using ONLY standardized field names from database schema
  const [formData, setFormData] = useState({
    // Personal Demographics (using exact database field names)
    date_of_birth: '',
    primary_phone: '',
    gender_identity: '',
    biological_sex: '',
    current_address: '',
    current_city: '',
    current_state: '',
    current_zip_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Location & Housing (standardized names)
    primary_city: '',
    primary_state: '',
    target_zip_codes: '',
    search_radius_miles: 30,
    location_flexibility: '',
    max_commute_minutes: 30,
    transportation_method: '',
    
    // Budget & Financial (standardized names)
    budget_min: 500,
    budget_max: 2000,
    housing_assistance: [],
    has_section8: false,
    
    // Housing Specifications
    housing_types_accepted: [],
    preferred_bedrooms: '',
    move_in_date: '',
    move_in_flexibility: '',
    lease_duration: '',
    furnished_preference: false,
    utilities_included_preference: false,
    accessibility_needed: false,
    parking_required: false,
    public_transit_access: false,
    
    // Recovery & Wellness (standardized names)
    recovery_stage: '',
    time_in_recovery: '',
    sobriety_date: '',
    primary_substance: '',
    recovery_methods: [],
    program_types: [],
    treatment_history: '',
    support_meetings: '',
    sponsor_mentor: '',
    primary_issues: [],
    spiritual_affiliation: '',
    want_recovery_support: false,
    comfortable_discussing_recovery: false,
    attend_meetings_together: false,
    substance_free_home_required: true,
    recovery_goal_timeframe: '',
    recovery_context: '',
    
    // Roommate Preferences (standardized names)
    preferred_roommate_gender: '',
    gender_inclusive: false,
    age_range_min: 18,
    age_range_max: 65,
    age_flexibility: '',
    prefer_recovery_experience: false,
    supportive_of_recovery: true,
    substance_free_required: true,
    respect_privacy: true,
    social_interaction_level: '',
    similar_schedules: false,
    shared_chores: false,
    financially_stable: true,
    respectful_guests: true,
    lgbtq_friendly: false,
    culturally_sensitive: true,
    
    // Lifestyle Preferences (standardized names)
    social_level: 3,
    cleanliness_level: 3,
    noise_tolerance: 3,
    work_schedule: '',
    work_from_home_frequency: '',
    bedtime_preference: '',
    early_riser: false,
    night_owl: false,
    guests_policy: '',
    social_activities_at_home: '',
    overnight_guests_ok: false,
    cooking_enthusiast: false,
    cooking_frequency: '',
    exercise_at_home: false,
    plays_instruments: false,
    tv_streaming_regular: false,
    
    // Household Management (standardized names)
    chore_sharing_style: '',
    shared_groceries: false,
    communication_style: '',
    conflict_resolution_style: '',
    preferred_support_structure: '',
    
    // Pets & Smoking (standardized names)
    pets_owned: false,
    pets_comfortable: false,
    pet_preference: '',
    smoking_status: '',
    smoking_preference: '',
    
    // Compatibility & Goals
    interests: [],
    additional_interests: '',
    shared_activities_interest: false,
    important_qualities: [],
    deal_breakers: [],
    short_term_goals: '',
    long_term_vision: '',
    
    // Profile Content
    about_me: '',
    looking_for: '',
    additional_info: '',
    special_needs: '',
    
    // Profile Status
    is_active: true,
    profile_completed: false,
    profile_visibility: 'verified-members',
    
    // Deal Breakers (specific)
    deal_breaker_substance_use: false,
    deal_breaker_loudness: false,
    deal_breaker_uncleanliness: false,
    deal_breaker_financial_issues: true,
    deal_breaker_pets: false,
    deal_breaker_smoking: false,
    
    // Compatibility preferences
    overnight_guests_preference: false,
    shared_transportation: false,
    recovery_accountability: false,
    shared_recovery_activities: false,
    mentorship_interest: false,
    recovery_community: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

useEffect(() => {
  const loadExistingData = async () => {
    if (!user || !hasRole('applicant')) {
      setInitialLoading(false);
      return;
    }

    try {
      console.log('Loading existing data for user:', user.id);
      
      const result = await db.matchingProfiles.getByUserId(user.id);
      
      // ✅ FIXED: Handle different result scenarios properly
      if (result.success && result.data) {
        // Existing user with profile - load their data
        console.log('Loaded applicant form data:', result.data);
        
        const applicantForm = result.data;
        
        // Direct mapping since field names now match exactly
        setFormData(prev => ({
          ...prev,
          // Personal Demographics
          date_of_birth: applicantForm.date_of_birth || '',
          primary_phone: applicantForm.primary_phone || '',
          gender_identity: applicantForm.gender_identity || '',
          biological_sex: applicantForm.biological_sex || '',
          current_address: applicantForm.current_address || '',
          current_city: applicantForm.current_city || '',
          current_state: applicantForm.current_state || '',
          current_zip_code: applicantForm.current_zip_code || '',
          emergency_contact_name: applicantForm.emergency_contact_name || '',
          emergency_contact_phone: applicantForm.emergency_contact_phone || '',
          emergency_contact_relationship: applicantForm.emergency_contact_relationship || '',
          
          // Location & Housing
          primary_city: applicantForm.primary_city || '',
          primary_state: applicantForm.primary_state || '',
          target_zip_codes: applicantForm.target_zip_codes?.join(', ') || '',
          search_radius_miles: applicantForm.search_radius_miles || 30,
          location_flexibility: applicantForm.location_flexibility || '',
          max_commute_minutes: applicantForm.max_commute_minutes || 30,
          transportation_method: applicantForm.transportation_method || '',
          
          // Budget & Financial
          budget_min: applicantForm.budget_min || 500,
          budget_max: applicantForm.budget_max || 2000,
          housing_assistance: applicantForm.housing_assistance || [],
          has_section8: applicantForm.has_section8 || false,
          
          // Housing Specifications
          housing_types_accepted: applicantForm.housing_types_accepted || [],
          preferred_bedrooms: applicantForm.preferred_bedrooms || '',
          move_in_date: applicantForm.move_in_date || '',
          move_in_flexibility: applicantForm.move_in_flexibility || '',
          lease_duration: applicantForm.lease_duration || '',
          furnished_preference: applicantForm.furnished_preference || false,
          utilities_included_preference: applicantForm.utilities_included_preference || false,
          accessibility_needed: applicantForm.accessibility_needed || false,
          parking_required: applicantForm.parking_required || false,
          public_transit_access: applicantForm.public_transit_access || false,
          
          // Recovery & Wellness
          recovery_stage: applicantForm.recovery_stage || '',
          time_in_recovery: applicantForm.time_in_recovery || '',
          sobriety_date: applicantForm.sobriety_date || '',
          primary_substance: applicantForm.primary_substance || '',
          recovery_methods: applicantForm.recovery_methods || [],
          program_types: applicantForm.program_types || [],
          treatment_history: applicantForm.treatment_history || '',
          support_meetings: applicantForm.support_meetings || '',
          sponsor_mentor: applicantForm.sponsor_mentor || '',
          primary_issues: applicantForm.primary_issues || [],
          spiritual_affiliation: applicantForm.spiritual_affiliation || '',
          want_recovery_support: applicantForm.want_recovery_support || false,
          comfortable_discussing_recovery: applicantForm.comfortable_discussing_recovery || false,
          attend_meetings_together: applicantForm.attend_meetings_together || false,
          substance_free_home_required: applicantForm.substance_free_home_required !== false,
          recovery_goal_timeframe: applicantForm.recovery_goal_timeframe || '',
          recovery_context: applicantForm.recovery_context || '',
          
          // Roommate Preferences
          preferred_roommate_gender: applicantForm.preferred_roommate_gender || '',
          gender_inclusive: applicantForm.gender_inclusive || false,
          age_range_min: applicantForm.age_range_min || 18,
          age_range_max: applicantForm.age_range_max || 65,
          age_flexibility: applicantForm.age_flexibility || '',
          prefer_recovery_experience: applicantForm.prefer_recovery_experience || false,
          supportive_of_recovery: applicantForm.supportive_of_recovery !== false,
          substance_free_required: applicantForm.substance_free_required !== false,
          respect_privacy: applicantForm.respect_privacy !== false,
          social_interaction_level: applicantForm.social_interaction_level || '',
          similar_schedules: applicantForm.similar_schedules || false,
          shared_chores: applicantForm.shared_chores || false,
          financially_stable: applicantForm.financially_stable !== false,
          respectful_guests: applicantForm.respectful_guests !== false,
          lgbtq_friendly: applicantForm.lgbtq_friendly || false,
          culturally_sensitive: applicantForm.culturally_sensitive !== false,
          
          // Lifestyle Preferences
          social_level: applicantForm.social_level || 3,
          cleanliness_level: applicantForm.cleanliness_level || 3,
          noise_tolerance: applicantForm.noise_tolerance || 3,
          work_schedule: applicantForm.work_schedule || '',
          work_from_home_frequency: applicantForm.work_from_home_frequency || '',
          bedtime_preference: applicantForm.bedtime_preference || '',
          early_riser: applicantForm.early_riser || false,
          night_owl: applicantForm.night_owl || false,
          guests_policy: applicantForm.guests_policy || '',
          social_activities_at_home: applicantForm.social_activities_at_home || '',
          overnight_guests_ok: applicantForm.overnight_guests_ok || false,
          cooking_enthusiast: applicantForm.cooking_enthusiast || false,
          cooking_frequency: applicantForm.cooking_frequency || '',
          exercise_at_home: applicantForm.exercise_at_home || false,
          plays_instruments: applicantForm.plays_instruments || false,
          tv_streaming_regular: applicantForm.tv_streaming_regular || false,
          
          // Household Management
          chore_sharing_style: applicantForm.chore_sharing_style || '',
          shared_groceries: applicantForm.shared_groceries || false,
          communication_style: applicantForm.communication_style || '',
          conflict_resolution_style: applicantForm.conflict_resolution_style || '',
          preferred_support_structure: applicantForm.preferred_support_structure || '',
          
          // Pets & Smoking
          pets_owned: applicantForm.pets_owned || false,
          pets_comfortable: applicantForm.pets_comfortable !== false,
          pet_preference: applicantForm.pet_preference || '',
          smoking_status: applicantForm.smoking_status || '',
          smoking_preference: applicantForm.smoking_preference || '',
          
          // Compatibility & Goals
          interests: applicantForm.interests || [],
          additional_interests: applicantForm.additional_interests || '',
          shared_activities_interest: applicantForm.shared_activities_interest || false,
          important_qualities: applicantForm.important_qualities || [],
          deal_breakers: applicantForm.deal_breakers || [],
          short_term_goals: applicantForm.short_term_goals || '',
          long_term_vision: applicantForm.long_term_vision || '',
          
          // Profile Content
          about_me: applicantForm.about_me || '',
          looking_for: applicantForm.looking_for || '',
          additional_info: applicantForm.additional_info || '',
          special_needs: applicantForm.special_needs || '',
          
          // Profile Status
          is_active: applicantForm.is_active !== false,
          profile_completed: applicantForm.profile_completed || false,
          profile_visibility: applicantForm.profile_visibility || 'verified-members',
          
          // Deal Breakers
          deal_breaker_substance_use: applicantForm.deal_breaker_substance_use || false,
          deal_breaker_loudness: applicantForm.deal_breaker_loudness || false,
          deal_breaker_uncleanliness: applicantForm.deal_breaker_uncleanliness || false,
          deal_breaker_financial_issues: applicantForm.deal_breaker_financial_issues !== false,
          deal_breaker_pets: applicantForm.deal_breaker_pets || false,
          deal_breaker_smoking: applicantForm.deal_breaker_smoking || false,
          
          // Compatibility preferences
          overnight_guests_preference: applicantForm.overnight_guests_preference || false,
          shared_transportation: applicantForm.shared_transportation || false,
          recovery_accountability: applicantForm.recovery_accountability || false,
          shared_recovery_activities: applicantForm.shared_recovery_activities || false,
          mentorship_interest: applicantForm.mentorship_interest || false,
          recovery_community: applicantForm.recovery_community || false
        }));
        
        console.log('Form data populated successfully with standardized fields');
        
      } else if (!result.success && result.error?.includes('No matching profile found')) {
        // ✅ FIXED: New user scenario - this is expected, not an error
        console.log('No existing applicant form found for user - initializing new form');
        // Form data already initialized with defaults, just proceed
        
      } else {
        // ✅ FIXED: Actual error scenario - database issues, connection problems, etc.
        console.error('Actual error loading applicant form:', result.error);
        setErrors({ load: `Error loading data: ${result.error || 'Unknown error'}` });
        setInitialLoading(false);
        return;
      }
      
    } catch (error) {
      console.error('Exception loading applicant form data:', error);
      setErrors({ load: `Error loading data: ${error.message}` });
    } finally {
      setInitialLoading(false);
    }
  };

  loadExistingData();
}, [user, profile, hasRole]);

  // FIXED: Calculate completion with standardized required fields
  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 0;
    
    // Core required fields using standardized names
    const coreRequiredFields = [
      'date_of_birth', 'primary_phone', 'gender_identity', 'primary_city', 'primary_state',
      'budget_max', 'recovery_stage', 'preferred_roommate_gender'
    ];
    
    const arrayRequiredFields = [
      'housing_types_accepted', 'recovery_methods', 'primary_issues'
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

  // FIXED: Validation with standardized field names
  const validateForm = () => {
    console.log('Starting form validation with standardized fields...');
    const newErrors = {};
    
    // Core required field validation
    const requiredFields = {
      date_of_birth: 'Date of birth is required',
      primary_phone: 'Phone number is required',
      gender_identity: 'Gender is required',
      primary_city: 'Preferred city is required',
      primary_state: 'Preferred state is required',
      budget_max: 'Maximum budget is required',
      recovery_stage: 'Recovery stage is required',
      preferred_roommate_gender: 'Roommate gender preference is required'
    };
    
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = message;
      }
    });
    
    // Array field validation
    const arrayRequiredFields = {
      housing_types_accepted: 'Please select at least one housing type',
      recovery_methods: 'Please select at least one recovery method',
      primary_issues: 'Please select at least one primary issue'
    };
    
    Object.entries(arrayRequiredFields).forEach(([field, message]) => {
      if (!formData[field] || formData[field].length === 0) {
        newErrors[field] = message;
      }
    });

    // Age validation
    if (formData.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(formData.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.date_of_birth = 'You must be 18 or older to use this service';
      }
    }

    // Phone validation
    if (formData.primary_phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.primary_phone.replace(/\D/g, ''))) {
      newErrors.primary_phone = 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.current_zip_code && !/^\d{5}(-\d{4})?$/.test(formData.current_zip_code)) {
      newErrors.current_zip_code = 'Please enter a valid ZIP code';
    }

    // Budget validation
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
    if (formData.about_me && formData.about_me.length > 1000) {
      newErrors.about_me = 'About me must be 1000 characters or less';
    }
    if (formData.looking_for && formData.looking_for.length > 1000) {
      newErrors.looking_for = 'Looking for must be 1000 characters or less';
    }
    if (formData.additional_info && formData.additional_info.length > 500) {
      newErrors.additional_info = 'Additional info must be 500 characters or less';
    }

    // Date validation
    if (formData.move_in_date) {
      const moveInDate = new Date(formData.move_in_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (moveInDate < today) {
        newErrors.move_in_date = 'Move-in date cannot be in the past';
      }
    }

    console.log('Validation errors found:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    console.log('handleInputChange called:', { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (field, value, checked) => {
    console.log('handleArrayChange called:', { field, value, checked });
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
    console.log('handleRangeChange called:', { field, value });
    handleInputChange(field, parseInt(value));
  };

  // FIXED: Form submission using standardized database field mapping (no conversion needed)
  const submitForm = async () => {
    console.log('Form submission started with standardized fields');
    
    setErrors(prev => {
      const { submit, ...otherErrors } = prev;
      return otherErrors;
    });
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return false;
    }
    
    setLoading(true);
    setSuccessMessage('');
    
    try {
      console.log('Preparing standardized form data for submission...');
      
      // Parse target zip codes
      const targetZipCodes = formData.target_zip_codes
        ? formData.target_zip_codes
            .split(',')
            .map(zip => zip.trim())
            .filter(zip => zip && /^\d{5}$/.test(zip))
        : [];

      // FIXED: Direct submission using standardized field names (no mapping needed)
      const applicantFormData = {
        user_id: user.id,
        
        // Personal Demographics
        date_of_birth: formData.date_of_birth,
        primary_phone: formData.primary_phone,
        gender_identity: formData.gender_identity || null,
        biological_sex: formData.biological_sex || null,
        current_address: formData.current_address || null,
        current_city: formData.current_city || null,
        current_state: formData.current_state || null,
        current_zip_code: formData.current_zip_code || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
        
        // Location & Housing
        primary_city: formData.primary_city,
        primary_state: formData.primary_state,
        target_zip_codes: targetZipCodes,
        search_radius_miles: formData.search_radius_miles || 30,
        location_flexibility: formData.location_flexibility || null,
        max_commute_minutes: formData.max_commute_minutes || null,
        transportation_method: formData.transportation_method || null,
        
        // Budget & Financial
        budget_min: formData.budget_min || 500,
        budget_max: formData.budget_max || 2000,
        housing_assistance: formData.housing_assistance || [],
        has_section8: formData.has_section8 || false,
        
        // Housing Specifications
        housing_types_accepted: formData.housing_types_accepted || [],
        preferred_bedrooms: formData.preferred_bedrooms || null,
        move_in_date: formData.move_in_date || null,
        move_in_flexibility: formData.move_in_flexibility || null,
        lease_duration: formData.lease_duration || null,
        furnished_preference: formData.furnished_preference || false,
        utilities_included_preference: formData.utilities_included_preference || false,
        accessibility_needed: formData.accessibility_needed || false,
        parking_required: formData.parking_required || false,
        public_transit_access: formData.public_transit_access || false,
        
        // Recovery & Wellness
        recovery_stage: formData.recovery_stage,
        time_in_recovery: formData.time_in_recovery || null,
        sobriety_date: formData.sobriety_date || null,
        primary_substance: formData.primary_substance || null,
        recovery_methods: formData.recovery_methods || [],
        program_types: formData.program_types || [],
        treatment_history: formData.treatment_history || null,
        support_meetings: formData.support_meetings || null,
        sponsor_mentor: formData.sponsor_mentor || null,
        primary_issues: formData.primary_issues || [],
        spiritual_affiliation: formData.spiritual_affiliation || null,
        want_recovery_support: formData.want_recovery_support || false,
        comfortable_discussing_recovery: formData.comfortable_discussing_recovery || false,
        attend_meetings_together: formData.attend_meetings_together || false,
        substance_free_home_required: formData.substance_free_home_required !== false,
        recovery_goal_timeframe: formData.recovery_goal_timeframe || null,
        recovery_context: formData.recovery_context || null,
        
        // Roommate Preferences
        preferred_roommate_gender: formData.preferred_roommate_gender || null,
        gender_inclusive: formData.gender_inclusive || false,
        age_range_min: formData.age_range_min || 18,
        age_range_max: formData.age_range_max || 65,
        age_flexibility: formData.age_flexibility || null,
        prefer_recovery_experience: formData.prefer_recovery_experience || false,
        supportive_of_recovery: formData.supportive_of_recovery !== false,
        substance_free_required: formData.substance_free_required !== false,
        respect_privacy: formData.respect_privacy !== false,
        social_interaction_level: formData.social_interaction_level || null,
        similar_schedules: formData.similar_schedules || false,
        shared_chores: formData.shared_chores || false,
        financially_stable: formData.financially_stable !== false,
        respectful_guests: formData.respectful_guests !== false,
        lgbtq_friendly: formData.lgbtq_friendly || false,
        culturally_sensitive: formData.culturally_sensitive !== false,
        
        // Lifestyle Preferences
        social_level: formData.social_level || 3,
        cleanliness_level: formData.cleanliness_level || 3,
        noise_tolerance: formData.noise_tolerance || 3,
        work_schedule: formData.work_schedule || null,
        work_from_home_frequency: formData.work_from_home_frequency || null,
        bedtime_preference: formData.bedtime_preference || null,
        early_riser: formData.early_riser || false,
        night_owl: formData.night_owl || false,
        guests_policy: formData.guests_policy || null,
        social_activities_at_home: formData.social_activities_at_home || null,
        overnight_guests_ok: formData.overnight_guests_ok || false,
        cooking_enthusiast: formData.cooking_enthusiast || false,
        cooking_frequency: formData.cooking_frequency || null,
        exercise_at_home: formData.exercise_at_home || false,
        plays_instruments: formData.plays_instruments || false,
        tv_streaming_regular: formData.tv_streaming_regular || false,
        
        // Household Management
        chore_sharing_style: formData.chore_sharing_style || null,
        shared_groceries: formData.shared_groceries || false,
        communication_style: formData.communication_style || null,
        conflict_resolution_style: formData.conflict_resolution_style || null,
        preferred_support_structure: formData.preferred_support_structure || null,
        
        // Pets & Smoking
        pets_owned: formData.pets_owned || false,
        pets_comfortable: formData.pets_comfortable !== false,
        pet_preference: formData.pet_preference || null,
        smoking_status: formData.smoking_status || null,
        smoking_preference: formData.smoking_preference || null,
        
        // Compatibility & Goals
        interests: formData.interests || [],
        additional_interests: formData.additional_interests || null,
        shared_activities_interest: formData.shared_activities_interest || false,
        important_qualities: formData.important_qualities || [],
        deal_breakers: formData.deal_breakers || [],
        short_term_goals: formData.short_term_goals || null,
        long_term_vision: formData.long_term_vision || null,
        
        // Profile Content
        about_me: formData.about_me || null,
        looking_for: formData.looking_for || null,
        additional_info: formData.additional_info || null,
        special_needs: formData.special_needs || null,
        
        // Profile Status
        is_active: formData.is_active !== false,
        profile_completed: true,
        profile_visibility: formData.profile_visibility || 'verified-members',
        
        // Deal Breakers
        deal_breaker_substance_use: formData.deal_breaker_substance_use || false,
        deal_breaker_loudness: formData.deal_breaker_loudness || false,
        deal_breaker_uncleanliness: formData.deal_breaker_uncleanliness || false,
        deal_breaker_financial_issues: formData.deal_breaker_financial_issues !== false,
        deal_breaker_pets: formData.deal_breaker_pets || false,
        deal_breaker_smoking: formData.deal_breaker_smoking || false,
        
        // Compatibility preferences
        overnight_guests_preference: formData.overnight_guests_preference || false,
        shared_transportation: formData.shared_transportation || false,
        recovery_accountability: formData.recovery_accountability || false,
        shared_recovery_activities: formData.shared_recovery_activities || false,
        mentorship_interest: formData.mentorship_interest || false,
        recovery_community: formData.recovery_community || false
      };
      
      console.log('Standardized database submission starting...', { 
        userId: user.id, 
        dataKeys: Object.keys(applicantFormData).length,
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
        console.error('Submission error:', result.error);
        setErrors({ submit: `Database error: ${result.error}` });
        return false;
      }

      console.log('Form submission successful', result.data);
      setSuccessMessage('Comprehensive matching profile saved successfully with standardized fields!');

      return true;
      
    } catch (error) {
      console.error('Standardized submission error:', error);
      
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
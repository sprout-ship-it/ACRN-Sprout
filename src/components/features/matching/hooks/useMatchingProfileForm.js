// src/components/features/matching/hooks/useMatchingProfileForm.js - SCHEMA ALIGNED
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
  
  // ✅ SCHEMA ALIGNED: Form data structure using exact database field names
  const [formData, setFormData] = useState({
    // Personal Demographics (exact schema field names)
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
    
    // Location & Housing (EXCLUDING primary_location - generated column)
    primary_city: '',
    primary_state: '',
    // ✅ primary_location excluded - generated as (primary_city || ', ' || primary_state)
    target_zip_codes: '', // Will be converted to array for submission
    search_radius_miles: 30,
    location_flexibility: '',
    max_commute_minutes: 30,
    transportation_method: '',
    
    // Budget & Financial
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
    relocation_timeline: '', // ✅ Added from schema
    furnished_preference: false,
    utilities_included_preference: false,
    accessibility_needed: false,
    parking_required: false,
    public_transit_access: false,
    
    // Recovery & Wellness
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
    
    // Roommate Preferences
    preferred_roommate_gender: '',
    gender_inclusive: false,
    age_range_min: 18,
    age_range_max: 65,
    age_flexibility: '',
    prefer_recovery_experience: false,
    supportive_of_recovery: true,
    respect_privacy: true,
    similar_schedules: false,
    shared_chores: false,
    financially_stable: true,
    respectful_guests: true,
    lgbtq_friendly: false,
    culturally_sensitive: true,
    
    // Lifestyle Preferences (exact schema names)
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
    
    // Household Management (✅ FIXED: chore_sharing_preference per schema)
    chore_sharing_preference: '', // ✅ CORRECTED from chore_sharing_style
    shared_groceries: false,
    communication_style: '',
    conflict_resolution_style: '',
    preferred_support_structure: '',
    
    // Pets & Smoking
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
    recovery_community: false,
    
    // ✅ NEW: Schema fields for algorithm metadata (read-only, auto-calculated)
    // These are set by database triggers, not user input
    completion_percentage: 0, // Auto-calculated by trigger
    profile_quality_score: 0, // Auto-calculated by trigger
    last_updated_section: null, // Set programmatically
    compatibility_scores: {}, // JSONB for algorithm results
    search_preferences: {}, // JSONB for user preferences
    matching_weights: {} // JSONB for algorithm weights
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
        
        if (result.success && result.data) {
          console.log('Loaded applicant form data:', result.data);
          
          const applicantForm = result.data;
          
          // ✅ SCHEMA ALIGNED: Direct mapping with exact field names
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
            
            // Location & Housing (EXCLUDING primary_location - generated)
            primary_city: applicantForm.primary_city || '',
            primary_state: applicantForm.primary_state || '',
            target_zip_codes: Array.isArray(applicantForm.target_zip_codes) 
              ? applicantForm.target_zip_codes.join(', ') 
              : applicantForm.target_zip_codes || '',
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
            relocation_timeline: applicantForm.relocation_timeline || '', // ✅ Added
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
            
            // Household Management (✅ FIXED field name)
            chore_sharing_preference: applicantForm.chore_sharing_preference || '', // ✅ CORRECTED
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
            recovery_community: applicantForm.recovery_community || false,
            
            // ✅ NEW: Algorithm metadata (read-only from database)
            completion_percentage: applicantForm.completion_percentage || 0,
            profile_quality_score: applicantForm.profile_quality_score || 0,
            last_updated_section: applicantForm.last_updated_section || null,
            compatibility_scores: applicantForm.compatibility_scores || {},
            search_preferences: applicantForm.search_preferences || {},
            matching_weights: applicantForm.matching_weights || {}
          }));
          
          console.log('Form data populated successfully with schema-aligned fields');
          
        } else if (!result.success && result.error?.includes('No matching profile found')) {
          console.log('No existing applicant form found for user - initializing new form');
          
        } else {
          console.error('Error loading applicant form:', result.error);
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

  // ✅ SCHEMA ALIGNED: Completion calculation with correct required fields
  const getCompletionPercentage = () => {
    // Use database-calculated completion if available, otherwise calculate manually
    if (formData.completion_percentage > 0) {
      return formData.completion_percentage;
    }
    
    let completed = 0;
    let total = 0;
    
    // Core required fields (matching schema requirements)
    const coreRequiredFields = [
      'date_of_birth', 'primary_phone', 'preferred_roommate_gender', 
      'primary_city', 'primary_state', 'budget_min', 'budget_max', 
      'recovery_stage', 'social_level', 'cleanliness_level', 'noise_tolerance',
      'work_schedule', 'move_in_date', 'about_me', 'looking_for'
    ];
    
    const arrayRequiredFields = [
      'recovery_methods', 'program_types', 'primary_issues'
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

  // ✅ SCHEMA ALIGNED: Validation with exact field names
  const validateForm = () => {
    console.log('Validating form with schema-aligned fields...');
    const newErrors = {};
    
    // Core required field validation (per schema constraints)
    const requiredFields = {
      date_of_birth: 'Date of birth is required',
      primary_phone: 'Phone number is required',
      preferred_roommate_gender: 'Roommate gender preference is required',
      primary_city: 'Preferred city is required',
      primary_state: 'Preferred state is required',
      budget_max: 'Maximum budget is required',
      recovery_stage: 'Recovery stage is required',
      social_level: 'Social level is required',
      cleanliness_level: 'Cleanliness level is required', 
      noise_tolerance: 'Noise tolerance level is required',
      work_schedule: 'Work schedule is required',
      move_in_date: 'Move-in date is required',
      about_me: 'About me section is required',
      looking_for: 'Looking for section is required'
    };
    
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = message;
      }
    });
    
    // Array field validation (per schema NOT NULL constraints)
    const arrayRequiredFields = {
      recovery_methods: 'Please select at least one recovery method',
      program_types: 'Please select at least one program type',
      primary_issues: 'Please select at least one primary issue'
    };
    
    Object.entries(arrayRequiredFields).forEach(([field, message]) => {
      if (!formData[field] || formData[field].length === 0) {
        newErrors[field] = message;
      }
    });

    // ✅ SCHEMA CONSTRAINT: Age validation (must be 18+)
    if (formData.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(formData.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.date_of_birth = 'You must be 18 or older (schema constraint: age_range_min >= 18)';
      }
    }

    // ✅ SCHEMA CONSTRAINT: Budget validation 
// ✅ FIXED: Budget validation with proper number conversion
const validateBudgets = () => {
  const budgetMinValue = formData.budget_min;
  const budgetMaxValue = formData.budget_max;
  
  // Convert to numbers for proper comparison
  const minBudget = parseInt(budgetMinValue) || 0;
  const maxBudget = parseInt(budgetMaxValue) || 0;
  
  console.log('🔍 Budget validation:', { 
    budgetMinValue, 
    budgetMaxValue, 
    minBudget, 
    maxBudget,
    comparison: minBudget >= maxBudget
  });
  
  // Validate budget_max is positive
  if (maxBudget < 1) {
    newErrors.budget_max = 'Budget must be positive (schema constraint: valid_rent CHECK)';
  }
  
  // Validate budget_min vs budget_max with proper number comparison
  if (budgetMinValue && budgetMaxValue) {
    if (minBudget >= maxBudget) {
      newErrors.budget_min = 'Minimum budget must be less than maximum (schema constraint: valid_budget_range)';
    }
    // Add a reasonable minimum difference
    else if (maxBudget - minBudget < 50) {
      newErrors.budget_max = 'Budget range should be at least $50 for flexibility';
    }
  }
  
  // Validate reasonable budget ranges
  if (minBudget > 0 && minBudget < 200) {
    newErrors.budget_min = 'Minimum budget should be at least $200 for realistic housing';
  }
  if (maxBudget > 5000) {
    newErrors.budget_max = 'Maximum budget cannot exceed $5,000 (schema constraint)';
  }
};

// Call the budget validation function
validateBudgets();

    // ✅ SCHEMA CONSTRAINT: Level validations (1-5 scale)
    const levelFields = ['social_level', 'cleanliness_level', 'noise_tolerance'];
    levelFields.forEach(field => {
      const value = formData[field];
      if (value < 1 || value > 5) {
        newErrors[field] = `${field.replace('_', ' ')} must be between 1 and 5 (schema constraint)`;
      }
    });

    // ✅ SCHEMA CONSTRAINT: Age range validation
    if (formData.age_range_min < 18) {
      newErrors.age_range_min = 'Minimum age must be 18+ (schema constraint)';
    }
    if (formData.age_range_max > 100) {
      newErrors.age_range_max = 'Maximum age cannot exceed 100 (schema constraint)';
    }
    if (formData.age_range_min >= formData.age_range_max) {
      newErrors.age_range_max = 'Maximum age must be greater than minimum (schema constraint: valid_age_range)';
    }

    // ✅ SCHEMA CONSTRAINT: Move-in date validation
    if (formData.move_in_date) {
      const moveInDate = new Date(formData.move_in_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (moveInDate < today) {
        newErrors.move_in_date = 'Move-in date cannot be in the past (schema constraint: valid_move_in_date)';
      }
    }

    // Text length validation
    if (formData.about_me && formData.about_me.length > 1000) {
      newErrors.about_me = 'About me must be 1000 characters or less';
    }
    if (formData.looking_for && formData.looking_for.length > 1000) {
      newErrors.looking_for = 'Looking for must be 1000 characters or less';
    }

    console.log('Schema-aligned validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    console.log('handleInputChange:', { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (field, value, checked) => {
    console.log('handleArrayChange:', { field, value, checked });
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
    console.log('handleRangeChange:', { field, value });
    handleInputChange(field, parseInt(value));
  };

  // ✅ SCHEMA ALIGNED: Form submission with exact field mapping
  const submitForm = async () => {
    console.log('Schema-aligned form submission started');
    
    setErrors(prev => {
      const { submit, ...otherErrors } = prev;
      return otherErrors;
    });
    
    if (!validateForm()) {
      console.log('Schema validation failed');
      return false;
    }
    
    setLoading(true);
    setSuccessMessage('');
    
    try {
      // ✅ Parse target zip codes to array format for schema
      const targetZipCodes = formData.target_zip_codes
        ? formData.target_zip_codes
            .split(',')
            .map(zip => zip.trim())
            .filter(zip => zip && /^\d{5}$/.test(zip))
        : null;

      // ✅ SCHEMA PERFECT: Submission data with exact field names
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
        
        // Location & Housing (EXCLUDING primary_location - generated)
        primary_city: formData.primary_city,
        primary_state: formData.primary_state,
        target_zip_codes: targetZipCodes,
        search_radius_miles: formData.search_radius_miles || 30,
        location_flexibility: formData.location_flexibility || null,
        max_commute_minutes: formData.max_commute_minutes || null,
        transportation_method: formData.transportation_method || null,
        
        // Budget & Financial
        budget_min: formData.budget_min || null,
        budget_max: formData.budget_max,
        housing_assistance: formData.housing_assistance || [],
        has_section8: formData.has_section8 || false,
        
        // Housing Specifications
        housing_types_accepted: formData.housing_types_accepted || [],
        preferred_bedrooms: formData.preferred_bedrooms || null,
        move_in_date: formData.move_in_date || null,
        move_in_flexibility: formData.move_in_flexibility || null,
        lease_duration: formData.lease_duration || null,
        relocation_timeline: formData.relocation_timeline || null, // ✅ Added
        furnished_preference: formData.furnished_preference || null,
        utilities_included_preference: formData.utilities_included_preference || null,
        accessibility_needed: formData.accessibility_needed || false,
        parking_required: formData.parking_required || false,
        public_transit_access: formData.public_transit_access || false,
        
        // Recovery & Wellness
        recovery_stage: formData.recovery_stage,
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
        preferred_roommate_gender: formData.preferred_roommate_gender,
        gender_inclusive: formData.gender_inclusive || false,
        age_range_min: formData.age_range_min || 18,
        age_range_max: formData.age_range_max || 65,
        age_flexibility: formData.age_flexibility || null,
        prefer_recovery_experience: formData.prefer_recovery_experience || false,
        supportive_of_recovery: formData.supportive_of_recovery !== false,
        respect_privacy: formData.respect_privacy !== false,
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
        work_schedule: formData.work_schedule,
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
        
        // Household Management (✅ CORRECTED field name)
        chore_sharing_preference: formData.chore_sharing_preference || null, // ✅ FIXED
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
        about_me: formData.about_me,
        looking_for: formData.looking_for,
        additional_info: formData.additional_info || null,
        special_needs: formData.special_needs || null,
        
        // Profile Status
        is_active: formData.is_active !== false,
        profile_completed: true, // Set to true on successful submission
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
        recovery_community: formData.recovery_community || false,
        
        // ✅ Algorithm metadata (let database handle these)
        last_updated_section: 'all', // Indicate full form completion
        search_preferences: formData.search_preferences || {},
        matching_weights: formData.matching_weights || {}
        // completion_percentage and profile_quality_score will be auto-calculated by trigger
      };
      
      // ✅ CRITICAL: Ensure primary_location is never included
      if ('primary_location' in applicantFormData) {
        console.error('CRITICAL: primary_location found in submission data - removing');
        delete applicantFormData.primary_location;
      }
      
      console.log('Schema-aligned submission data:', { 
        userId: user.id, 
        fieldCount: Object.keys(applicantFormData).length,
        primaryCity: applicantFormData.primary_city,
        primaryState: applicantFormData.primary_state,
        recoveryStage: applicantFormData.recovery_stage,
        containsPrimaryLocation: 'primary_location' in applicantFormData // Should be false
      });
      
      const result = await db.matchingProfiles.upsert(applicantFormData);

      if (!result.success) {
        console.error('Submission error:', result.error);
        setErrors({ submit: `Database error: ${result.error}` });
        return false;
      }

      console.log('Schema-aligned form submission successful:', result.data);
      setSuccessMessage('Profile saved successfully with schema-aligned data structure!');

      return true;
      
    } catch (error) {
      console.error('Schema-aligned submission error:', error);
      
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
// src/components/features/peer-support/hooks/usePeerSupportProfileForm.js - FIXED IMPORTS
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

// ✅ FIXED: Import the db object instead of individual functions
import { db } from '../../../../utils/supabase';

const INITIAL_FORM_DATA = {
  // Contact Information
  primary_phone: '',
  contact_email: '',
  
  // Professional Information
  professional_title: 'Peer Support Specialist',
  is_licensed: false,
  years_experience: '',
  
  // Service Areas
  service_city: '',
  service_state: '',
  service_areas: [],
  
  // Specialties & Methods
  specialties: [],
  supported_recovery_methods: [],
  
  // Recovery Background
  recovery_stage: '',
  time_in_recovery: '',
  primary_issues: [],
  spiritual_affiliation: '',
  
  // Service Settings
  accepting_clients: true,
  
  // About
  bio: '',
  about_me: '',
  additional_info: '',
  
  // Status
  is_active: true,
  profile_completed: false,
  is_accepting_clients: true,
  is_verified: false
};

export const usePeerSupportProfileForm = ({ editMode = false, onComplete } = {}) => {
  const { user, profile } = useAuth();
  
  // State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasLoadedData, setHasLoadedData] = useState(false); // ✅ FIXED: Prevent multiple loads

  // ✅ FIXED: Load existing data with proper service usage
  useEffect(() => {
    let isMounted = true;
    
    const loadExistingData = async () => {
      // ✅ FIXED: Prevent multiple loads and ensure we have the right data
      if (!profile?.id || hasLoadedData) {
        if (isMounted) {
          setInitialLoading(false);
        }
        return;
      }

      try {
        console.log('🤝 Loading peer support profile for registrant ID:', profile.id);
        
        // ✅ FIXED: Use the db object from supabase.js
        const result = await db.peerSupportProfiles.getByUserId(profile.id);
        
        if (!isMounted) return;

        if (result.success && result.data) {
          console.log('✅ Loaded existing peer support profile:', result.data);
          const peerProfile = result.data;
          
          setFormData(prev => ({
            ...prev,
            // Map database fields to form fields
            primary_phone: peerProfile.primary_phone || '',
            contact_email: peerProfile.contact_email || '',
            professional_title: peerProfile.professional_title || 'Peer Support Specialist',
            is_licensed: peerProfile.is_licensed || false,
            years_experience: peerProfile.years_experience || '',
            service_city: peerProfile.service_city || '',
            service_state: peerProfile.service_state || '',
            service_areas: peerProfile.service_areas || [],
            specialties: peerProfile.specialties || [],
            supported_recovery_methods: peerProfile.supported_recovery_methods || [],
            recovery_stage: peerProfile.recovery_stage || '',
            time_in_recovery: peerProfile.time_in_recovery || '',
            primary_issues: peerProfile.primary_issues || [],
            spiritual_affiliation: peerProfile.spiritual_affiliation || '',
            accepting_clients: peerProfile.accepting_clients !== false,
            bio: peerProfile.bio || '',
            about_me: peerProfile.about_me || '',
            additional_info: peerProfile.additional_info || '',
            is_active: peerProfile.is_active !== false,
            profile_completed: peerProfile.profile_completed || false,
            is_accepting_clients: peerProfile.accepting_clients !== false,
            is_verified: peerProfile.is_verified || false
          }));
        } else if (result.error) {
          // ✅ FIXED: Handle "not found" gracefully vs real errors
          if (result.error.code === 'NOT_FOUND' || result.error.message?.includes('No peer support profile found')) {
            console.log('ℹ️ No existing peer support profile found - starting fresh');
            // This is normal for new users, don't set an error
          } else {
            console.warn('⚠️ Error loading peer support profile:', result.error);
            setErrors({ load: 'Unable to load your existing profile data.' });
          }
        } else {
          console.log('ℹ️ No existing peer support profile found - starting fresh');
        }
        
      } catch (error) {
        console.error('❌ Error loading peer support profile:', error);
        if (isMounted) {
          // ✅ FIXED: Only show error for real problems, not 404s
          if (!error.message?.includes('not found') && !error.message?.includes('No peer support profile')) {
            setErrors({ load: 'Failed to load your profile. Please refresh the page.' });
          }
        }
      } finally {
        if (isMounted) {
          setHasLoadedData(true);
          setInitialLoading(false);
        }
      }
    };

    loadExistingData();

    return () => {
      isMounted = false;
    };
  }, [profile?.id, hasLoadedData]); // ✅ FIXED: Include hasLoadedData in dependencies

  // Calculate completion percentage
  const completionPercentage = useCallback(() => {
    const requiredFields = [
      'primary_phone', 'bio', 'specialties'
    ];
    
    const optionalButImportantFields = [
      'professional_title', 'years_experience', 'service_city', 'service_state',
      'supported_recovery_methods', 'about_me'
    ];

    let score = 0;
    const totalPossible = requiredFields.length * 20 + optionalButImportantFields.length * 4;

    // Required fields (20 points each)
    requiredFields.forEach(field => {
      if (field === 'specialties') {
        if (formData[field]?.length > 0) score += 20;
      } else if (formData[field]?.toString().trim()) {
        score += 20;
      }
    });

    // Optional but important fields (4 points each)
    optionalButImportantFields.forEach(field => {
      if (field === 'supported_recovery_methods') {
        if (formData[field]?.length > 0) score += 4;
      } else if (formData[field]?.toString().trim()) {
        score += 4;
      }
    });

    return Math.min(100, Math.round((score / totalPossible) * 100));
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Sync related fields for compatibility
      ...(field === 'accepting_clients' && { is_accepting_clients: value })
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle array field changes
  const handleArrayChange = useCallback((field, value, checked) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      
      return {
        ...prev,
        [field]: newArray
      };
    });

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Validation
  const validateForm = useCallback((isSubmission = false) => {
    const newErrors = {};
    
    // Required fields
    if (!formData.primary_phone?.trim()) {
      newErrors.primary_phone = 'Phone number is required';
    } else {
      // Phone validation
      const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
      if (!phoneRegex.test(formData.primary_phone.replace(/\D/g, ''))) {
        newErrors.primary_phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.bio?.trim()) {
      newErrors.bio = 'Bio is required';
    }

    if (!formData.specialties?.length) {
      newErrors.specialties = 'Please select at least one specialty';
    }

    // Additional validation for final submission
    if (isSubmission) {
      if (!formData.professional_title?.trim()) {
        newErrors.professional_title = 'Professional title is recommended for profile completion';
      }

      if (!formData.service_city?.trim()) {
        newErrors.service_city = 'Service city is helpful for client matching';
      }

      if (!formData.service_state?.trim()) {
        newErrors.service_state = 'Service state is helpful for client matching';
      }

      if (formData.years_experience && formData.years_experience < 0) {
        newErrors.years_experience = 'Years of experience cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ✅ FIXED: Form submission with proper service usage
  const submitForm = useCallback(async (isSubmission = true) => {
    if (!profile?.id) {
      setErrors({ submit: 'You must be logged in to save your profile' });
      return false;
    }

    // Validate form
    if (!validateForm(isSubmission)) {
      return false;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      // Prepare data for database
      const peerProfileData = {
        user_id: profile.id,
        
        // Contact Information
        primary_phone: formData.primary_phone.trim(),
        contact_email: formData.contact_email?.trim() || null,
        
        // Professional Information
        professional_title: formData.professional_title?.trim() || 'Peer Support Specialist',
        is_licensed: formData.is_licensed || false,
        years_experience: formData.years_experience || null,
        
        // Service Areas
        service_city: formData.service_city?.trim() || null,
        service_state: formData.service_state || null,
        service_areas: formData.service_areas || [],
        
        // Specialties & Methods
        specialties: formData.specialties || [],
        supported_recovery_methods: formData.supported_recovery_methods || [],
        
        // Recovery Background
        recovery_stage: formData.recovery_stage?.trim() || null,
        time_in_recovery: formData.time_in_recovery?.trim() || null,
        primary_issues: formData.primary_issues || [],
        spiritual_affiliation: formData.spiritual_affiliation?.trim() || null,
        
        // Service Settings
        accepting_clients: formData.accepting_clients !== false,
        
        // About
        bio: formData.bio.trim(),
        about_me: formData.about_me?.trim() || null,
        additional_info: formData.additional_info?.trim() || null,
        
        // Status
        is_active: formData.is_active !== false,
        profile_completed: isSubmission && completionPercentage() >= 80,
        is_verified: formData.is_verified || false
      };

      console.log('💾 Submitting peer support profile data:', peerProfileData);

      // ✅ FIXED: Use the db object services
      let result;
      if (editMode) {
        result = await db.peerSupportProfiles.update(profile.id, peerProfileData);
      } else {
        result = await db.peerSupportProfiles.create(peerProfileData);
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to save profile');
      }

      const successMsg = isSubmission 
        ? 'Peer support profile completed successfully!'
        : 'Progress saved successfully!';
      
      setSuccessMessage(successMsg);
      
      // Call onComplete callback if provided and this is a final submission
      if (isSubmission && onComplete && typeof onComplete === 'function') {
        setTimeout(() => onComplete(), 1500);
      }
      
      return true;

    } catch (error) {
      console.error('❌ Error saving peer support profile:', error);
      setErrors({ 
        submit: error.message || 'Failed to save peer support profile. Please try again.' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, formData, validateForm, completionPercentage, editMode, onComplete]);

  // Clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage('');
  }, []);

  return {
    // State
    formData,
    errors,
    loading,
    initialLoading,
    successMessage,
    
    // Computed values
    completionPercentage: completionPercentage(),
    canSubmit: completionPercentage() >= 80,
    
    // Handlers
    handleInputChange,
    handleArrayChange,
    submitForm,
    validateForm,
    
    // Utils
    setSuccessMessage,
    clearSuccessMessage
  };
};
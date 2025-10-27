// src/components/features/peer-support/hooks/usePeerSupportProfileForm.js - MINIMAL UPDATES FOR SCHEMA ALIGNMENT
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

// ✅ FIXED: Import the standalone function like applicant does
import { getPeerSupportProfile } from '../../../../utils/database/peerSupportService';
import { supabase } from '../../../../utils/supabase';

// ✅ UPDATED: Use constants for consistency and remove is_verified
import { DEFAULT_FORM_DATA, VALIDATION_RULES } from '../constants/peerSupportConstants';

const INITIAL_FORM_DATA = {
  ...DEFAULT_FORM_DATA,
  // Keep professional title default for UX
  professional_title: 'Peer Support Specialist'
};

export const usePeerSupportProfileForm = ({ editMode = false, onComplete } = {}) => {
  const { user, profile } = useAuth();
  
  // ✅ PRESERVED: Add refs to prevent infinite re-renders
  const isLoadingRef = useRef(false);
  const hasAttemptedLoadRef = useRef(false);
  const isMountedRef = useRef(true);
  const profileIdRef = useRef(null);
  
  // State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  // ✅ PRESERVED: Enhanced data loading using standalone function pattern
  useEffect(() => {
    // ✅ CRITICAL FIX: Prevent multiple simultaneous loads
    if (isLoadingRef.current || !isMountedRef.current) {
      return;
    }

    // ✅ CRITICAL FIX: Don't reload if we already loaded data for this profile
    if (hasAttemptedLoadRef.current && profileIdRef.current === profile?.id && hasLoadedData) {
      console.log('🤝 Hook: Data already loaded for this profile, skipping reload');
      return;
    }

    const loadExistingData = async () => {
      // ✅ FIXED: Check prerequisites first
      if (!profile?.id) {
        console.log('🤝 Hook: No profile ID, setting initial loading to false');
        if (isMountedRef.current) {
          setInitialLoading(false);
          setHasLoadedData(true);
        }
        return;
      }

      // ✅ CRITICAL FIX: Check if we already loaded for this profile
      if (profileIdRef.current === profile.id && hasLoadedData) {
        console.log('🤝 Hook: Already loaded data for profile:', profile.id);
        if (isMountedRef.current) {
          setInitialLoading(false);
        }
        return;
      }

      // ✅ CRITICAL FIX: Set loading flags to prevent re-entry
      isLoadingRef.current = true;
      hasAttemptedLoadRef.current = true;
      profileIdRef.current = profile.id;

      try {
        console.log('🤝 Hook: Loading peer support profile using standalone function for registrant ID:', profile.id);
        
        // ✅ PRESERVED: Use standalone function like applicant does
        const result = await getPeerSupportProfile(profile.id, supabase);
        
        if (!isMountedRef.current) return;

        if (result.success && result.data) {
          console.log('✅ Hook: Loaded existing peer support profile:', result.data);
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
            additional_info: peerProfile.additional_info || '',
            is_active: peerProfile.is_active !== false,
            // ✅ REMOVED: is_verified field (doesn't exist in schema)
          }));
          
          // Clear any service errors on successful load
          setServiceError(null);
          
        } else if (result.error) {
          // ✅ PRESERVED: Handle "not found" gracefully vs real errors
          if (result.code === 'NOT_FOUND' || result.error?.includes('No peer support profile found')) {
            console.log('ℹ️ Hook: No existing peer support profile found - starting fresh');
            // This is normal for new users, don't set an error
            setServiceError(null);
          } else {
            console.warn('⚠️ Hook: Error loading peer support profile:', result.error);
            setErrors({ load: 'Unable to load your existing profile data.' });
            
            // ✅ PRESERVED: Handle service unavailable errors specifically
            if (result.error?.includes('not available')) {
              setServiceError(result.error);
            }
          }
        } else {
          console.log('ℹ️ Hook: No existing peer support profile found - starting fresh');
          setServiceError(null);
        }
        
      } catch (error) {
        console.error('❌ Hook: Error loading peer support profile:', error);
        if (isMountedRef.current) {
          // ✅ PRESERVED: Better error categorization
          if (error.message?.includes('not available') || error.message?.includes('undefined')) {
            setServiceError('Peer support service is temporarily unavailable. Please refresh the page.');
          } else if (!error.message?.includes('not found') && !error.message?.includes('No peer support profile')) {
            setErrors({ load: 'Failed to load your profile. Please refresh the page.' });
          }
        }
      } finally {
        if (isMountedRef.current) {
          setHasLoadedData(true);
          setInitialLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadExistingData();
  }, [profile?.id]);

  // ✅ PRESERVED: Cleanup to prevent memory leaks and stale updates
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ UPDATED: Calculate completion percentage using constants
  const completionPercentage = useCallback(() => {
    const requiredFields = Object.keys(VALIDATION_RULES);
    let score = 0;
    let totalPossible = 0;

    requiredFields.forEach(field => {
      const rule = VALIDATION_RULES[field];
      if (rule.required) {
        totalPossible += 20;
        if (field === 'specialties' || field === 'supported_recovery_methods') {
          if (formData[field]?.length >= (rule.minItems || 1)) score += 20;
        } else if (formData[field]?.toString().trim()) {
          score += 20;
        }
      }
    });

    return totalPossible > 0 ? Math.min(100, Math.round((score / totalPossible) * 100)) : 0;
  }, [formData]);

  // ✅ PRESERVED: Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear service error when user makes changes
    if (serviceError) {
      setServiceError(null);
    }
  }, [errors, serviceError]);

  // ✅ PRESERVED: Handle array field changes
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
    
    // Clear service error when user makes changes
    if (serviceError) {
      setServiceError(null);
    }
  }, [errors, serviceError]);

  // ✅ UPDATED: Validation using constants
  const validateForm = useCallback((isSubmission = false) => {
    const newErrors = {};
    
    // Use validation rules from constants
    Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
      if (rules.required) {
        if (field === 'specialties' || field === 'supported_recovery_methods') {
          if (!formData[field]?.length || formData[field].length < (rules.minItems || 1)) {
            newErrors[field] = rules.message || `${field} is required`;
          } else if (rules.maxItems && formData[field].length > rules.maxItems) {
            newErrors[field] = `Please select no more than ${rules.maxItems} items`;
          }
        } else if (!formData[field]?.toString().trim()) {
          newErrors[field] = rules.message || `${field} is required`;
        } else if (rules.pattern && !rules.pattern.test(formData[field])) {
          newErrors[field] = rules.message;
        } else if (rules.minLength && formData[field].length < rules.minLength) {
          newErrors[field] = rules.message;
        } else if (rules.maxLength && formData[field].length > rules.maxLength) {
          newErrors[field] = rules.message;
        }
      }
      
      // Number validation
      if (field === 'years_experience' && formData[field] !== null && formData[field] !== '') {
        const value = Number(formData[field]);
        if (isNaN(value) || value < (rules.min || 0) || value > (rules.max || 50)) {
          newErrors[field] = rules.message;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ✅ PRESERVED: Enhanced form submission using direct supabase calls to match working pattern
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
    setServiceError(null);

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
        
        // About - ✅ FIXED: Map bio to about_me for database schema compatibility
        bio: formData.bio.trim(),
        about_me: formData.bio.trim(), // Database expects this field to be NOT NULL
        additional_info: formData.additional_info?.trim() || null,
        
        // Status
        is_active: formData.is_active !== false
        // ✅ REMOVED: is_verified field (doesn't exist in schema)
      };

      console.log('💾 Hook: Submitting peer support profile data:', peerProfileData);

// ✅ FIXED: Auto-detect create vs update based on loaded data
      let result;
      try {
        const hasExistingProfile = hasLoadedData && formData.user_id;
        
        if (hasExistingProfile) {
          console.log('📝 Updating existing peer support profile');
          const { data, error } = await supabase
            .from('peer_support_profiles')
            .update(peerProfileData)
            .eq('user_id', profile.id)
            .select()
            .single();

          result = {
            success: !error,
            data: data,
            error: error
          };
        } else {
          console.log('✨ Creating new peer support profile');
          const { data, error } = await supabase
            .from('peer_support_profiles')
            .insert(peerProfileData)
            .select()
            .single();

          result = {
            success: !error,
            data: data,
            error: error
          };
        }
      } catch (serviceError) {
        // ✅ PRESERVED: Handle service-level errors specifically
        console.error('❌ Hook: Service call failed:', serviceError);
        throw new Error(serviceError.message?.includes('not available') 
          ? 'Peer support service is temporarily unavailable'
          : serviceError.message || 'Service call failed'
        );
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to save profile');
      }

      const successMsg = isSubmission 
        ? 'Peer support profile completed successfully!'
        : 'Progress saved successfully!';
      
      setSuccessMessage(successMsg);
      
      // ✅ PRESERVED: Mark as loaded after successful save to prevent re-loading
      setHasLoadedData(true);
      profileIdRef.current = profile.id;
      
      // Call onComplete callback if provided and this is a final submission
      if (isSubmission && onComplete && typeof onComplete === 'function') {
        setTimeout(() => onComplete(), 1500);
      }
      
      return true;

    } catch (error) {
      console.error('❌ Hook: Error saving peer support profile:', error);
      
      // ✅ PRESERVED: Better error categorization for user feedback
      let errorMessage;
      if (error.message?.includes('not available') || error.message?.includes('undefined')) {
        errorMessage = 'Peer support service is temporarily unavailable. Please refresh the page and try again.';
        setServiceError(errorMessage);
      } else {
        errorMessage = error.message || 'Failed to save peer support profile. Please try again.';
      }
      
      setErrors({ 
        submit: errorMessage
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, formData, validateForm, hasLoadedData, onComplete]);
  
  // ✅ PRESERVED: Clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage('');
  }, []);

  // ✅ PRESERVED: Function to retry service initialization
  const retryServiceConnection = useCallback(() => {
    setServiceError(null);
    setErrors({});
    hasAttemptedLoadRef.current = false;
    profileIdRef.current = null;
    setHasLoadedData(false);
    setInitialLoading(true);
  }, []);

  // ✅ NEW: Scroll to field functionality for section navigation
  const scrollToField = useCallback((fieldName) => {
    if (!fieldName) return;
    
    // Wait for render, then scroll
    setTimeout(() => {
      // Try multiple selector strategies
      const selectors = [
        `[name="${fieldName}"]`,
        `#${fieldName}`,
        `[data-field="${fieldName}"]`,
        `input[name="${fieldName}"]`,
        `select[name="${fieldName}"]`,
        `textarea[name="${fieldName}"]`
      ];
      
      let element = null;
      for (const selector of selectors) {
        element = document.querySelector(selector);
        if (element) break;
      }
      
      if (!element) {
        // Fallback: look for any element with the field name in its attributes
        const allInputs = document.querySelectorAll('input, select, textarea, [data-field]');
        for (const input of allInputs) {
          if (input.name === fieldName || 
              input.id === fieldName || 
              input.getAttribute('data-field') === fieldName) {
            element = input;
            break;
          }
        }
      }
      
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        
        // Focus the element if it's focusable
        if (element.focus && typeof element.focus === 'function') {
          setTimeout(() => element.focus(), 300);
        }
        
        console.log(`📍 Scrolled to field: ${fieldName}`);
      } else {
        console.warn(`⚠️ Could not find field to scroll to: ${fieldName}`);
      }
    }, 100);
  }, []);

  return {
    // State
    formData,
    errors,
    loading,
    initialLoading,
    successMessage,
    serviceError,
    
    // Computed values
    completionPercentage: completionPercentage(),
    canSubmit: completionPercentage() >= 80 && !serviceError,
    
    // Handlers
    handleInputChange,
    handleArrayChange,
    submitForm,
    validateForm,
    scrollToField,
    
    // Utils
    setSuccessMessage,
    clearSuccessMessage,
    retryServiceConnection,
  };
};